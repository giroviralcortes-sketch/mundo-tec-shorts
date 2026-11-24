import { loadFont } from "@remotion/google-fonts/Inter";
import { Easing, interpolate } from "remotion";

export const { fontFamily } = loadFont("normal", {
  weights: ["500", "700", "800", "900"],
  subsets: ["latin"],
});

export const C = {
  bg: "#070b14",
  card: "rgba(255,255,255,0.06)",
  line: "rgba(255,255,255,0.14)",
  text: "#f8fafc",
  muted: "#94a3b8",
  accent: "#22d3ee",
  yellow: "#facc15",
  red: "#f43f5e",
  green: "#22c55e",
};

export const HANDLE = "@marcelocardosotech";

// Layout 1080x1920 com áreas seguras para a interface do Reels/TikTok/Shorts.
export const SAFE = {
  contentTop: 270,
  contentBottom: 1340,
  captionTop: 1390,
  side: 80,
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Entrada padrão: aparece com mola a partir de `start` (frames).
export const pop = (frame: number, start: number, dist = 60) => ({
  opacity: interpolate(frame, [start, start + 8], [0, 1], clamp),
  scale: interpolate(frame, [start, start + 14], [0.85, 1], {
    ...clamp,
    easing: Easing.spring({ damping: 14 }),
  }),
  translate: interpolate(frame, [start, start + 14], [`0px ${dist}px`, "0px 0px"], {
    ...clamp,
    easing: Easing.spring({ damping: 200 }),
  }),
});

export const fadeIn = (frame: number, start: number, len = 8) =>
  interpolate(frame, [start, start + len], [0, 1], clamp);

export const progress = (frame: number, start: number, len: number) =>
  interpolate(frame, [start, start + len], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

export type Word = { text: string; startMs: number; endMs: number };

// Encontra o frame em que cada item é falado na narração (pela 1ª palavra
// significativa do item). Se não achar, distribui igualmente.
export const cueFrames = (
  items: string[],
  words: Word[],
  fps: number,
  durationInFrames: number,
  firstAt = 10,
): number[] => {
  const stop = new Set(["a", "o", "e", "de", "da", "do", "no", "na", "em", "um", "uma", "so", "1", "2", "3"]);
  let cursor = 0;
  return items.map((item, i) => {
    const fallback = Math.round(firstAt + (i * (durationInFrames * 0.8 - firstAt)) / Math.max(1, items.length));
    const keys = item.split(/\s+/).map(norm).filter((k) => k.length > 1 && !stop.has(k));
    for (const key of keys.slice(0, 2)) {
      for (let w = cursor; w < words.length; w++) {
        const wn = norm(words[w].text);
        if (wn && (wn === key || (key.length > 3 && wn.startsWith(key.slice(0, 4))))) {
          cursor = w + 1;
          return Math.max(firstAt, Math.round((words[w].startMs / 1000) * fps) - 4);
        }
      }
    }
    return fallback;
  });
};
