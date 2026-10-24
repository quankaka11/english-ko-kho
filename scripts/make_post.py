"""Sinh bộ đăng bài cho một tập -> out/<id>/post.md (+ anki.csv).

    python scripts/make_post.py 001-spect

post.md gồm: status/caption TikTok, tiêu đề + mô tả YouTube Shorts, hashtag, bình luận ghim,
các cài đặt bắt buộc (nhãn AI, khán giả, danh mục) và checklist trước khi bấm Đăng.
"""
from __future__ import annotations

import argparse
import csv

from common import OUT, load_brand, load_episode, load_formats

TIKTOK_MAX_TAGS = 5
YOUTUBE_MAX_TAGS = 6


def merge_tags(*groups: list[str], limit: int) -> list[str]:
    seen: list[str] = []
    for g in groups:
        for t in g:
            if t.lower() not in (s.lower() for s in seen):
                seen.append(t)
    return seen[:limit]


def headline(ep: dict) -> str:
    return f"-{ep['root']['text']}-" if "root" in ep else ep["topic"]["title"]


def intro_line(ep: dict) -> str:
    if "root" in ep:
        r = ep["root"]
        return f"Gốc -{r['text']}- ({r['origin']}) = {r['meaning_vi']}"
    t = ep["topic"]
    return t["title"] + (f": {t['subtitle_vi']}" if t.get("subtitle_vi") else "")


def word_line(w: dict) -> str:
    if w.get("han_viet"):
        line = f"• {w['word']} {w['ipa']} = {w['han_viet']}"
        if w["meaning_vi"].lower() != w["han_viet"].lower():
            line += f" ({w['meaning_vi']})"
    else:
        line = f"• {w['word']} {w['ipa']} ({w['pos']}) – {w['meaning_vi']}"
    if w.get("origin_vi"):
        line += f" · gốc: {w['origin_vi']}"
    if w.get("then_vi"):
        line += f" (xưa: {w['then_vi']})"
    return line


def quiz_question(quiz: dict) -> str:
    if quiz.get("word"):
        return f"{quiz['word']} nghĩa là gì?"
    return f"điền từ nào vào chỗ trống: \"{quiz['sentence_en']}\" ({' / '.join(quiz['options'])})?"


