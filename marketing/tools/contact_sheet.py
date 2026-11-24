"""Gera uma prancha com 1 quadro do fim de cada cena (para revisão). Uso: contact_sheet.py <id> <mp4> <png>"""
import json, math, subprocess, sys
vid, mp4, png = sys.argv[1:4]
data = {v["id"]: v for v in json.load(open("/home/user/src/shorts/data.json"))}
fr, start = [], 0
for s in data[vid]["scenes"]:
    d = math.ceil((s["audioSec"] + 0.35) * 30); fr.append(start + int(d * 0.85)); start += d
sel = "+".join(f"eq(n\\,{f})" for f in fr)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", f"select='{sel}',scale=360:-1,tile={len(fr)}x1", "-frames:v", "1", png], check=True)
