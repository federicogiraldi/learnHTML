import type { ModuleText } from '../../localize';

export default {
  title: 'CSS Grid',
  description: 'Impaginazioni in due dimensioni: righe e colonne nello stesso momento.',
  items: {
    'css-grid-basics': {
      title: 'Colonne, righe e fr',
      explanation: `Flexbox dispone gli elementi in **una** direzione. **Grid** gestisce righe *e* colonne insieme.

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;  /* three columns */
  gap: 16px;
}
\`\`\`

- \`fr\` è una **frazione** dello spazio libero: \`1fr 2fr\` rende la seconda colonna larga il doppio della prima.
- \`repeat(4, 1fr)\` = \`1fr 1fr 1fr 1fr\`.
- Gli elementi riempiono le celle in ordine, creando nuove righe automaticamente.
- \`grid-template-rows\` dimensiona le righe allo stesso modo (spesso non serve).`,
      tasks: [
        'Rendi .grid una griglia con 3 colonne uguali usando repeat()',
        'Aggiungi un gap di 16px',
        'I 6 elementi formano 2 righe',
      ],
      hints: ['.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }'],
    },
    'css-grid-span': {
      title: 'Estendere le celle',
      explanation: `Un elemento può coprire più colonne o più righe:

\`\`\`css
.feature {
  grid-column: span 2;     /* 2 columns wide */
  grid-row: span 2;        /* 2 rows tall */
}
.banner {
  grid-column: 1 / -1;     /* from the first line to the last: full width */
}
\`\`\`

Le **linee** della griglia sono numerate da 1 al bordo sinistro; \`-1\` è il bordo destro. \`grid-column: 2 / 4\` parte
dalla linea 2 e finisce alla linea 4 (quindi copre le colonne 2 e 3).`,
      tasks: [
        'Fai occupare a .banner tutta la larghezza con grid-column: 1 / -1',
        'Rendi .feature larga 2 colonne e alta 2 righe',
      ],
      hints: ['Ogni riga è alta 80px con un gap di 10px, quindi due righe sono alte 170px.'],
    },
    'css-grid-areas': {
      title: 'Aree con nome',
      explanation: `\`grid-template-areas\` ti permette di *disegnare* l'impaginazione con dei nomi, e poi posizionare gli elementi per nome:

\`\`\`css
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
.page > header { grid-area: header; }
.page > aside  { grid-area: sidebar; }
.page > main   { grid-area: main; }
.page > footer { grid-area: footer; }
\`\`\`

Ogni stringa è una riga, ogni parola una colonna. Ripetere un nome fa estendere l'area su quelle celle.
Riorganizzare l'impaginazione più avanti (per esempio per il mobile) vuol dire solo riscrivere le stringhe.`,
      tasks: [
        'Rendi .page una griglia con colonne 180px e 1fr',
        'Disegna le aree: header in alto, sidebar + main, footer in fondo',
        'Metti ogni elemento nella sua area',
      ],
      hints: ['.page > aside { grid-area: sidebar; } e lo stesso per gli altri.'],
    },
    'css-grid-autofit': {
      title: 'Griglie responsive senza media query',
      explanation: `Una sola riga crea una griglia che si adatta a qualsiasi schermo:

\`\`\`css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
\`\`\`

Leggila così: "metti quante più colonne possibile, ognuna **almeno 150px**, e dividi lo spazio in più
(\`1fr\`)". Su un telefono ottieni una colonna, su un portatile cinque, con zero media query.`,
      tasks: [
        'Usa repeat(auto-fit, minmax(150px, 1fr))',
        'A 800px di larghezza ci sono 4 colonne',
        'A 360px di larghezza ci sono 2 colonne',
        'A 250px di larghezza c\'è 1 colonna',
      ],
      hints: ['Basta cambiare grid-template-columns.'],
    },
    'css-grid-challenge': {
      title: 'Sfida: la prima pagina di una rivista',
      summary: 'Un\'impaginazione da giornale con articolo principale, barra laterale e griglia di foto.',
      explanation: `Imposta questa prima pagina di una rivista come nella scheda **Obiettivo**, usando Grid:

- \`.front\`: una griglia con **4 colonne uguali** e un gap di \`20px\`.
- \`.masthead\`: occupa tutte e 4 le colonne.
- \`.lead\` (l'articolo principale): largo 3 colonne e alto 2 righe.
- \`.side\`: la colonna rimanente accanto al lead, anche lei alta 2 righe.
- I quattro articoli \`.photo\`: uno per colonna nella riga sotto.
- \`.photo img\`: riempiono la larghezza della loro cella, \`aspect-ratio: 4 / 3\` con \`object-fit: cover\`.`,
      tasks: [
        '.front: 4 colonne uguali con un gap di 20px',
        'La testata occupa tutte e 4 le colonne',
        'L\'articolo principale è largo 3 colonne e alto 2 righe',
        'La colonna laterale sta a destra del lead, alta 2 righe',
        'I quattro articoli con foto condividono una riga sotto',
        'Le foto riempiono la cella, 4:3, con object-fit: cover',
      ],
      hints: ['.lead { grid-column: span 3; grid-row: span 2; } e poi .side { grid-row: span 2; }', 'Per le immagini: width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover;'],
    },
  },
  messages: {
    'Use grid-template-columns: repeat(3, 1fr).': 'Usa grid-template-columns: repeat(3, 1fr).',
    'The banner should be as wide as the grid.': 'Il banner deve essere largo quanto la griglia.',
    'Use grid-column: span 2 and grid-row: span 2 on .feature.': 'Usa grid-column: span 2 e grid-row: span 2 su .feature.',
    'Use grid-template-areas: "header header" "sidebar main" "footer footer";':
      'Usa grid-template-areas: "header header" "sidebar main" "footer footer";',
    'Give header, aside, main and footer their grid-area.': 'Dai a header, aside, main e footer la loro grid-area.',
    'Use repeat(auto-fit, minmax(150px, 1fr)).': 'Usa repeat(auto-fit, minmax(150px, 1fr)).',
    '.front needs 4 equal columns: repeat(4, 1fr).': '.front ha bisogno di 4 colonne uguali: repeat(4, 1fr).',
    'The masthead should be as wide as the grid.': 'La testata deve essere larga quanto la griglia.',
    'Make .lead span 3 columns and 2 rows.': 'Fai occupare a .lead 3 colonne e 2 righe.',
    'Place .side next to .lead, spanning the same 2 rows.': 'Metti .side accanto a .lead, sulle stesse 2 righe.',
    'The photos should form one row under the lead.': 'Le foto devono formare una riga sotto il lead.',
    'Make the images width: 100%.': 'Dai alle immagini width: 100%.',
  },
} satisfies ModuleText;
