import type { ModuleText } from '../../localize';

export default {
  title: 'Lavorare con il testo',
  description: 'Enfasi, citazioni, codice, elenchi e caratteri speciali.',
  items: {
    'text-emphasis': {
      title: 'Enfasi e importanza',
      explanation: `HTML ha elementi *inline* che marcano parole dentro un paragrafo:

| Elemento | Significato | Aspetto predefinito |
|---|---|---|
| \`<strong>\` | Forte importanza, serietà, urgenza | **grassetto** |
| \`<em>\` | Enfasi che cambia il significato della frase | *corsivo* |
| \`<mark>\` | Testo evidenziato / rilevante (es. risultati di ricerca) | sfondo giallo |
| \`<small>\` | Commenti a margine, note in piccolo | testo più piccolo |
| \`<sub>\` / \`<sup>\` | Pedice / apice | H<sub>2</sub>O, x<sup>2</sup> |

\`\`\`html
<p><strong>Warning:</strong> do <em>not</em> touch the wire.</p>
<p>Water is H<sub>2</sub>O and E = mc<sup>2</sup>.</p>
\`\`\`

Potresti incontrare anche \`<b>\` e \`<i>\`: cambiano solo lo *stile* senza aggiungere significato. Preferisci \`<strong>\`
ed \`<em>\` quando il testo è davvero importante o enfatizzato: gli screen reader possono trasmettere quel significato.`,
      tasks: [
        'Rendi "Warning:" di forte importanza',
        'Enfatizza la parola "must" con <em>',
        'Evidenzia "acid" nel risultato di ricerca con <mark>',
        'Scrivi il 2 di H2O come pedice',
        'Metti l\'avvertenza sui prezzi in <small>',
      ],
      hints: ['Racchiudi solo la parola che ti interessa: <em>must</em>.', 'H<sub>2</sub>O'],
    },
    'text-lists': {
      title: 'Elenchi',
      explanation: `HTML ha tre tipi di elenchi.

Gli **elenchi non ordinati** (\`<ul>\`) servono per voci in cui l'ordine non conta, e sono mostrati con i pallini:

\`\`\`html
<ul>
  <li>Milk</li>
  <li>Eggs</li>
</ul>
\`\`\`

Gli **elenchi ordinati** (\`<ol>\`) servono per passaggi o classifiche, e sono mostrati con i numeri. \`start\` e \`reversed\`
cambiano la numerazione:

\`\`\`html
<ol>
  <li>Preheat the oven</li>
  <li>Mix the ingredients</li>
</ol>
\`\`\`

Gli **elenchi descrittivi** (\`<dl>\`) abbinano termini (\`<dt>\`) e descrizioni (\`<dd>\`), come un glossario.

Gli elenchi si possono **annidare**: metti un intero \`<ul>\` *dentro* un \`<li>\`, mai direttamente dentro un altro \`<ul>\`.

\`\`\`html
<ul>
  <li>Fruit
    <ul>
      <li>Apples</li>
    </ul>
  </li>
</ul>
\`\`\``,
      tasks: [
        'Elenca almeno 3 ingredienti in un <ul>',
        'Elenca almeno 3 passaggi in un <ol>',
        'Annida un sotto-elenco dentro uno degli ingredienti (es. tipi di farina)',
        'Definisci almeno due termini in un <dl> con <dt> e <dd>',
      ],
      hints: [
        'Ogni voce dell\'elenco è un <li>, direttamente dentro <ul> o <ol>.',
        'Per l\'elenco annidato, apri il <ul> prima del </li> della voce che lo contiene.',
      ],
    },
    'text-quotes-code': {
      title: 'Citazioni e codice',
      explanation: `**Citazioni**

- \`<blockquote>\` è una citazione lunga e a sé stante. Il suo attributo \`cite\` può contenere l'URL della fonte.
- \`<q>\` è una citazione breve dentro il testo: il browser aggiunge le virgolette per te.
- \`<cite>\` è il *titolo* di un'opera (un libro, un film, una canzone).

\`\`\`html
<blockquote cite="https://example.com/speech">
  <p>The best way to predict the future is to invent it.</p>
</blockquote>
<p>As Alan Kay said, <q>simple things should be simple</q>.</p>
<p>My favourite book is <cite>Dune</cite>.</p>
\`\`\`

**Codice**

- \`<code>\` marca un frammento di codice.
- \`<pre>\` mantiene spazi e a capo **esattamente** come li hai scritti: perfetto per blocchi di codice.
- \`<kbd>\` è un input da tastiera, \`<abbr title="...">\` è un'abbreviazione con la sua forma estesa.

\`\`\`html
<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save your <abbr title="HyperText Markup Language">HTML</abbr>.</p>
<pre><code>function hi() {
  return "hi";
}</code></pre>
\`\`\``,
      tasks: [
        'Metti la citazione di Grace Hopper in un <blockquote>',
        'Marca il titolo del libro con <cite>',
        'Marca console.log() come <code>',
        'Marca i tasti con <kbd>',
        'Spiega CSS con <abbr title="...">',
        'Aggiungi un esempio di codice su più righe dentro <pre><code>',
      ],
      hints: ['Il <blockquote> può contenere un <p> con la citazione.', 'Dentro <pre>, gli a capo restano esattamente come li scrivi.'],
    },
    'text-entities': {
      title: 'Caratteri speciali',
      explanation: `Alcuni caratteri hanno un significato speciale in HTML. Se scrivi \`<p>\` dentro il testo, il browser pensa
che sia un tag! Per mostrarli così come sono, usa le **entità carattere**:

| Vuoi | Scrivi |
|---|---|
| \`<\` | \`&lt;\` |
| \`>\` | \`&gt;\` |
| \`&\` | \`&amp;\` |
| \`"\` | \`&quot;\` |
| spazio non separabile | \`&nbsp;\` |
| © | \`&copy;\` |
| — | \`&mdash;\` |

\`\`\`html
<p>The &lt;p&gt; tag makes a paragraph.</p>
<p>Tom &amp; Jerry &copy; 1940</p>
<p>10&nbsp;km</p>
\`\`\`

\`&nbsp;\` tiene due parole sulla stessa riga, per esempio un numero e la sua unità di misura.`,
      tasks: [
        'Mostra "<h1>" così com\'è nel primo paragrafo',
        'Fai l\'escape della "e commerciale" in "Fish & chips"',
        'Usa il simbolo © tramite &copy;',
        'Unisci "2026" e "LearnHTML" con uno spazio non separabile',
        'Nessun "<h1>" vero rimasto dentro un paragrafo',
      ],
      hints: ['< diventa &lt; e > diventa &gt;.'],
    },
    'text-challenge': {
      title: 'Sfida: caccia ai bug',
      summary: 'Un articolo rotto nasconde 7 bug. Trovali e correggili tutti.',
      explanation: `Questo articolo "sembra a posto" nel browser, perché i browser riparano in silenzio l'HTML rotto.
Ma contiene **7 errori**: tag non chiusi o annidati male, una voce di elenco fuori dal suo elenco, un carattere
senza escape, un elemento usato male… Correggili tutti senza togliere nessun contenuto.

I requisiti sono nascosti: ognuno si rivela quando lo correggi. L'ultimo segnala gli errori strutturali
uno alla volta, con il numero di riga.`,
      tasks: [
        'Lo <strong> si chiude prima della fine del paragrafo',
        'L\'<em> è chiuso',
        'L\'importanza usa <strong>, non <b>',
        'I titoli non saltano da <h1> a <h3>',
        'Tutte e tre le voci dell\'elenco sono dentro l\'<ul>',
        'Il <p> scritto nel testo ha l\'escape',
        'Il <blockquote> non è dentro un <p>',
        'Tutto il testo originale c\'è ancora',
      ],
      hints: [
        'I tag si chiudono nell\'ordine inverso a quello in cui sono stati aperti: <p><strong>…</strong></p>.',
        'Un <p> non può contenere elementi di blocco come <blockquote>: prima chiudi il paragrafo.',
      ],
    },
  },
  messages: {
    'Put a <ul> inside an <li>.': 'Metti un <ul> dentro un <li>.',
    'The code inside <pre> should span more than one line.': 'Il codice dentro <pre> deve occupare più di una riga.',
    'The text still contains a real <h1> tag. Escape it with &lt; and &gt;.':
      'Il testo contiene ancora un vero tag <h1>. Fai l\'escape con &lt; e &gt;.',
    'Write the & as &amp;.': 'Scrivi la & come &amp;.',
    'Write &copy; for the copyright symbol.': 'Scrivi &copy; per il simbolo del copyright.',
    'Put &nbsp; between 2026 and LearnHTML.': 'Metti &nbsp; tra 2026 e LearnHTML.',
    'Escape the tag inside the paragraph.': 'Fai l\'escape del tag dentro il paragrafo.',
    '<strong> must be closed inside the paragraph.': '<strong> va chiuso dentro il paragrafo.',
    'Close the <em>.': 'Chiudi l\'<em>.',
    'Replace <b> with <strong>.': 'Sostituisci <b> con <strong>.',
    'The section heading after <h1> should be an <h2>.': 'Il titolo di sezione dopo <h1> deve essere un <h2>.',
    'Escape the <p> inside the text.': 'Fai l\'escape del <p> dentro il testo.',
    '<blockquote> cannot live inside <p>.': '<blockquote> non può stare dentro <p>.',
  },
} satisfies ModuleText;
