import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import data from "./data.json";
import { Scene, SceneView } from "./Scenes";
import { C, fontFamily, HANDLE, SAFE, Word } from "./theme";

export type ShortData = { id: string; titulo: string; scenes: Scene[] };
export const SHORTS = data as unknown as ShortData[];

const PAD_SEC = 0.35;
export const sceneFrames = (s: Scene, fps: number) => Math.ceil((s.audioSec + PAD_SEC) * fps);
export const totalFrames = (v: ShortData, fps: number) => v.scenes.reduce((a, s) => a + sceneFrames(s, fps), 0);

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "90px 90px",
          opacity: 0.25,
          translate: `0px ${(frame * 0.6) % 90}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 40% at 50% 35%, rgba(34,211,238,0.22), transparent 70%), radial-gradient(50% 30% at 80% 90%, rgba(250,204,21,0.10), transparent 70%)",
        }}
      />
    </AbsoluteFill>
  );
};

const TopBar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, height: 12, width: `${(frame / total) * 100}%`, background: C.yellow }} />
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontWeight: 700,
          fontSize: 36,
          color: C.muted,
          letterSpacing: 1,
        }}
      >
        📱 {HANDLE}
      </div>
    </>
  );
};

// Legenda animada: blocos de até 3 palavras, palavra falada em amarelo.
// A voz não devolve pontuação: ela é lida do texto do roteiro (`vo`) para
// quebrar os blocos no fim de cada frase.
const punctAfter = (words: Word[], vo: string): boolean[] => {
  let pos = 0;
  return words.map((w) => {
    const at = vo.indexOf(w.text, pos);
    if (at < 0) return false;
    pos = at + w.text.length;
    return /^[.,!?:;]/.test(vo.slice(pos));
  });
};

const Captions: React.FC<{ words: Word[]; vo: string }> = ({ words, vo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const brk = punctAfter(words, vo);
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    if (cur.length >= 3 || brk[i] || /[.,!?:]$/.test(w.text)) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  const idx = chunks.findIndex((c, i) => ms < (chunks[i + 1]?.[0].startMs ?? Infinity) && ms >= c[0].startMs - 80);
  const chunk = chunks[idx];
  if (!chunk) return null;
  const start = ((chunk[0].startMs - 80) / 1000) * fps;
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.captionTop,
        left: SAFE.side,
        right: SAFE.side,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0 22px",
        fontFamily,
        fontWeight: 900,
        fontSize: 76,
        textTransform: "uppercase",
        textAlign: "center",
        scale: interpolate(frame, [start, start + 5], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}
    >
      {chunk.map((w, i) => {
        const on = ms >= w.startMs && ms < w.endMs + 30;
        return (
          <span
            key={i}
            style={{
              color: on ? C.yellow : "white",
              WebkitTextStroke: "3px #000",
              paintOrder: "stroke",
              textShadow: "0 8px 24px rgba(0,0,0,0.8)",
            }}
          >
            {w.text.replace(/[.,!?:]$/, "")}
          </span>
        );
      })}
    </div>
  );
};

export const Short: React.FC<{ videoId: string }> = ({ videoId }) => {
  const { fps } = useVideoConfig();
  const v = SHORTS.find((x) => x.id === videoId);
  if (!v) return <AbsoluteFill style={{ background: "red" }} />;
  const total = totalFrames(v, fps);
  let from = 0;
  return (
    <AbsoluteFill>
      <Background />
      {v.scenes.map((s, i) => {
        const dur = sceneFrames(s, fps);
        const seq = (
          <Sequence key={i} name={`Cena ${i + 1}: ${s.type}`} from={from} durationInFrames={dur}>
            <Audio src={staticFile(s.audio)} />
            <AbsoluteFill
              style={{
                top: SAFE.contentTop,
                height: SAFE.contentBottom - SAFE.contentTop,
                left: SAFE.side,
                right: SAFE.side,
                width: "auto",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SceneView s={s} dur={dur} />
            </AbsoluteFill>
            <Captions words={s.words} vo={s.vo} />
          </Sequence>
        );
        from += dur;
        return seq;
      })}
      <TopBar total={total} />
    </AbsoluteFill>
  );
};
