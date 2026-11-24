"""Gera a narração de cada cena com a voz clonada (Chatterbox) e marca o tempo de
cada palavra com o Whisper, para as legendas. Escreve src/shorts/data.json.

Uso (no venv de TTS):
  HF_HUB_OFFLINE=1 /home/user/.venv-tts/bin/python build_audio_clone.py semana-01/roteiros.json

Controle de qualidade: a fala gerada é transcrita; se a transcrição não bater
com o roteiro (similaridade < 0,85), a cena é gerada de novo (até 3 tentativas).
"""
import difflib, json, os, re, subprocess, sys, unicodedata

CA = "/root/.ccr/ca-bundle.crt"
for k in ("SSL_CERT_FILE", "REQUESTS_CA_BUNDLE"):
    os.environ.setdefault(k, CA)
import torch, torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel

torch.set_num_threads(os.cpu_count() or 4)
ROOT = "/home/user"
REF = os.environ.get("VOICE_REF", f"{ROOT}/marketing/voz/referencia.wav")
VOICE_TAG = "clone:" + os.path.basename(REF)

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = re.sub(r"[^a-z0-9]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))
    return {"para": "pra", "pro": "pra", "esta": "ta"}.get(s, s)  # formas faladas equivalentes

def dur(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]))

tts = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
asr = WhisperModel("small", device="cpu", compute_type="int8")

def chunks(text, limit=110):
    """Divide falas longas em frases/trechos curtos (o modelo erra mais em textos longos)."""
    parts = re.split(r"(?<=[.!?:])\s+", text)
    out = []
    for p in parts:
        if len(p) <= limit:
            out.append(p)
            continue
        cur = ""
        for piece in re.split(r"(?<=,)\s+", p):
            if cur and len(cur) + len(piece) + 1 > limit:
                out.append(cur)
                cur = piece
            else:
                cur = f"{cur} {piece}".strip()
        if cur:
            out.append(cur)
    return [o for o in out if o.strip()]

def synth(text, wav_out):
    pieces = chunks(text)
    gap = torch.zeros(1, int(tts.sr * 0.12))
    wavs = []
    for k, p in enumerate(pieces):
        w = tts.generate(p, language_id="pt", audio_prompt_path=REF, exaggeration=0.5, cfg_weight=0.5)
        if len(pieces) > 1:  # corta silêncio de cada trecho para não ficar pausa longa entre eles
            loud = (w.abs() > 0.02).nonzero()
            if len(loud):
                a, b = int(loud[:, 1].min()), int(loud[:, 1].max())
                pad = int(tts.sr * 0.04)
                w = w[:, max(0, a - pad): b + pad]
        wavs.append(w)
        if k < len(pieces) - 1:
            wavs.append(gap)
    torchaudio.save(wav_out, torch.cat(wavs, dim=1), tts.sr)

def transcribe(wav_path):
    w, sr = torchaudio.load(wav_path)
    w = torchaudio.functional.resample(w.mean(0), sr, 16000).numpy()
    segs, _ = asr.transcribe(w, language="pt", word_timestamps=True)
    return [(x.word.strip(), x.start, x.end) for s in segs for x in s.words]

# Pronúncia: como a palavra é FALADA. A legenda continua mostrando a grafia original.
PRON = {
    "sms": "esse eme esse",
    "cpf": "cê pê éfe",
    "chatgpt": "chat gê pê tê",
    "wifi": "uai fai",
}

def spoken_tokens(word):
    core = re.sub(r"[.,!?:;]+$", "", word)
    punct = word[len(core):]
    rep = PRON.get(norm(core))
    if not rep:
        return [word]
    toks = rep.split()
    toks[-1] += punct
    return toks

def to_spoken(text):
    return " ".join(t for w in text.split() for t in spoken_tokens(w))

