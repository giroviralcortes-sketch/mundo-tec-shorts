#!/bin/bash
# Espera a geração atual, cancela o render encadeado e refaz cenas com pronúncia/alerta.
while pgrep -f "build_audio_clone.py" >/dev/null; do sleep 5; done
sleep 3; pkill -f render_all.sh; pkill -f "remotion render"; sleep 2
cd /home/user/public/shorts
rm -f d3-copiar-texto-foto/s4.json.src d5-whatsapp-espaco/s4.json.src
cd /home/user/marketing
echo "--- rodada de correção ---" >> voz/build.log
HF_HUB_OFFLINE=1 /home/user/.venv-tts/bin/python tools/build_audio_clone.py semana-01/roteiros.json 2>&1 | grep --line-buffered -E "similaridade|total|ATENÇÃO|pronto|Error|Traceback" >> voz/build.log
echo "--- render ---" >> voz/build.log
/home/user/marketing/tools/render_all.sh >> voz/build.log 2>&1
python3 /home/user/marketing/tools/build_review.py semana-01 >> voz/build.log 2>&1
echo "TUDO PRONTO" >> voz/build.log
