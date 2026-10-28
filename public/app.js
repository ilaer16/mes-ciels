import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

let mode = (() => { try { return localStorage.getItem('ciel'); } catch { return null; } })() || 'light';
const SKY = { light: { bg: 0xeef2f8, star: 0x9aa6bd, hub: 0xb8c2d6, blend: 1, glow: 0.4 }, dark: { bg: 0x05070d, star: 0x9aa4bf, hub: 0x4b5470, blend: 2, glow: 1 } }; // blend: Normal / Additive
const F = (label, dark, light, size, action) => ({ label, dark, light, size, action, get color() { return this[mode]; } });
const FORMATS = {
  outil:    F('Outil web',          '#8ce99a', '#2b8a3e', 1.35, "Lancer l'outil"),
  pdf:      F('PDF',                '#74c0fc', '#1971c2', 1,    'Lire / télécharger'),
  image:    F('Infographie',        '#f783ac', '#c2255c', 0.95, 'Voir en grand'),
  lien:     F('Lien, présentation', '#ffe066', '#e67700', 0.9,  'Ouvrir le lien'),
  linkedin: F('Post LinkedIn',      '#b197fc', '#6741d9', 0.85, 'Voir le post'),
};
const RECENT_DAYS = 120;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const fmtDate = d => new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

const data = await (await fetch('data.json')).json();
const { items, themes, site } = data;
const maxDate = Math.max(...items.map(i => +new Date(i.date)));
for (const it of items) {
  it.f = FORMATS[it.format] || FORMATS.lien;
  it.n = { titre: norm(it.titre), texte: norm(it.texte), contenu: norm(it.contenu), mots: norm(it.mots.map(m => m[0]).join(' ')) };
  it.n.all = `${it.n.titre} ${it.n.texte} ${it.n.contenu} ${it.n.mots}`;
  it.recent = !!it.nouveau || (maxDate - new Date(it.date)) / 864e5 <= RECENT_DAYS;
}

$('#author').textContent = site.auteur;
$('#intro').textContent = site.intro;
if (site.linkedin) Object.assign($('#linkedin-profile'), { href: site.linkedin, hidden: false });

const state = { q: '', themes: new Set(), formats: new Set(), tags: new Set(), recent: false, selected: null, list: matchMedia('(max-width: 760px)').matches };

// ---------- Filtrage & recherche ----------
const terms = () => norm(state.q).split(/\s+/).filter(t => t.length > 1);
function score(it) {
  if (state.themes.size && !state.themes.has(it.theme)) return 0;
  if (state.formats.size && !state.formats.has(it.format)) return 0;
  if (state.recent && !it.recent) return 0;
  for (const t of state.tags) if (!it.n.all.includes(t)) return 0;
  let s = 1;
  for (const t of terms()) {
    if (!it.n.all.includes(t)) return 0;
    s += (it.n.titre.includes(t) ? 6 : 0) + (it.n.mots.includes(t) ? 3 : 0) + (it.n.texte.includes(t) ? 2 : 0) + (it.n.contenu.includes(t) ? 1 : 0);
  }
  return s;
}
const filtering = () => !!(state.q.trim() || state.themes.size || state.formats.size || state.tags.size || state.recent);

// Extrait autour du premier terme trouvé (norm conserve la longueur pour du texte précomposé)
function snippet(it, words) {
  for (const [field, label] of [['texte', ''], ['contenu', 'dans le document']]) {
    const src = it[field]; if (!src) continue;
    const n = it.n[field];
    const hit = words.map(w => n.indexOf(w)).filter(i => i >= 0).sort((a, b) => a - b)[0];
    if (hit === undefined) continue;
    const a = Math.max(0, hit - 60), b = Math.min(src.length, hit + 120);
    return { label, html: (a ? '…' : '') + highlight(src.slice(a, b).replace(/\s+/g, ' '), words) + (b < src.length ? '…' : '') };
  }
  return null;
}
function highlight(text, words) {
  if (!words.length) return esc(text);
  const n = norm(text), marks = [];
  for (const w of words) { let i = -1; while ((i = n.indexOf(w, i + 1)) >= 0) marks.push([i, i + w.length]); }
  marks.sort((a, b) => a[0] - b[0]);
  let out = '', pos = 0;
  for (const [a, b] of marks) { if (a < pos) continue; out += esc(text.slice(pos, a)) + '<mark>' + esc(text.slice(a, b)) + '</mark>'; pos = b; }
  return out + esc(text.slice(pos));
}

