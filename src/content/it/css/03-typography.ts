import type { ModuleText } from '../../localize';

export default {
  title: 'Tipografia',
  description: 'Font, dimensioni, unità di misura e spaziature che rendono il testo un piacere da leggere.',
  items: {
    'css-fonts': {
      title: 'Font',
      explanation: `\`font-family\` accetta un **elenco** di font. Il browser usa il primo installato, quindi finisci sempre con
una *famiglia generica*: \`serif\`, \`sans-serif\`, \`monospace\`, \`system-ui\`…

\`\`\`css
body {
  font-family: "Helvetica Neue", Arial, sans-serif;
}
code {
  font-family: ui-monospace, Menlo, Consolas, monospace;
}
\`\`\`

I nomi dei font con spazi vanno tra virgolette. Altre proprietà dei font:

- \`font-weight\`: \`normal\` (400), \`bold\` (700), o qualsiasi numero da 100 a 900 se il font lo prevede.
- \`font-style\`: \`normal\` o \`italic\`.
- \`font\`: una scorciatoia, es. \`font: italic 700 18px/1.5 Georgia, serif;\` (stile, peso, dimensione/interlinea, famiglia).

Le proprietà dei font si **ereditano**: impostale su \`body\` e tutta la pagina si adegua.`,
      tasks: [
        'Imposta il font della pagina a Georgia, con serif come ripiego (su body)',
        'Dai all\'<h1> un elenco di font sans-serif che finisca con sans-serif',
        'Metti .meta in corsivo',
        'Dai all\'<h1> peso 900',
      ],
      hints: ['h1 { font-family: "Helvetica Neue", Arial, sans-serif; font-weight: 900; }'],
    },
    'css-units': {
      title: 'Dimensioni e unità di misura',
      explanation: `Il CSS ha unità **assolute** e **relative**:

| Unità | Relativa a | Usala per |
|---|---|---|
| \`px\` | niente (un pixel CSS) | bordi, piccoli dettagli fissi |
| \`rem\` | la dimensione del font della **radice** (\`<html>\`), 16px di default | dimensioni dei font, spaziature |
| \`em\` | la dimensione del font **dell'elemento stesso** | spaziature che devono crescere con il loro testo |
| \`%\` | il genitore | larghezze |

Preferisci \`rem\` per le dimensioni dei font: se un utente aumenta la dimensione predefinita del font nel browser,
tutta la tua pagina cresce con lei. Con \`px\` no.

\`\`\`css
h1 { font-size: 2.5rem; }     /* 40px by default */
.btn { padding: 0.5em 1em; }  /* grows with the button's own text */
\`\`\``,
      tasks: [
        'Cambia la dimensione dell\'<h1> in 2.5rem (sempre 40px, ma scalabile)',
        'Rendi i paragrafi 1.125rem (18px)',
        'Rendi .meta 0.875rem (14px)',
        'Non usare px per le dimensioni dei font',
      ],
      hints: ['1rem = 16px, quindi 18px = 1.125rem e 14px = 0.875rem.'],
    },
    'css-text': {
      title: 'Testo leggibile',
      explanation: `Poche proprietà fanno la differenza più grande per la leggibilità:

- \`line-height\`: lo spazio tra le righe. Il testo si legge meglio intorno a **1.5**. Usa un numero senza unità così
  cresce insieme alla dimensione del font.
- \`max-width\`: le righe troppo lunghe stancano. Punta a **45–75 caratteri**: \`max-width: 65ch\`
  (\`ch\` = la larghezza del carattere "0").
- \`text-align\`: \`left\` (predefinito), \`center\`, \`right\`, \`justify\` (evitalo sul web: crea spazi irregolari).
- \`letter-spacing\`, \`text-transform: uppercase\`: ottimi per piccole etichette.
- \`text-decoration\`: sottolineato/nessuno, per esempio per i link.

\`\`\`css
article {
  max-width: 65ch;
  margin: 0 auto;   /* centre the column */
  line-height: 1.6;
}
\`\`\``,
      tasks: [
        'Imposta line-height 1.6 sull\'articolo',
        'Limita l\'articolo a max-width: 60ch',
        'Centra la colonna dell\'articolo con margin: 0 auto',
        'Trasforma .meta in un\'etichetta maiuscola con letter-spacing di 0.1em',
        'Centra il testo dell\'<h1>',
      ],
      hints: ['margin: 0 auto centra un blocco che ha una width o una max-width.'],
    },
    'css-webfonts': {
      title: 'Web font',
      explanation: `Per usare un font che non è installato sul dispositivo dell'utente, caricalo come **web font**. Il modo più
semplice è Google Fonts: collega il suo foglio di stile nel tuo HTML, poi usa il nome della famiglia.

\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap">
\`\`\`

\`\`\`css
body {
  font-family: "Lora", Georgia, serif;
}
\`\`\`

Oppure ospita tu il file con \`@font-face\`:

\`\`\`css
@font-face {
  font-family: "Lora";
  src: url("fonts/lora.woff2") format("woff2");
  font-display: swap;   /* show fallback text while the font loads */
}
\`\`\`

Tieni i ripieghi nell'elenco: se il font non si carica, la pagina ha comunque un bell'aspetto. Carica solo i pesi
che usi: ogni file in più rallenta la pagina.`,
      tasks: [
        'Carica "Lora" da Google Fonts con un <link> in <head>',
        'Carica solo i pesi 400 e 700, con display=swap',
        'Usa "Lora" su body, mantenendo Georgia, serif come ripieghi',
        'Fai usare all\'<h1> il peso grassetto (700) che hai caricato',
      ],
      hints: ['Copia il <link> dalla spiegazione nell\'<head> di index.html.'],
    },
    'css-type-challenge': {
      title: 'Sfida: un articolo bello da leggere',
      summary: 'Trasforma un muro di testo in un articolo che le persone leggono volentieri.',
      explanation: `Rendi questo articolo comodo da leggere: confrontalo con la scheda **Obiettivo**. Requisiti:

- Testo del corpo: elenco \`system-ui, sans-serif\`, \`1.125rem\`, line-height \`1.7\`, colore \`#1f2937\`.
- La colonna dell'articolo: larga al massimo \`65ch\` e centrata.
- Titoli: \`Georgia, serif\`; l'\`<h1>\` è \`2.5rem\` con line-height \`1.2\`.
- \`.lead\` (l'introduzione): \`1.25rem\`, colore \`#4b5563\`.
- Link: colore \`#b45309\`, sottolineati solo al passaggio del mouse.
- Nessuna dimensione di font in \`px\`.`,
      tasks: [
        'Testo del corpo: elenco system-ui, 1.125rem, line-height 1.7, colore #1f2937',
        'Articolo largo al massimo 65ch e centrato',
        'Titoli in Georgia, serif',
        'h1: 2.5rem con line-height 1.2',
        '.lead: 1.25rem, colore #4b5563',
        'Link: #b45309, sottolineati solo con hover',
        'Nessuna dimensione di font in px',
      ],
      hints: ['Imposta una volta sola gli stili del testo su article (o body): ogni paragrafo li eredita.', 'line-height 1.2 su un titolo di 40px viene calcolato come 48px.'],
    },
  },
  messages: {
    'On body: font-family: Georgia, serif;': 'Su body: font-family: Georgia, serif;',
    'Use rem instead of px for font-size.': 'Usa rem invece di px per font-size.',
    'Set line-height: 1.6 on article.': 'Imposta line-height: 1.6 su article.',
    'Add letter-spacing: 0.1em.': 'Aggiungi letter-spacing: 0.1em.',
    'Add the Google Fonts <link> for Lora inside <head>.': 'Aggiungi dentro <head> il <link> di Google Fonts per Lora.',
    'Use the URL ...family=Lora:wght@400;700&display=swap': 'Usa l\'URL ...family=Lora:wght@400;700&display=swap',
    'Use Lora in your CSS.': 'Usa Lora nel tuo CSS.',
    'Set line-height: 1.7.': 'Imposta line-height: 1.7.',
    'The article should be narrower than the page.': 'L\'articolo deve essere più stretto della pagina.',
    'Add a:hover { text-decoration: underline; }': 'Aggiungi a:hover { text-decoration: underline; }',
    'Use rem, not px, for font sizes.': 'Usa rem, non px, per le dimensioni dei font.',
  },
} satisfies ModuleText;
