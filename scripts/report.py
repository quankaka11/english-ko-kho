"""So sánh hiệu quả các dạng tập từ số liệu TikTok / YouTube Shorts (tracking/metrics.csv).

    python scripts/report.py
    python scripts/report.py > tracking/report.md     # lưu lại để cả nhóm xem

Mỗi dòng metrics.csv là số liệu của một video trên một nền tảng, lấy đúng 7 ngày sau khi đăng
(cách lấy: documents/Experiment_30.md mục 5). Dạng tập lấy từ tracking/topics.csv theo id.
Dùng trung vị thay vì trung bình để một video viral không làm lệch cả nhóm.
"""
from __future__ import annotations

import csv
from collections import defaultdict
from datetime import date
from statistics import median

from common import ROOT, load_formats

METRICS = ROOT / "tracking" / "metrics.csv"
TOPICS = ROOT / "tracking" / "topics.csv"
FORMAT_VI = {k: v["name_vi"] for k, v in load_formats().items()}
NUMERIC = ["thoi_luong_s", "luot_xem", "tg_xem_tb_s", "pct_xem_het", "pct_giu_chan",
           "thich", "binh_luan", "chia_se", "luu", "follow_moi"]
# (tên cột, nhãn, số chữ số thập phân)
COLUMNS = [
    ("luot_xem", "Lượt xem", 0),
    ("pct_xem_tb", "% xem TB", 0),
    ("pct_xem_het", "% xem hết", 0),
    ("pct_giu_chan", "% giữ chân", 0),
    ("tuong_tac_1k", "Tương tác/1k", 1),
    ("binh_luan_1k", "Bình luận/1k", 1),
    ("luu_1k", "Lưu/1k", 1),
    ("follow_1k", "Follow/1k", 1),
]


def read_csv(path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def num(s: str) -> float | None:
    s = s.strip().replace("%", "").replace(" ", "")
    if not s:
        return None
    return float(s)


def per_1k(part: float | None, views: float | None) -> float | None:
    return part / views * 1000 if part is not None and views else None


def main() -> None:
    fmt = {t["id"].strip(): t["dang"] for t in read_csv(TOPICS) if t["id"].strip()}
    warns: list[str] = []
    groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    videos = []

    for i, r in enumerate(read_csv(METRICS), 2):
        ep_id, platform = r["id"].strip(), r["nen_tang"].strip().lower()
        if not ep_id:
            continue
        try:
            m = {k: num(r[k]) for k in NUMERIC}
        except ValueError as e:
            warns.append(f"dòng {i} ({ep_id}): số không đọc được ({e}); nhập số trơn, thập phân dùng dấu chấm")
            continue
        try:
            gap = (date.fromisoformat(r["ngay_lay"].strip()) - date.fromisoformat(r["ngay_dang"].strip())).days
            if not 7 <= gap <= 8:
                warns.append(f"dòng {i} ({ep_id} {platform}): lấy số sau {gap} ngày, quy ước là 7 (chấp nhận 8)")
        except ValueError:
            warns.append(f"dòng {i} ({ep_id} {platform}): ngày phải dạng YYYY-MM-DD")
        views = m["luot_xem"]
        engaged = [m[k] for k in ("thich", "binh_luan", "chia_se", "luu") if m[k] is not None]
        m["pct_xem_tb"] = (m["tg_xem_tb_s"] / m["thoi_luong_s"] * 100
                           if m["tg_xem_tb_s"] is not None and m["thoi_luong_s"] else None)
        m["tuong_tac_1k"] = per_1k(sum(engaged), views) if engaged else None
        m["binh_luan_1k"] = per_1k(m["binh_luan"], views)
        m["luu_1k"] = per_1k(m["luu"], views)
        m["follow_1k"] = per_1k(m["follow_moi"], views)
        f = fmt.get(ep_id)
        if not f:
            warns.append(f"dòng {i}: id {ep_id} chưa có trong topics.csv")
            continue
        groups[(platform, f)].append(m)
        videos.append((platform, ep_id, f, m))

    if not videos:
        print("Chưa có số liệu trong tracking/metrics.csv.")
    for platform in sorted({p for p, _ in groups}):
        print(f"## {platform}\n")
        print("| Dạng | n | " + " | ".join(label for _, label, _ in COLUMNS) + " |")
        print("| --- | ---: |" + " ---: |" * len(COLUMNS))
        for f in FORMAT_VI:
            ms = groups.get((platform, f))
            if not ms:
                continue
            cells = []
            for key, _, digits in COLUMNS:
                vals = [m[key] for m in ms if m[key] is not None]
                cells.append(f"{median(vals):,.{digits}f}" if vals else "–")
            mark = "" if len(ms) >= 3 else " *"
            print(f"| {FORMAT_VI[f]} | {len(ms)}{mark} | " + " | ".join(cells) + " |")
        top = sorted((v for v in videos if v[0] == platform), key=lambda v: v[3]["luot_xem"] or 0, reverse=True)[:3]
        print("\nNhiều lượt xem nhất: " + ", ".join(
            f"{ep_id} ({FORMAT_VI[f]}, {m['luot_xem'] or 0:,.0f})" for _, ep_id, f, m in top) + "\n")
    if videos:
        print("Số là trung vị. `*` = dưới 3 video, chỉ để tham khảo.")
    if warns:
        print("\nCần xem lại:")
        for w in warns:
            print(f"- {w}")


if __name__ == "__main__":
    main()
