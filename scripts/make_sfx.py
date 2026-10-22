"""Tổng hợp hiệu ứng âm thanh bằng toán (không bản quyền) -> public/sfx/*.wav.

    python scripts/make_sfx.py
"""
import numpy as np

from common import PUBLIC
from make_audio import write_pcm
from tts import SAMPLE_RATE as SR


def env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.minimum(t / attack, 1) * np.exp(-t / decay)


def pop() -> np.ndarray:
    """Tiếng "bụp" vui khi chữ/sticker bật ra: sine quét từ cao xuống thấp."""
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    freq = 900 * np.exp(-t * 18) + 220
    return 0.8 * np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(n, 0.003, 0.05)


def ding() -> np.ndarray:
    """Chuông nhẹ (hợp âm C6 + E6 + bồi âm) cho outro / đáp án."""
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    tone = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(1046.5, 1), (1318.5, 0.6), (2093, 0.25), (3136, 0.1)])
    return 0.35 * tone * env(n, 0.004, 0.35)


def whoosh() -> np.ndarray:
    """Gió vụt qua khi chuyển cảnh: nhiễu trắng lọc thông thấp động, to dần rồi tắt."""
    n = int(0.45 * SR)
    rng = np.random.default_rng(7)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    y = 0.0
    for i in range(n):
        a = 0.02 + 0.25 * np.sin(np.pi * i / n)  # tần số cắt lên rồi xuống
        y += a * (noise[i] - y)
        out[i] = y
    shape = np.sin(np.pi * np.arange(n) / n) ** 2
    return 0.9 * out / np.abs(out).max() * shape


def tick() -> np.ndarray:
    """Tiếng "tách" ngắn khi tô màu từng mảnh từ."""
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return 0.5 * np.sin(2 * np.pi * 2400 * t) * env(n, 0.001, 0.008)


def main() -> None:
    out = PUBLIC / "sfx"
    for name, fn in {"pop": pop, "ding": ding, "whoosh": whoosh, "tick": tick}.items():
        write_pcm(out / f"{name}.wav", fn().astype(np.float32))
        print("  +", out / f"{name}.wav")


if __name__ == "__main__":
    main()
