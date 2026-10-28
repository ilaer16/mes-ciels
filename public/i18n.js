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
    aboutBody: `<h3>Pourquoi un ciel ?</h3>
  <p>Mes ressources vivaient sur un Digipad, rangées en colonnes comme sur des étagères. J'ai voulu un lieu où elles se répondent : chaque ressource devient une étoile, chaque thème une constellation, et des fils relient les étoiles qui parlent des mêmes choses. <em>Ciel</em> comme les étoiles, et comme le <em>cloud</em> : un nuage de ressources.</p>
  <h3>Lire le ciel</h3>
  <ul class="legend" id="about-legend"></ul>
  <p>L'<b>anneau orange</b> signale les derniers ajouts. Les <b>fils</b> relient chaque ressource à celles dont le vocabulaire est le plus proche.</p>
  <h3>Trouver une information</h3>
  <ul>
    <li>La <b>recherche</b> lit tout le texte, y compris <b>l'intérieur des PDF</b>, sans tenir compte des accents.</li>
    <li>Le <b>nuage de mots-clés</b> est recalculé sur ce qui est affiché : chaque mot cliqué affine la sélection.</li>
    <li>Chaque fiche a un <b>lien permanent</b>, à partager.</li>
  </ul>
  <h3>Sous le capot</h3>
  <p>À chaque ajout, un petit programme lit le texte des PDF, repère les mots les plus caractéristiques de chaque ressource (méthode TF-IDF), mesure la proximité entre ressources pour tracer les fils, et range automatiquement mes posts LinkedIn dans la constellation la plus proche. Aucune IA n'intervient à ce moment-là : seulement du calcul sur les mots.</p>
  <p>Le site est statique : pas de base de données, pas de compte, <b>pas de cookie ni de traceur</b>. La 3D utilise Three.js ; le contenu est sur GitHub et le site est publié par Netlify.</p>
  <h3>Comment il a été fait</h3>
  <p>Conçu et développé en dialogue avec Claude (Anthropic), comme mes autres outils. Le code est ouvert : <a href="https://github.com/ilaer16/mes-ciels" target="_blank" rel="noopener">github.com/ilaer16/mes-ciels</a>. Une remarque, une ressource qui ne s'ouvre pas ? Écrivez-moi sur LinkedIn.</p>`,
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
    aboutBody: `<h3>Why a sky?</h3>
  <p>My resources used to live on a Digipad board, lined up in columns like books on shelves. I wanted a place where they could speak to each other: each resource becomes a star, each theme a constellation, and threads connect the stars that talk about the same things. <em>Mes ciels</em> means “my skies”: stars, and the cloud too.</p>
  <h3>Reading the sky</h3>
  <ul class="legend" id="about-legend"></ul>
  <p>The <b>orange ring</b> marks the latest additions. <b>Threads</b> link each resource to those with the closest vocabulary.</p>
  <h3>Finding something</h3>
  <ul>
    <li><b>Search</b> reads all the text, <b>including inside the PDFs</b>, ignoring accents. The resources are in French.</li>
    <li>The <b>keyword cloud</b> is recomputed on what is shown: each word you click narrows the selection.</li>
    <li>Each resource has a <b>permanent link</b> you can share.</li>
  </ul>
  <h3>Under the hood</h3>
  <p>Each time something is added, a small program reads the text of the PDFs, picks out the most distinctive words of each resource (TF-IDF), measures how close resources are to draw the threads, and files my LinkedIn posts into the nearest constellation. No AI is involved at that stage: just word statistics.</p>
  <p>The site is static: no database, no account, <b>no cookies, no trackers</b>. The 3D uses Three.js; the content lives on GitHub and the site is published by Netlify.</p>
  <h3>How it was made</h3>
  <p>Designed and built in conversation with Claude (Anthropic), like my other tools. The code is open: <a href="https://github.com/ilaer16/mes-ciels" target="_blank" rel="noopener">github.com/ilaer16/mes-ciels</a>. A comment, a resource that won't open? Message me on LinkedIn.</p>`,
  },
};

// Langue : ?lang=en|fr dans l'adresse, sinon dernier choix, sinon langue du navigateur
export function initialLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q in L) return q;
  try { const s = localStorage.getItem('lang'); if (s in L) return s; } catch {}
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
