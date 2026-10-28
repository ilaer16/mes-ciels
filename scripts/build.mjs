// resources.json (+ linkedin/Shares.csv) + texte des PDF -> public/data.json
// (mots-clés, voisins, thème automatique, texte intégral pour la recherche)
import fs from 'node:fs';
import crypto from 'node:crypto';
import { extractText, getDocumentProxy } from 'unpdf';
import { tfidf, cosine, textVector, classify, parseCSV } from './lib.mjs';

const SITE = {
  auteur: 'Damien Dubreuil',
  intro: "Personnel de direction. Je range ici mes synthèses, notes de lecture et outils, constellés par thématiques. Tout est téléchargeable.",
  linkedin: 'https://www.linkedin.com/in/damien-dubreuil-7286bb1b9/', // URL de ton profil LinkedIn (affichée dans l'en-tête si renseignée)
};
const LINKEDIN_CSV = 'linkedin/Shares.csv'; // export LinkedIn, déposé tel quel dans le dépôt
const MIN_CHARS = 200;   // ignore les reposts sans commentaire et les posts très courts
const MIN_SCORE = 0.04;  // en dessous, la ressource part dans "Veille & divers"
const DUPLICATE = 0.55;  // au-dessus, le post présente une ressource existante : on l'y rattache

const resources = JSON.parse(fs.readFileSync('resources.json', 'utf8'));

async function pdfText(path) {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(fs.readFileSync(path)));
    const { text } = await extractText(pdf, { mergePages: true });
    // certains PDF exportés espacent chaque lettre : "J ' u t i l i s e"
    return text.replace(/(?<=(?:^|\s)\S) (?=\S(?:\s|$))/gu, '').replace(/\s+/g, ' ').trim();
  } catch (e) { console.warn('PDF illisible', path, e.message); return ''; }
}

const items = [];
for (const r of resources) {
  const local = !/^https?:/.test(r.url) && r.url.endsWith('.pdf') ? 'public/' + r.url : null;
  if (local && !fs.existsSync(local)) throw new Error(`Fichier manquant pour "${r.titre}" : ${local}`);
  const contenu = local ? await pdfText(local) : '';
  items.push({ ...r, contenu: contenu || undefined });
}
const fullText = it => `${it.titre} ${it.titre} ${it.titre} ${it.texte || ''} ${it.contenu || ''}`;

// Posts LinkedIn : rattachés à une ressource existante, ou ajoutés comme nouvelles étoiles
if (fs.existsSync(LINKEDIN_CSV)) {
  const docs = items.map(it => ({ it, text: fullText(it) }));
  const { idf } = tfidf(docs);
  const posts = docs.filter(d => d.it.texte).map(d => [d.it, textVector(d.it.texte, idf)]);
  const known = new Set(items.flatMap(it => [it.url, it.linkedin]).filter(Boolean));
  let added = 0, linked = 0;
  for (const row of parseCSV(fs.readFileSync(LINKEDIN_CSV, 'utf8'))) {
    const texte = (row.ShareCommentary || '').replace(/""/g, '"').trim(), url = row.ShareLink;
    if (!url || known.has(url) || texte.length < MIN_CHARS) continue;
    known.add(url);
    const vec = textVector(texte, idf);
    const twin = posts.map(([it, v]) => [it, cosine(vec, v)]).sort((a, b) => b[1] - a[1])[0];
    if (twin && twin[1] > DUPLICATE) { twin[0].linkedin ??= url; linked++; continue; }
    const titre = (texte.split('\n').map(l => l.trim()).find(l => l.length > 10) || texte).replace(/\s+/g, ' ').slice(0, 110);
    items.push({ titre, format: 'linkedin', date: (row.Date || '').slice(0, 10), url, lienPartage: row.SharedUrl || undefined, texte });
    added++;
  }
  console.log(`LinkedIn : ${added} posts ajoutés, ${linked} rattachés à une ressource existante`);
}

// Thème automatique pour les ressources sans thème (posts LinkedIn, ajouts sans thème choisi)
{
  const docs = items.map(it => ({ it, theme: it.theme, text: fullText(it) }));
  const { idf } = tfidf(docs);
  const themed = docs.filter(d => d.theme);
  for (const d of docs) if (!d.theme) {
    const { theme, score } = classify(d.vec, themed);
    d.it.theme = score >= MIN_SCORE ? theme : 'Veille & divers';
    d.it.themeAuto = true;
  }
}

items.forEach((it, i) => {
  it.id = i;
  it.cle = crypto.createHash('sha1').update(it.url).digest('hex').slice(0, 8); // lien de partage stable
  it.text = fullText(it);
});
const { display } = tfidf(items);

for (const it of items) {
  it.mots = [...it.vec].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, w]) => [display.get(k), +w.toFixed(3)]);
  it.voisins = items.filter(o => o !== it).map(o => [o.id, cosine(it.vec, o.vec)])
    .filter(([, s]) => s > 0.1).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id, s]) => [id, +s.toFixed(2)]);
}

const themes = [...new Set(items.map(i => i.theme))];
const out = { site: { ...SITE, majour: new Date().toISOString().slice(0, 10) }, themes, items: items.map(({ text, tf, vec, ...rest }) => rest) };
fs.writeFileSync('public/data.json', JSON.stringify(out));
console.log(`${items.length} ressources, ${themes.length} thèmes, ${items.filter(i => i.contenu).length} PDF indexés -> public/data.json`);
