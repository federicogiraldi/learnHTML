import type { Module } from '../types';
import { afterwards, all, returns, uses } from '../../engine/sqlChecks';

/** A to-do list. `done` is 0 (to do) or 1 (done). */
const todo = `CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'normal',
  due TEXT
);
INSERT INTO tasks (id, title, done, priority, due) VALUES
  (1, 'Buy milk', 0, 'normal', '2026-10-14'),
  (2, 'Book the dentist', 0, 'high', '2026-10-20'),
  (3, 'Pay the rent', 1, 'high', '2026-10-01'),
  (4, 'Water the plants', 0, 'low', NULL),
  (5, 'Reply to Sara', 1, 'normal', '2026-10-05'),
  (6, 'Learn SQL', 0, 'high', '2026-10-31');
`;

/** A shop catalogue to tidy up in the challenge. */
const catalogue = `CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0
);
INSERT INTO products (id, name, category, price, stock) VALUES
  (1, 'Wireless mouse', 'Accessories', 19.90, 25),
  (2, 'Keyboard', 'Accessories', 34.50, 0),
  (3, 'Laptop stand', 'Accessories', 27.00, 12),
  (4, 'Monitor 27', 'Screens', 189.00, 4),
  (5, 'Webcam HD', 'Video', 49.00, 0),
  (6, 'Headphones', 'Audio', 59.90, 8),
  (7, 'Desk lamp', 'Lighting', 22.50, 15);
`;

const insertGrandma = "INSERT INTO tasks (title, priority, due) VALUES ('Call grandma', 'high', '2026-10-18');";
const insertTwo = "INSERT INTO tasks (title, priority) VALUES ('Go running', 'low'), ('Read a chapter', 'low');";
const markMilk = "UPDATE tasks SET done = 1 WHERE title = 'Buy milk';";
const postponeDentist = "UPDATE tasks SET due = '2026-10-27', priority = 'normal' WHERE title = 'Book the dentist';";
const deleteDone = 'DELETE FROM tasks WHERE done = 1;';
const deletePlants = "DELETE FROM tasks WHERE title = 'Water the plants';";
const createHabits = `CREATE TABLE habits (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  streak INTEGER NOT NULL DEFAULT 0
);`;
const insertHabits = "INSERT INTO habits (name) VALUES ('Drink water'), ('Read 10 pages');";

const addCable = "INSERT INTO products (name, category, price, stock) VALUES ('USB-C cable', 'Cables', 9.99, 40);";
const raiseAccessories = "UPDATE products SET price = ROUND(price * 1.1, 2) WHERE category = 'Accessories';";
const removeSoldOut = 'DELETE FROM products WHERE stock = 0;';

