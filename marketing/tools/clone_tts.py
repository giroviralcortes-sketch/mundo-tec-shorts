"""Narração com a voz clonada do Marcelo (Chatterbox Multilingual, licença MIT).
Uso: clone_tts.py "texto" saida.wav   (ou --batch arquivo.json com [[texto, saida], ...])"""
import json, os, sys
CA = "/root/.ccr/ca-bundle.crt"
for k in ("SSL_CERT_FILE", "REQUESTS_CA_BUNDLE", "CURL_CA_BUNDLE"):
    os.environ.setdefault(k, CA)
import torch, torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
torch.set_num_threads(os.cpu_count() or 4)
REF = os.environ.get("VOICE_REF", "/home/user/marketing/voz/referencia.wav")
model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
jobs = json.load(open(sys.argv[2])) if sys.argv[1] == "--batch" else [[sys.argv[1], sys.argv[2]]]
for text, out in jobs:
    wav = model.generate(text, language_id="pt", audio_prompt_path=REF,
                         exaggeration=float(os.environ.get("EXAG", "0.5")), cfg_weight=float(os.environ.get("CFG", "0.5")))
    torchaudio.save(out, wav, model.sr)
    print("ok", out, flush=True)
