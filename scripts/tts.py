"""Hai engine giọng đọc, cùng một giao diện: synth(text) -> (wav_path, captions).

- ZipVoice (tự host, tiếng Việt): POST {ZIPVOICE_URL}/v1/tts, response=json trả về
  audio base64 + mốc thời gian từng cụm phụ đề.
- edge-tts (tiếng Anh, và dự phòng tiếng Việt): lấy mốc thời gian từng từ qua WordBoundary.

Kết quả được cache theo hash(engine, giọng, tham số, text) trong .cache/tts/,
nên chạy lại chỉ sinh những câu đã sửa.
"""
from __future__ import annotations

import asyncio
import base64
import hashlib
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

from common import ROOT

CACHE = ROOT / ".cache" / "tts"
SAMPLE_RATE = 48000

Caption = dict  # {"start": s, "end": s, "text": str}


class TTSError(RuntimeError):
    pass


def _cache_paths(key: dict) -> tuple[Path, Path]:
    h = hashlib.sha1(json.dumps(key, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]
    CACHE.mkdir(parents=True, exist_ok=True)
    return CACHE / f"{h}.wav", CACHE / f"{h}.json"


def _to_wav(src: Path, dst: Path) -> None:
    """Chuẩn hoá về WAV 48 kHz mono 16-bit để ghép và đo độ dài chính xác."""
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ar", str(SAMPLE_RATE), "-ac", "1",
         "-c:a", "pcm_s16le", str(dst)],
        check=True,
    )


def _retry(fn, what: str, attempts: int = 3):
    last: Exception | None = None
    for i in range(attempts):
        try:
            return fn()
        except Exception as e:  # mạng / server / edge
            last = e
            wait = 2 * (i + 1)
            print(f"    ! {what}: lần {i + 1}/{attempts} lỗi ({e}); thử lại sau {wait}s", flush=True)
            time.sleep(wait)
    raise TTSError(f"{what}: thất bại sau {attempts} lần – {last}")


def _chunk_words(words: list[dict], max_words: int) -> list[Caption]:
    caps = []
    for i in range(0, len(words), max_words):
        group = words[i:i + max_words]
        caps.append({"start": group[0]["start"], "end": group[-1]["end"],
                     "text": " ".join(w["text"] for w in group)})
    return caps


class ZipVoice:
    def __init__(self, voice: str, speed: float | None = None, num_step: int = 32,
                 caption_words: int = 5, lexicon: dict | None = None, verify: bool = False):
        self.url = os.environ.get("ZIPVOICE_URL", "").rstrip("/")
        self.key = os.environ.get("ZIPVOICE_API_KEY", "")
        if not self.url:
            raise TTSError("Thiếu ZIPVOICE_URL trong .env")
        self.voice, self.speed, self.num_step = voice, speed, num_step
        self.caption_words, self.lexicon, self.verify = caption_words, lexicon or {}, verify

    def health(self) -> dict:
        with urllib.request.urlopen(self.url + "/health", timeout=15) as r:
            return json.load(r)

    def synth(self, text: str) -> tuple[Path, list[Caption]]:
        key = {"engine": "zipvoice", "voice": self.voice, "speed": self.speed, "num_step": self.num_step,
               "caption_words": self.caption_words, "lexicon": self.lexicon, "text": text}
        wav, meta = _cache_paths(key)
        if wav.exists() and meta.exists():
            return wav, json.loads(meta.read_text(encoding="utf-8"))

        body = {"text": text, "voice": self.voice, "format": "wav", "response": "json",
                "num_step": self.num_step, "caption_words": self.caption_words, "verify": self.verify}
        if self.speed is not None:
            body["speed"] = self.speed
        if self.lexicon:
            body["lexicon"] = self.lexicon

        def call():
            req = urllib.request.Request(
                self.url + "/v1/tts", json.dumps(body).encode(),
                {"Content-Type": "application/json", "Authorization": f"Bearer {self.key}"},
            )
            try:
                with urllib.request.urlopen(req, timeout=180) as r:
                    return json.load(r)
            except urllib.error.HTTPError as e:
                raise TTSError(f"HTTP {e.code}: {e.read()[:200]!r}") from e

        data = _retry(call, f"ZipVoice '{text[:40]}'")
        raw = wav.with_suffix(".raw.wav")
        raw.write_bytes(base64.b64decode(data["audio_base64"]))
        _to_wav(raw, wav)
        raw.unlink()
        caps = [{"start": c["start"], "end": c["end"], "text": c["text"]} for c in data.get("captions", [])]
        meta.write_text(json.dumps(caps, ensure_ascii=False), encoding="utf-8")
        return wav, caps


class Edge:
    def __init__(self, voice: str, rate: str = "+0%", caption_words: int = 5):
        self.voice, self.rate, self.caption_words = voice, rate, caption_words

    def synth(self, text: str) -> tuple[Path, list[Caption]]:
        import edge_tts  # import muộn để lệnh khác không cần cài edge-tts

        key = {"engine": "edge", "voice": self.voice, "rate": self.rate, "text": text}
        wav, meta = _cache_paths(key)
        if wav.exists() and meta.exists():
            return wav, json.loads(meta.read_text(encoding="utf-8"))

        mp3 = wav.with_suffix(".mp3")

        async def run() -> list[dict]:
            words = []
            comm = edge_tts.Communicate(text, self.voice, rate=self.rate, boundary="WordBoundary")
            with open(mp3, "wb") as f:
                async for chunk in comm.stream():
                    if chunk["type"] == "audio":
                        f.write(chunk["data"])
                    elif chunk["type"] == "WordBoundary":
                        s = chunk["offset"] / 1e7
                        words.append({"start": s, "end": s + chunk["duration"] / 1e7, "text": chunk["text"]})
            return words

        words = _retry(lambda: asyncio.run(run()), f"edge-tts '{text[:40]}'")
        _to_wav(mp3, wav)
        mp3.unlink()
        # WordBoundary bỏ dấu câu; gắn lại chữ gốc nếu số từ khớp để phụ đề giữ dấu.
        orig = text.split()
        if len(orig) == len(words):
            for w, o in zip(words, orig):
                w["text"] = o
        caps = _chunk_words(words, self.caption_words) if words else []
        meta.write_text(json.dumps(caps, ensure_ascii=False), encoding="utf-8")
        return wav, caps


def make_engine(cfg: dict, **kw):
    if cfg["engine"] == "zipvoice":
        return ZipVoice(cfg["voice"], cfg.get("speed"), cfg.get("num_step", 32), **kw)
    if cfg["engine"] == "edge":
        kw.pop("lexicon", None)
        kw.pop("verify", None)
        return Edge(cfg["voice"], cfg.get("rate", "+0%"), **kw)
    raise TTSError(f"engine không hỗ trợ: {cfg['engine']}")
