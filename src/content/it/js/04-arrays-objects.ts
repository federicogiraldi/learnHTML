import type { ModuleText } from '../../localize';

export default {
  title: 'Array e oggetti',
  description: 'Memorizza elenchi e schede, trasformali con map, filter e reduce, e spacchettali con destrutturazione e spread.',
  items: {
    'js-data-arrays': {
      title: 'Array',
      explanation: `Un **array** è un elenco ordinato di valori, scritto tra parentesi quadre:

\`\`\`js
const colors = ['red', 'green', 'blue'];

console.log(colors[0]);                  // red   — positions (indexes) start at 0
console.log(colors.length);              // 3
console.log(colors[colors.length - 1]);  // blue  — the last item
console.log(colors[5]);                  // undefined — no item there
\`\`\`

Gli array si modificano con i metodi:

\`\`\`js
const colors = ['red', 'green'];
colors.push('blue');      // add at the end   → ['red', 'green', 'blue']
const last = colors.pop(); // remove the last → 'blue' (returned), array is ['red', 'green']
console.log(colors.includes('red'));  // true  — is the value in the array?
console.log(colors.indexOf('green')); // 1     — where is it? (-1 if missing)
\`\`\`

Un array \`const\` si può comunque modificare con \`push\` o \`pop\`: \`const\` ti impedisce solo di far puntare il nome
a un array *diverso*.`,
      tasks: [
        'Stampa la prima canzone (Intro) usando il suo indice',
        'Togli \'Oops\' con pop() e aggiungi \'Finale\' con push()',
        'Dichiara songCount con il numero di canzoni, usando .length',
        'Dichiara hasBlue: se la playlist contiene \'Blue\' (usa includes)',
        'Stampa l\'ultima canzone usando playlist.length - 1',
      ],
      hints: [
        'playlist.pop(); toglie l\'ultimo elemento, playlist.push(\'Finale\'); ne aggiunge uno in fondo.',
        'Metti songCount e la stampa dell\'ultima canzone dopo pop e push, così vedono la playlist finale.',
        'const hasBlue = playlist.includes(\'Blue\');',
      ],
    },
    'js-data-map-filter': {
      title: 'map, filter e find',
      explanation: `Gran parte del lavoro con gli array è "fai qualcosa con ogni elemento". Invece di scrivere cicli, gli array hanno metodi
che ricevono una **funzione** e la chiamano per ogni elemento:

\`\`\`js
const nums = [1, 2, 3, 4, 5];

const doubled = nums.map((n) => n * 2);         // [2, 4, 6, 8, 10]  — transform every item
const evens = nums.filter((n) => n % 2 === 0);  // [2, 4]            — keep items where the function returns true
const firstBig = nums.find((n) => n > 3);       // 4                 — the first match (undefined if none)

console.log(doubled, evens, firstBig);
\`\`\`

- \`map\` restituisce sempre un **nuovo array della stessa lunghezza**.
- \`filter\` restituisce un nuovo array con **alcuni** degli elementi (magari nessuno).
- \`find\` restituisce **un elemento**, non un array.
- Nessuno di loro cambia l'array originale.

Puoi concatenarli: \`nums.filter((n) => n > 2).map((n) => n * 10)\` dà \`[30, 40, 50]\`.`,
      tasks: [
        'withShipping è ogni prezzo più 5, costruito con map()',
        'cheap contiene i prezzi sotto 20, usando filter()',
        'firstBig è il primo prezzo sopra 40, usando find()',
        'Stampa cheap',
        'prices non è cambiato',
      ],
      hints: [
        'const withShipping = prices.map((p) => p + 5);',
        'filter tiene un elemento quando la sua funzione restituisce true: prices.filter((p) => p < 20).',
        'find restituisce l\'elemento stesso: prices.find((p) => p > 40).',
      ],
    },
    'js-data-reduce-sort': {
      title: 'reduce e sort',
      explanation: `\`reduce\` riduce un array a **un solo valore**. La sua funzione riceve il risultato parziale (l'*accumulatore*) e
l'elemento corrente, e restituisce il nuovo risultato parziale. Il secondo argomento è il valore di partenza:

\`\`\`js
const nums = [5, 10, 20];
const total = nums.reduce((sum, n) => sum + n, 0);   // 0+5 → 5+10 → 15+20 → 35
console.log(total);
\`\`\`

\`sort\` mette gli elementi in ordine, con due trappole:

\`\`\`js
const nums = [10, 9, 100, 1];
console.log([...nums].sort());                  // [1, 10, 100, 9] — compared as text!
console.log([...nums].sort((a, b) => a - b));   // [1, 9, 10, 100] — smallest first
console.log([...nums].sort((a, b) => b - a));   // [100, 10, 9, 1] — largest first
\`\`\`

1. Senza una **funzione di confronto**, \`sort\` confronta gli elementi come stringhe. Per i numeri, passa \`(a, b) => a - b\`:
   un risultato negativo mette prima \`a\`, uno positivo mette prima \`b\`.
2. \`sort\` **cambia l'array originale**. Per conservarlo, ordina una copia: \`[...nums].sort(...)\`
   (i \`...\` la copiano, ne parliamo a breve), oppure usa \`nums.toSorted(...)\`, che restituisce un nuovo array.`,
      tasks: [
        'Calcola total (339) con reduce()',
        'Dichiara average come total diviso il numero di punteggi (67.8)',
        'ranked contiene i punteggi dal più alto al più basso, usando una funzione di confronto',
        'scores mantiene il suo ordine originale (non ordinarlo sul posto)',
        'Stampa ranked',
      ],
      hints: [
        'const total = scores.reduce((sum, s) => sum + s, 0);',
        'b - a ordina dal più grande: [...scores].sort((a, b) => b - a)',
      ],
    },
    'js-data-objects': {
      title: 'Oggetti',
      explanation: `Un **oggetto** raggruppa valori collegati sotto dei nomi (le sue *proprietà*), tra parentesi graffe:

\`\`\`js
const user = {
  name: 'Ada',
  age: 36,
  languages: ['en', 'fr'],          // values can be arrays…
  address: { city: 'London' },      // …or other objects
};

console.log(user.name);              // Ada      — dot notation
console.log(user['age']);            // 36       — bracket notation, with a string
console.log(user.address.city);      // London   — nested data
console.log(user.languages[1]);      // fr

user.email = 'ada@example.com';      // add (or change) a property
\`\`\`

Usa le **parentesi quadre** quando il nome della proprietà sta in una variabile: \`const key = 'age'; user[key]\` vale 36
(\`user.key\` cercherebbe una proprietà che si chiama proprio "key").

I dati veri spesso sono un **array di oggetti**, che si sposa bene con \`map\` e \`filter\`:

\`\`\`js
const users = [{ name: 'Ada', age: 36 }, { name: 'Linus', age: 54 }];
console.log(users.map((u) => u.name));   // ['Ada', 'Linus']
\`\`\`

Per scorrere le proprietà di un oggetto: \`Object.keys(obj)\` dà i nomi, \`Object.values(obj)\` i valori
e \`Object.entries(obj)\` le coppie \`[nome, valore]\`.`,
      tasks: [
        'Stampa l\'autore del libro con la notazione a punto',
        'Dopo l\'oggetto, aggiungi una proprietà pages uguale a 412',
        'Dichiara value come la proprietà del libro indicata da field, usando le parentesi quadre',
        'Stampa il secondo tag del libro (classic) dall\'array annidato',
        'Dichiara titles: un array con tutti i titoli di library, usando map',
      ],
      hints: [
        'book.pages = 412; funziona anche se book è una const: cambi l\'oggetto, non la variabile.',
        'book.field cercherebbe una proprietà chiamata "field". Usa invece book[field].',
        'const titles = library.map((b) => b.title);',
      ],
    },
    'js-data-destructuring': {
      title: 'Destrutturazione',
      explanation: `La **destrutturazione** estrae in una riga sola i valori da array e oggetti e li mette in variabili.

\`\`\`js
const user = { name: 'Ada', age: 36, address: { city: 'London' } };

const { name, age } = user;               // same as: const name = user.name; const age = user.age;
const { city: town } = user.address;     // take city, but call the variable town
const { country = 'UK' } = user;         // a default when the property is missing

const rgb = [255, 128, 0];
const [red, green] = rgb;                 // arrays go by position: red = 255, green = 128

console.log(name, age, town, country, red, green);
\`\`\`

Funziona anche nei **parametri delle funzioni**, e rende facili da leggere gli "oggetti di opzioni":

\`\`\`js
function greet({ name, age }) {
  return \`Hi \${name}, you are \${age}\`;
}
console.log(greet({ name: 'Ada', age: 36 }));
\`\`\``,
      tasks: [
        'Prendi name ed email da user con la destrutturazione di oggetti',
        'Prendi x e y da point con la destrutturazione di array',
        'Dichiara town (London) destrutturando city da user.address e rinominandola',
        'describe destruttura { name, age } direttamente nel suo parametro',
      ],
      hints: [
        'La destrutturazione di oggetti usa i nomi delle proprietà: const { name, email } = user;',
        'Dentro describe, usa direttamente name e age: function describe({ name, age }) { ... }',
      ],
    },
    'js-data-spread-rest': {
      title: 'Spread e rest',
      explanation: `I tre puntini \`...\` **sparpagliano** (spread) un array o un oggetto nei suoi elementi:

\`\`\`js
const a = [1, 2];
const b = [3, 4];
const both = [...a, ...b, 5];      // [1, 2, 3, 4, 5]
const copy = [...a];               // a new array with the same items
console.log(Math.max(...both));    // 5 — like Math.max(1, 2, 3, 4, 5)

const base = { size: 'M', color: 'red' };
const shirt = { ...base, color: 'blue' };   // { size: 'M', color: 'blue' } — later properties win
console.log(both, copy, shirt);
\`\`\`

Perché copiare? Assegnare un array o un oggetto **non lo copia**: \`const c = a;\` dà allo *stesso* array un secondo
nome, quindi \`c.push(9)\` cambia anche \`a\`.

Nei parametri di una funzione, \`...\` fa il contrario: **raccoglie** il resto degli argomenti in un array (rest).

\`\`\`js
function average(...nums) {
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}
console.log(average(2, 4, 9));   // 5
\`\`\``,
      tasks: [
        'basket unisce fruits e veggies usando lo spread',
        'fruitsCopy è una vera copia: dopo il push, fruits è ancora apple e pear',
        'settings unisce defaults e userPrefs (theme dark, il resto da defaults)',
        'sum accetta un numero qualsiasi di argomenti con un parametro rest',
      ],
      hints: [
        'const basket = [...fruits, ...veggies];  e  const fruitsCopy = [...fruits];',
        'Quando unisci, l\'ordine conta: { ...defaults, ...userPrefs } fa vincere userPrefs.',
        'function sum(...numbers) { return numbers.reduce((s, n) => s + n, 0); }',
      ],
    },
    'js-data-challenge': {
      title: 'Report del negozio',
      summary: 'Elabora gli ordini di un negozio online e ottieni totali, un prodotto più venduto e un report ordinato.',
      explanation: `Gestisci un piccolo negozio online che vende accessori per computer. Gli ordini sono in un array di oggetti; trasformali in un report.

1. Scrivi una funzione **\`orderTotal(order)\`** che restituisce \`price * qty\` per un ordine.
2. Dichiara **\`revenue\`**: il totale di tutti gli ordini, calcolato con \`reduce\` (fa 461).
3. Scrivi una funzione **\`totalsByCustomer(orders)\`** che restituisce un oggetto con quanto ha speso ogni cliente,
   es. \`{ Ada: 248, Linus: 58, Grace: 155 }\`. Deve funzionare con qualsiasi elenco di ordini.
4. Dichiara **\`topProduct\`**: il nome del prodotto che ha venduto più **unità** (somma \`qty\` per prodotto).
5. Stampa una riga per cliente, **dal cliente che ha speso di più**, con due decimali:

\`\`\`
Ada: €248.00
Grace: €155.00
Linus: €58.00
\`\`\`

Non cambiare l'array \`orders\`. \`Object.entries(obj)\` trasforma un oggetto in coppie \`[chiave, valore]\` che puoi ordinare.`,
      tasks: [
        'orderTotal(order) restituisce price × qty',
        'revenue è il totale di tutti gli ordini (461), usando reduce',
        'totalsByCustomer(orders) restituisce quanto ha speso ogni cliente',
        'topProduct è il prodotto con più unità vendute (\'Cable\', 6 unità)',
        'Il report elenca i clienti da chi ha speso di più a chi ha speso di meno',
        'Il report è ordinato con sort() e una funzione di confronto, e orders resta invariato',
        'Niente var',
      ],
      hints: [
        'revenue: orders.reduce((sum, o) => sum + orderTotal(o), 0)',
        'totalsByCustomer: fai partire reduce da {} e somma a totals[o.customer] (all\'inizio è undefined, quindi usa (totals[o.customer] ?? 0) + ...).',
        'Per il report: Object.entries(totals) dà [["Ada", 248], ...]. Ordina con (a, b) => b[1] - a[1], poi stampa ogni coppia.',
      ],
    },
  },
  messages: {
    'Log playlist[0] — indexes start at 0.': 'Stampa playlist[0]: gli indici partono da 0.',
    'Read the first song with playlist[0].': 'Leggi la prima canzone con playlist[0].',
    'Set songCount = playlist.length.': 'Imposta songCount = playlist.length.',
    'Read the last song with playlist[playlist.length - 1].': 'Leggi l\'ultima canzone con playlist[playlist.length - 1].',
    'Log the cheap array: console.log(cheap);': 'Stampa l\'array cheap: console.log(cheap);',
    'Divide by scores.length, not a typed-in 5.': 'Dividi per scores.length, non per un 5 scritto a mano.',
    'Pass a compare function to sort, like (a, b) => b - a.': 'Passa a sort una funzione di confronto, tipo (a, b) => b - a.',
    'scores was changed: sort a copy ([...scores].sort(...)) or use toSorted.': 'scores è stato cambiato: ordina una copia ([...scores].sort(...)) o usa toSorted.',
    'Use book.author.': 'Usa book.author.',
    'book.pages should be 412.': 'book.pages dovrebbe valere 412.',
    'Add it with an assignment: book.pages = 412;': 'Aggiungila con un\'assegnazione: book.pages = 412;',
    'Use book[field].': 'Usa book[field].',
    'Use book.tags[1].': 'Usa book.tags[1].',
    'Write const { name, email } = user;': 'Scrivi const { name, email } = user;',
    'Write const [x, y] = point;': 'Scrivi const [x, y] = point;',
    'Rename while destructuring: const { city: town } = user.address;': 'Rinomina mentre destrutturi: const { city: town } = user.address;',
    'Write the parameter as { name, age }.': 'Scrivi il parametro come { name, age }.',
    'Build basket with [...fruits, ...veggies].': 'Costruisci basket con [...fruits, ...veggies].',
    'fruits changed too: fruitsCopy is the same array. Copy it with [...fruits].': 'È cambiato anche fruits: fruitsCopy è lo stesso array. Copialo con [...fruits].',
    "defaults shouldn't change: spread both into a new object.": 'defaults non deve cambiare: fai lo spread di entrambi in un nuovo oggetto.',
    'Use { ...defaults, ...userPrefs }.': 'Usa { ...defaults, ...userPrefs }.',
    'Write the parameter as ...numbers.': 'Scrivi il parametro come ...numbers.',
    'Sort the customers with a compare function.': 'Ordina i clienti con una funzione di confronto.',
    'The orders array was changed: work on copies.': 'L\'array orders è stato cambiato: lavora su delle copie.',
  },
} satisfies ModuleText;
