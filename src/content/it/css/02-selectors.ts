import type { ModuleText } from '../../localize';

export default {
  title: 'Selettori e cascata',
  description: 'Colpisci esattamente gli elementi giusti, e capisci quale regola vince.',
  items: {
    'css-combinators': {
      title: 'Combinatori',
      explanation: `I **combinatori** selezionano gli elementi in base alla loro posizione rispetto ad altri:

| Selettore | Seleziona |
|---|---|
| \`nav a\` | qualsiasi \`<a>\` **dentro** un \`<nav>\`, a qualsiasi profondità (discendente, uno spazio) |
| \`ul > li\` | gli \`<li>\` che sono **figli diretti** di un \`<ul>\` |
| \`h2 + p\` | il \`<p>\` **subito dopo** un \`<h2>\` (fratello adiacente) |
| \`h2 ~ p\` | **ogni** \`<p>\` dopo un \`<h2>\`, con lo stesso genitore (fratello generico) |

\`\`\`css
article h2 + p {
  font-size: 1.2em; /* the intro paragraph of each section */
}
\`\`\``,
      tasks: [
        'Rendi green solo i link dentro <nav> (discendente)',
        'Metti in grassetto solo gli <li> figli diretti di .menu (combinatore figlio)',
        'Metti in corsivo il paragrafo subito dopo l\'<h2> (fratello adiacente)',
      ],
      hints: ['Attenzione: gli elenchi annidati ereditano font-weight dal loro <li> genitore. Potresti doverlo azzerare: .menu li li { font-weight: normal; }'],
    },
    'css-pseudo-classes': {
      title: 'Attributi e pseudo-classi',
      explanation: `I **selettori di attributo** selezionano gli elementi in base ai loro attributi:

- \`a[target]\`: ha l'attributo; \`input[type="email"]\`: valore esatto.
- \`a[href^="https"]\` inizia con, \`a[href$=".pdf"]\` finisce con, \`[class*="btn"]\` contiene.

Le **pseudo-classi** (un solo due punti) selezionano gli elementi in un certo **stato** o in una certa **posizione**:

| Pseudo-classe | Seleziona |
|---|---|
| \`:hover\`, \`:focus-visible\` | con il mouse sopra / con il focus da tastiera |
| \`:first-child\`, \`:last-child\` | il primo / l'ultimo tra i suoi fratelli |
| \`:nth-child(odd)\`, \`:nth-child(3n)\` | in base alla posizione |
| \`:not(.x)\` | tutto tranne \`.x\` |
| \`:checked\`, \`:disabled\` | stati dei form |

\`\`\`css
tr:nth-child(even) { background: #f3f3f3; }   /* zebra stripes */
a:hover { text-decoration: none; }
\`\`\``,
      tasks: [
        'Rendi crimson i link che finiscono in .pdf',
        'Dai alle voci dispari dell\'elenco uno sfondo #eee con :nth-child',
        'Togli la sottolineatura al link dell\'ultima voce con :last-child',
        'Fai diventare gold lo sfondo del pulsante con :hover',
      ],
      hints: ['L\'ultimo link sta dentro l\'ultimo li: li:last-child a { ... }'],
    },
    'css-pseudo-elements': {
      title: 'Pseudo-elementi',
      explanation: `Gli **pseudo-elementi** (doppio due punti) danno stile a una *parte* di un elemento, o aggiungono contenuto decorativo:

- \`::before\` / \`::after\`: inseriscono contenuto prima/dopo il contenuto dell'elemento. Hanno bisogno della proprietà
  \`content\` (usa \`content: ""\` per scatole puramente decorative).
- \`::first-letter\`, \`::first-line\`: la prima lettera o la prima riga di un blocco.
- \`::placeholder\`: il testo segnaposto di un input. \`::selection\`: il testo selezionato.

\`\`\`css
.tip::before {
  content: "💡 ";
}
.quote::after {
  content: " — Anonymous";
  color: gray;
}
\`\`\`

Il contenuto aggiunto con il CSS è decorazione: non metterci informazioni essenziali, perché alcune tecnologie
assistive lo saltano.`,
      tasks: [
        'Aggiungi "💡 " prima di .tip con ::before',
        'Rendi la prima lettera di .story 2em e in grassetto con ::first-letter',
        'Aggiungi un " *" rosso dopo .required con ::after',
      ],
      hints: ['::first-letter: .story::first-letter { font-size: 2em; font-weight: bold; }'],
    },
    'css-cascade': {
      title: 'La cascata e la specificità',
      explanation: `Quando più regole impostano la stessa proprietà su un elemento, la **cascata** decide quale vince:

1. **Specificità**: vince il selettore più specifico. Pensala come un punteggio (id, classi, tipi):
   - \`p\` → (0, 0, 1)
   - \`.intro\`, \`[type]\`, \`:hover\` → (0, 1, 0)
   - \`#main\` → (1, 0, 0)
   - \`#main .intro p\` → (1, 1, 1)
2. **Ordine**: a parità di specificità, vince la regola che viene **per ultima**.
3. **Ereditarietà**: alcune proprietà (colore, font, line-height…) passano dal genitore ai figli quando nient'altro
   le imposta; altre (padding, border, background…) no.

\`!important\` scavalca tutto, e poi può essere battuto solo da un altro \`!important\`. Trasforma il tuo
foglio di stile in una corsa agli armamenti: evitalo, e sistema invece la specificità.

\`\`\`css
p { color: black; }          /* (0,0,1) */
.note { color: blue; }       /* (0,1,0) wins over p */
.box .note { color: red; }   /* (0,2,0) wins over .note */
\`\`\``,
      tasks: [
        'Rendi .note blue rendendo la sua regola più specifica (non cancellare la regola rossa)',
        'Rendi .warning orange: .box p la sta battendo. Perché? Sistemalo senza !important',
        'Rendi .final purple: due regole hanno la stessa specificità, quindi decide l\'ordine',
        'Nessun !important da nessuna parte',
      ],
      hints: [
        '.box p vale (0,1,1), .warning vale (0,1,0). Rendi più forte il selettore del warning: .box .warning',
        'Puoi alzare la specificità di .note con lo stesso trucco: .box .note.note o .box p.note; e se sono pari deve venire dopo la regola rossa.',
      ],
    },
    'css-has-is': {
      title: ':is(), :where() e :has()',
      explanation: `Il CSS moderno ha tre potenti pseudo-classi funzionali:

- \`:is(h1, h2, h3) a\`: un modo più corto di scrivere \`h1 a, h2 a, h3 a\`. Prende la specificità del suo argomento più forte.
- \`:where(...)\`: come \`:is()\` ma con specificità **zero**: ottimo per valori predefiniti facili da sovrascrivere.
- \`:has(...)\`: il "selettore del genitore": seleziona un elemento che **contiene** qualcosa.

\`\`\`css
/* cards that contain an image get a border */
.card:has(img) { border: 2px solid gold; }

/* a form field whose input is invalid */
.field:has(input:invalid) label { color: crimson; }
\`\`\``,
      tasks: [
        'Dai solo alle card che contengono un <img> un bordo 3px solid gold, con :has()',
        'Rendi gray i link dentro h1 e h2 usando un solo selettore :is()',
        'Metti in grassetto una label quando la sua checkbox è selezionata (label:has(:checked))',
      ],
      hints: ['label:has(input:checked) { font-weight: bold; }'],
    },
    'css-selectors-challenge': {
      title: 'Sfida: la guerra della specificità',
      summary: 'Un foglio di stile pieno di conflitti e di !important. Rimettilo in riga.',
      explanation: `Uno sviluppatore prima di te ha combattuto la cascata a colpi di \`!important\` e ha perso. La pagina dovrebbe
apparire così:

- Il prezzo in **saldo** è rosso; i prezzi normali restano neri.
- I link nel **nav** sono bianchi; gli altri link restano blu.
- Il link **attivo** del nav è giallo.
- La prima riga della tabella (quella di intestazione) è in grassetto, le altre no.
- Il testo di \`.notice\` è verde scuro.

Sistema il CSS (puoi anche correggere gli errori di battitura), **senza** \`!important\` e **senza** toccare l'HTML.
I requisiti sono nascosti: ognuno si rivela quando è superato.`,
      tasks: [
        'Il prezzo in saldo è rosso',
        'I prezzi normali non sono rossi',
        'I link del nav sono bianchi',
        'Il link attivo del nav è giallo',
        'Gli altri link restano blu',
        'Solo la prima riga della tabella è in grassetto',
        'La notice è verde scuro',
        'Nessun !important rimasto',
        'L\'HTML non è cambiato',
        'Gli stili sono ancora nel file CSS',
      ],
      hints: [
        '".price .sale" (con lo spazio) significa "un .sale dentro un .price". L\'elemento ha entrambe le classi: concatenale.',
        'td { font-weight: bold } dà stile direttamente a ogni cella, quindi batte l\'ereditarietà dalla riga.',
        '#top a vale (1,0,1). Una regola per .active ha bisogno almeno della stessa forza: #top .active.',
      ],
    },
  },
  messages: {
    'The link outside <nav> should not be green.': 'Il link fuori da <nav> non deve essere verde.',
    'Use the child combinator: .menu > li': 'Usa il combinatore figlio: .menu > li',
    'Use > so the nested Carbonara item is not bold.': 'Usa > così la voce annidata Carbonara non è in grassetto.',
    'Use h2 + p.': 'Usa h2 + p.',
    'Use a[href$=".pdf"].': 'Usa a[href$=".pdf"].',
    'Use li:nth-child(odd).': 'Usa li:nth-child(odd).',
    'Only odd items get the background.': 'Solo le voci dispari hanno lo sfondo.',
    'Use :last-child.': 'Usa :last-child.',
    'Write a button:hover rule that sets background-color.': 'Scrivi una regola button:hover che imposti background-color.',
    'Set content: "💡 " on .tip::before.': 'Imposta content: "💡 " su .tip::before.',
    'Set font-size: 2em on .story::first-letter.': 'Imposta font-size: 2em su .story::first-letter.',
    'Set content: " *" on .required::after.': 'Imposta content: " *" su .required::after.',
    'Make the ::after star red.': 'Rendi rossa la stella di ::after.',
    'Keep the ".box .note" rule.': 'Mantieni la regola ".box .note".',
    'Use .card:has(img).': 'Usa .card:has(img).',
    'The plain card should have no border.': 'La card semplice non deve avere bordo.',
    'Use :is(h1, h2) a.': 'Usa :is(h1, h2) a.',
    'Use label:has(...).': 'Usa label:has(...).',
    'Only the sale price should be red.': 'Solo il prezzo in saldo deve essere rosso.',
    'Only the first row should be bold.': 'Solo la prima riga deve essere in grassetto.',
    'Don\'t change the HTML.': 'Non cambiare l\'HTML.',
    'Keep the nav styles.': 'Mantieni gli stili del nav.',
  },
} satisfies ModuleText;