def align(script_text, heard):
    """Tempo de cada palavra do roteiro, tirado das palavras ouvidas pelo Whisper.
    O alinhamento é feito no texto falado e depois volta para a grafia do roteiro."""
    display = script_text.split()
    groups = [spoken_tokens(w) for w in display]
    sw = [t for g in groups for t in g]
    a, b = [norm(x) for x in sw], [norm(h[0]) for h in heard]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    times = [None] * len(sw)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            _, s, e = heard[blk.b + k]
            times[blk.a + k] = (s, e)
    # interpola palavras não reconhecidas entre vizinhas conhecidas
    known = [i for i, t in enumerate(times) if t]
    total_end = heard[-1][2] if heard else 1.0
    for i, t in enumerate(times):
        if t:
            continue
        prev = max([k for k in known if k < i], default=None)
        nxt = min([k for k in known if k > i], default=None)
        s = times[prev][1] if prev is not None else 0.0
        e = times[nxt][0] if nxt is not None else total_end
        n_gap = (nxt if nxt is not None else len(sw)) - (prev if prev is not None else -1) - 1
        pos = i - (prev if prev is not None else -1) - 1
        step = (e - s) / max(1, n_gap)
        times[i] = (s + pos * step, s + (pos + 1) * step)
    words, k = [], 0
    for w, g in zip(display, groups):
        s, e = times[k][0], times[k + len(g) - 1][1]
        k += len(g)
        words.append({"text": re.sub(r"[.,!?:;]+$", "", w), "startMs": round(s * 1000), "endMs": round(e * 1000)})
    return words, sm.ratio()

videos = json.load(open(sys.argv[1]))
out = []
for v in videos:
    d = f"{ROOT}/public/shorts/{v['id']}"
    os.makedirs(d, exist_ok=True)
    scenes = []
    for i, c in enumerate(v["cenas"]):
        mp3, js, src = f"{d}/s{i}.mp3", f"{d}/s{i}.json", f"{d}/s{i}.json.src"
        key = {"vo": c["vo"], "spoken": to_spoken(c["vo"]), "voice": VOICE_TAG}
        old = json.load(open(src)) if os.path.exists(src) else None
        cached = (isinstance(old, dict) and os.path.exists(mp3) and old.get("vo") == key["vo"]
                  and old.get("voice") == key["voice"] and old.get("spoken", old["vo"]) == key["spoken"])
        if not cached:
            best = None
            for attempt in range(3):
                raw, trimmed = f"{d}/s{i}.raw.wav", f"{d}/s{i}.wav"
                synth(to_spoken(c["vo"]), raw)
                # corta silêncio no começo e no fim
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                                "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                                "silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.12",
                                trimmed], check=True)
                words, ratio = align(c["vo"], transcribe(trimmed))
                print(f"  {v['id']} cena {i} tentativa {attempt + 1}: similaridade {ratio:.2f}", flush=True)
                if best is None or ratio > best[1]:
                    best = (words, ratio)
                    os.replace(trimmed, f"{d}/s{i}.best.wav")
                if ratio >= 0.85:
                    break
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{d}/s{i}.best.wav", "-b:a", "160k", mp3], check=True)
            for f in (f"{d}/s{i}.raw.wav", f"{d}/s{i}.best.wav", f"{d}/s{i}.wav"):
                if os.path.exists(f):
                    os.remove(f)
            json.dump(best[0], open(js, "w"), ensure_ascii=False)
            json.dump(key, open(src, "w"), ensure_ascii=False)
            if best[1] < 0.85:
                print(f"  ATENÇÃO {v['id']} cena {i}: melhor similaridade {best[1]:.2f}, revisar", flush=True)
        scenes.append({**c, "audio": f"shorts/{v['id']}/s{i}.mp3", "audioSec": round(dur(mp3), 3),
                       "words": json.load(open(js))})
    out.append({"id": v["id"], "titulo": v["titulo"], "scenes": scenes})
    print(v["id"], "total", round(sum(s["audioSec"] for s in scenes), 1), "s", flush=True)
    json.dump(out, open(f"{ROOT}/src/shorts/data.json.partial", "w"), ensure_ascii=False, indent=1)

json.dump(out, open(f"{ROOT}/src/shorts/data.json", "w"), ensure_ascii=False, indent=1)
print("data.json pronto")
