import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp, pop } from "../anim";
import { C, FONT } from "../brand";
import { LAYOUT } from "../layout";
import type { Episode, Scene } from "../types";

/** Giới thiệu gốc: -SPECT- to giữa màn hình, nguồn gốc, rồi nghĩa. */
export const RootIntro: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { root } = episode;
  const clip = scene.clips[0];
  const meaningAt = clip ? clip.from + Math.round(clip.duration * 0.6) : 30;

  return (
    <AbsoluteFill
      style={{
        top: LAYOUT.contentTop,
        height: LAYOUT.contentBottom - LAYOUT.contentTop,
        alignItems: "center",
        fontFamily: FONT.body,
        color: C.ink,
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
        GỐC TỪ HÔM NAY
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: root.text.length > 6 ? 170 : 220,
          lineHeight: 1.1,
          color: C.root,
          scale: `${pop(frame, fps, 4, 9)}`,
          textShadow: `8px 10px 0 ${C.ink}`,
        }}
      >
        -{root.text}-
      </div>
      <div style={{ ...fadeUp(frame, 14), fontSize: 46, fontWeight: 600, color: C.inkSoft }}>
        Nguồn gốc: <i>{root.origin}</i>
      </div>
      <div
        style={{
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 30,
          scale: `${pop(frame, fps, meaningAt)}`,
        }}
      >
        {root.emoji && <span style={{ fontSize: 150 }}>{root.emoji}</span>}
        <span
          style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 120,
            background: C.accent,
            border: `6px solid ${C.ink}`,
            borderRadius: 36,
            padding: "0 36px",
          }}
        >
          = {root.meaning_vi}
        </span>
      </div>
    </AbsoluteFill>
  );
};
