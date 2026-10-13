import type { ModuleText } from '../../localize';

export default {
  title: 'JavaScript moderno',
  description: 'Moduli, classi, errori, optional chaining, JSON e localStorage: gli strumenti del codice moderno di tutti i giorni.',
  items: {
    'js-modern-modules': {
      title: 'Moduli: import ed export',
      explanation: `I progetti veri dividono il codice in tanti file chiamati **moduli**. Un modulo sceglie che cosa condividere con
\`export\`, e gli altri moduli lo prendono con \`import\`:

\`\`\`text
// cart.js
const items = [];                      // private: not exported

export function add(name, price) {     // a named export
  items.push({ name, price });
}
export function total() {
  return items.reduce((sum, item) => sum + item.price, 0);
}
export default 'EUR';                  // one default export per file (optional)

// main.js
import currency, { add, total } from './cart.js';
add('Pen', 1.5);
console.log(total(), currency);
\`\`\`

- Gli export con nome si importano con i loro nomi tra \`{ }\` (rinominali con \`{ add as addToCart }\`); l'export
  predefinito (default) prende il nome che vuoi. \`import * as cart from './cart.js'\` importa tutto come un solo oggetto.
- Nel browser, il file di partenza si carica con \`<script type="module" src="main.js"></script>\`.
  I moduli girano in modalità strict, aspettano che la pagina sia stata letta, e ognuno ha il suo **scope**: una variabile
  è visibile altrove solo se viene esportata.

**In LearnWeb il tuo codice sta in un solo script.js**, quindi qui non ci sono file da cui importare. L'abitudine che
insegnano i moduli vale anche in un file solo: tieni i dati privati ed esponi un piccolo insieme di funzioni. Prima che
esistessero i moduli, lo si faceva con una funzione che restituisce un oggetto, il *module pattern*:

\`\`\`js
function createCounter() {
  let count = 0;                                // private: only the functions below can see it
  return {
    increment() { count++; },
    value() { return count; },
  };
}

const counter = createCounter();
counter.increment();
console.log(counter.value());   // 1 — and nobody can mess with count directly
\`\`\``,
      tasks: [
        'Scrivi una funzione createCart()',
        'createCart() restituisce un oggetto con i metodi add(name, price), total() e count()',
        'Ogni carrello ha i suoi items privati: due carrelli non li condividono',
        'items non è più una variabile globale',
        'Usa un carrello per aggiungere la Pen e il Notebook, poi stampa Total: 5.5 e Items: 2',
      ],
      hints: [
        'function createCart() { const items = []; return { add(name, price) { ... }, total() { ... }, count() { ... } }; }',
        'count() { return items.length; }',
        'const cart = createCart(); cart.add(\'Pen\', 1.5); ... console.log(\'Total:\', cart.total());',
      ],
    },
    'js-modern-classes': {
      title: 'Classi',
      explanation: `Una **classe** è uno stampo per oggetti che condividono la stessa forma e lo stesso comportamento.

\`\`\`js
class Dog {
  constructor(name) {      // runs on new Dog(...): set up the object's properties
    this.name = name;
    this.tricks = [];
  }

  learn(trick) {           // a method: every Dog has it
    this.tricks.push(trick);
  }

  get description() {      // a getter: read like a property, computed when read
    return \`\${this.name} knows \${this.tricks.length} tricks\`;
  }
}

const rex = new Dog('Rex');
rex.learn('sit');
console.log(rex.description);   // Rex knows 1 tricks — no () for a getter
\`\`\`

Una classe può **estenderne** un'altra: ne riceve tutti i metodi, e può aggiungerne o cambiarne alcuni.
Il suo costruttore deve chiamare \`super(...)\` (il costruttore del genitore) prima di usare \`this\`:

\`\`\`js
class GuideDog extends Dog {
  constructor(name, owner) {
    super(name);
    this.owner = owner;
  }

  guide() {
    console.log(\`\${this.name} guides \${this.owner}\`);
  }
}

const max = new GuideDog('Max', 'Sam');
max.learn('stop at kerbs');   // inherited from Dog
max.guide();
console.log(max instanceof Dog);   // true
\`\`\``,
      tasks: [
        'deposit(amount) aggiunge al saldo, e un nuovo metodo withdraw(amount) toglie dal saldo',
        'Un getter summary restituisce il titolare e il saldo, tipo Ada: €30.00',
        'Stampa acc.summary dopo aver versato 50 e prelevato 20 (Ada: €30.00)',
        'class SavingsAccount extends Account, riceve (owner, rate) e ha addInterest() che aggiunge saldo × tasso',
      ],
      hints: [
        'deposit(amount) { this.balance += amount; } withdraw è uguale con -=.',
        'get summary() { return `${this.owner}: €${this.balance.toFixed(2)}`; }',
        'class SavingsAccount extends Account { constructor(owner, rate) { super(owner); this.rate = rate; } addInterest() { ... } }',
      ],
    },
    'js-modern-throw': {
      title: 'Lanciare i propri errori',
      explanation: `Hai intercettato errori da \`fetch\`. Anche il tuo codice può sollevarne, con **\`throw\`**: ferma la funzione lì
dov'è e salta al \`catch\` più vicino risalendo la catena delle chiamate.

\`\`\`js
function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

try {
  console.log(divide(10, 2));   // 5
  console.log(divide(1, 0));    // throws: the next line never runs
  console.log('unreachable');
} catch (err) {
  console.log(err.name, err.message);   // Error Cannot divide by zero
}
\`\`\`

Per distinguere i *tuoi* errori previsti (input sbagliato) dai bug veri, crea una **classe di errore personalizzata**
estendendo \`Error\`, poi controllala con \`instanceof\`:

\`\`\`js
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

try {
  riskyThing();
} catch (err) {
  if (err instanceof ValidationError) {
    console.log('Please fix:', err.message);   // expected: tell the user
  } else {
    throw err;                                  // a real bug: don't hide it
  }
}
\`\`\`

Lancia oggetti \`Error\`, non semplici stringhe: portano con sé un messaggio, un nome e uno stack trace.`,
      tasks: [
        'Definisci class ValidationError extends Error, con il nome ValidationError',
        'parseAge lancia una ValidationError: Age must be a number, oppure Age must be between 0 and 150',
        'Le età valide funzionano ancora: parseAge(\'36\') restituisce 36',
        'Il ciclo intercetta gli errori di validazione e stampa Invalid: <message> per ogni input sbagliato',
      ],
      hints: [
        'class ValidationError extends Error { constructor(message) { super(message); this.name = \'ValidationError\'; } }',
        'if (Number.isNaN(age)) throw new ValidationError(\'Age must be a number\'); poi controlla age < 0 || age > 150.',
        'for (...) { try { console.log(\'Age:\', parseAge(input)); } catch (err) { if (err instanceof ValidationError) console.log(\'Invalid:\', err.message); else throw err; } }',
      ],
    },
    'js-modern-optional': {
      title: 'Optional chaining e ??',
      explanation: `I dati veri hanno dei buchi: un utente senza indirizzo, impostazioni mai salvate. Leggere una proprietà di
\`undefined\` manda in crash:

\`\`\`js
const user = { name: 'Grace' };
console.log(user.address.city);   // TypeError: Cannot read properties of undefined
\`\`\`

L'**optional chaining \`?.\`** si ferma e dà \`undefined\` se il valore alla sua sinistra è \`null\` o \`undefined\`:

\`\`\`js
const user = { name: 'Grace' };
console.log(user.address?.city);      // undefined — no crash
console.log(user.greet?.());          // call a method only if it exists
console.log(user.friends?.[0]);       // works with [ ] too
\`\`\`

Il **nullish coalescing \`??\`** dà un valore di ripiego quando la parte sinistra è \`null\` o \`undefined\`:

\`\`\`js
const volume = 0;
console.log(volume || 50);   // 50 — || replaces every "falsy" value: 0, '', false…
console.log(volume ?? 50);   // 0  — ?? only replaces null and undefined
\`\`\`

Funzionano bene insieme: \`user.address?.city ?? 'Unknown'\`. Usa \`??\` per i valori predefiniti ogni volta che \`0\`, \`''\` o
\`false\` sono valori validi.`,
      tasks: [
        'cityOf restituisce la città, o \'Unknown\' quando non c\'è un indirizzo (usa ?. e ??)',
        'volumeOf restituisce 50 quando non c\'è un volume, ma mantiene un volume di 0',
        'Il ciclo stampa ogni utente senza andare in crash',
      ],
      hints: ['return user.address?.city ?? \'Unknown\';', 'return user.settings?.volume ?? 50;'],
    },
    'js-modern-json': {
      title: 'JSON',
      explanation: `**JSON** (JavaScript Object Notation) è il formato di testo usato per inviare e memorizzare dati: le API rispondono in JSON,
e \`localStorage\` può memorizzare solo testo. Due funzioni convertono avanti e indietro:

\`\`\`js
const user = { name: 'Ada', langs: ['en', 'fr'], admin: false };

const text = JSON.stringify(user);
console.log(text);          // {"name":"Ada","langs":["en","fr"],"admin":false}
console.log(typeof text);   // string

const copy = JSON.parse(text);
console.log(copy.langs[1]); // fr — a real object again

console.log(JSON.stringify(user, null, 2));   // pretty-printed, indented by 2 spaces
\`\`\`

JSON è più severo di JavaScript: chiavi e stringhe vogliono le **virgolette doppie**, e non ci sono commenti,
funzioni né \`undefined\` (\`stringify\` li salta; una \`Date\` diventa una stringa).

\`JSON.parse\` **lancia** un \`SyntaxError\` con un testo non valido, quindi racchiudilo in \`try\`/\`catch\` quando il testo
arriva da fuori (un utente, un server, lo storage).`,
      tasks: [
        'text è l\'ordine come stringa JSON',
        'parsed è l\'ordine ricevuto come oggetto, e viene stampato coffee',
        'safeParse restituisce il valore interpretato, o null per un JSON non valido',
      ],
      hints: [
        'const text = JSON.stringify(order);',
        'const parsed = JSON.parse(received);',
        'try { return JSON.parse(text); } catch { return null; }',
      ],
    },
    'js-modern-storage': {
      title: 'Ricordare le cose: localStorage',
      explanation: `Le variabili spariscono quando la pagina si ricarica. **\`localStorage\`** conserva piccoli pezzi di dati nel browser,
per ogni sito, anche dopo che è stato chiuso:

\`\`\`js
localStorage.setItem('name', 'Ada');
console.log(localStorage.getItem('name'));    // Ada
console.log(localStorage.getItem('missing')); // null — nothing saved under that key
localStorage.removeItem('name');
\`\`\`

Memorizza solo **stringhe**. Salvare direttamente un oggetto memorizza il testo inutile \`"[object Object]"\`, quindi usa JSON:

\`\`\`js
const prefs = { theme: 'dark', fontSize: 18 };
localStorage.setItem('prefs', JSON.stringify(prefs));

const saved = JSON.parse(localStorage.getItem('prefs'));
console.log(saved.fontSize);   // 18
\`\`\`

Quando carichi, prevedi il caso "non è ancora stato salvato niente" (\`getItem\` restituisce \`null\`) e i dati rotti
(\`JSON.parse\` lancia un errore): ripiega sui valori predefiniti. Non salvarci mai segreti come le password: qualsiasi script
della pagina li può leggere.

In LearnWeb, localStorage è simulato: questa lezione parte con le preferenze salvate
\`{"theme":"dark","fontSize":20}\`. Quello che il tuo codice salva sopravvive a **Esegui** (come un ricaricamento della pagina);
il pulsante **Svuota storage** sopra la console lo svuota. Stampa \`localStorage.getItem('prefs')\` per vedere che cosa c'è salvato.`,
      tasks: [
        'Al caricamento, vengono applicate le preferenze salvate (tema scuro, testo da 20px)',
        'loadPrefs() restituisce i valori predefiniti quando non è salvato niente (o c\'è un JSON non valido)',
        'Cambiare il tema salva le preferenze come JSON',
        'A+ ingrandisce il testo e salva anche quello',
      ],
      hints: [
        'In loadPrefs: const raw = localStorage.getItem(\'prefs\'); if (raw === null) return { ...defaults };',
        'try { return JSON.parse(raw); } catch { return { ...defaults }; }',
        'localStorage.setItem(\'prefs\', JSON.stringify(prefs)); e chiama savePrefs(prefs) anche nel gestore di A+.',
      ],
    },
    'js-modern-challenge': {
      title: 'Caccia ai bug: l\'app di note smemorata',
      summary: 'Un\'app di note costruita con una classe, JSON e localStorage, e piena di bug. Trovali e correggili.',
      explanation: `Una collega ha scritto una piccola app per le note ed è andata in vacanza. Non parte nemmeno. Trova e correggi i bug in
script.js: i requisiti sono nascosti e compaiono man mano che li correggi.

Ecco come dovrebbe funzionare l'app:

- Le note sono gestite da una classe \`NoteStore\` e salvate in localStorage sotto la chiave \`notes\`, come array JSON di
  oggetti \`{ "text": ..., "done": ... }\`. Due note sono già salvate: *Buy milk* e *Call Grace* (fatta).
- Al caricamento, le note salvate vengono elencate in \`#notes\` (un \`<li>\` ciascuna, con la classe \`done\` quando sono fatte), e
  \`#count\` mostra quante sono, tipo \`(2)\`.
- Inviare il form aggiunge il testo di \`#note-text\` come nuova nota, senza ricaricare la pagina, e la salva.
- Le note vuote, comprese quelle fatte solo di spazi, vengono rifiutate: \`#error\` mostra *A note cannot be empty*.
- Cliccare una nota la fa passare da fatta a non fatta e viceversa, e lo salva.
- **Delete all** svuota l'elenco e le note salvate, così non ricompaiono dopo un ricaricamento.

HTML e CSS vanno bene: tutti i bug sono in script.js. Per prima cosa leggi gli errori nella Console.`,
      tasks: [
        'L\'app parte senza errori e #count mostra il numero di note',
        'Le note salvate vengono elencate al caricamento, quelle fatte con la classe done',
        'Inviare il form aggiunge una nota senza ricaricare la pagina',
        'Le note vengono salvate in localStorage come JSON',
        'Una nota fatta solo di spazi viene rifiutata con un messaggio di errore',
        'Cliccare una nota la segna come fatta e salva la modifica',
        'Delete all svuota l\'elenco e le note salvate',
      ],
      hints: [
        'count è un getter: leggilo come store.count, senza ().',
        'Confronta la chiave usata in load() con quella usata in save(), e ricorda che localStorage memorizza solo stringhe.',
        'Un gestore del submit ha bisogno di event.preventDefault(); \'   \'.length vale 3, ma \'   \'.trim() è \'\'. E clear() salva?',
      ],
    },
  },
  messages: {
    'Write a function createCart().': 'Scrivi una funzione createCart().',
    'createCart() should return { add, total, count }.': 'createCart() deve restituire { add, total, count }.',
    'Adding to one cart changed another: create the items array inside createCart().': 'Aggiungere a un carrello ne ha cambiato un altro: crea l\'array items dentro createCart().',
    'Move items inside createCart(), so only its methods can reach it.': 'Sposta items dentro createCart(), così solo i suoi metodi possono raggiungerlo.',
    'Create the cart with createCart().': 'Crea il carrello con createCart().',
    'Keep the Account class.': 'Mantieni la classe Account.',
    'Add a withdraw(amount) method.': 'Aggiungi un metodo withdraw(amount).',
    'Write summary as a getter: get summary() { ... }.': 'Scrivi summary come getter: get summary() { ... }.',
    'SavingsAccount should extend Account.': 'SavingsAccount deve estendere Account.',
    'Add an addInterest() method.': 'Aggiungi un metodo addInterest().',
    'Define class ValidationError extends Error { ... }.': 'Definisci class ValidationError extends Error { ... }.',
    'ValidationError should extend Error.': 'ValidationError deve estendere Error.',
    'Pass the message on with super(message).': 'Passa il messaggio con super(message).',
    "Set this.name = 'ValidationError' in the constructor.": 'Imposta this.name = \'ValidationError\' nel costruttore.',
    'Define the ValidationError class first.': 'Prima definisci la classe ValidationError.',
    'In the catch, check err instanceof ValidationError (and re-throw anything else).': 'Nel catch, controlla err instanceof ValidationError (e rilancia tutto il resto).',
    'Use optional chaining: user.address?.city.': 'Usa l\'optional chaining: user.address?.city.',
    'A saved volume of 0 is a real value: use ?? instead of ||.': 'Un volume salvato di 0 è un valore vero: usa ?? invece di ||.',
    'volumeOf should work without settings too: user.settings?.volume.': 'volumeOf deve funzionare anche senza settings: user.settings?.volume.',
    'Use ?? for the default.': 'Usa ?? per il valore predefinito.',
    "safeParse('{oops') should return null: catch the SyntaxError.": 'safeParse(\'{oops\') deve restituire null: intercetta il SyntaxError.',
    'The saved theme is dark: read "prefs" from localStorage in loadPrefs().': 'Il tema salvato è scuro: leggi "prefs" da localStorage in loadPrefs().',
    'The toggled note should be saved with done: true.': 'La nota cambiata deve essere salvata con done: true.',
    'localStorage "notes" should hold valid JSON.': 'localStorage "notes" deve contenere JSON valido.',
  },
} satisfies ModuleText;
