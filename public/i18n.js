// Textes de l'interface, en français et en anglais (les ressources restent en français).
// Une valeur peut être une fonction quand le texte contient un nombre ou une date.
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

export const L = {
  fr: {
    locale: 'fr-FR', switchTo: 'EN', switchLabel: 'Switch to English',
    tagline: 'Synthèses, notes de lecture & outils, constellés',
    homeTitle: "Retour à la vue d'ensemble", about: 'À propos', search: 'Rechercher',
    placeholder: 'Chercher une idée, un mot, un auteur…', exploreBy: 'Explorer par',
    tabThemes: 'Thèmes', tabTags: 'Mots-clés', tabFormats: 'Formats', tabRecent: 'Récents', tabTools: 'Outils',
    home: "⌂ Vue d'ensemble", homeHint: 'Effacer la recherche et les filtres', listView: 'Vue liste', skyView: 'Vue constellation',
    skyNight: '☾ Ciel de nuit', skyDay: '☀ Ciel clair', resources: 'Ressources', closeCard: 'Fermer la fiche', close: 'Fermer',
    updated: d => 'Mis à jour le ' + d,
    fmt_outil: 'Outil web', fmt_pdf: 'PDF', fmt_image: 'Infographie', fmt_lien: 'Lien, présentation', fmt_linkedin: 'Post LinkedIn',
    act_outil: "Lancer l'outil", act_pdf: 'Lire / télécharger', act_image: 'Voir en grand', act_lien: 'Ouvrir le lien', act_linkedin: 'Voir le post',
    recent: 'récent', recentChip: 'Récents', inDoc: 'dans le document', found: 'Trouvé',
    tagsHint: n => `Calculé sur les ${n} ressources affichées. Cliquez pour affiner.`, nRes: n => plural(n, 'ressource', 'ressources'),
    toolsHint: "Mes outils en ligne, libres d'accès.", open: 'Ouvrir', onlyRecent: 'Ne montrer que les ajouts récents (anneau orange)',
    remove: 'retirer', clearAll: 'Tout effacer',
    help1: (n, t) => `<b>${n} ressources</b> en ${t} constellations. Survolez une étoile, cliquez pour ouvrir sa fiche. Les fils relient les ressources qui parlent des mêmes choses.`,
    help2: "La recherche fouille aussi <b>l'intérieur des PDF</b>. Essayez « harcèlement », « Fullan » ou « jury ».",
    nothing: 'Rien trouvé. Essayez un mot plus court ou retirez un filtre.',
    excerpt: 'Extrait du document :', preview: 'Aperçu :', linkedinPost: 'Le post LinkedIn ↗', sharedLink: 'Lien partagé ↗',
    copyLink: 'Copier le lien', copied: 'Lien copié ✓', keywords: 'Mots-clés', neighbours: 'Dans la même constellation',
    stats: (n, t, d, u) => `${n} ressources · ${t} constellations · ${d} documents lus en entier · mis à jour le ${u}`,
    aboutTitle: 'À propos de Mes ciels',
    aboutBody: `<video class="about-video" controls playsinline preload="none" poster="media/mes-ciels.jpg" src="media/mes-ciels.mp4"></video>
  <p class="video-caption">Mes ciels en 39 secondes (avec musique).</p>
  <h3>Pourquoi un ciel ?</h3>
  <p>Jusqu'ici, je rangeais mes ressources sur un Digipad, <a href="https://digipad.app/p/1048315/ef646fbb8027e" target="_blank" rel="noopener">« Les étagères »</a>, en colonnes comme sur des étagères. Mais ça ne me convenait plus : ni la présentation, trop linéaire (des colonnes qu'on fait défiler), ni la mise à jour, trop laborieuse.</p>
  <p>Comme j'ai une pensée très graphique, j'ai voulu autre chose : m'inspirer des cartes mentales, tout en ouvrant d'autres façons de chercher. Ici, chaque ressource devient une étoile, chaque thème une constellation, et des fils relient les étoiles qui parlent des mêmes choses. <em>Ciel</em> comme les étoiles, et comme le <em>cloud</em> : un nuage de ressources.</p>
  <h3>Lire le ciel</h3>
  <ul class="legend" id="about-legend"></ul>
  <p>L'<b>anneau orange</b> signale les derniers ajouts. Les <b>fils</b> relient chaque ressource à celles dont le vocabulaire est le plus proche.</p>
  <h3>Trouver une information</h3>
  <ul>
    <li>La <b>recherche</b> lit tout le texte, y compris <b>l'intérieur des PDF</b>, sans tenir compte des accents.</li>
    <li>Le <b>nuage de mots-clés</b> est recalculé sur ce qui est affiché : chaque mot cliqué affine la sélection.</li>
    <li>L'onglet <b>Outils</b> donne un accès direct à mes outils en ligne (EPLESCOPE, NOVA EDT, Parcoursup…).</li>
    <li>Chaque fiche a un <b>lien permanent</b>, à partager.</li>
  </ul>
  <h3>Un bac à sable</h3>
  <p>L'ergonomie des supports numériques et l'intégration des fonctions de recherche m'intéressent beaucoup. Ce site est aussi un terrain pour tester et expérimenter : il évoluera.</p>
  <h3>Sous le capot</h3>
  <p>C'était l'occasion d'explorer, avec Claude Code, une chaîne complète :</p>
  <ul>
    <li>le contenu vit sur <b>GitHub</b>, et <b>Netlify</b> publie le site automatiquement ;</li>
    <li>une <b>interface d'ajout</b> toute simple, pour moi : je glisse un fichier, j'écris un commentaire, c'est en ligne deux minutes plus tard ;</li>
    <li>le lien avec <b>LinkedIn</b> : mes posts rejoignent d'eux-mêmes la bonne constellation.</li>
  </ul>
  <p>À chaque ajout, un petit programme lit le texte des PDF, repère les mots les plus caractéristiques de chaque ressource (méthode TF-IDF), mesure la proximité entre ressources pour tracer les fils, et range les posts dans la constellation la plus proche. Aucune IA n'intervient à ce moment-là : seulement du calcul sur les mots.</p>
  <p>Le site est statique : pas de base de données, pas de compte, <b>pas de cookie ni de traceur</b>. Tout reste libre d'accès. La 3D utilise Three.js.</p>
  <h3>Une charte graphique</h3>
  <p>Un même langage visuel, du logo (<b>Cassiopée</b>, dont les cinq étoiles dessinent le « M » de <em>Mes ciels</em> ; dans l'en-tête, elles dérivent puis se rassemblent) jusqu'à la bannière de mon profil LinkedIn, l'image d'aperçu et la vidéo, toutes dessinées à partir des vraies constellations du site.</p>
  <h3>Comment il a été fait</h3>
  <p>Conçu et développé en dialogue avec Claude (Anthropic), comme mes autres outils. Le code est ouvert : <a href="https://github.com/ilaer16/mes-ciels" target="_blank" rel="noopener">github.com/ilaer16/mes-ciels</a>. <a href="https://lnkd.in/p/eq_B8XzD" target="_blank" rel="noopener">Le post de présentation sur LinkedIn ↗</a></p>
  <p>Une remarque, une ressource qui ne s'ouvre pas ? Curieux de vos retours… écrivez-moi sur LinkedIn.</p>`,
  },
  en: {
    locale: 'en-GB', switchTo: 'FR', switchLabel: 'Passer en français',
    tagline: 'Summaries, reading notes & tools, mapped as constellations',
    intro: 'School leader in France (deputy head / principal). This is where I gather my summaries, reading notes and tools, arranged as constellations by theme. Everything can be downloaded. The resources themselves are in French.',
    homeTitle: 'Back to the full sky', about: 'About', search: 'Search',
    placeholder: 'Search an idea, a word, an author… (in French)', exploreBy: 'Explore by',
    tabThemes: 'Themes', tabTags: 'Keywords', tabFormats: 'Formats', tabRecent: 'Latest', tabTools: 'Tools',
    home: '⌂ Full sky', homeHint: 'Clear the search and filters', listView: 'List view', skyView: 'Sky view',
    skyNight: '☾ Night sky', skyDay: '☀ Day sky', resources: 'Resources', closeCard: 'Close', close: 'Close',
    updated: d => 'Updated on ' + d,
    fmt_outil: 'Web tool', fmt_pdf: 'PDF', fmt_image: 'Infographic', fmt_lien: 'Link, slides', fmt_linkedin: 'LinkedIn post',
    act_outil: 'Open the tool', act_pdf: 'Read / download', act_image: 'View full size', act_lien: 'Open the link', act_linkedin: 'See the post',
    recent: 'latest', recentChip: 'Latest', inDoc: 'inside the document', found: 'Found',
    tagsHint: n => `Computed on the ${n} resources shown. Click to narrow down.`, nRes: n => plural(n, 'resource', 'resources'),
    toolsHint: 'My online tools, free to use (in French).', open: 'Open', onlyRecent: 'Show only the latest additions (orange ring)',
    remove: 'remove', clearAll: 'Clear all',
    help1: (n, t) => `<b>${n} resources</b> in ${t} constellations. Hover over a star, click to open it. Threads link resources that talk about the same things.`,
    help2: 'Search also reads <b>inside the PDFs</b>. Resources are in French: try “IA”, “Fullan” or “Parcoursup”.',
    nothing: 'Nothing found. Try a shorter word (in French) or remove a filter.',
    excerpt: 'From the document:', preview: 'Preview:', linkedinPost: 'The LinkedIn post ↗', sharedLink: 'Shared link ↗',
    copyLink: 'Copy link', copied: 'Link copied ✓', keywords: 'Keywords', neighbours: 'In the same constellation',
    stats: (n, t, d, u) => `${n} resources · ${t} constellations · ${d} documents read in full · updated ${u}`,
    aboutTitle: 'About Mes ciels',
    aboutBody: `<video class="about-video" controls playsinline preload="none" poster="media/mes-ciels.jpg" src="media/mes-ciels.mp4"></video>
  <p class="video-caption">Mes ciels in 39 seconds (with music).</p>
  <h3>Why a sky?</h3>
  <p>Until now, I kept my resources on a Digipad board, <a href="https://digipad.app/p/1048315/ef646fbb8027e" target="_blank" rel="noopener">“Les étagères”</a> (“the shelves”), lined up in columns. It no longer suited me: the layout was too linear (columns you scroll through), and updating it was too tedious.</p>
  <p>I think very visually, so I wanted something else: drawing on mind maps while opening up other ways to search. Here each resource becomes a star, each theme a constellation, and threads connect the stars that talk about the same things. <em>Mes ciels</em> means “my skies”: stars, and the cloud too.</p>
  <h3>Reading the sky</h3>
  <ul class="legend" id="about-legend"></ul>
  <p>The <b>orange ring</b> marks the latest additions. <b>Threads</b> link each resource to those with the closest vocabulary.</p>
  <h3>Finding something</h3>
  <ul>
    <li><b>Search</b> reads all the text, <b>including inside the PDFs</b>, ignoring accents. The resources are in French.</li>
    <li>The <b>keyword cloud</b> is recomputed on what is shown: each word you click narrows the selection.</li>
    <li>The <b>Tools</b> tab gives direct access to my online tools (EPLESCOPE, NOVA EDT, Parcoursup…).</li>
    <li>Each resource has a <b>permanent link</b> you can share.</li>
  </ul>
  <h3>A sandbox</h3>
  <p>I am very interested in the usability of digital media and in how search features are built in. This site is also a playground to test and experiment: it will keep evolving.</p>
  <h3>Under the hood</h3>
  <p>It was a chance to explore, with Claude Code, a complete pipeline:</p>
  <ul>
    <li>the content lives on <b>GitHub</b>, and <b>Netlify</b> publishes the site automatically;</li>
    <li>a very simple <b>upload page</b>, just for me: I drop a file, write a comment, and it is online two minutes later;</li>
    <li>the link with <b>LinkedIn</b>: my posts find their own way into the right constellation.</li>
  </ul>
  <p>Each time something is added, a small program reads the text of the PDFs, picks out the most distinctive words of each resource (TF-IDF), measures how close resources are to draw the threads, and files posts into the nearest constellation. No AI is involved at that stage: just word statistics.</p>
  <p>The site is static: no database, no account, <b>no cookies, no trackers</b>. Everything is free to access. The 3D uses Three.js.</p>
  <h3>A visual identity</h3>
  <p>One visual language throughout: from the logo (<b>Cassiopeia</b>, whose five stars draw the “M” of <em>Mes ciels</em>; in the header they drift, then gather) to my LinkedIn profile banner, the link preview image and the video, all drawn from the site's real constellations.</p>
  <h3>How it was made</h3>
  <p>Designed and built in conversation with Claude (Anthropic), like my other tools. The code is open: <a href="https://github.com/ilaer16/mes-ciels" target="_blank" rel="noopener">github.com/ilaer16/mes-ciels</a>. <a href="https://lnkd.in/p/eq_B8XzD" target="_blank" rel="noopener">The launch post on LinkedIn ↗</a></p>
  <p>A comment, a resource that won't open? I'd love your feedback: message me on LinkedIn.</p>`,
  },
};

// Langue : ?lang=en|fr dans l'adresse, sinon dernier choix, sinon langue du navigateur
export function initialLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q in L) return q;
  try { const s = localStorage.getItem('lang'); if (s in L) return s; } catch {}
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
