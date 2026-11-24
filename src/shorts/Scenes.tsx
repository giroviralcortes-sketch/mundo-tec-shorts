import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, cueFrames, fadeIn, fontFamily, pop, progress, Word } from "./theme";

export type Scene = Record<string, any> & { type: string; vo: string; words: Word[] };

const Title: React.FC<{ text: string; start?: number }> = ({ text, start = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 800,
        fontSize: 72,
        color: C.text,
        textAlign: "center",
        lineHeight: 1.1,
        marginBottom: 48,
        ...pop(frame, start, 30),
      }}
    >
      {text}
    </div>
  );
};

// Texto com *destaque* em amarelo.
const Rich: React.FC<{ text: string; color?: string }> = ({ text, color = C.yellow }) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((part, i) =>
      part.startsWith("*") ? (
        <span key={i} style={{ color }}>
          {part.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )}
  </>
);

const Icon: React.FC<{ ok: boolean; size?: number }> = ({ ok, size = 72 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: ok ? C.green : C.red,
      color: "white",
      fontFamily,
      fontWeight: 900,
      fontSize: size * 0.6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {ok ? "✓" : "✕"}
  </div>
);

const card: React.CSSProperties = {
  background: C.card,
  border: `2px solid ${C.line}`,
  borderRadius: 36,
  fontFamily,
  color: C.text,
};

/* ---------- HOOK ---------- */
const Hook: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <div
        style={{
          fontSize: 200,
          ...pop(frame, 0, 0),
          rotate: `${interpolate(Math.sin((frame / fps) * 8), [-1, 1], [-6, 6])}deg`,
        }}
      >
        {s.emoji}
      </div>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 44,
          letterSpacing: 4,
          color: C.bg,
          background: C.yellow,
          padding: "12px 32px",
          borderRadius: 16,
          ...pop(frame, 2, 20),
        }}
      >
        {s.kicker}
      </div>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 118,
          lineHeight: 1.02,
          color: C.text,
          textAlign: "center",
          letterSpacing: -2,
          ...pop(frame, 4, 50),
        }}
      >
        <Rich text={s.title} />
      </div>
    </div>
  );
};