export const modify: Module = {
  id: 'sql-modify',
  title: 'Changing Data',
  description: 'Add, change and remove rows, and create your own tables: INSERT, UPDATE, DELETE and CREATE TABLE.',
  lessons: [
    {
      id: 'sql-modify-insert',
      title: 'Adding rows: INSERT',
      explanation: `Until now you only *read* data. \`INSERT\` adds new rows:

\`\`\`sql
INSERT INTO tasks (title, priority, due)
VALUES ('Clean the bike', 'low', '2026-11-02');
\`\`\`

- List the columns you fill in, then the values **in the same order**.
- Columns you leave out get their **default** (\`done\` becomes 0, \`priority\` becomes 'normal') or \`NULL\`.
  The \`id\` is an \`INTEGER PRIMARY KEY\`, so SQLite numbers new rows by itself.
- One \`INSERT\` can add several rows: \`VALUES (…), (…), (…)\`.

A change returns no rows, so the results pane just says how many rows changed. Add a \`SELECT\` after it to see the
table — and remember that every run starts again from the original data, so running twice never adds twice.`,
      starterCode: '',
      starterSql: `-- 1. Add 'Call grandma'

-- 2. Add two tasks with one INSERT

-- 3. Show every task
`,
      db: todo,
      tasks: [
        {
          text: "Add the task 'Call grandma', with priority 'high' and due date '2026-10-18'",
          check: afterwards("SELECT title, done, priority, due FROM tasks WHERE title = 'Call grandma'", insertGrandma),
        },
        {
          text: "With a single INSERT, add 'Go running' and 'Read a chapter', both with priority 'low' and no due date",
          check: all(
            afterwards("SELECT title, done, priority, due FROM tasks WHERE title IN ('Go running', 'Read a chapter')", insertTwo),
            uses(/VALUES\s*\([^;]*\)\s*,\s*\(/i, 'Add both rows in one INSERT: VALUES (…), (…).'),
          ),
        },
        {
          text: 'Finally, show every column of every task, to check your work',
          check: returns('SELECT * FROM tasks', { after: insertGrandma + insertTwo }),
        },
      ],
      hints: [
        "INSERT INTO tasks (title, priority, due) VALUES ('Call grandma', 'high', '2026-10-18');",
        "Two rows, one statement: VALUES ('Go running', 'low'), ('Read a chapter', 'low');",
        'The SELECT goes last, after the INSERTs: SELECT * FROM tasks;',
      ],
      solution: '',
      solutionSql: `-- 1. Add 'Call grandma'
INSERT INTO tasks (title, priority, due)
VALUES ('Call grandma', 'high', '2026-10-18');

-- 2. Add two tasks with one INSERT
INSERT INTO tasks (title, priority)
VALUES ('Go running', 'low'), ('Read a chapter', 'low');

-- 3. Show every task
SELECT * FROM tasks;
`,
    },
    {
      id: 'sql-modify-update',
      title: 'Changing rows: UPDATE',
      explanation: `\`UPDATE\` changes values in rows that already exist:

\`\`\`sql
UPDATE tasks
SET priority = 'high', due = '2026-10-15'
WHERE title = 'Water the plants';
\`\`\`

- \`SET\` lists the new values; separate several with commas.
- \`WHERE\` chooses **which rows** change. **Without \`WHERE\`, every row changes.** Try it: run
  \`UPDATE tasks SET done = 1;\` and look at the **Tables** tab. In a real database there's no undo — that's why
  careful people run a \`SELECT\` with the same \`WHERE\` first, to see which rows they're about to touch.
- A new value can use the old one: \`SET priority = 'low', due = NULL\`, or with numbers \`SET price = price * 2\`.`,
      starterCode: '',
      starterSql: `-- 1. Mark 'Buy milk' as done

-- 2. Postpone the dentist

-- 3. Show what's left to do
`,
      db: todo,
      tasks: [
        {
          text: "Mark 'Buy milk' as done (done = 1) — and only that task",
          check: afterwards('SELECT id, done FROM tasks', markMilk),
        },
        {
          text: "With one UPDATE, move 'Book the dentist' to '2026-10-27' and set its priority to 'normal'",
          check: afterwards('SELECT id, priority, due FROM tasks', postponeDentist),
        },
        {
          text: 'Finally, show every column of the tasks still to do (done = 0)',
          check: returns('SELECT * FROM tasks WHERE done = 0', { after: markMilk + postponeDentist }),
        },
      ],
      hints: [
        "UPDATE tasks SET done = 1 WHERE title = 'Buy milk';",
        "Two values in one SET: SET due = '2026-10-27', priority = 'normal'",
        'End with: SELECT * FROM tasks WHERE done = 0;',
      ],
      solution: '',
      solutionSql: `-- 1. Mark 'Buy milk' as done
UPDATE tasks SET done = 1 WHERE title = 'Buy milk';

-- 2. Postpone the dentist
UPDATE tasks
SET due = '2026-10-27', priority = 'normal'
WHERE title = 'Book the dentist';

-- 3. Show what's left to do
SELECT * FROM tasks WHERE done = 0;
`,
    },
    {
      id: 'sql-modify-delete',
      title: 'Removing rows: DELETE',
      explanation: `\`DELETE\` removes whole rows:

\`\`\`sql
DELETE FROM tasks WHERE id = 5;
\`\`\`

Exactly like \`UPDATE\`: **without \`WHERE\`, every row goes**. \`DELETE FROM tasks;\` empties the table. Here every run
starts from the original data, so experiment — on a real database, check with a \`SELECT\` first:

\`\`\`sql
SELECT * FROM tasks WHERE done = 1;   -- these are the rows that would go
\`\`\`

You can't delete a single *value* with \`DELETE\`: to empty one cell, \`UPDATE\` it to \`NULL\`.`,
      starterCode: '',
      starterSql: `-- 1. Clear out the tasks that are done

-- 2. Remove 'Water the plants'

-- 3. Count the tasks left
`,
      db: todo,
      tasks: [
        {
          text: 'Delete every task that is done',
          check: afterwards('SELECT id FROM tasks WHERE done = 1', deleteDone),
        },
        {
          text: "Delete 'Water the plants' — and keep every other task still to do",
          check: afterwards('SELECT id FROM tasks WHERE done = 0', deletePlants),
        },
        {
          text: 'Finally, count the tasks that are left',
          check: returns('SELECT COUNT(*) FROM tasks', { after: deleteDone + deletePlants }),
        },
      ],
      hints: [
        'DELETE FROM tasks WHERE done = 1;',
        "Pick the row by its title (or its id): DELETE FROM tasks WHERE title = 'Water the plants';",
        'SELECT COUNT(*) FROM tasks; at the end.',
      ],
      solution: '',
      solutionSql: `-- 1. Clear out the tasks that are done
DELETE FROM tasks WHERE done = 1;

-- 2. Remove 'Water the plants'
DELETE FROM tasks WHERE title = 'Water the plants';

-- 3. Count the tasks left
SELECT COUNT(*) FROM tasks;
`,
    },
    {
      id: 'sql-modify-create',
      title: 'Your own table: CREATE TABLE',
      explanation: `\`CREATE TABLE\` makes a new, empty table. You name each column and say what it holds:

\`\`\`sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  pinned INTEGER NOT NULL DEFAULT 0
);
\`\`\`

| Piece | Meaning |
|---|---|
| \`INTEGER\`, \`REAL\`, \`TEXT\` | whole numbers, decimal numbers, text |
| \`PRIMARY KEY\` | identifies each row; an \`INTEGER PRIMARY KEY\` numbers itself |
| \`NOT NULL\` | the column can't be left empty |
| \`DEFAULT x\` | the value used when an \`INSERT\` leaves the column out |

\`NOT NULL\` and the types are rules the database enforces for you: try inserting a note without \`text\` and read the
error. (SQLite is relaxed about types; most other databases are strict.)`,
      starterCode: '',
      starterSql: `-- 1. Create the habits table

-- 2. Add two habits

-- 3. Show them
`,
      db: todo,
      tasks: [
        {
          text: 'Create a table habits with: id INTEGER PRIMARY KEY, name TEXT NOT NULL, streak INTEGER NOT NULL DEFAULT 0',
          check: afterwards(
            `SELECT name, upper(type) AS type, "notnull" AS not_null, dflt_value AS default_value, pk AS primary_key
             FROM pragma_table_info('habits')`,
            createHabits,
          ),
        },
        {
          text: "Insert the habits 'Drink water' and 'Read 10 pages', leaving streak to its default",
          check: afterwards('SELECT name, streak FROM habits', createHabits + insertHabits),
        },
        {
          text: 'Finally, show the name and streak of every habit',
          check: returns('SELECT name, streak FROM habits', { after: createHabits + insertHabits }),
        },
      ],
      hints: [
        'One column per line, separated by commas: streak INTEGER NOT NULL DEFAULT 0 is the last one, with no comma after it.',
        "Only give the names: INSERT INTO habits (name) VALUES ('Drink water'), ('Read 10 pages');",
        'SELECT name, streak FROM habits;',
      ],
      solution: '',
      solutionSql: `-- 1. Create the habits table
CREATE TABLE habits (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  streak INTEGER NOT NULL DEFAULT 0
);

-- 2. Add two habits
INSERT INTO habits (name) VALUES ('Drink water'), ('Read 10 pages');

-- 3. Show them
SELECT name, streak FROM habits;
`,
    },
  ],
  challenge: {
    id: 'sql-modify-challenge',
    title: 'Tidy up the catalogue',
    difficulty: 2,
    summary: 'A new product, a price rise, a clear-out and a final check.',
    explanation: `You run a small electronics shop and the \`products\` table needs some work before the sales open.
Write the changes in this order, then a final query:

1. A new product arrived: **'USB-C cable'**, category **'Cables'**, price **9.99**, **40** in stock.
2. Every product in the **'Accessories'** category gets **10% more expensive**: multiply its price by 1.1 and round to
   2 decimals.
3. Products that are **sold out** (stock 0) leave the catalogue.
4. Show the catalogue for the website: the **name and price** of every product, **cheapest first**.`,
    starterCode: '',
    starterSql: `-- 1. The new cable

-- 2. Accessories +10%

-- 3. Remove the sold-out products

-- 4. The catalogue, cheapest first
`,
    db: catalogue,
    tasks: [
      {
        text: "The product 'USB-C cable' (Cables, 9.99, 40 in stock) is in the table",
        check: afterwards("SELECT name, category, price, stock FROM products WHERE name = 'USB-C cable'", addCable),
      },
      {
        text: 'The Accessories prices went up by 10%, rounded to 2 decimals — and no other price changed',
        check: afterwards('SELECT id, price FROM products WHERE id <= 7 AND stock > 0', raiseAccessories),
      },
      {
        text: 'The sold-out products are gone, and only those',
        check: afterwards('SELECT id FROM products WHERE id <= 7', removeSoldOut),
      },
      {
        text: 'The last query shows the name and price of every product, cheapest first',
        check: returns('SELECT name, price FROM products ORDER BY price', { ordered: true, after: addCable + raiseAccessories + removeSoldOut }),
      },
    ],
    hints: [
      'The cable needs every column but the id: INSERT INTO products (name, category, price, stock) VALUES (…);',
      "SET price = ROUND(price * 1.1, 2) WHERE category = 'Accessories'",
      'DELETE FROM products WHERE stock = 0;',
    ],
    solution: '',
    solutionSql: `-- 1. The new cable
INSERT INTO products (name, category, price, stock)
VALUES ('USB-C cable', 'Cables', 9.99, 40);

-- 2. Accessories +10%
UPDATE products
SET price = ROUND(price * 1.1, 2)
WHERE category = 'Accessories';

-- 3. Remove the sold-out products
DELETE FROM products WHERE stock = 0;

-- 4. The catalogue, cheapest first
SELECT name, price FROM products ORDER BY price;
`,
  },
};
