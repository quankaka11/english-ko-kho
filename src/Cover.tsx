// Ảnh bìa từng tập (1080×1920) để chọn làm cover TikTok / thumbnail Shorts.
// Lưới hồ sơ TikTok cắt cover còn 3:4 ở giữa (y ≈ 240–1680) nên mọi chữ nằm trong vùng đó.
import { AbsoluteFill } from "remotion";
import { C, FONT } from "./brand";
import { Capi } from "./brand/Capi";
import { KoMark } from "./brand/Logo";
import { Background } from "./components/Background";
import { WordParts } from "./components/WordParts";
import type { EpisodeVideoProps } from "./EpisodeVideo";
import { headlineOf } from "./formats";

export const Cover: React.FC<EpisodeVideoProps> = ({ data }) => {
  if (!data) return null;
  const ep = data.episode;
  const head = headlineOf(ep);
  const headSize = ep.root ? (head.length > 8 ? 200 : 260) : head.length > 18 ? 110 : head.length > 12 ? 130 : 160;
  return (
    <AbsoluteFill style={{ fontFamily: FONT.body, color: C.ink, alignItems: "center" }}>
      <Background />
      <div style={{ position: "absolute", top: 300, display: "flex", alignItems: "center", gap: 20 }}>
        <KoMark size={110} />
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 56 }}>Tập {ep.episode}</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 460,
          height: 280,
          width: 980,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: headSize,
          lineHeight: 1,
          color: C.root,
          textShadow: `10px 12px 0 ${C.ink}`,
        }}
      >
        {head}
      </div>
      <div
        style={{
          position: "absolute",
          top: 780,
          width: 960,
          textAlign: "center",
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.1,
        }}
      >
        <span style={{ background: `linear-gradient(transparent 55%, ${C.accent} 55%)`, padding: "0 10px" }}>
          {ep.hook.on_screen}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1030,
          width: 980,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "14px 18px",
        }}
      >
        {ep.words.slice(0, 6).map((w) => (
          <div
            key={w.word}
            style={{ background: C.card, border: `4px solid ${C.ink}`, borderRadius: 22, padding: "2px 18px" }}
          >
            <WordParts parts={w.parts} fontSize={62} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1290 }}>
        <Capi size={330} pose="point" still />
      </div>
    </AbsoluteFill>
  );
};
