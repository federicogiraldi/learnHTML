import type { ModuleText } from '../../localize';

export default {
  title: 'JavaScript avanzato',
  description: 'Closure, funzioni di ordine superiore, debounce, event delegation e Map/Set; poi costruisci un\'app di to-do completa.',
  items: {
    'js-advanced-closures': {
      title: 'Closure',
      explanation: `Una funzione **ricorda le variabili che la circondano** nel punto in cui è stata creata, anche dopo che la funzione
esterna ha finito. Questa è una **closure**.

\`\`\`js
function createGreeter(greeting) {
  return (name) => \`\${greeting}, \${name}!\`;   // uses greeting from the outer function
}

const hello = createGreeter('Hello');
const ciao = createGreeter('Ciao');
console.log(hello('Ada'));   // Hello, Ada!
console.log(ciao('Ada'));    // Ciao, Ada!
\`\`\`

Ogni chiamata di \`createGreeter\` crea una **nuova** variabile \`greeting\`, quindi \`hello\` e \`ciao\` non si disturbano.

Le closure ti danno uno **stato privato**: una variabile che solo le funzioni restituite possono raggiungere.

\`\`\`js
function createWallet() {
  let balance = 0;   // nobody outside can touch this directly
  return {
    deposit: (amount) => (balance += amount),
    balance: () => balance,
  };
}

const wallet = createWallet();
wallet.deposit(5);
console.log(wallet.balance());   // 5
console.log(wallet.amount);      // undefined: the variable is hidden
\`\`\`

Confrontala con una variabile globale: qualsiasi codice, ovunque, potrebbe cambiarla, e ce ne può essere una sola.`,
      tasks: [
        'Definisci una funzione createCounter(start) (start vale 0 di default)',
        'Restituisce un oggetto con increment(), decrement() e value(); increment e decrement restituiscono il nuovo valore',
        'Ogni contatore ha il suo conteggio, tenuto privato in una closure',
        'Crea un contatore chiamato clicks, incrementalo 3 volte e stampa clicks.value()',
      ],
      hints: [
        'Dentro createCounter, dichiara let count = start; e restituisci un oggetto di funzioni freccia che usano count.',
        'increment: () => ++count restituisce il nuovo valore (count++ restituirebbe quello vecchio).',
      ],
    },
    'js-advanced-higher-order': {
      title: 'Funzioni di ordine superiore',
      explanation: `In JavaScript le funzioni sono valori: puoi passarle ad altre funzioni e restituirle. Una funzione che riceve o
restituisce una funzione è una **funzione di ordine superiore**. Ne usi già alcune: \`map\`, \`filter\`,
\`addEventListener\`.

Scriverne di tue mostra che non c'è nessuna magia:

\`\`\`js
function repeat(times, fn) {
  for (let i = 0; i < times; i++) fn(i);   // call the function we were given
}
repeat(3, (i) => console.log('Round', i));
\`\`\`

Una funzione può anche **costruire e restituire** una nuova funzione:

\`\`\`js
function multiplier(factor) {
  return (x) => x * factor;
}
const triple = multiplier(3);
console.log(triple(5));   // 15
\`\`\`

**Comporre** concatena piccole funzioni in una più grande: l'output di ognuna diventa l'input della successiva.
\`reduce\` è perfetto per questo:

\`\`\`js
const steps = [(x) => x + 1, (x) => x * 2];
console.log(steps.reduce((value, fn) => fn(value), 5));   // (5 + 1) * 2 = 12
\`\`\`

Il **parametro rest** \`...fns\` raccoglie in un array un numero qualsiasi di argomenti: \`function pipe(...fns)\`.`,
      tasks: [
        'myMap(array, fn) restituisce un nuovo array con fn(item, index) per ogni elemento, senza usare .map()',
        'twice(fn) restituisce una nuova funzione: twice((x) => x + 3)(10) fa 16',
        'pipe(...fns) restituisce una funzione che applica le funzioni da sinistra a destra: pipe((x) => x + 1, (x) => x * 2)(5) fa 12',
        'Costruisci shout = pipe(trim, maiuscolo, aggiungi \'!\') e stampa shout(\'  hello  \') → HELLO!',
      ],
      hints: [
        'myMap: const result = []; cicla con for (let i = 0; i < array.length; i++) e fai push di fn(array[i], i).',
        'twice: return (x) => fn(fn(x));',
        'pipe: return (x) => fns.reduce((value, fn) => fn(value), x);',
      ],
    },
    'js-advanced-debounce': {
      title: 'Debounce',
      explanation: `Alcuni eventi scattano **tantissimo**: \`input\` a ogni tasto, \`scroll\` e \`resize\` decine di volte al secondo.
Se ognuno fa partire un lavoro costoso, tipo una richiesta a un server, la pagina rallenta e il server si intasa.

Il **debounce** aspetta che gli eventi si *fermino* per un attimo, poi esegue il lavoro **una volta sola**, con i valori più
recenti. Si costruisce con cose che conosci già: una closure che ricorda un timer, \`setTimeout\` e \`clearTimeout\`.

\`\`\`js
function debounce(fn, ms) {
  let timer;                        // private, thanks to the closure
  return (...args) => {
    clearTimeout(timer);            // cancel the previous plan…
    timer = setTimeout(() => fn(...args), ms);   // …and make a new one
  };
}

const save = debounce((text) => console.log('Saving', text), 500);
save('H');
save('He');
save('Hello');   // only this one runs, 500ms after the last call
\`\`\`

\`debounce\` è una funzione di ordine superiore: riceve una funzione e ne restituisce una versione nuova e "più calma".
\`...args\` passa avanti qualsiasi argomento abbia dato chi la chiama.

La casella di ricerca a destra invia una "richiesta" a ogni tasto. Applicale il debounce.`,
      tasks: [
        'Definisci una funzione debounce(fn, ms)',
        'Chiamare tante volte di fila la funzione con debounce esegue fn una volta sola, dopo ms',
        'La funzione con debounce passa a fn gli argomenti più recenti',
        'Scrivere "pizza" velocemente invia una sola ricerca, 300ms dopo l\'ultimo tasto',
      ],
      hints: [
        'Dentro debounce: let timer; poi return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };',
        'Crea la versione con debounce una volta sola, fuori dal gestore: const debouncedSearch = debounce(runSearch, 300);',
        'Poi il gestore la chiama: input.addEventListener(\'input\', () => debouncedSearch(input.value));',
      ],
    },
    'js-advanced-delegation': {
      title: 'Event delegation',
      explanation: `Aggiungere un gestore a ogni elemento di un elenco ha due problemi: è uno spreco, e **gli elementi aggiunti dopo non hanno
nessun gestore**.

Gli eventi **risalgono** (bubbling): un clic su un pulsante scatta anche sul suo \`<li>\`, poi sull'\`<ul>\`, fino al documento.
Quindi puoi mettere **un solo** gestore sull'elenco e capire che cosa è stato cliccato da \`event.target\`:

\`\`\`js
const menu = document.querySelector('#menu');

menu.addEventListener('click', (event) => {
  const item = event.target.closest('li');   // the <li> that contains the click, or null
  if (!item) return;                         // clicked the list itself, between items

  if (event.target.closest('.delete')) {
    item.remove();
  } else {
    console.log('You picked', item.textContent);
  }
});
\`\`\`

- \`event.target\` è l'elemento **più interno** cliccato: magari uno \`<span>\` o un'icona dentro il tuo pulsante.
- \`element.closest(selettore)\` risale a partire dall'elemento (lui compreso) e restituisce il primo che corrisponde,
  oppure \`null\`. Ecco perché è meglio che controllare \`event.target.tagName\`.

Questa è la **event delegation**: un solo gestore, su un genitore che esiste sempre, gestisce ogni figlio, anche quelli futuri.

A destra, i pulsanti per togliere funzionano solo per gli elementi che c'erano all'inizio nella pagina. Sistemalo.`,
      tasks: [
        'Cliccare il pulsante ✕ di un elemento lo toglie',
        'Il pulsante ✕ funziona anche sugli elementi aggiunti dopo',
        'Cliccare un elemento (non il suo pulsante) attiva/disattiva la classe done sul <li>',
        'Usa un solo gestore su #list con event.target.closest() invece di un gestore per ogni pulsante',
      ],
      hints: [
        'list.addEventListener(\'click\', (event) => { const item = event.target.closest(\'li\'); … });',
        'Al suo interno: if (event.target.closest(\'.remove\')) item.remove(); altrimenti item.classList.toggle(\'done\');',
        'Non dimenticare di uscire subito quando item è null.',
      ],
    },
    'js-advanced-map-set': {
      title: 'Map e Set',
      explanation: `Array e oggetti semplici coprono la maggior parte delle esigenze, ma due strutture integrate rendono alcuni lavori molto più semplici.

Un **Set** contiene valori **unici**: aggiungere due volte un valore ne tiene una sola copia.

\`\`\`js
const tags = new Set(['js', 'css', 'js']);
tags.add('html');
console.log(tags.size);         // 3
console.log(tags.has('css'));   // true
console.log([...tags]);         // ['js', 'css', 'html'] — spread it back into an array
\`\`\`

Una **Map** memorizza coppie **chiave → valore**, come un oggetto, ma le chiavi possono essere qualsiasi cosa (numeri, oggetti…),
ricorda l'ordine di inserimento e ha un'API comoda:

\`\`\`js
const stock = new Map();
stock.set('apples', 4);
stock.set('pears', 0);
stock.set('apples', stock.get('apples') + 1);

console.log(stock.get('apples'));   // 5
console.log(stock.get('kiwis'));    // undefined: no such key
console.log(stock.size);            // 2
for (const [fruit, n] of stock) console.log(fruit, n);
\`\`\`

Un uso classico è **contare**: \`counts.set(key, (counts.get(key) ?? 0) + 1)\`: \`??\` dà 0 la prima volta che compare una chiave.`,
      tasks: [
        'Riscrivi unique(array) con un Set: unique([3, 1, 3, 2, 1]) restituisce [3, 1, 2]',
        'hasDuplicates(array) restituisce true se un valore compare due volte (confronta la size di un Set con la lunghezza)',
        'countWords(text) restituisce una Map da ogni parola in minuscolo al numero di volte in cui compare',
        'Conta le parole di sentence e stampa quante volte compare \'the\' (con .get())',
      ],
      hints: [
        'unique: return [...new Set(array)];',
        'hasDuplicates: return new Set(array).size !== array.length;',
        'countWords: const counts = new Map(); for (const word of text.toLowerCase().split(/\\s+/)) { if (word) counts.set(word, (counts.get(word) ?? 0) + 1); } return counts;',
      ],
    },
    'js-advanced-challenge': {
      title: 'Progetto finale: app di to-do',
      summary: 'Tutto insieme: un\'app di to-do completa con filtri, contatore e dati salvati.',
      explanation: `Il progetto finale: un'**app di to-do** completa. HTML e CSS sono pronti: scrivi \`script.js\`.

**La pagina** (non rinominare questi elementi, le verifiche si basano su di loro):

| Elemento | Che cos'è |
|---|---|
| \`#todo-form\` con \`#todo-input\` | il form per aggiungere un compito |
| \`#todo-list\` | l'\`<ul>\` in cui disegni i compiti |
| \`.filters\` con \`button[data-filter]\` | i filtri: \`data-filter\` vale \`all\`, \`active\` o \`completed\` |
| \`#todo-count\` | il contatore dei compiti rimasti |

Disegna ogni compito così (il CSS gli dà già lo stile):

\`\`\`html
<li class="todo done" data-id="2">
  <input type="checkbox" class="toggle" checked>
  <span class="todo-text">Read a book</span>
  <button type="button" class="delete" aria-label="Delete">✕</button>
</li>
\`\`\`

**I dati.** Tieni i compiti in un array, salvato in localStorage sotto la chiave **\`todos\`** come JSON:
\`[{ "id": 1, "text": "Buy milk", "done": false }, …]\`: \`id\` è un numero unico, \`text\` una stringa,
\`done\` un booleano. Due compiti sono già salvati: caricali all'avvio della pagina.

Requisiti:
- **Aggiungi** un compito inviando il form: niente ricaricamento della pagina, ignora testo vuoto o fatto solo di spazi,
  togli gli spazi in eccesso, svuota l'input.
- Cliccare la checkbox di un compito lo **attiva/disattiva**: il \`<li>\` riceve la classe \`done\` quando è completato.
- Cliccare ✕ **cancella** il compito.
- I pulsanti dei **filtri** mostrano Tutti / solo Attivi (non fatti) / solo Completati: disegna solo quelli che corrispondono,
  e il pulsante del filtro attuale ha la classe \`active\` (e solo lui).
- \`#todo-count\` dice \`1 item left\` o \`N items left\`, contando i compiti non fatti.
- Ogni modifica viene **salvata** in localStorage, e i compiti salvati vengono **caricati** all'avvio.

Consigli: tieni un'unica fonte di verità (l'array) e una funzione \`render()\` che ricostruisce l'elenco a partire da lei. Usa la
**event delegation**: un solo gestore su \`#todo-list\` gestisce attivazione e cancellazione per ogni compito, anche quelli nuovi.
Metti il testo dell'utente nella pagina con \`textContent\`, mai con \`innerHTML\`.`,
      tasks: [
        'I compiti salvati vengono caricati e disegnati all\'avvio (con quelli fatti segnati)',
        'Il contatore mostra 1 item left',
        'Inviare il form aggiunge il compito, svuota l\'input e aggiorna il contatore',
        'Un input vuoto o fatto solo di spazi viene ignorato',
        'Cliccare una checkbox attiva/disattiva il compito: la classe done e il contatore si aggiornano',
        'Cliccare ✕ cancella il compito',
        'Il filtro Active mostra solo i compiti non fatti ed è segnato come attivo',
        'Funzionano anche i filtri Completed e All',
        'Ogni modifica viene salvata in localStorage "todos" come array JSON di { id, text, done }',
        'Niente var',
      ],
      hints: [
        'Caricamento: let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; getItem restituisce null quando non c\'è niente di salvato, e JSON.parse(null) è null.',
        'render(): list.innerHTML = \'\'; poi per ogni compito che corrisponde crea il <li> con createElement, imposta li.dataset.id = todo.id e li.classList.toggle(\'done\', todo.done).',
        'Nel gestore dell\'elenco: const li = event.target.closest(\'.todo\'); const id = Number(li.dataset.id); poi controlla event.target.closest(\'.toggle\') o \'.delete\', aggiorna l\'array, save() e render().',
      ],
    },
  },
  messages: {
    'Define createCounter first.': 'Prima definisci createCounter.',
    'createCounter() should return { increment, decrement, value }, all functions.': 'createCounter() deve restituire { increment, decrement, value }, tutte funzioni.',
    'Create clicks with createCounter().': 'Crea clicks con createCounter().',
    'Define a function myMap(array, fn).': 'Definisci una funzione myMap(array, fn).',
    'Return a new array, not the original one.': 'Restituisci un nuovo array, non quello originale.',
    "Don't change the original array.": 'Non cambiare l\'array originale.',
    'Write the loop yourself: no .map() in this lesson.': 'Scrivi tu il ciclo: niente .map() in questa lezione.',
    'Define a function twice(fn).': 'Definisci una funzione twice(fn).',
    'twice(fn) should return a function.': 'twice(fn) deve restituire una funzione.',
    'Define a function pipe(...fns).': 'Definisci una funzione pipe(...fns).',
    'pipe(...) should return a function.': 'pipe(...) deve restituire una funzione.',
    'Build shout with pipe(...).': 'Costruisci shout con pipe(...).',
    'Define debounce first.': 'Prima definisci debounce.',
    'debounce(fn, ms) should return a function.': 'debounce(fn, ms) deve restituire una funzione.',
    "Don't call fn right away: wait ms after the last call.": 'Non chiamare subito fn: aspetta ms dopo l\'ultima chiamata.',
    'The #search input is missing.': 'Manca l\'input #search.',
    'The search ran on every keystroke: call a debounced version of runSearch in the input listener.':
      'La ricerca è partita a ogni tasto: nel gestore di input chiama una versione di runSearch con debounce.',
    'The search ran too early: use a 300ms delay.': 'La ricerca è partita troppo presto: usa un ritardo di 300ms.',
    'Milk should be gone.': 'Milk dovrebbe essere sparito.',
    'Adding "Bread" should make 3 items.': 'Aggiungere "Bread" dovrebbe portare a 3 elementi.',
    'Clicking ✕ on the new item should remove it.': 'Cliccare ✕ sul nuovo elemento dovrebbe toglierlo.',
    'Bread should be gone after clicking its ✕.': 'Bread dovrebbe sparire dopo aver cliccato il suo ✕.',
    'A second click should remove done again.': 'Un secondo clic dovrebbe togliere di nuovo done.',
    'Find the clicked item with event.target.closest().': 'Trova l\'elemento cliccato con event.target.closest().',
    'Remove the querySelectorAll(...).forEach loop: one listener on #list is enough.': 'Togli il ciclo querySelectorAll(...).forEach: basta un gestore su #list.',
    'Build it with new Set(array).': 'Costruiscilo con new Set(array).',
    'No need for includes(): the Set removes duplicates for you.': 'Non serve includes(): il Set toglie i duplicati per te.',
    'Define a function countWords(text).': 'Definisci una funzione countWords(text).',
    "Read the count with .get('the').": 'Leggi il conteggio con .get(\'the\').',
    'Render the 2 saved tasks as <li class="todo"> in #todo-list.': 'Disegna i 2 compiti salvati come <li class="todo"> in #todo-list.',
    'The first task should show "Buy milk" in a .todo-text span.': 'Il primo compito deve mostrare "Buy milk" in uno span .todo-text.',
    '"Buy milk" isn\'t done: it shouldn\'t have the class done.': '"Buy milk" non è fatto: non deve avere la classe done.',
    '"Read a book" is done: give its <li> the class done.': '"Read a book" è fatto: dai al suo <li> la classe done.',
    '#todo-count should read "1 item left" (one task isn\'t done).': '#todo-count deve dire "1 item left" (un compito non è fatto).',
    'After adding a task there should be 3 tasks.': 'Dopo aver aggiunto un compito dovrebbero esserci 3 compiti.',
    'The new task should be last, with its text trimmed.': 'Il nuovo compito deve essere l\'ultimo, con il testo senza spazi in eccesso.',
    'Clear the input after adding.': 'Svuota l\'input dopo aver aggiunto.',
    'Submitting only spaces should not add a task.': 'Inviare solo spazi non deve aggiungere un compito.',
    'After clicking its checkbox, "Buy milk" should have the class done.': 'Dopo aver cliccato la sua checkbox, "Buy milk" deve avere la classe done.',
    'Clicking ✕ on "Read a book" should leave 2 tasks.': 'Cliccare ✕ su "Read a book" deve lasciare 2 compiti.',
    '"Read a book" should be gone.': '"Read a book" dovrebbe essere sparito.',
    'With the Active filter only "Walk the dog" should be rendered.': 'Con il filtro Active deve essere disegnato solo "Walk the dog".',
    'Give the Active button the class active.': 'Dai al pulsante Active la classe active.',
    'Remove the class active from the All button.': 'Togli la classe active dal pulsante All.',
    'With the Completed filter only "Buy milk" should be rendered.': 'Con il filtro Completed deve essere disegnato solo "Buy milk".',
    'Only the current filter button should have the class active.': 'Solo il pulsante del filtro attuale deve avere la classe active.',
    'All should show both tasks again.': 'All deve mostrare di nuovo entrambi i compiti.',
    'Save the tasks under the key "todos".': 'Salva i compiti sotto la chiave "todos".',
    'localStorage "todos" isn\'t valid JSON: save it with JSON.stringify().': 'localStorage "todos" non è JSON valido: salvalo con JSON.stringify().',
    'Save the array of tasks under "todos".': 'Salva l\'array dei compiti sotto "todos".',
    'Give every task a unique id.': 'Dai a ogni compito un id unico.',
  },
} satisfies ModuleText;
