# Mes ciels — constellations de ressources

Site statique (Three.js, sans framework), en ligne sur https://mesciels.netlify.app/.
Netlify reconstruit le site à chaque modification du dépôt GitHub `ilaer16/mes-ciels`.

## Ajouter une ressource : https://mesciels.netlify.app/ajouter/
1. **Première fois sur un appareil** : créer une clé GitHub (lien sur la page) avec l'accès au seul dépôt *mes-ciels* et la permission *Contents : Read and write*, puis la coller et cliquer sur « Enregistrer ». Elle reste dans ce navigateur.
2. **Glisser un fichier** (PDF, image…) **ou coller un lien** (outil, présentation, article, post LinkedIn).
3. Titre, thème (« Automatique » : rangé dans la constellation la plus proche du contenu), présentation (ton commentaire, le texte du post…), lien du post LinkedIn associé (facultatif).
4. **Publier.** Le site est à jour environ 2 minutes plus tard. Pour un PDF, la vignette est générée automatiquement à partir de la première page.

## Posts LinkedIn
LinkedIn ne permet pas de lire automatiquement les posts d'un profil personnel. On passe donc par l'export officiel :
1. LinkedIn → Vous → Préférences et confidentialité → Confidentialité des données → **Obtenir une copie de vos données** → cocher les publications (« Posts » / « Partages »).
2. Dans le .zip reçu par e-mail, glisser **`Shares.csv`** sur la page `/ajouter/`, puis cliquer sur « Mettre à jour les posts LinkedIn ».
3. À la reconstruction, chaque nouveau post devient une étoile violette, rangée par thème automatiquement. Un post qui présente une ressource déjà en ligne y est rattaché (bouton « Le post LinkedIn »). Les reposts et les posts de moins de 200 caractères sont ignorés.

Pour **imposer un thème** à un post, ajoute-le à `resources.json` avec son lien (`url`) et le `theme` voulu : l'entrée de `resources.json` prime sur l'export.

## Fichiers
```
resources.json         ← la liste des ressources (modifiable à la main sur github.com)
linkedin/Shares.csv    ← dernier export LinkedIn
public/files/          ← PDF et images
public/ajouter/        ← la page d'ajout
scripts/build.mjs      ← texte des PDF, posts LinkedIn, thèmes auto, mots-clés, liens -> public/data.json
```
Champs d'une ressource : `titre`, `theme` (facultatif : automatique), `format` (`outil`, `pdf`, `image`, `lien`, `linkedin`), `date`, `url`, `vignette`, `texte`, `linkedin`, `nouveau` (anneau orange forcé ; sinon automatique pendant 120 jours).

## En local
`npm ci`, `npm run build`, `npm run dev` (http://localhost:8090), `npm test`.
