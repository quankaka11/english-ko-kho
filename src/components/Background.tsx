import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../brand";

/** Nền kem chấm bi trôi chậm – có chuyển động nhẹ nhưng không gây rối mắt. */
export const Background: React.FC<{ color?: string; dot?: string }> = ({ color = C.bg, dot = C.bgAlt }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        backgroundImage: `radial-gradient(${dot} 5px, transparent 5px)`,
        backgroundSize: "54px 54px",
        backgroundPosition: `${frame * 0.4}px ${frame * 0.25}px`,
      }}
    />
  );
};
