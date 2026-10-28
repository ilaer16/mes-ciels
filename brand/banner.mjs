// Visuels de la charte, dessinés à partir des vraies constellations : node brand/banner.mjs
//  - brand/banniere-linkedin.png : couverture de profil LinkedIn (1584×396)
//  - public/og.png : image d'aperçu quand le lien est partagé (1200×627)
//  - public/favicon-32.png, public/apple-touch-icon.png : icônes PNG (le SVG reste l'icône principale)
// Une étoile par ressource, un amas par thème, couleurs du site. Rendu PNG via Edge headless.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const dir = import.meta.dirname, pub = path.join(dir, '../public');
const { items, themes } = JSON.parse(fs.readFileSync(path.join(pub, 'data.json'), 'utf8'));
const COLORS = { outil: '#2b8a3e', pdf: '#1971c2', image: '#c2255c', lien: '#e67700', linkedin: '#6741d9' };
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
if (!EDGE) throw new Error('Edge introuvable.');

const LOGO = w => `<svg viewBox="0 0 64 40" width="${w}" height="${w * 40 / 64}"><polyline points="6,31 18,9 32,23 46,7 58,29" fill="none" stroke="#8193b8" stroke-width="1.8" stroke-linejoin="round"/><g fill="#17203a"><circle cx="6" cy="31" r="2.4"/><circle cx="18" cy="9" r="2.9"/><circle cx="46" cy="7" r="2.6"/><circle cx="58" cy="29" r="2.2"/></g><circle cx="32" cy="23" r="7" fill="#e8590c" opacity=".18"/><circle cx="32" cy="23" r="3.6" fill="#e8590c"/></svg>`;

// Ciel : amas répartis sur une vague entre x0 et x0 + span
function sky(W, H, x0, span, yc, amp) {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const centers = themes.map((t, i) => { const k = i / (themes.length - 1); return [x0 + k * span + (rnd() - .5) * 30, yc + Math.sin(k * Math.PI * 2.2) * amp + (rnd() - .5) * 40]; });
  let svg = '';
  for (let i = 1; i < centers.length; i++) svg += `<line x1="${centers[i - 1][0]}" y1="${centers[i - 1][1]}" x2="${centers[i][0]}" y2="${centers[i][1]}" stroke="#8193b8" stroke-opacity=".28" stroke-dasharray="2 5"/>`;
  const stars = [];
  themes.forEach((t, i) => {
    const [cx, cy] = centers[i], members = items.filter(it => it.theme === t);
    for (const it of members) {
      const a = rnd() * Math.PI * 2, r = 16 + rnd() * (14 + members.length * 3.2), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.8;
      svg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#8193b8" stroke-opacity=".35"/>`;
      stars.push([x, y, COLORS[it.format] || COLORS.lien, it.format === 'outil' ? 5 : 3.8]);
    }
    svg += `<circle cx="${cx}" cy="${cy}" r="1.8" fill="#8193b8" opacity=".6"/>`;
  });
  for (const [x, y, c, r] of stars) svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r * 3}" fill="${c}" opacity=".10"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"/>`;
  let dust = '';
  for (let i = 0; i < W * H / 4500; i++) dust += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(rnd() * 1.1 + .3).toFixed(2)}" fill="#7b8aa8" opacity="${(rnd() * .35 + .1).toFixed(2)}"/>`;
  return `<svg class="sky" viewBox="0 0 ${W} ${H}">${dust}${svg}</svg>`;
}

function shoot(name, W, H, body, css, out, transparent = false) {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<style>html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
body { background: ${transparent ? 'transparent' : 'linear-gradient(100deg, #f8fafd 0%, #eaf0f8 50%, #dde6f3 100%)'}; font-family: "Space Grotesk", sans-serif; color: #17203a; position: relative; }
svg.sky { position: absolute; inset: 0; } .mark { display: flex; align-items: center; } h1 { margin: 0; font-weight: 700; letter-spacing: -.035em; line-height: 1; }
p { margin: 0; font-weight: 500; color: #3d4760; } .url { color: #1971c2; letter-spacing: .01em; } .url b { color: #e8590c; }
${css}</style></head><body>${body}</body></html>`;
  const file = path.join(dir, name + '.html');
  fs.writeFileSync(file, html);
  execFileSync(EDGE, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${W},${H}`, '--virtual-time-budget=6000',
    ...(transparent ? ['--default-background-color=00000000'] : []), `--screenshot=${out}`, 'file:///' + file.replace(/\\/g, '/')], { stdio: 'ignore' });
  fs.rmSync(file);
  console.log('->', path.relative(path.join(dir, '..'), out));
}

const TEXT = (logo, h1, p, url) => `<div class="text"><div class="mark">${LOGO(logo)}<h1 style="font-size:${h1}px">Mes ciels</h1></div>
  <p style="font-size:${p}px">Synthèses, notes de lecture &amp; outils, constellés</p><div class="url" style="font-size:${url}px"><b>✦</b> mesciels.netlify.app</div></div>`;

// Couverture LinkedIn : à gauche, la photo de profil ; constellations au centre, texte à droite
shoot('banner', 1584, 396, sky(1584, 396, 400, 430, 200, 100) + TEXT(104, 84, 24, 20),
  `.text { position: absolute; right: 104px; top: 50%; transform: translateY(-50%); } .mark { gap: 20px; } p { margin-top: 18px; } .url { margin-top: 12px; }`,
  path.join(dir, 'banniere-linkedin.png'));

// Aperçu de lien : texte à gauche, constellations à droite
shoot('og', 1200, 627, sky(1200, 627, 650, 440, 300, 150) + TEXT(110, 88, 27, 23) + `<p class="by">Damien Dubreuil · personnel de direction</p>`,
  `.text { position: absolute; left: 80px; top: 50%; transform: translateY(-55%); width: 560px; } .mark { gap: 20px; } p { margin-top: 22px; line-height: 1.35; } .url { margin-top: 16px; }
   .by { position: absolute; left: 80px; bottom: 54px; font-size: 20px; color: #5d6680; }`,
  path.join(pub, 'og.png'));

// Icônes PNG à partir du logo SVG
const icon = fs.readFileSync(path.join(pub, 'logo.svg'), 'utf8');
for (const [s, out] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png']])
  shoot('icon', s, s, icon.replace('<svg ', `<svg width="${s}" height="${s}" `), 'svg { display: block; }', path.join(pub, out), true);
