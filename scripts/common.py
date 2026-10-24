"""Tiện ích dùng chung cho các script pipeline (đường dẫn, cấu hình, .env, gọi Remotion)."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EPISODES = ROOT / "episodes"
PUBLIC = ROOT / "public"
OUT = ROOT / "out"

# Windows console mặc định cp1252 -> in tiếng Việt bị lỗi.
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8")


def load_brand() -> dict:
    return json.loads((ROOT / "config" / "brand.json").read_text(encoding="utf-8"))


def load_formats() -> dict:
    """Cấu hình các dạng tập (tên, số từ, cảnh, tập mẫu): config/formats.json."""
    return json.loads((ROOT / "config" / "formats.json").read_text(encoding="utf-8"))


def load_env() -> None:
    """Nạp .env vào os.environ (không ghi đè biến đã có). Không cần python-dotenv."""
    env = ROOT / ".env"
    if not env.exists():
        return
    for line in env.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def episode_dir(episode_id: str) -> Path:
    d = EPISODES / episode_id
    if not (d / "episode.json").exists():
        sys.exit(f"Không thấy {d / 'episode.json'}")
    return d


def public_episode_dir(episode_id: str) -> Path:
    d = PUBLIC / "episodes" / episode_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def load_episode(episode_id: str) -> dict:
    return json.loads((episode_dir(episode_id) / "episode.json").read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def npx(*args: str) -> None:
    """Chạy `npx <args>` ở thư mục gốc; dừng nếu lỗi."""
    exe = shutil.which("npx") or shutil.which("npx.cmd")
    if not exe:
        sys.exit("Không tìm thấy npx. Cài Node.js LTS trước.")
    print("$ npx", " ".join(args), flush=True)
    subprocess.run([exe, *args], cwd=ROOT, check=True)


def ffprobe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return float(out)
