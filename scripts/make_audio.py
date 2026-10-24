"""Sinh toàn bộ giọng đọc cho một tập -> public/episodes/<id>/audio/*.wav + timing.json.

    python scripts/make_audio.py 001-spect
    python scripts/make_audio.py 001-spect --asr          # kèm tự kiểm độ rõ bằng PhoWhisper
    python scripts/make_audio.py 001-spect --allow-fallback   # ZipVoice tắt -> dùng edge-tts tiếng Việt

Mỗi câu VO là một clip riêng; độ dài clip quyết định thời lượng cảnh (build_props.py).
Trong một câu, đoạn [en:...] đọc bằng giọng tiếng Anh, phần còn lại bằng giọng Việt,
rồi ghép lại thành một file.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
import urllib.request
import wave
from datetime import datetime
from pathlib import Path

import numpy as np

from common import load_brand, load_env, load_episode, public_episode_dir, write_json
import tts
import vo

SEGMENT_GAP_SEC = 0.12


def plan_clips(ep: dict, brand: dict) -> list[dict]:
    """Danh sách clip theo thứ tự xuất hiện. kind=word: đọc chậm từ tiếng Anh."""
    clips = [{"id": "hook", "text": ep["hook"]["vo"]}]
    if brand["intro"]["enabled"] and brand["intro"].get("vo"):
        clips.append({"id": "intro", "text": brand["intro"]["vo"]})
    # root_family giới thiệu gốc từ; các dạng khác giới thiệu chủ đề (topic).
    if "root" in ep:
        clips.append({"id": "root", "text": ep["root"]["vo"]})
    else:
        clips.append({"id": "topic", "text": ep["topic"]["vo"]})
    for i, w in enumerate(ep["words"], 1):
        clips += [
            {"id": f"w{i}_word", "text": f"[en:{w['word']}]", "kind": "word"},
            {"id": f"w{i}_vo", "text": w["vo"]},
            {"id": f"w{i}_ex", "text": f"[en:{w['example_en']}]"},
        ]
    clips.append({"id": "summary", "text": ep["summary"]["vo"]})
    if ep["quiz"].get("word"):  # câu đố điền từ (sentence_en) không đọc đáp án
        clips.append({"id": "quiz_word", "text": f"[en:{ep['quiz']['word']}]", "kind": "word"})
    clips.append({"id": "quiz", "text": ep["quiz"]["vo"]})
    if brand["outro"]["enabled"] and brand["outro"].get("vo"):
        clips.append({"id": "outro", "text": brand["outro"]["vo"]})
    return clips


def read_pcm(path: Path) -> np.ndarray:
    with wave.open(str(path)) as w:
        assert w.getframerate() == tts.SAMPLE_RATE and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def write_pcm(path: Path, x: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(tts.SAMPLE_RATE)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def normalize(x: np.ndarray, target_dbfs: float) -> np.ndarray:
    """Chuẩn hoá RMS phần có tiếng (bỏ khoảng lặng), chặn đỉnh -1 dBFS.
    Dùng thay loudnorm vì loudnorm của FFmpeg đo sai với clip ngắn < 3 s (từ đơn)."""
    frame = 480
    n = len(x) // frame
    if n == 0:
        return x
    rms = np.sqrt(np.mean(x[: n * frame].reshape(n, frame) ** 2, axis=1) + 1e-12)
    voiced = rms[rms > rms.max() * 0.1]
    gain = 10 ** (target_dbfs / 20) / max(float(np.sqrt(np.mean(voiced ** 2))), 1e-6)
    peak = float(np.abs(x).max()) * gain
    if peak > 0.89:
        gain *= 0.89 / peak
    return x * gain


def trim_silence(x: np.ndarray, thresh: float = 0.01, pad: float = 0.04) -> tuple[np.ndarray, float]:
    """Cắt lặng đầu/cuối, trả về (audio, số giây đã cắt ở đầu) để dịch mốc phụ đề."""
    idx = np.where(np.abs(x) > thresh)[0]
    if len(idx) == 0:
        return x, 0.0
    p = int(pad * tts.SAMPLE_RATE)
    start = max(0, idx[0] - p)
    end = min(len(x), idx[-1] + p)
    return x[start:end], start / tts.SAMPLE_RATE


def synth_clip(clip: dict, engines: dict, brand: dict) -> tuple[np.ndarray, list[dict], list[dict]]:
    parts: list[np.ndarray] = []
    captions: list[dict] = []
    segments: list[dict] = []
    t = 0.0
    gap = np.zeros(int(SEGMENT_GAP_SEC * tts.SAMPLE_RATE), dtype=np.float32)
    for lang, text in vo.split_segments(clip["text"]):
        engine = engines["en_word"] if (lang == "en" and clip.get("kind") == "word") else engines[lang]
        wav, caps = engine.synth(text)
        audio, cut = trim_silence(read_pcm(wav))
        dur = len(audio) / tts.SAMPLE_RATE
        if parts:
            parts.append(gap)
            t += SEGMENT_GAP_SEC
        parts.append(audio)
        segments.append({"lang": lang, "text": text, "start": round(t, 3), "end": round(t + dur, 3)})
        if not caps:
            caps = [{"start": 0, "end": dur + cut, "text": text}]
        for c in caps:
            captions.append({
                "start": round(max(0.0, c["start"] - cut) + t, 3),
                "end": round(min(dur, c["end"] - cut) + t, 3),
                "text": c["text"],
                "lang": lang,
            })
        t += dur
    x = normalize(np.concatenate(parts), brand["voice"]["target_rms_dbfs"])
    return x, captions, segments


def asr_check(path: Path, segments: list[dict]) -> tuple[float, str] | None:
    """Gửi clip lên PhoWhisper, so với phần tiếng Việt mong đợi. Trả về (độ khớp, text nghe được)."""
    import os
    expected = " ".join(s["text"] for s in segments if s["lang"] == "vi")
    if not expected:
        return None
    boundary = "----ekk"
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"timestamps\"\r\n\r\nfalse\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.wav\"\r\n"
        f"Content-Type: audio/wav\r\n\r\n"
    ).encode() + path.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        os.environ["ZIPVOICE_URL"].rstrip("/") + "/v1/asr", body,
        {"Content-Type": f"multipart/form-data; boundary={boundary}",
         "Authorization": f"Bearer {os.environ.get('ZIPVOICE_API_KEY', '')}"},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        heard = json.load(r).get("text", "")

    def norm(s: str) -> str:
        return " ".join(re.sub(r"[^\w\s]", " ", s.lower()).split())

    return difflib.SequenceMatcher(None, norm(expected), norm(heard)).ratio(), heard


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode_id")
    ap.add_argument("--asr", action="store_true", help="tự kiểm độ rõ giọng Việt bằng PhoWhisper")
    ap.add_argument("--allow-fallback", action="store_true", help="ZipVoice lỗi thì dùng edge-tts tiếng Việt")
    ap.add_argument("--verify", action="store_true", help="bật verify của ZipVoice (chậm hơn, tự sinh lại câu đọc mờ)")
    args = ap.parse_args()

    load_env()
    brand = load_brand()
    ep = load_episode(args.episode_id)
    v = brand["voice"]
    cw = v["caption_words"]

    vi_cfg = v["vi"]
    try:
        # Lexicon kênh (tên kênh...) + lexicon riêng của tập; tập ghi đè kênh.
        lexicon = {**v.get("lexicon", {}), **ep.get("lexicon", {})}
        vi = tts.make_engine(vi_cfg, caption_words=cw, lexicon=lexicon, verify=args.verify)
        print("ZipVoice:", vi.health())
    except Exception as e:
        if not args.allow_fallback:
            sys.exit(f"✗ Không gọi được ZipVoice ({e}). Kiểm tra ZIPVOICE_URL trong .env "
                     f"(URL tunnel đổi mỗi lần khởi động lại) hoặc chạy với --allow-fallback.")
        print(f"! ZipVoice lỗi ({e}) -> dùng dự phòng {v['fallback_vi']['voice']}")
        vi_cfg = v["fallback_vi"]
        vi = tts.make_engine(vi_cfg, caption_words=cw)
    engines = {
        "vi": vi,
        "en": tts.make_engine(v["en"], caption_words=cw),
        "en_word": tts.make_engine({**v["en"], "rate": v["en_word_rate"]}, caption_words=cw),
    }

    out_dir = public_episode_dir(args.episode_id) / "audio"
    clips = plan_clips(ep, brand)
    timing: dict = {
        "episode_id": args.episode_id,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "voices": {"vi": vi_cfg, "en": v["en"]},
        "clips": {},
    }
    low: list[str] = []
    print(f"Sinh {len(clips)} clip cho {args.episode_id}")
    for clip in clips:
        x, captions, segments = synth_clip(clip, engines, brand)
        path = out_dir / f"{clip['id']}.wav"
        write_pcm(path, x)
        dur = round(len(x) / tts.SAMPLE_RATE, 3)
        entry = {"file": f"episodes/{args.episode_id}/audio/{path.name}", "duration": dur,
                 "segments": segments, "captions": captions}
        line = f"  {clip['id']:<10} {dur:5.2f}s  {vo.display_text(clip['text'])[:60]}"
        if args.asr:
            res = asr_check(path, segments)
            if res:
                score, heard = res
                entry["asr"] = {"score": round(score, 3), "heard": heard}
                line += f"  [ASR {score:.0%}]"
                if score < 0.8:
                    low.append(f"{clip['id']}: nghe thành \"{heard}\"")
        print(line, flush=True)
        timing["clips"][clip["id"]] = entry

    write_json(out_dir / "timing.json", timing)
    total = sum(c["duration"] for c in timing["clips"].values())
    print(f"Xong: {len(clips)} clip, tổng giọng {total:.1f}s -> {out_dir / 'timing.json'}")
    if low:
        print("! Câu cần nghe lại (ASR < 80%; từ tiếng Anh trong câu Việt thường bị trừ điểm, nghe để quyết):")
        for item in low:
            print("   -", item)


if __name__ == "__main__":
    main()
