import type { ModuleText } from '../../localize';

export default {
  title: 'Funzioni',
  description: 'Impacchetta il codice in funzioni riutilizzabili che ricevono parametri, restituiscono risultati e tengono per sé le loro variabili.',
  items: {
    'js-functions-declarations': {
      title: 'Dichiarare funzioni',
      explanation: `Una **funzione** è un blocco di codice con un nome che puoi eseguire (*chiamare*) tutte le volte che vuoi.
Scrivi il codice una volta, usalo ovunque:

\`\`\`js
function sayHi(name) {
  console.log('Hi, ' + name + '!');
}

sayHi('Ada');     // Hi, Ada!
sayHi('Grace');   // Hi, Grace!
\`\`\`

- \`function\` + un nome + i **parametri** tra parentesi + il corpo tra \`{ }\`.
- Dichiarare una funzione non la esegue. **Chiamarla**, con \`nome(...)\`, sì.
- I valori che passi quando la chiami (\`'Ada'\`) sono gli **argomenti**; dentro, il parametro \`name\` li contiene.
- I nomi delle funzioni sono verbi in camelCase: \`showMenu\`, \`addToCart\`.`,
      tasks: [
        'Dichiara una funzione greet(name) con la parola chiave function',
        'greet(name) stampa Hello, <name>!',
        'Chiama greet tre volte, per Ada, Grace e Linus',
        'Resta un solo console.log, dentro greet',
      ],
      hints: [
        'function greet(name) { console.log(`Hello, ${name}!`); }',
        'Poi chiamala: greet(\'Ada\'); greet(\'Grace\'); greet(\'Linus\');',
      ],
    },
    'js-functions-return': {
      title: 'Restituire valori',
      explanation: `\`console.log\` si limita a *mostrare* un valore. Per **restituire** un valore al codice che ha chiamato la funzione,
usa **\`return\`**:

\`\`\`js
function double(n) {
  return n * 2;
}

const result = double(5) + 1;   // double(5) is replaced by 10
console.log(result);            // 11
\`\`\`

- \`return\` termina subito la funzione: le righe dopo non vengono eseguite.
- Una funzione senza \`return\` (o con un \`return;\` vuoto) restituisce \`undefined\`.
- Preferisci funzioni che **restituiscono** i risultati a funzioni che li stampano: un valore restituito si può stampare,
  memorizzare, confrontare o passare a un'altra funzione.`,
      tasks: [
        'square(n) restituisce n al quadrato',
        'area(width, height) restituisce width per height',
        'total vale 19',
        'La console mostra 19 (e nient\'altro)',
      ],
      hints: [
        'Sostituisci console.log(n * n) con return n * n;',
        'Calcolare width * height non basta: devi restituirlo.',
      ],
    },
    'js-functions-params': {
      title: 'Parametri e valori predefiniti',
      explanation: `Una funzione può avere più parametri, separati da virgole. JavaScript non controlla quanti argomenti passi:
un argomento mancante è semplicemente \`undefined\`, quelli in più vengono ignorati.

Dai a un parametro un **valore predefinito** con \`=\`. Viene usato quando l'argomento manca (\`undefined\`):

\`\`\`js
function welcome(name, greeting = 'Hello') {
  return \`\${greeting}, \${name}!\`;
}

console.log(welcome('Ada'));          // Hello, Ada!
console.log(welcome('Ada', 'Ciao'));  // Ciao, Ada!
\`\`\`

Gli argomenti vengono abbinati per **posizione**, quindi i parametri con un valore predefinito di solito vanno in fondo.
Nota che passare \`null\` *non* attiva il valore predefinito: lo fa solo \`undefined\`.`,
      tasks: [
        'currency vale \'€\' di default',
        'decimals vale 2 di default',
        'Passare tutti e tre gli argomenti funziona ancora',
        'Usa i valori predefiniti dei parametri (=) nell\'elenco dei parametri',
        'La console mostra €5.00, $5.00 e £3.142',
      ],
      hints: [
        'function formatPrice(amount, currency = \'€\', decimals = 2) { ... }',
        'Senza un valore predefinito, currency è undefined, e undefined + \'5.00\' dà \'undefined5.00\'.',
      ],
    },
    'js-functions-arrows': {
      title: 'Funzioni freccia',
      explanation: `Le **funzioni freccia** (arrow function) sono un modo più breve di scrivere funzioni, di solito memorizzate in una \`const\`:

\`\`\`js
// function declaration
function add(a, b) {
  return a + b;
}

// the same as an arrow function
const addArrow = (a, b) => {
  return a + b;
};

// body is a single expression? Drop the braces and return: it's returned automatically
const addShort = (a, b) => a + b;

// exactly one parameter? The parentheses are optional
const half = n => n / 2;

console.log(addShort(2, 3), half(10));   // 5 5
\`\`\`

Attenzione: con le graffe serve comunque \`return\`. \`(a, b) => { a + b }\` restituisce \`undefined\`!

Le funzioni freccia danno il meglio come piccoli aiutanti e come callback (presto le passerai ad altre funzioni).
A differenza delle dichiarazioni, non si possono chiamare prima della riga che le definisce.`,
      tasks: [
        'double è una funzione freccia nella forma breve (niente graffe, niente return)',
        'isEven è una funzione freccia',
        'fullName è una funzione freccia',
        'Nessuna parola chiave function rimasta',
        'La console mostra 42 false Ada Lovelace',
      ],
      hints: [
        'const double = (n) => n * 2;',
        'Definisci le funzioni freccia prima della riga console.log che le usa.',
      ],
    },
    'js-functions-scope': {
      title: 'Visibilità (scope)',
      explanation: `Lo **scope** decide dove si può usare una variabile.

- Una variabile dichiarata **fuori** da ogni funzione o blocco è **globale**: si può usare ovunque.
- Una variabile dichiarata **dentro una funzione** è **locale**: esiste solo dentro quella funzione.
- \`let\` e \`const\` hanno **visibilità di blocco**: dichiarate dentro \`{ }\` (un \`if\`, un ciclo…), spariscono alla \`}\`.

\`\`\`js
let score = 0;              // global

function addPoint() {
  score = score + 1;        // no let: changes the global score
  const message = 'Point!'; // local
  return message;
}

addPoint();
console.log(score);         // 1
// console.log(message);    // ReferenceError: message is not defined

if (score > 0) {
  const bonus = 5;          // only exists inside this block
}
\`\`\`

**Shadowing** (oscuramento): dichiarare una variabile con lo *stesso nome* dentro una funzione o un blocco crea una variabile
**nuova** e separata che nasconde quella esterna. Cambiarla lascia intatta la variabile esterna: una fonte di bug molto comune.
Per usare un valore dopo un blocco, dichiaralo **prima** del blocco e assegnalo dentro.`,
      tasks: [
        'Dopo tre chiamate, la variabile globale visits vale 3',
        'addVisit() restituisce il nuovo numero di visite',
        'finalPrice vale 70: dichiara discount prima del blocco if',
        'La console mostra 3 e 70',
        'Non usare var',
      ],
      hints: [
        'In addVisit, scrivi visits = visits + 1; (senza let), poi return visits;',
        'let discount = 0; prima dell\'if, e discount = 10; al suo interno.',
      ],
    },
    'js-functions-challenge': {
      title: 'La cassetta degli attrezzi rotta',
      summary: 'Sei piccole funzioni di aiuto, sei bug subdoli. Trovali e correggili tutti.',
      explanation: `Un collega ha scritto una cassetta degli attrezzi di funzioni di aiuto. *Sembrano* tutte a posto, ma nessuna funziona.
Ecco che cosa dovrebbe fare ognuna:

- \`average(a, b, c)\` restituisce la media di tre numeri: \`average(2, 4, 9)\` fa \`5\`.
- \`isPassing(score)\` restituisce \`true\` quando il punteggio è 60 o più, e \`false\` altrimenti (mai \`undefined\`).
- \`greet(name, greeting)\` restituisce \`'Hello, Ada!'\` per \`greet('Ada')\`, e \`'Hi, Ada!'\` per \`greet('Ada', 'Hi')\`.
- \`sumTo(n)\` restituisce 1 + 2 + … + n: \`sumTo(4)\` fa \`10\`.
- \`shippingCost(total)\` restituisce \`0\` per ordini da 50 in su, e \`4.99\` sotto.
- \`toCelsius(f)\` converte da Fahrenheit a Celsius: \`toCelsius(212)\` fa \`100\`.

Correggi i bug senza rinominare le funzioni. I requisiti sono nascosti: ognuno si rivela quando è superato.
Usa la console per provare le funzioni.`,
      tasks: [
        'average restituisce la media dei suoi tre argomenti',
        'isPassing restituisce true da 60 in su, false sotto',
        'Il greeting di greet vale \'Hello\' di default',
        'sumTo somma ogni numero da 1 a n, n compreso',
        'shippingCost restituisce 0 da 50 in su, 4.99 sotto',
        'toCelsius converte da Fahrenheit a Celsius',
        'Niente var',
      ],
      hints: [
        'Precedenza degli operatori: / viene prima di +. Usa le parentesi.',
        'Una funzione che arriva alla fine senza return restituisce undefined. Anche le funzioni freccia con le graffe hanno bisogno di return.',
        'Un let dichiarato dentro un blocco if sparisce alla graffa di chiusura. Dichiaralo prima dell\'if.',
      ],
    },
  },
  messages: {
    'Declare it as function greet(name) { ... }.': 'Dichiarala come function greet(name) { ... }.',
    'Define a function called greet.': 'Definisci una funzione chiamata greet.',
    "greet('Zoe') should log Hello, Zoe!": 'greet(\'Zoe\') dovrebbe stampare Hello, Zoe!',
    'Call greet three times instead of logging directly.': 'Chiama greet tre volte invece di stampare direttamente.',
    'Keep a single console.log, inside the function.': 'Tieni un solo console.log, dentro la funzione.',
    'total should be 19 (9 + 10). Do both functions return their result?': 'total dovrebbe valere 19 (9 + 10). Entrambe le funzioni restituiscono il loro risultato?',
    'Only log total: square should return its result, not print it.': 'Stampa solo total: square deve restituire il suo risultato, non stamparlo.',
    "Write the defaults in the parentheses: (amount, currency = '€', decimals = 2).":
      'Scrivi i valori predefiniti tra le parentesi: (amount, currency = \'€\', decimals = 2).',
    'Write it as const double = (n) => n * 2;': 'Scrivila come const double = (n) => n * 2;',
    'Write it as const isEven = (n) => ...': 'Scrivila come const isEven = (n) => ...',
    'Write it as const fullName = (first, last) => ...': 'Scrivila come const fullName = (first, last) => ...',
    'Convert every function to an arrow function.': 'Converti ogni funzione in una funzione freccia.',
    'visits should be 3. Inside addVisit, update the global variable instead of declaring a new one with let.':
      'visits dovrebbe valere 3. Dentro addVisit, aggiorna la variabile globale invece di dichiararne una nuova con let.',
    'Called once more, addVisit() should return 4: increase visits, then return it.':
      'Chiamata un\'altra volta, addVisit() dovrebbe restituire 4: aumenta visits, poi restituiscilo.',
    'Declare discount with let before the if (e.g. let discount = 0;), then assign it inside.':
      'Dichiara discount con let prima dell\'if (es. let discount = 0;), poi assegnalo al suo interno.',
    'Fix the scope bug with let, not var.': 'Correggi il bug di visibilità con let, non con var.',
  },
} satisfies ModuleText;
