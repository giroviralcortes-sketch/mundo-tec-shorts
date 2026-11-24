import { Composition, Folder } from "remotion";
import { MyComponent } from "./Composition";
import { Intro } from "./Intro";
import { Steps } from "./Steps";
import { Short, SHORTS, totalFrames } from "./shorts/Short";

// 4s + 5s + 4s - 2 × 0.5s de transição = 12s = 360 frames a 30fps
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vídeos curtos verticais gerados a partir de marketing/semana-XX/roteiros.json */}
      <Folder name="Shorts">
        {SHORTS.map((v) => (
          <Composition
            key={v.id}
            id={v.id}
            component={Short}
            durationInFrames={totalFrames(v, 30)}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ videoId: v.id }}
          />
        ))}
      </Folder>
      <Composition
        id="VideoComCodigo"
        component={MyComponent}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="Cenas">
        <Composition
          id="Intro"
          component={Intro}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            title: "Vídeos com código",
            subtitle: "Feito com React + Remotion",
            style: {
              background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            },
          }}
        />
        <Composition
          id="Steps"
          component={Steps}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            heading: "Como funciona",
            style: {
              background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
      </Folder>
    </>
  );
};
