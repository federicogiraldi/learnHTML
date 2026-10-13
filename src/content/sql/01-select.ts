import type { Module } from '../types';
import { all, returns, uses } from '../../engine/sqlChecks';

/** A small film catalogue. Ratings are all different, so "best first" has one right order. */
const movies = `CREATE TABLE movies (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  genre TEXT,
  rating REAL,
  minutes INTEGER
);
INSERT INTO movies (id, title, year, genre, rating, minutes) VALUES
  (1, 'The Matrix', 1999, 'Sci-Fi', 8.7, 136),
  (2, 'Spirited Away', 2001, 'Animation', 8.6, 125),
  (3, 'The Dark Knight', 2008, 'Action', 9.0, 152),
  (4, 'Up', 2009, 'Animation', 8.3, 96),
  (5, 'Inception', 2010, 'Sci-Fi', 8.8, 148),
  (6, 'The Grand Budapest Hotel', 2014, 'Comedy', 8.1, 99),
  (7, 'Mad Max: Fury Road', 2015, 'Action', 8.2, 120),
  (8, 'Inside Out', 2015, 'Animation', 7.7, 95),
  (9, 'La La Land', 2016, 'Musical', 8.0, 128),
  (10, 'Get Out', 2017, 'Horror', 7.5, 104),
  (11, 'A Quiet Place', 2018, 'Horror', 7.4, 90),
  (12, 'Parasite', 2019, 'Thriller', 8.5, 132),
  (13, 'Knives Out', 2019, 'Comedy', 7.6, 130),
  (14, 'Dune', 2021, 'Sci-Fi', 7.9, 155),
  (15, 'Everything Everywhere All at Once', 2022, 'Comedy', 7.8, 139),
  (16, 'Oppenheimer', 2023, 'Drama', 8.4, 180),
  (17, 'Untitled Space Saga', 2027, 'Sci-Fi', NULL, NULL);
`;

