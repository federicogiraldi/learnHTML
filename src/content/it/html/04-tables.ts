import type { ModuleText } from '../../localize';

export default {
  title: 'Tabelle',
  description: 'Righe, colonne, intestazioni, celle unite e tabelle di dati accessibili.',
  items: {
    'tables-basics': {
      title: 'La tua prima tabella',
      explanation: `Le tabelle mostrano **dati tabellari**: informazioni con righe e colonne, come un orario o un listino prezzi.
(Non usare mai le tabelle per l'impaginazione: a quello serve il CSS.)

- \`<table>\` racchiude la tabella.
- \`<tr>\` è una riga (**t**able **r**ow).
- \`<th>\` è una cella di intestazione (**h**eader), \`<td>\` è una cella di dati (**d**ata).

\`\`\`html
<table>
  <tr>
    <th>Fruit</th>
    <th>Price</th>
  </tr>
  <tr>
    <td>Apple</td>
    <td>€0.50</td>
  </tr>
</table>
\`\`\`

Ogni riga dovrebbe avere lo stesso numero di celle.`,
      tasks: [
        'Crea una <table>',
        'Aggiungi una riga di intestazione con due <th>: Day e Activity',
        'Aggiungi tre righe di dati con due <td> ciascuna',
        'Ogni riga ha lo stesso numero di celle',
      ],
      hints: ['Ogni riga è un <tr>; ogni cella al suo interno è un <th> o un <td>.'],
    },
    'tables-sections': {
      title: 'Sezioni e didascalie delle tabelle',
      explanation: `Le tabelle più grandi si dividono in sezioni:

- \`<caption>\`: il titolo della tabella. Deve essere la **prima** cosa dentro \`<table>\`.
- \`<thead>\`: le righe di intestazione.
- \`<tbody>\`: le righe del corpo (i dati).
- \`<tfoot>\`: righe di riepilogo, come i totali.

\`\`\`html
<table>
  <caption>Monthly expenses</caption>
  <thead>
    <tr><th>Item</th><th>Cost</th></tr>
  </thead>
  <tbody>
    <tr><td>Rent</td><td>€700</td></tr>
    <tr><td>Food</td><td>€300</td></tr>
  </tbody>
  <tfoot>
    <tr><td>Total</td><td>€1000</td></tr>
  </tfoot>
</table>
\`\`\`

Le sezioni aiutano gli screen reader, permettono ai browser di ripetere le intestazioni quando stampano tabelle lunghe
e rendono più facile applicare gli stili.`,
      tasks: [
        'Aggiungi una <caption> come primo figlio della tabella',
        'Sposta la riga di intestazione in <thead>',
        'Metti le righe dei prodotti in <tbody>',
        'Aggiungi una riga <tfoot> con il totale (€11)',
      ],
      hints: ['Se dimentichi <tbody>, il browser ne aggiunge uno invisibile; ma scrivilo esplicitamente così la tua intenzione è chiara.'],
    },
    'tables-span': {
      title: 'Unire le celle',
      explanation: `Una cella può estendersi su più colonne con \`colspan\`, o su più righe con \`rowspan\`:

\`\`\`html
<table>
  <tr>
    <th colspan="2">Weekend</th>
  </tr>
  <tr>
    <td>Saturday</td>
    <td>Sunday</td>
  </tr>
  <tr>
    <td rowspan="2">Hiking</td>
    <td>Brunch</td>
  </tr>
  <tr>
    <td>Cinema</td>
  </tr>
</table>
\`\`\`

Quando una cella si estende, le celle che copre semplicemente **non si scrivono**. Nell'esempio, l'ultima riga ha
un solo \`<td>\` perché "Hiking" occupa già la prima colonna.

Per non fare confusione, conta gli "spazi" per riga: ogni riga deve arrivare allo stesso totale.`,
      tasks: [
        'Maths del lunedì occupa 9:00 e 10:00 con rowspan="2"',
        'Lunch occupa entrambi i giorni con colspan="2"',
        'Le celle duplicate sono state tolte',
      ],
      hints: ['Dopo aver aggiunto rowspan a Maths, cancella la cella Maths nella riga delle 10:00.'],
    },
    'tables-a11y': {
      title: 'Intestazioni accessibili',
      explanation: `Gli screen reader annunciano una cella insieme alle sue intestazioni ("Price, Apple: €0.50"). Per rendere
esplicita la relazione, usa l'attributo \`scope\` su \`<th>\`:

- \`scope="col"\`: l'intestazione vale per la colonna sotto di lei.
- \`scope="row"\`: l'intestazione vale per la riga alla sua destra.

\`\`\`html
<table>
  <tr>
    <td></td>
    <th scope="col">Price</th>
  </tr>
  <tr>
    <th scope="row">Apple</th>
    <td>€0.50</td>
  </tr>
</table>
\`\`\`

La prima cella di una riga spesso è un'intestazione di riga: rendila un \`<th scope="row">\` invece di un \`<td>\`.`,
      tasks: [
        'Ogni intestazione in <thead> ha scope="col"',
        'I nomi dei pianeti diventano <th scope="row">',
        'Ogni riga del corpo ha un\'intestazione e due celle di dati',
      ],
      hints: ['Trasforma <td>Earth</td> in <th scope="row">Earth</th>.'],
    },
    'tables-challenge': {
      title: 'Sfida: classifica di calcio',
      summary: 'Una tabella completa con sezioni, celle unite e intestazioni accessibili.',
      explanation: `Ricrea da zero questa classifica **esattamente** com'è (i testi delle celle restano in inglese):

| (intestazione del girone) | Played | Points |
|---|---|---|
| **Group A** (occupa tutta la riga) | | |
| Lions | 3 | 9 |
| Tigers | 3 | 4 |
| **Group B** (occupa tutta la riga) | | |
| Eagles | 3 | 7 |
| Wolves | 3 | 1 |
| Total matches (occupa due colonne) | | 12 |

Requisiti:
- Una didascalia "League table".
- Le intestazioni di colonna (Team, Played, Points) stanno in \`<thead>\`, con \`scope="col"\`.
- Il nome di ogni girone è una cella di intestazione che occupa tutte e 3 le colonne.
- I nomi delle squadre sono intestazioni di riga.
- L'ultima riga "Total matches" sta in \`<tfoot>\`, e la sua etichetta occupa due colonne.`,
      tasks: [
        'La didascalia "League table" come primo figlio',
        'Tre intestazioni di colonna in <thead> con scope="col"',
        'Due intestazioni di girone che occupano 3 colonne',
        'Quattro nomi di squadra come <th scope="row">',
        'I punti di ogni squadra sono corretti',
        'Un totale in <tfoot> con un\'etichetta su 2 colonne e 12',
      ],
      hints: [
        'Una riga di girone è fatta così: <tr><th colspan="3" scope="colgroup">Group A</th></tr>',
        'Scrivi il <thead>, poi un solo <tbody> con 6 righe, poi il <tfoot>.',
      ],
    },
  },
  messages: {
    'The first row needs two <th> cells.': 'La prima riga ha bisogno di due celle <th>.',
    'Some rows have a different number of cells.': 'Alcune righe hanno un numero diverso di celle.',
    'Put a <caption> right after <table>.': 'Metti una <caption> subito dopo <table>.',
    'Write the <tbody> explicitly.': 'Scrivi il <tbody> esplicitamente.',
    'Remove the cells covered by the merged ones (7 <td> remain).': 'Togli le celle coperte da quelle unite (restano 7 <td>).',
    'Add <caption>League table</caption> first.': 'Aggiungi per prima <caption>League table</caption>.',
  },
} satisfies ModuleText;
