import type { ModuleText } from '../../localize';

export default {
  title: 'Riassumere i dati',
  description: 'Trasforma tante righe in una sola risposta: COUNT, SUM, AVG, colonne calcolate, GROUP BY e HAVING.',
  items: {
    'sql-agg-count': {
      title: 'Contare e sommare',
      explanation: `Finora ogni query restituiva righe della tabella. Le **funzioni di aggregazione** invece schiacciano
tante righe in **un solo** valore:

\`\`\`sql
SELECT COUNT(*) FROM sales;             -- how many rows
SELECT SUM(quantity) FROM sales;        -- add up a column
SELECT AVG(price) FROM sales;           -- the average
SELECT MIN(day), MAX(day) FROM sales;   -- smallest and largest
\`\`\`

Funzionano insieme a \`WHERE\`: prima le righe vengono filtrate, poi riassunte.

\`\`\`sql
-- How many espressos were sold, over all three days?
SELECT SUM(quantity) FROM sales WHERE product = 'Espresso';
\`\`\`

Questa tabella contiene tre giorni di vendite di un piccolo bar: una riga per prodotto per giorno. Dai un’occhiata alla
scheda **Tabelle**.`,
      tasks: [
        'Query 1: conta le righe della tabella sales',
        'Query 2: la quantità totale di articoli venduti',
        'Query 3: il prezzo più basso e quello più alto, in una sola query (prima il più basso)',
        'Query 4: quanti croissant sono stati venduti in tutto (product è \'Croissant\')',
      ],
      hints: [
        'COUNT(*) conta le righe: SELECT COUNT(*) FROM sales;',
        'Due funzioni nella stessa SELECT, separate da una virgola: SELECT MIN(price), MAX(price) FROM sales;',
        "Prima filtra, poi somma: SELECT SUM(quantity) FROM sales WHERE product = 'Croissant';",
      ],
    },
    'sql-agg-alias': {
      title: 'Colonne calcolate: AS e ROUND',
      explanation: `Una colonna nella \`SELECT\` non deve per forza esistere nella tabella: può essere un **calcolo**.
\`AS\` le dà un nome leggibile.

\`\`\`sql
SELECT product, quantity * price AS revenue FROM sales;
\`\`\`

Con i soldi capita spesso di vedere decimali lunghissimi (\`16.799999999999997\`): i computer memorizzano la maggior
parte dei numeri decimali in modo approssimato. \`ROUND(valore, 2)\` tiene due decimali:

\`\`\`sql
SELECT ROUND(AVG(quantity), 2) AS average_quantity FROM sales;
\`\`\`

- I conti funzionano come sempre: \`+ - * /\` e le parentesi. Attenzione: in SQLite dividere due numeri interi dà un
  intero (\`7 / 2\` fa \`3\`); scrivi \`7 / 2.0\` per tenere i decimali.
- Dai alle colonne nomi in *snake_case* (\`total_revenue\`): senza spazi, così sono facili da riusare.`,
      tasks: [
        'Query 1: per ogni vendita, il prodotto, la quantità e quantity * price con il nome revenue',
        'Query 2: l’incasso totale di tutte le vendite, arrotondato a 2 decimali e chiamato total',
        'Query 3: il prezzo medio, arrotondato a 2 decimali e chiamato avg_price',
      ],
      hints: [
        'Aggiungi il calcolo come terza colonna: SELECT product, quantity, quantity * price AS revenue FROM sales;',
        'ROUND avvolge tutto il totale: ROUND(SUM(quantity * price), 2) AS total',
        'Stessa forma per la media: ROUND(AVG(price), 2) AS avg_price',
      ],
    },
    'sql-agg-group': {
      title: 'Un totale per gruppo: GROUP BY',
      explanation: `\`SUM(quantity)\` dà un totale per tutta la tabella. \`GROUP BY\` dà **un totale per ogni gruppo** di righe
che hanno lo stesso valore:

\`\`\`sql
SELECT product, SUM(quantity) AS sold
FROM sales
GROUP BY product;
\`\`\`

Il database mette le righe di ogni prodotto in una pila, poi esegue \`SUM\` su ogni pila: una riga di risultato per
prodotto.

- Ogni colonna nella \`SELECT\` dovrebbe stare nel \`GROUP BY\` oppure dentro una funzione di aggregazione. (SQLite ti
  lascia infrangere la regola, ma poi prende un valore del gruppo quasi a caso: evitalo.)
- Puoi ordinare per un’aggregazione usando il suo nome: \`ORDER BY sold DESC\`.
- L’ordine delle parti: \`SELECT … FROM … WHERE … GROUP BY … ORDER BY … LIMIT …\`.`,
      tasks: [
        'Query 1: ogni categoria con la quantità totale venduta',
        'Query 2: ogni giorno con il suo incasso (quantity * price), arrotondato a 2 decimali, con i nomi day e revenue, in ordine di data',
        'Query 3: ogni prodotto con la sua quantità totale, dal più venduto',
      ],
      hints: [
        'Senza GROUP BY ottieni una riga sola per tutta la tabella. Aggiungi GROUP BY category alla fine.',
        'Incasso per giorno: SELECT day, ROUND(SUM(quantity * price), 2) AS revenue FROM sales GROUP BY day ORDER BY day;',
        'Dai un nome al totale e ordina per quello: SUM(quantity) AS sold … ORDER BY sold DESC',
      ],
    },
    'sql-agg-having': {
      title: 'Filtrare i gruppi: HAVING e DISTINCT',
      explanation: `\`WHERE\` filtra le **righe**, prima di raggruppare. Per filtrare i **gruppi** in base al loro totale usa
\`HAVING\`, dopo \`GROUP BY\`:

\`\`\`sql
-- Products that sold more than 30 items in total
SELECT product, SUM(quantity) AS sold
FROM sales
GROUP BY product
HAVING SUM(quantity) > 30;
\`\`\`

Possono stare tutti e due nella stessa query: \`WHERE\` sceglie le righe, \`GROUP BY\` fa le pile, \`HAVING\` tiene
alcune pile.

\`DISTINCT\` toglie le righe doppie dal risultato: comodo per elencare i diversi valori di una colonna:

\`\`\`sql
SELECT DISTINCT day FROM sales;
SELECT COUNT(DISTINCT day) FROM sales;   -- how many different days
\`\`\``,
      tasks: [
        'Query 1: elenca ogni categoria una volta sola, con DISTINCT',
        'Query 2: i prodotti che hanno venduto più di 20 articoli in totale, con quel totale',
        'Query 3: i giorni in cui sono stati venduti più di 25 articoli di caffetteria (category \'Coffee\'), con quel numero',
      ],
      hints: [
        'SELECT DISTINCT category FROM sales;',
        'HAVING viene dopo GROUP BY: GROUP BY product HAVING SUM(quantity) > 20',
        "Prima le righe, poi i gruppi: WHERE category = 'Coffee' GROUP BY day HAVING SUM(quantity) > 25",
      ],
    },
    'sql-agg-challenge': {
      title: 'Il resoconto settimanale del bar',
      summary: 'Il titolare vuole i numeri: quattro domande, quattro query.',
      explanation: `Il titolare del bar sta preparando il resoconto della settimana e gli servono quattro numeri. Scrivi una
query per domanda, in quest’ordine. L’incasso è \`quantity * price\`, sempre arrotondato a **2 decimali**.

1. **Incasso per categoria**: colonne \`category\` e \`revenue\`, dall’incasso più alto.
2. **Il giorno migliore**: il solo giorno con l’incasso più alto. Colonne \`day\` e \`revenue\`.
3. **I prodotti costanti**: i prodotti che vendono in media **almeno 8 articoli per vendita** (una riga della tabella è
   una vendita). Colonne \`product\` e \`avg_quantity\` (la media, arrotondata a 1 decimale).
4. **Quanto è grande il menù**: quanti prodotti *diversi* sono stati venduti. Una colonna chiamata \`products\`.`,
      tasks: [
        'Query 1: categoria e incasso, dal più alto',
        'Query 2: il giorno con l’incasso più alto, e quell’incasso',
        'Query 3: i prodotti che vendono in media almeno 8 articoli per vendita, con avg_quantity',
        'Query 4: il numero di prodotti diversi, chiamato products',
      ],
      hints: [
        'Il giorno migliore è la query 1 raggruppata per day invece che per category, più LIMIT 1.',
        'Filtra i gruppi sulla media esatta, HAVING AVG(quantity) >= 8, e arrotonda solo quello che mostri.',
        'COUNT(DISTINCT product) conta ogni prodotto una volta sola.',
      ],
    },
  },
  messages: {
    'Use GROUP BY.': 'Usa GROUP BY.',
    'Use SELECT DISTINCT.': 'Usa SELECT DISTINCT.',
    'Filter the groups with HAVING.': 'Filtra i gruppi con HAVING.',
  },
} satisfies ModuleText;
