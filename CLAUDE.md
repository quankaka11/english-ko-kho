# English Ko Khó – quy ước cho Claude Code

Kênh video ngắn 9:16 dạy từ vựng tiếng Anh theo gốc từ, lời dẫn tiếng Việt. Tài liệu gốc: `documents/Content_Plan.md` (nội dung) và `documents/Technology_Plan.md` (kỹ thuật). Thương hiệu: `brand/BRAND.md`.

## Bộ nhớ chung (đọc đầu mỗi phiên)

- `tracking/NOTES.md`: đang ở đâu, việc tiếp theo, quyết định, nhật ký. Làm xong việc gì thì ghi một dòng vào Nhật ký.
- `tracking/topics.csv`: 30 chủ đề của đợt thử nghiệm (`documents/Experiment_30.md`). Nhận slot bằng cách điền `nguoi_lam`/`id` trước khi soạn.
- `python scripts/status.py --fetch`: tiến độ từng slot, việc tiếp theo, từ bị lặp. Chạy trước khi chọn chủ đề.
- `tracking/` là file dùng chung: chỉ sửa và commit trên `master`, rồi push ngay để người khác thấy.

## Skill của dự án (dùng trước khi tự làm)

- `ekk-episode`: soạn/sửa `episodes/<id>/episode.json`
- `ekk-produce`: sinh giọng, render, QA, sửa template
- `ekk-publish`: status/caption, nhãn AI, checklist đăng TikTok + YouTube Shorts
- Bộ `remotion-*` (cài bằng `npx remotion skills add`): tra API Remotion, nâng cấp

## Lệnh chính

```bash
python scripts/validate_episode.py <id> [--strict]
python scripts/build.py <id> [--preview|--no-render|--skip-audio|--strict]
npm run dev          # Remotion Studio
npm run typecheck
python scripts/export_brand.py   # xuất lại avatar/banner sau khi sửa logo, Capi
python scripts/status.py [--fetch]   # tiến độ 30 chủ đề, việc tiếp theo
python scripts/report.py             # so sánh dạng tập từ tracking/metrics.csv
```

## Quy tắc cứng

- **Không tự đặt `verified: true`** cho từ vựng. Người dùng phải tự kiểm chứng 2 nguồn (Etymonline + Cambridge/Oxford); đây vừa là chốt chất lượng vừa là lúc họ học.
- Không dùng tài nguyên có bản quyền: cảnh phim, meme có nhân vật, nhân vật nổi tiếng (Pikachu…), nhạc không có giấy phép.
- Giá trị thương hiệu (màu, handle, CTA, giọng, intro/outro) chỉ sửa ở `config/brand.json`, không viết cứng trong code.
- Animation dùng `useCurrentFrame` + `interpolate`/`spring`, không dùng CSS transition. Các gói `@remotion/*` phải cùng đúng một phiên bản.
- Không commit: `.env`, `out/`, `public/episodes/`, `.cache/`, `node_modules/`, `.agents/`.
- Commit theo bước, message tiếng Việt dạng `<Khu vực>: <việc>` (Setup / Brand / Episode / Audio / Video / Publish / Docs / Content).

## Quy ước nhánh

| Nhánh | Chứa | Không chứa |
| --- | --- | --- |
| `master` | Mọi thứ dùng chung: `src/`, `scripts/`, `config/`, `brand/`, `public/sfx`, `tracking/`, skills, docs, tập test `episodes/000-demo` | Nội dung tập thật |
| `episode/<id>` (ví dụ `episode/001-spect`) | Chỉ `episodes/<id>/` của tập đó | File dùng chung |

- Tập mới: `git checkout master && git pull && git checkout -b episode/<id>`.
- Đang làm tập mà phát hiện lỗi template/script: **sửa trên `master`** (commit riêng, push), rồi quay lại nhánh tập và chạy `git rebase master`. Không commit file dùng chung trên nhánh tập.
- Trước khi commit trên nhánh tập, kiểm tra `git diff --cached --name-only` chỉ có `episodes/<id>/`.
- Trước khi push `master`: `npm run typecheck` và `python scripts/build.py 000-demo --preview` phải chạy được.
- Windows đôi khi khoá file làm `git checkout`/`rebase` chỉ chạy nửa chừng ("could not detach HEAD", HEAD đổi nhưng file chưa đổi). Không dùng `--force`; rebase trong worktree tạm: `git worktree add <thư-mục-tạm> episode/<id>` → `git -C <thư-mục-tạm> rebase master` → `git worktree remove <thư-mục-tạm>`.
- Danh sách tập: `git branch -a --list "*episode/*"`. Xem nội dung một tập mà không đổi nhánh: `git show episode/<id>:episodes/<id>/episode.json`.
- Chạy Python trên Windows: script phải `import common` để console dùng UTF-8.

## Cấu trúc

```
config/      brand.json (thương hiệu), episode.schema.json, episode.template.json
episodes/    <id>/episode.json – nguồn nội dung; trên master chỉ có 000-demo, tập thật nằm ở nhánh episode/<id>
scripts/     pipeline Python: validate, make_audio (tts.py, vo.py), build_props, build, make_post, make_sfx, export_brand, status, report
tracking/    bộ nhớ chung: NOTES.md, topics.csv (30 chủ đề), metrics.csv (số liệu 7 ngày sau đăng)
src/         Remotion: EpisodeVideo, Cover, scenes/, components/, brand/ (Logo, Capi)
public/      sfx/, music/ (commit) · episodes/ (audio + props sinh ra, không commit)
brand/       BRAND.md + exports/ (avatar, banner)
out/<id>/    mp4, cover.png, post.md, anki.csv, qa.txt (không commit)
```
