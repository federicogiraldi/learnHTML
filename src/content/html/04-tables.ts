import type { Module } from '../types';
import { all, allHaveAttr, count, hasAttr, hasElement, isChildOf, rawMatches, textMatches } from '../../engine/checks';

export const tables: Module = {
  id: 'tables',
  title: 'Tables',
  description: 'Rows, columns, headers, merged cells and accessible data tables.',
  lessons: [
    {
      id: 'tables-basics',
      title: 'Your first table',
      explanation: `Tables show **tabular data** — information with rows and columns, like a timetable or a price list.
(Never use tables for page layout: that is what CSS is for.)

- \`<table>\` wraps the table.
- \`<tr>\` is a **t**able **r**ow.
- \`<th>\` is a **h**eader cell, \`<td>\` is a **d**ata cell.

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

Every row should have the same number of cells.`,
      starterCode: `<h1>Weekly planner</h1>
<!-- Day | Activity -->
<!-- Monday | Gym -->
<!-- Tuesday | Piano -->
<!-- Wednesday | Rest -->
`,
      tasks: [
        { text: 'Create a <table>', check: hasElement('table') },
        { text: 'Add a header row with two <th>: Day and Activity', check: all(count('tr:first-child > th', 2, 'The first row needs two <th> cells.'), textMatches('th', /day/i), textMatches('th', /activity/i)) },
        { text: 'Add three data rows with two <td> each', check: count('tr > td', 6) },
        { text: 'Every row has the same number of cells', check: (doc) => {
          const sizes = new Set([...doc.querySelectorAll('tr')].map((tr) => tr.children.length));
          return sizes.size === 1 ? true : 'Some rows have a different number of cells.';
        } },
      ],
      hints: ['Each row is a <tr>; each cell inside it is a <th> or <td>.'],
      solution: `<h1>Weekly planner</h1>
<table>
  <tr>
    <th>Day</th>
    <th>Activity</th>
  </tr>
  <tr>
    <td>Monday</td>
    <td>Gym</td>
  </tr>
  <tr>
    <td>Tuesday</td>
    <td>Piano</td>
  </tr>
  <tr>
    <td>Wednesday</td>
    <td>Rest</td>
  </tr>
</table>
`,
    },
    {
      id: 'tables-sections',
      title: 'Table sections and captions',
      explanation: `Bigger tables are split into sections:

- \`<caption>\` — the table's title. It must be the **first** thing inside \`<table>\`.
- \`<thead>\` — the header rows.
- \`<tbody>\` — the body rows (the data).
- \`<tfoot>\` — summary rows, such as totals.

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

Sections help screen readers, let browsers repeat headers when printing long tables, and make styling easier.`,
      starterCode: `<table>
  <tr>
    <th>Product</th>
    <th>Qty</th>
    <th>Price</th>
  </tr>
  <tr>
    <td>Notebook</td>
    <td>2</td>
    <td>€6</td>
  </tr>
  <tr>
    <td>Pen</td>
    <td>5</td>
    <td>€5</td>
  </tr>
</table>
`,
      tasks: [
        { text: 'Add a <caption> as the first child of the table', check: (doc) => (doc.querySelector('table')?.firstElementChild?.tagName === 'CAPTION' ? true : 'Put a <caption> right after <table>.') },
        { text: 'Move the header row into <thead>', check: isChildOf('tr', 'thead') },
        { text: 'Put the product rows in <tbody>', check: all(count('tbody > tr', 2), rawMatches(/<tbody/i, 'Write the <tbody> explicitly.')) },
        { text: 'Add a <tfoot> row with the total (€11)', check: textMatches('tfoot', /11/) },
      ],
      hints: ['If you forget <tbody>, browsers add one invisibly — but write it explicitly so your intent is clear.'],
      solution: `<table>
  <caption>Shopping cart</caption>
  <thead>
    <tr>
      <th>Product</th>
      <th>Qty</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Notebook</td>
      <td>2</td>
      <td>€6</td>
    </tr>
    <tr>
      <td>Pen</td>
      <td>5</td>
      <td>€5</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td colspan="2">Total</td>
      <td>€11</td>
    </tr>
  </tfoot>
</table>
`,
    },
    {
      id: 'tables-span',
      title: 'Merging cells',
      explanation: `A cell can stretch across several columns with \`colspan\`, or several rows with \`rowspan\`:

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

When a cell spans, the cells it covers are simply **not written**. In the example, the last row only has one
\`<td>\` because "Hiking" already fills the first column.

To keep this tidy, count "slots" per row: each row must add up to the same total.`,
      starterCode: `<h1>School timetable</h1>
<table>
  <tr>
    <th>Time</th>
    <th>Monday</th>
    <th>Tuesday</th>
  </tr>
  <tr>
    <td>9:00</td>
    <td>Maths</td>
    <td>History</td>
  </tr>
  <tr>
    <td>10:00</td>
    <td>Maths</td>
    <td>Art</td>
  </tr>
  <tr>
    <td>11:00</td>
    <td>Lunch</td>
    <td>Lunch</td>
  </tr>
</table>
`,
      tasks: [
        { text: 'Monday\'s Maths spans 9:00 and 10:00 with rowspan="2"', check: textMatches('td[rowspan="2"]', /maths/i) },
        { text: 'Lunch spans both days with colspan="2"', check: textMatches('td[colspan="2"]', /lunch/i) },
        { text: 'The duplicated cells are removed', check: all(count('td', 7, 'Remove the cells covered by the merged ones (7 <td> remain).')) },
      ],
      hints: ['After adding rowspan to Maths, delete the Maths cell in the 10:00 row.'],
      solution: `<h1>School timetable</h1>
<table>
  <tr>
    <th>Time</th>
    <th>Monday</th>
    <th>Tuesday</th>
  </tr>
  <tr>
    <td>9:00</td>
    <td rowspan="2">Maths</td>
    <td>History</td>
  </tr>
  <tr>
    <td>10:00</td>
    <td>Art</td>
  </tr>
  <tr>
    <td>11:00</td>
    <td colspan="2">Lunch</td>
  </tr>
</table>
`,
    },
    {
      id: 'tables-a11y',
      title: 'Accessible headers',
      explanation: `Screen readers announce a cell together with its headers ("Price, Apple: €0.50"). To make the
relationship explicit, use the \`scope\` attribute on \`<th>\`:

- \`scope="col"\` — the header is for the column below it.
- \`scope="row"\` — the header is for the row to its right.

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

The first cell of a row is often a row header: make it a \`<th scope="row">\` instead of a \`<td>\`.`,
      starterCode: `<table>
  <caption>Planet facts</caption>
  <thead>
    <tr>
      <th>Planet</th>
      <th>Moons</th>
      <th>Day length</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Earth</td>
      <td>1</td>
      <td>24 h</td>
    </tr>
    <tr>
      <td>Mars</td>
      <td>2</td>
      <td>24.6 h</td>
    </tr>
  </tbody>
</table>
`,
      tasks: [
        { text: 'Every header in <thead> has scope="col"', check: allHaveAttr('thead th', 'scope', 'col') },
        { text: 'The planet names become <th scope="row">', check: all(count('tbody th[scope="row"]', 2), textMatches('tbody th', /mars/i)) },
        { text: 'Each body row has one header and two data cells', check: count('tbody td', 4) },
      ],
      hints: ['Change <td>Earth</td> into <th scope="row">Earth</th>.'],
      solution: `<table>
  <caption>Planet facts</caption>
  <thead>
    <tr>
      <th scope="col">Planet</th>
      <th scope="col">Moons</th>
      <th scope="col">Day length</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Earth</th>
      <td>1</td>
      <td>24 h</td>
    </tr>
    <tr>
      <th scope="row">Mars</th>
      <td>2</td>
      <td>24.6 h</td>
    </tr>
  </tbody>
</table>
`,
    },
  ],
  challenge: {
    id: 'tables-challenge',
    title: 'Challenge: Football league table',
    summary: 'A full table with sections, merged cells and accessible headers.',
    difficulty: 2,
    explanation: `Recreate this league table **exactly**, from scratch:

| (group header) | Played | Points |
|---|---|---|
| **Group A** (spans the whole row) | | |
| Lions | 3 | 9 |
| Tigers | 3 | 4 |
| **Group B** (spans the whole row) | | |
| Eagles | 3 | 7 |
| Wolves | 3 | 1 |
| Total matches (spans two columns) | | 12 |

Requirements:
- A caption "League table".
- The column headers (Team, Played, Points) live in \`<thead>\`, with \`scope="col"\`.
- Each group name is a header cell spanning all 3 columns.
- Team names are row headers.
- The final "Total matches" row is in \`<tfoot>\`, and its label spans two columns.`,
    starterCode: '',
    tasks: [
      { text: 'Caption "League table" as the first child', check: (doc) => (doc.querySelector('table > caption:first-child')?.textContent?.trim().toLowerCase() === 'league table' ? true : 'Add <caption>League table</caption> first.') },
      { text: 'Three column headers in <thead> with scope="col"', check: all(count('thead th', 3), allHaveAttr('thead th', 'scope', 'col')) },
      { text: 'Two group headers spanning 3 columns', check: count('tbody th[colspan="3"]', 2) },
      { text: 'Four team names as <th scope="row">', check: count('tbody th[scope="row"]', 4) },
      { text: 'Points for each team are correct', check: (doc) => {
        const want: Record<string, string> = { lions: '9', tigers: '4', eagles: '7', wolves: '1' };
        for (const th of doc.querySelectorAll('tbody th[scope="row"]')) {
          const name = th.textContent!.trim().toLowerCase();
          const cells = th.parentElement!.querySelectorAll('td');
          if (want[name] && cells[cells.length - 1]?.textContent?.trim() !== want[name]) return `Check the points for ${name}.`;
        }
        return true;
      } },
      { text: 'A <tfoot> total with a 2-column label and 12', check: all(hasAttr('tfoot td, tfoot th', 'colspan', '2'), textMatches('tfoot', /12/)) },
    ],
    hints: [
      'A group row looks like: <tr><th colspan="3" scope="colgroup">Group A</th></tr>',
      'Write the <thead>, then a single <tbody> with 6 rows, then <tfoot>.',
    ],
    solution: `<table>
  <caption>League table</caption>
  <thead>
    <tr>
      <th scope="col">Team</th>
      <th scope="col">Played</th>
      <th scope="col">Points</th>
    </tr>
  </thead>
  <tbody>
    <tr><th colspan="3">Group A</th></tr>
    <tr><th scope="row">Lions</th><td>3</td><td>9</td></tr>
    <tr><th scope="row">Tigers</th><td>3</td><td>4</td></tr>
    <tr><th colspan="3">Group B</th></tr>
    <tr><th scope="row">Eagles</th><td>3</td><td>7</td></tr>
    <tr><th scope="row">Wolves</th><td>3</td><td>1</td></tr>
  </tbody>
  <tfoot>
    <tr><td colspan="2">Total matches</td><td>12</td></tr>
  </tfoot>
</table>
`,
  },
};
