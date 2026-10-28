import assert from 'node:assert/strict';
import { parseCSV, tokens, tfidf, textVector, classify } from './lib.mjs';

const csv = 'Date,ShareLink,ShareCommentary\r\n2026-01-02 10:00:00,https://x/1,"Ligne 1\nLigne ""2"", fin"\n2026-01-03 10:00:00,https://x/2,court\n';
const rows = parseCSV(csv);
assert.equal(rows.length, 2);
assert.equal(rows[0].ShareCommentary, 'Ligne 1\nLigne "2", fin');
assert.equal(rows[1].ShareLink, 'https://x/2');

assert.deepEqual(tokens("L'intelligence et les compétences").map(t => t[0]), ['intelligence', 'competence']);

const docs = [
  { theme: 'IA', text: 'intelligence artificielle ChatGPT usage IA générative prompt' },
  { theme: 'IA', text: 'IA générative élèves enseignants intelligence artificielle cadre' },
  { theme: 'CPS', text: 'compétences psychosociales émotions empathie régulation' },
  { theme: 'CPS', text: 'compétences psychosociales climat scolaire bien-être empathie' },
];
const { idf } = tfidf(docs);
assert.equal(classify(textVector('Un prompt pour ChatGPT et l\'IA générative', idf), docs).theme, 'IA');
assert.equal(classify(textVector('Travailler l\'empathie et les émotions', idf), docs).theme, 'CPS');
console.log('ok');
