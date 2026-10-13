import type { Module } from '../types';
import { all, columnsNamed, returns, uses } from '../../engine/sqlChecks';

/** An online shop: customers and their orders. Emma and Noah never ordered anything. */
const shop = `CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  ordered_on TEXT NOT NULL,
  total REAL NOT NULL
);
INSERT INTO customers (id, name, city) VALUES
  (1, 'Giulia', 'Milan'),
  (2, 'Marco', 'Rome'),
  (3, 'Sofia', 'Turin'),
  (4, 'Luca', 'Milan'),
  (5, 'Emma', 'Naples'),
  (6, 'Noah', 'Rome');
INSERT INTO orders (id, customer_id, ordered_on, total) VALUES
  (101, 1, '2026-01-05', 45.00),
  (102, 2, '2026-01-07', 12.50),
  (103, 1, '2026-01-12', 80.00),
  (104, 3, '2026-01-15', 23.90),
  (105, 4, '2026-01-20', 150.00),
  (106, 2, '2026-02-02', 64.00),
  (107, 1, '2026-02-10', 19.99),
  (108, 3, '2026-02-14', 95.00);
`;

/** A small library: who borrowed which book. A loan with no return date is still out. */
const library = `CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL
);
CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  member_id INTEGER REFERENCES members(id),
  borrowed TEXT NOT NULL,
  returned TEXT
);
INSERT INTO members (id, name) VALUES
  (1, 'Alice'),
  (2, 'Bruno'),
  (3, 'Chiara'),
  (4, 'Dario');
INSERT INTO books (id, title, author) VALUES
  (1, '1984', 'George Orwell'),
  (2, 'The Hobbit', 'J. R. R. Tolkien'),
  (3, 'Dune', 'Frank Herbert'),
  (4, 'Beloved', 'Toni Morrison'),
  (5, 'The Name of the Rose', 'Umberto Eco'),
  (6, 'Frankenstein', 'Mary Shelley');
INSERT INTO loans (id, book_id, member_id, borrowed, returned) VALUES
  (1, 1, 1, '2026-09-01', '2026-09-10'),
  (2, 3, 2, '2026-10-03', NULL),
  (3, 2, 1, '2026-09-12', '2026-09-20'),
  (4, 5, 3, '2026-09-15', NULL),
  (5, 1, 3, '2026-09-21', '2026-09-30'),
  (6, 3, 1, '2026-08-01', '2026-08-15'),
  (7, 4, 2, '2026-10-01', NULL),
  (8, 1, 2, '2026-10-02', NULL);
`;

