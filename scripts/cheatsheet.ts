// Generates the two guides (Markdown + mobile HTML) from the same data the app uses.  Run: npm run cheatsheet
//   docs/GUIA_RAPIDA_GABRIEL.md        + docs/guia-rapida-gabriel.html          (sin spoilers)
//   docs/GABRIEL_SECRET_CHEAT_SHEET.md + docs/gabriel-secret-cheat-sheet.html   (confidencial)
import { writeFileSync } from 'node:fs';
import { quickGuide, secretSheet, toMarkdown, toHtml } from './guides';

const quick = quickGuide();
const secret = secretSheet();
writeFileSync('docs/GUIA_RAPIDA_GABRIEL.md', toMarkdown(quick));
writeFileSync('docs/guia-rapida-gabriel.html', toHtml(quick));
writeFileSync('docs/GABRIEL_SECRET_CHEAT_SHEET.md', toMarkdown(secret));
writeFileSync('docs/gabriel-secret-cheat-sheet.html', toHtml(secret, { other: { href: 'guia-rapida-gabriel.html', label: 'Abrir la guía rápida (sin spoilers)' } }));
console.log('Guides written: docs/GUIA_RAPIDA_GABRIEL.md, docs/guia-rapida-gabriel.html, docs/GABRIEL_SECRET_CHEAT_SHEET.md, docs/gabriel-secret-cheat-sheet.html');
