"""Gera a página de revisão da semana (HTML) a partir de roteiros.json.
Uso: python3 build_review.py semana-01"""
import html, json, os, shutil, subprocess, sys

week = sys.argv[1]
base = f"/home/user/marketing/{week}"
out = f"{base}/revisao"
os.makedirs(f"{out}/videos", exist_ok=True)
os.makedirs(f"{out}/capas", exist_ok=True)
roteiros = json.load(open(f"{base}/roteiros.json"))
e = html.escape

HIP = {
    "d1": "Alerta de segurança: espero menor taxa de pulo e mais compartilhamentos.",
    "d2": "Urgência da data (véspera da Black Friday) + alerta: aposta para compartilhamento.",
    "d3": "Função escondida com passo a passo: aposta para salvamentos.",
    "d4": "IA resolvendo um problema real; junta o que funcionou (conta de luz/CPFL) com o nicho.",
    "d5": "Problema de muita gente (memória cheia) + passo a passo: salvamentos.",
    "d6": "Notebook: conversa com a loja sem ser anúncio (anúncios tiveram 6 a 148 views).",
    "d7": "Lista para copiar e colar: aposta para salvamentos.",
}

cards = []
for v in roteiros:
    vid = v["id"]
    src = f"/home/user/out/shorts/{vid}.mp4"
    if os.path.exists(src):
        shutil.copy(src, f"{out}/videos/{vid}.mp4")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1.6", "-i", src, "-frames:v", "1",
                        "-vf", "scale=540:-1", "-q:v", "4", f"{out}/capas/{vid}.jpg"], check=True)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                         "-of", "csv=p=0", src])) if os.path.exists(src) else 0
    falas = "".join(
        f'<li><span class="tag">{e(c["type"])}</span>{e(c["vo"])}</li>' for c in v["cenas"])
    cards.append(f"""
<article class="vid" id="{e(vid)}">
  <div class="player"><video src="videos/{e(vid)}.mp4" poster="capas/{e(vid)}.jpg" controls playsinline preload="none"></video></div>
  <div class="meta">
    <div class="row"><span class="day">{e(v["dia"])}</span><span class="dur">{dur:.0f}s · 9:16</span></div>
    <h3>{e(v["titulo"])}</h3>
    <p class="hip">{e(HIP.get(vid[:2], ""))}</p>
    <details><summary>Roteiro (narração por cena)</summary><ol class="script">{falas}</ol></details>
    <details><summary>Legenda pronta</summary>
      <pre class="cap" id="cap-{e(vid)}">{e(v["legenda"])}</pre>
      <button type="button" class="copy" data-target="cap-{e(vid)}">Copiar legenda</button>
    </details>
  </div>
</article>""")

TEMAS = [("Local/cidade", 4, 292, 52, 1, 2), ("Pessoal", 8, 135, 50, 0, 2), ("Tecnologia", 19, 125, 59, 9, 3),
         ("Anúncio da loja", 3, 87, 62, 0, 0), ("Política", 5, 47, 47, 0, 1), ("Carrossel", 2, 26, None, 0, 0),
         ("Venda (Pack IA)", 1, 6, 80, 0, 0)]
mx = max(t[2] for t in TEMAS)
temas = "".join(
    f'<tr><td>{n}</td><td class="num">{p}</td><td><div class="bar"><i style="width:{v / mx * 100:.0f}%"></i><b>{v}</b></div></td>'
    f'<td class="num">{"n/a" if s is None else str(s) + "%"}</td><td class="num">{sv}</td><td class="num">{sh}</td></tr>'
    for n, p, v, s, sv, sh in TEMAS)

