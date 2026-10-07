import type { ModuleText } from '../../localize';

export default {
  title: 'JavaScript asincrono',
  description: 'Timer, promise, async/await e fetch: lavora con le cose che richiedono tempo, e gestisci quello che va storto.',
  items: {
    'js-async-timers': {
      title: 'Timer e event loop',
      explanation: `Alcune cose richiedono tempo: un timer, un clic, una risposta da un server. JavaScript non si ferma ad aspettarle.
Consegni una funzione da eseguire **più tardi**, e il resto del tuo codice va avanti.

\`\`\`js
console.log('Start');

setTimeout(() => {
  console.log('Two seconds later');
}, 2000);   // the delay, in milliseconds

console.log('End');
// Start, End … and then "Two seconds later"
\`\`\`

Come funziona? JavaScript fa una cosa alla volta. L'**event loop** funziona così:

1. Il tuo script viene eseguito dall'alto in basso, tutto quanto.
2. Solo dopo vengono eseguite le callback in attesa (timer scaduti, clic…), una per una.

Quindi anche \`setTimeout(fn, 0)\` parte **dopo** tutto il codice normale: "0 ms" significa "appena possibile", non "subito".

\`setTimeout\` restituisce un id: \`clearTimeout(id)\` annulla il timer. \`setInterval(fn, ms)\` si ripete ogni \`ms\`
finché non chiami \`clearInterval(id)\`.`,
      tasks: [
        'Stampa Coffee is ready! da un setTimeout con un ritardo di 2000 ms',
        'La riga delle notizie viene stampata prima che il caffè sia pronto',
        'In cima allo script, aggiungi un setTimeout con ritardo 0 che stampi Timer with 0 ms, e guarda quando compare',
      ],
      hints: [
        'setTimeout(() => { console.log(\'Coffee is ready!\'); }, 2000);',
        'Il timer da 0 ms aspetta comunque che finisca tutto lo script: compare dopo "Reading the news", anche se nel codice viene prima.',
      ],
    },
    'js-async-promises': {
      title: 'Promise',
      explanation: `Le callback diventano un pasticcio quando un passaggio lento dipende da un altro. Le API moderne restituiscono invece una
**promise**: un oggetto che rappresenta un valore che arriverà più tardi. Una promise è *pending* (in attesa), poi diventa
**fulfilled** (ha un valore) oppure **rejected** (ha un errore).

\`\`\`js
somethingSlow()
  .then((value) => console.log('Got', value))     // runs when it is fulfilled
  .catch((err) => console.log('Oops:', err.message)); // runs when it is rejected
\`\`\`

Puoi crearne una tua con \`new Promise\`. Ricevi due funzioni: chiama \`resolve(valore)\` in caso di successo,
\`reject(errore)\` in caso di fallimento.

\`\`\`js
function flipCoin() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.5) resolve('heads');
      else reject(new Error('It fell under the sofa'));
    }, 1000);
  });
}

flipCoin()
  .then((side) => console.log('It landed on', side))
  .catch((err) => console.log('No result:', err.message));
\`\`\`

\`.then()\` restituisce una nuova promise, quindi puoi concatenare i passaggi: \`a().then(b).then(c)\`. Un rifiuto che nessuno
intercetta diventa un errore di "unhandled rejection": aggiungi sempre un \`.catch()\`.`,
      tasks: [
        'wait(ms) restituisce una promise che si risolve dopo ms millisecondi',
        'Usa wait(1000).then(...) per stampare One second later',
        'Gestisci il rifiuto di Bob: aggiungi un .catch() che stampi il message dell\'errore',
        'Il punteggio di Ada viene ancora stampato',
      ],
      hints: [
        'return new Promise((resolve) => setTimeout(resolve, ms));',
        'wait(1000).then(() => console.log(\'One second later\'));',
        'findPlayer(\'Bob\').then(...).catch((err) => console.log(err.message));',
      ],
    },
    'js-async-await': {
      title: 'async e await',
      explanation: `Le catene di \`.then()\` funzionano, ma i passaggi annidati scivolano presto verso destra. **\`async\`/\`await\`** ti permette
di scrivere codice con le promise che si legge dall'alto in basso, come il codice normale:

\`\`\`js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function countdown() {
  console.log(3);
  await wait(1000);   // pause this function until the promise is fulfilled
  console.log(2);
  await wait(1000);
  console.log(1);
  return 'Lift-off!';
}

countdown().then((msg) => console.log(msg));
console.log('This runs before 2!');
\`\`\`

- \`await promise\` mette in pausa **solo la funzione async** finché la promise non si conclude, poi ti dà il suo valore.
  Il resto della pagina continua a funzionare.
- \`await\` funziona solo dentro una funzione marcata \`async\` (o al primo livello di un modulo JavaScript).
- Una funzione \`async\` **restituisce sempre una promise**: \`return 79\` significa "una promise risolta con 79".
- Se la promise attesa viene rifiutata, \`await\` lancia l'errore: tra poco lo intercetterai con \`try\`/\`catch\`.`,
      tasks: [
        'showScores è una funzione async che usa await',
        'Nessun .then() rimasto nel tuo codice',
        'Dopo entrambi i punteggi, stampa Total: 79',
        'showScores() si risolve ancora nel totale (79)',
      ],
      hints: [
        'async function showScores() { const ada = await getScore(\'Ada\'); ... }',
        'console.log(\'Total:\', ada + grace); poi return ada + grace;',
      ],
    },
    'js-async-fetch': {
      title: 'fetch: dati da un server',
      explanation: `\`fetch(url)\` chiede dei dati a un server. Restituisce una promise di una **Response**; leggerne il corpo è un secondo
passaggio, anche lui asincrono:

\`\`\`js
async function loadUser(id) {
  const res = await fetch(\`https://api.learnweb.dev/users/\${id}\`);
  console.log(res.ok, res.status);   // true 200
  const user = await res.json();     // parse the body as JSON → a normal object
  return user;
}

loadUser(1).then((user) => console.log(user.name));
\`\`\`

- \`res.status\` è il codice di stato HTTP (200 = OK, 404 = non trovato, 500 = errore del server) e \`res.ok\` è
  \`true\` per qualsiasi stato 2xx.
- Anche \`res.json()\` restituisce una promise: non dimenticare il suo \`await\`. (\`res.text()\` dà testo semplice.)
- La maggior parte delle API invia **JSON**, che somiglia a oggetti e array JavaScript: \`{"id": 1, "name": "Ada Lovelace"}\`.

La sandbox non ha internet: questa lezione fornisce **dati finti** per \`https://api.learnweb.dev/users/1\` e
\`https://api.learnweb.dev/todos\` (un elenco di cose da fare, ognuna con \`id\`, \`title\` e \`done\`). Prova a stamparli!`,
      tasks: [
        'Correggi loadUser in modo che loadUser(1) si risolva nell\'oggetto dell\'utente',
        'In main, stampa Ada Lovelace lives in London (usa name e city dell\'utente)',
        'Scrivi una funzione async countOpenTodos() che scarica i todo e restituisce quanti non sono fatti (2)',
      ],
      hints: [
        'Sia fetch() sia res.json() restituiscono promise: metti await davanti a ognuno.',
        'console.log(`${user.name} lives in ${user.city}`);',
        'const todos = await res.json(); return todos.filter((t) => !t.done).length;',
      ],
    },
    'js-async-errors': {
      title: 'Quando le cose vanno storte',
      explanation: `Le richieste falliscono di continuo, e succede in **due modi diversi**:

1. **La richiesta non riceve mai una risposta** (offline, server giù): la promise di \`fetch\` viene *rifiutata*, e
   \`await\` lancia un \`TypeError: Failed to fetch\`.
2. **Il server risponde con uno stato di errore** (404, 500…): \`fetch\` **non** viene rifiutata! Ricevi una risposta normale
   con \`res.ok === false\`. Sta a te controllarlo.

Gestisci entrambi con \`try\`/\`catch\`, e lancia un tuo errore quando lo stato non va bene:

\`\`\`js
async function loadUser(id) {
  const res = await fetch(\`https://api.learnweb.dev/users/\${id}\`);
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}\`);   // turn a bad status into a real error
  }
  return res.json();
}

async function showUser(id) {
  try {
    const user = await loadUser(id);
    console.log(user.name);
  } catch (err) {
    console.log('Could not load the user:', err.message);
  } finally {
    console.log('Finished');   // runs either way: hide a spinner, re-enable a button…
  }
}
\`\`\`

\`throw\` ferma la funzione e salta al \`catch\` più vicino, anche attraverso \`await\` e chiamate di funzione.
L'API finta di questa lezione ha l'utente 1, risponde all'utente 99 con un 404, e il server dell'utente 7 è giù.`,
      tasks: [
        'loadUser lancia new Error(\'HTTP 404\') quando l\'utente 99 non viene trovato (controlla res.ok)',
        'showUser intercetta gli errori e stampa Could not load user <id>: <message>',
        'Hello, Ada Lovelace! funziona ancora per l\'utente 1',
        'Non salutare mai un utente undefined',
        'Aggiungi un blocco finally che stampi Done loading user <id> per ogni utente',
      ],
      hints: [
        'In loadUser: if (!res.ok) throw new Error(`HTTP ${res.status}`);',
        'In showUser: try { ...await e saluto... } catch (err) { console.log(`Could not load user ${id}: ${err.message}`); }',
        'finally { console.log(`Done loading user ${id}`); }',
      ],
    },
    'js-async-render': {
      title: 'Caricare dati nella pagina',
      explanation: `È ora di mettere tutto insieme: scaricare dati e mostrarli nella pagina. Un buon flusso di caricamento ha tre passaggi:

1. **Prima** della richiesta: fai sapere all'utente che sta succedendo qualcosa ("Loading…") e cancella i vecchi risultati.
2. **Dopo**: costruisci un elemento per ogni voce.
3. **Alla fine**: sostituisci il messaggio di caricamento con un risultato (o un errore).

\`\`\`js
async function loadTodos() {
  status.textContent = 'Loading…';
  list.innerHTML = '';                  // clear old items, or a reload doubles them

  const res = await fetch('https://api.learnweb.dev/todos');
  const todos = await res.json();

  for (const todo of todos) {
    const li = document.createElement('li');
    li.textContent = todo.title;        // textContent: safe even if the data contains HTML
    list.append(li);
  }
  status.textContent = \`\${todos.length} todos loaded\`;
}
\`\`\`

Il server finto di questa lezione risponde a \`https://api.learnweb.dev/todos\` dopo un secondo, così puoi vedere
"Loading…" nell'anteprima. Ogni todo ha \`id\`, \`title\` e \`done\`.`,
      tasks: [
        'L\'elenco mostra un <li> per ogni todo, con il suo titolo',
        'I todo finiti ricevono la classe done',
        '#status dice 3 todos loaded quando i dati sono arrivati',
        'Cliccando Reload compare subito Loading…, poi di nuovo l\'elenco, senza duplicati',
      ],
      hints: [
        'statusEl.textContent = \'Loading…\'; list.innerHTML = \'\';',
        'for (const todo of todos) { const li = document.createElement(\'li\'); li.textContent = todo.title; ... list.append(li); }',
        'li.classList.toggle(\'done\', todo.done); e alla fine: statusEl.textContent = `${todos.length} todos loaded`;',
      ],
    },
    'js-async-challenge': {
      title: 'Rubrica degli utenti',
      summary: 'Scarica i team da un\'API (finta), mostra gli stati di caricamento e di errore, e disegna i membri.',
      explanation: `Costruisci una piccola rubrica aziendale. La pagina (index.html) è pronta; scrivi script.js.

L'API finta si trova su \`https://api.learnweb.dev/teams/<team>/users\`, dove \`<team>\` è il valore \`data-team\` del
pulsante. Ogni utente è fatto così: \`{ "id": 1, "name": "Susan Kare", "role": "Icon designer" }\`.
Non tutti gli endpoint funzionano: **marketing** risponde con un errore 500, e il server di **sales** è giù.

Che cosa deve fare la pagina:

- All'apertura della pagina, carica il team **design**. Cliccare il pulsante di un team carica invece quel team.
- Mentre una richiesta è in corso, \`#status\` dice \`Loading…\` e l'elenco è vuoto.
- In caso di successo, \`#users\` contiene un \`<li>\` per ogni utente: il nome in uno \`<strong>\`, poi il ruolo, es.
  \`<li><strong>Susan Kare</strong> — Icon designer</li>\`. \`#status\` mostra il numero, es. \`3 users\`.
- In caso di fallimento (stato non valido **o** errore di rete), l'elenco resta vuoto, \`#status\` dice
  \`Could not load <team>: <reason>\` (es. \`Could not load marketing: HTTP 500\`) e riceve la classe \`error\`.
  Togli di nuovo quella classe al successivo caricamento riuscito.
- Nessun errore non intercettato né rifiuto non gestito, qualsiasi pulsante venga cliccato.

Consiglio: scrivi una funzione async \`loadTeam(team)\` con \`try\`/\`catch\`, e una \`renderUsers(users)\` separata.`,
      tasks: [
        'Il team design viene elencato all\'apertura della pagina',
        'Ogni utente mostra il nome in uno <strong>, seguito dal ruolo',
        '#status mostra il numero di utenti: 3 users',
        'Cliccando un team compare Loading… (con l\'elenco vuoto) durante il caricamento, poi quel team',
        'Un errore del server (marketing) mostra Could not load marketing: HTTP 500 con la classe error',
        'Un errore di rete (sales) mostra Could not load sales: … invece di andare in crash',
        'Caricare di nuovo un team dopo un errore funziona e toglie la classe error',
      ],
      hints: [
        'Inizia loadTeam con statusEl.textContent = \'Loading…\'; list.innerHTML = \'\'; statusEl.classList.remove(\'error\');',
        'Dentro il try: const res = await fetch(...); if (!res.ok) throw new Error(`HTTP ${res.status}`); const users = await res.json();',
        'document.querySelectorAll(\'[data-team]\').forEach((btn) => btn.addEventListener(\'click\', () => loadTeam(btn.dataset.team)));',
      ],
    },
  },
  messages: {
    'Wrap the coffee message in setTimeout(() => { ... }, 2000).': 'Racchiudi il messaggio del caffè in setTimeout(() => { ... }, 2000).',
    'Use a delay of 2000 milliseconds (2 seconds).': 'Usa un ritardo di 2000 millisecondi (2 secondi).',
    'Expected: Ordering coffee..., then Reading the news while waiting, then Coffee is ready!':
      'Atteso: Ordering coffee..., poi Reading the news while waiting, poi Coffee is ready!',
    'Put the zero-delay setTimeout at the top, before the first console.log.': 'Metti il setTimeout con ritardo zero in cima, prima del primo console.log.',
    'Give it a delay of 0: setTimeout(() => { ... }, 0).': 'Dagli un ritardo di 0: setTimeout(() => { ... }, 0).',
    'Timer with 0 ms should be logged (after all the normal code, before the coffee).':
      'Timer with 0 ms deve essere stampato (dopo tutto il codice normale, prima del caffè).',
    'Keep the function wait(ms).': 'Mantieni la funzione wait(ms).',
    'wait(ms) should return a new Promise(...).': 'wait(ms) deve restituire una new Promise(...).',
    'wait(400) resolved right away: call resolve from a setTimeout with a delay of ms.': 'wait(400) si è risolta subito: chiama resolve da un setTimeout con un ritardo di ms.',
    'wait(400) never resolved: call resolve inside setTimeout.': 'wait(400) non si è mai risolta: chiama resolve dentro setTimeout.',
    'Call wait(1000) and log the message in .then().': 'Chiama wait(1000) e stampa il messaggio in .then().',
    'Log err.message in the .catch(): it reads No player called Bob.': 'Stampa err.message nel .catch(): dice No player called Bob.',
    'Add .catch((err) => ...) after the .then().': 'Aggiungi .catch((err) => ...) dopo il .then().',
    'Declare it as async function showScores() { ... }.': 'Dichiarala come async function showScores() { ... }.',
    'Use await to get each score.': 'Usa await per ottenere ogni punteggio.',
    'Replace every .then() with await.': 'Sostituisci ogni .then() con await.',
    'Log Ada: 42, then Grace: 37, then Total: 79.': 'Stampa Ada: 42, poi Grace: 37, poi Total: 79.',
    'loadUser(1) should resolve to the user: await fetch(), then await res.json().': 'loadUser(1) deve risolversi nell\'utente: await fetch(), poi await res.json().',
    'Fetch the todos with await fetch(...).': 'Scarica i todo con await fetch(...).',
    'Keep the function loadUser(id).': 'Mantieni la funzione loadUser(id).',
    'loadUser(99) should throw an error: its response has status 404, so res.ok is false.':
      'loadUser(99) deve lanciare un errore: la sua risposta ha stato 404, quindi res.ok è false.',
    'The network error for user 7 should be caught too: Could not load user 7: Failed to fetch':
      'Anche l\'errore di rete dell\'utente 7 va intercettato: Could not load user 7: Failed to fetch',
    'Wrap the await in try { ... } catch (err) { ... }.': 'Racchiudi l\'await in try { ... } catch (err) { ... }.',
    'Something logged "undefined": a failed request should not reach the greeting.': 'È stato stampato "undefined": una richiesta fallita non deve arrivare al saluto.',
    'Add finally { ... } after the catch.': 'Aggiungi finally { ... } dopo il catch.',
    'Keep the #reload button and the #status paragraph.': 'Mantieni il pulsante #reload e il paragrafo #status.',
    'Right after the click, #status should say Loading…': 'Subito dopo il clic, #status deve dire Loading…',
    'After a reload, #status should say 3 todos loaded again.': 'Dopo un reload, #status deve dire di nuovo 3 todos loaded.',
    'Keep the team buttons and #status.': 'Mantieni i pulsanti dei team e #status.',
    'Right after a click, #status should say Loading…': 'Subito dopo un clic, #status deve dire Loading…',
    'Empty the list while the new team is loading.': 'Svuota l\'elenco mentre il nuovo team si carica.',
    'After clicking Engineering, list its 4 users (and only them).': 'Dopo aver cliccato Engineering, elenca i suoi 4 utenti (e solo loro).',
    '#status should say 4 users for engineering.': '#status deve dire 4 users per engineering.',
  },
} satisfies ModuleText;
