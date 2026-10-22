import { AbsoluteFill, Composition } from "remotion";
import { C, FONT, FPS, H, W, brand } from "./brand";

const Placeholder: React.FC = () => (
  <AbsoluteFill
    style={{
      background: C.bg,
      color: C.ink,
      fontFamily: FONT.display,
      fontSize: 120,
      fontWeight: 800,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {brand.channel.name}
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition id="Placeholder" component={Placeholder} width={W} height={H} fps={FPS} durationInFrames={FPS} />
);
