import type { ModuleText } from '../../localize';

export default {
  title: 'Accessibilità',
  description: 'Pagine che tutti possono usare: testo alternativo, struttura, accesso da tastiera e ARIA fatto bene.',
  items: {
    'a11y-alt': {
      title: 'Scrivere un buon testo alternativo',
      explanation: `Circa una persona su sei vive con una disabilità. Molte usano **tecnologie assistive**: screen reader,
controllo vocale, navigazione solo da tastiera, ingrandimento. Un buon HTML è la base dell'accessibilità.

Il testo alternativo dipende dallo **scopo** dell'immagine:

| Immagine | alt |
|---|---|
| Foto informativa | Descrivi ciò che conta: \`alt="Two kids planting a tree"\` |
| Immagine dentro un link o un pulsante | Descrivi l'**azione / la destinazione**: \`alt="Home"\` |
| Decorativa (bordi, abbellimenti) | Vuoto: \`alt=""\`, così lo screen reader la salta |
| Immagine di un testo | Il testo stesso |

Evita "immagine di…" o "foto di…": gli screen reader annunciano già che è un'immagine. Non omettere mai del tutto \`alt\`:
altrimenti lo screen reader legge il nome del file, tipo "IMG_4032.jpg".`,
      tasks: [
        'L\'immagine del logo nel link descrive la sua destinazione (es. "Recipes home")',
        'La foto del caffè ha una vera descrizione (non solo "image")',
        'Il bordo decorativo ha alt=""',
        'Ogni immagine ha un attributo alt',
      ],
      hints: ['Un alt vuoto si scrive alt="": l\'attributo c\'è, il valore è vuoto.'],
    },
    'a11y-structure': {
      title: 'Lingua, titoli e zone della pagina',
      explanation: `Chi usa uno screen reader spesso scorre una pagina per **titoli** o per **zone** (landmark), proprio come chi
vede la scorre con lo sguardo. Funziona solo se:

1. La pagina dichiara la sua lingua (\`<html lang="en">\`), così vengono usate la voce e la pronuncia giuste.
   Le parti in un'altra lingua hanno il loro \`lang\`.
2. C'è uno **schema dei titoli** chiaro: un solo \`<h1>\`, nessun livello saltato.
3. La pagina usa le **zone** (\`header\`, \`nav\`, \`main\`, \`footer\`). Se ci sono due \`<nav>\`, dai a ognuno un
   \`aria-label\` per poterli distinguere.

Uno **skip link** come primo elemento permette a chi usa la tastiera di saltare oltre la navigazione:

\`\`\`html
<a href="#content">Skip to main content</a>
...
<main id="content">...</main>
\`\`\``,
      tasks: [
        'Dichiara la lingua della pagina con <html lang="en">',
        'Marca il motto latino con lang="la"',
        'Correggi lo schema dei titoli (h1, poi h2)',
        'Dai un aria-label ai due nav per poterli distinguere',
        'Aggiungi uno skip link come prima cosa in <body>, che punti a <main>',
      ],
      hints: ['Racchiudi le parole latine in uno <span lang="la">.', 'Dai a <main> un id come "content".'],
    },
    'a11y-keyboard': {
      title: 'Tastiera e pulsanti veri',
      explanation: `Molte persone navigano solo con la **tastiera**: Tab passa da un elemento interattivo all'altro, Invio o Spazio
li attivano. Gli elementi nativi ti danno tutto questo gratis:

- \`<a href>\`: porta da qualche parte (una nuova pagina o un punto della pagina).
- \`<button>\`: fa qualcosa (apre un menu, invia, attiva/disattiva).

Un \`<div onclick="...">\` cliccabile **non** si raggiunge con Tab, e gli screen reader non sanno che è cliccabile.
Usa sempre l'elemento vero.

\`tabindex\`:

- \`tabindex="0"\` rende raggiungibile un elemento non interattivo (serve di rado).
- \`tabindex="-1"\` lo rende raggiungibile solo da script.
- **Non** usare mai valori positivi come \`tabindex="5"\`: scombinano l'ordine naturale del Tab.

Provalo: clicca nell'anteprima e premi Tab, e guarda quali elementi ricevono il focus.`,
      tasks: [
        '"Add to cart" è un vero <button type="button">',
        '"Go to checkout" è un vero link a /checkout',
        'Nessun div/span cliccabile rimasto',
        'Nessun valore di tabindex positivo',
      ],
      hints: ['Un pulsante può tenere il suo onclick: <button type="button" onclick="...">.'],
    },
    'a11y-aria': {
      title: 'ARIA: l\'ultima risorsa',
      explanation: `Gli attributi **ARIA** (Accessible Rich Internet Applications) aggiungono informazioni di accessibilità quando
l'HTML da solo non basta a esprimerle. La prima regola di ARIA: **non usare ARIA se un elemento nativo fa già il lavoro.**
\`<button>\` batte \`<div role="button">\`, sempre.

Dove ARIA *è* utile:

- \`aria-label\`: un nome accessibile per elementi senza testo visibile, come un pulsante con un'icona:
  \`<button aria-label="Close">✕</button>\`
- \`aria-describedby\`: collega un controllo a un testo di aiuto tramite id.
- \`aria-expanded="true|false"\`: dice se il menu di un pulsante è aperto.
- \`aria-hidden="true"\`: nasconde agli screen reader i contenuti decorativi (come un'icona accanto a un testo).
- \`aria-live="polite"\`: annuncia i contenuti che cambiano, come "Salvato!".

\`\`\`html
<label for="pw">Password</label>
<input type="password" id="pw" aria-describedby="pw-help">
<p id="pw-help">At least 8 characters.</p>
\`\`\``,
      tasks: [
        'Dai un aria-label al pulsante con l\'icona ☰',
        'Il pulsante del menu ☰ dice che è chiuso (aria-expanded="false")',
        'Nascondi agli screen reader l\'emoji decorativa 🔍',
        'Collega l\'input dello username al suo testo di aiuto',
        'Annuncia "Saved!" con aria-live="polite"',
        'Sostituisci il finto pulsante div con un vero <button>',
      ],
      hints: ['aria-expanded va sul pulsante che apre e chiude il menu.'],
    },
    'a11y-challenge': {
      title: 'Sfida: verifica di accessibilità',
      summary: 'Una pagina per la newsletter non supera una verifica su 9 punti. Correggili tutti.',
      explanation: `Una verifica di accessibilità ha segnalato questa pagina di iscrizione alla newsletter. Correggi **ogni** problema
perché la superi: i 9 requisiti sono nascosti, e ognuno si rivela quando è superato. Pensa a: lingua, titoli, immagini,
etichette, tastiera, testo dei link e uso sbagliato di ARIA.`,
      tasks: [
        'La pagina dichiara la sua lingua',
        'Il logo ha un testo alternativo significativo',
        'Lo schema dei titoli parte da h1 e non salta mai livelli',
        'Esattamente un <h1>',
        'Il campo email ha una vera etichetta (il placeholder non basta)',
        'L\'iscrizione usa un vero pulsante di invio',
        'Il testo del link alla privacy descrive la sua destinazione',
        'Nessun tabindex positivo',
        'Il campo email è obbligatorio',
      ],
      hints: [
        'Il nome del sito nell\'header e il titolo della pagina si fanno concorrenza. Quale dei due è l\'argomento principale della pagina?',
        'I placeholder spariscono appena scrivi: una <label> serve sempre.',
      ],
    },
  },
  messages: {
    'The linked logo should say where it goes, e.g. alt="Recipes home".': 'Il logo nel link deve dire dove porta, es. alt="Recipes home".',
    'Describe the photo in a few words.': 'Descrivi la foto in poche parole.',
    'Don\'t start with "image of" — just describe it.': 'Non iniziare con "image of": descrivila e basta.',
    'Decorative images need an empty alt="".': 'Le immagini decorative hanno bisogno di un alt="" vuoto.',
    'Add lang="en" to <html>.': 'Aggiungi lang="en" a <html>.',
    'Give each nav a different label.': 'Dai a ogni nav un\'etichetta diversa.',
    'The first element in <body> should be <a href="#..."> pointing at the id of <main>.':
      'Il primo elemento in <body> deve essere un <a href="#..."> che punta all\'id di <main>.',
    'Replace clickable <div>/<span> with real elements.': 'Sostituisci i <div>/<span> cliccabili con elementi veri.',
    'Remove the positive tabindex values.': 'Togli i valori di tabindex positivi.',
    'Add aria-label="Menu" to the ☰ button.': 'Aggiungi aria-label="Menu" al pulsante ☰.',
    'Use a real <button> instead of role="button".': 'Usa un vero <button> invece di role="button".',
    'Add a lang attribute to <html>.': 'Aggiungi un attributo lang a <html>.',
    'Add a <button> (type submit) to the form.': 'Aggiungi al form un <button> (di tipo submit).',
    'Remove the fake div button.': 'Togli il finto pulsante div.',
    'Keep the link to /privacy.': 'Mantieni il link a /privacy.',
    'Make the link text say where it goes, e.g. "privacy policy".': 'Fai dire al testo del link dove porta, es. "privacy policy".',
    'Remove positive tabindex values.': 'Togli i valori di tabindex positivi.',
  },
} satisfies ModuleText;
