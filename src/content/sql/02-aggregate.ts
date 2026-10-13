import type { Module } from '../types';
import { all, columnsNamed, returns, uses } from '../../engine/sqlChecks';

/** Three days of a small café's sales. Totals per product and per day are all different, so "best first" has one right order. */
const sales = `CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  day TEXT NOT NULL,
  product TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL
);
INSERT INTO sales (id, day, product, category, quantity, price) VALUES
  (1, '2026-03-02', 'Espresso', 'Coffee', 14, 1.20),
  (2, '2026-03-02', 'Cappuccino', 'Coffee', 9, 1.60),
  (3, '2026-03-02', 'Croissant', 'Bakery', 11, 1.50),
  (4, '2026-03-02', 'Green tea', 'Tea', 3, 2.00),
  (5, '2026-03-02', 'Muffin', 'Bakery', 4, 2.20),
  (6, '2026-03-03', 'Espresso', 'Coffee', 12, 1.20),
  (7, '2026-03-03', 'Latte', 'Coffee', 6, 1.80),
  (8, '2026-03-03', 'Cappuccino', 'Coffee', 10, 1.60),
  (9, '2026-03-03', 'Chai', 'Tea', 5, 2.50),
  (10, '2026-03-03', 'Croissant', 'Bakery', 8, 1.50),
  (11, '2026-03-04', 'Espresso', 'Coffee', 16, 1.20),
  (12, '2026-03-04', 'Cappuccino', 'Coffee', 7, 1.60),
  (13, '2026-03-04', 'Latte', 'Coffee', 4, 1.80),
  (14, '2026-03-04', 'Green tea', 'Tea', 2, 2.00),
  (15, '2026-03-04', 'Chai', 'Tea', 4, 2.50),
  (16, '2026-03-04', 'Muffin', 'Bakery', 7, 2.20),
  (17, '2026-03-04', 'Croissant', 'Bakery', 9, 1.50);
`;