// ---------- Scène 3D ----------
const host = $('#scene');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
host.appendChild(renderer.domElement);
const labels = new CSS2DRenderer();
Object.assign(labels.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
host.appendChild(labels.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0, 0.0045);
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
const HOME = new THREE.Vector3(0, 18, 135);
camera.position.copy(HOME);
const controls = new OrbitControls(camera, renderer.domElement);
Object.assign(controls, { enableDamping: true, dampingFactor: 0.07, minDistance: 6, maxDistance: 320, autoRotate: !reduceMotion, autoRotateSpeed: 0.35 });

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Étoiles de fond
let stars;
{
  const r = rng(7), pos = [];
  for (let i = 0; i < 1800; i++) { const v = new THREE.Vector3(r() - .5, r() - .5, r() - .5).normalize().multiplyScalar(220 + r() * 400); pos.push(v.x, v.y, v.z); }
  const g = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  stars = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.9, sizeAttenuation: true, transparent: true, opacity: 0.6, fog: false }));
  scene.add(stars);
}

const glowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
})();
const ringTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.arc(32, 32, 26, 0, Math.PI * 2); x.stroke(); return new THREE.CanvasTexture(c);
})();

// Centres des thèmes sur une sphère de Fibonacci
const centers = new Map(), themeLabels = new Map();
themes.forEach((t, i) => {
  const y = 1 - (i + 0.5) / themes.length * 2, r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5));
  const c = new THREE.Vector3(Math.cos(a) * r, y * 0.75, Math.sin(a) * r).multiplyScalar(52);
  centers.set(t, c);
  const el = document.createElement('div'); el.className = 'label'; el.textContent = t;
  el.addEventListener('click', () => toggle(state.themes, t));
  const lbl = new CSS2DObject(el); lbl.position.copy(c).add(new THREE.Vector3(0, 0, 0)); scene.add(lbl);
  themeLabels.set(t, el);
});

const meshes = [], sphereGeo = new THREE.SphereGeometry(0.6, 20, 20);
for (const it of items) {
  const siblings = items.filter(o => o.theme === it.theme), k = siblings.indexOf(it), r = rng(it.id * 97 + 13);
  const spread = 5 + Math.sqrt(siblings.length) * 2.4;
  const dir = new THREE.Vector3(r() - .5, r() - .5, r() - .5).normalize();
  it.pos = centers.get(it.theme).clone().addScaledVector(dir, 4 + (k / siblings.length) * 0.4 * spread + r() * spread * 0.6);
  const mesh = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ transparent: true }));
  mesh.position.copy(it.pos); mesh.scale.setScalar(it.f.size); mesh.userData.it = it;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }));
  glow.scale.setScalar(5.5 * it.f.size); mesh.add(glow); glow.scale.divideScalar(1);
  if (it.recent) {
    const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, color: 0xff922b, transparent: true, depthWrite: false }));
    ring.scale.setScalar(3); mesh.add(ring); it.ring = ring;
  }
  it.mesh = mesh; it.glow = glow; scene.add(mesh); meshes.push(mesh);
}

