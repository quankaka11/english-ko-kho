"""Một lệnh dựng trọn một tập: kiểm tra -> giọng -> dòng thời gian -> render -> bìa -> bộ đăng bài -> QA.

    python scripts/build.py 001-spect              # đầy đủ, ra out/001-spect/
    python scripts/build.py 001-spect --preview    # render nửa độ phân giải để duyệt nhanh
    python scripts/build.py 001-spect --no-render  # chỉ giọng + props (xem trong `npm run dev`)
    python scripts/build.py 001-spect --strict     # chặn nếu còn cảnh báo (dùng trước khi đăng)

Kết quả trong out/<id>/: <id>.mp4, cover.png, post.md, anki.csv, qa.txt
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys

from common import OUT, ROOT, ffprobe_duration, load_brand, npx, write_json

PY = sys.executable


def step(title: str) -> None:
    print(f"\n━━ {title} ━━", flush=True)


def run_py(script: str, *args: str) -> None:
    subprocess.run([PY, str(ROOT / "scripts" / script), *args], check=True)


def final_loudnorm(src, dst, spec: str) -> None:
    """Chuẩn hoá loudness 2 lượt cho cả bản mix (giọng + SFX + nhạc), giữ nguyên hình."""
    probe = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(src), "-af", f"loudnorm={spec}:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True, check=True,
    ).stderr
    m = json.loads(probe[probe.rindex("{"):probe.rindex("}") + 1])
    af = (f"loudnorm={spec}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-c:v", "copy", "-af", af,
         "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dst)],
        check=True,
    )


def qa(path, brand: dict) -> list[str]:
    """Kiểm thông số xuất bản (Technology Plan mục 6)."""
    info = json.loads(subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    dur = float(info["format"]["duration"])
    loud = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "ebur128", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", loud)
    lufs_v = float(lufs[-1]) if lufs else None
    W, H, FPS = brand["video"]["width"], brand["video"]["height"], brand["video"]["fps"]

    checks = [
        (f"{v['width']}x{v['height']}", (v["width"], v["height"]) == (W, H), f"cần {W}x{H}"),
        (f"video {v['codec_name']} {v.get('pix_fmt')}", v["codec_name"] == "h264" and v.get("pix_fmt") == "yuv420p", "cần h264 yuv420p"),
        (f"fps {v['r_frame_rate']}", v["r_frame_rate"] == f"{FPS}/1", f"cần {FPS}"),
        (f"audio {a['codec_name'] if a else 'KHÔNG CÓ'}", bool(a) and a["codec_name"] == "aac", "cần aac"),
        (f"thời lượng {dur:.1f}s", 15 <= dur <= 180, "Shorts tối đa 3 phút"),
        (f"thời lượng mục tiêu 60–90s", 60 <= dur <= 90, "ngoài khoảng 60–90s của Content Plan (chỉ cảnh báo)"),
        (f"loudness {lufs_v} LUFS", lufs_v is not None and -15.5 <= lufs_v <= -12.5, "mục tiêu -14 LUFS"),
    ]
    lines = []
    for label, ok, hint in checks:
        lines.append(f"{'✓' if ok else '!'} {label}" + ("" if ok else f"  ({hint})"))
    return lines


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode_id")
    ap.add_argument("--preview", action="store_true", help="render scale 0.5, bỏ qua chuẩn hoá cuối")
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--skip-audio", action="store_true", help="dùng lại audio đã sinh")
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--allow-fallback", action="store_true")
    args = ap.parse_args()
    eid = args.episode_id
    brand = load_brand()
    out = OUT / eid
    out.mkdir(parents=True, exist_ok=True)

    step("1/6 Kiểm tra episode.json")
    run_py("validate_episode.py", eid, *(["--strict"] if args.strict else []))

    if not args.skip_audio:
        step("2/6 Sinh giọng đọc")
        run_py("make_audio.py", eid, "--asr", *(["--allow-fallback"] if args.allow_fallback else []))

    step("3/6 Dựng dòng thời gian")
    run_py("build_props.py", eid)

    render_props = out / "render-props.json"
    write_json(render_props, {"episodeId": eid})

    if not args.no_render:
        step("4/6 Render video")
        raw = out / f"{eid}.raw.mp4"
        final = out / (f"{eid}.preview.mp4" if args.preview else f"{eid}.mp4")
        npx("remotion", "render", "EpisodeVideo", str(raw), f"--props={render_props}",
            *(["--scale=0.5"] if args.preview else []), "--log=error")
        if args.preview:
            raw.replace(final)
        else:
            print("  chuẩn hoá loudness bản mix (-14 LUFS)…", flush=True)
            final_loudnorm(raw, final, brand["voice"]["final_loudnorm"])
            raw.unlink()

        step("5/6 Ảnh bìa")
        npx("remotion", "still", "Cover", str(out / "cover.png"), f"--props={render_props}", "--log=error")

        step("6/6 QA")
        report = qa(final, brand)
        (out / "qa.txt").write_text("\n".join(report) + "\n", encoding="utf-8")
        for line in report:
            print("  " + line)
        print(f"  file: {final} ({ffprobe_duration(final):.1f}s)")

    step("Bộ đăng bài")
    run_py("make_post.py", eid)
    print(f"\nXong. Mở {out}")
    if args.no_render:
        print(f"Xem trước: npm run dev  → composition EpisodeVideo, đặt episodeId = \"{eid}\"")


if __name__ == "__main__":
    main()
