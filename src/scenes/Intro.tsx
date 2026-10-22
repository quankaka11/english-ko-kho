import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, pop } from "../anim";
import { C } from "../brand";
import { Capi } from "../brand/Capi";
import { Wordmark } from "../brand/Logo";
import { Background } from "../components/Background";

/** Brand sting ~1.3 s: logo bật ra, Capi nhảy lên vẫy tay, tia sáng toả ra. */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const logo = pop(frame, fps, 0, 9);
  const capi = pop(frame, fps, 5, 10);
  const out = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Background color={C.accent} dot="#FFD866" />
      {/* Tia sáng */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: -220 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 18,
              height: interpolate(frame, [0, 14], [0, 260], clamp),
              background: C.card,
              borderRadius: 9,
              opacity: interpolate(frame, [8, 30], [1, 0], clamp),
              rotate: `${i * 30}deg`,
              translate: `0px ${-interpolate(frame, [0, 20], [200, 420], clamp)}px`,
              transformOrigin: "center",
            }}
          />
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: -220 }}>
        <div style={{ scale: `${logo}`, rotate: `${interpolate(logo, [0, 1], [-14, 0])}deg` }}>
          <Wordmark width={900} />
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 340,
          top: 1080,
          translate: `0px ${interpolate(capi, [0, 1], [600, 0])}px`,
        }}
      >
        <Capi size={400} pose="wave" talking={false} />
      </div>
    </AbsoluteFill>
  );
};
