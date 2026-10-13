import type { ModuleText } from '../../localize';

export default {
  title: 'Basi di CSS',
  description: 'Regole, selettori e colori: come il CSS dà all\'HTML il suo aspetto.',
  items: {
    'css-first-rule': {
      title: 'La tua prima regola',
      explanation: `L'HTML dice che cosa **è** un contenuto; il CSS (Cascading Style Sheets) dice che **aspetto** ha.

Un foglio di stile è un elenco di **regole**. Ogni regola ha un **selettore** (quali elementi) e un blocco di
**dichiarazioni** (che cosa cambiare), ognuna scritta come \`proprietà: valore;\`:

\`\`\`css
h1 {
  color: tomato;
  font-size: 48px;
}
\`\`\`

- \`h1\` è il selettore: questa regola si applica a ogni \`<h1>\`.
- \`color\` e \`font-size\` sono proprietà; \`tomato\` e \`48px\` sono i loro valori.
- Ogni dichiarazione finisce con un punto e virgola \`;\`. Dimenticarlo è il bug CSS più comune, e il browser
  non si lamenta: ignora semplicemente la dichiarazione rotta. Questa app invece ti avvisa.

Nelle lezioni di CSS l'editor ha due file: **style.css** (il tuo CSS) e **index.html** (la pagina a cui dà stile).`,
      tasks: [
        'Rendi tomato il colore del testo dell\'<h1>',
        'Dai all\'<h1> un font-size di 48px',
        'Rendi gray il colore di ogni paragrafo',
        'Dai a tutta la pagina (body) il background-color linen',
      ],
      hints: ['Scrivi una regola per selettore: h1 { ... }, p { ... }, body { ... }.', 'Ogni dichiarazione è proprietà: valore; non dimenticare i due punti e il punto e virgola.'],
    },
    'css-where': {
      title: 'Dove si scrive il CSS',
      explanation: `Ci sono tre modi per aggiungere CSS a una pagina:

1. **Foglio di stile esterno** (il migliore): un file \`.css\` separato, collegato nell'\`<head>\`. Un solo file può dare
   stile a un intero sito, e il browser lo tiene in cache.

\`\`\`html
<link rel="stylesheet" href="style.css">
\`\`\`

2. **Elemento \`<style>\`** nell'\`<head>\`: va bene per una singola pagina o per esperimenti veloci.
3. **Attributo \`style\` in linea** su un elemento: \`<p style="color: red">\`. Evitalo: mescola contenuto
   e design, non si può riutilizzare ed è difficile da sovrascrivere.

In questa app, lo *style.css* dell'editor viene sempre caricato nell'anteprima. Nei progetti veri viene caricato **solo**
se l'HTML lo collega: quindi facciamolo come si deve.`,
      tasks: [
        'Collega il foglio di stile in <head> con <link rel="stylesheet" href="style.css">',
        'Togli l\'attributo style in linea dal paragrafo',
        'Sposta quegli stili in style.css, in una regola .note (verde, grassetto)',
      ],
      hints: ['Un selettore di classe inizia con un punto: .note { ... }', 'Il grassetto è font-weight: bold; il browser lo calcola come 700.'],
    },
    'css-selectors-basic': {
      title: 'Selettori di tipo, classe e id',
      explanation: `I selettori decidono a quali elementi una regola dà stile:

| Selettore | Seleziona | Esempio |
|---|---|---|
| \`p\` | ogni \`<p>\` (selettore di tipo) | \`p { }\` |
| \`.price\` | ogni elemento con \`class="price"\` | \`.price { }\` |
| \`#menu\` | l'unico elemento con \`id="menu"\` | \`#menu { }\` |
| \`h1, h2\` | un **gruppo**: tutti gli \`<h1>\` e tutti gli \`<h2>\` | \`h1, h2 { }\` |
| \`*\` | ogni elemento | \`* { }\` |

Un elemento può avere più classi: \`class="price sale"\` corrisponde sia a \`.price\` sia a \`.sale\`. Puoi anche
concatenarle: \`.price.sale\` seleziona solo gli elementi che hanno **entrambe** le classi.

Per gli stili preferisci le classi. Gli id sono unici e molto "forti" (vedrai perché nella lezione sulla cascata).`,
      tasks: [
        'Rendi #title color darkred usando il selettore di id',
        'Rendi teal gli <h2> e .special con una sola regola di gruppo: "h2, .special"',
        'Metti in grassetto ogni .price',
        'Rendi crimson solo il prezzo che ha anche .sale (concatena .price.sale)',
      ],
      hints: ['Gruppo: h2, .special { color: teal; }', 'La concatenazione non ha spazi: .price.sale { }'],
    },
    'css-colors': {
      title: 'Colori',
      explanation: `Il CSS capisce i colori in diversi formati:

| Formato | Esempio | Note |
|---|---|---|
| Nome | \`tomato\`, \`navy\` | circa 140 nomi, comodi per gli esperimenti |
| Esadecimale | \`#e44d26\`, \`#fff\` | rosso, verde, blu in esadecimale |
| \`rgb()\` | \`rgb(228 77 38)\` | 0–255 per canale |
| \`hsl()\` | \`hsl(14 78% 52%)\` | tonalità (0–360°), saturazione, luminosità: il più facile da ritoccare a mano |
| Con alfa | \`rgb(0 0 0 / 50%)\`, \`#0008\` | trasparenza |

\`color\` imposta il colore del testo, \`background-color\` quello dello sfondo.

\`\`\`css
.banner {
  background-color: hsl(210 80% 30%);
  color: #ffffff;
}
\`\`\`

Mantieni sempre abbastanza **contrasto** tra testo e sfondo: il grigio chiaro su bianco è difficile da leggere per
tutti, e impossibile per molte persone.`,
      tasks: [
        'Dai a .banner uno sfondo usando hsl()',
        'Rendi bianco il testo di .banner usando un colore esadecimale',
        'Dai a .overlay lo sfondo rgb(0 0 0 / 50%) (nero semitrasparente)',
        'Rendi giallo il testo di .overlay con rgb()',
      ],
      hints: ['Il colore del testo si eredita: impostare color su .banner colora l\'h1 e il p al suo interno.'],
    },
    'css-basics-challenge': {
      title: 'Sfida: dai stile al biglietto da visita',
      summary: 'Ricrea esattamente uno schema di colori, usando l\'anteprima obiettivo.',
      explanation: `Dai stile a questo biglietto da visita perché somigli alla scheda **Obiettivo** dell'anteprima. Requisiti:

- Sfondo della pagina: \`#1e293b\`
- Sfondo di \`.card\`: \`#f8fafc\`, con \`20px\` di padding
- Il nome (\`h1\`): colore \`#0f766e\`, dimensione \`32px\`
- Il ruolo (\`.role\`): colore \`#64748b\`, grassetto
- Il link dell'email: colore \`#ea580c\`
- Usa le **classi** per il biglietto e per il ruolo: niente stili in linea, niente id.`,
      tasks: [
        'Sfondo della pagina #1e293b',
        'Sfondo del biglietto #f8fafc e padding di 20px',
        'Colore del nome #0f766e e dimensione 32px',
        'Colore del ruolo #64748b e grassetto',
        'Colore del link dell\'email #ea580c',
        'Stile con le classi: niente stili in linea, niente selettori di id',
      ],
      hints: ['Il padding è una proprietà del box: padding: 20px;', 'Il link ha un suo colore predefinito, quindi gli serve una sua regola: a { ... }'],
    },
  },
  messages: {
    'Add <link rel="stylesheet" href="style.css"> inside <head>.': 'Aggiungi <link rel="stylesheet" href="style.css"> dentro <head>.',
    'Remove the style="..." attribute.': 'Togli l\'attributo style="...".',
    'Write one rule whose selector is "h2, .special".': 'Scrivi una sola regola il cui selettore sia "h2, .special".',
    'Only the sale price should be crimson.': 'Solo il prezzo in saldo deve essere crimson.',
    'Use the hsl() notation.': 'Usa la notazione hsl().',
    'Give .banner a background-color.': 'Dai a .banner un background-color.',
    'Write white as #fff or #ffffff.': 'Scrivi il bianco come #fff o #ffffff.',
    'Write yellow as rgb(255 255 0).': 'Scrivi il giallo come rgb(255 255 0).',
    'Remove inline styles.': 'Togli gli stili in linea.',
    'Use classes instead of id selectors.': 'Usa le classi al posto dei selettori di id.',
    'Keep the classes in the HTML.': 'Mantieni le classi nell\'HTML.',
  },
} satisfies ModuleText;
