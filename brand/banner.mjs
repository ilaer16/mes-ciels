// Bandeau LinkedIn (1584×396) dessiné à partir des vraies constellations : node brand/banner.mjs
// Une étoile par ressource, un amas par thème, couleurs du site. Rendu PNG via Edge headless.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const dir = import.meta.dirname;
const { items, themes } = JSON.parse(fs.readFileSync(path.join(dir, '../public/data.json'), 'utf8'));
const COLORS = { outil: '#2b8a3e', pdf: '#1971c2', image: '#c2255c', lien: '#e67700', linkedin: '#6741d9' };
const W = 1584, H = 396;

let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Amas répartis sur une vague, entre la zone de la photo de profil (à gauche) et le texte (à droite)
const centers = themes.map((t, i) => {
  const k = i / (themes.length - 1);
  return [400 + k * 430 + (rnd() - .5) * 30, 200 + Math.sin(k * Math.PI * 2.2) * 100 + (rnd() - .5) * 40];
});
let svg = '';
// fils entre amas voisins
for (let i = 1; i < centers.length; i++) svg += `<line x1="${centers[i - 1][0]}" y1="${centers[i - 1][1]}" x2="${centers[i][0]}" y2="${centers[i][1]}" stroke="#8193b8" stroke-opacity=".28" stroke-dasharray="2 5"/>`;
const stars = [];
themes.forEach((t, i) => {
  const [cx, cy] = centers[i], members = items.filter(it => it.theme === t);
  members.forEach(it => {
    const a = rnd() * Math.PI * 2, r = 16 + rnd() * (14 + members.length * 3.2);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.8;
    svg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#8193b8" stroke-opacity=".35" stroke-width="1"/>`;
    stars.push([x, y, COLORS[it.format] || COLORS.lien, it.format === 'outil' ? 5 : 3.8]);
  });
  svg += `<circle cx="${cx}" cy="${cy}" r="1.8" fill="#8193b8" opacity=".6"/>`;
});
for (const [x, y, c, r] of stars) svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r * 3}" fill="${c}" opacity=".10"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"/>`;
// poussière d'étoiles
let dust = '';
for (let i = 0; i < 140; i++) dust += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(rnd() * 1.1 + .3).toFixed(2)}" fill="#7b8aa8" opacity="${(rnd() * .35 + .1).toFixed(2)}"/>`;

const LOGO = `<svg viewBox="0 0 64 40" width="104" height="65"><polyline points="6,31 18,9 32,23 46,7 58,29" fill="none" stroke="#8193b8" stroke-width="1.8" stroke-linejoin="round"/><g fill="#17203a"><circle cx="6" cy="31" r="2.4"/><circle cx="18" cy="9" r="2.9"/><circle cx="46" cy="7" r="2.6"/><circle cx="58" cy="29" r="2.2"/></g><circle cx="32" cy="23" r="7" fill="#e8590c" opacity=".18"/><circle cx="32" cy="23" r="3.6" fill="#e8590c"/></svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
  body { background: linear-gradient(100deg, #f8fafd 0%, #eaf0f8 50%, #dde6f3 100%); font-family: "Space Grotesk", sans-serif; color: #17203a; position: relative; }
  svg.sky { position: absolute; inset: 0; }
  .text { position: absolute; right: 104px; top: 50%; transform: translateY(-50%); text-align: left; }
  .mark { display: flex; align-items: center; gap: 20px; }
  h1 { margin: 0; font-size: 84px; font-weight: 700; letter-spacing: -.035em; line-height: 1; }
  p { margin: 18px 0 0; font-size: 24px; font-weight: 500; color: #3d4760; }
  .url { margin-top: 12px; font-size: 20px; color: #1971c2; letter-spacing: .01em; }
  .url b { color: #e8590c; font-weight: 700; }
</style></head><body>
<svg class="sky" viewBox="0 0 ${W} ${H}">${dust}${svg}</svg>
<div class="text">
  <div class="mark">${LOGO}<h1>Mes ciels</h1></div>
  <p>Synthèses, notes de lecture &amp; outils, constellés</p>
  <div class="url"><b>✦</b> mesciels.netlify.app</div>
</div>
</body></html>`;

const htmlPath = path.join(dir, 'banner.html'), png = path.join(dir, 'banniere-linkedin.png');
fs.writeFileSync(htmlPath, html);
const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
if (!edge) throw new Error('Edge introuvable : ouvrir brand/banner.html et faire une capture 1584×396.');
execFileSync(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${W},${H}`, '--virtual-time-budget=6000', `--screenshot=${png}`, 'file:///' + htmlPath.replace(/\\/g, '/')], { stdio: 'ignore' });
console.log('->', png);