export const aggregate: Module = {
  id: 'sql-aggregate',
  title: 'Summarising Data',
  description: 'Turn many rows into one answer: COUNT, SUM, AVG, calculated columns, GROUP BY and HAVING.',
  lessons: [
    {
      id: 'sql-agg-count',
      title: 'Counting and totals',
      explanation: `So far every query returned rows from the table. **Aggregate functions** squeeze many rows into
**one** value instead:

\`\`\`sql
SELECT COUNT(*) FROM sales;             -- how many rows
SELECT SUM(quantity) FROM sales;        -- add up a column
SELECT AVG(price) FROM sales;           -- the average
SELECT MIN(day), MAX(day) FROM sales;   -- smallest and largest
\`\`\`

They work together with \`WHERE\`: the rows are filtered first, then summarised.

\`\`\`sql
-- How many espressos were sold, over all three days?
SELECT SUM(quantity) FROM sales WHERE product = 'Espresso';
\`\`\`

This table holds three days of sales of a small café: one row per product per day. Peek at the **Tables** tab.`,
      starterCode: '',
      starterSql: `-- Query 1: how many rows does the sales table have?
`,
      db: sales,
      tasks: [
        { text: 'Query 1: count the rows of the sales table', check: returns('SELECT COUNT(*) FROM sales', { nth: 1 }) },
        { text: 'Query 2: the total quantity of items sold', check: returns('SELECT SUM(quantity) FROM sales', { nth: 2 }) },
        {
          text: 'Query 3: the lowest and the highest price, in one query (lowest first)',
          check: returns('SELECT MIN(price), MAX(price) FROM sales', { nth: 3 }),
        },
        {
          text: "Query 4: how many croissants were sold in total (product is 'Croissant')",
          check: returns("SELECT SUM(quantity) FROM sales WHERE product = 'Croissant'", { nth: 4 }),
        },
      ],
      hints: [
        'COUNT(*) counts rows: SELECT COUNT(*) FROM sales;',
        'Two functions in one SELECT, separated by a comma: SELECT MIN(price), MAX(price) FROM sales;',
        "Filter first, then add up: SELECT SUM(quantity) FROM sales WHERE product = 'Croissant';",
      ],
      solution: '',
      solutionSql: `SELECT COUNT(*) FROM sales;

SELECT SUM(quantity) FROM sales;

SELECT MIN(price), MAX(price) FROM sales;

SELECT SUM(quantity) FROM sales WHERE product = 'Croissant';
`,
    },
    {
      id: 'sql-agg-alias',
      title: 'Calculated columns: AS and ROUND',
      explanation: `A column in \`SELECT\` doesn't have to exist in the table: it can be a **calculation**.
\`AS\` gives it a readable name.

\`\`\`sql
SELECT product, quantity * price AS revenue FROM sales;
\`\`\`

Money often ends up with long decimals (\`16.799999999999997\`): computers store most decimal numbers approximately.
\`ROUND(value, 2)\` keeps two decimals:

\`\`\`sql
SELECT ROUND(AVG(quantity), 2) AS average_quantity FROM sales;
\`\`\`

- Maths works as usual: \`+ - * /\` and parentheses. Careful: dividing two whole numbers gives a whole number in
  SQLite (\`7 / 2\` is \`3\`); write \`7 / 2.0\` to keep the decimals.
- Name columns in *snake_case* (\`total_revenue\`): no spaces, so they are easy to use later.`,
      starterCode: '',
      starterSql: `-- Query 1: product, quantity and revenue of every sale
SELECT product, quantity FROM sales;
`,
      db: sales,
      tasks: [
        {
          text: 'Query 1: for every sale, the product, the quantity and quantity * price named revenue',
          check: all(
            returns('SELECT product, quantity, quantity * price FROM sales', { nth: 1 }),
            columnsNamed(['product', 'quantity', 'revenue'], 1),
          ),
        },
        {
          text: 'Query 2: the total revenue of all sales, rounded to 2 decimals and named total',
          check: all(returns('SELECT ROUND(SUM(quantity * price), 2) FROM sales', { nth: 2 }), columnsNamed(['total'], 2)),
        },
        {
          text: 'Query 3: the average price, rounded to 2 decimals and named avg_price',
          check: all(returns('SELECT ROUND(AVG(price), 2) FROM sales', { nth: 3 }), columnsNamed(['avg_price'], 3)),
        },
      ],
      hints: [
        'Add the calculation as a third column: SELECT product, quantity, quantity * price AS revenue FROM sales;',
        'ROUND goes around the whole total: ROUND(SUM(quantity * price), 2) AS total',
        'Same shape for the average: ROUND(AVG(price), 2) AS avg_price',
      ],
      solution: '',
      solutionSql: `SELECT product, quantity, quantity * price AS revenue FROM sales;

SELECT ROUND(SUM(quantity * price), 2) AS total FROM sales;

SELECT ROUND(AVG(price), 2) AS avg_price FROM sales;
`,
    },
    {
      id: 'sql-agg-group',
      title: 'One total per group: GROUP BY',
      explanation: `\`SUM(quantity)\` gives one total for the whole table. \`GROUP BY\` gives **one total per group** of rows
that share a value:

\`\`\`sql
SELECT product, SUM(quantity) AS sold
FROM sales
GROUP BY product;
\`\`\`

The database puts the rows of each product in a pile, then runs \`SUM\` on every pile: one result row per product.

- Every column in \`SELECT\` should either be in \`GROUP BY\` or be inside an aggregate function. (SQLite lets you break
  this rule, but then it picks a value from the group at random-ish — avoid it.)
- You can sort by an aggregate, using its name: \`ORDER BY sold DESC\`.
- The order of the parts: \`SELECT … FROM … WHERE … GROUP BY … ORDER BY … LIMIT …\`.`,
      starterCode: '',
      starterSql: `-- Query 1: items sold per category
SELECT category, SUM(quantity) FROM sales;
`,
      db: sales,
      tasks: [
        {
          text: 'Query 1: every category with the total quantity sold in it',
          check: all(returns('SELECT category, SUM(quantity) FROM sales GROUP BY category', { nth: 1 }), uses(/\bGROUP\s+BY\b/i, 'Use GROUP BY.')),
        },
        {
          text: 'Query 2: every day with its revenue (quantity * price), rounded to 2 decimals, named day and revenue, in date order',
          check: all(
            returns('SELECT day, ROUND(SUM(quantity * price), 2) FROM sales GROUP BY day ORDER BY day', { nth: 2, ordered: true }),
            columnsNamed(['day', 'revenue'], 2),
          ),
        },
        {
          text: 'Query 3: every product with its total quantity, best seller first',
          check: returns('SELECT product, SUM(quantity) AS sold FROM sales GROUP BY product ORDER BY sold DESC', { nth: 3, ordered: true }),
        },
      ],
      hints: [
        'Without GROUP BY you get one row for the whole table. Add GROUP BY category at the end.',
        'Revenue per day: SELECT day, ROUND(SUM(quantity * price), 2) AS revenue FROM sales GROUP BY day ORDER BY day;',
        'Give the total a name and sort by it: SUM(quantity) AS sold … ORDER BY sold DESC',
      ],
      solution: '',
      solutionSql: `-- Query 1: items sold per category
SELECT category, SUM(quantity) FROM sales GROUP BY category;

-- Query 2: revenue per day
SELECT day, ROUND(SUM(quantity * price), 2) AS revenue
FROM sales
GROUP BY day
ORDER BY day;

-- Query 3: best sellers
SELECT product, SUM(quantity) AS sold
FROM sales
GROUP BY product
ORDER BY sold DESC;
`,
    },
    {
      id: 'sql-agg-having',
      title: 'Filtering groups: HAVING and DISTINCT',
      explanation: `\`WHERE\` filters **rows**, before grouping. To filter **groups** by their total, use \`HAVING\`, after
\`GROUP BY\`:

\`\`\`sql
-- Products that sold more than 30 items in total
SELECT product, SUM(quantity) AS sold
FROM sales
GROUP BY product
HAVING SUM(quantity) > 30;
\`\`\`

Both can appear in the same query: \`WHERE\` picks the rows, \`GROUP BY\` makes the piles, \`HAVING\` keeps some piles.

\`DISTINCT\` removes duplicate rows from the result — handy to list the different values of a column:

\`\`\`sql
SELECT DISTINCT day FROM sales;
SELECT COUNT(DISTINCT day) FROM sales;   -- how many different days
\`\`\``,
      starterCode: '',
      starterSql: `-- Query 1: each category, once
SELECT category FROM sales;
`,
      db: sales,
      tasks: [
        {
          text: 'Query 1: list each category once, with DISTINCT',
          check: all(returns('SELECT DISTINCT category FROM sales', { nth: 1 }), uses(/\bDISTINCT\b/i, 'Use SELECT DISTINCT.')),
        },
        {
          text: 'Query 2: the products that sold more than 20 items in total, with that total',
          check: all(
            returns('SELECT product, SUM(quantity) FROM sales GROUP BY product HAVING SUM(quantity) > 20', { nth: 2 }),
            uses(/\bHAVING\b/i, 'Filter the groups with HAVING.'),
          ),
        },
        {
          text: "Query 3: the days when more than 25 Coffee items were sold (category 'Coffee'), with that number",
          check: returns(
            "SELECT day, SUM(quantity) FROM sales WHERE category = 'Coffee' GROUP BY day HAVING SUM(quantity) > 25",
            { nth: 3 },
          ),
        },
      ],
      hints: [
        'SELECT DISTINCT category FROM sales;',
        'HAVING comes after GROUP BY: GROUP BY product HAVING SUM(quantity) > 20',
        "Rows first, groups after: WHERE category = 'Coffee' GROUP BY day HAVING SUM(quantity) > 25",
      ],
      solution: '',
      solutionSql: `-- Query 1: each category, once
SELECT DISTINCT category FROM sales;

-- Query 2: best sellers
SELECT product, SUM(quantity) FROM sales
GROUP BY product
HAVING SUM(quantity) > 20;

-- Query 3: busy coffee days
SELECT day, SUM(quantity) FROM sales
WHERE category = 'Coffee'
GROUP BY day
HAVING SUM(quantity) > 25;
`,
    },
  ],
  challenge: {
    id: 'sql-agg-challenge',
    title: 'The café’s weekly report',
    difficulty: 2,
    summary: 'The owner wants numbers: four questions, four queries.',
    explanation: `The café owner is preparing the weekly report and needs four numbers. Write one query per question,
in this order. Money is \`quantity * price\`, always rounded to **2 decimals**.

1. **Revenue per category**: columns \`category\` and \`revenue\`, highest revenue first.
2. **The best day**: the single day with the highest revenue. Columns \`day\` and \`revenue\`.
3. **Steady sellers**: the products that sell on average **at least 8 items per sale** (one row of the table is one
   sale). Columns \`product\` and \`avg_quantity\` (the average, rounded to 1 decimal).
4. **Menu size**: how many *different* products were sold. One column named \`products\`.`,
    starterCode: '',
    starterSql: `-- 1. Revenue per category

-- 2. The best day

-- 3. Steady sellers

-- 4. Menu size
`,
    db: sales,
    tasks: [
      {
        text: 'Query 1: category and revenue, highest first',
        check: all(
          returns('SELECT category, ROUND(SUM(quantity * price), 2) AS revenue FROM sales GROUP BY category ORDER BY revenue DESC', {
            nth: 1,
            ordered: true,
          }),
          columnsNamed(['category', 'revenue'], 1),
        ),
      },
      {
        text: 'Query 2: the day with the highest revenue, and that revenue',
        check: all(
          returns('SELECT day, ROUND(SUM(quantity * price), 2) AS revenue FROM sales GROUP BY day ORDER BY revenue DESC LIMIT 1', { nth: 2 }),
          columnsNamed(['day', 'revenue'], 2),
        ),
      },
      {
        text: 'Query 3: products selling at least 8 items per sale on average, with avg_quantity',
        check: all(
          returns('SELECT product, ROUND(AVG(quantity), 1) FROM sales GROUP BY product HAVING AVG(quantity) >= 8', { nth: 3 }),
          columnsNamed(['product', 'avg_quantity'], 3),
        ),
      },
      {
        text: 'Query 4: the number of different products, named products',
        check: all(returns('SELECT COUNT(DISTINCT product) FROM sales', { nth: 4 }), columnsNamed(['products'], 4)),
      },
    ],
    hints: [
      'The best day is query 1 grouped by day instead of category, plus LIMIT 1.',
      'Filter the groups on the exact average, HAVING AVG(quantity) >= 8, and round only what you show.',
      'COUNT(DISTINCT product) counts each product once.',
    ],
    solution: '',
    solutionSql: `-- 1. Revenue per category
SELECT category, ROUND(SUM(quantity * price), 2) AS revenue
FROM sales
GROUP BY category
ORDER BY revenue DESC;

-- 2. The best day
SELECT day, ROUND(SUM(quantity * price), 2) AS revenue
FROM sales
GROUP BY day
ORDER BY revenue DESC
LIMIT 1;

-- 3. Steady sellers
SELECT product, ROUND(AVG(quantity), 1) AS avg_quantity
FROM sales
GROUP BY product
HAVING AVG(quantity) >= 8;

-- 4. Menu size
SELECT COUNT(DISTINCT product) AS products FROM sales;
`,
  },
};
