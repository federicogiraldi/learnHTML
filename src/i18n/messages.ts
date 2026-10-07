import type { Lang } from '.';
import { itMessages } from '../content/it';

/**
 * Checks and validators report in English. Italian replaces whole messages: first the lessons' own messages
 * (exact matches, from the translation files), then the engine's built-in messages (patterns below).
 * Anything unknown stays in English.
 */
type Rule = [RegExp, (m: RegExpMatchArray, tr: (s: string) => string) => string];

const exact: Record<string, string> = {
  'Your HTML is well-formed (no structural errors).': 'Il tuo HTML è ben formato (nessun errore strutturale).',
  'Your CSS is valid (no syntax errors).': 'Il tuo CSS è valido (nessun errore di sintassi).',
  'Your JavaScript runs without errors.': 'Il tuo JavaScript viene eseguito senza errori.',
  'This check needs the JavaScript runner.': 'Questa verifica ha bisogno dell’esecutore JavaScript.',
  'This check only works on HTML lessons.': 'Questa verifica funziona solo nelle lezioni di HTML.',
  'Not checked.': 'Non verificato.',
  'Not yet.': 'Non ancora.',
  'Cancelled.': 'Annullato.',
  'The checks took too long to finish.': 'Le verifiche ci hanno messo troppo a finire.',
  'index.html doesn’t load script.js, so your JavaScript isn’t running. Add <script src="script.js"></script> before </body>.':
    'index.html non carica script.js, quindi il tuo JavaScript non viene eseguito. Aggiungi <script src="script.js"></script> prima di </body>.',
  'This file is not a LearnHTML progress export.': 'Questo file non è un’esportazione dei progressi di LearnHTML.',
  // HTML checks
  'Start the document with <!DOCTYPE html>.': 'Inizia il documento con <!DOCTYPE html>.',
  'Add an HTML comment: <!-- like this -->.': 'Aggiungi un commento HTML: <!-- così -->.',
  'Add some form controls.': 'Aggiungi qualche controllo al form.',
  'Add some headings.': 'Aggiungi qualche titolo.',
  'The first heading should be an <h1>.': 'Il primo titolo deve essere un <h1>.',
  // CSS checks
  'Write a rule for the right selector.': 'Scrivi una regola per il selettore giusto.',
  'Add a @media query.': 'Aggiungi una media query (@media).',
  // Validators
  'Comment opened with <!-- is never closed with -->.': 'Un commento aperto con <!-- non viene mai chiuso con -->.',
  'A rule is missing its selector before "{".': 'A una regola manca il selettore prima di "{".',
  'This "}" has no matching "{".': 'Questa "}" non ha una "{" corrispondente.',
  'This "{" is never closed with "}".': 'Questa "{" non viene mai chiusa con "}".',
  // JavaScript checks
  'Nothing was logged to the console yet.': 'Nella console non è ancora stato scritto niente.',
  'Something was logged that shouldn’t be.': 'Nella console è comparso qualcosa che non dovrebbe esserci.',
  'Show the message with alert().': 'Mostra il messaggio con alert().',
  'Use let or const instead of var.': 'Usa let o const al posto di var.',
  'Call event.preventDefault() in the submit handler, or the page reloads.':
    'Chiama event.preventDefault() nel gestore del submit, altrimenti la pagina si ricarica.',
};

const want = (s: string) =>
  s.replace(/^exactly /, 'esattamente ').replace(/^at least /, 'almeno ').replace(/^at most /, 'al massimo ');

