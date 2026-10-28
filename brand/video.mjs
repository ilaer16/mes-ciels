// Présentation animée (1080×1080) + vidéo pour LinkedIn : node brand/video.mjs
//  - brand/presentation.html : se joue en boucle dans un navigateur (clic = recommencer, F11 = plein écran)
//  - brand/mes-ciels.mp4 (ou .webm) : enregistrée par Edge headless (MediaRecorder), sans autre logiciel
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const dir = import.meta.dirname;
const { items, themes } = JSON.parse(fs.readFileSync(path.join(dir, '../public/data.json'), 'utf8'));
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const QUERY = 'CPS';
const isHit = it => /\bcps\b|competences psychosociales/.test(norm(`${it.titre} ${it.texte} ${it.contenu} ${it.mots.map(m => m[0]).join(' ')}`));
const HITS = items.filter(isHit).length;
const DATA = {
  themes,
  items: items.map(it => ({ f: it.format, t: themes.indexOf(it.theme), v: it.voisins.map(v => v[0]), hit: isHit(it) })),
};

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Mes ciels — présentation</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>html,body{margin:0;height:100%;background:#0b0f1a;display:grid;place-items:center}canvas{width:min(100vw,100vh);height:min(100vw,100vh);cursor:pointer}</style>
</head><body><canvas id="c" width="1080" height="1080"></canvas><p id="hint" style="position:fixed;bottom:12px;left:0;right:0;text-align:center;font:14px sans-serif;color:#8d95a8">Cliquer pour relancer avec la musique · F11 : plein écran</p>
<script>
const DATA = ${JSON.stringify(DATA)}, QUERY = ${JSON.stringify(QUERY)}, HITS = ${HITS};
const c = document.getElementById('c'), main = c.getContext('2d'), W = 1080, H = 1080;
const off = document.createElement('canvas'); off.width = W; off.height = H; const layer = off.getContext('2d');
let g = main;
const INK = '#17203a', TEXT2 = '#3d4760', MUTED = '#5d6680', ACCENT = '#e8590c', LINE = '#8193b8';
const COL = { outil: '#2b8a3e', pdf: '#1971c2', image: '#c2255c', lien: '#e67700', linkedin: '#6741d9' };
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, clamp = x => Math.max(0, Math.min(1, x));
const seg = (p, a, b) => clamp((p - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;

// Constellations : un amas par thème autour du centre
const T = DATA.themes.length, centers = DATA.themes.map((_, i) => { const a = i / T * Math.PI * 2 - Math.PI / 2; return [540 + Math.cos(a) * 310, 650 + Math.sin(a) * 225]; });
const stars = DATA.items.map(it => { const n = DATA.items.filter(o => o.t === it.t).length, a = rnd() * 6.283, r = 22 + rnd() * (18 + Math.sqrt(n) * 13);
  return { ...it, x: centers[it.t][0] + Math.cos(a) * r, y: centers[it.t][1] + Math.sin(a) * r * .85, ph: rnd() * 6.28, c: COL[it.f] || COL.lien }; });
const dust = Array.from({ length: 160 }, () => [rnd() * W, rnd() * H, rnd() * 1.2 + .3, rnd() * .35 + .1]);
const M = [[6, 31], [18, 9], [32, 23], [46, 7], [58, 29]];
const logoFrom = M.map(() => [200 + rnd() * 680, 250 + rnd() * 400]);

function bg() {
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#f8fafd'); gr.addColorStop(.55, '#eaf0f8'); gr.addColorStop(1, '#dde6f3');
  g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#7b8aa8'; for (const [x, y, r, a] of dust) { g.globalAlpha = a; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
}
function dot(x, y, r, col, a = 1, glow = true) {
  g.fillStyle = col;
  if (glow) { g.globalAlpha = a * .14; g.beginPath(); g.arc(x, y, r * 3, 0, 7); g.fill(); }
  g.globalAlpha = a; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
}
function line(x1, y1, x2, y2, col, a, w = 1.4) { g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
function text(s, x, y, size, { weight = 500, col = INK, align = 'center', a = 1, max = 900, lh = 1.25 } = {}) {
  g.globalAlpha = a; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic'; g.font = weight + ' ' + size + 'px "Space Grotesk"';
  const words = s.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur); lines.forEach((l, i) => g.fillText(l, x, y + i * size * lh));
}
function logo(cx, cy, s, a, k = 1, t = 0) { // k : 0 = étoiles dispersées, 1 = Cassiopée formée
  const P = M.map(([x, y], i) => [lerp(logoFrom[i][0], cx + (x - 32) * s, ease(k)), lerp(logoFrom[i][1], cy + (y - 20) * s, ease(k))]);
  for (let i = 1; i < 5; i++) line(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], LINE, a * seg(k, .6, 1), s * .28);
  P.forEach(([x, y], i) => i === 2 ? (dot(x, y, s * (.95 + Math.sin(t * 3) * .12), ACCENT, a), 0) : dot(x, y, s * .45, INK, a, false));
}
function caption(s, a) { text(s, 540, 150, 52, { weight: 700, a, max: 920 }); }
function sky(t, a, { lit = null, hubs = true } = {}) {
  const P = stars.map(s => [s.x + Math.sin(t * .6 + s.ph) * 4, s.y + Math.cos(t * .5 + s.ph) * 3]);
  if (hubs) stars.forEach((s, i) => line(centers[s.t][0], centers[s.t][1], P[i][0], P[i][1], LINE, a * .3, 1));
  stars.forEach((s, i) => { const on = lit ? lit(s) : 1; dot(P[i][0], P[i][1], s.f === 'outil' ? 7.5 : 5.5, s.c, a * (.12 + .88 * on)); });
  return P;
}

// Scènes : [durée en s, dessin(p = 0→1, t = temps global)]
const SCENES = [
  [5, (p, t) => { logo(540, 470, 9, 1, seg(p, .05, .6), t); text('Mes ciels', 540, 720, 120, { weight: 700, a: seg(p, .5, .75) });
    text('Synthèses, notes de lecture & outils, constellés', 540, 790, 34, { col: TEXT2, a: seg(p, .65, .9) }); }],
  [6, (p, t) => { caption('Avant : un Digipad. Des colonnes, des étagères.', seg(p, 0, .15));
    const k = ease(seg(p, .45, .9));
    stars.slice(0, 35).forEach((s, i) => { const col = i % 5, row = Math.floor(i / 5), x0 = 150 + col * 195, y0 = 300 + row * 72;
      const x = lerp(x0, s.x, k), y = lerp(y0, s.y, k), w = lerp(170, 11, k), h = lerp(54, 11, k);
      g.globalAlpha = seg(p, .1 + i * .006, .3 + i * .006); g.fillStyle = k < .6 ? '#ffffff' : s.c; g.strokeStyle = '#c9d2e3'; g.lineWidth = 1.5;
      g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, lerp(8, 6, k)); g.fill(); if (k < .6) g.stroke(); });
    if (p > .45) text('Trop linéaire. Trop laborieux à mettre à jour.', 540, 980, 32, { col: TEXT2, a: seg(p, .5, .65) }); }],
  [6, (p, t) => { caption('Chaque ressource, une étoile. Chaque thème, une constellation.', seg(p, 0, .15)); sky(t, seg(p, 0, .25));
    DATA.themes.forEach((th, i) => text(th.toUpperCase(), centers[i][0], centers[i][1] - 78, 17, { weight: 700, col: MUTED, a: seg(p, .35 + i * .03, .55 + i * .03), max: 260 })); }],
  [5, (p, t) => { caption('Des fils relient les ressources qui parlent des mêmes choses.', seg(p, 0, .15)); const P = sky(t, 1);
    let n = 0; stars.forEach((s, i) => s.v.forEach(j => { if (j < i) return; const k = seg(p, .15 + (n++ % 40) * .012, .5 + (n % 40) * .012);
      line(P[i][0], P[i][1], lerp(P[i][0], P[j][0], k), lerp(P[i][1], P[j][1], k), s.c, .45 * k, 1.6); })); }],
  [6, (p, t) => { caption('Une recherche qui lit jusqu\\'à l\\'intérieur des PDF.', seg(p, 0, .15));
    const typed = QUERY.slice(0, Math.floor(seg(p, .15, .45) * QUERY.length)), on = seg(p, .5, .65);
    g.globalAlpha = 1; g.fillStyle = '#fff'; g.strokeStyle = '#c9d2e3'; g.lineWidth = 2; g.beginPath(); g.roundRect(240, 250, 600, 76, 16); g.fill(); g.stroke();
    text('⌕  ' + typed + (Math.floor(t * 2) % 2 ? '|' : ''), 270, 300, 34, { align: 'left', col: typed ? INK : MUTED });
    const P = sky(t, 1, { lit: s => s.hit ? 1 : 1 - on, hubs: false });
    stars.forEach((s, i) => { if (!s.hit || !on) return; g.globalAlpha = on * (1 - (t * .8 % 1)); g.strokeStyle = ACCENT; g.lineWidth = 3;
      g.beginPath(); g.arc(P[i][0], P[i][1], 14 + (t * .8 % 1) * 26, 0, 7); g.stroke(); dot(P[i][0], P[i][1], 9, s.c, on); });
    text(HITS + ' ressources sur les compétences psychosociales, trouvées jusque dans le texte des PDF', 540, 975, 30, { col: TEXT2, a: seg(p, .65, .8), max: 820 }); }],
  [6, (p, t) => { caption('Glisser, déposer : c\\'est en ligne.', seg(p, 0, .15));
    const N = [['Page d\\'ajout', 'je glisse un PDF'], ['GitHub', 'le contenu'], ['Netlify', 'publie le site'], ['Mes ciels', 'une étoile de plus']];
    N.forEach(([a, b], i) => { const x = 165 + i * 250, y = 520, k = seg(p, .1 + i * .12, .3 + i * .12);
      if (i) line(x - 250 + 70, y, x - 70, y, LINE, k, 3);
      g.globalAlpha = k; g.fillStyle = i === 3 ? INK : '#fff'; g.strokeStyle = '#c9d2e3'; g.lineWidth = 2; g.beginPath(); g.roundRect(x - 100, y - 70, 200, 140, 18); g.fill(); g.stroke();
      text(a, x, y - 4, 30, { weight: 700, col: i === 3 ? '#fff' : INK, a: k, max: 190 }); text(b, x, y + 34, 21, { col: i === 3 ? '#c2c9d8' : MUTED, a: k, max: 190 }); });
    const k = seg(p, .55, .9), x = lerp(165, 915, ease(k)); dot(x, 520 - Math.sin(k * Math.PI) * 120, 9, ACCENT, k > 0 && k < 1 ? 1 : 0);
    text('Mes posts LinkedIn rejoignent d\\'eux-mêmes la bonne constellation.', 540, 760, 32, { col: TEXT2, a: seg(p, .6, .75) });
    text('Conçu et construit avec Claude Code', 540, 900, 30, { weight: 700, col: ACCENT, a: seg(p, .72, .85) }); }],
  [5, (p, t) => { logo(540, 430, 8, 1, 1, t); text('Mes ciels', 540, 660, 116, { weight: 700, a: seg(p, 0, .2) });
    text('mesciels.netlify.app', 540, 750, 44, { weight: 700, col: '#1971c2', a: seg(p, .15, .35) });
    text('Damien Dubreuil · personnel de direction', 540, 960, 28, { col: MUTED, a: seg(p, .3, .5) }); }],
];
const TOTAL = SCENES.reduce((s, [d]) => s + d, 0), FADE = .45;

function frame(t) {
  g = main; bg(); let start = 0;
  for (const [d, draw] of SCENES) {
    if (t >= start - FADE && t < start + d + FADE) {
      const local = t - start, a = Math.min(clamp((local + FADE) / FADE), clamp((d + FADE - local) / FADE));
      // chaque scène est dessinée sur un calque puis fondue (transition douce)
      layer.globalAlpha = 1; layer.clearRect(0, 0, W, H); g = layer; draw(clamp(local / d), t); g = main;
      g.globalAlpha = a; g.drawImage(off, 0, 0);
    }
    start += d;
  }
}

// Musique originale, synthétisée : nappe d'accords en ré, arpège pentatonique avec écho, carillons synchronisés
function music(ac, out, t0) {
  const master = ac.createGain(); master.gain.setValueAtTime(0, t0); master.gain.linearRampToValueAtTime(2.6, t0 + 2);
  master.gain.setValueAtTime(2.6, t0 + TOTAL - 3); master.gain.linearRampToValueAtTime(0, t0 + TOTAL);
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; master.connect(comp).connect(out);
  const rev = ac.createConvolver(), len = ac.sampleRate * 3.5, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5); }
  rev.buffer = ir; const wet = ac.createGain(); wet.gain.value = .5; rev.connect(wet).connect(master);
  const dry = ac.createGain(); dry.gain.value = .7; dry.connect(master); dry.connect(rev);
  const delay = ac.createDelay(1), fb = ac.createGain(); delay.delayTime.value = .375; fb.gain.value = .35; delay.connect(fb).connect(delay); delay.connect(rev);
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const CH = [[50, 57, 61, 64, 66], [47, 54, 57, 62, 66], [43, 50, 54, 59, 62], [45, 52, 57, 59, 64]]; // ré maj9, si m7, sol maj7, la sus
  for (let k = 0, t = t0; t < t0 + TOTAL; k++, t += 4.5) for (const m of CH[k % 4]) for (const det of [-6, 6]) {
    const o = ac.createOscillator(), gn = ac.createGain(), f = ac.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = hz(m); o.detune.value = det; f.type = 'lowpass'; f.frequency.value = 1400;
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(.022, t + 1.4); gn.gain.setValueAtTime(.022, t + 3.6); gn.gain.linearRampToValueAtTime(0, t + 5.4);
    o.connect(f).connect(gn).connect(dry); o.start(t); o.stop(t + 5.5);
  }
  const pluck = (t, m, v) => { const o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sine'; o.frequency.value = hz(m);
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(v, t + .01); gn.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
    o.connect(gn); gn.connect(dry); gn.connect(delay); o.start(t); o.stop(t + 1.7); };
  const PENTA = [74, 76, 78, 81, 83, 86, 88, 90]; let r = 3; const rr = () => (r = (r * 16807) % 2147483647) / 2147483647;
  for (let t = t0 + 2.2; t < t0 + TOTAL - 2.5; t += .375) if (rr() < .55) pluck(t, PENTA[Math.floor(rr() * PENTA.length)], .06 + rr() * .05);
  for (const [at, notes] of [[3, [74, 81, 86]], [25, [78, 83, 90, 95]], [34.4, [74, 78, 81, 86]]]) notes.forEach((m, i) => pluck(t0 + at + i * .09, m, .13));
}

async function ready() { await document.fonts.load('700 100px "Space Grotesk"'); await document.fonts.load('500 30px "Space Grotesk"'); }
// Lecture en boucle (navigateur) — clic : recommencer
let t0 = performance.now(), ac = null, lastT = 0;
c.onclick = () => { t0 = performance.now(); ac?.close(); ac = new AudioContext(); music(ac, ac.destination, ac.currentTime + .05); document.getElementById('hint').hidden = true; };
const params = new URLSearchParams(location.search);
if (!params.has('record')) ready().then(() => { const loop = now => { const t = ((now - t0) / 1000) % TOTAL; if (ac && t < lastT) music(ac, ac.destination, ac.currentTime); lastT = t; frame(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); });

// Enregistrement (appelé par video.mjs)
window.record = async () => {
  await ready();
  const type = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
  const audio = new AudioContext(); await audio.resume(); const dest = audio.createMediaStreamDestination();
  const stream = new MediaStream([...c.captureStream(30).getVideoTracks(), ...dest.stream.getAudioTracks()]);
  const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8e6, audioBitsPerSecond: 192000 }), chunks = [];
  music(audio, dest, audio.currentTime + .05);
  rec.ondataavailable = e => chunks.push(e.data);
  const done = new Promise(r => rec.onstop = r);
  rec.start(500); const s = performance.now();
  await new Promise(r => { const loop = now => { const t = (now - s) / 1000; frame(Math.min(t, TOTAL - .01)); t < TOTAL + .3 ? requestAnimationFrame(loop) : r(); }; requestAnimationFrame(loop); });
  rec.stop(); await done;
  const buf = new Uint8Array(await new Blob(chunks, { type }).arrayBuffer());
  let bin = ''; for (let i = 0; i < buf.length; i += 32768) bin += String.fromCharCode(...buf.subarray(i, i + 32768));
  return { type, b64: btoa(bin) };
};
</script></body></html>`;
const htmlPath = path.join(dir, 'presentation.html');
fs.writeFileSync(htmlPath, html);
console.log('-> brand/presentation.html');

// Enregistrement via Edge (protocole DevTools)
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(fs.existsSync);
if (!EDGE) { console.log('Edge introuvable : ouvrir presentation.html et enregistrer l\'écran (Win + Maj + R).'); process.exit(0); }
const port = 9334, profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ciels-'));
const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--window-size=1080,1080', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) { await sleep(250); target = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json()).then(l => l.find(t => t.type === 'page')).catch(() => null); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let n = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); pending.get(m.id)?.(m); pending.delete(m.id); });
const cdp = (method, params = {}) => new Promise((ok, ko) => { const id = ++n; pending.set(id, m => m.error ? ko(new Error(m.error.message)) : ok(m.result)); ws.send(JSON.stringify({ id, method, params })); });
try {
  await cdp('Page.navigate', { url: 'file:///' + htmlPath.replace(/\\/g, '/') + '?record' });
  await sleep(2500);
  console.log('Enregistrement en temps réel…');
  const { result, exceptionDetails } = await cdp('Runtime.evaluate', { expression: 'record()', awaitPromise: true, returnByValue: true });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
  const ext = result.value.type.includes('mp4') ? 'mp4' : 'webm', out = path.join(dir, 'mes-ciels.' + ext);
  fs.writeFileSync(out, Buffer.from(result.value.b64, 'base64'));
  console.log(`-> brand/mes-ciels.${ext} (${result.value.type}, ${(fs.statSync(out).size / 1e6).toFixed(1)} Mo)`);
} finally { ws.close(); edge.kill(); }
