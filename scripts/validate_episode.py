"""Kiểm tra episode.json trước khi sinh giọng / render.

    python scripts/validate_episode.py 001-spect
    python scripts/validate_episode.py 001-spect --strict   # coi cảnh báo là lỗi (trước khi đăng)

Lỗi (✗) chặn pipeline. Cảnh báo (!) cần người duyệt xem lại.
"""
from __future__ import annotations

import argparse
import json
import sys

from jsonschema import Draft202012Validator

from common import ROOT, load_brand, load_episode, load_formats
import vo


def check(ep: dict, brand: dict) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warns: list[str] = []

    schema = json.loads((ROOT / "config" / "episode.schema.json").read_text(encoding="utf-8"))
    for e in sorted(Draft202012Validator(schema).iter_errors(ep), key=lambda e: list(e.path)):
        loc = "/".join(str(p) for p in e.path) or "(gốc)"
        msg = e.message if len(e.message) < 160 else e.message[:80] + " … " + e.message[-60:]
        errors.append(f"schema {loc}: {msg}")
    if errors:
        return errors, warns

    def check_parts(label: str, word: str, parts: list[dict]) -> None:
        joined = "".join(p["text"] for p in parts)
        if joined.lower() != word.lower():
            errors.append(f"{label}: ghép parts = '{joined}' khác từ '{word}'")

    fmt_key = ep["format"]
    fmt = load_formats()[fmt_key]
    intro = ("root", ep["root"]["vo"]) if "root" in ep else ("topic", ep["topic"]["vo"])
    vos: list[tuple[str, str]] = [("hook", ep["hook"]["vo"]), intro]
    if fmt_key == "root_family" and "topic" in ep:
        warns.append("root_family dùng root, phần topic sẽ bị bỏ qua")
    seen = set()
    for i, w in enumerate(ep["words"], 1):
        label = f"words[{i}] {w['word']}"
        if w["word"].lower() in seen:
            errors.append(f"{label}: trùng từ")
        seen.add(w["word"].lower())
        check_parts(label, w["word"], w["parts"])
        if fmt_key == "root_family" and not any(p["type"] == "root" for p in w["parts"]):
            warns.append(f"{label}: không có mảnh type=root để tô màu gốc")
        if fmt_key == "sino_vietnamese":
            for p in w["parts"]:
                if p.get("meaning_vi") and p["meaning_vi"].lower() not in w["han_viet"].lower():
                    warns.append(f"{label}: chữ Hán Việt '{p['meaning_vi']}' của mảnh '{p['text']}' "
                                 f"không có trong '{w['han_viet']}' nên không tô màu được")
        if fmt_key == "guess_challenge" and not w.get("from_vi"):
            warns.append(f"{label}: nên có from_vi (đã học ở tập nào) để nối tập")
        stem = w["word"].lower()[: max(4, len(w["word"]) - 3)]
        if stem not in w["example_en"].lower():
            warns.append(f"{label}: câu ví dụ có vẻ không chứa từ")
        if len(w["sources"]) < 2:
            warns.append(f"{label}: mới có {len(w['sources'])} nguồn (cần ≥ 2)")
        if not w["verified"]:
            warns.append(f"{label}: chưa được người kiểm chứng (verified=false)")
        vos.append((label, w["vo"]))
    quiz = ep["quiz"]
    if quiz.get("word"):
        check_parts("quiz", quiz["word"], quiz["parts"])
    elif not any(o.lower() in quiz["answer_vi"].lower() for o in quiz["options"]):
        warns.append("quiz.answer_vi nên chứa đúng một lựa chọn trong options")
    vos += [("summary", ep["summary"]["vo"]), ("quiz", quiz["vo"])]

    lo, hi = fmt["words"]
    if not lo <= len(ep["words"]) <= hi:
        warns.append(f"{fmt_key} nên có {lo}–{hi} từ (đang có {len(ep['words'])})")
    if any(w.get("mnemonic") for w in ep["words"]) and not ep.get("disclaimer_vi"):
        warns.append("có từ đánh dấu mnemonic nhưng thiếu disclaimer_vi")
    if ep["status"] in ("verified", "rendered", "published") and not all(w["verified"] for w in ep["words"]):
        errors.append(f"status={ep['status']} nhưng còn từ verified=false")

    for label, text in vos:
        for issue in vo.lint(text):
            warns.append(f"vo {label}: {issue}")

    total = sum(vo.estimate_seconds(t) for _, t in vos)
    total += len(ep["words"]) * (3.2 + fmt.get("think_sec", 0))  # từ đọc chậm + câu ví dụ (+ lúc chờ đoán)
    if brand["intro"]["enabled"]:
        total += brand["intro"]["duration_sec"]
    if brand["outro"]["enabled"]:
        total += max(brand["outro"]["min_duration_sec"], vo.estimate_seconds(brand["outro"]["vo"]))
    if total > 100:
        warns.append(f"ước tính ~{total:.0f}s, dài hơn mục tiêu 75–90s – cắt bớt từ hoặc rút VO")
    elif total < 50:
        warns.append(f"ước tính ~{total:.0f}s, hơi ngắn")
    print(f"  ước tính thời lượng: ~{total:.0f}s")

    pub = ep["publish"]
    for tag in brand["publish"]["base_hashtags"]:
        if tag not in pub["hashtags"]:
            warns.append(f"publish.hashtags thiếu hashtag kênh {tag} (make_post.py sẽ tự thêm)")
    if len(pub["hashtags"]) > 8:
        warns.append("quá 8 hashtag – TikTok/YouTube khuyên 3–5 hashtag chính")
    return errors, warns


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode_id")
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args()

    ep = load_episode(args.episode_id)
    if ep.get("id") != args.episode_id:
        print(f"✗ id trong file ('{ep.get('id')}') khác tên thư mục")
        sys.exit(1)
    print(f"Kiểm tra {args.episode_id} ({ep['format']}, status={ep['status']})")
    errors, warns = check(ep, load_brand())
    for e in errors:
        print("  ✗", e)
    for w in warns:
        print("  !", w)
    if errors or (args.strict and warns):
        print(f"KHÔNG ĐẠT: {len(errors)} lỗi, {len(warns)} cảnh báo")
        sys.exit(1)
    print(f"ĐẠT ({len(warns)} cảnh báo)")


if __name__ == "__main__":
    main()
