import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { useVideoConfig } from "remotion";
import { Intro } from "./Intro";
import { Steps } from "./Steps";

export const MyComponent = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Abertura" durationInFrames={4 * fps}>
        <Intro
          title="Vídeos com código"
          subtitle="Feito com React + Remotion"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 0.5 * fps })}
      />
      <TransitionSeries.Sequence name="Passos" durationInFrames={5 * fps}>
        <Steps
          heading="Como funciona"
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 0.5 * fps })}
      />
      <TransitionSeries.Sequence name="Encerramento" durationInFrames={4 * fps}>
        <Intro
          title="Agora é sua vez!"
          subtitle="remotion.dev"
          style={{
            background: "linear-gradient(135deg, #4c1d95 0%, #0f172a 100%)",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
