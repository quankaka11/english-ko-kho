---
name: ekk-episode
description: Soạn hoặc sửa nội dung một tập video kênh English Ko Khó (episodes/<id>/episode.json) - chọn gốc từ, liệt kê 6-8 từ cùng gốc, IPA, nghĩa tiếng Việt, lời đọc VO, câu ví dụ, câu đố, status đăng bài; kiểm chứng từ nguyên. Dùng khi người dùng nói "soạn tập", "tập mới", "gốc -XXX-", "episode.json", "kịch bản tập", "sửa lời đọc", "thêm từ".
---

# Soạn tập mới – English Ko Khó

Trước khi viết: đọc `documents/Content_Plan.md` (mục 2 format, mục 3 lộ trình 24 tập, mục 5 quy tắc nội dung). Chuẩn thương hiệu ở `brand/BRAND.md`.

## Quy trình

1. **Chọn id và tạo nhánh riêng**: id dạng `NNN-<goc>` (ví dụ `005-scrib`), trùng tên thư mục. Mỗi tập nằm trên một nhánh riêng tách từ `master` (quy ước ở `CLAUDE.md`):
   ```bash
   git checkout master && git pull && git checkout -b episode/<id>
   ```
   Xem các tập đã có bằng `git branch -a --list "*episode/*"` để không trùng. Đọc tập cũ bằng `git show episode/<id-cũ>:episodes/<id-cũ>/episode.json` để biết từ nào đã xuất hiện, rồi nhắc "bạn đã gặp ở tập N".
2. **Tạo file** từ mẫu: copy `config/episode.template.json` thành `episodes/<id>/episode.json`. Schema đầy đủ có mô tả từng trường ở `config/episode.schema.json`.
3. **Soạn nội dung** theo các quy tắc bên dưới. Để `status: "draft"` và mọi từ `verified: false`. **Không bao giờ** tự đặt `verified: true`: bước kiểm chứng là việc của người (đó cũng là lúc họ học).
4. **Kiểm tra**: `python scripts/validate_episode.py <id>`. Sửa hết lỗi ✗; còn cảnh báo `verified=false` là bình thường ở bản nháp.
5. **Nghe thử giọng** (cần server TTS): `python scripts/make_audio.py <id> --asr`. Câu nào ASR dưới 80% thì nghe lại và sửa VO hoặc thêm `lexicon`.
6. Đưa người dùng **danh sách cần kiểm chứng**: mỗi từ kèm link Etymonline + Cambridge, ví dụ `https://www.etymonline.com/word/inspect`, `https://dictionary.cambridge.org/dictionary/english/inspect`.

## Quy tắc nội dung (bắt buộc)

- 6–8 từ thông dụng **thực sự cùng gốc**. Từ nào không chắc thì bỏ, không "ép" cho đủ số.
- `parts` ghép lại phải đúng bằng `word` (validator sẽ chặn nếu sai). Loại mảnh: `prefix` (cam), `root` (xanh dương), `suffix` (xanh lá), `plain`. Mảnh root để trống `meaning_vi`, template sẽ tự lấy `root.meaning_vi`.
- Giải nghĩa kiểu ghép mảnh mà không đúng lịch sử từ thì đặt `"mnemonic": true` và phải có `disclaimer_vi`.
- Câu ví dụ do mình tự viết, ngắn (≤ 8 từ), phải chứa đúng từ đó (cho phép chia động từ hoặc số nhiều). Không chép câu ví dụ của từ điển.
- `meaning_vi` ≤ 18 ký tự để hiển thị to; nghĩa dài để vào VO.
- `hook.on_screen` ≤ 22 ký tự. Hook 3 giây đầu phải gây tò mò, ví dụ "Biết 1 mảnh này, hiểu luôn 8 từ".
- Thay đổi dạng tập (`format`) theo Content Plan mục 8 để tránh bị YouTube xếp vào "nội dung lặp lại". Hiện template mới dựng sẵn dạng `root_family`.

## Viết lời đọc (VO) cho TTS

VO tiếng Việt được đọc bằng ZipVoice (giọng `vv_sample`), đoạn trong `[en:...]` được đọc bằng giọng bản ngữ (edge-tts Ava).

| Đừng viết | Viết | Lý do |
| --- | --- | --- |
| `La-tinh` | `La tinh` | dấu gạch nối bị đọc thành "âm" |
| `Thêm ATOR là...` | `Thêm [en:ator] là...` | chữ tiếng Anh nằm trong câu Việt bị đọc theo kiểu Việt |
| `SPECT đến từ...` | `[en:spect] đến từ...` | như trên |
| `1/2`, `22/10` | `một nửa`, `ngày hai mươi hai tháng mười` | phân số/ngày tháng dễ đọc sai |
| câu dài 30+ chữ | 2 câu ngắn | giọng đọc tự nhiên hơn, phụ đề không tràn |

- Tiền tố viết HOA kiểu `IN là vào trong` thì ZipVoice đọc ổn ("in", "re", "pro"). Riêng tiền tố đọc kiểu Việt nghe lạ (ví dụ `retro`) thì bọc `[en:retro]`.
- Không cần đưa từ chính và câu ví dụ vào VO: pipeline tự đọc `word` (chậm) và `example_en` bằng giọng Anh.
- Cách đọc riêng cho giọng Việt đặt ở `lexicon`, ví dụ `{"IPA": "i pê a"}`. Lexicon của cả kênh nằm trong `config/brand.json` → `voice.lexicon` (đã có `"Ko Khó"` và `"ko"` → "không").
- Mỗi VO của từ nên dài 2–4 giây (khoảng 40–80 ký tự). Validator ước tính tổng thời lượng; mục tiêu là 60–90 giây.

## Phần đăng bài (`publish`)

- `youtube_title` ≤ 90 ký tự, có từ khoá: "Gốc SPECT: hiểu luôn 8 từ tiếng Anh". `#Shorts` được tự thêm.
- `tiktok_caption`: 1–2 câu, có emoji, kết thúc bằng lời mời đoán câu đố.
- `hashtags`: 4 hashtag kênh (`#englishkokho #hoctienganh #tuvungtienganh #learnenglish`) + 1–2 hashtag theo chủ đề (`#ielts`, `#tuvungielts`).
- `pinned_comment`: là **câu hỏi**, không ghi đáp án. Đáp án lấy từ `quiz.answer_vi` và đăng sau 24 giờ.

## Xong khi

- `python scripts/validate_episode.py <id>` báo ĐẠT, chỉ còn cảnh báo verified/nguồn.
- Người dùng đã nhận danh sách link để tự kiểm chứng.
- Sau khi người dùng kiểm chứng: đặt `verified: true` cho từng từ, `status: "verified"`, chạy lại với `--strict`, rồi commit `Content: tập NNN -XXX-` **trên nhánh `episode/<id>`** (chỉ chứa `episodes/<id>/`). Phát hiện lỗi template thì sửa trên `master` rồi `git rebase master`.