export const joins: Module = {
  id: 'sql-joins',
  title: 'Joining Tables',
  description: 'Real data lives in several tables linked by keys. JOIN puts them back together.',
  lessons: [
    {
      id: 'sql-join-keys',
      title: 'Keys: how tables are linked',
      explanation: `This shop has two tables: \`customers\` and \`orders\`. Why not one big table? Because then every order
would repeat the customer's name and city — and when a customer moves, you'd have to fix many rows.

So each table stores one kind of thing, and they point at each other with **keys**:

- A **primary key** identifies each row: \`customers.id\` is unique, no two customers share it.
- A **foreign key** points at a row of another table: \`orders.customer_id\` holds the \`id\` of the customer who
  placed the order.

\`\`\`sql
-- Who is customer 3?
SELECT * FROM customers WHERE id = 3;

-- And what did they order?
SELECT * FROM orders WHERE customer_id = 3;
\`\`\`

Open the **Tables** tab to see both tables. Answering "what did Giulia order?" takes two steps for now: find her
\`id\`, then her orders. In the next lesson one query will do both.`,
      starterCode: '',
      starterSql: `-- Query 1: the customers who live in Milan
`,
      db: shop,
      tasks: [
        {
          text: 'Query 1: the id and name of the customers who live in Milan',
          check: returns("SELECT id, name FROM customers WHERE city = 'Milan'", { nth: 1 }),
        },
        {
          text: 'Query 2: the id and total of every order placed by Giulia (look up her id first)',
          check: returns('SELECT id, total FROM orders WHERE customer_id = 1', { nth: 2 }),
        },
        {
          text: 'Query 3: how many orders customer 2 placed',
          check: returns('SELECT COUNT(*) FROM orders WHERE customer_id = 2', { nth: 3 }),
        },
      ],
      hints: [
        "SELECT id, name FROM customers WHERE city = 'Milan';",
        "Giulia's id is in the customers table. Then: SELECT id, total FROM orders WHERE customer_id = …;",
        'Count the rows that point at customer 2: SELECT COUNT(*) FROM orders WHERE customer_id = 2;',
      ],
      solution: '',
      solutionSql: `-- Query 1: the customers who live in Milan
SELECT id, name FROM customers WHERE city = 'Milan';

-- Query 2: Giulia's orders (she is customer 1)
SELECT id, total FROM orders WHERE customer_id = 1;

-- Query 3: orders of customer 2
SELECT COUNT(*) FROM orders WHERE customer_id = 2;
`,
    },
    {
      id: 'sql-join-inner',
      title: 'Putting tables together: JOIN',
      explanation: `\`JOIN\` glues each row of one table to the matching row of another. \`ON\` says how they match:

\`\`\`sql
SELECT orders.id, customers.name, orders.total
FROM orders
JOIN customers ON orders.customer_id = customers.id;
\`\`\`

For every order, the database finds the customer whose \`id\` equals the order's \`customer_id\`, and builds one row
with columns from both. Now you can filter, sort and group on any of them.

- Write \`table.column\` when both tables have a column with that name (both have \`id\`), or SQLite complains:
  *ambiguous column name*.
- Short **aliases** save typing: \`FROM orders AS o JOIN customers AS c ON o.customer_id = c.id\` (the \`AS\` is
  optional), then write \`o.total\`, \`c.name\`.
- \`JOIN\` is short for \`INNER JOIN\`: rows without a match on the other side are left out.`,
      starterCode: '',
      starterSql: `-- Query 1: every order with the customer's name
SELECT orders.id, orders.total FROM orders;
`,
      db: shop,
      tasks: [
        {
          text: "Query 1: every order's id, the customer's name and the order total",
          check: all(
            returns('SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON o.customer_id = c.id', { nth: 1 }),
            uses(/\bJOIN\b/i, 'Use JOIN … ON to bring in the customers table.'),
          ),
        },
        {
          text: 'Query 2: the name, date and total of the orders placed by customers who live in Rome',
          check: returns(
            "SELECT c.name, o.ordered_on, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.city = 'Rome'",
            { nth: 2 },
          ),
        },
        {
          text: 'Query 3: the name and total of the 3 biggest orders, biggest first',
          check: returns('SELECT c.name, o.total FROM orders o JOIN customers c ON o.customer_id = c.id ORDER BY o.total DESC LIMIT 3', {
            nth: 3,
            ordered: true,
          }),
        },
      ],
      hints: [
        'Add the second table after FROM orders: JOIN customers ON orders.customer_id = customers.id',
        "After the JOIN, filter as usual: WHERE customers.city = 'Rome'",
        'ORDER BY orders.total DESC LIMIT 3 comes after the JOIN.',
      ],
      solution: '',
      solutionSql: `-- Query 1: every order with the customer's name
SELECT orders.id, customers.name, orders.total
FROM orders
JOIN customers ON orders.customer_id = customers.id;

-- Query 2: orders from Rome
SELECT c.name, o.ordered_on, o.total
FROM orders AS o
JOIN customers AS c ON o.customer_id = c.id
WHERE c.city = 'Rome';

-- Query 3: the 3 biggest orders
SELECT c.name, o.total
FROM orders AS o
JOIN customers AS c ON o.customer_id = c.id
ORDER BY o.total DESC
LIMIT 3;
`,
    },
    {
      id: 'sql-join-left',
      title: 'Keeping rows without a match: LEFT JOIN',
      explanation: `Emma and Noah never ordered anything, so a \`JOIN\` between customers and orders leaves them out.
A \`LEFT JOIN\` keeps **every row of the left table** (the one after \`FROM\`), and fills the other table's columns
with \`NULL\` when there's no match:

\`\`\`sql
SELECT customers.name, orders.id
FROM customers
LEFT JOIN orders ON orders.customer_id = customers.id;
\`\`\`

That \`NULL\` is useful: it marks the rows that had no match. To find customers who never ordered, keep only those:

\`\`\`sql
-- ... LEFT JOIN as above, then:
WHERE orders.id IS NULL
\`\`\`

Which table comes first matters: \`FROM customers LEFT JOIN orders\` keeps all customers;
\`FROM orders LEFT JOIN customers\` keeps all orders.`,
      starterCode: '',
      starterSql: `-- Query 1: every customer with their order totals, even with no orders
SELECT customers.name, orders.total
FROM customers
JOIN orders ON orders.customer_id = customers.id;
`,
      db: shop,
      tasks: [
        {
          text: 'Query 1: the name of every customer and the total of each of their orders — customers with no orders included',
          check: all(
            returns('SELECT c.name, o.total FROM customers c LEFT JOIN orders o ON o.customer_id = c.id', { nth: 1 }),
            uses(/\bLEFT\s+(OUTER\s+)?JOIN\b/i, 'Use LEFT JOIN to keep every customer.'),
          ),
        },
        {
          text: 'Query 2: the names of the customers who never placed an order',
          check: returns('SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL', { nth: 2 }),
        },
      ],
      hints: [
        'Change JOIN into LEFT JOIN: customers is on the left, so all of them stay.',
        'Same LEFT JOIN, then WHERE orders.id IS NULL keeps the customers with no match.',
      ],
      solution: '',
      solutionSql: `-- Query 1: every customer with their order totals, even with no orders
SELECT customers.name, orders.total
FROM customers
LEFT JOIN orders ON orders.customer_id = customers.id;

-- Query 2: customers who never ordered
SELECT customers.name
FROM customers
LEFT JOIN orders ON orders.customer_id = customers.id
WHERE orders.id IS NULL;
`,
    },
    {
      id: 'sql-join-group',
      title: 'Joins meet GROUP BY',
      explanation: `Joins and grouping together answer real business questions, like "how much did each customer spend?":

\`\`\`sql
SELECT c.name, SUM(o.total) AS spent
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.name;
\`\`\`

The join builds one row per order (with the customer's columns attached), then \`GROUP BY\` piles them up by name.

A classic trap: counting with a \`LEFT JOIN\`. A customer with no orders still gets **one** row (full of \`NULL\`), so
\`COUNT(*)\` says 1. \`COUNT(column)\` counts only the values that aren't \`NULL\`:

\`\`\`sql
SELECT c.name, COUNT(o.id) AS orders_count   -- 0 for Emma and Noah
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.name;
\`\`\``,
      starterCode: '',
      starterSql: `-- Query 1: how many orders each customer placed
`,
      db: shop,
      tasks: [
        {
          text: 'Query 1: the name of each customer who ordered, and how many orders they placed',
          check: returns('SELECT c.name, COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.name', { nth: 1 }),
        },
        {
          text: 'Query 2: each city with the total its customers spent, rounded to 2 decimals, named city and spent, biggest first',
          check: all(
            returns(
              'SELECT c.city, ROUND(SUM(o.total), 2) AS spent FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.city ORDER BY spent DESC',
              { nth: 2, ordered: true },
            ),
            columnsNamed(['city', 'spent'], 2),
          ),
        },
        {
          text: 'Query 3: every customer with their number of orders, 0 for those who never ordered',
          check: returns(
            'SELECT c.name, COUNT(o.id) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.name',
            { nth: 3 },
          ),
        },
      ],
      hints: [
        'JOIN the two tables, then GROUP BY customers.name and COUNT(*).',
        'Group by city instead: GROUP BY c.city, then ORDER BY spent DESC.',
        'LEFT JOIN keeps everyone; COUNT(orders.id) gives 0 where there is no order.',
      ],
      solution: '',
      solutionSql: `-- Query 1: how many orders each customer placed
SELECT c.name, COUNT(*) AS orders_count
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.name;

-- Query 2: spending per city
SELECT c.city, ROUND(SUM(o.total), 2) AS spent
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.city
ORDER BY spent DESC;

-- Query 3: everyone, with 0 for no orders
SELECT c.name, COUNT(o.id) AS orders_count
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.name;
`,
    },
  ],
  challenge: {
    id: 'sql-join-challenge',
    title: 'The library detective',
    difficulty: 3,
    summary: 'Three tables, four mysteries: who has which book?',
    explanation: `The town library keeps three tables: \`members\`, \`books\` and \`loans\`. Every loan links one book to one
member; a loan whose \`returned\` date is \`NULL\` means the book is **still out**. Explore them in the **Tables** tab,
then solve the four mysteries — one query each, in this order.

1. **Missing books**: every book that is still out: the book's title, the member's name and the \`borrowed\` date,
   oldest loan first.
2. **Popular shelf**: every book with the number of times it was borrowed — books never borrowed included, with 0.
   Columns \`title\` and \`times\`, most borrowed first, then alphabetically by title.
3. **Sleeping cards**: the names of the members who never borrowed anything.
4. **Hoarders**: the members who have **more than one** book out right now, with how many. Columns \`name\` and \`out\`.`,
    starterCode: '',
    starterSql: `-- 1. Missing books

-- 2. Popular shelf

-- 3. Sleeping cards

-- 4. Hoarders
`,
    db: library,
    tasks: [
      {
        text: 'Query 1: title, member name and borrowed date of the books still out, oldest first',
        check: returns(
          'SELECT b.title, m.name, l.borrowed FROM loans l JOIN books b ON b.id = l.book_id JOIN members m ON m.id = l.member_id WHERE l.returned IS NULL ORDER BY l.borrowed',
          { nth: 1, ordered: true },
        ),
      },
      {
        text: 'Query 2: every book with times borrowed (0 included), most first, then by title',
        check: all(
          returns(
            'SELECT b.title, COUNT(l.id) AS times FROM books b LEFT JOIN loans l ON l.book_id = b.id GROUP BY b.id ORDER BY times DESC, b.title',
            { nth: 2, ordered: true },
          ),
          columnsNamed(['title', 'times'], 2),
        ),
      },
      {
        text: 'Query 3: the members who never borrowed a book',
        check: returns('SELECT m.name FROM members m LEFT JOIN loans l ON l.member_id = m.id WHERE l.id IS NULL', { nth: 3 }),
      },
      {
        text: 'Query 4: members with more than one book out, with how many (name, out)',
        check: all(
          returns(
            'SELECT m.name, COUNT(*) AS out FROM loans l JOIN members m ON m.id = l.member_id WHERE l.returned IS NULL GROUP BY m.id HAVING COUNT(*) > 1',
            { nth: 4 },
          ),
          columnsNamed(['name', 'out'], 4),
        ),
      },
    ],
    hints: [
      'Two JOINs in a row: FROM loans JOIN books ON … JOIN members ON …',
      'To keep the books never borrowed, start FROM books and LEFT JOIN loans; count with COUNT(loans.id).',
      'Sort on two columns: ORDER BY times DESC, title.',
      'Hoarders: WHERE picks the loans still out, GROUP BY the member, HAVING COUNT(*) > 1 keeps the groups.',
    ],
    solution: '',
    solutionSql: `-- 1. Missing books
SELECT b.title, m.name, l.borrowed
FROM loans AS l
JOIN books AS b ON b.id = l.book_id
JOIN members AS m ON m.id = l.member_id
WHERE l.returned IS NULL
ORDER BY l.borrowed;

-- 2. Popular shelf
SELECT b.title, COUNT(l.id) AS times
FROM books AS b
LEFT JOIN loans AS l ON l.book_id = b.id
GROUP BY b.id
ORDER BY times DESC, b.title;

-- 3. Sleeping cards
SELECT m.name
FROM members AS m
LEFT JOIN loans AS l ON l.member_id = m.id
WHERE l.id IS NULL;

-- 4. Hoarders
SELECT m.name, COUNT(*) AS out
FROM loans AS l
JOIN members AS m ON m.id = l.member_id
WHERE l.returned IS NULL
GROUP BY m.id
HAVING COUNT(*) > 1;
`,
  },
};
