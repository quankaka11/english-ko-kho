"""Cú pháp lời đọc (VO): tiếng Việt thường, đoạn tiếng Anh bọc trong [en:...].

    "Thêm [en:ator] là người làm việc đó."
    -> [("vi", "Thêm"), ("en", "ator"), ("vi", "là người làm việc đó.")]
"""
from __future__ import annotations

import re

EN_TAG = re.compile(r"\[en:([^\]]+)\]")
# Gạch nối giữa hai chữ cái: ZipVoice đọc "-" thành "âm" (La-tinh -> "la âm tinh").
HYPHEN_IN_WORD = re.compile(r"(?<=\w)-(?=\w)")


def split_segments(text: str) -> list[tuple[str, str]]:
    segments: list[tuple[str, str]] = []
    pos = 0
    for m in EN_TAG.finditer(text):
        before = text[pos:m.start()].strip()
        if before:
            segments.append(("vi", before))
        segments.append(("en", m.group(1).strip()))
        pos = m.end()
    tail = text[pos:].strip()
    if tail:
        segments.append(("vi", tail))
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
