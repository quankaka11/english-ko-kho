# Bộ nhớ chung – English Ko Khó

Ai làm gì cũng ghi vào đây, kể cả Claude Code. Đọc file này đầu mỗi phiên làm việc. File sống trên `master`: sửa xong thì commit (`Content: …` hoặc `Publish: …`) và push ngay để người khác pull về là thấy.

- Tiến độ từng chủ đề: `python scripts/status.py --fetch`. Script đọc `tracking/topics.csv` và các nhánh `episode/*`, đừng chép bảng tiến độ vào đây.
- Kế hoạch và luật đan xen: `documents/Experiment_30.md`
- Số liệu: `tracking/metrics.csv` → `python scripts/report.py`

## Đang ở đâu

Chuẩn bị thử nghiệm 30 ngày, chưa đăng tập nào. Mới có `001-spect` (nháp, chờ kiểm chứng). Template đã dựng đủ 5 dạng; mỗi dạng có tập mẫu `episodes/000-demo*`.

**Status đăng bài:** mọi tập dựng bằng `python scripts/build.py <id>` đều tự sinh `out/<id>/post.md`. File này có caption TikTok, tiêu đề + mô tả YouTube Shorts, hashtag, bình luận ghim, đáp án đăng sau 24h, cài đặt nhãn AI, playlist theo dạng tập và checklist (kể cả bước điền `ngay_dang` và lấy số liệu sau 7 ngày). Chỉ sửa nội dung status trong `publish` của `episode.json`, rồi chạy lại `python scripts/make_post.py <id>`.

## Việc tiếp theo

Nhận việc bằng cách ghi tên vào `[ ]`, ví dụ `[ ] (DanNK) …`. Xong thì đánh `[x]` và ghi một dòng vào Nhật ký.

- [ ] Kiểm chứng 8 từ của `001-spect` (Etymonline + Cambridge), đặt `verified: true`, rồi dựng bản cuối
- [x] Template cho `surprising_origin`, `sino_vietnamese`, `confusing_pair`, `guess_challenge` (2026-10-24)
- [ ] Xem 4 bản preview `out/000-demo-*/000-demo-*.preview.mp4` và góp ý bố cục (bản test dùng giọng dự phòng edge-tts)
- [ ] Khởi động lại ZipVoice và cập nhật `ZIPVOICE_URL` trong `.env`: ngày 24/10 tunnel không còn phân giải được
- [ ] Chốt lại câu outro và `follow_line_vi` trong `config/brand.json`: hiện đang nói "mỗi ngày học thêm một gốc từ", nhưng một nửa số tập không phải dạng gốc từ
- [ ] Soạn slot 2–7 (nhận trong `topics.csv` trước khi làm)
- [ ] Có ít nhất 3 tập `rendered` (tốt nhất 5–7) trước khi đăng ngày 1
- [ ] Chọn giờ đăng cố định trong khung 19:00–21:00, ghi vào Quyết định
- [ ] Mở thử YouTube Studio và TikTok Studio, xem có đủ các số ở `Experiment_30.md` mục 5 không. Thiếu thì sửa lại tài liệu
- [ ] Sau slot 15: đánh giá giữa kỳ (`Experiment_30.md` mục 7)

## Quyết định

Mới nhất ở trên. Ghi ngày, ai quyết, quyết gì, vì sao.

- **2026-10-24** (DanNK): Thử nghiệm 30 ngày, mỗi ngày 1 video. Slot lẻ là Gốc từ, slot chẵn xoay 4 dạng khác. Người phụ trách tự chọn ngày đăng, kế hoạch chỉ quy định thứ tự. Bộ nhớ chung và số liệu để trong repo trên `master`.
- **2026-10-24** (DanNK): Bỏ tập gốc -LOG- của lộ trình cũ, vì tập Hán Việt slot 4 (bio/geo/-logy) đã dạy phần này.

## Nhật ký

Mới nhất ở trên. Dạng: `- YYYY-MM-DD (ai): làm gì — kết quả / lưu ý`.

- 2026-10-24 (Claude): Dựng template cho 4 dạng còn lại: `config/formats.json`, cảnh `TopicIntro`/`OriginCard`/`SinoCard`/`ChallengeCard`, câu đố điền từ, `post.md` theo từng dạng, 4 tập mẫu `000-demo-*`. Đã render preview cả 4 bằng giọng dự phòng vì ZipVoice tắt.
- 2026-10-24 (Claude): Tạo bộ nhớ chung (`tracking/`), danh sách 30 chủ đề, `scripts/status.py`, `scripts/report.py` và `documents/Experiment_30.md`.

## Bài học

Những gì rút ra được và nên giữ cho các tập sau (hook nào ăn, lỗi giọng đọc hay gặp, mẹo dựng nhanh…).

- (chưa có)
