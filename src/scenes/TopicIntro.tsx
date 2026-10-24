import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp, pop } from "../anim";
import { C, FONT } from "../brand";
import { formatOf } from "../formats";
import { LAYOUT } from "../layout";
import type { Episode, Scene } from "../types";

/** Giới thiệu chủ đề cho các dạng không phải gốc từ: nhãn dạng tập, emoji, tiêu đề, phụ đề. */
export const TopicIntro: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const topic = episode.topic;
  if (!topic) return null;
  const clip = scene.clips[0];
  const subAt = clip ? clip.from + Math.round(clip.duration * 0.5) : 30;
  const len = topic.title.length;

  return (
    <AbsoluteFill
      style={{
        top: LAYOUT.contentTop,
        height: LAYOUT.contentBottom - LAYOUT.contentTop,
        padding: `0 ${LAYOUT.pad}px`,
        alignItems: "center",
        fontFamily: FONT.body,
        color: C.ink,
        textAlign: "center",
      }}
    >
      <div
        style={{
          ...fadeUp(frame, 0),
          fontWeight: 800,
          fontSize: 40,
          background: C.ink,
          color: C.card,
          borderRadius: 999,
          padding: "8px 30px",
          letterSpacing: 2,
        }}
      >
        {formatOf(episode.format).label}
      </div>
      {topic.emoji && <div style={{ marginTop: 24, fontSize: 140, scale: `${pop(frame, fps, 2, 9)}` }}>{topic.emoji}</div>}
      <div
        style={{
          marginTop: 10,
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: len > 14 ? 100 : len > 10 ? 124 : 150,
          lineHeight: 1.05,
          color: C.root,
          textShadow: `7px 9px 0 ${C.ink}`,
          scale: `${pop(frame, fps, 6, 10)}`,
        }}
      >
        {topic.title}
      </div>
      {topic.subtitle_vi && (
        <div
          style={{
            ...fadeUp(frame, subAt),
            marginTop: 34,
            fontSize: 46,
            fontWeight: 700,
            background: C.accent,
            border: `5px solid ${C.ink}`,
            borderRadius: 28,
            padding: "8px 30px",
          }}
        >
          {topic.subtitle_vi}
        </div>
      )}
    </AbsoluteFill>
  );
};
