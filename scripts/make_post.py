"""Sinh bộ đăng bài cho một tập -> out/<id>/post.md (+ anki.csv).

    python scripts/make_post.py 001-spect

post.md gồm: status/caption TikTok, tiêu đề + mô tả YouTube Shorts, hashtag, bình luận ghim,
các cài đặt bắt buộc (nhãn AI, khán giả, danh mục) và checklist trước khi bấm Đăng.
"""
from __future__ import annotations

import argparse
import csv

from common import OUT, load_brand, load_episode

TIKTOK_MAX_TAGS = 5
YOUTUBE_MAX_TAGS = 6


def merge_tags(*groups: list[str], limit: int) -> list[str]:
    seen: list[str] = []
    for g in groups:
        for t in g:
            if t.lower() not in (s.lower() for s in seen):
                seen.append(t)
    return seen[:limit]


def build_post(ep: dict, brand: dict) -> str:
    pub = ep["publish"]
    b = brand["publish"]
    ch = brand["channel"]
    words = ep["words"]
    quiz = ep["quiz"]

    yt_tags = merge_tags(brand["publish"]["youtube_extra_hashtags"], pub["hashtags"], b["base_hashtags"],
                         limit=YOUTUBE_MAX_TAGS)
    tt_tags = merge_tags(pub["hashtags"], b["base_hashtags"], limit=TIKTOK_MAX_TAGS)

    word_lines = "\n".join(f"• {w['word']} {w['ipa']} ({w['pos']}) – {w['meaning_vi']}" for w in words)
    music = ep.get("music") or {}
    credit = f"\n🎵 Nhạc: {music['source']}" if music.get("source") else ""

    yt_title = pub["youtube_title"]
    if "#shorts" not in yt_title.lower():
        yt_title = f"{yt_title} #Shorts"
    yt_desc = (pub.get("youtube_description") or ep["title_vi"]) + f"""

Gốc -{ep['root']['text']}- ({ep['root']['origin']}) = {ep['root']['meaning_vi']}
{word_lines}

🤔 Câu đố: {quiz['word']} nghĩa là gì? Gợi ý: {quiz['hint_vi']}. Trả lời ở bình luận nhé!
{b['follow_line_vi']}

{ep.get('disclaimer_vi') or ''}
{b['ai_disclosure_vi']}{credit}

{' '.join(yt_tags)}""".rstrip()

    tt_caption = f"{pub['tiktok_caption']}\n{b['follow_line_vi']}\n{' '.join(tt_tags)}"
    verified = all(w["verified"] for w in words)

    return f"""# Tập {ep['episode']} · -{ep['root']['text']}- · bộ đăng bài

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
- [ ] Thêm vào danh sách phát "Gốc từ tiếng Anh"
- [ ] Giờ đăng: {b['post_time_vn']}

---

## Bình luận ghim (cả hai nền tảng)

Đăng ngay sau khi video lên, rồi ghim:

```text
{pub['pinned_comment']}
```

Sau 24 giờ, trả lời chính bình luận đó bằng đáp án:

```text
✅ Đáp án: {quiz['word']} = {quiz['answer_vi']}. Bạn nào đoán đúng thì tự thưởng 1 tràng pháo tay nha! 👏
```

---

## Checklist trước khi bấm Đăng

- [ ] `python scripts/validate_episode.py {ep['id']} --strict` đạt (mọi từ `verified: true`, có ít nhất 2 nguồn)
- [ ] Xem hết video ở tốc độ 1x, nghe hết giọng đọc (đặc biệt tên riêng, từ tiếng Anh chèn trong câu Việt)
- [ ] Watermark, intro, outro hiển thị đủ; chữ không bị nút like/bình luận che
- [ ] Mẹo nhớ được gọi rõ là "mẹo nhớ" (disclaimer)
- [ ] Nhạc có giấy phép và đã ghi nguồn (nếu có)
- [ ] Đổi `status` trong episode.json thành `published` và commit
"""


def write_anki(ep: dict, path) -> None:
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        for word in ep["words"]:
            w.writerow([word["word"], word["ipa"], word["pos"], word["meaning_vi"], word["example_en"]])


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
