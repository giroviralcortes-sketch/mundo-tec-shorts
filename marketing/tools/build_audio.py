"""Gera narração por cena e escreve src/shorts/data.json para o Remotion.
Uso: python3 build_audio.py semana-01/roteiros.json"""
import json, os, subprocess, sys
ROOT = "/home/user"
here = os.path.dirname(os.path.abspath(__file__))
videos = json.load(open(sys.argv[1]))
out = []
for v in videos:
    d = os.path.join(ROOT, "public", "shorts", v["id"]); os.makedirs(d, exist_ok=True)
    scenes = []
    for i, c in enumerate(v["cenas"]):
        mp3, js = os.path.join(d, f"s{i}.mp3"), os.path.join(d, f"s{i}.json")
        if not (os.path.exists(mp3) and os.path.exists(js) and os.path.getsize(mp3) > 0
                and json.load(open(js + ".src", "r")) == c["vo"] if os.path.exists(js + ".src") else False):
            subprocess.run([sys.executable, os.path.join(here, "tts.py"), c["vo"], mp3, js], check=True)
            json.dump(c["vo"], open(js + ".src", "w"), ensure_ascii=False)
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3]))
        scenes.append({**c, "audio": f"shorts/{v['id']}/s{i}.mp3", "audioSec": round(dur, 3), "words": json.load(open(js))})
    out.append({"id": v["id"], "titulo": v["titulo"], "scenes": scenes})
    print(v["id"], "total", round(sum(s["audioSec"] for s in scenes), 1), "s")
os.makedirs(os.path.join(ROOT, "src", "shorts"), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, "src", "shorts", "data.json"), "w"), ensure_ascii=False, indent=1)
