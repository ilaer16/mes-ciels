// Logo vivant : des étoiles dérivent et se relient quand elles se rapprochent (comme les fils du site),
// puis se rassemblent régulièrement en Cassiopée, le « M » de Mes ciels.
const svg = document.getElementById('logo');
const NS = 'http://www.w3.org/2000/svg';
const M = [[6, 31], [18, 9], [32, 23], [46, 7], [58, 29]]; // Cassiopée
const ACCENT = 2;
const stars = [...M, [26, 34]].map(([tx, ty], i) => ({
  tx, ty, accent: i === ACCENT, extra: i >= M.length,
  bx: 8 + Math.random() * 48, by: 6 + Math.random() * 28,
  ax: 5 + Math.random() * 7, ay: 3 + Math.random() * 5,
  w: 0.35 + Math.random() * 0.4, p: Math.random() * 6.3, x: tx, y: ty,
}));
const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return svg.appendChild(e); };
const pairs = [];
for (let i = 0; i < stars.length; i++) for (let j = i + 1; j < stars.length; j++) pairs.push([stars[i], stars[j], el('line', { class: 'logo-line' }), j === i + 1 && j < M.length]);
const glow = el('circle', { class: 'logo-glow', r: 7 });
for (const s of stars) s.el = el('circle', { class: 'logo-star' + (s.accent ? ' accent' : ''), r: s.accent ? 3.6 : s.extra ? 1.6 : 2.6 });

const CYCLE = 10, ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
// part de la forme M dans le cycle : dérive 0–5 s, rassemblement 5–6,5 s, M 6,5–8,5 s, dispersion 8,5–10 s
const formed = t => { const c = t % CYCLE; return c < 5 ? 0 : c < 6.5 ? ease((c - 5) / 1.5) : c < 8.5 ? 1 : ease(1 - (c - 8.5) / 1.5); };
let pointer = null;
svg.closest('a').addEventListener('pointermove', e => { const r = svg.getBoundingClientRect(); pointer = [(e.clientX - r.left) / r.width * 64, (e.clientY - r.top) / r.height * 40]; });
svg.closest('a').addEventListener('pointerleave', () => { pointer = null; });

function draw(t) {
  const f = formed(t);
  for (const s of stars) {
    let x = s.bx + Math.sin(t * s.w + s.p) * s.ax, y = s.by + Math.cos(t * s.w * 0.8 + s.p) * s.ay;
    x += (s.tx - x) * f; y += (s.ty - y) * f;
    if (pointer) { x += (pointer[0] - x) * 0.3; y += (pointer[1] - y) * 0.3; }
    s.x += (x - s.x) * 0.12; s.y += (y - s.y) * 0.12; // lissage : pas de saut quand la souris arrive ou part
    s.el.setAttribute('cx', s.x.toFixed(2)); s.el.setAttribute('cy', s.y.toFixed(2));
    s.el.style.opacity = s.extra ? 1 - f : 1;
  }
  for (const [a, b, line, chain] of pairs) {
    const d = Math.hypot(a.x - b.x, a.y - b.y), near = Math.max(0, 1 - d / 24) * (1 - f);
    line.setAttribute('x1', a.x.toFixed(2)); line.setAttribute('y1', a.y.toFixed(2));
    line.setAttribute('x2', b.x.toFixed(2)); line.setAttribute('y2', b.y.toFixed(2));
    line.style.opacity = Math.max(near, chain ? f : 0).toFixed(2);
  }
  const c = stars[ACCENT];
  glow.setAttribute('cx', c.x.toFixed(2)); glow.setAttribute('cy', c.y.toFixed(2));
  glow.setAttribute('r', (6 + Math.sin(t * 2.1) * 1.8).toFixed(2));
}

if (matchMedia('(prefers-reduced-motion: reduce)').matches) draw(7.5); // fixe, en Cassiopée
else {
  const t0 = performance.now() - 6000; // la page s'ouvre en pleine formation du M
  for (const s of stars) { s.x = s.bx; s.y = s.by; }
  const loop = now => { if (!document.hidden) draw((now - t0) / 1000); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
