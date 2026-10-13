import type { ModuleText } from '../../localize';

export default {
  title: 'Modificare i dati',
  description: 'Aggiungi, cambia e togli righe, e crea le tue tabelle: INSERT, UPDATE, DELETE e CREATE TABLE.',
  items: {
    'sql-modify-insert': {
      title: 'Aggiungere righe: INSERT',
      explanation: `Finora hai solo *letto* i dati. \`INSERT\` aggiunge righe nuove:

\`\`\`sql
INSERT INTO tasks (title, priority, due)
VALUES ('Clean the bike', 'low', '2026-11-02');
\`\`\`

- Elenca le colonne che riempi, poi i valori **nello stesso ordine**.
- Le colonne che lasci fuori prendono il loro **valore predefinito** (\`done\` diventa 0, \`priority\` diventa 'normal')
  oppure \`NULL\`. L’\`id\` è un \`INTEGER PRIMARY KEY\`, quindi SQLite numera da solo le righe nuove.
- Un solo \`INSERT\` può aggiungere più righe: \`VALUES (…), (…), (…)\`.

Una modifica non restituisce righe, quindi il pannello dei risultati dice solo quante righe sono cambiate. Aggiungi una
\`SELECT\` dopo per vedere la tabella — e ricorda che ogni esecuzione riparte dai dati originali, quindi eseguire due
volte non aggiunge mai due volte.`,
      tasks: [
        "Aggiungi l’attività 'Call grandma', con priorità 'high' e scadenza '2026-10-18'",
        "Con un solo INSERT, aggiungi 'Go running' e 'Read a chapter', entrambe con priorità 'low' e senza scadenza",
        'Alla fine, mostra tutte le colonne di tutte le attività, per controllare il lavoro',
      ],
      hints: [
        "INSERT INTO tasks (title, priority, due) VALUES ('Call grandma', 'high', '2026-10-18');",
        "Due righe, un’istruzione: VALUES ('Go running', 'low'), ('Read a chapter', 'low');",
        'La SELECT va per ultima, dopo gli INSERT: SELECT * FROM tasks;',
      ],
    },
    'sql-modify-update': {
      title: 'Cambiare righe: UPDATE',
      explanation: `\`UPDATE\` cambia i valori di righe che esistono già:

\`\`\`sql
UPDATE tasks
SET priority = 'high', due = '2026-10-15'
WHERE title = 'Water the plants';
\`\`\`

- \`SET\` elenca i nuovi valori; separane più di uno con le virgole.
- \`WHERE\` sceglie **quali righe** cambiano. **Senza \`WHERE\`, cambiano tutte le righe.** Prova: esegui
  \`UPDATE tasks SET done = 1;\` e guarda la scheda **Tabelle**. In un database vero non c’è “annulla”: per questo chi è
  prudente esegue prima una \`SELECT\` con lo stesso \`WHERE\`, per vedere quali righe sta per toccare.
- Un valore nuovo può usare quello vecchio: \`SET priority = 'low', due = NULL\`, o con i numeri \`SET price = price * 2\`.`,
      tasks: [
        "Segna 'Buy milk' come fatta (done = 1) — e solo quell’attività",
        "Con un solo UPDATE, sposta 'Book the dentist' al '2026-10-27' e imposta la sua priorità a 'normal'",
        'Alla fine, mostra tutte le colonne delle attività ancora da fare (done = 0)',
      ],
      hints: [
        "UPDATE tasks SET done = 1 WHERE title = 'Buy milk';",
        "Due valori in un solo SET: SET due = '2026-10-27', priority = 'normal'",
        'Finisci con: SELECT * FROM tasks WHERE done = 0;',
      ],
    },
    'sql-modify-delete': {
      title: 'Togliere righe: DELETE',
      explanation: `\`DELETE\` toglie righe intere:

\`\`\`sql
DELETE FROM tasks WHERE id = 5;
\`\`\`

Proprio come per \`UPDATE\`: **senza \`WHERE\` se ne vanno tutte le righe**. \`DELETE FROM tasks;\` svuota la tabella. Qui
ogni esecuzione riparte dai dati originali, quindi sperimenta pure; su un database vero controlla prima con una
\`SELECT\`:

\`\`\`sql
SELECT * FROM tasks WHERE done = 1;   -- these are the rows that would go
\`\`\`

Con \`DELETE\` non puoi cancellare un singolo *valore*: per svuotare una cella, aggiornala a \`NULL\` con \`UPDATE\`.`,
      tasks: [
        'Elimina tutte le attività fatte',
        "Elimina 'Water the plants' — e tieni tutte le altre attività ancora da fare",
        'Alla fine, conta le attività rimaste',
      ],
      hints: [
        'DELETE FROM tasks WHERE done = 1;',
        "Scegli la riga dal titolo (o dall’id): DELETE FROM tasks WHERE title = 'Water the plants';",
        'SELECT COUNT(*) FROM tasks; alla fine.',
      ],
    },
    'sql-modify-create': {
      title: 'Una tabella tutta tua: CREATE TABLE',
      explanation: `\`CREATE TABLE\` crea una tabella nuova e vuota. Dai un nome a ogni colonna e dici cosa contiene:

\`\`\`sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  pinned INTEGER NOT NULL DEFAULT 0
);
\`\`\`

| Pezzo | Significato |
|---|---|
| \`INTEGER\`, \`REAL\`, \`TEXT\` | numeri interi, numeri decimali, testo |
| \`PRIMARY KEY\` | identifica ogni riga; un \`INTEGER PRIMARY KEY\` si numera da solo |
| \`NOT NULL\` | la colonna non può restare vuota |
| \`DEFAULT x\` | il valore usato quando un \`INSERT\` non indica la colonna |

\`NOT NULL\` e i tipi sono regole che il database fa rispettare al posto tuo: prova a inserire una nota senza \`text\` e
leggi l’errore. (SQLite è tollerante sui tipi; la maggior parte degli altri database è severa.)`,
      tasks: [
        'Crea una tabella habits con: id INTEGER PRIMARY KEY, name TEXT NOT NULL, streak INTEGER NOT NULL DEFAULT 0',
        "Inserisci le abitudini 'Drink water' e 'Read 10 pages', lasciando a streak il suo valore predefinito",
        'Alla fine, mostra il nome e lo streak di ogni abitudine',
      ],
      hints: [
        'Una colonna per riga, separate da virgole: streak INTEGER NOT NULL DEFAULT 0 è l’ultima, senza virgola dopo.',
        "Indica solo i nomi: INSERT INTO habits (name) VALUES ('Drink water'), ('Read 10 pages');",
        'SELECT name, streak FROM habits;',
      ],
    },
    'sql-modify-challenge': {
      title: 'Riordina il catalogo',
      summary: 'Un prodotto nuovo, un aumento, una pulizia e un controllo finale.',
      explanation: `Hai un piccolo negozio di elettronica e la tabella \`products\` ha bisogno di un po’ di lavoro prima
dell’apertura dei saldi. Scrivi le modifiche in quest’ordine, poi una query finale:

1. È arrivato un prodotto nuovo: **'USB-C cable'**, categoria **'Cables'**, prezzo **9.99**, **40** pezzi in magazzino.
2. Ogni prodotto della categoria **'Accessories'** costa **il 10% in più**: moltiplica il suo prezzo per 1.1 e
   arrotonda a 2 decimali.
3. I prodotti **esauriti** (stock 0) escono dal catalogo.
4. Mostra il catalogo per il sito: **nome e prezzo** di ogni prodotto, **dal più economico**.`,
      tasks: [
        "Il prodotto 'USB-C cable' (Cables, 9.99, 40 in magazzino) è nella tabella",
        'I prezzi degli Accessories sono saliti del 10%, arrotondati a 2 decimali — e nessun altro prezzo è cambiato',
        'I prodotti esauriti non ci sono più, e solo loro',
        'L’ultima query mostra il nome e il prezzo di ogni prodotto, dal più economico',
      ],
      hints: [
        'Il cavo vuole tutte le colonne tranne l’id: INSERT INTO products (name, category, price, stock) VALUES (…);',
        "SET price = ROUND(price * 1.1, 2) WHERE category = 'Accessories'",
        'DELETE FROM products WHERE stock = 0;',
      ],
    },
  },
  messages: {
    'Add both rows in one INSERT: VALUES (…), (…).': 'Aggiungi entrambe le righe con un solo INSERT: VALUES (…), (…).',
  },
} satisfies ModuleText;
