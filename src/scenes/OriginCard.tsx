import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, fadeUp, pop } from "../anim";
import { C, FONT } from "../brand";
import { contentFrame, ExampleBox, IpaPos, MeaningTag, Progress } from "../components/CardParts";
import { WordParts } from "../components/WordParts";
import { clipStart, type Episode, type Scene } from "../types";

/** Nguồn gốc bất ngờ: từ → thẻ "Nguồn gốc" → (Xưa → Nay) → nghĩa → câu ví dụ. */
export const OriginCard: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = scene.data.index ?? 0;
  const total = scene.data.total ?? episode.words.length;
  const w = episode.words[index];

  const tWord = clipStart(scene, "_word");
  const voClip = scene.clips.find((c) => c.id.endsWith("_vo"));
  const tOrigin = voClip ? voClip.from + Math.round(voClip.duration * 0.2) : 30;
  const tMeaning = voClip ? voClip.from + Math.round(voClip.duration * 0.7) : 60;
  const tEx = clipStart(scene, "_ex");
  const big = w.word.length > 10 ? 96 : 112;

  return (
    <AbsoluteFill style={contentFrame}>
      <Progress index={index} total={total} badge={w.mnemonic ? "💡 mẹo nhớ" : undefined} />

      <div style={{ marginTop: 10 }}>
        <WordParts parts={w.parts} fontSize={big} revealFrom={tWord} stagger={8} />
      </div>
      <IpaPos word={w} from={tWord + 12} />

      {w.origin_vi && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: C.card,
            border: `5px solid ${C.ink}`,
            borderRadius: 26,
            padding: "6px 24px",
            boxShadow: `6px 8px 0 ${C.ink}`,
            scale: `${pop(frame, fps, tOrigin)}`,
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 800, color: C.card, background: C.prefix, borderRadius: 12, padding: "2px 12px" }}>
            GỐC
          </span>
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 54, color: C.prefix }}>{w.origin_vi}</span>
        </div>
      )}

      {w.then_vi ? (
        // Xưa → Nay: nghĩa cũ bị gạch đi, nghĩa mới bật ra
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ ...fadeUp(frame, tOrigin + 10), fontSize: 44, fontWeight: 700, color: C.inkSoft, position: "relative" }}>
            Xưa: {w.then_vi}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "52%",
                height: 6,
                borderRadius: 3,
                background: C.danger,
                width: `${interpolate(frame, [tMeaning - 8, tMeaning], [0, 100], clamp)}%`,
              }}
            />
          </div>
          <MeaningTag text={`Nay: ${w.meaning_vi}`} size={64} style={{ scale: `${pop(frame, fps, tMeaning)}` }} />
        </div>
      ) : (
        <MeaningTag text={w.meaning_vi} emoji={w.emoji} size={68} style={{ marginTop: 18, scale: `${pop(frame, fps, tMeaning)}` }} />
      )}

      <ExampleBox word={w} from={tEx} compact />
    </AbsoluteFill>
  );
};
