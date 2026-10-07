# LearnWeb

Interactive courses for learning **HTML** and **CSS**, from your first tag to responsive, themed,
production-ready pages.

Each lesson explains one idea, then gives you a code editor, a live preview and a checklist that updates as
you type. Every module ends with a challenge, scored with up to three stars.

## Courses

### HTML — 8 modules, 36 lessons

| # | Module | Challenge |
|---|---|---|
| 1 | HTML Basics | Personal profile page |
| 2 | Working with Text | Bug hunt (blind) |
| 3 | Links & Media | Travel guide |
| 4 | Tables | Football league table |
| 5 | Forms | Job application form |
| 6 | Semantic HTML | Div soup refactor |
| 7 | Accessibility | Accessibility audit (blind) |
| 8 | Advanced HTML | Capstone: portfolio site |

### CSS — 8 modules, 38 lessons

| # | Module | Challenge |
|---|---|---|
| 1 | CSS Basics | Style the business card (target) |
| 2 | Selectors & the Cascade | Specificity wars (blind) |
| 3 | Typography | A readable article (target) |
| 4 | The Box Model | Recreate the product card (target) |
| 5 | Flexbox | Navbar and footer (target) |
| 6 | CSS Grid | Magazine front page (target) |
| 7 | Responsive Design | Landing page at three breakpoints (target) |
| 8 | Advanced CSS | Capstone: style your portfolio |

*Blind* challenges reveal each requirement only once it passes. *Target* challenges show the design to recreate
in a tab next to your preview.

CSS lessons have two files, `style.css` and `index.html`. The **Playground** has both too.
Progress and code are saved in your browser's localStorage; use *Export / Import progress* on the home page to
move them to another device.

### Keeping progress safe

- On start the app asks the browser for **persistent storage** (`navigator.storage.persist()`), so progress is not
  evicted when the disk is low. *Your progress* on the home page shows whether it was granted.
- If localStorage can't be written (some private windows, blocked site data, full quota) a banner says progress
  isn't being saved and offers an export.
- After 14 days without an export (and with some progress), the home page suggests exporting a backup.

### Install and offline

LearnWeb is a PWA (`vite-plugin-pwa`): it can be installed (*Install the app* under *Your progress*, or
Share → *Add to Home Screen* on iPhone and iPad) and works offline after the first visit. Only the app itself is
precached; images from picsum.photos and Google Fonts used in lessons always come from the network. A new version
waits for a click on *Update* and saves the code you're editing before reloading.

Icons in `public/icons` are generated from the `</>` logo with `npm run icons`.

## Development

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (jsdom) + CSS tests in headless Chromium
npm run lint
npm run build
npm run test:e2e # build, then Playwright on `vite preview` under /learnHTML/ (offline, updates, storage)
```

The CSS tests run in a real browser through Vitest browser mode. If Playwright's Chromium is missing locally,
install it with `npx playwright install chromium`.

## How it works

- `src/content/html/*.ts`, `src/content/css/*.ts` — one file per module. A lesson is markdown, starter code
  (plus `starterCss` for CSS lessons), a list of tasks (each a `check` function), hints and a solution.
- `src/engine/checks.ts` — DOM checks for HTML lessons (`hasElement`, `count`, `controlsLabelled`, …).
- `src/engine/cssChecks.ts` — CSS checks: declared values (`declares`), computed styles (`computed`) and layout
  (`inOneRow`, `stacked`, `centeredIn`, `columns`, `atWidth` for media queries).
- `src/engine/render.ts` — renders HTML + CSS in a hidden, script-less frame so CSS checks see real styles and
  layout. `combine()` loads the CSS where the page links `style.css`.
- `src/engine/validator.ts`, `src/engine/cssValidator.ts` — report the mistakes browsers silently repair or
  skip: unclosed tags, invalid nesting, missing semicolons, unknown properties, invalid values and selectors.
- Every lesson's solution must pass all its tasks, and its starter code must not (`src/content/*.test.ts`).

## Deploy

`.github/workflows/deploy.yml` tests, builds and deploys `main` to GitHub Pages
(*Settings → Pages → Source: GitHub Actions*).