// Fils : ressource -> centre du thème (structure), et ressources voisines par le contenu (constellation)
function segments(pairs, opacity) {
  const pos = [], col = [];
  for (const [a, b, ca, cb] of pairs) { pos.push(a.x, a.y, a.z, b.x, b.y, b.z); col.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b); }
  const g = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)).setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity, depthWrite: false, blending: SKY[mode].blend }));
}
const seen = new Set(), neighborPairs = [];
for (const it of items) for (const [id] of it.voisins) {
  const key = [it.id, id].sort((a, b) => a - b).join('-'); if (seen.has(key)) continue; seen.add(key);
  neighborPairs.push([it, items[id]]);
}
let hubLines, neighborLines, focusLines = null;

// Ciel clair / ciel de nuit : couleurs des étoiles, du fond et des fils
function applySky() {
  const s = SKY[mode];
  document.documentElement.dataset.theme = mode;
  renderer.setClearColor(s.bg); scene.fog.color.set(s.bg); stars.material.color.set(s.star);
  for (const it of items) {
    it.mesh.material.color.set(it.f.color);
    Object.assign(it.glow.material, { blending: s.blend, needsUpdate: true }); it.glow.material.color.set(it.f.color);
  }
  scene.remove(hubLines, neighborLines);
  hubLines = segments(items.map(it => [it.pos, centers.get(it.theme), new THREE.Color(it.f.color), new THREE.Color(s.hub)]), mode === 'light' ? 0.35 : 0.12);
  neighborLines = segments(neighborPairs.map(([a, b]) => [a.pos, b.pos, new THREE.Color(a.f.color), new THREE.Color(b.f.color)]), 0.22);
  scene.add(hubLines, neighborLines);
  $('#sky-toggle').textContent = mode === 'light' ? '☾ Ciel de nuit' : '☀ Ciel clair';
}
$('#sky-toggle').addEventListener('click', () => {
  mode = mode === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('ciel', mode); } catch {}
  applySky(); update(); if (state.selected) select(state.selected);
});

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h); labels.setSize(w, h); camera.aspect = w / h;
  // recentre la scène dans l'espace libre à droite du panneau
  if (w > 760) camera.setViewOffset(w, h, -190, 0, w, h); else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

// Vol de caméra
let flight = null;
function flyTo(target, distance) {
  const dir = camera.position.clone().sub(controls.target).normalize();
  const to = { target: target.clone(), pos: target.clone().addScaledVector(dir, distance) };
  if (reduceMotion) { controls.target.copy(to.target); camera.position.copy(to.pos); return; }
  flight = { t0: performance.now(), from: { target: controls.target.clone(), pos: camera.position.clone() }, to };
}
function frame(list) {
  if (!list.length || list.length === items.length) return flyTo(new THREE.Vector3(), HOME.length());
  const box = new THREE.Box3().setFromPoints(list.map(i => i.pos)), s = box.getBoundingSphere(new THREE.Sphere());
  flyTo(s.center, Math.max(s.radius * 2.8, 22));
}

// Survol & clic
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), tip = $('#tooltip');
let hovered = null, down = null;
function pick(e) {
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  return ray.intersectObjects(meshes, false).map(h => h.object.userData.it).find(it => it.match) || null;
}
renderer.domElement.addEventListener('pointermove', e => {
  const it = pick(e);
  if (hovered && hovered !== it) hovered.mesh.scale.setScalar(hovered.f.size);
  hovered = it;
  renderer.domElement.style.cursor = it ? 'pointer' : '';
  if (!it) { tip.hidden = true; return; }
  it.mesh.scale.setScalar(it.f.size * 1.6);
  tip.innerHTML = `${esc(it.titre)}<small>${esc(it.theme)} · ${it.f.label}</small>`;
  Object.assign(tip.style, { left: Math.min(e.clientX + 14, innerWidth - 290) + 'px', top: e.clientY + 14 + 'px' });
  tip.hidden = false;
});
renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; controls.autoRotate = false; });
renderer.domElement.addEventListener('pointerup', e => {
  if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 5) { const it = pick(e); if (it) select(it); }
  down = null;
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  if (flight) {
    const k = Math.min(1, (performance.now() - flight.t0) / 1100), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    controls.target.lerpVectors(flight.from.target, flight.to.target, e);
    camera.position.lerpVectors(flight.from.pos, flight.to.pos, e);
    if (k === 1) flight = null;
  }
  if (!reduceMotion) for (const it of items) if (it.ring) { const p = (t * 0.6 + it.id * 0.37) % 1; it.ring.scale.setScalar(2 + p * 4); it.ring.material.opacity = (1 - p) * (it.match ? 0.9 : 0.1); }
  controls.update();
  renderer.render(scene, camera);
  labels.render(scene, camera);
});

