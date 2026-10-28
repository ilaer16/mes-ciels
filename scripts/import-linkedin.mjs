// Usage : npm run linkedin -- chemin/vers/Shares.csv
// Shares.csv vient de l'export LinkedIn (Préférences > Confidentialité > Obtenir une copie de vos données).
// Ajoute les nouveaux posts à resources.json, rangés automatiquement dans le thème le plus proche.
import fs from 'node:fs';
import { parseCSV, tfidf, textVector, classify, cosine } from './lib.mjs';

const file = process.argv[2];
if (!file) { console.error('Usage : npm run linkedin -- Shares.csv'); process.exit(1); }

const MIN_CHARS = 200;   // ignore les reposts sans commentaire et les posts très courts
const MIN_SCORE = 0.04;  // en dessous, le post part dans "Veille & divers"
const DUPLICATE = 0.55;  // au-dessus, le post est la présentation d'une ressource existante

const resources = JSON.parse(fs.readFileSync('resources.json', 'utf8'));
// Le texte des PDF (extrait par le build) améliore beaucoup le classement des thèmes peu commentés.
const contenus = fs.existsSync('public/data.json') ? JSON.parse(fs.readFileSync('public/data.json', 'utf8')).items : [];
const contenu = r => contenus.find(i => i.url === r.url)?.contenu || '';
const docs = resources.map(r => ({ theme: r.theme, text: `${r.titre} ${r.titre} ${r.texte || ''} ${contenu(r)}`, r }));
const { idf } = tfidf(docs);
for (const d of docs) d.post = textVector(d.r.texte || '', idf);
const known = new Set(resources.flatMap(r => [r.url, r.linkedin]).filter(Boolean));

let added = 0, linked = 0, skipped = 0;
for (const row of parseCSV(fs.readFileSync(file, 'utf8'))) {
  const texte = (row.ShareCommentary || '').replace(/""/g, '"').trim();
  const url = row.ShareLink;
  if (!url || known.has(url) || texte.length < MIN_CHARS) { skipped++; continue; }
  const vec = textVector(texte, idf);

  const twin = docs.map(d => [d, cosine(vec, d.post)]).sort((a, b) => b[1] - a[1])[0];
  if (twin && twin[1] > DUPLICATE) { twin[0].r.linkedin = url; known.add(url); linked++; continue; }

  const { theme, score } = classify(vec, docs);
  const titre = texte.split('\n').map(l => l.trim()).find(l => l.length > 10).replace(/\s+/g, ' ').slice(0, 110);
  resources.push({
    titre, theme: score >= MIN_SCORE ? theme : 'Veille & divers', themeAuto: true,
    format: 'linkedin', date: row.Date.slice(0, 10), url,
    lienPartage: row.SharedUrl || undefined, texte,
  });
  known.add(url); added++;
  console.log(`+ [${score >= MIN_SCORE ? theme : 'Veille & divers'} · ${score.toFixed(2)}] ${titre.slice(0, 70)}`);
}

fs.writeFileSync('resources.json', JSON.stringify(resources, null, 2));
console.log(`\n${added} posts ajoutés, ${linked} rattachés à une ressource existante, ${skipped} ignorés.`);
console.log('Vérifie les thèmes marqués "themeAuto": true dans resources.json, puis : npm run build');
