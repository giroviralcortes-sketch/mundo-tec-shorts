import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily } from "./fonts";

type Props = {
  readonly heading: string;
};

const cardStyle: React.CSSProperties = {
  width: 460,
  height: 420,
  borderRadius: 40,
  background: "rgba(255,255,255,0.08)",
  border: "2px solid rgba(255,255,255,0.18)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 28,
  fontFamily,
  color: "white",
};

const StepsInner = ({ heading }: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <Interactive.Div
        name="Heading"
        style={{
          position: "absolute",
          top: 140,
          fontFamily,
          fontWeight: 800,
          fontSize: 96,
          color: "white",
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {heading}
      </Interactive.Div>
      <div style={{ display: "flex", gap: 60, marginTop: 120 }}>
        <Interactive.Div
          name="Card 1"
          style={{
            ...cardStyle,
            opacity: interpolate(frame, [0.4 * fps, 1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0.4 * fps, 1.2 * fps], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 12 }),
              output: "perceptual-scale",
            }),
          }}
        >
          <div style={{ fontSize: 140 }}>⌨️</div>
          <div style={{ fontSize: 60, fontWeight: 800 }}>1. Codifique</div>
        </Interactive.Div>
        <Interactive.Div
          name="Card 2"
          style={{
            ...cardStyle,
            opacity: interpolate(frame, [0.9 * fps, 1.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0.9 * fps, 1.7 * fps], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 12 }),
              output: "perceptual-scale",
            }),
          }}
        >
          <div style={{ fontSize: 140 }}>👀</div>
          <div style={{ fontSize: 60, fontWeight: 800 }}>2. Visualize</div>
        </Interactive.Div>
        <Interactive.Div
          name="Card 3"
          style={{
            ...cardStyle,
            opacity: interpolate(frame, [1.4 * fps, 2 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [1.4 * fps, 2.2 * fps], [0.7, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 12 }),
              output: "perceptual-scale",
            }),
          }}
        >
          <div style={{ fontSize: 140 }}>🎬</div>
          <div style={{ fontSize: 60, fontWeight: 800 }}>3. Renderize</div>
        </Interactive.Div>
      </div>
    </>
  );
};

export const Steps = Interactive.create({
  Component: StepsInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    heading: { type: "string", default: "", description: "Cabeçalho" },
  },
});
