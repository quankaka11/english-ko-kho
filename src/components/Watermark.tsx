import { brand, C, FONT } from "../brand";
import { KoMark } from "../brand/Logo";
import { LAYOUT } from "../layout";

/** Watermark góc trên trái: mark "Ko" + handle. Hiện suốt video trừ intro/outro. */
export const Watermark: React.FC<{ opacity?: number }> = ({ opacity = brand.watermark.opacity }) => (
  <div
    style={{
      position: "absolute",
      top: LAYOUT.watermarkTop,
      left: LAYOUT.pad - 8,
      display: "flex",
      alignItems: "center",
      gap: 14,
      opacity,
    }}
  >
    <KoMark size={78} />
    {brand.watermark.show_handle && (
      <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: C.ink, letterSpacing: 0.5 }}>
        {brand.channel.handle}
      </span>
    )}
  </div>
);
