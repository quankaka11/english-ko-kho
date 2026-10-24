"""Bộ nhớ chung: 30 chủ đề đang ở đâu, việc tiếp theo, từ bị lặp giữa các tập.

    python scripts/status.py            # đọc tracking/topics.csv + các nhánh episode/*
    python scripts/status.py --fetch    # git fetch trước để thấy nhánh người khác vừa đẩy lên

Trạng thái lấy từ episode.json trên nhánh episode/<id> (nguồn sự thật), ngày đăng lấy
từ cột ngay_dang của topics.csv. Không sửa file nào.
"""
from __future__ import annotations

import argparse
import csv
import json
import subprocess
from collections import Counter, defaultdict

from common import ROOT

TOPICS = ROOT / "tracking" / "topics.csv"

FORMAT_VI = {
    "root_family": "Gốc từ",
    "surprising_origin": "Nguồn gốc bất ngờ",
    "sino_vietnamese": "Hán Việt",
    "confusing_pair": "Cặp dễ nhầm",
    "guess_challenge": "Thử thách đoán",
}
STATUS_VI = {
    "draft": "nháp, chờ kiểm chứng",
    "verified": "đã kiểm chứng, chờ dựng",
    "rendered": "đã dựng, sẵn sàng đăng",
    "published": "đã đăng",
}


def git(*args: str) -> str:
    r = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    return r.stdout if r.returncode == 0 else ""


def load_topics() -> list[dict]:
    with TOPICS.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def episode_refs() -> dict[str, str]:
    """id -> ref để đọc episode.json; nhánh local được ưu tiên hơn nhánh remote."""
    refs: dict[str, str] = {}
    for prefix in ("refs/remotes/", "refs/heads/"):
        for ref in git("for-each-ref", "--format=%(refname:short)", prefix).split():
            head, sep, ep_id = ref.partition("episode/")
            if sep and head in ("", "origin/") and ep_id:
                refs[ep_id] = ref
    return refs


def read_episode(ref: str, ep_id: str) -> dict | None:
    raw = git("show", f"{ref}:episodes/{ep_id}/episode.json")
    try:
        return json.loads(raw) if raw else None
    except json.JSONDecodeError:
        return None


def split_words(s: str) -> list[str]:
    return [w.strip().lower() for w in s.split(";") if w.strip()]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--fetch", action="store_true", help="git fetch --prune trước khi đọc")
    args = ap.parse_args()

    if args.fetch:
        subprocess.run(["git", "fetch", "--prune", "--quiet"], cwd=ROOT)

    topics = load_topics()
    refs = episode_refs()
    warns: list[str] = []
    rows = []  # (topic, status_key, label, words)

    for t in topics:
        ep_id = t["id"].strip()
        ep = read_episode(refs[ep_id], ep_id) if ep_id in refs else None
        if ep:
            key = ep.get("status", "draft")
            if t["ngay_dang"].strip():
                key = "published"
            label = STATUS_VI.get(key, key)
            words = [w["word"].lower() for w in ep.get("words", [])]
            if ep.get("quiz", {}).get("word"):
                words.append(ep["quiz"]["word"].lower())
            if ep.get("format") != t["dang"]:
                warns.append(f"slot {t['slot']}: topics.csv ghi '{t['dang']}' nhưng episode.json là '{ep.get('format')}'")
        elif ep_id:
            key, label, words = "claimed", "đã đặt id, chưa có nhánh", split_words(t["tu_du_kien"])
        elif t["nguoi_lam"].strip():
            key, label, words = "claimed", "đã nhận, chưa có id", split_words(t["tu_du_kien"])
        else:
            key, label, words = "todo", "chưa làm", split_words(t["tu_du_kien"])
        if t["ngay_dang"].strip():
            label = f"đã đăng {t['ngay_dang'].strip()}"
        rows.append((t, key, label, words))

    # Bảng tiến độ
    print("TIẾN ĐỘ 30 CHỦ ĐỀ (tracking/topics.csv)\n")
    print(f"{'slot':>4}  {'dạng':<18} {'chủ đề':<52} {'id':<14} {'người làm':<12} trạng thái")
    for t, _, label, _ in rows:
        topic = t["chu_de"] if len(t["chu_de"]) <= 50 else t["chu_de"][:49] + "…"
        print(f"{t['slot']:>4}  {FORMAT_VI.get(t['dang'], t['dang']):<18} {topic:<52} "
              f"{t['id'] or '-':<14} {t['nguoi_lam'] or '-':<12} {label}")

    # Tổng hợp
    keys = Counter(k for _, k, _, _ in rows)
    posted = Counter(t["dang"] for t, k, _, _ in rows if k == "published")
    print(f"\nĐã đăng {keys['published']}/{len(rows)} · sẵn sàng đăng {keys['rendered']} · "
          f"chờ dựng {keys['verified']} · nháp {keys['draft']} · đã nhận {keys['claimed']} · chưa làm {keys['todo']}")
    print("Đã đăng theo dạng: " + ", ".join(
        f"{FORMAT_VI[f]} {posted[f]}/{sum(1 for t in topics if t['dang'] == f)}"
        for f in FORMAT_VI if any(t["dang"] == f for t in topics)))

    # Việc tiếp theo
    print("\nVIỆC TIẾP THEO")
    pending = [r for r in rows if r[1] != "published"]
    if pending:
        t, key, label, _ = pending[0]
        if key == "rendered":
            print(f"- Đăng tiếp: slot {t['slot']} {t['id']} ({t['chu_de']})")
        else:
            print(f"- Slot đăng tiếp là {t['slot']} ({t['chu_de']}) nhưng đang ở bước: {label}")
    buffer = keys["rendered"]
    print(f"- Vùng đệm (đã dựng, chưa đăng): {buffer} tập" + ("  ← dưới 3, ưu tiên dựng thêm" if buffer < 3 else ""))
    drafts = [t for t, k, _, _ in rows if k == "draft"]
    if drafts:
        print("- Chờ người kiểm chứng: " + ", ".join(t["id"] for t in drafts))
    free = [t for t, k, _, _ in rows if k == "todo"][:3]
    if free:
        print("- Chủ đề trống nên nhận tiếp: " + "; ".join(f"slot {t['slot']} {t['chu_de']}" for t in free))

    # Từ lặp giữa các slot
    where: dict[str, list[str]] = defaultdict(list)
    for t, _, _, words in rows:
        for w in dict.fromkeys(words):
            where[w].append(t["slot"])
    dup = {w: s for w, s in where.items() if len(s) > 1}
    if dup:
        print("\nTỪ LẶP GIỮA CÁC SLOT (nếu cố ý ôn thì ghi series_note_vi 'bạn đã gặp ở tập N')")
        for w, s in sorted(dup.items(), key=lambda x: int(x[1][0])):
            print(f"- {w}: slot {', '.join(s)}")

    # Kiểm tra
    for a, b in zip(topics, topics[1:]):
        if a["dang"] == b["dang"]:
            warns.append(f"slot {a['slot']} và {b['slot']} cùng dạng {FORMAT_VI.get(a['dang'], a['dang'])}: nên đan xen")
    known = {t["id"].strip() for t in topics}
    for ep_id in sorted(set(refs) - known):
        warns.append(f"nhánh episode/{ep_id} chưa có trong topics.csv: điền id vào slot tương ứng")
    if warns:
        print("\nCẦN XEM LẠI")
        for w in warns:
            print(f"! {w}")


if __name__ == "__main__":
    main()
