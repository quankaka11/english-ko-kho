---
name: ekk-publish
description: Chuẩn bị đăng một tập English Ko Khó lên TikTok và YouTube Shorts - status/caption, tiêu đề, mô tả, hashtag, bình luận ghim, nhãn AI, ảnh bìa, giờ đăng, checklist; sau đăng thì trả lời câu đố, cập nhật status. Dùng khi người dùng nói "đăng bài", "status", "caption", "tiêu đề", "hashtag", "mô tả youtube", "đăng tiktok", "đăng shorts", "nhãn AI", "lịch đăng".
---

# Đăng bài – English Ko Khó

Claude **không tự đăng** lên nền tảng: chỉ chuẩn bị bộ đăng bài để người dùng copy rồi bấm đăng.

## Quy trình

1. **Chặn nếu chưa kiểm chứng**: chạy `python scripts/validate_episode.py <id> --strict`. Không đạt (còn từ `verified: false`) thì dừng và báo người dùng. Không được đăng nội dung chưa kiểm chứng.
2. Đã render chưa? Kiểm tra `out/<id>/<id>.mp4`, `cover.png`, `qa.txt`. Nếu chưa có thì chạy `python scripts/build.py <id> --strict` (skill `ekk-produce`).
3. Sinh lại bộ đăng bài sau mỗi lần sửa `publish` trong episode.json: `python scripts/make_post.py <id>` → `out/<id>/post.md`.
4. Gửi người dùng nội dung `post.md` (caption TikTok, tiêu đề + mô tả YouTube, bình luận ghim) và nhắc các cài đặt bắt buộc ở dưới.
5. Sau khi người dùng xác nhận đã đăng: đặt `status: "published"` trong episode.json, commit `Publish: tập NNN -XXX-` trên nhánh `episode/<id>`, rồi `git push`.
6. **Sau 24 giờ**: trả lời bình luận ghim bằng đáp án (`quiz.answer_vi`, mẫu có trong post.md). Đọc các bình luận đoán sai để giải thích, đó là nguồn ôn tập (Content Plan mục 6).

## Cài đặt bắt buộc (Content Plan 5.3, Technology Plan 6)

| | TikTok | YouTube Shorts |
| --- | --- | --- |
| Nhãn AI | **Bật "Nội dung do AI tạo" (AIGC)**, vì giọng TTS có thể bị coi là âm thanh AI chân thực | Altered/synthetic: **Không** (hoạt hình rõ ràng); ghi "Lồng tiếng bằng giọng AI" trong mô tả (đã có sẵn) |
| Ảnh bìa | Tải `cover.png` | Chọn frame hoặc tải `cover.png` |
| Nhạc | Nếu thêm nhạc thì chỉ lấy từ Thư viện nhạc thương mại | YouTube Audio Library, ghi công trong mô tả |
| Khán giả | — | "Không dành cho trẻ em" (khán giả THPT/sinh viên) |
| Hashtag | ≤ 5 (đã giới hạn) | ≤ 6, có `#Shorts` (đã giới hạn) |

Lịch: Thứ 3 (gốc từ), Thứ 5 (xoay dạng 1–6), Thứ 7 (xoay dạng 7–10), đăng lúc 19:00–21:00. Mỗi nền tảng đăng cùng một file mp4.

## Viết caption tốt

- Câu đầu chính là hook (TikTok chỉ hiện khoảng 1 dòng): "Biết 1 gốc SPECT, hiểu luôn 8 từ 🤯".
- Kết thúc bằng câu hỏi để kéo bình luận: "Đoán nghĩa từ cuối video nhé!".
- Không hứa quá ("thuộc 1000 từ trong 1 ngày"), không gắn hashtag không liên quan để câu view.

## Xong khi

- Người dùng đã nhận `post.md` và xác nhận đã đăng.
- `status: "published"` đã được commit.
- Đã đặt lời nhắc trả lời đáp án sau 24 giờ (nếu người dùng muốn, dùng skill `schedule`).