// ---------- Interface ----------
function toggle(set, v) { set.has(v) ? set.delete(v) : set.add(v); update({ reframe: true }); }

function row(it, words = []) {
  const sn = words.length ? snippet(it, words) : null;
  return `<button class="item-row" data-id="${it.id}">
    <span class="t"><span class="dot" style="color:${it.f.color}"></span><span>${highlight(it.titre, words)}</span></span>
    <span class="m">${esc(it.theme)} · ${it.f.label} · ${fmtDate(it.date)} ${it.recent ? '<span class="badge-new">· récent</span>' : ''}</span>
    ${sn ? `<span class="s">${sn.label ? `<em>${sn.label} :</em> ` : ''}${sn.html}</span>` : ''}
  </button>`;
}

function renderPanels(matched) {
  // Thèmes
  $('#tab-themes').innerHTML = themes.map(t => {
    const total = items.filter(i => i.theme === t).length, n = matched.filter(i => i.theme === t).length;
    return `<button class="theme-row" data-theme="${esc(t)}" aria-pressed="${state.themes.has(t)}"><span>${esc(t)}</span><span class="n">${n}/${total}</span><span class="bar"><i style="width:${n / total * 100}%"></i></span></button>`;
  }).join('');

  // Nuage de mots-clés calculé sur la sélection courante
  const w = new Map();
  for (const it of matched) for (const [m, s] of it.mots) { const k = norm(m); if (state.tags.has(k) || terms().includes(k)) continue; const e = w.get(k) || { m, s: 0, n: 0 }; e.s += s; e.n++; w.set(k, e); }
  const top = [...w.values()].sort((a, b) => b.s - a.s).slice(0, 45), max = top[0]?.s || 1;
  $('#tab-tags').innerHTML = `<p class="hint">Calculé sur les ${matched.length} ressources affichées. Cliquez pour affiner.</p>` +
    top.sort((a, b) => a.m.localeCompare(b.m, 'fr')).map(e => `<button data-tag="${esc(norm(e.m))}" title="${e.n} ressource${e.n > 1 ? 's' : ''}" style="font-size:${(0.78 + e.s / max * 0.9).toFixed(2)}rem;opacity:${(0.55 + e.s / max * 0.45).toFixed(2)}">${esc(e.m)}</button>`).join('');

  // Formats
  $('#tab-formats').innerHTML = `<div class="formats">` + Object.entries(FORMATS).filter(([k]) => items.some(i => i.format === k)).map(([k, f]) =>
    `<button class="chip" data-format="${k}" aria-pressed="${state.formats.has(k)}"><span class="dot" style="color:${f.color}"></span>${f.label} <span class="n">${matched.filter(i => i.format === k).length}</span></button>`).join('') + `</div>`;

  // Récents
  const recent = items.filter(i => i.recent).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  $('#tab-recent').innerHTML = `<label class="switch"><input type="checkbox" id="only-recent" ${state.recent ? 'checked' : ''}> Ne montrer que les ajouts récents (anneau orange)</label>` + recent.map(i => row(i)).join('');
}

