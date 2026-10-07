import type { ModuleText } from '../../localize';

export default {
  title: 'Basi di HTML',
  description: 'Tag, elementi, attributi e lo scheletro comune a ogni pagina web.',
  items: {
    'basics-first-tag': {
      title: 'Il tuo primo tag',
      explanation: `HTML (HyperText Markup Language) descrive la **struttura** di una pagina web. Racchiudi il contenuto
nei **tag** per dire al browser che cosa *è* ogni parte del contenuto.

La maggior parte dei tag va a coppie: un tag di apertura \`<p>\` e un tag di chiusura \`</p>\` con la barra. Il tag di
apertura, il contenuto e il tag di chiusura insieme formano un **elemento**.

\`\`\`html
<p>This is a paragraph.</p>
\`\`\`

\`<h1>\` è il titolo principale di una pagina: pensalo come il titolo in prima pagina di un giornale.

\`\`\`html
<h1>Breaking news</h1>
<p>HTML is easy to learn.</p>
\`\`\`

Scrivi nell'editor a destra: l'anteprima si aggiorna mentre scrivi e la checklist qui sotto si spunta da sola.`,
      tasks: [
        'Aggiungi un titolo <h1> con il testo "Hello, World!"',
        'Aggiungi sotto un paragrafo <p> in cui ti presenti',
        'Il titolo viene prima del paragrafo',
      ],
      hints: [
        'Apri con <h1>, scrivi il testo, chiudi con </h1>.',
        'Un paragrafo è fatto così: <p>Mi chiamo Ada.</p>',
      ],
    },
    'basics-document': {
      title: 'Lo scheletro del documento',
      explanation: `Una vera pagina HTML ha uno scheletro fisso:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My page</title>
  </head>
  <body>
    <h1>Visible content goes here</h1>
  </body>
</html>
\`\`\`

- \`<!DOCTYPE html>\` dice al browser di usare l'HTML moderno. Non è un tag, solo una dichiarazione.
- \`<html>\` racchiude tutto. Il suo attributo \`lang\` indica in che lingua è scritta la pagina.
- \`<head>\` contiene informazioni *sulla* pagina: la codifica dei caratteri e il \`<title>\` mostrato nella scheda del browser.
- \`<body>\` contiene tutto ciò che viene *mostrato* nella pagina.

Nota l'indentazione: gli elementi dentro altri elementi sono **annidati**, e indentarli rende la struttura facile
da leggere.`,
      tasks: [
        'Inizia con <!DOCTYPE html>',
        'Racchiudi tutto in <html lang="en">',
        'Aggiungi un <head> con <meta charset="UTF-8">',
        'Dai alla pagina un <title> dentro <head>',
        'Metti il titolo e il paragrafo dentro <body>',
      ],
      hints: [
        'Usa il pulsante "Provalo" sull\'esempio per vedere la struttura completa.',
        'Prima viene <head>, poi <body>. Entrambi vanno dentro <html>.',
      ],
    },
    'basics-headings': {
      title: 'Titoli e paragrafi',
      explanation: `HTML ha sei livelli di titolo, da \`<h1>\` (il più importante) a \`<h6>\` (il meno importante).
Creano uno **schema** della pagina, come i capitoli e le sezioni di un libro:

\`\`\`html
<h1>Cooking 101</h1>
<h2>Breakfast</h2>
<p>Start the day right.</p>
<h3>Pancakes</h3>
<p>Fluffy and easy.</p>
<h2>Dinner</h2>
<p>Something warm.</p>
\`\`\`

Regole pratiche:

- Usa **un solo** \`<h1>\` per pagina.
- Non saltare livelli: un \`<h3>\` deve stare sotto un \`<h2>\`.
- Scegli un titolo per il suo *significato*, non per la sua dimensione. La dimensione è compito del CSS.

I browser ignorano gli spazi e gli a capo in più nel testo: se scrivi più spazi di fila, ne vedi uno solo.`,
      tasks: [
        'Mantieni esattamente un <h1>',
        'Aggiungi due sezioni <h2> (per esempio due città)',
        'Aggiungi almeno un <h3> sotto uno degli <h2>',
        'Scrivi almeno tre paragrafi',
      ],
      hints: ['Ogni sezione può essere un <h2> seguito da un <p>. Una sottosezione è un <h3> dopo il suo <h2>.'],
    },
    'basics-breaks-comments': {
      title: 'A capo, linee e commenti',
      explanation: `Alcuni elementi **non hanno contenuto** e quindi nemmeno un tag di chiusura. Si chiamano *elementi vuoti*
(void elements).

- \`<br>\` forza un a capo dentro il testo: utile per indirizzi o poesie.
- \`<hr>\` segna uno stacco tematico tra sezioni (disegnato come una linea orizzontale).

\`\`\`html
<p>Roses are red,<br>violets are blue.</p>
<hr>
<p>A new topic starts here.</p>
\`\`\`

Potresti vederli scritti come \`<br />\`: vanno bene entrambe le forme, ma \`</br>\` è sbagliato.

I **commenti** sono note per le persone. Il browser li ignora:

\`\`\`html
<!-- TODO: add a photo here -->
\`\`\``,
      tasks: [
        'Dividi la poesia in righe con almeno due <br>',
        'Separa la poesia dalla sezione sull\'autore con un <hr>',
        'Lascia un commento da qualche parte nel codice',
      ],
      hints: ['Metti <br> tra le righe dentro lo stesso <p>.', 'Un commento è fatto così: <!-- nota -->.'],
    },
    'basics-attributes': {
      title: 'Attributi',
      explanation: `Gli **attributi** aggiungono informazioni a un elemento. Vanno sempre nel tag di *apertura*, come coppie
\`nome="valore"\`:

\`\`\`html
<p id="intro" title="Hover me!">Hover this paragraph.</p>
\`\`\`

Alcuni attributi funzionano su (quasi) tutti gli elementi: si chiamano *attributi globali*:

| Attributo | Cosa fa |
|---|---|
| \`id\` | Un nome unico per un solo elemento della pagina |
| \`class\` | Uno o più nomi di gruppo, separati da spazi, usati da CSS e JS |
| \`title\` | Informazioni extra, mostrate come tooltip |
| \`lang\` | La lingua del contenuto di quell'elemento |
| \`hidden\` | Nasconde l'elemento (un attributo *booleano*: non serve un valore) |

Metti sempre i valori degli attributi tra virgolette. Un \`id\` deve essere unico nella pagina; una \`class\` può essere
condivisa da molti elementi.`,
      tasks: [
        'Dai al primo paragrafo id="intro"',
        'Dai a entrambi i paragrafi di nota class="note"',
        'Segna "Ciao a tutti!" come italiano con lang="it"',
        'Nascondi il segreto con l\'attributo hidden',
        'Dai a un elemento qualsiasi un tooltip con title',
      ],
      hints: ['Gli attributi vanno dentro il tag di apertura: <p id="intro">.', 'Gli attributi booleani non hanno bisogno di un valore: <p hidden>.'],
    },
    'basics-challenge': {
      title: 'Sfida: pagina del profilo personale',
      summary: 'Costruisci una pagina completa partendo da un file vuoto, senza codice iniziale.',
      explanation: `Costruisci da zero una piccola **pagina del profilo**, senza l'aiuto di codice iniziale.
I requisiti sono elencati qui sotto, ma vengono verificati solo quando premi **Verifica la mia soluzione**.

Guadagni ⭐⭐⭐ se superi la sfida senza suggerimenti. Ogni suggerimento costa una stella; sbirciare la soluzione te ne lascia una.`,
      tasks: [
        'Un documento completo: DOCTYPE, <html lang>, <head> e <body>',
        'Un charset UTF-8 e un <title> con il tuo nome',
        'Un <h1> con il tuo nome',
        'Almeno due sezioni <h2>, ognuna seguita da un paragrafo',
        'Un breve indirizzo o una poesia che usa <br>',
        'Un <hr> che separa due parti della pagina',
        'Un elemento con id="contact"',
      ],
      hints: [
        'Parti dallo scheletro del documento che hai imparato in "Lo scheletro del documento".',
        'Un h2 seguito da un p è fatto così: <h2>Hobby</h2> <p>Mi piacciono gli scacchi.</p>',
      ],
    },
  },
  messages: {
    'Add a <p> paragraph.': 'Aggiungi un paragrafo <p>.',
    'Add <html lang="en"> around the document.': 'Racchiudi il documento in <html lang="en">.',
    'Put <meta charset="UTF-8"> inside <head>.': 'Metti <meta charset="UTF-8"> dentro <head>.',
    'Add a <title> with some text inside <head>.': 'Aggiungi un <title> con del testo dentro <head>.',
    'Put the <h1> inside <body>.': 'Metti l\'<h1> dentro <body>.',
    'Two paragraphs need class="note".': 'Due paragrafi devono avere class="note".',
    'Add lang="it" to the Italian paragraph.': 'Aggiungi lang="it" al paragrafo in italiano.',
    'Add hidden to the secret paragraph.': 'Aggiungi hidden al paragrafo segreto.',
    'Add a title="..." attribute to an element.': 'Aggiungi un attributo title="..." a un elemento.',
    'Add a lang attribute to <html>.': 'Aggiungi un attributo lang a <html>.',
    'Add a <body>.': 'Aggiungi un <body>.',
    'Put a <p> directly after each <h2>.': 'Metti un <p> subito dopo ogni <h2>.',
    'Use <br> inside a paragraph.': 'Usa <br> dentro un paragrafo.',
  },
} satisfies ModuleText;
