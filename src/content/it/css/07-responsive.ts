import type { ModuleText } from '../../localize';

export default {
  title: 'Design responsive',
  description: 'Una sola pagina che funziona su telefoni, tablet e schermi larghi.',
  items: {
    'css-fluid-units': {
      title: 'Unità fluide e clamp()',
      explanation: `Il design responsive parte da dimensioni che **si adattano**:

| Unità | Relativa a |
|---|---|
| \`%\` | la dimensione del genitore |
| \`vw\` / \`vh\` | l'1% della larghezza / altezza del viewport |
| \`min()\`, \`max()\` | il più piccolo / il più grande di più valori |
| \`clamp(min, ideale, max)\` | il valore ideale, ma mai sotto min o sopra max |

\`\`\`css
h1 {
  font-size: clamp(1.75rem, 5vw, 3.5rem);  /* grows with the screen, within limits */
}
.container {
  width: min(90%, 1000px);                 /* 90% on small screens, max 1000px */
  margin-inline: auto;
}
\`\`\`

Per il testo usa \`vw\` solo dentro \`clamp()\`: le dimensioni dei font solo in \`vw\` non rispondono allo zoom dell'utente.`,
      tasks: [
        'Dimensiona il titolo con clamp(1.5rem, 6vw, 3rem)',
        'A 800px il titolo raggiunge il suo massimo di 48px',
        'A 300px si ferma al suo minimo di 24px',
        'A 600px è 6vw = 36px',
        'Dai al contenitore width: min(90%, 700px) così non esce mai dallo schermo',
      ],
      hints: ['clamp() vuole tre valori: il minimo, il valore preferito e il massimo.'],
    },
    'css-media-queries': {
      title: 'Media query',
      explanation: `Una **media query** applica delle regole solo quando una condizione è vera, di solito la larghezza del viewport:

\`\`\`css
.cards {
  display: grid;
  gap: 16px;
}

@media (min-width: 600px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
\`\`\`

La larghezza a cui l'impaginazione cambia si chiama **breakpoint**. Scegli i breakpoint dove *il tuo contenuto* inizia
a stare male, non in base a dispositivi specifici. Ricorda il meta tag viewport nel tuo HTML, altrimenti i telefoni
ignorano tutto questo: \`<meta name="viewport" content="width=device-width, initial-scale=1">\`.`,
      tasks: [
        'Usa una @media query con min-width: 600px',
        'Sugli schermi stretti (400px) le card stanno in una sola colonna',
        'Da 600px in su ci sono 3 colonne',
      ],
      hints: ['Sposta grid-template-columns dentro la media query. Senza, una griglia ha una sola colonna.'],
    },
    'css-mobile-first': {
      title: 'Mobile first',
      explanation: `**Mobile first** significa: scrivi gli stili di base per lo schermo più piccolo, poi *aggiungi* complessità con
query \`min-width\` man mano che lo spazio cresce. Porta a un CSS più semplice rispetto a partire dal desktop e poi disfare.

\`\`\`css
/* base: phones */
.layout { display: grid; gap: 16px; }

/* tablets */
@media (min-width: 640px) {
  .layout { grid-template-columns: 1fr 1fr; }
}

/* desktops */
@media (min-width: 1000px) {
  .layout { grid-template-columns: 220px 1fr 1fr; }
}
\`\`\`

Questo codice iniziale è stato scritto partendo dal desktop, con query \`max-width\`. Riscrivilo in versione mobile first.`,
      tasks: [
        'Niente media query max-width: usa solo min-width',
        'Telefono (400px): menu impilato e una sola colonna di card',
        'Tablet (700px): menu in riga, 2 colonne di card',
        'Schermo largo (1000px): 3 colonne di card',
      ],
      hints: ['Base: .menu con flex-direction column, .cards a una colonna. Poi @media (min-width: 640px) per il menu in riga e 2 colonne, e @media (min-width: 900px) per 3 colonne.'],
    },
    'css-responsive-media': {
      title: 'Immagini responsive',
      explanation: `Le immagini hanno una dimensione intrinseca e strabordano volentieri da uno schermo piccolo. La soluzione classica:

\`\`\`css
img {
  max-width: 100%;   /* never wider than the container */
  height: auto;      /* keep the proportions */
  display: block;    /* removes the small gap under inline images */
}
\`\`\`

Per ritagliare un'immagine in una forma fissa senza deformarla, combina \`aspect-ratio\` e \`object-fit\`:

\`\`\`css
.thumb {
  width: 100%;
  aspect-ratio: 1;       /* square */
  object-fit: cover;     /* fill the box, crop the excess */
}
\`\`\``,
      tasks: [
        'Le immagini non strabordano mai: max-width: 100% e height: auto',
        'La hero mantiene le sue proporzioni 2:1',
        'Rendi .thumb un ritaglio quadrato: aspect-ratio 1 e object-fit: cover',
      ],
      hints: ['Per il quadrato: .thumb { width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; }'],
    },
    'css-container-queries': {
      title: 'Container query',
      explanation: `Le media query guardano il **viewport**. Ma una card potrebbe stare in una colonna principale larga in una pagina e in
una barra laterale stretta in un'altra. Le **container query** fanno rispondere un componente alla dimensione del suo
*contenitore*:

\`\`\`css
.slot {
  container-type: inline-size;   /* this element can be queried */
}

@container (min-width: 400px) {
  .profile {
    display: flex;               /* side by side when there is room */
    gap: 16px;
  }
}
\`\`\`

Lo stesso markup di \`.profile\` ora si adatta ovunque lo metti.`,
      tasks: [
        'Rendi .slot un contenitore interrogabile (container-type: inline-size)',
        'Usa @container (min-width: 400px) per disporre .profile con flex',
        'Nello slot largo, immagine e testo stanno affiancati',
        'Nello slot stretto restano uno sotto l\'altro',
      ],
      hints: ['Dentro il blocco @container: .profile { display: flex; gap: 16px; align-items: center; }', 'Le immagini sono inline di default: nello slot stretto aggiungi img { display: block; } così il testo va sotto.'],
    },
    'css-responsive-challenge': {
      title: 'Sfida: landing page responsive',
      summary: 'Una pagina, tre impaginazioni: telefono, tablet e desktop.',
      explanation: `Fai funzionare questa landing page a tre dimensioni, **mobile first** (solo query \`min-width\`). Confrontala con la
scheda **Obiettivo** e ridimensiona l'anteprima.

| Larghezza | Header | Caratteristiche | Titolo della hero |
|---|---|---|---|
| 375px (telefono) | logo sopra il nav, entrambi centrati | 1 colonna | 2rem |
| 768px (tablet) | logo a sinistra, nav a destra, una riga | 2 colonne | tra 2rem e 3.5rem |
| 1100px (desktop) | come il tablet | 4 colonne | 3.5rem |

Inoltre: il contenuto della pagina è largo al massimo \`1100px\` e centrato, l'immagine della hero non straborda mai, e il
meta tag viewport è nell'HTML.`,
      tasks: [
        'Il meta tag viewport è nell\'HTML',
        'Mobile first: solo media query min-width',
        'Contenuto largo al massimo 1100px e centrato',
        'L\'immagine della hero non straborda mai',
        'Telefono (375px): logo sopra il nav, entrambi centrati; 1 colonna di caratteristiche; h1 2rem',
        'Tablet (768px): logo a sinistra e nav a destra su una riga; 2 colonne di caratteristiche',
        'Desktop (1100px): 4 colonne di caratteristiche, h1 3.5rem',
      ],
      hints: [
        'h1 { font-size: clamp(2rem, 6vw, 3.5rem); } copre tutte e tre le dimensioni.',
        'Header sui telefoni: flex-direction: column; align-items: center. Da 700px: flex-direction: row; justify-content: space-between.',
        '.wrap { max-width: 1100px; margin: 0 auto; padding: 0 16px; }',
      ],
    },
  },
  messages: {
    'Use font-size: clamp(1.5rem, 6vw, 3rem);': 'Usa font-size: clamp(1.5rem, 6vw, 3rem);',
    'At 400px the container should be narrower than the screen.': 'A 400px il contenitore deve essere più stretto dello schermo.',
    'Add @media (min-width: 600px) { ... }.': 'Aggiungi @media (min-width: 600px) { ... }.',
    'Use @media (min-width: ...).': 'Usa @media (min-width: ...).',
    'Remove the max-width media query.': 'Togli la media query max-width.',
    'The hero image overflows .post.': 'L\'immagine hero esce da .post.',
    'Add height: auto so the image is not stretched.': 'Aggiungi height: auto così l\'immagine non viene deformata.',
    '.thumb should be square.': '.thumb deve essere quadrata.',
    'Add @container (min-width: 400px) { ... }.': 'Aggiungi @container (min-width: 400px) { ... }.',
    'Add <meta name="viewport" content="width=device-width, initial-scale=1">.':
      'Aggiungi <meta name="viewport" content="width=device-width, initial-scale=1">.',
    'Use only min-width queries.': 'Usa solo query min-width.',
    '.wrap should be max 1100px and centred.': '.wrap deve essere al massimo 1100px e centrato.',
    'The hero image overflows on phones.': 'L\'immagine hero esce dallo schermo sui telefoni.',
    'At 375px the logo should sit above the nav.': 'A 375px il logo deve stare sopra il nav.',
    'Centre the nav on phones.': 'Centra il nav sui telefoni.',
    'At 768px logo and nav share one row.': 'A 768px logo e nav stanno sulla stessa riga.',
    'Push the nav to the right.': 'Spingi il nav a destra.',
    'Use clamp() for the h1 size.': 'Usa clamp() per la dimensione dell\'h1.',
  },
} satisfies ModuleText;
