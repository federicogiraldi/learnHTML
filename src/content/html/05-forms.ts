import type { Module } from '../types';
import {
  all, allHaveAttr, controlsLabelled, count, hasAttr, hasElement, isChildOf, textMatches, uniqueIds,
} from '../../engine/checks';

export const forms: Module = {
  id: 'forms',
  title: 'Forms',
  description: 'Collect input from users: fields, labels, choices and built-in validation.',
  lessons: [
    {
      id: 'forms-basics',
      title: 'Inputs and labels',
      explanation: `A \`<form>\` collects data and sends it somewhere (\`action\`) using an HTTP \`method\`:

\`\`\`html
<form action="/subscribe" method="post">
  <label for="email">Email</label>
  <input type="email" id="email" name="email">
  <button type="submit">Subscribe</button>
</form>
\`\`\`

- \`<input>\` is a void element. Its \`name\` is the key used when the data is sent.
- Every control needs a **label**. Connect them by giving the input an \`id\` and the label a matching \`for\`.
  Clicking the label then focuses the input, and screen readers read the label aloud.
- \`<button type="submit">\` sends the form.

Submit the form in the preview to see what data it would send.`,
      starterCode: `<h1>Sign in</h1>
<form>
  Username
  <input>
  Password
  <input>
</form>
`,
      tasks: [
        { text: 'Send the form to /login with method="post"', check: all(hasAttr('form', 'action', '/login'), hasAttr('form', 'method', /^post$/i)) },
        { text: 'Give both inputs a name', check: all(count('input[name]', { min: 2 }), allHaveAttr('input', 'name')) },
        { text: 'Make the password field type="password"', check: hasAttr('input', 'type', 'password') },
        { text: 'Connect each input to a <label for="...">', check: all(count('label[for]', 2), controlsLabelled()) },
        { text: 'Add a submit button', check: hasAttr('button', 'type', 'submit') },
      ],
      hints: ['<label for="user">Username</label> <input id="user" name="username">'],
      solution: `<h1>Sign in</h1>
<form action="/login" method="post">
  <label for="user">Username</label>
  <input id="user" name="username">
  <label for="pass">Password</label>
  <input type="password" id="pass" name="password">
  <button type="submit">Sign in</button>
</form>
`,
    },
    {
      id: 'forms-types',
      title: 'Input types',
      explanation: `The \`type\` attribute changes how an input behaves — and which keyboard appears on phones:

| Type | For |
|---|---|
| \`text\` | Short free text (the default) |
| \`email\` | Email addresses |
| \`tel\` | Phone numbers |
| \`url\` | Web addresses |
| \`number\` | Numbers, with \`min\`, \`max\`, \`step\` |
| \`date\`, \`time\` | Date and time pickers |
| \`range\` | A slider |
| \`color\` | A colour picker |
| \`checkbox\` | An on/off option |

\`\`\`html
<label for="age">Age</label>
<input type="number" id="age" name="age" min="0" max="120">

<input type="checkbox" id="news" name="news">
<label for="news">Send me the newsletter</label>
\`\`\`

\`placeholder\` shows an example inside the field — but it's not a replacement for a label!`,
      starterCode: `<h1>Event registration</h1>
<form>
  <label for="email">Email</label>
  <input id="email" name="email">

  <label for="phone">Phone</label>
  <input id="phone" name="phone">

  <label for="day">Day</label>
  <input id="day" name="day">

  <label for="guests">Guests (1–5)</label>
  <input id="guests" name="guests">

  <label for="color">Favourite colour</label>
  <input id="color" name="color">

  <button type="submit">Register</button>
</form>
`,
      tasks: [
        { text: 'Email field: type="email"', check: hasAttr('#email', 'type', 'email') },
        { text: 'Phone field: type="tel"', check: hasAttr('#phone', 'type', 'tel') },
        { text: 'Day field: type="date"', check: hasAttr('#day', 'type', 'date') },
        { text: 'Guests: type="number" between 1 and 5', check: all(hasAttr('#guests', 'type', 'number'), hasAttr('#guests', 'min', '1'), hasAttr('#guests', 'max', '5')) },
        { text: 'Colour: type="color"', check: hasAttr('#color', 'type', 'color') },
        { text: 'Add a labelled checkbox to accept the terms', check: all(hasElement('input[type="checkbox"]'), controlsLabelled()) },
      ],
      hints: ['Only the type attribute needs to change for most fields.'],
      solution: `<h1>Event registration</h1>
<form>
  <label for="email">Email</label>
  <input type="email" id="email" name="email">

  <label for="phone">Phone</label>
  <input type="tel" id="phone" name="phone">

  <label for="day">Day</label>
  <input type="date" id="day" name="day">

  <label for="guests">Guests (1–5)</label>
  <input type="number" id="guests" name="guests" min="1" max="5">

  <label for="color">Favourite colour</label>
  <input type="color" id="color" name="color">

  <input type="checkbox" id="terms" name="terms">
  <label for="terms">I accept the terms</label>

  <button type="submit">Register</button>
</form>
`,
    },
    {
      id: 'forms-choices',
      title: 'Choices: radio, select, textarea',
      explanation: `**Radio buttons** let the user pick exactly one option. Radios in the same group share the same
\`name\`; each has its own \`value\`. Group them in a \`<fieldset>\` with a \`<legend>\` that asks the question:

\`\`\`html
<fieldset>
  <legend>Size</legend>
  <input type="radio" id="s" name="size" value="s"> <label for="s">Small</label>
  <input type="radio" id="l" name="size" value="l" checked> <label for="l">Large</label>
</fieldset>
\`\`\`

A **drop-down** is a \`<select>\` with \`<option>\`s:

\`\`\`html
<label for="country">Country</label>
<select id="country" name="country">
  <option value="it">Italy</option>
  <option value="fr">France</option>
</select>
\`\`\`

A \`<textarea>\` is a multi-line text box. Unlike \`<input>\`, it has a closing tag; its content is the default text.`,
      starterCode: `<h1>Pizza order</h1>
<form>
  <!-- 1. Size: small / medium / large (radio) -->

  <!-- 2. Crust: thin / classic / stuffed (select) -->

  <!-- 3. Notes for the chef (textarea) -->

  <button type="submit">Order</button>
</form>
`,
      tasks: [
        { text: 'Three radio buttons sharing name="size"', check: count('input[type="radio"][name="size"]', 3) },
        { text: 'Each radio has a different value', check: (doc) => {
          const vals = [...doc.querySelectorAll('input[name="size"]')].map((r) => r.getAttribute('value'));
          return vals.length > 0 && vals.every(Boolean) && new Set(vals).size === vals.length ? true : 'Give each radio its own value.';
        } },
        { text: 'The radios are in a <fieldset> with a <legend>', check: all(isChildOf('legend', 'fieldset'), hasElement('fieldset input[type="radio"]', 'Put the radios inside the <fieldset>.')) },
        { text: 'A <select> with three <option>s for the crust', check: count('select > option', 3) },
        { text: 'A <textarea> for notes', check: hasElement('textarea') },
        { text: 'Every control is labelled', check: controlsLabelled() },
      ],
      hints: ['A <fieldset> with a <legend> labels the group; each radio still needs its own <label>.'],
      solution: `<h1>Pizza order</h1>
<form>
  <fieldset>
    <legend>Size</legend>
    <input type="radio" id="small" name="size" value="small"> <label for="small">Small</label>
    <input type="radio" id="medium" name="size" value="medium" checked> <label for="medium">Medium</label>
    <input type="radio" id="large" name="size" value="large"> <label for="large">Large</label>
  </fieldset>

  <label for="crust">Crust</label>
  <select id="crust" name="crust">
    <option value="thin">Thin</option>
    <option value="classic">Classic</option>
    <option value="stuffed">Stuffed</option>
  </select>

  <label for="notes">Notes for the chef</label>
  <textarea id="notes" name="notes" rows="3"></textarea>

  <button type="submit">Order</button>
</form>
`,
    },
    {
      id: 'forms-validation',
      title: 'Built-in validation',
      explanation: `Browsers can check input **before** the form is sent — no JavaScript needed:

| Attribute | Rule |
|---|---|
| \`required\` | The field can't be empty |
| \`minlength\` / \`maxlength\` | Text length limits |
| \`min\` / \`max\` | Number or date limits |
| \`pattern\` | A regular expression the value must match |
| \`type="email"\`, \`type="url"\` | Must be a valid email / URL |

\`\`\`html
<label for="zip">Postcode (5 digits)</label>
<input id="zip" name="zip" required pattern="[0-9]{5}">
\`\`\`

Try submitting an invalid value in the preview: the browser shows an error message and blocks the submission.

Remember: this is only for user convenience. A real server must **always** validate the data again.`,
      starterCode: `<h1>Create account</h1>
<form>
  <label for="username">Username (3–15 characters)</label>
  <input id="username" name="username">

  <label for="email">Email</label>
  <input type="email" id="email" name="email">

  <label for="password">Password (at least 8 characters)</label>
  <input type="password" id="password" name="password">

  <label for="pin">PIN (4 digits)</label>
  <input id="pin" name="pin" inputmode="numeric">

  <label for="birth">Birth date</label>
  <input type="date" id="birth" name="birth">

  <button type="submit">Create</button>
</form>
`,
      tasks: [
        { text: 'Username, email and password are required', check: all(hasAttr('#username', 'required'), hasAttr('#email', 'required'), hasAttr('#password', 'required')) },
        { text: 'Username is 3 to 15 characters long', check: all(hasAttr('#username', 'minlength', '3'), hasAttr('#username', 'maxlength', '15')) },
        { text: 'Password has at least 8 characters', check: hasAttr('#password', 'minlength', '8') },
        { text: 'PIN must be exactly 4 digits (pattern)', check: hasAttr('#pin', 'pattern', /^(\[0-9\]|\\d)\{4\}$/, 'Use pattern="[0-9]{4}".') },
        { text: 'Birth date can\'t be after 2026-12-31', check: hasAttr('#birth', 'max', '2026-12-31') },
      ],
      hints: ['pattern="[0-9]{4}" means "exactly four digits".', 'Dates use the format YYYY-MM-DD.'],
      solution: `<h1>Create account</h1>
<form>
  <label for="username">Username (3–15 characters)</label>
  <input id="username" name="username" required minlength="3" maxlength="15">

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>

  <label for="password">Password (at least 8 characters)</label>
  <input type="password" id="password" name="password" required minlength="8">

  <label for="pin">PIN (4 digits)</label>
  <input id="pin" name="pin" inputmode="numeric" pattern="[0-9]{4}">

  <label for="birth">Birth date</label>
  <input type="date" id="birth" name="birth" max="2026-12-31">

  <button type="submit">Create</button>
</form>
`,
    },
  ],
  challenge: {
    id: 'forms-challenge',
    title: 'Challenge: Job application form',
    summary: 'A realistic, fully labelled form with groups and validation.',
    difficulty: 3,
    explanation: `A company needs a **job application form**. Build it from scratch.

It must send its data with \`POST\` to \`/apply\` and contain:

1. **Personal details** group: full name (required), email (required), phone, and a link to a portfolio website.
2. **Position** group: a drop-down to choose the role — Frontend, Backend or Design — with Frontend preselected.
3. **Experience** group: years of experience (a number from 0 to 50) and a radio choice of work mode:
   remote, hybrid or office.
4. A cover letter (multi-line, required, at least 100 characters).
5. A **required** checkbox to accept the privacy policy.
6. A submit button.

Every field must be labelled and have a \`name\`, every \`id\` must be unique, and each of the three
groups must be a \`<fieldset>\` with a \`<legend>\`.`,
    starterCode: '',
    tasks: [
      { text: 'The form posts to /apply', check: all(hasAttr('form', 'action', '/apply'), hasAttr('form', 'method', /^post$/i)) },
      { text: 'Three fieldsets, each with a legend', check: all(count('fieldset', 3), count('fieldset > legend', 3)) },
      { text: 'Required name and email (type="email")', check: all(count('input[required]', { min: 2 }), hasElement('input[type="email"][required]', 'The email field must be type="email" and required.')) },
      { text: 'Phone uses type="tel", portfolio uses type="url"', check: all(hasElement('input[type="tel"]'), hasElement('input[type="url"]')) },
      { text: 'Role select with 3 options, Frontend preselected', check: all(count('select option', 3), textMatches('option[selected]', /frontend/i, 'Preselect Frontend with the selected attribute.')) },
      { text: 'Years: number from 0 to 50', check: hasElement('input[type="number"][min="0"][max="50"]', 'Add a type="number" field with min="0" and max="50".') },
      { text: 'Three work-mode radios in the same group', check: (doc) => {
        const radios = [...doc.querySelectorAll('input[type="radio"]')];
        return radios.length === 3 && new Set(radios.map((r) => r.getAttribute('name'))).size === 1 && radios[0].getAttribute('name') ? true : 'Add 3 radios sharing one name.';
      } },
      { text: 'Required cover letter of at least 100 characters', check: hasElement('textarea[required][minlength]', 'Add a required <textarea> with minlength.') },
      { text: 'Required privacy checkbox', check: hasElement('input[type="checkbox"][required]') },
      { text: 'Every control has a label and a name, ids are unique', check: all(controlsLabelled(), allHaveAttr('input, select, textarea', 'name'), uniqueIds()) },
      { text: 'A submit button', check: hasElement('button[type="submit"], input[type="submit"]', 'Add a submit button.') },
    ],
    hints: [
      'Sketch the three <fieldset>s first, then fill them in one at a time.',
      'Preselect an option with <option value="frontend" selected>.',
      'minlength works on <textarea> too: minlength="100".',
    ],
    solution: `<h1>Apply for a job</h1>
<form action="/apply" method="post">
  <fieldset>
    <legend>Personal details</legend>
    <label for="name">Full name</label>
    <input id="name" name="name" required>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
    <label for="phone">Phone</label>
    <input type="tel" id="phone" name="phone">
    <label for="site">Portfolio</label>
    <input type="url" id="site" name="portfolio">
  </fieldset>

  <fieldset>
    <legend>Position</legend>
    <label for="role">Role</label>
    <select id="role" name="role">
      <option value="frontend" selected>Frontend</option>
      <option value="backend">Backend</option>
      <option value="design">Design</option>
    </select>
  </fieldset>

  <fieldset>
    <legend>Experience</legend>
    <label for="years">Years of experience</label>
    <input type="number" id="years" name="years" min="0" max="50">
    <p>Work mode:</p>
    <input type="radio" id="remote" name="mode" value="remote"> <label for="remote">Remote</label>
    <input type="radio" id="hybrid" name="mode" value="hybrid"> <label for="hybrid">Hybrid</label>
    <input type="radio" id="office" name="mode" value="office"> <label for="office">Office</label>
  </fieldset>

  <label for="letter">Cover letter</label>
  <textarea id="letter" name="letter" rows="6" required minlength="100"></textarea>

  <input type="checkbox" id="privacy" name="privacy" required>
  <label for="privacy">I accept the privacy policy</label>

  <button type="submit">Send application</button>
</form>
`,
  },
};
