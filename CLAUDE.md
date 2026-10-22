# English Ko Khó – quy ước cho Claude Code

Kênh video ngắn 9:16 dạy từ vựng tiếng Anh theo gốc từ, lời dẫn tiếng Việt. Tài liệu gốc: `documents/Content_Plan.md` (nội dung) và `documents/Technology_Plan.md` (kỹ thuật). Thương hiệu: `brand/BRAND.md`.

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
```

## Quy tắc cứng

- **Không tự đặt `verified: true`** cho từ vựng. Người dùng phải tự kiểm chứng 2 nguồn (Etymonline + Cambridge/Oxford); đây vừa là chốt chất lượng vừa là lúc họ học.
- Không dùng tài nguyên có bản quyền: cảnh phim, meme có nhân vật, nhân vật nổi tiếng (Pikachu…), nhạc không có giấy phép.
- Giá trị thương hiệu (màu, handle, CTA, giọng, intro/outro) chỉ sửa ở `config/brand.json`, không viết cứng trong code.
- Animation dùng `useCurrentFrame` + `interpolate`/`spring`, không dùng CSS transition. Các gói `@remotion/*` phải cùng đúng một phiên bản.
- Không commit: `.env`, `out/`, `public/episodes/`, `.cache/`, `node_modules/`, `.agents/`.
- Commit theo bước, message tiếng Việt dạng `<Khu vực>: <việc>` (Setup / Brand / Episode / Audio / Video / Publish / Docs / Content).
- Chạy Python trên Windows: script phải `import common` để console dùng UTF-8.

## Cấu trúc

```
config/      brand.json (thương hiệu), episode.schema.json, episode.template.json
episodes/    <id>/episode.json – nguồn nội dung (commit)
scripts/     pipeline Python: validate, make_audio (tts.py, vo.py), build_props, build, make_post, make_sfx, export_brand
src/         Remotion: EpisodeVideo, Cover, scenes/, components/, brand/ (Logo, Capi)
public/      sfx/, music/ (commit) · episodes/ (audio + props sinh ra, không commit)
brand/       BRAND.md + exports/ (avatar, banner)
out/<id>/    mp4, cover.png, post.md, anki.csv, qa.txt (không commit)
```
