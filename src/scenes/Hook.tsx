import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, fadeUp, pop } from "../anim";
import { C, FONT } from "../brand";
import { WordParts } from "../components/WordParts";
import { LAYOUT } from "../layout";
import type { Episode, Scene } from "../types";

/** 0–3 s: tất cả từ bay vào, sau đó mảnh gốc sáng lên – câu hỏi gây tò mò. */
export const Hook: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glowAt = Math.round(scene.duration * 0.55);
  const glow = interpolate(frame, [glowAt, glowAt + 8], [0, 1], clamp);
  const words = episode.words;
  const size = words.length > 6 ? 76 : 92;

  return (
    <AbsoluteFill style={{ top: LAYOUT.contentTop, height: LAYOUT.contentBottom - LAYOUT.contentTop, padding: `0 ${LAYOUT.pad}px` }}>
      <div
        style={{
          ...fadeUp(frame, 0),
          alignSelf: "center",
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 84,
          color: C.ink,
          textAlign: "center",
          lineHeight: 1.1,
          background: `linear-gradient(transparent 58%, ${C.accent} 58%)`,
          padding: "0 16px",
        }}
      >
        {episode.hook.on_screen}
      </div>
      <div
        style={{
          marginTop: 40,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "22px 24px",
        }}
      >
        {words.map((w, i) => {
          const s = pop(frame, fps, 3 + i * 3);
          return (
            <div
              key={w.word}
              style={{
                opacity: s,
                translate: `0px ${interpolate(s, [0, 1], [-160, 0])}px`,
                rotate: `${interpolate(s, [0, 1], [i % 2 ? 12 : -12, 0])}deg`,
                background: C.card,
                border: `5px solid ${C.ink}`,
                borderRadius: 28,
                padding: "6px 22px",
                boxShadow: `6px 8px 0 ${C.ink}`,
                scale: `${1 + glow * 0.04 * Math.sin((frame + i * 5) / 3)}`,
              }}
            >
              <WordParts parts={w.parts} fontSize={size} rootOnly={glow < 0.5} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
