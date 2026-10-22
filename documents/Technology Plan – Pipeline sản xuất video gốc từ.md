# Technology Plan – Pipeline sản xuất video gốc từ bằng Claude + công cụ miễn phí

Oct 22, 2026 · @DanNK

## 1. Tóm tắt kiến trúc

Pipeline đề xuất: Claude.ai soạn dữ liệu tập thành một file JSON, bạn kiểm chứng, rồi Claude Code dùng Remotion (video viết bằng React) + model giọng bạn tự host để dựng và render. Template dựng một lần; mỗi tập mới chỉ thay file dữ liệu. Chi phí ngoài gói Claude: 0 đồng.

&#91;embedded content: pipeline sản xuất 1 tập · 6 bước\]

Bước 2 là bước duy nhất không được tự động hóa: nó vừa giữ độ chính xác của kênh, vừa là lúc bạn thực sự học.

## 2. Stack công cụ miễn phí theo từng khâu

Toàn bộ stack chạy trên máy tính của bạn, chi phí 0 đồng ngoài gói Claude bạn đang có. Lựa chọn chính là Claude Code + Remotion: video được viết bằng code React, nên mỗi tập mới chỉ là thay dữ liệu, không phải dựng lại từ đầu.

| Khâu | Công cụ chính | Giấy phép / chi phí | Phương án dự phòng |
| --- | --- | --- | --- |
| Nghiên cứu, kịch bản | Claude.ai (Project riêng cho kênh) | Gói Team/Enterprise hiện có | — |
| Dựng & render video | [Remotion](https://www.remotion.dev/docs/license/pricing) + [Remotion Agent Skills](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code) | Miễn phí nếu kênh là dự án cá nhân của bạn; nếu công ty ≥ 4 người sở hữu kênh thì cần Company License ([FAQ](https://www.remotion.dev/docs/license/faq)) | Python + FFmpeg (Claude viết script) |
| Điều khiển dựng video | Claude Code | Có trong gói Team/Enterprise; admin cần cấp quyền Claude Code cho seat của bạn | Claude.ai sinh code, bạn tự chạy lệnh |
| Giọng tiếng Việt | Model TTS bạn tự host, gọi qua HTTP API | Hạ tầng của bạn | [edge-tts](https://github.com/rany2/edge-tts) (vi-VN-HoaiMyNeural / NamMinhNeural) |
| Giọng tiếng Anh | Model tự host (nếu hỗ trợ tiếng Anh) hoặc edge-tts (en-US, en-GB) | Miễn phí | [Kokoro-82M](https://www.promptlayer.com/models/kokoro-82m), Apache 2.0, chạy offline |
| Thời gian & phụ đề | Đo độ dài từng file audio bằng ffprobe; phụ đề lấy từ chính văn bản kịch bản | Miễn phí | Whisper chạy local để lấy mốc thời gian từng từ |
| Linh vật, hình minh họa | SVG do Claude vẽ (nhân vật gốc của kênh) | Bạn sở hữu | Bạn tự vẽ phác, Claude chuyển thành SVG |
| Nhạc nền | YouTube Audio Library / thư viện nhạc TikTok | Miễn phí | Nhạc CC0 |
| Kiểm chứng từ nguyên | Etymonline, Wiktionary, Cambridge Dictionary | Miễn phí tra cứu | — |
| Ôn tập cá nhân | Anki (nhập CSV do Claude xuất) | Miễn phí trên Windows | Quiz/flashcard ngay trong Claude.ai |
| Phần mềm nền (Windows) | Node.js, Python 3, FFmpeg, Git for Windows, VS Code | Miễn phí | WSL2 nếu gặp lỗi đường dẫn |

**Về giọng đọc:** vì bạn đã tự host model giọng tiếng Việt, khâu giọng đọc được thiết kế thành một module riêng (`scripts/make_audio.py`) gọi API của bạn; edge-tts chỉ còn là phương án dự phòng. Cách nối ở mục 4.5.

## 3. Claude làm gì ở mỗi khâu

Claude đảm nhận 3 vai: biên tập viên (Claude.ai), kỹ sư dựng video (Claude Code), và người giữ quy trình (Skill tự tạo). Cả ba đều nằm trong gói Claude, không mất thêm phí.

**3.1 Claude.ai: Project "Kênh Gốc Từ"**

- Tạo một Project, dán vào phần hướng dẫn: format video (mục 2 tài liệu Content), quy ước màu, giọng văn, danh sách tập đã làm.
- Mỗi tập, gõ: "Soạn tập 5, gốc -SCRIB-". Claude trả về file `episode.json` (cấu trúc ở mục 4) gồm từ, IPA, nghĩa, câu ví dụ, lời thoại.
- Dùng thêm để: kiểm tra câu ví dụ bạn tự viết, tạo quiz ôn tập, xuất CSV cho Anki, viết mô tả và hashtag.

**3.2 Claude Code + Remotion Agent Skills**

- Remotion duy trì bộ Agent Skills chính thức, dạy Claude Code các quy ước của Remotion để viết code đúng thay vì đoán ([Tella](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code)). Bộ skill gồm 12 skill, có `remotion-captions`, `remotion-render` và `remotion-docs` để đọc tài liệu API mới nhất ([Motionbox](https://motionbox.io/blog/remotion-for-coding-agents)).
- Remotion còn có plugin riêng cho Claude Code đã gói sẵn các skill; MCP của Remotion đã ngừng, nên dùng skill thay cho MCP ([Hora de Codar](https://horadecodar.com.br/?p=44180)).
- Việc của Claude Code: dựng template video một lần (linh vật, bảng, hiệu ứng tách từ), viết script tạo giọng đọc, rồi mỗi tập chỉ đọc `episode.json` mới và render.

**3.3 Skill tự tạo: `root-word-episode`**

- Dùng skill-creator (có sẵn trong Claude) để đóng gói quy trình thành một Skill: checklist kiểm chứng từ nguyên, mẫu JSON, quy tắc lời thoại, quy tắc tránh lặp khuôn.
- Lợi ích: mọi tập đều theo cùng chuẩn, kể cả khi bạn mở cuộc trò chuyện mới.

| Khâu | Bạn làm | Claude làm |
| --- | --- | --- |
| Chọn gốc từ | Quyết định | Gợi ý gốc có ≥ 6 từ thông dụng |
| Nghiên cứu | Kiểm chứng 2 nguồn | Soạn danh sách, IPA, nghĩa |
| Kịch bản | Duyệt, sửa giọng văn | Viết `episode.json` |
| Dựng video | Xem preview, góp ý | Viết code Remotion, chạy render |
| Đăng bài | Đăng, gắn nhãn AI | Viết tiêu đề, mô tả, hashtag |
| Tự học | Đoán trước, viết câu, ôn Anki | Sửa câu, tạo quiz, xuất CSV |

## 4. Cài đặt từng bước & cấu trúc project

Cài đặt mất khoảng 1 buổi, chỉ làm một lần. Lệnh cài skill của Remotion từng thay đổi nhiều lần, nên kiểm tra lại trang Agent Skills của Remotion trước khi chạy ([OpenReplay](https://blog.openreplay.com/making-videos-claude-code-remotion/)).

**4.1 Cài phần mềm nền**

1. Cài phần mềm nền bằng winget trong PowerShell, từng lệnh: `winget install OpenJS.NodeJS.LTS`, `winget install Python.Python.3.12`, `winget install Gyan.FFmpeg`, `winget install Git.Git`, `winget install Microsoft.VisualStudioCode`. Mở lại terminal rồi kiểm tra `node -v`, `python --version`, `ffmpeg -version`.
2. Cài Claude Code (chạy trực tiếp trên Windows, cần Git for Windows; hoặc chạy trong WSL2). Đăng nhập bằng tài khoản Team/Enterprise, kiểm tra bằng `claude --version`. Nếu bị từ chối quyền, nhờ admin tổ chức bật Claude Code cho seat của bạn.
3. Kiểm tra model giọng tự host: gọi thử API từ máy Windows và nghe file trả về. Cài dự phòng tiếng Anh: `pip install edge-tts`.
4. Đặt project ở đường dẫn ngắn, không dấu, không khoảng trắng (ví dụ `C:\video\goc-tu`) để tránh lỗi đường dẫn của Node/FFmpeg.

**4.2 Tạo project Remotion + skill** (theo hướng dẫn của [Motionbox](https://motionbox.io/blog/remotion-for-coding-agents))

```bash
npx create-video --yes --blank goc-tu-channel
cd goc-tu-channel
npm install
npx remotion skills add        # cài Agent Skills cho Claude Code
npm run dev                    # mở Remotion Studio để xem preview
# mở terminal thứ 2, cùng thư mục:
claude
```

Cách thay thế qua plugin chính thức: `claude plugin marketplace add remotion-dev/claude-code-plugin` rồi `claude plugin install remotion@remotion`.

**4.3 Cấu trúc thư mục đề xuất**

```
goc-tu-channel/
├── CLAUDE.md              # quy ước kênh: màu, font, format, quy tắc
├── episodes/
│   ├── 001-spect/
│   │   ├── episode.json   # dữ liệu tập (Claude.ai soạn, bạn duyệt)
│   │   ├── audio/         # mp3 + srt do edge-tts sinh
│   │   └── out.mp4        # video xuất
│   └── 002-port/...
├── scripts/
│   └── make_audio.py      # đọc episode.json → gọi edge-tts từng câu
├── src/
│   ├── RootWordVideo.tsx  # template chung cho mọi tập
│   ├── Mascot.tsx         # linh vật SVG
│   └── scenes/            # Hook, RootIntro, WordCard, Summary, Quiz
└── public/music/          # nhạc nền có giấy phép
```

**4.4 Cấu trúc `episode.json`** (giao kèo giữa Claude.ai và Claude Code)

```json
{
  "episode": 1,
  "root": "SPECT",
  "origin": "Latin specere",
  "meaning_vi": "nhìn",
  "hook_vi": "Biết 1 mảnh này, bạn hiểu luôn 8 từ.",
  "words": [
    {
      "word": "inspect",
      "parts": [{"text": "in", "type": "prefix"}, {"text": "spect", "type": "root"}],
      "ipa": "/ɪnˈspekt/",
      "pos": "v.",
      "meaning_vi": "kiểm tra kỹ",
      "explain_vi": "IN là vào trong. Nhìn vào bên trong, tức là kiểm tra kỹ.",
      "example_en": "The officer inspected every bag.",
      "sources": ["etymonline", "cambridge"]
    }
  ],
  "quiz": {"word": "introspection", "hint_vi": "INTRO là vào trong bản thân"}
}
```

**4.5 Nối model giọng tự host vào pipeline**

Nguyên tắc: mỗi câu lời thoại là một file audio riêng, độ dài file quyết định thời lượng cảnh. Nhờ vậy không cần model của bạn trả về mốc thời gian.

1. Thêm vào `.env` (không đưa lên git): `TTS_URL=http://<máy-của-bạn>:<port>/...`, `TTS_VOICE=<tên giọng>`, và khóa API nếu có.
2. `make_audio.py` đọc `episode.json`, gửi từng câu `hook_vi`, `explain_vi` tới `TTS_URL`; câu tiếng Anh (`word`, `example_en`) gửi tới model của bạn nếu hỗ trợ tiếng Anh, nếu không thì gọi edge-tts.
3. Lưu thành `audio/01_hook.wav`, `audio/02_inspect_vi.wav`, `audio/02_inspect_en.wav`…, rồi dùng `ffprobe` đo độ dài, ghi ra `audio/timing.json`.
4. Template Remotion đọc `timing.json` để đặt độ dài từng cảnh; phụ đề hiện theo câu, lấy chữ từ kịch bản.
5. Chuẩn hóa âm lượng mọi file (ví dụ bộ lọc `loudnorm` của FFmpeg) để giọng Việt và giọng Anh không chênh nhau.

Prompt mẫu cho Claude Code:

```text
Viết scripts/make_audio.py: đọc episodes/<id>/episode.json, gọi TTS tự host
tại biến môi trường TTS_URL cho mọi câu tiếng Việt, gọi edge-tts giọng
en-US-JennyNeural cho câu tiếng Anh, lưu wav theo thứ tự cảnh, chuẩn hóa
loudnorm, đo độ dài bằng ffprobe và ghi audio/timing.json. Có retry 3 lần
và báo lỗi rõ câu nào thất bại. Chạy được trên Windows PowerShell.
```

## 5. Quy trình sản xuất 1 tập end-to-end

Sau khi template đã dựng xong, một tập mất khoảng 60–75 phút, trong đó phần lớn là thời gian bạn học (mục 6 tài liệu Content). Phần máy làm chỉ 10–15 phút.

**5.1 Lần đầu: dựng template (1 lần, 2–4 giờ)**

Prompt mẫu cho Claude Code (bật plan mode trước):

```text
Đọc CLAUDE.md. Tạo composition Remotion "RootWordVideo" 1080x1920, 30fps,
nhận props từ episodes/<id>/episode.json. Gồm 5 scene: Hook, RootIntro,
WordCard (lặp cho từng từ, tô màu prefix/root/suffix, hiện IPA, nghĩa,
câu ví dụ), Summary (bảng tất cả từ), Quiz. Thời lượng mỗi scene lấy theo
độ dài file audio tương ứng. Thêm linh vật SVG ở góc phải. Giữ chữ trong
vùng 15–75% chiều cao. Viết thêm scripts/make_audio.py dùng edge-tts.
```

**5.2 Mỗi tập**

1. **Soạn dữ liệu (Claude.ai, 10 phút):** "Soạn tập 6, gốc -VIS-/-VID-" → nhận `episode.json`.
2. **Kiểm chứng (bạn, 15 phút):** đối chiếu từng từ với Etymonline + Cambridge, xóa từ không chắc chắn.
3. **Sinh giọng (máy, 2 phút):** `python scripts/make_audio.py episodes/006-vis` → tạo mp3 + srt cho từng câu (giọng Việt cho lời dẫn, giọng Anh cho từ và câu ví dụ).
4. **Preview (bạn + Claude Code, 15 phút):** xem trong Remotion Studio, góp ý bằng lời: "từ thứ 3 hiện quá nhanh", Claude Code sửa.
5. **Render (máy, 3–5 phút):** `npx remotion render RootWordVideo episodes/006-vis/out.mp4 --props=episodes/006-vis/episode.json`.
6. **Hậu kỳ nhẹ (tùy chọn):** thêm nhạc nền, hoặc chèn đoạn bạn tự quay mặt/lồng tiếng ở phần câu đố.
7. **Đăng (10 phút):** nhờ Claude viết tiêu đề + mô tả + hashtag; đăng YouTube Shorts và TikTok; bật nhãn AI trên TikTok.
8. **Ôn (Claude.ai, 2 phút):** "Xuất 8 từ tập 6 thành CSV Anki" → nhập vào Anki.

**Mẹo:** gom 3 tập làm cùng buổi (batch) để tiết kiệm thời gian khởi động, nhưng vẫn kiểm chứng từng từ thủ công.

## 6. Thông số xuất bản & nhãn AI

Một file render dùng chung cho cả hai nền tảng: MP4 (H.264 + AAC), 1080×1920, 30 fps, dài 75–90 giây. YouTube Shorts nhận video dọc tới 3 phút, TikTok còn dài hơn, nên 90 giây an toàn cho cả hai.

| Mục | YouTube Shorts | TikTok |
| --- | --- | --- |
| Khung hình | 9:16, 1080×1920 | 9:16, 1080×1920 |
| Thời lượng đề xuất | 75–90 giây | 75–90 giây |
| Nhãn AI | Không bắt buộc cho nội dung hoạt hình rõ ràng không thật; ghi chú "giọng AI" trong mô tả | Bật nhãn AIGC vì giọng TTS có thể bị coi là âm thanh AI chân thực |
| Nguồn quy định | [Exchange4media](https://www.exchange4media.com/digital-news/youtube-to-ask-creators-to-disclose-ai-usage-133287.html), [AIR Media-Tech](https://air.io/en/youtube-glossary/what-is-youtubes-ai-content-disclosure-policy) | [Cinerads](https://www.cinerads.com/blog/tiktok-ai-content-policy), [Storrito](https://storrito.com/resources/tiktoks-2026-ai-labeling-rules-and-what-they-signal-for-platform-governance) |

**Chi tiết quan trọng:**

- YouTube chỉ yêu cầu khai báo khi nội dung trông như thật; hoạt hình và việc dùng AI hỗ trợ sản xuất (viết kịch bản, phụ đề) được miễn ([Exchange4media](https://www.exchange4media.com/digital-news/youtube-to-ask-creators-to-disclose-ai-usage-133287.html)). Nếu không khai báo khi bắt buộc, YouTube có thể tự gắn nhãn và vi phạm lặp lại có thể dẫn tới gỡ video hoặc tạm ngưng kiếm tiền ([AIR Media-Tech](https://air.io/en/youtube-glossary/what-is-youtubes-ai-content-disclosure-policy)).
- TikTok không yêu cầu nhãn cho chú thích, mô tả, hashtag hay kịch bản do AI viết; yêu cầu nhãn áp dụng cho hình ảnh và âm thanh ([Storrito](https://storrito.com/resources/tiktoks-2026-ai-labeling-rules-and-what-they-signal-for-platform-governance)). TikTok còn tự phát hiện nội dung AI qua Content Credentials và watermark.
- Bật nhãn AI trên TikTok không tự làm giảm lượt phân phối nếu nội dung tuân thủ quy định ([EchoTik](https://www.echotik.live/blog/tiktok-ai-content-labeling-rules-2026/)).

## 7. Rủi ro, giới hạn & lộ trình nâng cấp

Rủi ro lớn nhất không nằm ở kỹ thuật mà ở chính sách: một kênh toàn video theo khuôn, giọng máy, có thể bị YouTube coi là "thiếu chân thực" và mất quyền kiếm tiền cho cả kênh.

| Rủi ro | Mức độ | Cách xử lý |
| --- | --- | --- |
| Bị xếp vào "nội dung thiếu chân thực" (theo khuôn, ít khác biệt) | Cao | Xen kẽ 4 dạng tập, mỗi tập có ví dụ và mẹo nhớ riêng, thêm giọng hoặc mặt thật của bạn |
| Sai từ nguyên/IPA | Cao | Kiểm 2 nguồn mỗi từ, ghi nguồn trong `episode.json` |
| Server giọng tự host tắt hoặc chậm khi render | Trung bình | Retry trong `make_audio.py`, sinh audio trước khi render, dự phòng edge-tts |
| Model giọng đọc sai từ tiếng Anh hoặc dấu tiếng Việt | Trung bình | Nghe lại toàn bộ audio ở bước preview; tách câu Anh sang model tiếng Anh |
| Lệnh cài Remotion skill thay đổi | Thấp | Kiểm tra trang Agent Skills của Remotion trước khi cài |
| Giấy phép Remotion nếu kênh thuộc công ty | Tùy trường hợp | Kênh cá nhân: miễn phí; công ty ≥ 4 người sở hữu kênh: cần Company License ([Remotion](https://www.remotion.dev/docs/license/faq)) |
| Seat Team/Enterprise chưa bật Claude Code | Thấp | Nhờ admin bật; tạm thời dùng Claude.ai sinh code |
| Bản quyền nhạc/hình | Trung bình | Chỉ dùng tài nguyên tự tạo hoặc có giấy phép rõ ràng |

**Lộ trình nâng cấp:**

1. **Tuần 1–2:** cài đặt, dựng template, làm 3 tập thử, chưa đăng.
2. **Tuần 3–10:** đăng 24 tập theo lịch, đo retention, tinh chỉnh template.
3. **Sau tuần 10:** thêm biến thể template (Cặp dễ nhầm, Nguồn gốc bất ngờ), ghép 5 tập thành 1 video dài cho YouTube, thử tự lồng tiếng để tăng tính chân thực.

## Nguồn tham khảo

- [Remotion – License & Pricing](https://www.remotion.dev/docs/license/pricing)
- [Remotion – License FAQ](https://www.remotion.dev/docs/license/faq)
- [Tella – How to Use Remotion Agent Skills With Claude Code](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code)
- [Motionbox – Remotion for coding agents](https://motionbox.io/blog/remotion-for-coding-agents)
- [OpenReplay – Making Videos with Claude Code and Remotion](https://blog.openreplay.com/making-videos-claude-code-remotion/)
- [Hora de Codar – Remotion com Claude Code](https://horadecodar.com.br/?p=44180)
- [rany2/edge-tts (GitHub)](https://github.com/rany2/edge-tts)
- [Kokoro-82M](https://www.promptlayer.com/models/kokoro-82m)
- [TechCrunch – YouTube clarifies policies around AI slop (20/7/2026)](https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/)
- [AIR Media-Tech – YouTube AI disclosure policy](https://air.io/en/youtube-glossary/what-is-youtubes-ai-content-disclosure-policy)
- [Cinerads – TikTok AI content policy 2026](https://www.cinerads.com/blog/tiktok-ai-content-policy)
