// Analyse de texte partagée par build.mjs et import-linkedin.mjs (TF-IDF maison, sans dépendance).

const STOP = new Set(`alors au aucun aussi autre autres avant avec avoir bon car ce cela ces ceux chaque ci comme comment dans des du dedans dehors depuis devrait doit donc dos debut elle elles en encore est et etaient etait etant ete etre eu fait faites fois font hors ici il ils je juste la le les leur leurs lui ma mais me meme memes mes moins mon mot ne ni nommes notre nous nos ou par parce pas peut peu piece plupart pour pourquoi quand que quel quelle quelles quels qui sa sans ses seulement si sien son sont sous soyez sur ta tandis tellement tels tes ton tous tout toute toutes tres trop tu un une voient vont votre vous vos vu ca cette cet aux ont sera seront etc via entre plus tant leurs dont lors elle celle celui ceux celles avez avons fut sait faire peuvent permet permettre doivent ainsi afin chez selon toujours jamais deja bien tres apres avant puis donc lien liens version note notes https http www com lnkd html pdf the and for with you are that this from nbsp quelques mots point points part non oui deux trois quatre autre vers aussi cela ceci ici car faut faut-il etc rien tout sans sein lequel laquelle lesquels dire dit voir celui pendant comme comment peut-etre surtout souvent ensuite enfin chaque dun dune quil quelle cest nest sest jai eme qu’est-ce qu'est-ce peux`.split(/\s+/));

export const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Clé : forme normalisée sans pluriel simple ; on garde la forme d'origine la plus fréquente pour l'affichage.
export function tokens(text) {
  const out = [];
  for (const raw of (text || '').replace(/https?:\/\/\S+/g, ' ').toLowerCase().match(/[\p{L}][\p{L}\p{N}'’-]*/gu) || []) {
    const w = raw.replace(/^[a-z]['’]/, '').replace(/['’-]+$/, '');
    const n = norm(w);
    if (n.length < 3 || STOP.has(n) || /^\d/.test(n)) continue;
    out.push([n.length > 4 ? n.replace(/[sx]$/, '') : n, w]);
  }
  return out;
}

// docs: [{ text }] -> ajoute .vec (Map clé->poids normalisé L2) ; renvoie { idf, display }
export function tfidf(docs) {
  const df = new Map(), forms = new Map();
  for (const d of docs) {
    d.tf = new Map();
    for (const [k, w] of tokens(d.text)) {
      d.tf.set(k, (d.tf.get(k) || 0) + 1);
      const f = forms.get(k) || new Map(); f.set(w, (f.get(w) || 0) + 1); forms.set(k, f);
    }
    for (const k of d.tf.keys()) df.set(k, (df.get(k) || 0) + 1);
  }
  const N = docs.length, idf = new Map();
  for (const [k, n] of df) idf.set(k, Math.log((N + 1) / n));
  for (const d of docs) d.vec = vectorize(d.tf, idf);
  const display = new Map([...forms].map(([k, f]) => [k, [...f].sort((a, b) => b[1] - a[1])[0][0]]));
  return { idf, display };
}

export function vectorize(tf, idf) {
  const v = new Map(); let n2 = 0;
  for (const [k, c] of tf) { const x = Math.log(1 + c) * (idf.get(k) || 0); if (x > 0) { v.set(k, x); n2 += x * x; } }
  const n = Math.sqrt(n2) || 1;
  for (const [k, x] of v) v.set(k, x / n);
  return v;
}

export function cosine(a, b) {
  let s = 0; const [small, big] = a.size < b.size ? [a, b] : [b, a];
  for (const [k, x] of small) { const y = big.get(k); if (y) s += x * y; }
  return s;
}

export function textVector(text, idf) {
  const tf = new Map();
  for (const [k] of tokens(text)) tf.set(k, (tf.get(k) || 0) + 1);
  return vectorize(tf, idf);
}

// Thème le plus proche : similarité moyenne aux 3 ressources les plus proches de chaque thème.
export function classify(vec, docs) {
  const byTheme = new Map();
  for (const d of docs) { const s = cosine(vec, d.vec); (byTheme.get(d.theme) || byTheme.set(d.theme, []).get(d.theme)).push(s); }
  let best = null, score = 0;
  for (const [t, s] of byTheme) {
    const top = s.sort((a, b) => b - a).slice(0, 3), m = top.reduce((a, b) => a + b, 0) / top.length;
    if (m > score) { score = m; best = t; }
  }
  return { theme: best, score };
}

// CSV RFC 4180 (guillemets doublés, retours ligne dans les champs) -> tableau d'objets.
export function parseCSV(src) {
  const rows = []; let row = [], f = '', q = false;
  src = src.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '"') { if (src[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && src[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [head, ...body] = rows.filter(r => r.some(x => x !== ''));
  return body.map(r => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ''])));
}
