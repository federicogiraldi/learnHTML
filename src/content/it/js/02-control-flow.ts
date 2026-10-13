import type { ModuleText } from '../../localize';

export default {
  title: 'Controllo del flusso',
  description: 'Prendi decisioni con if, else e switch, confronta i valori nel modo giusto e ripeti il lavoro con i cicli.',
  items: {
    'js-control-if': {
      title: 'if, else if, else',
      explanation: `Finora ogni riga del tuo codice veniva eseguita, dall'alto in basso. Con **\`if\`** il tuo codice può prendere decisioni:

\`\`\`js
const hour = 15;

if (hour < 12) {
  console.log('Good morning');
} else if (hour < 18) {
  console.log('Good afternoon');
} else {
  console.log('Good evening');
}
\`\`\`

- La **condizione** va tra parentesi. Se è vera, viene eseguito il blocco tra \`{ }\`.
- \`else if\` aggiunge un'altra condizione, controllata solo quando quelle sopra erano false.
- \`else\` raccoglie tutto quello che resta. Entrambi sono facoltativi.
- Viene eseguito **un solo** ramo: il primo la cui condizione è vera. Ecco perché l'ordine conta:
  \`hour < 18\` qui sopra non ha bisogno di dire "e almeno 12".`,
      tasks: [
        'Aggiungi un ramo else if per le temperature sotto 20 che imposti advice a \'Take a sweater\'',
        'Aggiungi un ramo else che imposti advice a \'T-shirt weather\'',
        'Con temperature 24, advice vale T-shirt weather',
        'Stampa advice',
      ],
      hints: [
        'Concatena i rami: if (...) { ... } else if (temperature < 20) { ... } else { ... }',
        'Cambia temperature in 5 o 15 ed esegui di nuovo per controllare gli altri rami.',
      ],
    },
    'js-control-comparisons': {
      title: 'Confronti e logica',
      explanation: `Le condizioni si costruiscono con gli operatori di **confronto**, che danno \`true\` o \`false\`:

| Operatore | Significato |
|---|---|
| \`===\` / \`!==\` | uguale / diverso (valore **e** tipo) |
| \`<\` \`>\` \`<=\` \`>=\` | minore, maggiore, minore o uguale, maggiore o uguale |

Usa sempre **\`===\`**. Il \`==\` "largo" converte i tipi prima di confrontare, con risultati sorprendenti:
\`'5' == 5\` è \`true\`, \`0 == ''\` è \`true\`. Con \`===\`, \`'5' === 5\` è \`false\`: prima converti,
poi confronta.

Combina le condizioni con gli operatori **logici**:

\`\`\`js
const age = 25;
const member = false;

console.log(age >= 18 && age < 65);   // true:  && is "and" (both must be true)
console.log(member || age < 12);      // false: || is "or" (at least one true)
console.log(!member);                 // true:  ! is "not"
\`\`\`

Usa le parentesi per rendere chiare le condizioni miste: \`hasTicket && (isAdult || withParent)\`.`,
      tasks: [
        'sameAge confronta age e typedAge con ===, convertendo prima typedAge con Number()',
        'isAdult è true per chiunque abbia 18 anni o più',
        'canEnter è true solo se il visitatore ha un biglietto e non è bandito',
        'La console mostra true true false',
      ],
      hints: [
        'Number(typedAge) trasforma il testo in un numero, poi === confronta due numeri.',
        'canEnter = hasTicket && !isBanned;',
      ],
    },
    'js-control-truthy': {
      title: 'Truthy e falsy',
      explanation: `Una condizione non deve per forza essere un booleano. JavaScript converte qualsiasi valore in true o false. I valori
**falsy** (contano come false) che incontrerai sono:

\`false\`, \`0\`, \`''\` (stringa vuota), \`null\`, \`undefined\`, \`NaN\`

Tutto il resto è **truthy**, compresi \`'0'\`, \`'false'\` e \`' '\` (stringhe non vuote!).

\`\`\`js
const nickname = '';

if (nickname) {
  console.log('Hi, ' + nickname);
} else {
  console.log('No nickname yet');   // '' is falsy
}

const shown = nickname || 'Anonymous';   // || gives the first truthy value
console.log(shown);                      // Anonymous
\`\`\`

\`if (!value)\` è un modo breve per dire "se è vuoto, zero o mancante". Attenzione: tratta come mancante anche \`0\`.
Quando 0 è un valore valido, confronta esplicitamente (\`count === undefined\`) o usa \`??\`, che ripiega solo su
\`null\` e \`undefined\`.`,
      tasks: [
        'displayName ripiega su \'guest\' usando ||',
        'Il saluto dice Hello, guest',
        'Stampa \'Your cart is empty\' usando if (!cartItems)',
        'Stampa Coupon applied: SAVE10 usando if (coupon)',
      ],
      hints: [
        'const displayName = username || \'guest\';',
        '!cartItems è true quando cartItems è 0, perché 0 è falsy.',
      ],
    },
    'js-control-switch': {
      title: 'switch',
      explanation: `Quando confronti **un valore** con tanti valori possibili, \`switch\` si legge meglio di una lunga catena di
\`else if\`:

\`\`\`js
const light = 'yellow';

switch (light) {
  case 'green':
    console.log('Go');
    break;
  case 'yellow':
  case 'orange':          // several cases can share the same code
    console.log('Slow down');
    break;
  default:                // when no case matches
    console.log('Stop');
}
\`\`\`

- \`switch\` confronta con \`===\`.
- **\`break\`** chiude lo switch. Senza, l'esecuzione *scivola* nel codice del case successivo,
  anche se quel case non corrisponde! Un bug classico.
- \`default\` è facoltativo e di solito va per ultimo.`,
      tasks: [
        'Aggiungi un case default che imposti dayType a \'unknown\'',
        'Per \'sat\', dayType vale ancora weekend (attento allo "scivolamento"!)',
        'Stampa dayType',
      ],
      hints: [
        'default:\n    dayType = \'unknown\';',
        'Il case del weekend ha bisogno di un break; prima di default, altrimenti \'sat\' esegue anche il codice di default.',
      ],
    },
    'js-control-loops': {
      title: 'Cicli for e while',
      explanation: `I cicli ripetono il codice. Il ciclo **\`for\`** è perfetto quando sai quante volte:

\`\`\`js
for (let i = 1; i <= 3; i++) {
  console.log('Lap', i);
}
// Lap 1, Lap 2, Lap 3
\`\`\`

Le tre parti: **inizio** (\`let i = 1\`), **condizione** controllata prima di ogni giro (\`i <= 3\`),
e **aggiornamento** dopo ogni giro (\`i++\`).

Un ciclo **\`while\`** si ripete finché la sua condizione è vera: comodo quando non sai in anticipo quante volte:

\`\`\`js
let balance = 100;
let years = 0;
while (balance < 200) {
  balance = balance * 1.1;
  years++;
}
console.log(years);   // 8
\`\`\`

Assicurati che prima o poi la condizione diventi falsa, altrimenti il ciclo non finisce mai (LearnWeb lo ferma dopo qualche
secondo).`,
      tasks: [
        'Stampa 5, 4, 3, 2, 1 e poi Liftoff!',
        'total vale 5050, calcolato con un ciclo for',
        'amount arriva a 1024 dopo 10 passi, usando un ciclo while',
      ],
      hints: [
        'Conto alla rovescia: for (let i = 5; i >= 1; i--) { ... } e stampa Liftoff! dopo il ciclo.',
        'for (let i = 1; i <= 100; i++) { total += i; }',
        'while (amount < 1000) { amount = amount * 2; steps++; }',
      ],
    },
    'js-control-for-of': {
      title: 'for...of, break e continue',
      explanation: `Un **array** è un elenco di valori tra parentesi quadre: \`[18, 21, 31]\` (degli array parleremo di più nei prossimi
moduli). **\`for...of\`** visita un elemento alla volta, senza bisogno di un contatore:

\`\`\`js
const prices = [4, 12, 7];
for (const price of prices) {
  console.log(price);
}
\`\`\`

Due parole chiave controllano qualsiasi ciclo dall'interno:

- **\`continue\`** salta il resto di questo giro e passa all'elemento successivo.
- **\`break\`** esce subito dal ciclo.

\`\`\`js
for (const price of prices) {
  if (price > 10) continue;   // skip expensive items
  console.log('Cheap:', price);
}
\`\`\``,
      tasks: [
        'sum vale 146: cicla con for...of e salta -999 con continue',
        'firstHot vale 31: ferma il ciclo con break appena lo trovi',
        'Non usare var',
      ],
      hints: [
        'for (const t of temps) { if (t === -999) continue; sum += t; }',
        'Metti break; subito dopo firstHot = t;',
      ],
    },
    'js-control-challenge': {
      title: 'FizzBuzz con il tabellone',
      summary: 'Il classico FizzBuzz, più il conteggio di ogni Fizz, Buzz e FizzBuzz.',
      explanation: `Il riscaldamento più famoso della programmazione. Per ogni numero da **1** a \`limit\` (20), stampa una riga:

- \`FizzBuzz\` se il numero è divisibile sia per 3 sia per 5,
- \`Fizz\` se è divisibile per 3,
- \`Buzz\` se è divisibile per 5,
- altrimenti il numero stesso.

Poi stampa una riga di riepilogo che conta quanti ne hai stampati di ogni tipo:

\`\`\`
1
2
Fizz
4
Buzz
…
19
Buzz
Fizz: 5, Buzz: 3, FizzBuzz: 1
\`\`\`

"Divisibile per 3" significa che il resto è zero: \`n % 3 === 0\`. Usa un ciclo e if/else (o switch), conta con le
tre variabili già dichiarate, e non stampare nient'altro.`,
      tasks: [
        'Le righe da 1 a 20 sono stampate in ordine',
        'La riga di riepilogo dice Fizz: 5, Buzz: 3, FizzBuzz: 1',
        'I contatori hanno i numeri giusti',
        'Sono stampate esattamente 21 righe',
        'Usa un ciclo, l\'operatore % e le condizioni',
        'Niente var',
      ],
      hints: [
        'for (let n = 1; n <= limit; n++) { ... }',
        'Controlla prima n % 15 === 0 (o n % 3 === 0 && n % 5 === 0), altrimenti 15 stampa Fizz.',
        'Aumenta il contatore giusto in ogni ramo, poi dopo il ciclo: console.log(`Fizz: ${fizzCount}, ...`).',
      ],
    },
  },
  messages: {
    'Add an else if (...) { ... } branch after the first if.': 'Aggiungi un ramo else if (...) { ... } dopo il primo if.',
    'The else if condition should check temperature < 20.': 'La condizione dell\'else if deve controllare temperature < 20.',
    'Add a final else { ... } branch.': 'Aggiungi un ramo finale else { ... }.',
    'Keep the console.log(advice) after the if/else.': 'Mantieni il console.log(advice) dopo l\'if/else.',
    'Replace == with ===.': 'Sostituisci == con ===.',
    'Convert typedAge with Number(typedAge) before comparing.': 'Converti typedAge con Number(typedAge) prima di confrontare.',
    'Use >= so that 18 counts as adult.': 'Usa >= così 18 conta come maggiorenne.',
    'Both things must be true: use && (and), not ||.': 'Devono essere vere entrambe le cose: usa && (e), non ||.',
    'This visitor is banned, so canEnter should be false.': 'Questo visitatore è bandito, quindi canEnter deve essere false.',
    "Use username || 'guest'.": 'Usa username || \'guest\'.',
    'Write the condition as if (!cartItems).': 'Scrivi la condizione come if (!cartItems).',
    'Use the string itself as the condition: if (coupon).': 'Usa la stringa stessa come condizione: if (coupon).',
    'Log the coupon with a template string: `Coupon applied: ${coupon}`.': 'Stampa il coupon con una template string: `Coupon applied: ${coupon}`.',
    'Add default: at the end of the switch.': 'Aggiungi default: alla fine dello switch.',
    'Keep the switch.': 'Mantieni lo switch.',
    "dayType should be 'weekend'. Did the weekend case fall through into default? Add break.":
      'dayType deve valere \'weekend\'. Il case del weekend è scivolato nel default? Aggiungi break.',
    'Make the loop count down: start at 5 and use i--.': 'Fai contare il ciclo alla rovescia: parti da 5 e usa i--.',
    'Add to total inside a loop: total += i;': 'Aggiungi a total dentro un ciclo: total += i;',
    'Use a second for loop for the sum.': 'Usa un secondo ciclo for per la somma.',
    'Use a while loop.': 'Usa un ciclo while.',
    'Use a for...of loop.': 'Usa un ciclo for...of.',
    'Skip the broken reading with continue.': 'Salta la lettura rotta con continue.',
    'Leave the loop with break as soon as you find a hot temperature.': 'Esci dal ciclo con break appena trovi una temperatura alta.',
    'firstHot should be the first hot value (31), not the last one.': 'firstHot deve essere il primo valore alto (31), non l\'ultimo.',
    'Print one line per number from 1 to 20. Check 15 first: it is divisible by 3, 5 and 15!':
      'Stampa una riga per ogni numero da 1 a 20. Controlla prima il 15: è divisibile per 3, per 5 e per 15!',
    'Use a for or while loop.': 'Usa un ciclo for o while.',
    'Use % to test divisibility.': 'Usa % per verificare la divisibilità.',
    'Use if / else if / else (or switch) to pick the word.': 'Usa if / else if / else (o switch) per scegliere la parola.',
  },
} satisfies ModuleText;
