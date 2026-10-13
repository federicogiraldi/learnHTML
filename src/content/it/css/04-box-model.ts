import type { ModuleText } from '../../localize';

export default {
  title: 'Il box model',
  description: 'Ogni elemento è una scatola: contenuto, padding, bordo e margine.',
  items: {
    'css-box-basics': {
      title: 'Padding, bordo, margine',
      explanation: `Ogni elemento è una **scatola** rettangolare fatta di quattro strati, dall'interno verso l'esterno:

1. **content**: il testo o l'immagine;
2. **padding**: lo spazio *dentro* il bordo, prende il colore di sfondo;
3. **border**: la linea attorno al padding;
4. **margin**: lo spazio *fuori* dal bordo, sempre trasparente, separa la scatola dalle sue vicine.

\`\`\`css
.box {
  padding: 16px;              /* all four sides */
  border: 2px solid #333;     /* width, style, colour */
  margin: 24px 0;             /* top/bottom 24px, left/right 0 */
}
\`\`\`

Le scorciatoie vanno in senso orario partendo dall'alto: \`padding: 10px 20px 30px 40px\` = sopra, destra, sotto, sinistra.
Due valori significano verticale | orizzontale. Puoi anche impostare un solo lato: \`margin-top\`, \`padding-left\`…

Consiglio: i margini verticali tra blocchi **collassano**: due margini da 20px che si toccano diventano 20px, non 40px.`,
      tasks: [
        'Dai a .box 20px di padding su ogni lato',
        'Dai a .box un bordo 3px solid orange',
        'Separa le scatole con 30px di margine sopra/sotto e 0 a sinistra/destra',
        'Nota: lo spazio tra le scatole è 30px, non 60px (collasso dei margini)',
      ],
      hints: ['margin: 30px 0; imposta sopra e sotto a 30px, sinistra e destra a 0.'],
    },
    'css-box-sizing': {
      title: 'box-sizing',
      explanation: `Di default \`width\` imposta la larghezza del solo **contenuto**. Padding e bordo si aggiungono in più:

\`\`\`css
.card { width: 300px; padding: 20px; border: 5px solid; }
/* actual width: 300 + 20*2 + 5*2 = 350px  😬 */
\`\`\`

\`box-sizing: border-box\` fa includere a \`width\` anche padding e bordo, che è come ragiona la maggior parte delle persone:

\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

Questa regola sta in cima a quasi tutti i fogli di stile moderni. Con lei, una card da 300px è larga 300px. Punto.`,
      tasks: [
        'Aggiungi la regola universale box-sizing: border-box (*, *::before, *::after)',
        'Ora la card A è larga esattamente 300px, bordi compresi',
        'La card B non esce più dal suo genitore',
      ],
      hints: ['I selettori separati da virgole condividono la regola: *, *::before, *::after { ... }'],
    },
    'css-display': {
      title: 'display: block, inline, inline-block, none',
      explanation: `La proprietà \`display\` decide come una scatola scorre nella pagina:

| Valore | Comportamento | Predefinito per |
|---|---|---|
| \`block\` | va a capo, occupa tutta la larghezza; width/height/margini funzionano | \`div\`, \`p\`, \`h1\`, \`li\`, \`section\` |
| \`inline\` | scorre dentro il testo; **ignora** width/height e i margini verticali | \`a\`, \`span\`, \`strong\` |
| \`inline-block\` | scorre in linea ma accetta width, height e padding come un blocco | \`button\`, \`img\`* |
| \`none\` | tolto del tutto dalla pagina (nascosto anche agli screen reader) | — |

\`\`\`css
nav a {
  display: inline-block;
  padding: 8px 16px;   /* now the clickable area really grows */
}
\`\`\`

I prossimi moduli aggiungono i due valori più potenti: \`display: flex\` e \`display: grid\`.`,
      tasks: [
        'Metti i tag su una riga con display: inline-block',
        'Rendi il link .btn un inline-block con padding 8px 16px',
        'Nascondi completamente .ad',
      ],
      hints: ['display: none toglie del tutto l\'elemento dall\'impaginazione.'],
    },
    'css-width-overflow': {
      title: 'Larghezza, centratura e overflow',
      explanation: `- \`width\` / \`height\` impostano una dimensione fissa; \`max-width\` lascia restringere una scatola sugli schermi
  piccoli ma non la fa mai crescere oltre un limite. **Preferisci \`max-width\`** per i contenitori della pagina.
- \`margin: 0 auto\` centra un blocco in orizzontale (il browser divide in parti uguali lo spazio avanzato).
- \`min-height\` imposta un'altezza minima ma lascia crescere il contenuto.
- Quando il contenuto non ci sta, \`overflow\` decide che cosa succede: \`visible\` (esce fuori, predefinito),
  \`hidden\` (viene tagliato), \`auto\` (barra di scorrimento solo quando serve).

\`\`\`css
.container {
  max-width: 600px;
  margin: 0 auto;
}
.log {
  height: 120px;
  overflow: auto;
}
\`\`\``,
      tasks: [
        'Limita .container a max-width: 500px',
        'Centra .container in orizzontale',
        'Dai a .log un\'altezza di 120px',
        'Fai scorrere il log quando è troppo lungo (overflow: auto)',
      ],
      hints: ['Senza box-sizing: border-box l\'altezza calcolata è quella del contenuto. Vanno bene entrambi i valori.'],
    },
    'css-decoration': {
      title: 'Angoli arrotondati e ombre',
      explanation: `Piccoli dettagli danno profondità alle scatole:

\`\`\`css
.card {
  border-radius: 12px;                          /* rounded corners */
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);      /* x y blur colour */
}
.avatar {
  border-radius: 50%;                           /* a perfect circle on a square box */
}
\`\`\`

- \`box-shadow: spostamento-x spostamento-y sfocatura espansione colore\`. Tieni le ombre morbide e discrete: poca
  opacità, un po' di sfocatura.
- \`outline\` è come un bordo che non occupa spazio: i browser lo usano per il **focus** da tastiera. Non toglierlo mai
  senza un sostituto visibile (\`:focus-visible\`).`,
      tasks: [
        'Arrotonda gli angoli della card di 16px',
        'Dai alla card un box-shadow morbido',
        'Rendi l\'avatar un cerchio (border-radius: 50%)',
        'Mostra un outline 3px solid sul pulsante quando ha il focus da tastiera',
      ],
      hints: ['box-shadow: 0 4px 12px rgb(0 0 0 / 15%);'],
    },
    'css-box-challenge': {
      title: 'Sfida: ricrea la scheda prodotto',
      summary: 'Riproduci l\'obiettivo al pixel: dimensioni, spaziature, bordi e ombre.',
      explanation: `Ricrea la scheda prodotto della scheda **Obiettivo**. Specifiche:

- Tutto usa \`box-sizing: border-box\`.
- \`.product\`: larga esattamente \`280px\`, sfondo bianco, \`24px\` di padding, raggio \`12px\`, un bordo
  \`1px solid #e5e7eb\` e un'ombra morbida. Centrata nella pagina con \`40px\` di margine sopra.
- Sfondo della pagina \`#f3f4f6\`.
- \`.product img\`: larga quanto la card (\`width: 100%\`), \`height: auto\`, raggio \`8px\`, mostrata come blocco.
- \`.price\`: \`1.5rem\`, grassetto, colore \`#16a34a\`, \`8px\` di margine sopra e sotto.
- \`.buy\`: un pulsante a blocco, largo quanto tutto, \`12px\` di padding, nessun bordo, raggio \`8px\`, sfondo \`#111827\`,
  testo bianco.`,
      tasks: [
        'border-box ovunque e card larga esattamente 280px',
        'Card: bianca, padding 24px, raggio 12px, bordo 1px #e5e7eb, ombra',
        'Card centrata, a 40px dall\'alto; sfondo della pagina #f3f4f6',
        'Immagine: blocco, larga quanto la card, raggio 8px',
        'Prezzo: 1.5rem, grassetto, #16a34a, margine verticale di 8px',
        'Pulsante: blocco a tutta larghezza, padding 12px, nessun bordo, raggio 8px, #111827 con testo bianco',
      ],
      hints: ['Un <button> a blocco non si allarga da solo: dagli width: 100%.', 'height: auto mantiene le proporzioni dell\'immagine quando ne cambi la larghezza.'],
    },
  },
  messages: {
    'The two boxes should be 30px apart.': 'Le due scatole devono essere distanti 30px.',
    'Write *, *::before, *::after { box-sizing: border-box; }': 'Scrivi *, *::before, *::after { box-sizing: border-box; }',
    'Card A should measure exactly 300px.': 'La card A deve misurare esattamente 300px.',
    'Card B is wider than the page.': 'La card B è più larga della pagina.',
    '.container should be 500px wide in this 800px preview.': '.container deve essere larga 500px in questa anteprima da 800px.',
    'Set height: 120px on .log.': 'Imposta height: 120px su .log.',
    'Add a box-shadow to .card.': 'Aggiungi un box-shadow a .card.',
    'Write button:focus-visible { outline: 3px solid ...; }': 'Scrivi button:focus-visible { outline: 3px solid ...; }',
    'Use the universal border-box rule.': 'Usa la regola universale border-box.',
    '.product must measure exactly 280px.': '.product deve misurare esattamente 280px.',
    'Add a box-shadow.': 'Aggiungi un box-shadow.',
    'The image should fill the card (280 - 2×24 - 2×1 = 230px).': 'L\'immagine deve riempire la card (280 - 2×24 - 2×1 = 230px).',
    'The button should be as wide as the card content.': 'Il pulsante deve essere largo quanto il contenuto della card.',
  },
} satisfies ModuleText;
