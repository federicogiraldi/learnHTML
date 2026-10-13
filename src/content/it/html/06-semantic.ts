import type { ModuleText } from '../../localize';

export default {
  title: 'HTML semantico',
  description: 'Le zone della pagina e gli elementi che dicono che cosa significa un contenuto, non come appare.',
  items: {
    'semantic-layout': {
      title: 'Le zone della pagina',
      explanation: `Per anni le pagine sono state costruite solo con dei \`<div>\`: scatole generiche senza significato. L'HTML
moderno ha elementi **semantici** che descrivono ogni zona della pagina:

| Elemento | Zona |
|---|---|
| \`<header>\` | Contenuto introduttivo: logo, titolo del sito, spesso la navigazione |
| \`<nav>\` | Un blocco di link di navigazione principali |
| \`<main>\` | Il contenuto principale: **uno solo per pagina** |
| \`<aside>\` | Contenuto collegato al contenuto principale ma separato da esso (barre laterali) |
| \`<footer>\` | Informazioni di chiusura: copyright, contatti, link |

\`\`\`html
<header>
  <h1>My site</h1>
  <nav>
    <a href="#">Home</a>
    <a href="#">Blog</a>
  </nav>
</header>
<main>
  <p>Content</p>
</main>
<footer>&copy; 2026</footer>
\`\`\`

Hanno esattamente lo stesso aspetto dei \`<div>\`, ma motori di ricerca, modalità di lettura dei browser e screen reader
li capiscono: chi usa uno screen reader può saltare direttamente a \`<main>\` o a \`<nav>\`.`,
      tasks: [
        'Sostituisci il div dell\'header con <header>',
        'Sostituisci il div della navigazione con <nav>, dentro l\'header',
        'Usa un solo <main> per il contenuto principale',
        'Trasforma la barra laterale in un <aside>',
        'Usa <footer> per il piè di pagina',
        'Nessun <div> rimasto',
      ],
      hints: ['I nomi delle classi ti dicono in quale elemento va trasformato ogni div.'],
    },
    'semantic-article': {
      title: 'Articoli e sezioni',
      explanation: `Due elementi organizzano il contenuto dentro \`<main>\`:

- \`<article>\`: un pezzo **autonomo** che avrebbe senso da solo: un post di un blog, una notizia, la scheda di un
  prodotto, un commento. Prova: potresti pubblicarlo da solo su un altro sito?
- \`<section>\`: un **gruppo tematico** di contenuti, di solito con un suo titolo. Un capitolo, una scheda, la parte
  "Caratteristiche" di una landing page.

\`\`\`html
<main>
  <section>
    <h2>Latest posts</h2>
    <article>
      <h3>Learning HTML</h3>
      <p>It's easier than you think.</p>
    </article>
    <article>
      <h3>CSS next</h3>
      <p>Time to add some style.</p>
    </article>
  </section>
</main>
\`\`\`

Un articolo può avere un suo \`<header>\` e un suo \`<footer>\` (per esempio autore e data).
Se ti serve solo una scatola per gli stili, \`<div>\` resta la scelta giusta: significa "nessun significato".`,
      tasks: [
        'Racchiudi "News" e le sue notizie in una <section>',
        'Trasforma ogni notizia in un <article>',
        'Metti la riga dell\'autore nel <footer> di ogni articolo',
        'Rendi "Weather" una <section> a parte',
      ],
      hints: ['Ogni articolo contiene il suo h3, il suo paragrafo e un <footer> con l\'autore.'],
    },
    'semantic-inline': {
      title: 'Time, address e compagnia',
      explanation: `Alcuni piccoli elementi aggiungono un significato leggibile dalle macchine:

- \`<time datetime="2026-10-06">\`: una data o un'ora. Il testo visibile può essere qualsiasi cosa; \`datetime\` contiene
  un formato standard (\`YYYY-MM-DD\`, \`HH:MM\`, o entrambi: \`2026-10-06T18:30\`).
- \`<address>\`: i contatti dell'articolo più vicino o della pagina (non un indirizzo postale qualsiasi).
- \`<data value="...">\`: collega un contenuto a un valore leggibile dalle macchine, come il codice di un prodotto.

\`\`\`html
<p>The concert starts on <time datetime="2026-12-24T21:00">Christmas Eve at 9pm</time>.</p>
<address>
  Written by <a href="mailto:anna@example.com">Anna</a>.
</address>
\`\`\`

Calendari, motori di ricerca ed estensioni del browser possono usare questi valori.`,
      tasks: [
        'Marca data e ora del laboratorio con <time datetime="2026-11-14T10:30">',
        'Marca la data di pubblicazione con <time datetime="2026-10-06">',
        'Metti i contatti in un <address>',
        'Trasforma l\'email in un link mailto:',
      ],
      hints: ['Il testo visibile resta uguale; solo l\'attributo datetime usa il formato standard.'],
    },
    'semantic-interactive': {
      title: 'Details, summary e dialog',
      explanation: `HTML ha dei widget interattivi che funzionano **senza JavaScript**.

\`<details>\` crea un widget a scomparsa: si vede solo il \`<summary>\` finché l'utente non ci clicca sopra.
Perfetto per le FAQ. Aggiungi \`open\` per farlo partire aperto, e dai a più elementi lo stesso \`name\` per creare
una fisarmonica in cui se ne apre solo uno alla volta.

\`\`\`html
<details name="faq">
  <summary>Is it free?</summary>
  <p>Yes, completely.</p>
</details>
<details name="faq">
  <summary>Do I need an account?</summary>
  <p>No.</p>
</details>
\`\`\`

\`<dialog>\` è una finestra a comparsa. Con l'attributo \`open\` viene mostrata; un form con \`method="dialog"\` al suo
interno la chiude quando viene inviato:

\`\`\`html
<dialog open>
  <p>Cookies help us improve the site.</p>
  <form method="dialog">
    <button>OK</button>
  </form>
</dialog>
\`\`\``,
      tasks: [
        'Trasforma ogni domanda in un <details> con un <summary>',
        'Le risposte stanno dentro il loro <details>',
        'Rendilo una fisarmonica: tutti e tre condividono lo stesso name',
        'Aggiungi un <dialog> aperto che dà il benvenuto al lettore, con un pulsante per chiuderlo',
        'Nessuna domanda rimasta in <h3>',
      ],
      hints: ['Clicca le domande nell\'anteprima per controllare che la fisarmonica funzioni.'],
    },
    'semantic-challenge': {
      title: 'Sfida: rifare la zuppa di div',
      summary: 'Trasforma una pagina fatta solo di <div> in HTML semantico pulito.',
      explanation: `Questa pagina di un blog è stata costruita interamente con \`<div>\` e \`<span>\`. Riscrivila in **HTML semantico**
senza perdere nessun contenuto. Usa ciò che hai imparato in tutto il corso: zone della pagina, articoli, sezioni, time,
address, elenchi ed enfasi.

I requisiti risultano superati o no solo quando fai la verifica.`,
      tasks: [
        'Zone: <header> con un <h1> e un <nav>, un solo <main>, un <aside>, un <footer>',
        'I link di navigazione sono un elenco (<ul> di <li>)',
        'Due <article> dentro <main>, ognuno con un <h2>',
        'Entrambe le date di pubblicazione usano <time datetime="YYYY-MM-DD">',
        'Date corrette: 2026-10-01 e 2026-09-20',
        '"Three reasons" è un <h3> seguito da un vero elenco',
        '"accessible" è marcato come importante',
        'I paragrafi di testo sono dei <p>',
        'I contatti sono in un <address> dentro il footer',
        'I titoli seguono uno schema corretto (h1 → h2 → h3)',
        'Nessun <div> o <span> rimasto',
      ],
      hints: [
        'Lavora dall\'alto verso il basso: header, main, aside, footer. Poi entra in ognuno.',
        'Il titolo della barra laterale può essere un <h2> dentro <aside>.',
      ],
    },
  },
  messages: {
    'Replace every <div> with a semantic element.': 'Sostituisci ogni <div> con un elemento semantico.',
    'Give every <details> the same name="...".': 'Dai a ogni <details> lo stesso name="...".',
    'Put a <form method="dialog"> with a <button> inside the dialog.': 'Metti un <form method="dialog"> con un <button> dentro il dialog.',
    'Questions now live in <summary>, remove the <h3>s.': 'Ora le domande stanno in <summary>: togli gli <h3>.',
    'Each article needs a <time> with datetime="YYYY-MM-DD".': 'Ogni articolo ha bisogno di un <time> con datetime="YYYY-MM-DD".',
    'A heading level is skipped.': 'Un livello di titolo viene saltato.',
    'Start with an <h1>.': 'Inizia con un <h1>.',
    'Some <div>s remain.': 'Ci sono ancora dei <div>.',
    'A <span> remains.': 'C\'è ancora uno <span>.',
  },
} satisfies ModuleText;
