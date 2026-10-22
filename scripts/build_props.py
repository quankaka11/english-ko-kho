"""Ghép episode.json + audio/timing.json + brand.json -> public/episodes/<id>/props.json.

    python scripts/build_props.py 001-spect

props.json là dòng thời gian tính sẵn theo frame: mỗi cảnh có from/duration, các clip
giọng đọc bên trong và phụ đề. Remotion (src/EpisodeVideo.tsx) chỉ việc vẽ theo đó.
"""
from __future__ import annotations

import argparse
import json
import math
import sys

from common import load_brand, load_episode, public_episode_dir, write_json
from vo import display_text

LEAD_IN_SEC = 0.15      # khoảng lặng đầu mỗi cảnh trước khi giọng vào
MIN_CAPTION_SEC = 0.35  # cụm phụ đề ngắn hơn thì gộp vào cụm sau cho khỏi nháy


def merge_short(caps: list[dict]) -> list[dict]:
    """Gộp cụm phụ đề quá ngắn vào cụm kế tiếp cùng ngôn ngữ."""
    out: list[dict] = []
    for c in caps:
        prev = out[-1] if out else None
        if prev and prev["lang"] == c["lang"] and prev["end"] - prev["start"] < MIN_CAPTION_SEC:
            out[-1] = {**prev, "end": c["end"], "text": f"{prev['text']} {c['text']}"}
        else:
            out.append(c)
    return out


class Timeline:
    def __init__(self, fps: int, gap: float, tail: float, timing: dict):
        self.fps, self.gap, self.tail, self.timing = fps, gap, tail, timing
        self.cursor = 0  # frame
        self.scenes: list[dict] = []

    def f(self, sec: float) -> int:
        return int(math.ceil(sec * self.fps))

    def scene(self, type_: str, clip_ids: list[str], data: dict | None = None,
              min_sec: float = 0.0, captions: bool = True, sfx: str | None = None) -> dict:
        t = LEAD_IN_SEC
        clips, caps = [], []
        for cid in clip_ids:
            c = self.timing["clips"].get(cid)
            if c is None:
                sys.exit(f"✗ timing.json thiếu clip '{cid}' – chạy lại make_audio.py")
            clips.append({"id": cid, "src": c["file"], "from": self.f(t), "duration": self.f(c["duration"])})
            if captions:
                for cap in merge_short(c["captions"]):
                    caps.append({"from": self.f(t + cap["start"]), "to": self.f(t + cap["end"]),
                                 "text": display_text(cap["text"]), "lang": cap["lang"]})
            t += c["duration"] + self.gap
        t = t - self.gap + self.tail if clip_ids else 0
        duration = self.f(max(t, min_sec))
        s = {"type": type_, "from": self.cursor, "duration": duration, "clips": clips,
             "captions": caps, "data": data or {}, "sfx": sfx}
        self.scenes.append(s)
        self.cursor += duration
        return s


def build(episode_id: str) -> dict:
    brand = load_brand()
    ep = load_episode(episode_id)
    pub = public_episode_dir(episode_id)
    timing_path = pub / "audio" / "timing.json"
    if not timing_path.exists():
        sys.exit(f"✗ Chưa có {timing_path} – chạy make_audio.py trước")
    timing = json.loads(timing_path.read_text(encoding="utf-8"))

    v = brand["video"]
    tl = Timeline(v["fps"], v["gap_between_clips_sec"], v["scene_tail_sec"], timing)
    intro = brand["intro"]

    def add_intro() -> None:
        tl.scene("intro", ["intro"] if intro.get("vo") else [], min_sec=intro["duration_sec"],
                 captions=False, sfx=intro.get("sfx"))

    if intro["enabled"] and intro["position"] == "before_hook":
        add_intro()
    tl.scene("hook", ["hook"], min_sec=2.5)
    if intro["enabled"] and intro["position"] == "after_hook":
        add_intro()
    tl.scene("root", ["root"], min_sec=3.0, sfx="sfx/whoosh.wav")
    n = len(ep["words"])
    for i, w in enumerate(ep["words"], 1):
        tl.scene("word", [f"w{i}_word", f"w{i}_vo", f"w{i}_ex"], data={"index": i - 1, "total": n},
                 sfx="sfx/whoosh.wav")
    tl.scene("summary", ["summary"], min_sec=4.5, sfx="sfx/whoosh.wav")
    tl.scene("quiz", ["quiz_word", "quiz"], min_sec=4.0, sfx="sfx/pop.wav")
    if brand["outro"]["enabled"]:
        tl.scene("outro", ["outro"] if brand["outro"].get("vo") else [],
                 min_sec=brand["outro"]["min_duration_sec"], sfx=brand["outro"].get("sfx"))

    music = ep.get("music") or ({"file": brand["music"]["file"], "volume": brand["music"]["volume"]}
                                if brand["music"]["file"] else None)
    props = {
        "episodeId": episode_id,
        "fps": v["fps"],
        "durationInFrames": tl.cursor,
        "episode": {k: ep[k] for k in ("id", "episode", "format", "title_vi", "hook", "root", "words",
                                         "summary", "quiz") if k in ep} | {
            "disclaimer_vi": ep.get("disclaimer_vi"),
        },
        "scenes": tl.scenes,
        "music": music,
    }
    write_json(pub / "props.json", props)
    return props


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode_id")
    args = ap.parse_args()
    props = build(args.episode_id)
    fps = props["fps"]
    print(f"props.json: {len(props['scenes'])} cảnh, {props['durationInFrames'] / fps:.1f}s")
    for s in props["scenes"]:
        print(f"  {s['type']:<8} {s['from'] / fps:6.2f}s  +{s['duration'] / fps:5.2f}s")


if __name__ == "__main__":
    main()
