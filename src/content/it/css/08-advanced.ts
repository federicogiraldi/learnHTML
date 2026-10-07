import type { ModuleText } from '../../localize';

export default {
  title: 'CSS avanzato',
  description: 'Proprietà personalizzate, posizionamento, transizioni, animazioni, annidamento e modalità scura.',
  items: {
    'css-variables': {
      title: 'Proprietà personalizzate (variabili CSS)',
      explanation: `Le **proprietà personalizzate** memorizzano valori che riusi. Iniziano con \`--\` e si leggono con \`var()\`:

\`\`\`css
:root {
  --brand: #e44d26;
  --radius: 8px;
}
.btn {
  background: var(--brand);
  border-radius: var(--radius);
}
\`\`\`

- Definisci quelle globali su \`:root\` (l'elemento \`<html>\`).
- Si **ereditano** e si possono sovrascrivere su qualsiasi elemento: una classe \`.theme-ocean\` può ridefinire \`--brand\`
  e tutto ciò che sta al suo interno cambia colore.
- \`var(--size, 16px)\` fornisce un ripiego se la variabile non è definita.

Cambi un valore e tutto il design si adegua. È questo che rende facili i temi e le modalità scure.`,
      tasks: [
        'Definisci --brand: #e44d26 e --radius: 8px su :root',
        'Usa var(--brand) e var(--radius) in .btn',
        'Dentro .theme-ocean, ridefinisci --brand come #0284c7',
      ],
      hints: ['.theme-ocean { --brand: #0284c7; }: non serve toccare di nuovo .btn.'],
    },
    'css-position': {
      title: 'Posizionamento',
      explanation: `\`position\` toglie un elemento dal flusso normale:

| Valore | Posizionato rispetto a | Uso tipico |
|---|---|---|
| \`static\` | — (flusso normale, predefinito) | |
| \`relative\` | la sua posizione normale; diventa anche l'**ancora** per i figli absolute | contenitori |
| \`absolute\` | l'antenato posizionato più vicino | badge, sovrapposizioni |
| \`fixed\` | il viewport | pulsanti della chat |
| \`sticky\` | scorre normalmente, poi si blocca a \`top\` | header, intestazioni di tabella |

\`\`\`css
.card { position: relative; }
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
header {
  position: sticky;
  top: 0;
  z-index: 10;   /* stack above the content that scrolls under it */
}
\`\`\``,
      tasks: [
        'Rendi .card l\'ancora del posizionamento (position: relative)',
        'Metti .badge nell\'angolo in alto a destra, a 8px da ogni bordo',
        'Rendi l\'header sticky in alto, sopra a tutto (z-index 10)',
      ],
      hints: ['Un elemento absolute viene posizionato dal bordo del padding della sua ancora, dentro il bordo.'],
    },
    'css-transitions': {
      title: 'Trasformazioni e transizioni',
      explanation: `\`transform\` sposta, ridimensiona o ruota un elemento **senza toccare l'impaginazione** intorno:
\`translateY(-4px)\`, \`scale(1.05)\`, \`rotate(45deg)\`.

\`transition\` anima il passaggio tra due stati (es. normale → \`:hover\`):

\`\`\`css
.card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgb(0 0 0 / 20%);
}
\`\`\`

Metti la \`transition\` sullo stato **normale**, così anima sia l'entrata sia l'uscita. Quando puoi, anima \`transform\` e
\`opacity\`: sono le proprietà più economiche da animare in modo fluido per il browser.`,
      tasks: [
        'Su .card:hover, sollevala con transform: translateY(-4px)',
        'Anima il cambiamento con una transition su .card (200ms)',
        'Ruota l\'icona + di 45° con hover, con una transition',
      ],
      hints: ['transition: transform 200ms ease; va su .card stessa.'],
    },
    'css-animations': {
      title: 'Animazioni con keyframe',
      explanation: `Le transizioni vanno da A a B quando qualcosa cambia. Le **animazioni** partono da sole, attraverso quanti passaggi
vuoi, definiti con \`@keyframes\`:

\`\`\`css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.1); }
}

.dot {
  animation: pulse 1.5s ease-in-out infinite;
}
\`\`\`

\`animation\` = nome, durata, funzione di temporizzazione, numero di ripetizioni (e altro: ritardo, direzione…).

Ad alcune persone il movimento dà capogiri o nausea. Rispetta la loro impostazione di sistema:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .dot { animation: none; }
}
\`\`\``,
      tasks: [
        'Definisci @keyframes spin da rotate(0) a rotate(360deg)',
        'Fai girare .loader: 1s, linear, infinite',
        'Fai pulsare .new con un\'animazione @keyframes pulse',
        'Disattiva le animazioni con prefers-reduced-motion: reduce',
      ],
      hints: ['animation: spin 1s linear infinite;'],
    },
    'css-nesting': {
      title: 'Annidamento e cascade layer',
      explanation: `L'**annidamento nativo** ti permette di scrivere le regole collegate dentro il loro genitore, come in Sass:

\`\`\`css
.card {
  padding: 16px;

  & h2 { margin-top: 0; }          /* .card h2 */
  &:hover { background: #f8fafc; } /* .card:hover */
  &.featured { border-color: gold; } /* .card.featured */
}
\`\`\`

\`&\` sta per il selettore del genitore. Non annidare troppo in profondità: 2–3 livelli bastano e avanzano.

I **cascade layer** (\`@layer\`) controllano quale gruppo di regole vince, indipendentemente dalla specificità:

\`\`\`css
@layer reset, base, components;   /* later layers win */

@layer base {
  a { color: blue; }
}
@layer components {
  .btn { color: white; }
}
\`\`\``,
      tasks: [
        'Annida le regole h2, a e .featured dentro .post usando &',
        'Il risultato è lo stesso: titoli blu, link in grassetto, bordo dorato per il featured',
        'Dichiara i layer "@layer base, components;" e metti .post dentro @layer components',
      ],
      hints: ['.post { ... & h2 { ... } & a { ... } &.featured { ... } }'],
    },
    'css-dark-mode': {
      title: 'Modalità scura',
      explanation: `Con le proprietà personalizzate, la modalità scura è solo un secondo insieme di valori:

\`\`\`css
:root {
  color-scheme: light dark;   /* native controls and scrollbars follow too */
  --bg: #ffffff;
  --text: #1f2937;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111827;
    --text: #f3f4f6;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}
\`\`\`

\`prefers-color-scheme\` segue l'impostazione del sistema operativo dell'utente. Controlla il contrasto in **entrambi** i temi,
ed evita sfondi nero puro \`#000\`: un grigio molto scuro affatica meno gli occhi.`,
      tasks: [
        'Sposta i colori in --bg, --text e --link su :root',
        'Usali con var() in body e in a',
        'Aggiungi color-scheme: light dark su :root',
        'Ridefinisci le variabili in @media (prefers-color-scheme: dark)',
      ],
      hints: ['Dentro la media query cambiano solo i valori di :root; body e a restano uguali.'],
    },
    'css-capstone': {
      title: 'Progetto finale: dai stile al tuo portfolio',
      summary: 'Tutto insieme: un design completo, responsive, con temi e accessibile.',
      explanation: `Il progetto finale. Questa è la pagina portfolio del progetto finale di HTML: ora dalle un design completo tutto
**tuo**. Le verifiche controllano le tecniche, non i colori: sii creativo.

Requisiti:
- Un design system: almeno **4 proprietà personalizzate** su \`:root\`, usate tramite \`var()\`.
- \`box-sizing: border-box\` ovunque e testo leggibile (line-height di almeno 1.5).
- Contenuto centrato in una colonna di al massimo \`1000px\`.
- Un header **sticky** con i link di navigazione in riga.
- Una griglia dei progetti: 1 colonna sui telefoni (375px), almeno 2 colonne a 900px.
- Le immagini non strabordano mai.
- Link e pulsanti hanno uno stato \`:hover\` con una \`transition\`, e un outline \`:focus-visible\` visibile.
- Una **modalità scura** che ridefinisce le tue variabili, e animazioni/transizioni disattivate con
  \`prefers-reduced-motion\`.
- CSS valido, nessun \`!important\`.`,
      tasks: [
        'Almeno 4 proprietà personalizzate su :root, usate con var()',
        'border-box ovunque; line-height di almeno 1.5',
        'Colonna del contenuto al massimo di 1000px e centrata',
        'Header sticky; link del nav in riga',
        'Progetti: 1 colonna a 375px, almeno 2 a 900px',
        'Le immagini non escono mai dalla loro card',
        'Stati hover con transizioni su link o pulsanti',
        'Un outline :focus-visible visibile',
        'La modalità scura ridefinisce le variabili',
        'Rispetta prefers-reduced-motion',
        'Nessun !important',
      ],
      hints: [
        'Parti dalle variabili su :root e dalla regola border-box, poi dai stile alla pagina dall\'alto verso il basso.',
        '.projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; } copre entrambe le larghezze.',
        'Le lezioni su variabili, posizionamento, transizioni e modalità scura coprono ognuna un requisito.',
      ],
    },
  },
  messages: {
    'Inside @media (prefers-color-scheme: dark), redefine your custom properties (e.g. on :root).':
      'Dentro @media (prefers-color-scheme: dark), ridefinisci le tue proprietà personalizzate (es. su :root).',
    'Use background: var(--brand) in .btn.': 'Usa background: var(--brand) in .btn.',
    'Use border-radius: var(--radius) in .btn.': 'Usa border-radius: var(--radius) in .btn.',
    'Use top: 8px; right: 8px; (the card has a 1px border).': 'Usa top: 8px; right: 8px; (la card ha un bordo di 1px).',
    'Write .card:hover { transform: translateY(-4px); }': 'Scrivi .card:hover { transform: translateY(-4px); }',
    'Set transition: transform 200ms ease; on .card (not on :hover).': 'Imposta transition: transform 200ms ease; su .card (non su :hover).',
    'Add a transition to .icon.': 'Aggiungi una transition a .icon.',
    'Write @keyframes spin { to { transform: rotate(360deg); } }': 'Scrivi @keyframes spin { to { transform: rotate(360deg); } }',
    'Define @keyframes pulse.': 'Definisci @keyframes pulse.',
    'Add @media (prefers-reduced-motion: reduce) { ... }.': 'Aggiungi @media (prefers-reduced-motion: reduce) { ... }.',
    'Nest "& h2" and "& a" inside .post { ... }.': 'Annida "& h2" e "& a" dentro .post { ... }.',
    'Nest "&.featured" inside .post.': 'Annida "&.featured" dentro .post.',
    'Remove the old top-level ".post h2" rule.': 'Togli la vecchia regola ".post h2" al primo livello.',
    'Declare @layer base, components;': 'Dichiara @layer base, components;',
    'Wrap the .post rule in @layer components { ... }.': 'Racchiudi la regola .post in @layer components { ... }.',
    'Use background: var(--bg);': 'Usa background: var(--bg);',
    'Use your variables with var() in at least 4 places.': 'Usa le tue variabili con var() in almeno 4 punti.',
    'Add the universal box-sizing: border-box rule.': 'Aggiungi la regola universale box-sizing: border-box.',
    'Set line-height: 1.5 or more on body.': 'Imposta line-height: 1.5 o più su body.',
    '.container should be at most 1000px wide and centred.': '.container deve essere larga al massimo 1000px e centrata.',
    'At 900px show at least 2 columns.': 'A 900px mostra almeno 2 colonne.',
    'Images overflow their card: max-width: 100%; height: auto;': 'Le immagini escono dalla loro card: max-width: 100%; height: auto;',
    'Add :hover styles to links or buttons.': 'Aggiungi stili :hover a link o pulsanti.',
    'Add a transition to your links or buttons.': 'Aggiungi una transition ai tuoi link o pulsanti.',
    'Style :focus-visible with an outline.': 'Dai stile a :focus-visible con un outline.',
    'Add @media (prefers-reduced-motion: reduce) to turn off motion.': 'Aggiungi @media (prefers-reduced-motion: reduce) per disattivare il movimento.',
  },
} satisfies ModuleText;
