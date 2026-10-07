import type { ModuleText } from '../../localize';

export default {
  title: 'Flexbox',
  description: 'Disponi gli elementi in riga o in colonna, allineali e dividi lo spazio.',
  items: {
    'css-flex-basics': {
      title: 'display: flex',
      explanation: `\`display: flex\` trasforma un elemento in un **contenitore flex**: i suoi figli diretti (gli *elementi flex*)
si allineano lungo un **asse principale**, che di default è una riga.

\`\`\`css
.toolbar {
  display: flex;
  gap: 12px;          /* space between items, never at the edges */
}
\`\`\`

Diventano elementi flex solo i **figli diretti**: i nipoti vengono disposti normalmente. \`gap\` è il modo più pulito
per distanziare gli elementi: niente più margini su ogni elemento tranne l'ultimo.`,
      tasks: [
        'Rendi .toolbar un contenitore flex così i pulsanti stanno in riga',
        'Distanzia i pulsanti con gap: 8px',
        'Metti in riga gli elementi di .stats con un gap di 24px',
      ],
      hints: ['display: flex va sul genitore (il contenitore), non sui figli.'],
    },
    'css-flex-align': {
      title: 'justify-content e align-items',
      explanation: `Due proprietà sul contenitore allineano gli elementi:

- \`justify-content\`: lungo l'**asse principale** (orizzontale in una riga):
  \`flex-start\`, \`center\`, \`flex-end\`, \`space-between\`, \`space-around\`, \`space-evenly\`.
- \`align-items\`: lungo l'**asse trasversale** (verticale in una riga):
  \`stretch\` (predefinito), \`flex-start\`, \`center\`, \`flex-end\`, \`baseline\`.

\`\`\`css
.header {
  display: flex;
  justify-content: space-between;  /* logo left, menu right */
  align-items: center;             /* vertically centred */
}
\`\`\`

Questo è il classico header di un sito, e la fine di decenni di trucchi per centrare le cose.`,
      tasks: [
        'Rendi l\'header un contenitore flex',
        'Spingi il logo a sinistra e il menu a destra (space-between)',
        'Centra entrambi in verticale (align-items)',
      ],
      hints: ['Entrambe le proprietà vanno su .header.'],
    },
    'css-flex-direction': {
      title: 'Direzione e andare a capo',
      explanation: `- \`flex-direction: column\` rende **verticale** l'asse principale: gli elementi si impilano, e ora \`justify-content\`
  lavora in verticale mentre \`align-items\` lavora in orizzontale.
- \`flex-wrap: wrap\` lascia andare a capo gli elementi quando non ci stanno, invece di schiacciarli.

\`\`\`css
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
\`\`\``,
      tasks: [
        'Impila in verticale i link della barra laterale (flex-direction: column)',
        'Aggiungi un gap di 12px tra i link della barra laterale',
        'Lascia andare a capo i tag su più righe invece di farli uscire',
      ],
      hints: ['In una colonna, gap aggiunge spazio verticale (row-gap).'],
    },
    'css-flex-grow': {
      title: 'Dividere lo spazio: flex grow, shrink, basis',
      explanation: `Gli elementi possono **crescere** nello spazio libero o **restringersi** quando lo spazio manca:

- \`flex-grow: 1\`: prende una parte dello spazio avanzato (\`2\` ne prende il doppio di \`1\`).
- \`flex-shrink: 0\`: non si restringe mai sotto la sua dimensione.
- \`flex-basis: 200px\`: la dimensione di partenza prima di crescere/restringersi.
- \`flex: 1\` è la scorciatoia per "cresci e dividi in parti uguali" (\`1 1 0\`).

\`\`\`css
.layout { display: flex; }
.sidebar { flex: 0 0 200px; }   /* fixed 200px */
.content { flex: 1; }           /* everything else */
\`\`\``,
      tasks: [
        'Rendi la barra laterale fissa a 200px (flex: 0 0 200px)',
        'Fai prendere al contenuto tutto lo spazio rimanente',
        'Fai allungare l\'input di ricerca e lascia al pulsante la sua dimensione naturale',
      ],
      hints: ['.content { flex: 1; } e .search input { flex: 1; }'],
    },
    'css-flex-center': {
      title: 'Centratura perfetta',
      explanation: `Il problema CSS più famoso, centrare qualcosa in entrambe le direzioni, con Flexbox richiede tre righe:

\`\`\`css
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
\`\`\`

Un altro trucco utile: \`margin-left: auto\` su un elemento flex si mangia tutto lo spazio libero alla sua sinistra,
spingendo lui (e tutto quello che viene dopo) verso l'estremità destra.`,
      tasks: [
        'Centra .message in orizzontale e in verticale dentro .hero',
        'Spingi il link Log in all\'estremità destra della barra con margin-left: auto',
      ],
      hints: ['justify-content e align-items entrambi "center" su .hero.'],
    },
    'css-flex-challenge': {
      title: 'Sfida: barra di navigazione e footer',
      summary: 'Un vero header da sito e un footer che va a capo sugli schermi piccoli.',
      explanation: `Costruisci l'header e il footer della scheda **Obiettivo** usando solo Flexbox (niente float, niente posizionamento):

**Header**
- \`.site-header\`: flex, elementi centrati in verticale, padding \`16px 24px\`, sfondo \`#0f172a\`.
- Il logo a sinistra; i link di \`.nav\` in riga con un gap di \`20px\`; il pulsante \`.cta\` all'estrema destra.
- Il nav sta subito dopo il logo, con \`32px\` di spazio tra logo e nav.

**Footer**
- \`.site-footer\`: i tre blocchi \`.col\` affiancati con un gap di \`24px\`, ognuno largo **almeno 180px**, che
  dividono lo spazio in parti uguali (\`flex: 1 1 180px\`).
- **Vanno a capo** in colonna quando la pagina è stretta: a 400px di larghezza devono essere impilati.`,
      tasks: [
        'Header: flex, centrato in verticale, padding 16px 24px, #0f172a',
        'Logo, nav e pulsante su una riga; link del nav in riga con un gap di 20px',
        '32px tra logo e nav',
        'Sign up all\'estrema destra',
        'Colonne del footer affiancate, gap di 24px, spazio diviso in parti uguali',
        'A 400px di larghezza, le colonne vanno a capo una sotto l\'altra',
      ],
      hints: ['margin-left: auto su .cta lo spinge a destra.', 'Un gap sull\'header dà i 32px tra logo e nav; così anche la cta riceve un gap. Va bene lo stesso.'],
    },
  },
  messages: {
    'The menu should touch the right padding of the header.': 'Il menu deve toccare il padding destro dell\'header.',
    'Some tags still overflow the box.': 'Alcuni tag escono ancora dal riquadro.',
    'The sidebar should be exactly 200px.': 'La barra laterale deve essere esattamente 200px.',
    'Give .content flex: 1.': 'Dai a .content flex: 1.',
    '.content should reach the right edge.': '.content deve arrivare al bordo destro.',
    'Give the input flex: 1.': 'Dai all\'input flex: 1.',
    'Log in should sit at the right end.': 'Log in deve stare all\'estremità destra.',
    'Push .cta to the right end.': 'Spingi .cta all\'estremità destra.',
    'The columns should have equal widths.': 'Le colonne devono avere la stessa larghezza.',
    'At 400px the columns should be stacked: use flex-wrap: wrap and flex: 1 1 180px.':
      'A 400px le colonne devono stare una sotto l\'altra: usa flex-wrap: wrap e flex: 1 1 180px.',
  },
} satisfies ModuleText;
