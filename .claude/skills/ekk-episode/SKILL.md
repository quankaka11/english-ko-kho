---
name: ekk-episode
description: Soạn hoặc sửa nội dung một tập video kênh English Ko Khó (episodes/<id>/episode.json) - chọn gốc từ, liệt kê 6-8 từ cùng gốc, IPA, nghĩa tiếng Việt, lời đọc VO, câu ví dụ, câu đố, status đăng bài; kiểm chứng từ nguyên. Dùng khi người dùng nói "soạn tập", "tập mới", "gốc -XXX-", "episode.json", "kịch bản tập", "sửa lời đọc", "thêm từ".
---

# Soạn tập mới – English Ko Khó

Trước khi viết: đọc `documents/Content_Plan.md` (mục 2 format, mục 3 lộ trình 24 tập, mục 5 quy tắc nội dung). Chuẩn thương hiệu ở `brand/BRAND.md`.

## Quy trình

0. **Chọn chủ đề từ bộ nhớ chung**: đọc `tracking/NOTES.md`, chạy `python scripts/status.py --fetch`. Lấy slot trống sớm nhất trong `tracking/topics.csv` (hoặc slot người dùng chỉ định). Trên `master`, điền `id` + `nguoi_lam` cho slot đó, commit `Content: nhận slot N <id>` rồi push để người khác không làm trùng. `dang` của slot chính là `format` của tập.
1. **Chọn id và tạo nhánh riêng**: id dạng `NNN-<goc>` với NNN = số slot (ví dụ slot 5 → `005-graph`), trùng tên thư mục. Mỗi tập nằm trên một nhánh riêng tách từ `master` (quy ước ở `CLAUDE.md`):
   ```bash
   git checkout master && git pull && git checkout -b episode/<id>
   ```
   Phần "TỪ LẶP" của `status.py` cho biết từ nào đã/sẽ xuất hiện ở slot khác. Đọc tập cũ bằng `git show episode/<id-cũ>:episodes/<id-cũ>/episode.json`, rồi nhắc "bạn đã gặp ở tập N" (`series_note_vi`).
2. **Tạo file** từ mẫu đúng dạng tập (cột `demo` trong `config/formats.json`): Gốc từ dùng `config/episode.template.json`; dạng khác copy tập mẫu `episodes/000-demo-origin|sino|pair|guess/episode.json` rồi thay nội dung. Đặt `id`, `episode`, `status: "draft"`, mọi từ `verified: false`. Schema đầy đủ có mô tả từng trường ở `config/episode.schema.json`.
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
- Dạng tập (`format`) theo cột `dang` của slot trong `tracking/topics.csv`: slot lẻ là Gốc từ, slot chẵn xoay 4 dạng khác (`documents/Experiment_30.md` mục 2), để tránh bị YouTube xếp vào "nội dung lặp lại".

## Từng dạng tập

Số từ nên có nằm ở `config/formats.json` → `words`. Mọi dạng đều có hook, `words` (mỗi từ đủ IPA, nghĩa, VO, câu ví dụ, nguồn, `verified`), tổng kết, câu đố và phần đăng bài.

| Dạng | Cảnh giới thiệu | Trường riêng | Lưu ý |
| --- | --- | --- | --- |
| `root_family` Gốc từ | `root` | – | 6–8 từ thực sự cùng gốc |
| `surprising_origin` Nguồn gốc bất ngờ | `topic` | mỗi từ có `origin_vi` (≤ 40 ký tự, ví dụ `Ý: quaranta = bốn mươi`); từ đổi nghĩa thêm `then_vi` (nghĩa xưa) để hiện cảnh Xưa → Nay | Chỉ kể nguồn gốc mà Etymonline/từ điển lớn ghi nhận. Chuyện còn tranh cãi thì nói rõ trong VO và `answer_vi` |
| `sino_vietnamese` Hán Việt | `topic` | mỗi từ có `han_viet`; `meaning_vi` của từng mảnh là **chữ Hán Việt** của mảnh đó (bio → `sinh`) để template tô cùng màu | Chữ của mảnh phải nằm trong `han_viet` (validator cảnh báo nếu lệch). Đối chiếu nghĩa Hán Việt bằng từ điển Hán Việt |
| `confusing_pair` Cặp dễ nhầm | `topic` | `summary.tip_vi` (bắt buộc: mẹo phân biệt); câu đố dùng `quiz.sentence_en` có `___` + `quiz.options` thay cho `word`/`parts` | 2–3 từ. `parts` tô phần khác nhau giữa các từ (ví dụ chữ `o`/`oo`). Mẹo nhớ thì đặt `mnemonic: true` + `disclaimer_vi` |
| `guess_challenge` Thử thách đoán | `topic` | mỗi từ có `from_vi` (đã học ở tập nào) | Từ mới, ghép từ các gốc **đã đăng**. Nghĩa bị giấu trong `think_sec` giây có đồng hồ đếm ngược, nên VO giải thích sau đó, không nói nghĩa trước |

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
- Đã ghi một dòng vào `tracking/NOTES.md` → Nhật ký (trên `master`), kể cả lưu ý cho người làm tập sau.
