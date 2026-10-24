import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { fadeUp, pop } from "../anim";
import { C, FONT } from "../brand";
import { contentFrame, ExampleBox, Progress } from "../components/CardParts";
import { PART_COLOR, WordParts } from "../components/WordParts";
import { clipStart, type Episode, type Part, type Scene } from "../types";

/** Tô màu từng chữ Hán Việt theo mảnh tiếng Anh tương ứng (meaning_vi của mảnh), kể cả khi đảo thứ tự. */
const HanViet: React.FC<{ text: string; parts: Part[]; fontSize: number }> = ({ text, parts, fontSize }) => {
  const lower = text.toLowerCase();
  const ranges = parts
    .filter((p) => p.meaning_vi)
    .map((p) => ({ start: lower.indexOf(p.meaning_vi!.toLowerCase()), len: p.meaning_vi!.length, color: PART_COLOR[p.type] }))
    .filter((r) => r.start >= 0)
    .sort((a, b) => a.start - b.start);
  const out: React.ReactNode[] = [];
  let pos = 0;
  ranges.forEach((r, i) => {
    if (r.start < pos) return; // chồng lấn: bỏ
    if (r.start > pos) out.push(<span key={`t${i}`}>{text.slice(pos, r.start)}</span>);
    out.push(
      <span key={i} style={{ color: r.color }}>
        {text.slice(r.start, r.start + r.len)}
      </span>,
    );
    pos = r.start + r.len;
  });
  if (pos < text.length) out.push(<span key="end">{text.slice(pos)}</span>);
  return (
    <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize, lineHeight: 1.1, color: C.ink }}>{out}</span>
  );
};

/** Hán Việt: mảnh tiếng Anh có nhãn chữ Hán Việt → mũi tên → từ Hán Việt cùng màu → câu ví dụ. */
export const SinoCard: React.FC<{ scene: Scene; episode: Episode }> = ({ scene, episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = scene.data.index ?? 0;
  const total = scene.data.total ?? episode.words.length;
  const w = episode.words[index];
  const hv = w.han_viet ?? w.meaning_vi;

  const tWord = clipStart(scene, "_word");
  const voClip = scene.clips.find((c) => c.id.endsWith("_vo"));
  const tHv = voClip ? voClip.from + Math.round(voClip.duration * 0.75) : 60;
  const tEx = clipStart(scene, "_ex");
  const big = w.word.length > 10 ? 100 : 124;

  return (
    <AbsoluteFill style={contentFrame}>
      <Progress index={index} total={total} badge={w.mnemonic ? "💡 mẹo nhớ" : undefined} />

      <div style={{ marginTop: 24 }}>
        <WordParts parts={w.parts} fontSize={big} revealFrom={tWord} stagger={8} labels />
      </div>
      <div style={{ ...fadeUp(frame, tWord + 12), fontFamily: FONT.ipa, fontSize: 40, color: C.inkSoft }}>{w.ipa}</div>

      <div style={{ ...fadeUp(frame, tHv - 6), fontSize: 60, lineHeight: 1, marginTop: 6 }}>⇣</div>
      <div
        style={{
          marginTop: 6,
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: C.card,
          border: `6px solid ${C.ink}`,
          borderRadius: 32,
          padding: "6px 36px",
          boxShadow: `8px 10px 0 ${C.ink}`,
          scale: `${pop(frame, fps, tHv)}`,
        }}
      >
        {w.emoji && <span style={{ fontSize: 80 }}>{w.emoji}</span>}
        <HanViet text={hv} parts={w.parts} fontSize={hv.length > 12 ? 84 : 104} />
      </div>
      {w.meaning_vi.toLowerCase() !== hv.toLowerCase() && (
        <div style={{ ...fadeUp(frame, tHv + 10), marginTop: 16, fontSize: 40, fontWeight: 700, color: C.inkSoft }}>
          = {w.meaning_vi}
        </div>
      )}

      <ExampleBox word={w} from={tEx} />
    </AbsoluteFill>
  );
};
