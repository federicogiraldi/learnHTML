import type { ModuleText } from '../../localize';

export default {
  title: 'Unire le tabelle',
  description: 'I dati veri stanno in più tabelle collegate da chiavi. JOIN le rimette insieme.',
  items: {
    'sql-join-keys': {
      title: 'Le chiavi: come si collegano le tabelle',
      explanation: `Questo negozio ha due tabelle: \`customers\` (clienti) e \`orders\` (ordini). Perché non una tabella unica?
Perché ogni ordine ripeterebbe il nome e la città del cliente, e quando un cliente trasloca dovresti correggere tante
righe.

Così ogni tabella contiene un solo tipo di cosa, e le tabelle si indicano a vicenda con le **chiavi**:

- La **chiave primaria** identifica ogni riga: \`customers.id\` è unico, due clienti non lo condividono mai.
- La **chiave esterna** punta a una riga di un’altra tabella: \`orders.customer_id\` contiene l’\`id\` del cliente che ha
  fatto l’ordine.

\`\`\`sql
-- Who is customer 3?
SELECT * FROM customers WHERE id = 3;

-- And what did they order?
SELECT * FROM orders WHERE customer_id = 3;
\`\`\`

Apri la scheda **Tabelle** per vederle tutte e due. Per ora rispondere a “cosa ha ordinato Giulia?” richiede due passi:
trovare il suo \`id\`, poi i suoi ordini. Nella prossima lezione basterà una query sola.`,
      tasks: [
        'Query 1: l’id e il nome dei clienti che vivono a Milano (Milan)',
        'Query 2: l’id e il totale di ogni ordine fatto da Giulia (cerca prima il suo id)',
        'Query 3: quanti ordini ha fatto il cliente 2',
      ],
      hints: [
        "SELECT id, name FROM customers WHERE city = 'Milan';",
        "L’id di Giulia è nella tabella customers. Poi: SELECT id, total FROM orders WHERE customer_id = …;",
        'Conta le righe che puntano al cliente 2: SELECT COUNT(*) FROM orders WHERE customer_id = 2;',
      ],
    },
    'sql-join-inner': {
      title: 'Mettere insieme le tabelle: JOIN',
      explanation: `\`JOIN\` incolla ogni riga di una tabella alla riga corrispondente di un’altra. \`ON\` dice come si
corrispondono:

\`\`\`sql
SELECT orders.id, customers.name, orders.total
FROM orders
JOIN customers ON orders.customer_id = customers.id;
\`\`\`

Per ogni ordine il database trova il cliente il cui \`id\` è uguale al \`customer_id\` dell’ordine, e costruisce una riga
con colonne di entrambi. Ora puoi filtrare, ordinare e raggruppare su qualunque di esse.

- Scrivi \`tabella.colonna\` quando entrambe le tabelle hanno una colonna con quel nome (tutte e due hanno \`id\`),
  altrimenti SQLite si lamenta: *ambiguous column name*.
- Gli **alias** corti fanno risparmiare battute: \`FROM orders AS o JOIN customers AS c ON o.customer_id = c.id\` (l’\`AS\`
  è facoltativo), poi scrivi \`o.total\`, \`c.name\`.
- \`JOIN\` è l’abbreviazione di \`INNER JOIN\`: le righe senza corrispondenza dall’altra parte restano fuori.`,
      tasks: [
        'Query 1: l’id di ogni ordine, il nome del cliente e il totale dell’ordine',
        'Query 2: nome, data e totale degli ordini fatti da clienti che vivono a Roma (Rome)',
        'Query 3: nome e totale dei 3 ordini più grandi, dal più grande',
      ],
      hints: [
        'Aggiungi la seconda tabella dopo FROM orders: JOIN customers ON orders.customer_id = customers.id',
        "Dopo il JOIN filtra come al solito: WHERE customers.city = 'Rome'",
        'ORDER BY orders.total DESC LIMIT 3 viene dopo il JOIN.',
      ],
    },
    'sql-join-left': {
      title: 'Tenere le righe senza corrispondenza: LEFT JOIN',
      explanation: `Emma e Noah non hanno mai ordinato niente, quindi un \`JOIN\` tra clienti e ordini li lascia fuori.
Un \`LEFT JOIN\` tiene **tutte le righe della tabella di sinistra** (quella dopo \`FROM\`) e riempie le colonne dell’altra
tabella con \`NULL\` quando non c’è corrispondenza:

\`\`\`sql
SELECT customers.name, orders.id
FROM customers
LEFT JOIN orders ON orders.customer_id = customers.id;
\`\`\`

Quel \`NULL\` è utile: segna le righe che non avevano corrispondenza. Per trovare i clienti che non hanno mai ordinato,
tieni solo quelle:

\`\`\`sql
-- ... LEFT JOIN as above, then:
WHERE orders.id IS NULL
\`\`\`

Quale tabella viene prima conta: \`FROM customers LEFT JOIN orders\` tiene tutti i clienti;
\`FROM orders LEFT JOIN customers\` tiene tutti gli ordini.`,
      tasks: [
        'Query 1: il nome di ogni cliente e il totale di ciascuno dei suoi ordini, compresi i clienti senza ordini',
        'Query 2: i nomi dei clienti che non hanno mai fatto un ordine',
      ],
      hints: [
        'Trasforma JOIN in LEFT JOIN: customers è a sinistra, quindi restano tutti.',
        'Stesso LEFT JOIN, poi WHERE orders.id IS NULL tiene i clienti senza corrispondenza.',
      ],
    },
    'sql-join-group': {
      title: 'JOIN e GROUP BY insieme',
      explanation: `Join e raggruppamenti insieme rispondono a vere domande di business, come “quanto ha speso ogni cliente?”:

\`\`\`sql
SELECT c.name, SUM(o.total) AS spent
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.name;
\`\`\`

Il join costruisce una riga per ordine (con le colonne del cliente attaccate), poi \`GROUP BY\` le impila per nome.

Una trappola classica: contare con un \`LEFT JOIN\`. Un cliente senza ordini ha comunque **una** riga (piena di
\`NULL\`), quindi \`COUNT(*)\` dice 1. \`COUNT(colonna)\` conta solo i valori che non sono \`NULL\`:

\`\`\`sql
SELECT c.name, COUNT(o.id) AS orders_count   -- 0 for Emma and Noah
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.name;
\`\`\``,
      tasks: [
        'Query 1: il nome di ogni cliente che ha ordinato, e quanti ordini ha fatto',
        'Query 2: ogni città con il totale speso dai suoi clienti, arrotondato a 2 decimali, con i nomi city e spent, dalla più alta',
        'Query 3: ogni cliente con il suo numero di ordini, 0 per chi non ha mai ordinato',
      ],
      hints: [
        'Fai il JOIN delle due tabelle, poi GROUP BY customers.name e COUNT(*).',
        'Raggruppa per città: GROUP BY c.city, poi ORDER BY spent DESC.',
        'LEFT JOIN tiene tutti; COUNT(orders.id) dà 0 dove non c’è nessun ordine.',
      ],
    },
    'sql-join-challenge': {
      title: 'Il detective della biblioteca',
      summary: 'Tre tabelle, quattro misteri: chi ha quale libro?',
      explanation: `La biblioteca del paese tiene tre tabelle: \`members\` (iscritti), \`books\` (libri) e \`loans\` (prestiti).
Ogni prestito collega un libro a un iscritto; un prestito con la data \`returned\` a \`NULL\` vuol dire che il libro
è **ancora fuori**. Esplorale nella scheda **Tabelle**, poi risolvi i quattro misteri, una query ciascuno, in
quest’ordine.

1. **Libri mancanti**: ogni libro ancora fuori: il titolo del libro, il nome dell’iscritto e la data \`borrowed\`,
   dal prestito più vecchio.
2. **Lo scaffale più amato**: ogni libro con il numero di volte che è stato preso in prestito, compresi quelli mai
   prestati, con 0. Colonne \`title\` e \`times\`, dal più prestato, poi in ordine alfabetico di titolo.
3. **Tessere addormentate**: i nomi degli iscritti che non hanno mai preso un libro.
4. **Accumulatori**: gli iscritti che in questo momento hanno fuori **più di un** libro, con quanti. Colonne \`name\` e
   \`out\`.`,
      tasks: [
        'Query 1: titolo, nome dell’iscritto e data del prestito dei libri ancora fuori, dal più vecchio',
        'Query 2: ogni libro con le volte che è stato prestato (0 compreso), dal più prestato, poi per titolo',
        'Query 3: gli iscritti che non hanno mai preso un libro',
        'Query 4: gli iscritti con più di un libro fuori, con quanti (name, out)',
      ],
      hints: [
        'Due JOIN di fila: FROM loans JOIN books ON … JOIN members ON …',
        'Per tenere i libri mai prestati parti FROM books e fai LEFT JOIN loans; conta con COUNT(loans.id).',
        'Ordina su due colonne: ORDER BY times DESC, title.',
        'Accumulatori: WHERE sceglie i prestiti ancora fuori, GROUP BY l’iscritto, HAVING COUNT(*) > 1 tiene i gruppi.',
      ],
    },
  },
  messages: {
    'Use JOIN … ON to bring in the customers table.': 'Usa JOIN … ON per aggiungere la tabella customers.',
    'Use LEFT JOIN to keep every customer.': 'Usa LEFT JOIN per tenere tutti i clienti.',
  },
} satisfies ModuleText;
