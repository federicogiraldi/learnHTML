// Renders the "</>" logo to the PNG icons in public/icons. Run after changing the logo:
//   node scripts/generate-icons.mjs
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BG = '#0e0e13';
const ACCENT = '#ff7a50';

/** "</>" drawn as strokes (no font), centred in a 512×512 box. `scale` shrinks it for maskable icons. */
const glyph = (scale) => `
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)"
     fill="none" stroke="${ACCENT}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round">
    <path d="M176 168 L88 256 L176 344" />
    <path d="M300 140 L212 372" />
    <path d="M336 168 L424 256 L336 344" />
  </g>`;

const svg = ({ rounded, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="${BG}" />${glyph(scale)}
</svg>
`;

// "any" icons have rounded corners; maskable and Apple icons are full-bleed (the OS applies its own mask),
// with the glyph inside the maskable safe zone (a centred circle of 80% of the size).
const icons = [
  { file: 'icon-192.png', size: 192, rounded: true, scale: 0.9 },
  { file: 'icon-512.png', size: 512, rounded: true, scale: 0.9 },
  { file: 'maskable-512.png', size: 512, rounded: false, scale: 0.7 },
  { file: 'apple-touch-icon.png', size: 180, rounded: false, scale: 0.8 },
];

await writeFile('public/icons/logo.svg', svg({ rounded: true, scale: 0.9 }));

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { file, size, ...look } of icons) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg(look)}`,
  );
  await page.screenshot({ path: `public/icons/${file}`, omitBackground: true });
}
await browser.close();
