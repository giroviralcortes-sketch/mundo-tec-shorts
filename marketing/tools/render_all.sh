#!/bin/bash
# Renderiza todos os shorts de src/shorts/data.json e gera pranchas de revisão.
cd /home/user
mkdir -p out/shorts marketing/semana-01/previews
for id in $(python3 -c "import json;print(' '.join(v['id'] for v in json.load(open('src/shorts/data.json'))))"); do
  npx remotion render "$id" "out/shorts/$id.mp4" --browser-executable=/opt/pw-browsers/chromium --concurrency=4 --log=error || { echo "FALHOU $id"; continue; }
  python3 marketing/tools/contact_sheet.py "$id" "out/shorts/$id.mp4" "marketing/semana-01/previews/$id.png"
  echo "OK $id"
done