const rules: Rule[] = [
  [/^Line (\d+): ([\s\S]*)$/, (m, tr) => `Riga ${m[1]}: ${tr(m[2])}`],
  [/^Check failed to run: ([\s\S]*)$/, (m) => `Impossibile eseguire la verifica: ${m[1]}`],
  [/^Stopped: your code ran for more than (\S+) seconds\. Is there an infinite loop\?$/,
    (m) => `Fermato: il tuo codice è andato avanti per più di ${m[1]} secondi. C’è un ciclo infinito?`],
  [/^Stopped: the loop on line (\d+) ran for more than (\S+) seconds\. Is it infinite\? Check its condition and that its counter changes\.$/,
    (m) => `Fermato: il ciclo alla riga ${m[1]} è andato avanti per più di ${m[2]} secondi. È infinito? Controlla la condizione e che il contatore cambi.`],

  // HTML checks
  [/^Add a <(.+)> element\.$/, (m) => `Aggiungi un elemento <${m[1]}>.`],
  [/^Add a "(.+)" element\.$/, (m) => `Aggiungi un elemento "${m[1]}".`],
  [/^Remove the (.+) element\.$/, (m) => `Rimuovi l’elemento ${m[1]}.`],
  [/^Expected ((?:exactly |at least |at most )?\d+(?:–\d+)?) "(.+)", found (\d+)\.$/,
    (m) => `"${m[2]}": ne servono ${want(m[1])}, ce ne sono ${m[3]}.`],
  [/^The text of "(.+)" doesn't match what was asked\.$/, (m) => `Il testo di "${m[1]}" non corrisponde a quanto richiesto.`],
  [/^Every "(.+)" needs some text\.$/, (m) => `Ogni "${m[1]}" deve contenere del testo.`],
  [/^(\d+) "(.+)" element\(s\): ([\s\S]*)$/, (m, tr) => `${m[1]} elementi "${m[2]}": ${tr(m[3])}`],
  [/^"(.+)" needs a (\S+) attribute\.$/, (m) => `"${m[1]}" ha bisogno dell’attributo ${m[2]}.`],
  [/^"(.+)" needs (\S+?)="(.*)"\.$/, (m) => `"${m[1]}" ha bisogno di ${m[2]}="${m[3]}".`],
  [/^Check the (\S+) attribute of "(.+)"\.$/, (m) => `Controlla l’attributo ${m[1]} di "${m[2]}".`],
  [/^Put a <(.+)> directly inside <(.+)>\.$/, (m) => `Metti un <${m[1]}> direttamente dentro <${m[2]}>.`],
  [/^Put a <(.+)> inside <(.+)>\.$/, (m) => `Metti un <${m[1]}> dentro <${m[2]}>.`],
  [/^"(.+)" should come before "(.+)"\.$/, (m) => `"${m[1]}" deve venire prima di "${m[2]}".`],
  [/^The control "(.+)" has no label\. Use <label for="\.\.\."> matching its id\.$/,
    (m) => `Il controllo "${m[1]}" non ha un’etichetta. Usa <label for="..."> con il suo id.`],
  [/^Heading levels skip from <h(\d)> to <h(\d)>\.$/, (m) => `I livelli dei titoli saltano da <h${m[1]}> a <h${m[2]}>.`],
  [/^The id "(.+)" is used more than once\. Ids must be unique\.$/,
    (m) => `L’id "${m[1]}" è usato più di una volta. Gli id devono essere unici.`],
  [/^The link to "#(.*)" points to an id that doesn't exist\.$/, (m) => `Il link a "#${m[1]}" punta a un id che non esiste.`],

  // CSS checks
  [/^Write a rule for "(.+)"\.$/, (m) => `Scrivi una regola per "${m[1]}".`],
  [/^Set (.+?) in the "(.+)" rule\.$/, (m) => `Imposta ${m[1]} nella regola "${m[2]}".`],
  [/^Use the (\S+) property\.$/, (m) => `Usa la proprietà ${m[1]}.`],
  [/^There is no "(.+)" element in the HTML\.$/, (m) => `Nell’HTML non c’è nessun elemento "${m[1]}".`],
  [/^"(.+)" should have (\S+) set as asked \(now: (.*)\)\.$/, (m) => `"${m[1]}" deve avere ${m[2]} impostato come richiesto (ora: ${m[3]}).`],
  [/^"(.+)" should have ([\w-]+): (.+) \(now: (.*)\)\.$/, (m) => `"${m[1]}" deve avere ${m[2]}: ${m[3]} (ora: ${m[4]}).`],
  [/^Every "(.+)" should have (\S+) set as asked\.$/, (m) => `Ogni "${m[1]}" deve avere ${m[2]} impostato come richiesto.`],
  [/^Need at least two "(.+)" elements\.$/, (m) => `Servono almeno due elementi "${m[1]}".`],
  [/^The "(.+)" elements should sit side by side in one row\.$/, (m) => `Gli elementi "${m[1]}" devono stare affiancati su una riga.`],
  [/^The "(.+)" elements should be stacked one under the other\.$/, (m) => `Gli elementi "${m[1]}" devono stare uno sotto l’altro.`],
  [/^Both "(.+)" and "(.+)" must exist\.$/, (m) => `Devono esistere sia "${m[1]}" sia "${m[2]}".`],
  [/^Centre "(.+)" inside "(.+?)"(?: \((horizontally|vertically)\))?\.$/,
    (m) => `Centra "${m[1]}" dentro "${m[2]}"${m[3] ? ` (${m[3] === 'horizontally' ? 'orizzontalmente' : 'verticalmente'})` : ''}.`],
  [/^The children of "(.+)" should form (\d+) columns? \(now (\d+)\)\.$/,
    (m) => `I figli di "${m[1]}" devono formare ${m[2]} ${m[2] === '1' ? 'colonna' : 'colonne'} (ora ${m[3]}).`],

  // HTML validator
  [/^The tag <(\/?)(\S+) is missing its closing ">"\.$/, (m) => `Al tag <${m[1]}${m[2]} manca il ">" di chiusura.`],
  [/^<(\S+)> is a void element: it has no closing tag <\/\1>\.$/, (m) => `<${m[1]}> è un elemento vuoto: non ha un tag di chiusura </${m[1]}>.`],
  [/^Closing tag <\/(\S+)> has no matching opening <\1>\.$/, (m) => `Il tag di chiusura </${m[1]}> non ha un <${m[1]}> di apertura corrispondente.`],
  [/^<(\S+)> \(line (\d+)\) must be closed before <\/(\S+)> on line (\d+)\.$/,
    (m) => `<${m[1]}> (riga ${m[2]}) va chiuso prima di </${m[3]}> alla riga ${m[4]}.`],
  [/^<(\S+)> has the attribute "(.+)" more than once\.$/, (m) => `<${m[1]}> ha l’attributo "${m[2]}" più di una volta.`],
  [/^<(\S+)> must be placed directly inside (.+)\.$/, (m) => `<${m[1]}> va messo direttamente dentro ${m[2].replace(/ or /g, ' o ')}.`],
  [/^<(\S+)> cannot be placed inside a <p>\. Close the paragraph first\.$/,
    (m) => `<${m[1]}> non può stare dentro un <p>. Chiudi prima il paragrafo.`],
  [/^<(\S+)> cannot be nested inside another <\1>\.$/, (m) => `<${m[1]}> non può stare dentro un altro <${m[1]}>.`],
  [/^<(\S+) \/> cannot be self-closing\. Use <\1><\/\1>\.$/, (m) => `<${m[1]} /> non può chiudersi da solo. Usa <${m[1]}></${m[1]}>.`],
  [/^<(\S+)> \(line (\d+)\) is never closed\.$/, (m) => `<${m[1]}> (riga ${m[2]}) non viene mai chiuso.`],

  // CSS validator
  [/^"(.+)" is missing a colon\. Write it as property: value;$/, (m) => `A "${m[1]}" mancano i due punti. Scrivilo come proprietà: valore;`],
  [/^Missing ";" after "(.*)"\.$/, (m) => `Manca ";" dopo "${m[1]}".`],
  [/^"(.+)" has no value\.$/, (m) => `"${m[1]}" non ha un valore.`],
  [/^"(.+)" is not a valid property name\.$/, (m) => `"${m[1]}" non è un nome di proprietà valido.`],
  [/^Unknown property "(.+)"\. Check the spelling\.$/, (m) => `Proprietà sconosciuta "${m[1]}". Controlla come l’hai scritta.`],
  [/^"(.*)" is not a valid value for (\S+)\.$/, (m) => `"${m[1]}" non è un valore valido per ${m[2]}.`],
  [/^"(.+)" is not a valid selector\.$/, (m) => `"${m[1]}" non è un selettore valido.`],
  [/^Unexpected "([\s\S]+)"\. Is a "\{" missing\?$/, (m) => `"${m[1]}" inatteso. Manca una "{"?`],
  [/^"([\s\S]+)" must be inside a rule like selector \{ \.\.\. \}\.$/, (m) => `"${m[1]}" deve stare dentro una regola come selettore { ... }.`],
  [/^"([\s\S]+)" is not a complete rule\.$/, (m) => `"${m[1]}" non è una regola completa.`],

  // JavaScript checks
  [/^Nothing in the console matches yet\. Last line: "([\s\S]*)"\.$/,
    (m) => `Nella console non c’è ancora niente di corrispondente. Ultima riga: "${m[1]}".`],
  [/^Log at least (\d+) lines? \(now (\d+)\)\.$/, (m) => `Scrivi almeno ${m[1]} ${m[1] === '1' ? 'riga' : 'righe'} nella console (ora ${m[2]}).`],
  [/^The console output isn't in the expected order \(matched (\d+) of (\d+)\)\.$/,
    (m) => `L’output della console non è nell’ordine previsto (corrispondono ${m[1]} su ${m[2]}).`],
  [/^Define a function called (.+)\.$/, (m) => `Definisci una funzione chiamata ${m[1]}.`],
  [/^Define a class called (.+)\.$/, (m) => `Definisci una classe chiamata ${m[1]}.`],
  [/^Declare a variable called (.+)\.$/, (m) => `Dichiara una variabile chiamata ${m[1]}.`],
  [/^(\S+) should be a function \(it is (\S+)\)\.$/, (m) => `${m[1]} deve essere una funzione (ora è ${m[2]}).`],
  [/^(\S+) should be ([\s\S]+) \(it is ([\s\S]+)\)\.$/, (m) => `${m[1]} dovrebbe valere ${m[2]} (ora vale ${m[3]}).`],
  [/^([\s\S]+\)) threw ([\s\S]+?)(?: \(line (\d+)\))?\.$/,
    (m) => `${m[1]} ha lanciato ${m[2]}${m[3] ? ` (riga ${m[3]})` : ''}.`],
  [/^([\s\S]+\)) should return ([\s\S]+), but returned ([\s\S]+)\.$/,
    (m) => `${m[1]} dovrebbe restituire ${m[2]}, ma ha restituito ${m[3]}.`],
  [/^Declare (\S+) with (let|const)\.$/, (m) => `Dichiara ${m[1]} con ${m[2]}.`],
  [/^"(.+)" shows "([\s\S]*)", which isn't what was asked\.$/, (m) => `"${m[1]}" mostra "${m[2]}", che non è quanto richiesto.`],
  [/^Expected (\S+) "(.+)" on the page, found (\d+)\.$/, (m) => `Nella pagina servono ${m[1]} "${m[2]}", ce ne sono ${m[3]}.`],
  [/^"(.+)" should (not )?have the class "(.+)"\.$/, (m) => `"${m[1]}" ${m[2] ? 'non deve' : 'deve'} avere la classe "${m[3]}".`],
  [/^"(.+)" should not have (\S+)\.$/, (m) => `"${m[1]}" non deve avere ${m[2]}.`],
  [/^"(.+)" should have (\S+?)="(.*)" \(now: (.*)\)\.$/, (m) => `"${m[1]}" deve avere ${m[2]}="${m[3]}" (ora: ${m[4]}).`],
  [/^"(.+)" should have the inline style (\S+) set as asked \(now: (.*)\)\.$/,
    (m) => `"${m[1]}" deve avere lo stile inline ${m[2]} impostato come richiesto (ora: ${m[3]}).`],
  [/^Nothing is saved under "(.+)" in localStorage\.$/, (m) => `In localStorage non c’è niente salvato sotto "${m[1]}".`],
  [/^localStorage "(.+)" isn't valid JSON: use JSON\.stringify\(\)\.$/, (m) => `localStorage "${m[1]}" non è JSON valido: usa JSON.stringify().`],
  [/^localStorage "(.+)" should be ([\s\S]+) \(now ([\s\S]+)\)\.$/, (m) => `localStorage "${m[1]}" dovrebbe essere ${m[2]} (ora ${m[3]}).`],
  [/^There is no "(.+)" element on the page\.$/, (m) => `Nella pagina non c’è nessun elemento "${m[1]}".`],
  [/^Fix the syntax error first \(line (.+)\)\.$/, (m) => `Correggi prima l’errore di sintassi (riga ${m[1]}).`],
  // Lesson messages built from values
  [/^Check the points for (\w+)\.$/, (m) => `Controlla i punti di ${m[1]}.`],
  [/^The nav has no link to #(.*)\.$/, (m) => `Il nav non ha un link a #${m[1]}.`],
  [/^Expected 2 rows, found (\d+)\.$/, (m) => `Servono 2 righe, ce ne sono ${m[1]}.`],
  [/^Print exactly 21 lines: 20 numbers\/words and the summary \(now (\d+)\)\.$/,
    (m) => `Stampa esattamente 21 righe: 20 numeri/parole e il riepilogo (ora ${m[1]}).`],
  [/^totalsByCustomer\(orders\) returned ([\s\S]+), expected ([\s\S]+)\.$/,
    (m) => `totalsByCustomer(orders) ha restituito ${m[1]}, invece di ${m[2]}.`],
  [/^loadUser\(99\) threw ([\s\S]+); throw new Error\(`HTTP \$\{res\.status\}`\) instead\.$/,
    (m) => `loadUser(99) ha lanciato ${m[1]}; lancia invece new Error(\`HTTP \${res.status}\`).`],
  [/^After a reload the list should have 3 items, not (\d+): empty it before adding new ones\.$/,
    (m) => `Dopo un reload l'elenco deve avere 3 elementi, non ${m[1]}: svuotalo prima di aggiungerne di nuovi.`],
  [/^After adding a Pen \(1\.5\) and a Notebook \(4\), total\(\) should be 5\.5, not ([\s\S]+)\.$/,
    (m) => `Dopo aver aggiunto una Pen (1.5) e un Notebook (4), total() dovrebbe valere 5.5, non ${m[1]}.`],
  [/^After adding two items, count\(\) should be 2, not ([\s\S]+)\.$/,
    (m) => `Dopo aver aggiunto due elementi, count() dovrebbe valere 2, non ${m[1]}.`],
  [/^After deposit\(50\) the balance should be 50, not ([\s\S]+)\.$/, (m) => `Dopo deposit(50) il saldo dovrebbe essere 50, non ${m[1]}.`],
  [/^After deposit\(50\) and withdraw\(20\) the balance should be 30, not ([\s\S]+)\.$/,
    (m) => `Dopo deposit(50) e withdraw(20) il saldo dovrebbe essere 30, non ${m[1]}.`],
  [/^For owner Test with 12\.5 in the account, summary should be "Test: €12\.50", not ([\s\S]+)\.$/,
    (m) => `Per il titolare Test con 12.5 sul conto, summary dovrebbe essere "Test: €12.50", non ${m[1]}.`],
  [/^With 200 at a rate of 0\.1, addInterest\(\) should bring the balance to 220, not ([\s\S]+)\.$/,
    (m) => `Con 200 a un tasso di 0.1, addInterest() dovrebbe portare il saldo a 220, non ${m[1]}.`],
  [/^parseAge\('(.*)'\) should throw a ValidationError\.$/, (m) => `parseAge('${m[1]}') dovrebbe lanciare una ValidationError.`],
  [/^parseAge\('(.*)'\) should throw new ValidationError\(\.\.\.\), not ([\s\S]+)\.$/,
    (m) => `parseAge('${m[1]}') dovrebbe lanciare new ValidationError(...), non ${m[2]}.`],
  [/^parseAge\('(.*)'\) should throw with the message "(.*)" \(got "(.*)"\)\.$/,
    (m) => `parseAge('${m[1]}') dovrebbe lanciare un errore con il messaggio "${m[2]}" (invece è "${m[3]}").`],
  [/^With nothing saved, loadPrefs\(\) threw ([\s\S]+)\.$/, (m) => `Senza niente di salvato, loadPrefs() ha lanciato ${m[1]}.`],
  [/^With nothing saved, loadPrefs\(\) should return the defaults, not ([\s\S]+)\.$/,
    (m) => `Senza niente di salvato, loadPrefs() dovrebbe restituire i valori predefiniti, non ${m[1]}.`],
  [/^With broken data saved, loadPrefs\(\) threw ([\s\S]+): wrap JSON\.parse in try\/catch\.$/,
    (m) => `Con dati rotti salvati, loadPrefs() ha lanciato ${m[1]}: racchiudi JSON.parse in try/catch.`],
  [/^With broken data saved, loadPrefs\(\) should return the defaults, not ([\s\S]+)\.$/,
    (m) => `Con dati rotti salvati, loadPrefs() dovrebbe restituire i valori predefiniti, non ${m[1]}.`],
  [/^Starting from 0, increment, increment, decrement should return 1, 2, 1 \(got ([\s\S]+)\)\.$/,
    (m) => `Partendo da 0, increment, increment, decrement dovrebbero restituire 1, 2, 1 (invece: ${m[1]}).`],
  [/^value\(\) should be 1 after those calls \(got ([\s\S]+)\)\.$/, (m) => `Dopo quelle chiamate value() dovrebbe valere 1 (invece: ${m[1]}).`],
  [/^createCounter\(10\) then decrement\(\) should give 9 \(got ([\s\S]+)\)\.$/,
    (m) => `createCounter(10) e poi decrement() dovrebbero dare 9 (invece: ${m[1]}).`],
  [/^Two counters should be independent: got ([\s\S]+) and ([\s\S]+) instead of 2 and 1\. Keep the count inside createCounter\.$/,
    (m) => `Due contatori devono essere indipendenti: valgono ${m[1]} e ${m[2]} invece di 2 e 1. Tieni il conteggio dentro createCounter.`],
  [/^Don't put the count on the object \(found: ([\s\S]+)\): keep it in a variable inside createCounter\.$/,
    (m) => `Non mettere il conteggio sull'oggetto (trovato: ${m[1]}): tienilo in una variabile dentro createCounter.`],
  [/^Expected fn to run once after the calls stop, it ran (\d+) times\.$/,
    (m) => `fn doveva partire una volta dopo la fine delle chiamate, è partita ${m[1]} volte.`],
  [/^Expected exactly 1 search after typing, got (\d+)\.$/, (m) => `Dopo la digitazione serviva esattamente 1 ricerca, ce ne sono state ${m[1]}.`],
  [/^Define at least (\d+) custom properties on :root \(found (\d+)\)\.$/,
    (m) => `Definisci almeno ${m[1]} proprietà personalizzate su :root (ce ne sono ${m[2]}).`],
  [/^The space between logo and nav should be 32px \(now (-?\d+)px\)\.$/,
    (m) => `Lo spazio tra logo e nav deve essere 32px (ora ${m[1]}px).`],

  // usesMethod's default: "Use .map()." (code only, no spaces)
  [/^Use (\S+)\.$/, (m) => `Usa ${m[1]}.`],
];

function toItalian(msg: string): string {
  const known = itMessages[msg] ?? exact[msg];
  if (known) return known;
  for (const [re, fn] of rules) {
    const m = msg.match(re);
    if (m) return fn(m, toItalian);
  }
  return msg;
}

export function translateMessage(msg: string, lang: Lang): string {
  return lang === 'it' ? toItalian(msg) : msg;
}
