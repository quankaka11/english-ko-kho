// Logo "English Ko Khó". Điểm nhấn là chữ "Ko" cách điệu:
// sticker vàng nghiêng, chữ "o" là bong bóng thoại màu cam (= nói tiếng Anh),
// có tia sáng nhỏ (= "à, hiểu rồi!").
import { C, FONT } from "../brand";

type MarkProps = {
  size?: number;
  /** Vị trí khi lồng trong một SVG khác. */
  x?: number;
  y?: number;
  /** Ẩn khung sticker (dùng khi đặt trên nền đã có màu). */
  bare?: boolean;
};

/** Chữ "Ko" cách điệu – dùng làm icon, watermark, avatar. Tỉ lệ 1:1. */
export const KoMark: React.FC<MarkProps> = ({ size = 240, bare = false, x, y }) => (
  <svg x={x} y={y} width={size} height={size} viewBox="0 0 240 240" style={{ overflow: "visible" }}>
    <g style={{ transformOrigin: "120px 120px", rotate: "-6deg" }}>
      {!bare && (
        <>
          {/* Bóng đổ lệch kiểu sticker */}
          <rect x={18} y={30} width={214} height={196} rx={46} fill={C.ink} />
          <rect x={10} y={20} width={214} height={196} rx={46} fill={C.accent} stroke={C.ink} strokeWidth={8} />
        </>
      )}
      {/* K */}
      <text
        x={26}
        y={172}
        fontFamily={FONT.display}
        fontWeight={800}
        fontSize={158}
        fill={C.ink}
        style={{ letterSpacing: -4 }}
      >
        K
      </text>
      {/* o = bong bóng thoại */}
      <g>
        <path d="M146 172 L132 202 L166 184 Z" fill={C.prefix} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={174} cy={134} r={33} fill="none" stroke={C.ink} strokeWidth={30} />
        <circle cx={174} cy={134} r={33} fill="none" stroke={C.prefix} strokeWidth={18} />
      </g>
      {/* Tia sáng */}
      <g fill={C.card} stroke={C.ink} strokeWidth={4} strokeLinejoin="round">
        <path d="M206 58 L212 74 L228 80 L212 86 L206 102 L200 86 L184 80 L200 74 Z" />
      </g>
    </g>
  </svg>
);

type WordmarkProps = {
  width?: number;
  /** Màu chữ cho nền tối. */
  inverted?: boolean;
};

/** Logo đầy đủ: "English" ở trên, sticker "Ko" + "Khó" ở dưới. Tỉ lệ 2:1. */
export const Wordmark: React.FC<WordmarkProps> = ({ width = 800, inverted = false }) => {
  const ink = inverted ? C.card : C.ink;
  return (
    <svg width={width} height={width / 2} viewBox="0 0 800 400" style={{ overflow: "visible" }}>
      <text x={40} y={118} fontFamily={FONT.display} fontWeight={800} fontSize={120} fill={C.root}>
        English
      </text>
      <KoMark x={20} y={130} size={250} />
      <text x={300} y={340} fontFamily={FONT.display} fontWeight={800} fontSize={190} fill={ink}>
        Khó
      </text>
      {/* Gạch chân nhẹ dưới "Khó" như nét bút dạ */}
      <path d="M306 362 Q470 380 640 356" fill="none" stroke={C.prefix} strokeWidth={12} strokeLinecap="round" />
    </svg>
  );
};
