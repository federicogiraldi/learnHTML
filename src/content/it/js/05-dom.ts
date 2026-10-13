import type { ModuleText } from '../../localize';

export default {
  title: 'Il DOM',
  description: 'Trova gli elementi nella pagina, cambia testo, attributi e classi, creane di nuovi e reagisci a clic, digitazione e form.',
  items: {
    'js-dom-select': {
      title: 'Selezionare gli elementi',
      explanation: `Quando il browser legge il tuo HTML costruisce il **DOM** (Document Object Model): un albero di oggetti, uno per
elemento, che JavaScript può leggere e modificare. L'intera pagina è l'oggetto \`document\`.

Per lavorare con un elemento devi prima **selezionarlo**:

\`\`\`html
<h1 id="title">Recipes</h1>
<p class="tip">Preheat the oven.</p>
<p class="tip">Use fresh basil.</p>
<script>
  const title = document.getElementById('title');        // by id (no #)
  const firstTip = document.querySelector('.tip');       // the FIRST match of any CSS selector
  const tips = document.querySelectorAll('.tip');        // ALL matches, as a NodeList

  console.log(title.textContent);      // Recipes
  console.log(tips.length);            // 2
  tips.forEach((tip) => console.log(tip.textContent));
</script>
\`\`\`

- \`querySelector\` accetta gli stessi selettori del CSS: \`'#id'\`, \`'.class'\`, \`'ul li'\`, \`'button[type=submit]'\`…
- Se niente corrisponde, \`querySelector\` restituisce \`null\` (e usarlo lancia *Cannot read properties of null*).
- Una NodeList ha \`.length\`, gli indici e \`forEach\`; trasformala in un vero array con \`[...list]\` per usare \`map\` o \`filter\`.

Il tuo script.js viene caricato alla fine di \`<body>\`, quindi quando parte gli elementi esistono già.`,
      tasks: [
        'title è l\'elemento <h1>, selezionato con getElementById',
        'intro è il paragrafo .intro, selezionato con querySelector',
        'items contiene tutti e tre gli elementi .item (querySelectorAll)',
        'Stampa quanti elementi ci sono',
        'Stampa il testo del primo elemento (Milk)',
      ],
      hints: [
        'document.querySelector(\'title\') trova il tag <title> dentro <head>! Usa document.getElementById(\'title\') (senza #).',
        'const items = document.querySelectorAll(\'.item\');',
        'items[0].textContent è il testo del primo elemento.',
      ],
    },
    'js-dom-text-attrs': {
      title: 'Cambiare testo e attributi',
      explanation: `Una volta che hai un elemento, puoi modificarlo e la pagina si aggiorna subito.

\`\`\`html
<h2 id="name">…</h2>
<img id="photo" src="https://picsum.photos/id/64/100/100" alt="">
<a id="site" href="#">Website</a>
<script>
  document.querySelector('#name').textContent = 'Grace Hopper';   // replace the text

  const photo = document.querySelector('#photo');
  photo.setAttribute('alt', 'Portrait of Grace');                  // any attribute
  photo.src = 'https://picsum.photos/id/65/100/100';               // common ones are properties too

  document.querySelector('#site').href = 'https://example.com';
  document.querySelector('#name').style.color = 'teal';           // inline style, camelCase names
</script>
\`\`\`

- \`textContent\` legge o sostituisce il testo di un elemento. Potresti vedere anche \`innerHTML\`, che interpreta l'HTML: non
  metterci mai dentro dati inseriti dagli utenti, qualcuno potrebbe iniettare i suoi tag e i suoi script.
- \`getAttribute(nome)\` / \`setAttribute(nome, valore)\` funzionano per qualsiasi attributo; \`removeAttribute(nome)\` ne toglie uno.
- \`element.style.backgroundColor = 'red'\` imposta stili **in linea** (nomi CSS in camelCase). Va bene per valori occasionali,
  ma per tutto il resto attivare e disattivare classi (prossima lezione) tiene gli stili nel tuo CSS.`,
      tasks: [
        '#name mostra il nome del profilo',
        '#bio mostra la biografia',
        'Il src di #photo è profile.photo',
        'L\'alt di #photo è Portrait of Ada Lovelace (impostato con setAttribute)',
        '#link punta a profile.site, e #name riceve lo stile in linea color: purple',
      ],
      hints: [
        'document.querySelector(\'#bio\').textContent = profile.bio;',
        'const photo = document.querySelector(\'#photo\'); photo.src = profile.photo; photo.setAttribute(\'alt\', `Portrait of ${profile.name}`);',
        'document.querySelector(\'#name\').style.color = \'purple\';',
      ],
    },
    'js-dom-classes': {
      title: 'Classi con classList',
      explanation: `Il modo più pulito per cambiare l'aspetto di qualcosa è tenere gli stili nel CSS e limitarsi ad **aggiungere o
togliere una classe** da JavaScript. Ogni elemento ha una \`classList\`:

\`\`\`js
const box = document.querySelector('.box');

box.classList.add('active');          // add a class
box.classList.remove('hidden');       // remove one
box.classList.toggle('open');         // add it if missing, remove it if present
box.classList.toggle('big', width > 600);   // with a condition: add if true, remove if false
console.log(box.classList.contains('active'));   // true
\`\`\`

Per cambiare più elementi, selezionali tutti e cicla:

\`\`\`js
document.querySelectorAll('.card').forEach((card) => card.classList.add('shadow'));
\`\`\`

Evita di scrivere direttamente in \`className\`: sostituisce *tutte* le classi in un colpo solo.`,
      tasks: [
        'Aggiungi la classe dark a <body> con classList',
        'Mostra il badge #saved togliendo la sua classe hidden (mantiene la classe badge)',
        'Attiva/disattiva done su ogni .task: il primo torna da fare, gli altri due diventano fatti',
        'Stampa se #saved ha la classe badge (true), usando contains',
      ],
      hints: [
        'document.body.classList.add(\'dark\'); className = \'...\' cancellerebbe tutte le altre classi.',
        'document.querySelectorAll(\'.task\').forEach((task) => task.classList.toggle(\'done\'));',
        'console.log(saved.classList.contains(\'badge\'));',
      ],
    },
    'js-dom-create': {
      title: 'Creare e togliere elementi',
      explanation: `JavaScript può costruire nuovi elementi e metterli nella pagina: è così che vengono mostrati gli elenchi di dati.

\`\`\`html
<ul id="list"></ul>
<script>
  const list = document.querySelector('#list');
  const fruits = ['Apple', 'Pear'];

  for (const fruit of fruits) {
    const li = document.createElement('li');   // 1. create (not on the page yet)
    li.textContent = fruit;                    // 2. fill it in
    li.classList.add('fruit');
    list.append(li);                           // 3. insert it: at the end of #list
  }
</script>
\`\`\`

- \`parent.append(el)\` aggiunge in fondo, \`parent.prepend(el)\` all'inizio.
- \`el.remove()\` toglie un elemento dalla pagina.
- Costruire elementi con \`createElement\` e \`textContent\` è sicuro anche con i dati degli utenti, a differenza di \`innerHTML\`.`,
      tasks: [
        'Ogni ospite diventa un <li> dentro #guests',
        'Gli ospiti compaiono nello stesso ordine dell\'array',
        'Ogni <li> di un ospite ha la classe guest',
        'Togli il paragrafo .ad con remove()',
      ],
      hints: ['Dentro il ciclo: list.append(li);', 'li.classList.add(\'guest\');', 'document.querySelector(\'.ad\').remove();'],
    },
    'js-dom-click': {
      title: 'Eventi di clic',
      explanation: `Le pagine prendono vita reagendo agli **eventi**: clic, tasti premuti, digitazione… Registri una funzione che il
browser chiama ogni volta che l'evento succede:

\`\`\`html
<button id="hello">Say hi</button>
<p id="out"></p>
<script>
  let clicks = 0;
  const button = document.querySelector('#hello');

  button.addEventListener('click', (event) => {
    clicks++;
    document.querySelector('#out').textContent = \`Clicked \${clicks} times\`;
    console.log(event.target);   // the element that was clicked
  });
</script>
\`\`\`

- La funzione parte **più tardi**, a ogni clic: non quando viene chiamato \`addEventListener\`.
- Passa la funzione stessa: \`addEventListener('click', handleClick)\`, **non** \`handleClick()\` (la chiamerebbe una volta,
  subito, e passerebbe il suo risultato).
- Tieni lo stato (come un contatore) in una variabile **fuori** dal gestore, così sopravvive tra un clic e l'altro.
- Nel vecchio HTML potresti vedere attributi \`onclick="..."\`: \`addEventListener\` tiene JavaScript fuori dal markup e
  permette più gestori.`,
      tasks: [
        'Cliccare Like una volta mostra 1',
        'Altri due clic mostrano 3 (il conteggio continua a salire)',
        'Cliccare #theme aggiunge la classe dark a <body>',
        'Cliccare di nuovo #theme la toglie',
      ],
      hints: [
        'let likes = 0; deve stare fuori dal gestore, altrimenti a ogni clic riparte da 0.',
        'document.querySelector(\'#theme\').addEventListener(\'click\', () => { document.body.classList.toggle(\'dark\'); });',
      ],
    },
    'js-dom-forms': {
      title: 'Digitazione e form',
      explanation: `Per i form contano soprattutto due eventi:

- **\`input\`** scatta su un \`<input>\` o una \`<textarea>\` dopo ogni tasto: perfetto per le anteprime dal vivo.
- **\`submit\`** scatta sul \`<form>\` quando l'utente preme Invio o clicca un pulsante di invio.

\`\`\`html
<form id="search">
  <input id="q">
  <button>Search</button>
</form>
<p id="live"></p>
<script>
  const q = document.querySelector('#q');

  q.addEventListener('input', () => {
    document.querySelector('#live').textContent = \`You typed: \${q.value}\`;
  });

  document.querySelector('#search').addEventListener('submit', (event) => {
    event.preventDefault();          // stop the browser from reloading the page
    console.log('Searching for', q.value.trim());
    q.value = '';                    // clear the field
  });
</script>
\`\`\`

- Il testo attuale di un input è il suo \`.value\` (sempre una **stringa**: usa \`Number()\` per i numeri).
- Il comportamento predefinito di un form è inviare i dati e **caricare una nuova pagina**. In un'app JavaScript, chiama
  \`event.preventDefault()\` come prima cosa nel gestore del submit.
- Ascolta \`submit\` sul form invece di \`click\` sul pulsante: intercetta anche il tasto Invio.
- \`.trim()\` toglie gli spazi a entrambe le estremità, così \`'   '\` conta come vuoto.`,
      tasks: [
        'Scrivendo Ada, #preview mostra Hello, Ada! mentre digiti',
        'Svuotando l\'input torna Hello, stranger!',
        'Inviare un nome vuoto non ricarica la pagina, mostra Please enter a name. e non aggiunge nessuno',
        'Inviare Grace la aggiunge a #members e mostra Welcome, Grace!',
        'Dopo l\'iscrizione, l\'input viene svuotato',
      ],
      hints: [
        'Nel gestore di input: preview.textContent = input.value ? `Hello, ${input.value}!` : \'Hello, stranger!\';',
        'Il gestore del submit riceve l\'evento: form.addEventListener(\'submit\', (event) => { event.preventDefault(); ... });',
        'Per un nuovo membro: crea un <li>, imposta il suo textContent, members.append(li), poi input.value = \'\'.',
      ],
    },
    'js-dom-challenge': {
      title: 'Contapersone della sala',
      summary: 'Costruisci un contatore di visitatori con +, −, azzeramento, passo regolabile e limiti precisi.',
      explanation: `Una piccola sala di un museo può ospitare al massimo **10 visitatori**. Costruisci il contatore per l'addetto alla porta.
La pagina e i suoi stili sono pronti; scrivi script.js in modo che:

1. **+** aggiunga il passo al conteggio e **−** lo sottragga. Il passo è il numero nell'input \`#step\`
   (leggilo quando il pulsante viene cliccato; all'inizio vale 1).
2. Il conteggio non scenda mai sotto **0** né salga sopra **10**: limitalo (\`Math.min\` / \`Math.max\` aiutano).
3. **−** sia disattivato quando il conteggio è 0 e **+** quando è 10, anche all'inizio.
4. A 10, \`#value\` riceva la classe \`max\` e \`#note\` dica **Maximum reached**. Sotto 10, niente classe \`max\` e nota vuota.
5. **Reset** riporti il conteggio a 0.

Consiglio: scrivi una sola funzione \`render()\` che aggiorni tutta la pagina a partire dalla variabile \`count\`, chiamala una
volta all'inizio e dopo ogni modifica. Un pulsante si disattiva con \`button.disabled = true\`.`,
      tasks: [
        'All\'inizio il conteggio è 0 e − è disattivato',
        '+ aggiunge uno',
        '− toglie uno, e torna disattivato a 0',
        'Il conteggio non scende mai sotto 0',
        'Con il passo impostato a 4, due clic su + danno 8',
        'Il conteggio si ferma a 10: #value riceve la classe max, + è disattivato e #note dice Maximum reached',
        'Reset torna a 0, toglie max, svuota la nota e riattiva +',
        'Usa addEventListener e niente var',
      ],
      hints: [
        'Nei gestori dei clic: const step = Number(stepInput.value); count = Math.min(10, count + step);',
        'In render(): minusButton.disabled = count === 0; plusButton.disabled = count === 10; valueEl.classList.toggle(\'max\', count === 10);',
        'Chiama render() una volta alla fine dello script, così la pagina parte nello stato giusto.',
      ],
    },
  },
  messages: {
    'title should be the <h1 id="title"> element.': 'title deve essere l\'elemento <h1 id="title">.',
    'Declare intro as the .intro paragraph.': 'Dichiara intro come il paragrafo .intro.',
    "Declare items with document.querySelectorAll('.item').": 'Dichiara items con document.querySelectorAll(\'.item\').',
    'Log items.length.': 'Stampa items.length.',
    'Read the text with .textContent.': 'Leggi il testo con .textContent.',
    'Use profile.bio rather than copying the text.': 'Usa profile.bio invece di copiare il testo.',
    'List the guests in order: Ada, Grace, Linus (use append).': 'Elenca gli ospiti in ordine: Ada, Grace, Linus (usa append).',
    'The .ad paragraph is still on the page.': 'Il paragrafo .ad è ancora nella pagina.',
    'After 3 clicks, #count should show 3. Is likes reset on every click?': 'Dopo 3 clic, #count dovrebbe mostrare 3. likes viene azzerato a ogni clic?',
    "Clear the input after a successful sign-up: input.value = '';": 'Svuota l\'input dopo un\'iscrizione riuscita: input.value = \'\';',
    '− should be disabled while the count is 0.': '− deve essere disattivato finché il conteggio è 0.',
    '− should be disabled again when the count is back to 0.': '− deve tornare disattivato quando il conteggio torna a 0.',
    'The count went below 0.': 'Il conteggio è sceso sotto 0.',
    'Read the step from #step (Number(stepInput.value)) when + is clicked.': 'Leggi il passo da #step (Number(stepInput.value)) quando viene cliccato +.',
    'One more click (8 + 4) should stop at 10, not go over.': 'Un altro clic (8 + 4) deve fermarsi a 10, non andare oltre.',
    '+ should be disabled at 10.': '+ deve essere disattivato a 10.',
    '#note should be empty below 10.': '#note deve essere vuota sotto 10.',
    '+ should be enabled again after a reset.': '+ deve tornare attivo dopo un azzeramento.',
  },
} satisfies ModuleText;
