"""Cú pháp lời đọc (VO): tiếng Việt thường, đoạn tiếng Anh bọc trong [en:...].

    "Thêm [en:ator] là người làm việc đó."
    -> [("vi", "Thêm"), ("en", "ator"), ("vi", "là người làm việc đó.")]
"""
from __future__ import annotations

import re

EN_TAG = re.compile(r"\[en:([^\]]+)\]")
# Gạch nối giữa hai chữ cái: ZipVoice đọc "-" thành "âm" (La-tinh -> "la âm tinh").
LEADING_PUNCT = re.compile(r"^[.,!?;:…]+\s*")
HYPHEN_IN_WORD = re.compile(r"(?<=\w)-(?=\w)")


def split_segments(text: str) -> list[tuple[str, str]]:
    segments: list[tuple[str, str]] = []
    pos = 0
    def add_vi(chunk: str) -> None:
        chunk = chunk.strip()
        # Dấu câu ngay sau [en:...] thuộc về đoạn tiếng Anh, nếu không phụ đề sẽ bắt đầu bằng "."
        m = LEADING_PUNCT.match(chunk)
        if m and segments and segments[-1][0] == "en":
            segments[-1] = ("en", segments[-1][1] + m.group(0).strip())
            chunk = chunk[m.end():].strip()
        if chunk:
            segments.append(("vi", chunk))

    for m in EN_TAG.finditer(text):
        add_vi(text[pos:m.start()])
        segments.append(("en", m.group(1).strip()))
        pos = m.end()
    add_vi(text[pos:])
    return segments


def display_text(text: str) -> str:
    """Chữ hiển thị trên phụ đề: bỏ thẻ, giữ nội dung."""
    return re.sub(r"\s+", " ", EN_TAG.sub(r"\1", text)).strip()


def lint(text: str) -> list[str]:
    issues = []
    if text.count("[") != text.count("]"):
        issues.append("ngoặc [ ] không cân")
    for lang, seg in split_segments(text):
        if lang == "vi" and HYPHEN_IN_WORD.search(seg):
            issues.append(f"gạch nối trong '{seg[:40]}' sẽ bị đọc thành 'âm' – dùng dấu cách")
        if lang == "vi" and re.search(r"\d+/\d+", seg):
            issues.append(f"phân số/ngày tháng '{seg[:40]}' có thể bị đọc sai – viết bằng chữ")
    return issues


def estimate_seconds(text: str) -> float:
    """Ước lượng thời lượng đọc. Đo thực tế với vv_sample: ~20 ký tự/giây."""
    return len(display_text(text)) / 20 + 0.25 * len(split_segments(text))
