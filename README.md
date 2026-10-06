# LearnHTML

An interactive course for learning HTML, from your first tag to accessible, semantic, production-ready pages.

Each lesson explains one idea, then gives you a code editor, a live preview and a checklist that updates as
you type. Every module ends with a challenge, scored with up to three stars.

## Course

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

There's also a **Playground** for free practice. Progress and code are saved in your browser's localStorage;
use *Export / Import progress* on the home page to move them to another device.

## Development

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # engine unit tests + every lesson's solution must pass, every starter must fail
npm run lint
npm run build
```

## How it works

- `src/content/modules/*.ts` — one file per module. A lesson is markdown, starter code, a list of tasks
  (each a `check` function), hints and a solution.
- `src/engine/checks.ts` — reusable checks (`hasElement`, `count`, `hasAttr`, `controlsLabelled`, `headingOrder`, …).
- `src/engine/validator.ts` — reports the mistakes browsers silently repair: unclosed or mis-nested tags,
  invalid nesting, duplicate attributes. Every lesson implicitly requires well-formed HTML.
- `src/components/Preview.tsx` — the user's code runs in a sandboxed `<iframe srcdoc>`.

## Deploy

`.github/workflows/deploy.yml` tests, builds and deploys `main` to GitHub Pages. Enable it once under
*Settings → Pages → Source: GitHub Actions*.
