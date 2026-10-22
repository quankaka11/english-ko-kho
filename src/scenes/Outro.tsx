import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, fadeUp, pop, pulse } from "../anim";
import { brand, C, FONT } from "../brand";
import { Capi } from "../brand/Capi";
import { KoMark, Wordmark } from "../brand/Logo";
import { Background } from "../components/Background";

/**
 * Outro kêu gọi theo dõi: logo, Capi vẫy tay, thẻ kênh có nút "Theo dõi"
 * tự bấm -> "Đã theo dõi ✓" (gợi hành động cho người xem làm theo).
 */
export const Outro: React.FC<{ talking: boolean }> = ({ talking }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pressAt = Math.round(durationInFrames * 0.55);
  const pressed = frame >= pressAt + 3;
  const press = interpolate(frame, [pressAt, pressAt + 3, pressAt + 8], [1, 0.86, 1], clamp);
  const o = brand.outro;

  return (
    <AbsoluteFill style={{ fontFamily: FONT.body, color: C.ink, alignItems: "center" }}>
      <Background color={C.accent} dot="#FFD866" />
      <div style={{ position: "absolute", top: 250, scale: `${pop(frame, fps, 0, 10)}` }}>
        <Wordmark width={720} />
      </div>
      <div
        style={{
          ...fadeUp(frame, 6),
          position: "absolute",
          top: 640,
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 92,
          textAlign: "center",
        }}
      >
        {o.title}
      </div>

      {/* Thẻ kênh + nút theo dõi */}
      <div
        style={{
          ...fadeUp(frame, 10),
          position: "absolute",
          top: 780,
          width: 900,
          background: C.card,
          border: `6px solid ${C.ink}`,
          borderRadius: 44,
          boxShadow: `10px 12px 0 ${C.ink}`,
          padding: "28px 34px",
          display: "flex",
          alignItems: "center",
          gap: 26,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            background: C.bg,
            border: `5px solid ${C.ink}`,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <Capi size={130} headOnly still />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 48, lineHeight: 1, whiteSpace: "nowrap" }}>
            {brand.channel.name}
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: C.inkSoft, marginTop: 8 }}>{brand.channel.handle}</div>
        </div>
        <div
          style={{
            scale: `${pressed ? 1 : press * pulse(frame, 20, 0.04)}`,
            background: pressed ? C.suffix : C.danger,
            color: C.card,
            fontWeight: 800,
            fontSize: 36,
            borderRadius: 24,
            padding: "16px 22px",
            border: `5px solid ${C.ink}`,
            whiteSpace: "nowrap",
          }}
        >
          {pressed ? "✓ Đã theo dõi" : "+ Theo dõi"}
        </div>
      </div>
      {/* Ngón tay bấm nút */}
      <div
        style={{
          position: "absolute",
          top: interpolate(frame, [pressAt - 14, pressAt], [1120, 920], clamp),
          left: 830,
          fontSize: 110,
          opacity: interpolate(frame, [pressAt - 14, pressAt - 8, pressAt + 14, pressAt + 20], [0, 1, 1, 0], clamp),
          rotate: "-20deg",
        }}
      >
        👆
      </div>

      <div style={{ ...fadeUp(frame, 16), position: "absolute", top: 1060, fontSize: 44, fontWeight: 700 }}>
        {o.subtitle}
      </div>
      <div style={{ position: "absolute", top: 1150, left: 120 }}>
        <Capi size={330} pose="wave" talking={talking} />
      </div>
      <div style={{ position: "absolute", top: 1230, right: 150, rotate: "8deg", scale: `${pop(frame, fps, 14)}` }}>
        <KoMark size={200} />
      </div>
    </AbsoluteFill>
  );
};
