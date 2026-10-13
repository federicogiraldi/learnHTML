import type { ModuleText } from '../../localize';

export default {
  title: 'HTML avanzato',
  description: 'Metadati e SEO, immagini responsive, prestazioni, template, SVG e dati strutturati.',
  items: {
    'adv-meta': {
      title: 'Metadati, SEO e condivisione social',
      explanation: `L'\`<head>\` contiene metadati che non vengono mai mostrati nella pagina, ma contano molto:

\`\`\`html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Handmade Ceramics | Studio Argilla</title>
  <meta name="description" content="Hand-thrown mugs and bowls from Florence.">
  <link rel="icon" href="/favicon.svg">
  <link rel="stylesheet" href="/styles.css">

  <meta property="og:title" content="Studio Argilla">
  <meta property="og:description" content="Hand-thrown mugs and bowls.">
  <meta property="og:image" content="https://example.com/cover.jpg">
</head>
\`\`\`

- **viewport** fa disegnare la pagina alla larghezza del dispositivo sui telefoni. Senza, i browser mobili mostrano una
  minuscola pagina desktop rimpicciolita.
- **title** e **description** sono ciò che i motori di ricerca mostrano nei risultati. Usa un titolo diverso per ogni pagina.
- I tag **Open Graph** (\`og:\`) controllano la scheda di anteprima quando il link viene condiviso su app social e chat.
- \`<link>\` collega risorse esterne: icone, fogli di stile, font.`,
      tasks: [
        'Aggiungi il meta tag viewport responsive',
        'Dai alla pagina un titolo descrittivo (non solo "Home")',
        'Aggiungi una meta description di 50–160 caratteri',
        'Aggiungi og:title, og:description e og:image',
        'Collega una favicon con <link rel="icon">',
      ],
      hints: ['Tutto quanto va dentro <head>.', 'og:image deve essere un URL assoluto che inizia con https://.'],
    },
    'adv-responsive-images': {
      title: 'Immagini responsive',
      explanation: `I telefoni non dovrebbero scaricare un'immagine da 3000 pixel per mostrarla larga 400. HTML lascia scegliere
al browser.

**\`srcset\` + \`sizes\`**: la stessa immagine, a risoluzioni diverse:

\`\`\`html
<img
  src="https://picsum.photos/id/1025/800/533"
  srcset="https://picsum.photos/id/1025/400/267 400w,
          https://picsum.photos/id/1025/800/533 800w,
          https://picsum.photos/id/1025/1600/1066 1600w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="A pug wrapped in a blanket" width="800" height="533">
\`\`\`

\`400w\` dice al browser la larghezza reale di ogni file; \`sizes\` gli dice quanto sarà larga l'immagine una volta
mostrata. Il browser fa i conti, tenendo conto anche della densità dello schermo.

**\`<picture>\`**: immagini o formati diversi (*art direction*). Vince il primo \`<source>\` che corrisponde, e
l'\`<img>\` all'interno è il ripiego obbligatorio:

\`\`\`html
<picture>
  <source media="(max-width: 600px)" srcset="https://picsum.photos/id/1025/400/400">
  <source type="image/avif" srcset="cover.avif">
  <img src="https://picsum.photos/id/1025/800/400" alt="A pug wrapped in a blanket" width="800" height="400">
</picture>
\`\`\``,
      tasks: [
        'Racchiudi l\'immagine in un <picture>',
        'Aggiungi un <source> per gli schermi piccoli (max-width: 600px) con un ritaglio quadrato',
        'Dai all\'<img> un srcset con almeno due larghezze (descrittori w)',
        'Indica al browser la dimensione di visualizzazione con sizes',
        'L\'<img> di ripiego mantiene alt, width e height',
      ],
      hints: ['Dentro <picture>, gli elementi <source> vengono prima dell\'<img>.'],
    },
    'adv-performance': {
      title: 'Prestazioni di caricamento',
      explanation: `Alcuni attributi fanno caricare le pagine molto più in fretta:

- \`loading="lazy"\` su immagini e iframe molto in basso nella pagina: si caricano solo quando l'utente ci si avvicina
  scorrendo. Non usarlo sulla prima immagine grande: quella deve caricarsi subito.
- \`fetchpriority="high"\` sull'immagine più importante (la "hero"), così il browser la scarica per prima.
- \`decoding="async"\` permette al browser di decodificare le immagini senza bloccare la pagina.
- Gli script bloccano il disegno della pagina. Usa \`defer\` (eseguito dopo che l'HTML è stato letto, in ordine) o
  \`async\` (eseguito appena scaricato, in qualsiasi ordine). Gli script \`type="module"\` sono automaticamente differiti.
- \`<link rel="preload">\` scarica presto le risorse critiche; \`<link rel="preconnect">\` prepara in anticipo una
  connessione verso un altro server.

\`\`\`html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <script src="app.js" defer></script>
</head>
<body>
  <img src="hero.jpg" fetchpriority="high" alt="..." width="1200" height="600">
  ...
  <img src="footer-photo.jpg" loading="lazy" alt="..." width="400" height="300">
</body>
\`\`\``,
      tasks: [
        'L\'immagine hero riceve fetchpriority="high" (e non è lazy)',
        'Le immagini sotto la parte visibile sono caricate in modo lazy',
        'L\'iframe della mappa è caricato in modo lazy',
        'analytics.js si carica con async',
        'gallery.js si carica con defer',
      ],
      hints: ['async è adatto a script indipendenti come gli analytics; defer a quelli che hanno bisogno della pagina.'],
    },
    'adv-data-template': {
      title: 'Attributi data e template',
      explanation: `Gli **attributi data personalizzati** memorizzano informazioni extra su qualsiasi elemento. Devono iniziare con \`data-\`:

\`\`\`html
<li data-product-id="A42" data-price="19.90">Blue mug</li>
\`\`\`

JavaScript li legge con \`element.dataset.productId\` e il CSS li può selezionare con \`[data-price]\`.

**\`<template>\`** contiene HTML che **non viene disegnato**: uno stampo che JavaScript clona per creare contenuti:

\`\`\`html
<ul id="list"></ul>
<template id="row">
  <li class="item"><strong></strong> — <span></span></li>
</template>
<script>
  const tpl = document.getElementById('row');
  for (const [name, price] of [['Mug', '€19'], ['Bowl', '€25']]) {
    const li = tpl.content.cloneNode(true);
    li.querySelector('strong').textContent = name;
    li.querySelector('span').textContent = price;
    document.getElementById('list').append(li);
  }
</script>
\`\`\`

Premi "Provalo" per vedere lo script riempire l'elenco a partire dal template. (Anche i Web Components usano \`<template>\`,
insieme a \`<slot>\`, per definire elementi personalizzati riutilizzabili.)`,
      tasks: [
        'Aggiungi un <template id="member">',
        'Il template contiene un <li> con un <h2> e un <p>',
        'Dai all\'<h1> un attributo data: data-section="team"',
      ],
      hints: ['Il contenuto del template resta invisibile; lo script lo clona tre volte.'],
    },
    'adv-svg-canvas': {
      title: 'SVG in linea e canvas',
      explanation: `HTML può disegnare grafica in due modi.

**SVG** (Scalable Vector Graphics) è un markup per forme. Resta nitido a qualsiasi dimensione e ogni forma è un elemento:

\`\`\`html
<svg width="200" height="120" viewBox="0 0 200 120" role="img" aria-labelledby="t">
  <title id="t">A red circle next to a blue square</title>
  <circle cx="50" cy="60" r="40" fill="tomato" />
  <rect x="110" y="20" width="80" height="80" fill="steelblue" />
</svg>
\`\`\`

- \`viewBox\` definisce il sistema di coordinate interno, così il disegno si ridimensiona insieme all'elemento.
- Aggiungi \`role="img"\` e un \`<title>\` così gli screen reader lo possono descrivere. (Dentro un SVG le forme si
  possono chiudere da sole.)

**\`<canvas>\`** è una bitmap vuota che JavaScript dipinge pixel per pixel: ideale per giochi e grafici con migliaia di
punti. Il suo contenuto è invisibile agli screen reader, quindi mettici dentro un testo di ripiego.

\`\`\`html
<canvas id="c" width="200" height="100">A green bar chart.</canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d');
  ctx.fillStyle = 'seagreen';
  ctx.fillRect(10, 40, 40, 60);
  ctx.fillRect(70, 10, 40, 90);
</script>
\`\`\``,
      tasks: [
        'Aggiungi un <svg> con un viewBox',
        'Disegna il riquadro con un <rect>',
        'Disegna tre luci con <circle> (rossa, arancione/gialla, verde)',
        'Rendilo accessibile: role="img" e un <title>',
      ],
      hints: ['Prima si disegna il rect, poi i cerchi sopra di esso.', 'cx e cy sono il centro del cerchio, r è il raggio.'],
    },
    'adv-microdata': {
      title: 'Dati strutturati',
      explanation: `I motori di ricerca possono mostrare **risultati arricchiti** (stelle di valutazione, tempi delle ricette, date
degli eventi) se descrivi i tuoi contenuti con un vocabolario condiviso di [schema.org](https://schema.org).

Il modo più comune è uno script **JSON-LD** nella pagina:

\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Tiramisù",
  "prepTime": "PT30M",
  "recipeIngredient": ["mascarpone", "coffee", "savoiardi"]
}
</script>
\`\`\`

L'alternativa sono i **microdati**, attributi messi direttamente sul tuo HTML:

\`\`\`html
<article itemscope itemtype="https://schema.org/Event">
  <h2 itemprop="name">Jazz night</h2>
  <time itemprop="startDate" datetime="2026-11-20T21:00">20 Nov, 9pm</time>
</article>
\`\`\`

- \`itemscope\` inizia un elemento, \`itemtype\` dice di che tipo di cosa si tratta.
- \`itemprop\` marca ogni proprietà di quell'elemento.`,
      tasks: [
        'Trasforma l\'articolo in una Recipe di schema.org con itemscope + itemtype',
        'Marca il titolo con itemprop="name"',
        'Marca l\'autore con itemprop="author"',
        'Marca il tempo con itemprop="totalTime"',
        'Aggiungi anche uno script JSON-LD con "@type": "Recipe"',
      ],
      hints: ['Il JSON vuole le virgolette doppie attorno a chiavi e stringhe, e nessuna virgola finale.'],
    },
    capstone: {
      title: 'Progetto finale: il tuo sito portfolio',
      summary: 'Tutto insieme: una pagina completa, accessibile e pronta per la produzione.',
      explanation: `Il progetto finale. Costruisci da un file vuoto un **portfolio di una sola pagina** che metta insieme tutto quello
che hai visto nel corso. Contenuti e struttura li decidi tu: le verifiche controllano solo la struttura.

La tua pagina deve avere:

- Un documento completo con lingua, charset, viewport, un titolo descrittivo, una meta description e i tag Open Graph.
- Uno skip link, un header con il tuo nome come unico \`<h1>\` e una navigazione con etichetta che porta a ogni sezione.
- Un \`<main>\` con almeno tre \`<section>\` (es. About, Projects, Contact), ognuna con un \`<h2>\` e un id.
- Una sezione **Projects** con almeno due \`<article>\`, ognuno con un'immagine responsive (\`srcset\`) in una
  \`<figure>\` con didascalia.
- Una tabella delle **competenze** con una didascalia, un \`<thead>\` e intestazioni di colonna con \`scope\`.
- Un **form di contatto** con email e messaggio obbligatori e con etichetta, inviato via POST.
- Un footer con i tuoi contatti in un \`<address>\` e un \`<time>\` per l'anno.
- Nessun errore strutturale, nessun link # rotto, nessun id duplicato e uno schema dei titoli senza livelli saltati.`,
      tasks: [
        'Head completo: doctype, lang, charset, viewport, title, description',
        'Titolo e immagine Open Graph',
        'Uno skip link che punta a <main>',
        'Header con l\'unico <h1> e un <nav> con etichetta',
        'Almeno 3 sezioni con un id e un <h2>',
        'La navigazione porta a ogni sezione',
        'Due articoli di progetto con immagini responsive e didascalia',
        'Tabella delle competenze: caption, thead, intestazioni con scope',
        'Form di contatto: POST, email e messaggio obbligatori, tutto con etichetta',
        'Footer con <address> e <time>',
        'Qualità: schema dei titoli valido, id unici, link # funzionanti',
      ],
      hints: [
        'Parti dallo scheletro del documento, poi scrivi header + nav + sezioni vuote, poi riempi ogni sezione.',
        'Usa https://picsum.photos/id/<n>/<w>/<h> per generare immagini di larghezze diverse per srcset.',
        'Confronta con i requisiti uno alla volta: ognuno corrisponde a una lezione che hai già fatto.',
      ],
    },
  },
  messages: {
    'Add <meta name="viewport" content="width=device-width, initial-scale=1">.':
      'Aggiungi <meta name="viewport" content="width=device-width, initial-scale=1">.',
    'Write a more descriptive <title>, at least 10 characters.': 'Scrivi un <title> più descrittivo, di almeno 10 caratteri.',
    'Add a meta description between 50 and 160 characters.': 'Aggiungi una meta description tra 50 e 160 caratteri.',
    'Add <link rel="icon" href="...">.': 'Aggiungi <link rel="icon" href="...">.',
    'List at least two images with 400w, 800w... in srcset.': 'Elenca in srcset almeno due immagini con 400w, 800w...',
    'Don\'t lazy-load the hero.': 'Non caricare la hero in modo lazy.',
    'Inside the template, add <li><h2></h2><p></p></li>.': 'Dentro il template, aggiungi <li><h2></h2><p></p></li>.',
    'Use fill colours for the lights.': 'Usa i colori fill per le luci.',
    'Add a <title> inside the <svg>.': 'Aggiungi un <title> dentro l\'<svg>.',
    'Set "@type": "Recipe".': 'Imposta "@type": "Recipe".',
    'The JSON-LD is not valid JSON. Check quotes and commas.': 'Il JSON-LD non è JSON valido. Controlla virgolette e virgole.',
    'Add lang to <html>.': 'Aggiungi lang a <html>.',
    'Write a descriptive <title>.': 'Scrivi un <title> descrittivo.',
    'Give <main> an id and link to it with a skip link.': 'Dai un id a <main> e collegalo con uno skip link.',
    'Add 3+ <section>s in <main>, each with an id and an <h2>.': 'Aggiungi 3 o più <section> in <main>, ognuna con un id e un <h2>.',
  },
} satisfies ModuleText;
