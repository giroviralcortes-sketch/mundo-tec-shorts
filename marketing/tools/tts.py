"""Gera narração com edge-tts usando o CA do proxy do ambiente.
Uso: python3 tts.py "texto" saida.mp3 saida.json
Grava as palavras com tempo (ms) no JSON para legendas."""
import asyncio, json, os, sys
import certifi
CA = "/root/.ccr/ca-bundle.crt"
if os.path.exists(CA):
    certifi.where = lambda: CA
import edge_tts

VOICE = os.environ.get("VOICE", "pt-BR-AntonioNeural")
RATE = os.environ.get("RATE", "+10%")

async def main(text, mp3, js):
    c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    words = []
    with open(mp3, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"text": ch["text"], "startMs": ch["offset"] / 1e4,
                              "endMs": (ch["offset"] + ch["duration"]) / 1e4})
    json.dump(words, open(js, "w"), ensure_ascii=False)

asyncio.run(main(*sys.argv[1:4]))
