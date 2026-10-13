import type { ModuleText } from '../../localize';

export default {
  title: 'Form',
  description: 'Raccogli dati dagli utenti: campi, etichette, scelte e validazione integrata.',
  items: {
    'forms-basics': {
      title: 'Campi ed etichette',
      explanation: `Un \`<form>\` raccoglie dati e li invia da qualche parte (\`action\`) usando un \`method\` HTTP:

\`\`\`html
<form action="/subscribe" method="post">
  <label for="email">Email</label>
  <input type="email" id="email" name="email">
  <button type="submit">Subscribe</button>
</form>
\`\`\`

- \`<input>\` è un elemento vuoto. Il suo \`name\` è la chiave usata quando i dati vengono inviati.
- Ogni controllo ha bisogno di un'**etichetta** (label). Collegale dando all'input un \`id\` e alla label un \`for\`
  corrispondente. Così cliccando l'etichetta si attiva l'input, e gli screen reader leggono l'etichetta ad alta voce.
- \`<button type="submit">\` invia il form.

Invia il form nell'anteprima per vedere quali dati spedirebbe.`,
      tasks: [
        'Invia il form a /login con method="post"',
        'Dai un name a entrambi gli input',
        'Rendi il campo della password type="password"',
        'Collega ogni input a una <label for="...">',
        'Aggiungi un pulsante di invio',
      ],
      hints: ['<label for="user">Username</label> <input id="user" name="username">'],
    },
    'forms-types': {
      title: 'Tipi di input',
      explanation: `L'attributo \`type\` cambia il comportamento di un input, e anche quale tastiera compare sui telefoni:

| Tipo | Per |
|---|---|
| \`text\` | Testo libero breve (il predefinito) |
| \`email\` | Indirizzi email |
| \`tel\` | Numeri di telefono |
| \`url\` | Indirizzi web |
| \`number\` | Numeri, con \`min\`, \`max\`, \`step\` |
| \`date\`, \`time\` | Selettori di data e ora |
| \`range\` | Un cursore |
| \`color\` | Un selettore di colore |
| \`checkbox\` | Un'opzione sì/no |

\`\`\`html
<label for="age">Age</label>
<input type="number" id="age" name="age" min="0" max="120">

<input type="checkbox" id="news" name="news">
<label for="news">Send me the newsletter</label>
\`\`\`

\`placeholder\` mostra un esempio dentro il campo, ma non sostituisce un'etichetta!`,
      tasks: [
        'Campo email: type="email"',
        'Campo telefono: type="tel"',
        'Campo giorno: type="date"',
        'Ospiti: type="number" tra 1 e 5',
        'Colore: type="color"',
        'Aggiungi una checkbox con etichetta per accettare le condizioni',
      ],
      hints: ['Per la maggior parte dei campi basta cambiare l\'attributo type.'],
    },
    'forms-choices': {
      title: 'Scelte: radio, select, textarea',
      explanation: `I **pulsanti radio** fanno scegliere all'utente esattamente un'opzione. I radio dello stesso gruppo condividono
lo stesso \`name\`; ognuno ha il suo \`value\`. Raggruppali in un \`<fieldset>\` con una \`<legend>\` che fa la domanda:

\`\`\`html
<fieldset>
  <legend>Size</legend>
  <input type="radio" id="s" name="size" value="s"> <label for="s">Small</label>
  <input type="radio" id="l" name="size" value="l" checked> <label for="l">Large</label>
</fieldset>
\`\`\`

Un **menu a tendina** è un \`<select>\` con degli \`<option>\`:

\`\`\`html
<label for="country">Country</label>
<select id="country" name="country">
  <option value="it">Italy</option>
  <option value="fr">France</option>
</select>
\`\`\`

Una \`<textarea>\` è una casella di testo su più righe. A differenza di \`<input>\` ha un tag di chiusura; il suo
contenuto è il testo predefinito.`,
      tasks: [
        'Tre pulsanti radio che condividono name="size"',
        'Ogni radio ha un value diverso',
        'I radio sono in un <fieldset> con una <legend>',
        'Una <select> con tre <option> per l\'impasto',
        'Una <textarea> per le note',
        'Ogni controllo ha un\'etichetta',
      ],
      hints: ['Un <fieldset> con una <legend> dà un\'etichetta al gruppo; ogni radio ha comunque bisogno della sua <label>.'],
    },
    'forms-validation': {
      title: 'Validazione integrata',
      explanation: `I browser possono controllare i dati **prima** che il form venga inviato, senza bisogno di JavaScript:

| Attributo | Regola |
|---|---|
| \`required\` | Il campo non può essere vuoto |
| \`minlength\` / \`maxlength\` | Limiti di lunghezza del testo |
| \`min\` / \`max\` | Limiti per numeri o date |
| \`pattern\` | Un'espressione regolare a cui il valore deve corrispondere |
| \`type="email"\`, \`type="url"\` | Deve essere un'email / un URL valido |

\`\`\`html
<label for="zip">Postcode (5 digits)</label>
<input id="zip" name="zip" required pattern="[0-9]{5}">
\`\`\`

Prova a inviare un valore non valido nell'anteprima: il browser mostra un messaggio di errore e blocca l'invio.

Ricorda: serve solo a semplificare la vita all'utente. Un vero server deve **sempre** validare di nuovo i dati.`,
      tasks: [
        'Username, email e password sono obbligatori',
        'Lo username è lungo da 3 a 15 caratteri',
        'La password ha almeno 8 caratteri',
        'Il PIN deve essere esattamente di 4 cifre (pattern)',
        'La data di nascita non può essere dopo il 2026-12-31',
      ],
      hints: ['pattern="[0-9]{4}" significa "esattamente quattro cifre".', 'Le date usano il formato AAAA-MM-GG.'],
    },
    'forms-challenge': {
      title: 'Sfida: modulo di candidatura',
      summary: 'Un form realistico, con tutte le etichette, gruppi e validazione.',
      explanation: `Un'azienda ha bisogno di un **modulo di candidatura** per un lavoro. Costruiscilo da zero.

Deve inviare i dati con \`POST\` a \`/apply\` e contenere:

1. Gruppo **dati personali**: nome completo (obbligatorio), email (obbligatoria), telefono e un link a un sito portfolio.
2. Gruppo **posizione**: un menu a tendina per scegliere il ruolo (Frontend, Backend o Design) con Frontend preselezionato.
3. Gruppo **esperienza**: anni di esperienza (un numero da 0 a 50) e una scelta radio della modalità di lavoro:
   remote, hybrid o office.
4. Una lettera di presentazione (su più righe, obbligatoria, almeno 100 caratteri).
5. Una checkbox **obbligatoria** per accettare l'informativa sulla privacy.
6. Un pulsante di invio.

Ogni campo deve avere un'etichetta e un \`name\`, ogni \`id\` deve essere unico, e ognuno dei tre
gruppi deve essere un \`<fieldset>\` con una \`<legend>\`.`,
      tasks: [
        'Il form invia con POST a /apply',
        'Tre fieldset, ognuno con una legend',
        'Nome ed email obbligatori (type="email")',
        'Il telefono usa type="tel", il portfolio type="url"',
        'Select del ruolo con 3 opzioni, Frontend preselezionato',
        'Anni: numero da 0 a 50',
        'Tre radio della modalità di lavoro nello stesso gruppo',
        'Lettera di presentazione obbligatoria di almeno 100 caratteri',
        'Checkbox della privacy obbligatoria',
        'Ogni controllo ha un\'etichetta e un name, gli id sono unici',
        'Un pulsante di invio',
      ],
      hints: [
        'Abbozza prima i tre <fieldset>, poi riempili uno alla volta.',
        'Preseleziona un\'opzione con <option value="frontend" selected>.',
        'minlength funziona anche su <textarea>: minlength="100".',
      ],
    },
  },
  messages: {
    'Give each radio its own value.': 'Dai a ogni radio il suo value.',
    'Put the radios inside the <fieldset>.': 'Metti i radio dentro il <fieldset>.',
    'Use pattern="[0-9]{4}".': 'Usa pattern="[0-9]{4}".',
    'The email field must be type="email" and required.': 'Il campo email deve essere type="email" e required.',
    'Preselect Frontend with the selected attribute.': 'Preseleziona Frontend con l\'attributo selected.',
    'Add a type="number" field with min="0" and max="50".': 'Aggiungi un campo type="number" con min="0" e max="50".',
    'Add 3 radios sharing one name.': 'Aggiungi 3 radio che condividono lo stesso name.',
    'Add a required <textarea> with minlength.': 'Aggiungi una <textarea> required con minlength.',
    'Add a submit button.': 'Aggiungi un pulsante di invio.',
  },
} satisfies ModuleText;
