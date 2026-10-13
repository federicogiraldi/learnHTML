import type { ModuleText } from '../../localize';

export default {
  title: 'Link e media',
  description: 'Collegamenti, immagini, figure, audio, video e contenuti incorporati.',
  items: {
    'links-basics': {
      title: 'Link',
      explanation: `L'elemento **a**ncora \`<a>\` crea un link. L'attributo \`href\` dice dove porta:

\`\`\`html
<a href="https://developer.mozilla.org">MDN Web Docs</a>
\`\`\`

Tipi di \`href\`:

- **URL assoluto**: \`https://example.com/page\`: un altro sito web.
- **URL relativo**: \`about.html\` o \`../images/cat.png\`: un file relativo alla pagina corrente.
- **Email / telefono**: \`mailto:hi@example.com\`, \`tel:+390612345678\`.

\`target="_blank"\` apre il link in una nuova scheda. Avvisa l'utente; e il testo di un link deve descrivere la sua
destinazione: "clicca qui" non dice niente a chi usa uno screen reader.

\`\`\`html
<p>Read the <a href="https://html.spec.whatwg.org" target="_blank">HTML specification</a> (opens in a new tab).</p>
\`\`\``,
      tasks: [
        'Collega "MDN Web Docs" a https://developer.mozilla.org',
        'Fai aprire quel link in una nuova scheda',
        'Collega "About this site" alla pagina relativa about.html',
        'Trasforma "Email me" in un link mailto:',
        'Tutti i link sono dentro le voci dell\'elenco',
      ],
      hints: ['<a href="about.html">About this site</a>', 'mailto:tu@example.com'],
    },
    'links-anchors': {
      title: 'Saltare dentro una pagina',
      explanation: `Un link può anche saltare a una parte della *stessa* pagina. Dai un \`id\` alla destinazione, poi collegala con
\`#\` seguito dall'id:

\`\`\`html
<nav>
  <a href="#faq">FAQ</a>
</nav>
<h2 id="faq">Frequently asked questions</h2>
<a href="#top">Back to top</a>
\`\`\`

È così che funziona un *indice*. Gli id distinguono maiuscole e minuscole e devono essere unici.
Prova a cliccare i link nell'anteprima!`,
      tasks: [
        'Dai a ogni <h2> un id unico',
        'Trasforma le tre voci dell\'indice in link #',
        'Ogni link # punta a un id esistente',
        'Aggiungi alla fine un link "Back to top"',
      ],
      hints: ['<h2 id="intro">Introduction</h2> e <a href="#intro">Introduction</a>'],
    },
    'media-images': {
      title: 'Immagini',
      explanation: `\`<img>\` è un elemento vuoto che incorpora un'immagine:

\`\`\`html
<img src="https://picsum.photos/id/237/400/300" alt="A black puppy looking up" width="400" height="300">
\`\`\`

- \`src\`: dove si trova il file dell'immagine.
- \`alt\`: il **testo alternativo**, letto dagli screen reader e mostrato se l'immagine non si carica. Descrivi ciò che
  conta dell'immagine. Per immagini puramente decorative usa un \`alt=""\` vuoto, così viene saltata.
- \`width\` / \`height\`: la dimensione intrinseca in pixel. Indicarle permette al browser di riservare lo spazio ed evita
  che la pagina "salti" durante il caricamento.

Anche un'immagine può essere un link: racchiudi l'\`<img>\` in un \`<a>\`.`,
      tasks: [
        'Aggiungi la foto del cucciolo',
        'Aggiungi la foto del gatto',
        'Ogni immagine ha un testo alt significativo',
        'Ogni immagine ha width e height',
        'Trasforma una delle immagini in un link alla sua versione a grandezza piena',
      ],
      hints: ['<a href="https://picsum.photos/id/40/1200/900"><img ...></a>'],
    },
    'media-figure': {
      title: 'Figure e didascalie',
      explanation: `\`<figure>\` raggruppa un contenuto autonomo (un'immagine, un grafico, un listato di codice) con una
didascalia facoltativa in \`<figcaption>\`:

\`\`\`html
<figure>
  <img src="https://picsum.photos/id/1018/400/250" alt="Mountains under a cloudy sky" width="400" height="250">
  <figcaption>The Dolomites in October.</figcaption>
</figure>
\`\`\`

La didascalia è testo visibile legato alla figura. Non sostituisce \`alt\`: \`alt\` *descrive* l'immagine,
la didascalia la *commenta*.`,
      tasks: [
        'Racchiudi ogni immagine nella sua <figure>',
        'Trasforma ogni descrizione in una <figcaption>',
        'Nessuna didascalia rimasta come semplice paragrafo',
      ],
      hints: ['<figcaption> va dentro <figure>, prima o dopo l\'immagine.'],
    },
    'media-av': {
      title: 'Audio, video e iframe',
      explanation: `\`<video>\` e \`<audio>\` riproducono contenuti multimediali in modo nativo. Aggiungi \`controls\` così
l'utente può avviare, mettere in pausa e cambiare il volume:

\`\`\`html
<video controls width="400" poster="https://picsum.photos/id/1043/400/225">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
  Your browser doesn't support video.
</video>
\`\`\`

- Più elementi \`<source>\` offrono formati alternativi; il browser sceglie il primo che supporta.
- Il testo dentro l'elemento è un ripiego per i browser molto vecchi.
- \`<track kind="captions">\` aggiunge i sottotitoli: indispensabili per le persone sorde.
- Evita \`autoplay\`: se proprio serve, aggiungi \`muted\`.

\`<iframe>\` incorpora un'altra pagina web (mappe, video di altri siti). Dagli sempre un \`title\` che ne descriva
il contenuto.

\`\`\`html
<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=12.48,41.89,12.50,41.90" width="400" height="250" title="Map of central Rome"></iframe>
\`\`\``,
      tasks: [
        'Aggiungi un <video> con controls',
        'Dai al video due formati <source> con un type',
        'Aggiungi un elemento <audio> con controls e l\'mp3 del ruggito',
        'Incorpora una mappa in un <iframe> con un title',
      ],
      hints: ['Copia l\'esempio del video con "Provalo", poi aggiungi il resto.'],
    },
    'links-media-challenge': {
      title: 'Sfida: guida di viaggio',
      summary: 'Una guida di una sola pagina con indice, figure e una mappa incorporata.',
      explanation: `Costruisci una **guida di viaggio** di una sola pagina per una città che ti piace, partendo da un file vuoto.

Deve essere navigabile da un indice in cima, illustrata con foto con didascalia
(usa \`https://picsum.photos/id/<number>/400/300\` come immagini segnaposto) e includere una mappa.`,
      tasks: [
        'Un <h1> con id="top" e almeno tre sezioni <h2>',
        'Un indice: un elenco con un link # verso ogni <h2>',
        'Tutti i link # portano da qualche parte',
        'Almeno due <figure>, ognuna con un <img> e una <figcaption>',
        'Ogni immagine ha alt, width e height',
        'Un link esterno che si apre in una nuova scheda',
        'Una mappa incorporata in un <iframe> con title',
        'Un link "Back to top"',
      ],
      hints: [
        'Prima dai un id a ogni <h2>, poi scrivi l\'indice.',
        'Mappe OpenStreetMap incorporate: https://www.openstreetmap.org/export/embed.html?bbox=<lon1>,<lat1>,<lon2>,<lat2>',
      ],
    },
  },
  messages: {
    'Add target="_blank" to the MDN link.': 'Aggiungi target="_blank" al link di MDN.',
    'Replace the <p> captions with <figcaption>.': 'Sostituisci le didascalie in <p> con <figcaption>.',
    'Use the t-rex-roar.mp3 file.': 'Usa il file t-rex-roar.mp3.',
    'Give the <h1> id="top".': 'Dai all\'<h1> id="top".',
    'Every <h2> needs an id that the table of contents links to.': 'Ogni <h2> ha bisogno di un id collegato dall\'indice.',
    'Add an external link with target="_blank".': 'Aggiungi un link esterno con target="_blank".',
  },
} satisfies ModuleText;
