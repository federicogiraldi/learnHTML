import type { ModuleText } from '../../localize';

export default {
  title: 'Basi di JavaScript',
  description: 'Stampa nella console, memorizza valori in variabili e lavora con numeri e testo.',
  items: {
    'js-basics-console': {
      title: 'Ciao, console',
      explanation: `JavaScript è il linguaggio che fa *fare* cose alle pagine web. Prima di toccare la pagina useremo la
**console**: un pannello in cui il tuo codice può stampare messaggi. È il primo posto dove guardano gli sviluppatori quando
qualcosa va storto.

\`\`\`js
console.log('Hello, world!');
console.log(42);
console.log('Two plus two is', 2 + 2);
\`\`\`

- \`console.log(...)\` stampa qualsiasi cosa gli passi. Separa più valori con le virgole.
- Il testo va tra virgolette: \`'singole'\` o \`"doppie"\`, funzionano entrambe. I numeri non vogliono virgolette.
- Ogni istruzione finisce con un punto e virgola \`;\`.

Premi **Esegui** (o Ctrl+Invio) per eseguire il codice; l'output compare nel pannello **Console**.`,
      tasks: [
        'Stampa il testo Hello, world!',
        'Stampa il numero 2026',
        'Stampa il risultato di 7 * 6 (lascia fare i conti a JavaScript)',
      ],
      hints: [
        'Il testo vuole le virgolette: console.log(\'Hello, world!\');',
        'Per i conti, metti l\'espressione tra le parentesi: console.log(7 * 6);',
      ],
    },
    'js-basics-variables': {
      title: 'Variabili: let e const',
      explanation: `Una **variabile** è un nome per un valore, così puoi usarlo più tardi.

\`\`\`js
const name = 'Ada';   // const: this name always refers to the same value
let score = 0;        // let: the value can change later

score = score + 10;   // reassign: no let/const the second time
console.log(name, score);   // Ada 10
\`\`\`

- Usa **\`const\`** di default. Passa a **\`let\`** solo quando devi riassegnare la variabile.
- Riassegnare una \`const\` è un errore: \`TypeError: Assignment to constant variable.\`
- Nei tutorial potresti vedere la vecchia parola chiave **\`var\`**. Ha regole di visibilità confuse: non usarla.
- I nomi distinguono maiuscole e minuscole e di solito si scrivono in *camelCase*: \`firstName\`, \`totalPrice\`.`,
      tasks: [
        'Dichiara city con const (il suo valore non cambia mai)',
        'Dichiara lives con let',
        'Dopo le dichiarazioni, diminuisci lives di uno, così alla fine vale 2',
        'Stampa city e lives dopo la modifica',
        'Non usare var da nessuna parte',
      ],
      hints: [
        'Sostituisci ogni var con const o let.',
        'lives = lives - 1; (o lives--) cambia il valore. Deve venire prima del console.log.',
      ],
    },
    'js-basics-types': {
      title: 'Tipi di valori',
      explanation: `Ogni valore ha un **tipo**. Quelli di base:

| Tipo | Esempi |
|---|---|
| string | \`'hello'\`, \`"42"\` (tra virgolette: è testo!) |
| number | \`42\`, \`3.14\`, \`-7\` |
| boolean | \`true\`, \`false\` |
| undefined | una variabile che non ha ancora un valore |
| null | "vuoto di proposito" |

\`typeof\` ti dice il tipo di un valore:

\`\`\`js
console.log(typeof 'hi');     // string
console.log(typeof 42);       // number
console.log(typeof '42');     // string — quotes make it text
console.log(typeof true);     // boolean
\`\`\`

Convertire capita spesso quando leggi testo da un form: \`Number('42')\` dà il numero 42,
\`String(42)\` il testo \`'42'\`.`,
      tasks: [
        'Rendi pages un numero (310), non una stringa',
        'Rendi available il booleano true',
        'Mantieni title come la stringa The Hobbit',
        'La console mostra che pages è un number',
      ],
      hints: ['Togli le virgolette attorno a 310.', 'true e false sono parole chiave: niente virgolette, altrimenti diventano stringhe.'],
    },
    'js-basics-operators': {
      title: 'Operatori',
      explanation: `JavaScript fa i conti con i soliti operatori, più qualcuno molto comodo:

\`\`\`js
console.log(10 + 3);   // 13
console.log(10 - 3);   // 7
console.log(10 * 3);   // 30
console.log(10 / 4);   // 2.5
console.log(10 % 3);   // 1  — the remainder of the division
console.log(2 ** 3);   // 8  — power

let count = 5;
count += 2;   // same as count = count + 2  → 7
count++;      // add one → 8
\`\`\`

Attenzione: \`+\` **unisce anche le stringhe**. \`'5' + 3\` fa \`'53'\`, non 8! Prima converti il testo con \`Number()\`.

Le parentesi funzionano come in matematica: \`(2 + 3) * 4\` fa 20.`,
      tasks: [
        'total è price per quantity (13.5)',
        'extra è il numero 3: converti typed con Number() prima di sommare',
        'Dichiara remainder come 17 % 5 e stampalo (2)',
      ],
      hints: ['typed + 1 unisce il testo \'2\' e 1 in \'21\'. Number(typed) + 1 fa 3.', 'const remainder = 17 % 5;'],
    },
    'js-basics-templates': {
      title: 'Template string',
      explanation: `Costruire testo a partire da variabili con \`+\` diventa presto un pasticcio:

\`\`\`js
const name = 'Ada';
const age = 36;
console.log('My name is ' + name + ' and I am ' + age + '.');
\`\`\`

Le **template string** usano i backtick (\`\` \` \`\`) e \`\${...}\` per inserire i valori direttamente nel testo:

\`\`\`js
const name = 'Ada';
const age = 36;
console.log(\`My name is \${name} and I am \${age}.\`);
console.log(\`Next year I'll be \${age + 1}.\`);   // any expression works inside \${}
\`\`\`

Le template string possono anche andare su più righe. Per i prezzi, \`toFixed(2)\` mostra due decimali:
\`(4.5).toFixed(2)\` fa \`'4.50'\`.`,
      tasks: [
        'Riscrivi line come template string',
        'line dice Coffee x3 = €7.50 (due decimali, con il simbolo €)',
        'Stampa line',
      ],
      hints: ['const line = `${product} x${cups} = ...`;', 'L\'importo è (price * cups).toFixed(2), dentro ${}.'],
    },
    'js-basics-challenge': {
      title: 'Stampante di scontrini',
      summary: 'Calcola il conto di un bar e stampa uno scontrino ordinato nella console.',
      explanation: `Un bar ha bisogno di una piccola stampante di scontrini. L'ordine è già nelle variabili. Calcola il conto e stampalo.

Stampa esattamente queste quattro righe, in quest'ordine (prezzi sempre con due decimali e il simbolo €):

\`\`\`
Espresso x2: €3.60
Croissant x3: €4.50
Subtotal: €8.10
Total with 10% tip: €8.91
\`\`\`

Usa \`const\` per i valori che non cambiano, le template string per le righe, e lascia fare i conti a JavaScript:
il tuo codice deve funzionare anche se un prezzo cambia.`,
      tasks: [
        'Le quattro righe dello scontrino sono stampate in ordine',
        'Una variabile subtotal contiene il subtotale come numero',
        'Gli importi sono calcolati dalle variabili, non scritti a mano',
        'Le righe sono costruite con template string',
        'Niente var',
      ],
      hints: [
        'const subtotal = espressoPrice * espressos + croissantPrice * croissants;',
        'Il totale è subtotal * (1 + tipPercent / 100). Formatta ogni importo con .toFixed(2).',
      ],
    },
  },
  messages: {
    'Log exactly: Hello, world!': 'Stampa esattamente: Hello, world!',
    'Write the calculation 7 * 6 in your code.': 'Scrivi il calcolo 7 * 6 nel tuo codice.',
    'Change lives with an assignment, not by editing the 3.': 'Cambia lives con un\'assegnazione, non modificando il 3.',
    'Log both values after changing lives: console.log(city, lives);': 'Stampa entrambi i valori dopo aver cambiato lives: console.log(city, lives);',
    'Log typeof pages — it should print number.': 'Stampa typeof pages: deve scrivere number.',
    'Compute total from price and quantity.': 'Calcola total da price e quantity.',
    'Use Number(typed).': 'Usa Number(typed).',
    'Use the % operator.': 'Usa l\'operatore %.',
    'Assign a template string (backticks with ${...}) to line.': 'Assegna a line una template string (backtick con ${...}).',
    'Store the subtotal (a number, 8.1) in a variable called subtotal.': 'Memorizza il subtotale (un numero, 8.1) in una variabile chiamata subtotal.',
    'Compute the espresso line from espressoPrice and espressos.': 'Calcola la riga degli espresso da espressoPrice ed espressos.',
    'Use template strings (backticks and ${...}).': 'Usa le template string (backtick e ${...}).',
  },
} satisfies ModuleText;