export const select: Module = {
  id: 'sql-select',
  title: 'Your First Queries',
  description: 'Ask a table for exactly the rows and columns you need: SELECT, WHERE, ORDER BY and LIMIT.',
  lessons: [
    {
      id: 'sql-select-first',
      title: 'Hello, database: SELECT',
      explanation: `A **database** keeps data in **tables**. A table looks like a spreadsheet: every **row** is one thing
(here, one movie) and every **column** is one piece of information about it (title, year, genre…).

**SQL** is the language you use to ask a database questions. The most important word is \`SELECT\`:

\`\`\`sql
-- Every column (*) of every row of the movies table
SELECT * FROM movies;

-- Only some columns, in the order you list them
SELECT title, year FROM movies;
\`\`\`

- \`SELECT\` says *which columns* you want, \`FROM\` says *which table*.
- Keywords work in any case (\`select\` = \`SELECT\`), but writing them in capitals keeps queries readable.
- A semicolon \`;\` ends each query, so you can write several in one file. Lines starting with \`--\` are comments.

Your SQL runs on a real database (SQLite) right in your browser. The results appear on the right; the **Tables** tab
shows everything the database holds. Experiment freely: **every run starts again from the original data**.`,
      starterCode: '',
      starterSql: `-- Run me, then look at the results on the right.
SELECT * FROM movies;
`,
      db: movies,
      tasks: [
        {
          text: 'Query 1: show the title and year of every movie (in that order)',
          check: returns('SELECT title, year FROM movies', { nth: 1 }),
        },
        {
          text: 'Query 2: show the title, genre and rating of every movie',
          check: returns('SELECT title, genre, rating FROM movies', { nth: 2 }),
        },
      ],
      hints: [
        'Replace the * with the column names, separated by commas: SELECT title, year FROM movies;',
        'End the first query with ; and write the second one below it: SELECT title, genre, rating FROM movies;',
      ],
      solution: '',
      solutionSql: `SELECT title, year FROM movies;

SELECT title, genre, rating FROM movies;
`,
    },
    {
      id: 'sql-select-where',
      title: 'Filtering rows: WHERE',
      explanation: `\`WHERE\` keeps only the rows that match a condition:

\`\`\`sql
SELECT title, year FROM movies WHERE year < 2005;

SELECT * FROM movies WHERE genre = 'Comedy';

SELECT title FROM movies WHERE genre = 'Sci-Fi' AND rating > 8.5;
\`\`\`

| Operator | Meaning |
|---|---|
| \`=\` | equal (just one \`=\`, unlike JavaScript) |
| \`<>\` or \`!=\` | not equal |
| \`<\` \`>\` \`<=\` \`>=\` | less / greater (or equal) |

- Text goes in **single quotes**: \`'Comedy'\`. Numbers don't: \`2005\`.
- Combine conditions with \`AND\` (both must be true) and \`OR\` (at least one). Use parentheses when you mix them:
  \`WHERE (genre = 'Horror' OR genre = 'Thriller') AND year > 2015\`.
- \`WHERE\` comes after \`FROM\`.`,
      starterCode: '',
      starterSql: `-- Query 1: movies from 2015 onwards
SELECT title, year FROM movies;
`,
      db: movies,
      tasks: [
        {
          text: 'Query 1: the title and year of the movies from 2015 onwards (2015 included)',
          check: returns('SELECT title, year FROM movies WHERE year >= 2015', { nth: 1 }),
        },
        {
          text: "Query 2: every column of the Sci-Fi movies (genre is 'Sci-Fi')",
          check: returns("SELECT * FROM movies WHERE genre = 'Sci-Fi'", { nth: 2 }),
        },
        {
          text: 'Query 3: the titles of the Animation movies shorter than 100 minutes',
          check: returns("SELECT title FROM movies WHERE genre = 'Animation' AND minutes < 100", { nth: 3 }),
        },
      ],
      hints: [
        'Add a condition after FROM movies: WHERE year >= 2015',
        "Text needs single quotes: WHERE genre = 'Sci-Fi'",
        "Two conditions joined with AND: WHERE genre = 'Animation' AND minutes < 100",
      ],
      solution: '',
      solutionSql: `-- Query 1: movies from 2015 onwards
SELECT title, year FROM movies WHERE year >= 2015;

-- Query 2: Sci-Fi movies
SELECT * FROM movies WHERE genre = 'Sci-Fi';

-- Query 3: short Animation movies
SELECT title FROM movies WHERE genre = 'Animation' AND minutes < 100;
`,
    },
    {
      id: 'sql-select-order',
      title: 'Sorting and top lists: ORDER BY and LIMIT',
      explanation: `Without \`ORDER BY\`, a database returns rows in whatever order is convenient for it. To choose:

\`\`\`sql
-- Oldest first (ASC, ascending, is the default)
SELECT title, year FROM movies ORDER BY year;

-- Best rated first
SELECT title, rating FROM movies ORDER BY rating DESC;

-- By genre, then by title inside each genre
SELECT genre, title FROM movies ORDER BY genre, title;
\`\`\`

\`LIMIT\` keeps only the first rows — perfect for "top 3" lists:

\`\`\`sql
SELECT title, minutes FROM movies ORDER BY minutes LIMIT 3;
\`\`\`

The order of the parts is fixed: \`SELECT … FROM … WHERE … ORDER BY … LIMIT …\`.
Text is sorted alphabetically, and empty values (\`NULL\`) come first in ascending order and last with \`DESC\`.`,
      starterCode: '',
      starterSql: `-- Query 1: the 5 best rated movies
SELECT title, rating FROM movies;
`,
      db: movies,
      tasks: [
        {
          text: 'Query 1: the title and rating of the 5 best rated movies, best first',
          check: returns('SELECT title, rating FROM movies ORDER BY rating DESC LIMIT 5', { nth: 1, ordered: true }),
        },
        {
          text: 'Query 2: the title and year of the 3 most recent movies, newest first',
          check: returns('SELECT title, year FROM movies ORDER BY year DESC LIMIT 3', { nth: 2, ordered: true }),
        },
        {
          text: 'Query 3: every title, in alphabetical order',
          check: returns('SELECT title FROM movies ORDER BY title', { nth: 3, ordered: true }),
        },
      ],
      hints: [
        'Sort first, then cut: ORDER BY rating DESC LIMIT 5',
        'Newest means the biggest year first: ORDER BY year DESC LIMIT 3',
        'Alphabetical is the default (ascending): ORDER BY title',
      ],
      solution: '',
      solutionSql: `-- Query 1: the 5 best rated movies
SELECT title, rating FROM movies ORDER BY rating DESC LIMIT 5;

-- Query 2: the 3 most recent
SELECT title, year FROM movies ORDER BY year DESC LIMIT 3;

-- Query 3: alphabetical
SELECT title FROM movies ORDER BY title;
`,
    },
    {
      id: 'sql-select-filters',
      title: 'Smarter filters: IN, BETWEEN, LIKE and NULL',
      explanation: `A few shortcuts make conditions shorter and easier to read:

\`\`\`sql
-- IN: one of a list (instead of genre = … OR genre = …)
SELECT title, genre FROM movies WHERE genre IN ('Action', 'Thriller');

-- BETWEEN: a range, both ends included
SELECT title, year FROM movies WHERE year BETWEEN 2000 AND 2009;

-- LIKE: a text pattern. % means "any text", _ means "one character"
SELECT title FROM movies WHERE title LIKE '%Knight%';
\`\`\`

**\`NULL\`** means "no value": unknown, or not there yet. Look at the last movie in the **Tables** tab: it has no rating
yet. \`NULL\` is not equal to anything, not even to \`NULL\`, so \`rating = NULL\` never matches. Use:

\`\`\`sql
SELECT title FROM movies WHERE rating IS NOT NULL;
\`\`\`

In SQLite, \`LIKE\` ignores upper and lower case for English letters: \`'%knight%'\` also finds *The Dark Knight*.`,
      starterCode: '',
      starterSql: `-- Query 1: Comedy or Horror movies, with IN
`,
      db: movies,
      tasks: [
        {
          text: "Query 1: the title and genre of the Comedy and Horror movies, using IN",
          check: all(
            returns("SELECT title, genre FROM movies WHERE genre IN ('Comedy', 'Horror')", { nth: 1 }),
            uses(/\bIN\s*\(/i, "Use IN ('Comedy', 'Horror')."),
          ),
        },
        {
          text: 'Query 2: the title and year of the movies from 2010 to 2019, using BETWEEN',
          check: all(
            returns('SELECT title, year FROM movies WHERE year BETWEEN 2010 AND 2019', { nth: 2 }),
            uses(/\bBETWEEN\b/i, 'Use BETWEEN 2010 AND 2019.'),
          ),
        },
        {
          text: 'Query 3: the titles that start with "The " (with LIKE)',
          check: all(
            returns("SELECT title FROM movies WHERE title LIKE 'The %'", { nth: 3 }),
            uses(/\bLIKE\b/i, 'Use LIKE with a pattern.'),
          ),
        },
        {
          text: 'Query 4: the title of the movie that has no rating yet',
          check: returns('SELECT title FROM movies WHERE rating IS NULL', { nth: 4 }),
        },
      ],
      hints: [
        "IN takes a list in parentheses: WHERE genre IN ('Comedy', 'Horror')",
        'BETWEEN includes both ends: WHERE year BETWEEN 2010 AND 2019',
        "The pattern 'The %' means: The, a space, then anything.",
        'rating = NULL never matches anything: write rating IS NULL.',
      ],
      solution: '',
      solutionSql: `-- Query 1: Comedy or Horror movies, with IN
SELECT title, genre FROM movies WHERE genre IN ('Comedy', 'Horror');

-- Query 2: the 2010s
SELECT title, year FROM movies WHERE year BETWEEN 2010 AND 2019;

-- Query 3: titles starting with "The "
SELECT title FROM movies WHERE title LIKE 'The %';

-- Query 4: no rating yet
SELECT title FROM movies WHERE rating IS NULL;
`,
    },
  ],
  challenge: {
    id: 'sql-select-challenge',
    title: 'Movie night picker',
    difficulty: 1,
    summary: 'Four friends, four requests: answer each with one query.',
    explanation: `It's movie night and everyone has an opinion. Write **one query per request**, in this order, then
press **Check my solution**.

1. Ada is tired: movies of **2 hours or less** (120 minutes at most) with a rating of **at least 8**. Show the
   title, minutes and rating, best rated first.
2. Ben wants classics: **Sci-Fi or Action** movies released **before 2010**. Show the title and year, newest first.
3. Chloé has all night: the **3 longest** movies. Show the title and minutes, longest first.
4. Dev only wants titles with the word **"Out"** in them. Show just the title.`,
    starterCode: '',
    starterSql: `-- 1. Ada: short and good

-- 2. Ben: classic Sci-Fi or Action

-- 3. Chloé: the 3 longest

-- 4. Dev: "Out" in the title
`,
    db: movies,
    tasks: [
      {
        text: 'Query 1: title, minutes and rating of the movies of 120 minutes or less rated 8 or more, best rated first',
        check: returns('SELECT title, minutes, rating FROM movies WHERE minutes <= 120 AND rating >= 8 ORDER BY rating DESC', {
          nth: 1,
          ordered: true,
        }),
      },
      {
        text: 'Query 2: title and year of the Sci-Fi or Action movies from before 2010, newest first',
        check: returns(
          "SELECT title, year FROM movies WHERE genre IN ('Sci-Fi', 'Action') AND year < 2010 ORDER BY year DESC",
          { nth: 2, ordered: true },
        ),
      },
      {
        text: 'Query 3: title and minutes of the 3 longest movies, longest first',
        check: returns('SELECT title, minutes FROM movies ORDER BY minutes DESC LIMIT 3', { nth: 3, ordered: true }),
      },
      {
        text: 'Query 4: the titles containing "Out"',
        check: returns("SELECT title FROM movies WHERE title LIKE '%Out%'", { nth: 4 }),
      },
    ],
    hints: [
      'For Ben, mixing OR with AND needs parentheses — or use IN, which avoids the problem.',
      "Chloé's query sorts with DESC and cuts with LIMIT 3. Movies with no length (NULL) end up last with DESC.",
      "Dev's pattern has % on both sides: '%Out%'.",
    ],
    solution: '',
    solutionSql: `-- 1. Ada: short and good
SELECT title, minutes, rating FROM movies
WHERE minutes <= 120 AND rating >= 8
ORDER BY rating DESC;

-- 2. Ben: classic Sci-Fi or Action
SELECT title, year FROM movies
WHERE genre IN ('Sci-Fi', 'Action') AND year < 2010
ORDER BY year DESC;

-- 3. Chloé: the 3 longest
SELECT title, minutes FROM movies ORDER BY minutes DESC LIMIT 3;

-- 4. Dev: "Out" in the title
SELECT title FROM movies WHERE title LIKE '%Out%';
`,
  },
};