/* ---------- STEPS (menu do celular) ---------- */
const Steps: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const path: string[] = s.path;
  const cues = cueFrames(path, s.words, fps, dur);
  const active = cues.filter((c) => frame >= c).length - 1;
  const dense = path.length > 4;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Title text={s.title} />
      <div
        style={{
          width: 720,
          borderRadius: 64,
          border: `10px solid #1e293b`,
          background: "#0f172a",
          padding: dense ? "40px 24px 28px" : "56px 28px 40px",
          boxShadow: "0 40px 120px rgba(34,211,238,0.15)",
          ...pop(frame, 0, 80),
        }}
      >
        {path.map((p, i) => {
          const on = i === active;
          const done = i < active;
          const t = cues[i];
          return (
            <div
              key={p}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: dense ? "20px 26px" : "26px 28px",
                marginBottom: dense ? 10 : 14,
                borderRadius: 24,
                fontFamily,
                fontWeight: 700,
                fontSize: dense ? 38 : 42,
                color: on ? C.bg : C.text,
                background: on ? C.accent : done ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)",
                opacity: interpolate(frame, [t - 6, t], [0.35, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                scale: on ? interpolate(frame, [t, t + 4, t + 10], [1, 0.96, 1.03], { extrapolateRight: "clamp" }) : 1,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 56,
                  flexShrink: 0,
                  background: on ? C.bg : done ? C.accent : "rgba(255,255,255,0.12)",
                  color: on ? C.accent : C.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 900,
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <div style={{ flex: 1, lineHeight: 1.15 }}>{p}</div>
              <div style={{ fontSize: 44, opacity: 0.6 }}>›</div>
              {on ? (
                <div
                  style={{
                    position: "absolute",
                    right: 90,
                    top: "50%",
                    width: 70,
                    height: 70,
                    marginTop: -35,
                    borderRadius: 70,
                    border: `6px solid white`,
                    opacity: interpolate(frame, [t, t + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    scale: interpolate(frame, [t, t + 14], [0.4, 1.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- CHAT ---------- */
const Chat: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const replyAt = Math.round(dur * 0.55);
  const typingVisible = frame > 18 && frame < replyAt;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <Title text={s.title} />
      <div style={{ width: 900, display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: 760,
            background: s.bad ? "#1f2937" : "#0e7490",
            color: "white",
            fontFamily,
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1.3,
            padding: "30px 36px",
            borderRadius: "40px 40px 8px 40px",
            ...pop(frame, 4, 40),
          }}
        >
          {s.user}
        </div>
        {typingVisible ? (
          <div
            style={{
              alignSelf: "flex-start",
              ...card,
              padding: "24px 36px",
              fontSize: 56,
              letterSpacing: 8,
              opacity: fadeIn(frame, 18),
            }}
          >
            {[0, 1, 2].map((d) => (
              <span key={d} style={{ opacity: 0.3 + 0.7 * Math.abs(Math.sin((frame + d * 5) / 6)) }}>
                •
              </span>
            ))}
          </div>
        ) : null}
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: 760,
            ...card,
            background: s.bad ? "rgba(244,63,94,0.12)" : "rgba(255,255,255,0.08)",
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1.3,
            padding: "30px 36px",
            borderRadius: "40px 40px 40px 8px",
            ...pop(frame, replyAt, 40),
          }}
        >
          {s.ai}
        </div>
        {s.bad ? (
          <div
            style={{
              alignSelf: "center",
              marginTop: 20,
              fontFamily,
              fontWeight: 900,
              fontSize: 88,
              color: C.red,
              border: `8px solid ${C.red}`,
              borderRadius: 20,
              padding: "6px 40px",
              rotate: "-8deg",
              opacity: fadeIn(frame, replyAt + 12, 4),
              scale: interpolate(frame, [replyAt + 12, replyAt + 20], [2, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            GOLPE
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ---------- COMPARE ---------- */
const Compare: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const second = Math.round(dur * 0.4);
  const Row = ({ ok, label, text, at }: { ok: boolean; label: string; text: string; at: number }) => (
    <div
      style={{
        ...card,
        width: 900,
        padding: "40px 44px",
        display: "flex",
        gap: 36,
        alignItems: "center",
        borderColor: ok ? C.green : C.red,
        background: ok ? "rgba(34,197,94,0.1)" : "rgba(244,63,94,0.1)",
        ...pop(frame, at, 60),
      }}
    >
      <Icon ok={ok} size={96} />
      <div>
        <div style={{ fontSize: 38, fontWeight: 700, color: ok ? C.green : C.red, marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15 }}>{text}</div>
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      <Title text={s.title} />
      <Row ok={false} label={s.bad.label} text={s.bad.text} at={4} />
      <div style={{ fontFamily, fontWeight: 900, fontSize: 60, color: C.muted, opacity: fadeIn(frame, second - 4) }}>VS</div>
      <Row ok label={s.good.label} text={s.good.text} at={second} />
    </div>
  );
};

/* ---------- PRICE ---------- */
const Price: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const drop = progress(frame, 14, 22);
  const warnAt = Math.round(dur * 0.5);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
      <Title text={s.title} />
      <div style={{ ...card, position: "relative", width: 820, padding: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...pop(frame, 0, 60) }}>
        <div style={{ fontSize: 140 }}>📱</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: C.muted, position: "relative" }}>
          {s.from}
          <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 8, background: C.red, scale: `${drop} 1`, transformOrigin: "left" }} />
        </div>
        <div style={{ fontSize: 130, fontWeight: 900, color: C.green, opacity: drop, scale: 0.8 + 0.2 * drop }}>{s.to}</div>
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            background: C.red,
            color: "white",
            fontWeight: 900,
            fontSize: 64,
            padding: "18px 30px",
            borderRadius: 24,
            rotate: "10deg",
            opacity: drop,
          }}
        >
          {s.off}
        </div>
      </div>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: 72,
          color: C.bg,
          background: C.yellow,
          padding: "16px 40px",
          borderRadius: 20,
          ...pop(frame, warnAt, 30),
        }}
      >
        ⚠️ Isso é isca
      </div>
    </div>
  );
};

/* ---------- CHECKLIST ---------- */
const Checklist: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items: { text: string; ok: boolean }[] = s.items;
  const cues = cueFrames(items.map((i) => i.text), s.words, fps, dur);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
      <Title text={s.title} />
      {items.map((it, i) => (
        <div key={it.text} style={{ ...card, width: 900, padding: "36px 40px", display: "flex", gap: 32, alignItems: "center", ...pop(frame, cues[i], 40) }}>
          <Icon ok={it.ok} />
          <div style={{ fontSize: 54, fontWeight: 800 }}>{it.text}</div>
        </div>
      ))}
    </div>
  );
};

/* ---------- SCAN (texto em foto) ---------- */
const Scan: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const lines: string[] = s.lines;
  const sweep = progress(frame, 6, Math.round(dur * 0.45));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Title text={s.title} />
      <div
        style={{
          width: 860,
          height: 640,
          borderRadius: 40,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg,#334155,#0f172a)",
          border: `2px solid ${C.line}`,
          padding: 60,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 34,
          ...pop(frame, 0, 60),
        }}
      >
        {lines.map((l, i) => {
          const hit = sweep > (i + 0.6) / lines.length;
          return (
            <div
              key={l}
              style={{
                fontFamily: "monospace",
                fontSize: 50,
                fontWeight: 700,
                color: "#e2e8f0",
                alignSelf: "flex-start",
                padding: "6px 14px",
                borderRadius: 10,
                background: hit ? "rgba(59,130,246,0.55)" : "transparent",
                rotate: `${(i % 2 ? 1 : -1) * 1.5}deg`,
              }}
            >
              {l}
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${sweep * 100}%`,
            height: 8,
            background: C.accent,
            boxShadow: `0 0 40px 12px ${C.accent}`,
            opacity: sweep < 1 ? 1 : 0,
          }}
        />
      </div>
      <div style={{ marginTop: 40, fontFamily, fontWeight: 800, fontSize: 56, color: C.accent, opacity: fadeIn(frame, Math.round(dur * 0.5)) }}>
        Copiado ✓
      </div>
    </div>
  );
};

/* ---------- BILL (conta de luz) ---------- */
const Bill: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const coverAt = Math.round(dur * 0.45);
  const rows: string[][] = s.rows;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <Title text={s.title} />
      <div style={{ width: 760, background: "#f8fafc", borderRadius: 24, padding: 48, color: "#0f172a", fontFamily, ...pop(frame, 0, 60), rotate: "-2deg" }}>
        <div style={{ fontSize: 44, fontWeight: 900, marginBottom: 12 }}>⚡ CONTA DE ENERGIA</div>
        {[["Nome", "Fulano de Tal"], ["CPF", "123.456.789-00"], ["Endereço", "Rua Exemplo, 100"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 32, padding: "8px 0", position: "relative" }}>
            <span style={{ color: "#64748b" }}>{k}</span>
            <span style={{ fontWeight: 700, filter: k !== "Nome" && frame > coverAt ? "blur(10px)" : "none" }}>{v}</span>
            {k !== "Nome" ? (
              <div style={{ position: "absolute", right: -10, top: 4, bottom: 4, width: 340, background: "#0f172a", borderRadius: 8, scale: `${progress(frame, coverAt, 10)} 1`, transformOrigin: "right" }} />
            ) : null}
          </div>
        ))}
        <div style={{ height: 3, background: "#cbd5e1", margin: "16px 0" }} />
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 36, padding: "10px 0", fontWeight: k === "Total" ? 900 : 500 }}>
            <span>{k}</span>
            <span>{v} ???</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: -200, background: "white", opacity: interpolate(frame, [6, 8, 18], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      <div style={{ marginTop: 44, fontFamily, fontWeight: 900, fontSize: 52, color: C.bg, background: C.yellow, padding: "14px 34px", borderRadius: 18, ...pop(frame, coverAt, 30) }}>
        Cubra CPF e endereço
      </div>
    </div>
  );
};

/* ---------- CARDS ---------- */
const Cards: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards: string[] = s.cards;
  const cues = cueFrames(cards, s.words, fps, dur);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      <Title text={s.title} />
      {cards.map((c, i) => (
        <div key={c} style={{ ...card, width: 920, padding: "38px 40px", display: "flex", gap: 32, alignItems: "center", ...pop(frame, cues[i], 50) }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 24,
              background: C.accent,
              color: C.bg,
              fontWeight: 900,
              fontSize: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
          <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.15 }}>{c}</div>
        </div>
      ))}
    </div>
  );
};

/* ---------- STORAGE ---------- */
const PALETTE = ["#f43f5e", "#f59e0b", "#22d3ee", "#22c55e", "#64748b"];
const Storage: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const segs: { label: string; pct: number }[] = s.segments;
  const grow = progress(frame, 8, 36);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Title text={s.title} />
      <div style={{ width: 920, height: 120, borderRadius: 30, overflow: "hidden", display: "flex", background: "rgba(255,255,255,0.06)", ...pop(frame, 0, 40) }}>
        {segs.map((g, i) => (
          <div key={g.label} style={{ width: `${g.pct * grow}%`, background: PALETTE[i % PALETTE.length], borderRight: "4px solid #070b14" }} />
        ))}
      </div>
      <div style={{ marginTop: 48, width: 920, display: "flex", flexDirection: "column", gap: 20 }}>
        {segs.map((g, i) => (
          <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 24, fontFamily, color: C.text, opacity: fadeIn(frame, 14 + i * 5) }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: PALETTE[i % PALETTE.length] }} />
            <div style={{ flex: 1, fontSize: 50, fontWeight: 700 }}>{g.label}</div>
            <div style={{ fontSize: 54, fontWeight: 900 }}>{Math.round(g.pct * grow)}%</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 30, fontFamily, fontSize: 32, color: C.muted, opacity: fadeIn(frame, 30) }}>{s.note}</div>
    </div>
  );
};

/* ---------- GAUGE (termômetro) ---------- */
const Gauge: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const signs: string[] = s.signs;
  const cues = cueFrames(signs, s.words, fps, dur);
  const lvl = progress(frame, 4, Math.round(dur * 0.8));
  const color = lvl < 0.5 ? C.yellow : C.red;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Title text={s.title} />
      <div style={{ display: "flex", gap: 50, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", ...pop(frame, 0, 40) }}>
          <div style={{ width: 90, height: 520, borderRadius: 50, border: `8px solid ${C.line}`, position: "relative", overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${15 + lvl * 85}%`, background: color }} />
          </div>
          <div style={{ width: 150, height: 150, borderRadius: 150, background: color, marginTop: -30 }} />
          <div style={{ fontFamily, fontWeight: 900, fontSize: 56, color, marginTop: 14 }}>{Math.round(45 + lvl * 50)}°C</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 620 }}>
          {signs.map((t, i) => (
            <div key={t} style={{ ...card, padding: "30px 32px", display: "flex", gap: 22, alignItems: "center", ...pop(frame, cues[i], 40) }}>
              <div style={{ fontSize: 56 }}>🔥</div>
              <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.15 }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- CTA ---------- */
const Cta: React.FC<{ s: Scene }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
      <div style={{ fontSize: 220, ...pop(frame, 0, 0), translate: `0px ${Math.sin((frame / fps) * 6) * 14}px` }}>{s.emoji}</div>
      <div style={{ fontFamily, fontWeight: 900, fontSize: 104, lineHeight: 1.05, color: C.text, textAlign: "center", ...pop(frame, 3, 50) }}>{s.text}</div>
      <div
        style={{
          fontFamily,
          fontWeight: 800,
          fontSize: 50,
          color: C.bg,
          background: C.accent,
          padding: "20px 44px",
          borderRadius: 60,
          ...pop(frame, 10, 30),
        }}
      >
        Siga pra mais dicas 👆
      </div>
    </div>
  );
};

export const SceneView: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  switch (s.type) {
    case "hook":
      return <Hook s={s} />;
    case "steps":
      return <Steps s={s} dur={dur} />;
    case "chat":
      return <Chat s={s} dur={dur} />;
    case "compare":
      return <Compare s={s} dur={dur} />;
    case "price":
      return <Price s={s} dur={dur} />;
    case "checklist":
      return <Checklist s={s} dur={dur} />;
    case "scan":
      return <Scan s={s} dur={dur} />;
    case "bill":
      return <Bill s={s} dur={dur} />;
    case "cards":
      return <Cards s={s} dur={dur} />;
    case "storage":
      return <Storage s={s} />;
    case "gauge":
      return <Gauge s={s} dur={dur} />;
    case "cta":
      return <Cta s={s} />;
    default:
      return null;
  }
};
