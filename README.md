# Mes ciels — constellations de ressources

Site statique (Three.js, sans framework). Une seule source de vérité : **`resources.json`**.

```
resources.json         ← la liste des ressources (à modifier)
public/files/          ← PDF et images
public/index.html, app.js, style.css
scripts/build.mjs      ← extrait le texte des PDF, calcule mots-clés et liens -> public/data.json
scripts/import-linkedin.mjs
```

## Ajouter une ressource
1. Déposer le fichier dans `public/files/` (si c'est un PDF ou une image).
2. Ajouter une entrée **à la fin** de `resources.json` :
   ```json
   { "titre": "…", "theme": "IA et éducation", "format": "pdf", "date": "2026-11-02",
     "url": "files/mon-fichier.pdf", "vignette": "files/mon-fichier.jpg", "texte": "Présentation, post LinkedIn…" }
   ```
   - `format` : `outil`, `pdf`, `image`, `lien` ou `linkedin` (couleur de l'étoile).
   - `theme` : un thème existant, ou un nouveau, qui crée une nouvelle constellation.
   - `nouveau: true` force l'anneau orange. Sinon, l'anneau apparaît automatiquement pendant 120 jours.
   - `linkedin` : lien vers le post LinkedIn qui présente la ressource (facultatif).
3. `npm run build` puis `npm run dev` pour vérifier sur http://localhost:8080.

Ajoute toujours à la fin : le lien de partage d'une fiche (`#r12`) est sa position dans la liste.

## Importer ses posts LinkedIn
LinkedIn ne permet pas de lire automatiquement les posts d'un profil personnel. Le circuit passe donc par l'export officiel :
1. LinkedIn → Préférences → Confidentialité des données → **Obtenir une copie de vos données** → cocher « Posts » (fichier `Shares.csv`, reçu par e-mail en quelques minutes).
2. `npm run build` (une fois, pour que le classement profite du texte des PDF), puis :
   ```
   npm run linkedin -- chemin/vers/Shares.csv
   ```
   - Les nouveaux posts sont ajoutés avec un thème choisi automatiquement (marqués `"themeAuto": true` : à relire).
   - Un post qui présente une ressource déjà en ligne y est rattaché (bouton « Le post LinkedIn »).
   - Les reposts et les posts de moins de 200 caractères sont ignorés. On peut relancer l'import : rien n'est ajouté en double.
3. `npm run build`.

## Mettre en ligne sur Netlify
- **Avec GitHub (conseillé)** : pousser ce dossier sur un dépôt, puis Netlify → Add new site → Import from Git. `netlify.toml` règle tout (build `npm run build`, dossier `public`). Ensuite, chaque modification de `resources.json` sur github.com redéploie le site.
- **Sans GitHub** : `npm run build`, puis glisser le dossier `public/` sur https://app.netlify.com/drop.

## Vérifier
`npm test` (lecture CSV, classement par thème).
