import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp, pop } from "../anim";
import { C, FONT } from "../brand";
import { PART_COLOR, WordParts } from "../components/WordParts";
import { LAYOUT } from "../layout";
import { clipStart, type Episode, type Scene, type Word } from "../types";

/** Tô màu từ cần học trong câu ví dụ (khớp theo phần đầu của từ để bắt cả inspected, prospects...). */
const Highlighted: React.FC<{ sentence: string; word: Word }> = ({ sentence, word }) => {
  const stem = word.word.toLowerCase().slice(0, Math.max(4, word.word.length - 2));
  return (
    <>
      {sentence.split(/(\s+)/).map((tok, i) =>
        tok.toLowerCase().replace(/[^a-z]/g, "").startsWith(stem) ? (
          <b key={i} style={{ color: C.root, background: `${C.accent}66`, borderRadius: 8, padding: "0 4px" }}>
            {tok}
          </b>
        ) : (
          <span key={i}>{tok}</span>
        ),
      )}
    </>
  );
};

/** Một từ: ghép mảnh có màu + nghĩa từng mảnh, IPA, nghĩa, câu ví dụ. */
export const WordCard: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = scene.data.index ?? 0;
  const total = scene.data.total ?? episode.words.length;
  const w = episode.words[index];
  const parts = w.parts.map((p) => (p.type === "root" && !p.meaning_vi ? { ...p, meaning_vi: episode.root.meaning_vi } : p));

  const tWord = clipStart(scene, "_word");
  const voClip = scene.clips.find((c) => c.id.endsWith("_vo"));
  const tMeaning = voClip ? voClip.from + Math.round(voClip.duration * 0.55) : 40;
  const tEx = clipStart(scene, "_ex");
  const big = w.word.length > 10 ? 112 : 140;

  return (
    <AbsoluteFill
      style={{
        top: LAYOUT.contentTop,
        height: LAYOUT.contentBottom - LAYOUT.contentTop,
        padding: `0 ${LAYOUT.pad}px`,
        alignItems: "center",
        fontFamily: FONT.body,
        color: C.ink,
      }}
    >
      {/* Tiến độ: Từ 3/8 + chấm */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, alignSelf: "stretch", justifyContent: "flex-end" }}>
        {w.mnemonic && (
          <span
            style={{
              marginRight: "auto",
              fontSize: 32,
              fontWeight: 700,
              background: C.card,
              border: `4px solid ${C.ink}`,
              borderRadius: 999,
              padding: "4px 18px",
            }}
          >
            💡 mẹo nhớ
          </span>
        )}
        <span style={{ fontSize: 36, fontWeight: 800 }}>
          Từ {index + 1}/{total}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: i <= index ? C.root : C.card,
                border: `3px solid ${C.ink}`,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 34 }}>
        <WordParts parts={parts} fontSize={big} revealFrom={tWord} stagger={8} labels />
      </div>

      <div style={{ ...fadeUp(frame, tWord + 12), marginTop: 18, display: "flex", gap: 20, alignItems: "center" }}>
        <span style={{ fontFamily: FONT.ipa, fontSize: 48, color: C.inkSoft }}>{w.ipa}</span>
        <span
          style={{ fontSize: 34, fontWeight: 800, color: C.card, background: C.ink, borderRadius: 12, padding: "2px 14px" }}
        >
          {w.pos}
        </span>
      </div>

      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "center",
          gap: 20,
          scale: `${pop(frame, fps, tMeaning)}`,
        }}
      >
        {w.emoji && <span style={{ fontSize: 90 }}>{w.emoji}</span>}
        <span
          style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: w.meaning_vi.length > 18 ? 62 : 80,
            lineHeight: 1.1,
            background: C.accent,
            border: `5px solid ${C.ink}`,
            borderRadius: 28,
            padding: "4px 28px",
            textAlign: "center",
          }}
        >
          {w.meaning_vi}
        </span>
      </div>
      {w.note_vi && (
        <div style={{ ...fadeUp(frame, tMeaning + 10), marginTop: 14, fontSize: 32, fontWeight: 700, color: C.danger }}>
          ⚠️ {w.note_vi}
        </div>
      )}

      <div
        style={{
          ...fadeUp(frame, tEx),
          position: "absolute",
          bottom: 0,
          left: LAYOUT.pad,
          right: LAYOUT.pad,
          background: C.card,
          border: `5px solid ${C.ink}`,
          borderLeft: `18px solid ${PART_COLOR.root}`,
          borderRadius: 30,
          padding: "20px 30px",
        }}
      >
        <div style={{ fontSize: 46, fontWeight: 600, lineHeight: 1.3 }}>
          <Highlighted sentence={w.example_en} word={w} />
        </div>
        {w.example_vi && <div style={{ fontSize: 34, color: C.inkSoft, marginTop: 6 }}>{w.example_vi}</div>}
      </div>
    </AbsoluteFill>
  );
};