function renderActive() {
  const chips = [
    ...[...state.themes].map(t => [`theme`, t, t]),
    ...[...state.formats].map(f => [`format`, f, FORMATS[f].label]),
    ...[...state.tags].map(t => [`tag`, t, '#' + t]),
    ...(state.recent ? [['recent', '1', 'Récents']] : []),
  ];
  $('#active').innerHTML = chips.map(([k, v, l]) => `<button class="chip" data-remove="${k}" data-v="${esc(v)}">${esc(l)} <span class="x" aria-label="retirer">×</span></button>`).join('') +
    (chips.length ? `<button class="chip clear" data-remove="all">Tout effacer</button>` : '');
}

function renderResults(matched) {
  const words = [...terms(), ...state.tags];
  if (!filtering()) {
    $('#results').innerHTML = `<p class="help"><b>${items.length} ressources</b> en ${themes.length} constellations. Survolez une étoile, cliquez pour ouvrir sa fiche. Les fils relient les ressources qui parlent des mêmes choses.</p>
      <p class="help">La recherche fouille aussi <b>l'intérieur des PDF</b>. Essayez « harcèlement », « Fullan » ou « jury ».</p>`;
    return;
  }
  $('#results').innerHTML = `<p class="head">${matched.length} ressource${matched.length > 1 ? 's' : ''}</p>` +
    (matched.length ? matched.slice(0, 60).map(i => row(i, words)).join('') : `<p class="help">Rien trouvé. Essayez un mot plus court ou retirez un filtre.</p>`);
}

function renderList(matched) {
  $('#list-view').innerHTML = matched.map(it => `<button class="tile" data-id="${it.id}">
    ${it.vignette ? `<img src="${esc(it.vignette)}" alt="" loading="lazy">` : `<span class="ph" style="background:${it.f.color}"></span>`}
    <span class="in"><span class="t">${esc(it.titre)}</span><span class="m"><span class="dot" style="color:${it.f.color};display:inline-block"></span> ${esc(it.theme)} · ${it.f.label}${it.recent ? ' · <span class="badge-new">récent</span>' : ''}</span></span>
  </button>`).join('');
}

function update({ reframe = false } = {}) {
  for (const it of items) it.score = score(it);
  const matched = items.filter(i => i.score).sort((a, b) => b.score - a.score || b.date.localeCompare(a.date));
  const on = filtering();
  for (const it of items) {
    it.match = !!it.score;
    it.mesh.material.opacity = it.match ? 1 : 0.1;
    it.glow.material.opacity = (it.match ? (on ? 1 : 0.75) : 0.04) * SKY[mode].glow;
  }
  for (const [t, el] of themeLabels) el.classList.toggle('dim', !matched.some(i => i.theme === t));
  neighborLines.material.opacity = on ? 0.08 : 0.22;
  renderPanels(matched); renderActive(); renderResults(matched); renderList(matched);
  if (reframe && !state.selected) frame(on ? matched : []);
}

