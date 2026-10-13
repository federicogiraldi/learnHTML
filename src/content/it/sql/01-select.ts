import type { ModuleText } from '../../localize';

export default {
  title: 'Le prime query',
  description: 'Chiedi a una tabella esattamente le righe e le colonne che ti servono: SELECT, WHERE, ORDER BY e LIMIT.',
  items: {
    'sql-select-first': {
      title: 'Ciao, database: SELECT',
      explanation: `Un **database** conserva i dati in **tabelle**. Una tabella somiglia a un foglio di calcolo: ogni **riga** è
una cosa (qui, un film) e ogni **colonna** è un’informazione su quella cosa (titolo, anno, genere…).

**SQL** è il linguaggio con cui fai domande a un database. La parola più importante è \`SELECT\`:

\`\`\`sql
-- Every column (*) of every row of the movies table
SELECT * FROM movies;

-- Only some columns, in the order you list them
SELECT title, year FROM movies;
\`\`\`

- \`SELECT\` dice *quali colonne* vuoi, \`FROM\` dice *da quale tabella*.
- Le parole chiave funzionano maiuscole o minuscole (\`select\` = \`SELECT\`), ma scriverle in maiuscolo rende le query
  più leggibili.
- Il punto e virgola \`;\` chiude ogni query, così puoi scriverne più di una nello stesso file. Le righe che iniziano
  con \`--\` sono commenti.

Il tuo SQL gira su un vero database (SQLite) direttamente nel browser. I risultati compaiono a destra; la scheda
**Tabelle** mostra tutto quello che c’è nel database. Sperimenta senza paura: **ogni esecuzione riparte dai dati
originali**.`,
      tasks: [
        'Query 1: mostra il titolo e l’anno di ogni film (in quest’ordine)',
        'Query 2: mostra il titolo, il genere e il voto di ogni film',
      ],
      hints: [
        'Sostituisci l’asterisco con i nomi delle colonne, separati da virgole: SELECT title, year FROM movies;',
        'Chiudi la prima query con ; e scrivi la seconda sotto: SELECT title, genre, rating FROM movies;',
      ],
    },
    'sql-select-where': {
      title: 'Filtrare le righe: WHERE',
      explanation: `\`WHERE\` tiene solo le righe che rispettano una condizione:

\`\`\`sql
SELECT title, year FROM movies WHERE year < 2005;

SELECT * FROM movies WHERE genre = 'Comedy';

SELECT title FROM movies WHERE genre = 'Sci-Fi' AND rating > 8.5;
\`\`\`

| Operatore | Significato |
|---|---|
| \`=\` | uguale (un solo \`=\`, a differenza di JavaScript) |
| \`<>\` o \`!=\` | diverso |
| \`<\` \`>\` \`<=\` \`>=\` | minore / maggiore (o uguale) |

- Il testo va tra **apici singoli**: \`'Comedy'\`. I numeri no: \`2005\`.
- Combina le condizioni con \`AND\` (devono essere vere entrambe) e \`OR\` (basta una). Usa le parentesi quando li
  mescoli: \`WHERE (genre = 'Horror' OR genre = 'Thriller') AND year > 2015\`.
- \`WHERE\` viene dopo \`FROM\`.`,
      tasks: [
        'Query 1: il titolo e l’anno dei film dal 2015 in poi (2015 compreso)',
        'Query 2: tutte le colonne dei film di fantascienza (genre è \'Sci-Fi\')',
        'Query 3: i titoli dei film d’animazione (Animation) che durano meno di 100 minuti',
      ],
      hints: [
        'Aggiungi una condizione dopo FROM movies: WHERE year >= 2015',
        "Il testo vuole gli apici singoli: WHERE genre = 'Sci-Fi'",
        "Due condizioni unite da AND: WHERE genre = 'Animation' AND minutes < 100",
      ],
    },
    'sql-select-order': {
      title: 'Ordinare e fare classifiche: ORDER BY e LIMIT',
      explanation: `Senza \`ORDER BY\` un database restituisce le righe nell’ordine che gli fa più comodo. Per sceglierlo tu:

\`\`\`sql
-- Oldest first (ASC, ascending, is the default)
SELECT title, year FROM movies ORDER BY year;

-- Best rated first
SELECT title, rating FROM movies ORDER BY rating DESC;

-- By genre, then by title inside each genre
SELECT genre, title FROM movies ORDER BY genre, title;
\`\`\`

\`LIMIT\` tiene solo le prime righe: perfetto per le classifiche “top 3”:

\`\`\`sql
SELECT title, minutes FROM movies ORDER BY minutes LIMIT 3;
\`\`\`

L’ordine delle parti è fisso: \`SELECT … FROM … WHERE … ORDER BY … LIMIT …\`.
Il testo viene ordinato alfabeticamente, e i valori vuoti (\`NULL\`) vengono per primi in ordine crescente e per
ultimi con \`DESC\`.`,
      tasks: [
        'Query 1: il titolo e il voto dei 5 film con il voto più alto, dal migliore',
        'Query 2: il titolo e l’anno dei 3 film più recenti, dal più nuovo',
        'Query 3: tutti i titoli, in ordine alfabetico',
      ],
      hints: [
        'Prima ordina, poi taglia: ORDER BY rating DESC LIMIT 5',
        'Più recente vuol dire anno più grande per primo: ORDER BY year DESC LIMIT 3',
        'L’ordine alfabetico è quello predefinito (crescente): ORDER BY title',
      ],
    },
    'sql-select-filters': {
      title: 'Filtri più furbi: IN, BETWEEN, LIKE e NULL',
      explanation: `Qualche scorciatoia rende le condizioni più corte e più facili da leggere:

\`\`\`sql
-- IN: one of a list (instead of genre = … OR genre = …)
SELECT title, genre FROM movies WHERE genre IN ('Action', 'Thriller');

-- BETWEEN: a range, both ends included
SELECT title, year FROM movies WHERE year BETWEEN 2000 AND 2009;

-- LIKE: a text pattern. % means "any text", _ means "one character"
SELECT title FROM movies WHERE title LIKE '%Knight%';
\`\`\`

**\`NULL\`** vuol dire “nessun valore”: sconosciuto, o non ancora presente. Guarda l’ultimo film nella scheda
**Tabelle**: non ha ancora un voto. \`NULL\` non è uguale a niente, nemmeno a \`NULL\`, quindi \`rating = NULL\` non trova
mai nulla. Usa:

\`\`\`sql
SELECT title FROM movies WHERE rating IS NOT NULL;
\`\`\`

In SQLite \`LIKE\` non distingue maiuscole e minuscole per le lettere inglesi: \`'%knight%'\` trova anche
*The Dark Knight*.`,
      tasks: [
        'Query 1: il titolo e il genere dei film Comedy e Horror, usando IN',
        'Query 2: il titolo e l’anno dei film dal 2010 al 2019, usando BETWEEN',
        'Query 3: i titoli che iniziano con "The " (con LIKE)',
        'Query 4: il titolo del film che non ha ancora un voto',
      ],
      hints: [
        "IN vuole un elenco tra parentesi: WHERE genre IN ('Comedy', 'Horror')",
        'BETWEEN include entrambi gli estremi: WHERE year BETWEEN 2010 AND 2019',
        "Lo schema 'The %' significa: The, uno spazio, poi qualsiasi cosa.",
        'rating = NULL non trova mai niente: scrivi rating IS NULL.',
      ],
    },
    'sql-select-challenge': {
      title: 'Serata film',
      summary: 'Quattro amici, quattro richieste: rispondi a ognuna con una query.',
      explanation: `È la serata film e ognuno ha la sua opinione. Scrivi **una query per richiesta**, in quest’ordine, poi
premi **Verifica la mia soluzione**.

1. Ada è stanca: film di **2 ore o meno** (al massimo 120 minuti) con un voto **di almeno 8**. Mostra titolo, minuti e
   voto, dal voto più alto.
2. Ben vuole i classici: film **Sci-Fi o Action** usciti **prima del 2010**. Mostra titolo e anno, dal più recente.
3. Chloé ha tutta la notte: i **3 film più lunghi**. Mostra titolo e minuti, dal più lungo.
4. Dev vuole solo i titoli che contengono la parola **"Out"**. Mostra solo il titolo.`,
      tasks: [
        'Query 1: titolo, minuti e voto dei film di 120 minuti o meno con voto da 8 in su, dal voto più alto',
        'Query 2: titolo e anno dei film Sci-Fi o Action usciti prima del 2010, dal più recente',
        'Query 3: titolo e minuti dei 3 film più lunghi, dal più lungo',
        'Query 4: i titoli che contengono "Out"',
      ],
      hints: [
        'Per Ben, mescolare OR e AND richiede le parentesi — oppure usa IN, che evita il problema.',
        'La query di Chloé ordina con DESC e taglia con LIMIT 3. I film senza durata (NULL) finiscono in fondo con DESC.',
        "Lo schema di Dev ha % da entrambe le parti: '%Out%'.",
      ],
    },
  },
  messages: {
    "Use IN ('Comedy', 'Horror').": "Usa IN ('Comedy', 'Horror').",
    'Use BETWEEN 2010 AND 2019.': 'Usa BETWEEN 2010 AND 2019.',
    'Use LIKE with a pattern.': 'Usa LIKE con uno schema.',
  },
} satisfies ModuleText;