def build_post(ep: dict, brand: dict) -> str:
    pub = ep["publish"]
    b = brand["publish"]
    fmt = load_formats()[ep["format"]]
    words = ep["words"]
    quiz = ep["quiz"]

    yt_tags = merge_tags(brand["publish"]["youtube_extra_hashtags"], pub["hashtags"], b["base_hashtags"],
                         limit=YOUTUBE_MAX_TAGS)
    tt_tags = merge_tags(pub["hashtags"], b["base_hashtags"], limit=TIKTOK_MAX_TAGS)

    word_lines = "\n".join(word_line(w) for w in words)
    if ep["summary"].get("tip_vi"):
        word_lines += f"\n💡 {ep['summary']['tip_vi']}"
    music = ep.get("music") or {}
    credit = f"\n🎵 Nhạc: {music['source']}" if music.get("source") else ""

    yt_title = pub["youtube_title"]
    if "#shorts" not in yt_title.lower():
        yt_title = f"{yt_title} #Shorts"
    yt_desc = (pub.get("youtube_description") or ep["title_vi"]) + f"""

{intro_line(ep)}
{word_lines}

🤔 Câu đố: {quiz_question(quiz)} Gợi ý: {quiz['hint_vi']}. Trả lời ở bình luận nhé!
{b['follow_line_vi']}

{ep.get('disclaimer_vi') or ''}
{b['ai_disclosure_vi']}{credit}

{' '.join(yt_tags)}""".rstrip()

    tt_caption = f"{pub['tiktok_caption']}\n{b['follow_line_vi']}\n{' '.join(tt_tags)}"
    verified = all(w["verified"] for w in words)
    answer = f"{quiz['word']} = {quiz['answer_vi']}" if quiz.get("word") else quiz["answer_vi"]

    return f"""# Tập {ep['episode']} · {fmt['name_vi']} · {headline(ep)} · bộ đăng bài

> Sinh tự động từ `episodes/{ep['id']}/episode.json`. Sửa nội dung ở đó rồi chạy lại `python scripts/make_post.py {ep['id']}`.
> Trạng thái: **{ep['status']}** · Kiểm chứng từ: **{'đủ' if verified else 'CHƯA ĐỦ, chưa được đăng'}**

## File cần tải lên

| File | Dùng cho |
| --- | --- |
| `{ep['id']}.mp4` | Video, dùng chung cho TikTok và YouTube Shorts (1080×1920, H.264 + AAC, -14 LUFS) |
| `cover.png` | Ảnh bìa TikTok ("Chọn ảnh bìa" → "Tải lên") / ảnh thu nhỏ Shorts |
| `anki.csv` | Nhập vào Anki để tự ôn (tab Fields: Word; IPA; POS; Meaning; Example) |

---

## TikTok

**Status / caption** (copy nguyên khối):

```text
{tt_caption}
```

**Cài đặt khi đăng**

- [ ] **Bật nhãn "Nội dung do AI tạo" (AIGC)**: bắt buộc, vì giọng đọc là TTS (Content Plan mục 5.3)
- [ ] Ảnh bìa: tải `cover.png`
- [ ] Cho phép bình luận, Duet, Stitch
- [ ] Nhạc: nếu file render không có nhạc nền, chọn nhạc trong **Thư viện nhạc thương mại** của TikTok, âm lượng ≤ 10%
- [ ] Giờ đăng: {b['post_time_vn']}

## YouTube Shorts

**Tiêu đề** ({len(yt_title)}/100 ký tự):

```text
{yt_title}
```

**Mô tả:**

```text
{yt_desc}
```

**Cài đặt khi đăng**

- [ ] Khán giả: "Không, nội dung này không dành cho trẻ em". Khán giả chính là THPT/sinh viên; chỉ chọn "Có" nếu cố ý nhắm tới trẻ dưới 13 tuổi (sẽ mất bình luận)
- [ ] Nội dung bị thay đổi/tổng hợp (Altered content): **Không**. Đây là hoạt hình rõ ràng, AI chỉ dùng cho giọng đọc và soạn thảo, đã ghi chú trong mô tả (Content Plan mục 5.3)
- [ ] Danh mục: Giáo dục (Education) · Ngôn ngữ video: Tiếng Việt
- [ ] Thẻ (tags): {', '.join(t.lstrip('#') for t in yt_tags + [w['word'] for w in words])}
- [ ] Thêm vào danh sách phát "{fmt['playlist']}"
- [ ] Giờ đăng: {b['post_time_vn']}

---

## Bình luận ghim (cả hai nền tảng)

Đăng ngay sau khi video lên, rồi ghim:

```text
{pub['pinned_comment']}
```

Sau 24 giờ, trả lời chính bình luận đó bằng đáp án:

```text
✅ Đáp án: {answer}. Bạn nào đoán đúng thì tự thưởng 1 tràng pháo tay nha! 👏
```

---

## Checklist trước khi bấm Đăng

- [ ] `python scripts/validate_episode.py {ep['id']} --strict` đạt (mọi từ `verified: true`, có ít nhất 2 nguồn)
- [ ] Xem hết video ở tốc độ 1x, nghe hết giọng đọc (đặc biệt tên riêng, từ tiếng Anh chèn trong câu Việt)
- [ ] Watermark, intro, outro hiển thị đủ; chữ không bị nút like/bình luận che
- [ ] Mẹo nhớ được gọi rõ là "mẹo nhớ" (disclaimer)
- [ ] Nhạc có giấy phép và đã ghi nguồn (nếu có)
- [ ] Đổi `status` trong episode.json thành `published` và commit trên nhánh tập
- [ ] Trên `master`: điền `ngay_dang` cho slot của tập trong `tracking/topics.csv`, ghi Nhật ký ở `tracking/NOTES.md`
- [ ] Đặt lời nhắc: 7 ngày sau lấy số liệu TikTok + YouTube vào `tracking/metrics.csv` (`documents/Experiment_30.md` mục 5)
"""


def write_anki(ep: dict, path) -> None:
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        for word in ep["words"]:
            meaning = word["meaning_vi"]
            if word.get("han_viet") and word["han_viet"].lower() != meaning.lower():
                meaning = f"{word['han_viet']} – {meaning}"
            if word.get("origin_vi"):
                meaning += f" (gốc: {word['origin_vi']})"
            w.writerow([word["word"], word["ipa"], word["pos"], meaning, word["example_en"]])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode_id")
    args = ap.parse_args()
    ep = load_episode(args.episode_id)
    out = OUT / args.episode_id
    out.mkdir(parents=True, exist_ok=True)
    (out / "post.md").write_text(build_post(ep, load_brand()), encoding="utf-8")
    write_anki(ep, out / "anki.csv")
    print(f"Đã tạo {out / 'post.md'} và {out / 'anki.csv'}")


if __name__ == "__main__":
    main()