function select(it) {
  state.selected = it;
  document.body.classList.add('card-open');
  const words = [...terms(), ...state.tags];
  const sn = words.length && !words.every(w => it.n.titre.includes(w)) ? snippet(it, words) : null;
  const body = it.texte ? linkify(highlight(it.texte, words)) : it.contenu ? `<em>Extrait du document :</em> ${highlight(it.contenu.slice(0, 700), words)}…` : '';
  $('#card-body').innerHTML = `
    <div class="meta"><span class="chip"><span class="dot" style="color:${it.f.color}"></span>${it.f.label}</span>
      <button class="chip" data-theme="${esc(it.theme)}">${esc(it.theme)}</button><span>${fmtDate(it.date)}</span>${it.recent ? '<span class="badge-new">récent</span>' : ''}</div>
    <h2 id="card-title">${esc(it.titre)}</h2>
    ${it.vignette ? `<a href="${esc(it.url)}" target="_blank" rel="noopener"><img class="thumb" src="${esc(it.vignette)}" alt="Aperçu : ${esc(it.titre)}"></a>` : ''}
    <div class="actions"><a class="btn primary" href="${esc(it.url)}" target="_blank" rel="noopener">${it.f.action} ↗</a>
      ${it.linkedin ? `<a class="btn" href="${esc(it.linkedin)}" target="_blank" rel="noopener">Le post LinkedIn ↗</a>` : ''}
      ${it.lienPartage ? `<a class="btn" href="${esc(it.lienPartage)}" target="_blank" rel="noopener">Lien partagé ↗</a>` : ''}
      <button class="btn" id="share">Copier le lien</button></div>
    ${sn?.label ? `<p class="found">Trouvé ${sn.label} : ${sn.html}</p>` : ''}
    <div class="texte">${body}</div>
    <h3>Mots-clés</h3><div class="tags">${it.mots.slice(0, 10).map(([m]) => `<button class="chip" data-tag="${esc(norm(m))}">${esc(m)}</button>`).join('')}</div>
    ${it.voisins.length ? `<h3>Dans la même constellation</h3>${it.voisins.map(([id]) => row(items[id])).join('')}` : ''}`;
  $('#card').hidden = false;
  $('#card').scrollTop = 0;
  history.replaceState(null, '', '#r' + it.id);
  scene.remove(focusLines);
  focusLines = segments(it.voisins.map(([id]) => [it.pos, items[id].pos, new THREE.Color(it.f.color), new THREE.Color(items[id].f.color)]), 0.9);
  scene.add(focusLines);
  controls.autoRotate = false;
  if (!state.list) flyTo(it.pos, 16);
}
const linkify = html => html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/\n/g, '<br>');

function closeCard() {
  if (!state.selected) return;
  state.selected = null; $('#card').hidden = true; document.body.classList.remove('card-open');
  scene.remove(focusLines); focusLines = null;
  history.replaceState(null, '', location.pathname);
  if (!state.list) frame(filtering() ? items.filter(i => i.match) : []);
}

// Délégation d'événements
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.id) return select(items[+b.dataset.id]);
  if (b.dataset.theme) { if (state.selected) closeCard(); return toggle(state.themes, b.dataset.theme); }
  if (b.dataset.format) return toggle(state.formats, b.dataset.format);
  if (b.dataset.tag) { if (state.selected) closeCard(); return toggle(state.tags, b.dataset.tag); }
  if (b.dataset.remove) {
    const { remove: k, v } = b.dataset;
    if (k === 'all') { state.themes.clear(); state.formats.clear(); state.tags.clear(); state.recent = false; state.q = ''; $('#q').value = ''; }
    else if (k === 'recent') state.recent = false;
    else ({ theme: state.themes, format: state.formats, tag: state.tags })[k].delete(v);
    return update({ reframe: true });
  }
  if (b.id === 'share') { navigator.clipboard?.writeText(location.href); b.textContent = 'Lien copié ✓'; }
});
document.addEventListener('change', e => { if (e.target.id === 'only-recent') { state.recent = e.target.checked; update({ reframe: true }); } });
$('#card-close').addEventListener('click', closeCard);

let qTimer;
$('#q').addEventListener('input', e => { state.q = e.target.value; clearTimeout(qTimer); update(); qTimer = setTimeout(() => update({ reframe: true }), 350); });

document.querySelectorAll('[role=tab]').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('[role=tab]').forEach(t => { const on = t === tab; t.setAttribute('aria-selected', on); $('#' + t.getAttribute('aria-controls')).hidden = !on; });
}));

function setList(on) {
  state.list = on;
  $('#list-view').hidden = !on;
  $('#view-toggle').textContent = on ? 'Vue constellation' : 'Vue liste';
  $('#view-toggle').setAttribute('aria-pressed', on);
}
$('#view-toggle').addEventListener('click', () => setList(!state.list));

addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== $('#q')) { e.preventDefault(); $('#q').focus(); }
  if (e.key === 'Escape') closeCard();
});

applySky();
update();
setList(state.list);
const fromHash = location.hash.match(/^#r(\d+)$/);
if (fromHash && items[+fromHash[1]]) select(items[+fromHash[1]]);