page = f"""<title>Semana 1 · Mundo Tec</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600;700&display=swap">
<style>
/* Layout: coluna única de leitura; vídeos em grade que vira 1 coluna no celular. */
:root {{
  --bg: #f5f7fa; --surface: #ffffff; --fg: #0b1220; --muted: #5b6678; --line: #dde3ec;
  --accent: #0891b2; --accent-soft: #e0f5fa; --warn: #b45309; --warn-soft: #fff4e0;
  --good: #15803d; --bad: #be123c;
  --display: "Space Grotesk", "Segoe UI", system-ui, sans-serif;
  --body: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #0a0f19; --surface: #111827; --fg: #e8edf5; --muted: #94a0b4; --line: #243044;
  --accent: #22d3ee; --accent-soft: #0b2a33; --warn: #fbbf24; --warn-soft: #2a2110;
  --good: #4ade80; --bad: #fb7185; color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --bg: #0a0f19; --surface: #111827; --fg: #e8edf5; --muted: #94a0b4; --line: #243044;
  --accent: #22d3ee; --accent-soft: #0b2a33; --warn: #fbbf24; --warn-soft: #2a2110;
  --good: #4ade80; --bad: #fb7185; color-scheme: dark; }}
body {{ background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 16px; line-height: 1.55; }}
.wrap {{ max-width: 1080px; margin: 0 auto; padding-block: 32px 64px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }}
h1, h2, h3 {{ font-family: var(--display); text-wrap: balance; line-height: 1.15; margin: 0; }}
h1 {{ font-size: clamp(28px, 5vw, 40px); }}
h2 {{ font-size: 24px; margin-bottom: 16px; }}
h3 {{ font-size: 19px; }}
section {{ margin-top: 48px; }}
.lead {{ color: var(--muted); max-width: 65ch; margin: 8px 0 0; }}
.status {{ display: inline-flex; gap: 8px; align-items: center; background: var(--warn-soft); color: var(--warn);
  font-weight: 700; font-size: 14px; padding: 6px 12px; border-radius: 999px; margin-bottom: 14px; }}
.kpis {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }}
.kpi {{ background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 16px; }}
.kpi b {{ display: block; font-family: var(--display); font-size: 32px; font-variant-numeric: tabular-nums; }}
.kpi span {{ color: var(--muted); font-size: 14px; }}
.tablebox {{ overflow-x: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; margin-top: 16px; }}
table {{ border-collapse: collapse; width: 100%; min-width: 560px; font-size: 15px; }}
th, td {{ text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--line); }}
th {{ font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }}
tr:last-child td {{ border-bottom: 0; }}
.num {{ text-align: right; font-variant-numeric: tabular-nums; }}
.bar {{ position: relative; height: 22px; min-width: 140px; }}
.bar i {{ position: absolute; inset: 0 auto 0 0; background: var(--accent); border-radius: 4px; opacity: .8; }}
.bar b {{ position: relative; padding-left: 8px; font-size: 13px; line-height: 22px; mix-blend-mode: normal; }}
.two {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }}
.list {{ background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; min-width: 0; }}
.list h3 {{ margin-bottom: 8px; }}
.list.good h3 {{ color: var(--good); }} .list.bad h3 {{ color: var(--bad); }}
.list ul {{ margin: 0; padding-left: 20px; }} .list li {{ margin: 6px 0; }}
.vids {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }}
.vid {{ background: var(--surface); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; min-width: 0; }}
.player {{ background: #000; aspect-ratio: 9 / 16; max-width: 100%; }}
.player video {{ width: 100%; height: 100%; display: block; }}
.meta {{ padding: 14px 16px 18px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }}
.row {{ display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); }}
.day {{ font-weight: 700; color: var(--accent); }}
.hip {{ margin: 0; font-size: 14px; color: var(--muted); }}
details {{ border-top: 1px solid var(--line); padding-top: 8px; }}
summary {{ cursor: pointer; font-weight: 600; font-size: 14px; }}
summary:focus-visible, .copy:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; }}
.script {{ padding-left: 20px; margin: 8px 0 0; font-size: 14px; }} .script li {{ margin: 6px 0; }}
.tag {{ display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted);
  border: 1px solid var(--line); border-radius: 6px; padding: 0 6px; margin-right: 6px; }}
.cap {{ white-space: pre-wrap; font-family: var(--body); font-size: 14px; background: var(--bg); border-radius: 10px;
  padding: 12px; margin: 8px 0; overflow-x: auto; }}
.copy {{ font: 600 14px var(--body); background: var(--accent-soft); color: var(--fg); border: 1px solid var(--line);
  border-radius: 8px; padding: 6px 12px; cursor: pointer; }}
.plat {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }}
.pill {{ display: inline-block; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }}
.ok {{ background: color-mix(in srgb, var(--good) 15%, transparent); color: var(--good); }}
.no {{ background: color-mix(in srgb, var(--bad) 15%, transparent); color: var(--bad); }}
.sources {{ font-size: 14px; color: var(--muted); }} .sources a {{ color: var(--accent); }}
.next {{ background: var(--accent-soft); border: 1px solid var(--line); border-radius: 16px; padding: 20px; }}
code {{ font-size: .95em; }}
@media (prefers-reduced-motion: reduce) {{ * {{ scroll-behavior: auto; }} }}
</style>
<div class="wrap">
<header>
  <div class="status">● Aguardando sua aprovação · nada foi publicado</div>
  <h1>Semana 1 · @marcelocardosotech</h1>
  <p class="lead">Diagnóstico dos últimos 60 dias no Instagram, o que está funcionando no nicho de dicas de tecnologia, e os 7 vídeos verticais da semana de 25/11 a 01/12 prontos para revisão.</p>
</header>

<section>
  <h2>1. Diagnóstico do seu conteúdo</h2>
  <div class="kpis">
    <div class="kpi"><b>77</b><span>views na mediana por post (42 posts, 27/09 a 23/11)</span></div>
    <div class="kpi"><b>0,5%</b><span>dos 16.944 seguidores alcançados por post, em média</span></div>
    <div class="kpi"><b>56%</b><span>pulam o Reel nos 3 primeiros segundos (meta: abaixo de 40%)</span></div>
    <div class="kpi"><b>10 · 8</b><span>salvamentos · compartilhamentos somando os 42 posts</span></div>
  </div>
  <div class="tablebox"><table>
    <thead><tr><th>Tema</th><th class="num">Posts</th><th>Views médias</th><th class="num">Pulo</th><th class="num">Salvos</th><th class="num">Compart.</th></tr></thead>
    <tbody>{temas}</tbody>
  </table></div>
  <div class="two" style="margin-top:16px">
    <div class="list good"><h3>O que funciona</h3><ul>
      <li><b>Alerta útil com consequência:</b> "Anatel: não perca seu chip" e "Não mexa no que está funcionando" tiveram o menor pulo do nicho (36%).</li>
      <li><b>Promessa de segredo gera salvamento:</b> "Isso aqui ninguém te mostra" foi o recorde, com 4 salvos.</li>
      <li><b>Problemas de muita gente:</b> WhatsApp (253 views) e notebook com tela preta (241).</li>
      <li><b>Pedir comentário com palavra-chave:</b> "Comente EDITAR" (311 views) e CapCut (14 comentários).</li>
    </ul></div>
    <div class="list bad"><h3>O que não funciona</h3><ul>
      <li><b>Misturar temas</b> (política, cidade, música, loja): o Instagram não sabe para quem mostrar. Isso explica o alcance de 0,5%.</li>
      <li><b>Programas e modelos muito específicos</b> (CorelDRAW 20 views, Epson L3250 39).</li>
      <li><b>Anúncios diretos</b> da loja e do Pack IA (6 a 148 views, nenhum salvamento).</li>
      <li><b>Carrosséis</b> (18 e 33 views) e <b>ganchos vagos</b> ("Nova função do Instagram": 68% de pulo).</li>
    </ul></div>
  </div>
  <p class="lead">TikTok e YouTube não entraram na análise porque não estão conectados.</p>
</section>

<section>
  <h2>2. O que está funcionando no nicho</h2>
  <div class="two">
    <div class="list"><h3>Formato</h3><ul>
      <li>Gancho no <b>primeiro segundo</b>; o Reels pune intros lentas mais que o TikTok.</li>
      <li>Legenda na tela o tempo todo (a maioria assiste sem som) e um novo "gancho" a cada 10–15s.</li>
      <li>Vídeos educativos curtos com passo a passo visível.</li>
    </ul></div>
    <div class="list"><h3>O que o algoritmo valoriza</h3><ul>
      <li><b>Tempo assistido</b> e <b>envios por DM</b> são os sinais mais citados; depois, salvamentos. Curtida é o sinal mais fraco.</li>
      <li>Por isso cada vídeo termina com "manda pra quem…" ou "salva pra…".</li>
    </ul></div>
    <div class="list"><h3>Assuntos em alta agora</h3><ul>
      <li>Black Friday (27/11) e golpes de compra online.</li>
      <li>Novidades do WhatsApp (agendamento de mensagens, IA) e IA gratuita no dia a dia (ChatGPT, Gemini).</li>
      <li>Evitei funções que ainda não chegaram ao Brasil (como o Gemini Tasks) e funções liberadas aos poucos.</li>
    </ul></div>
  </div>
  <p class="sources">Fontes: <a href="https://www.terramarketgroup.com/blog/short-form-video-retention-hooks-2026-30-tested-opening-patterns-for-reels-tiktok-and-shorts">Terra Market Group</a> ·
  <a href="https://www.dataslayer.ai/blog/instagram-algorithm-2025-complete-guide-for-marketers">Dataslayer</a> ·
  <a href="https://www.socialync.io/blog/instagram-shares-algorithm-complete-guide-2026">Socialync</a> ·
  <a href="https://jetfuel.agency/how-to-optimize-short-form-video-content-for-success/">Jetfuel</a> ·
  <a href="https://querobolsa.com.br/revista/whatsapp-novidades-figurinhas-com-audio-agendamento-de-mensagens">Quero Bolsa</a> ·
  <a href="https://panoramatecnologico.com.br/agentes-gemini-gratuitos/">Panorama Tecnológico</a> ·
  <a href="https://gd.eurisko.com.br/2026/11/22/chatgpt-claude-ou-gemini-qual-oferece-mais-recursos-de-graca-em-2026/">Eurisko</a>.
  São blogs de marketing e tecnologia; os números deles não são oficiais do Instagram.</p>
</section>

<section>
  <h2>3. Os 7 vídeos da semana</h2>
  <p class="lead">Todos em 1080×1920 (9:16), de 27 a 31 segundos, com narração em voz neural, legenda animada palavra por palavra, gráficos e passo a passo animados. Os textos ficam fora das áreas cobertas pelos botões do Reels, TikTok e Shorts.</p>
  <div class="vids">{"".join(cards)}</div>
</section>

<section>
  <h2>4. Como fica a publicação</h2>
  <div class="plat">
    <div class="list"><h3>Instagram <span class="pill ok">automático</span></h3><p>Um Reel por dia às 19h (horário de Brasília), pelo Windsor.ai, que já está conectado.</p></div>
    <div class="list"><h3>TikTok <span class="pill no">manual</span></h3><p>Não há como postar daqui: o Windsor não publica no TikTok, e a chave do Upload-Post não foi configurada. Os arquivos e as legendas ficam prontos para você subir pelo app.</p></div>
    <div class="list"><h3>YouTube Shorts <span class="pill no">manual</span></h3><p>O plano grátis do Windsor permite só uma conexão (o Instagram). Mesmos arquivos e legendas, para subir pelo YouTube Studio.</p></div>
  </div>
</section>

<section class="next">
  <h2>Próximo passo</h2>
  <p>Revise os vídeos e me diga o que mudar: texto, ordem, voz, cores ou tema. Quando estiver tudo certo, responda <b>"manda ver"</b>. Antes disso, nada é publicado.</p>
</section>
</div>
<script>
document.querySelectorAll(".copy").forEach(function (b) {{
  b.addEventListener("click", function () {{
    var el = document.getElementById(b.dataset.target);
    var done = function () {{ b.textContent = "Copiado ✓"; setTimeout(function () {{ b.textContent = "Copiar legenda"; }}, 1600); }};
    var fallback = function () {{ var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selecionado, use Ctrl+C"; }};
    try {{ navigator.clipboard.writeText(el.textContent).then(done, fallback); }} catch (err) {{ fallback(); }}
  }});
}});
</script>
"""
open(f"{out}/index.html", "w").write(page)
print("ok", out)
