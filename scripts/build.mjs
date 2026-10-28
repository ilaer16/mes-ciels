// resources.json + texte des PDF -> public/data.json (mots-clés, voisins, texte intégral pour la recherche)
import fs from 'node:fs';
import { extractText, getDocumentProxy } from 'unpdf';
import { tfidf, cosine } from './lib.mjs';

const SITE = {
  auteur: 'Damien Dubreuil',
  intro: "Personnel de direction. Je range ici mes synthèses, notes de lecture et outils, constellés par thématiques. Tout est téléchargeable.",
  linkedin: 'https://www.linkedin.com/in/damien-dubreuil-7286bb1b9/', // URL de ton profil LinkedIn (affichée dans l'en-tête si renseignée)
};

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
for (const [i, r] of resources.entries()) {
  const local = !/^https?:/.test(r.url) && r.url.endsWith('.pdf') ? 'public/' + r.url : null;
  if (local && !fs.existsSync(local)) throw new Error(`Fichier manquant pour "${r.titre}" : ${local}`);
  const contenu = local ? await pdfText(local) : '';
  items.push({ id: i, ...r, contenu: contenu || undefined, text: `${r.titre} ${r.titre} ${r.titre} ${r.texte || ''} ${contenu}` });
}

const { display } = tfidf(items);

for (const it of items) {
  it.mots = [...it.vec].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, w]) => [display.get(k), +w.toFixed(3)]);
  it.voisins = items.filter(o => o !== it).map(o => [o.id, cosine(it.vec, o.vec)])
    .filter(([, s]) => s > 0.1).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id, s]) => [id, +s.toFixed(2)]);
}

const themes = [...new Set(items.map(i => i.theme))];
const out = { site: SITE, themes, items: items.map(({ text, tf, vec, ...rest }) => rest) };
fs.writeFileSync('public/data.json', JSON.stringify(out));
console.log(`${items.length} ressources, ${themes.length} thèmes, ${items.filter(i => i.contenu).length} PDF indexés -> public/data.json`);
