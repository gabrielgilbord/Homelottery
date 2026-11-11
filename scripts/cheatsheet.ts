// Generates the two guides (Markdown + mobile HTML) from the same data the app uses.  Run: npm run cheatsheet
//   docs/GUIA_RAPIDA_GABRIEL.md        + docs/guia-rapida-gabriel.html          (sin spoilers)
//   docs/GABRIEL_SECRET_CHEAT_SHEET.md + docs/gabriel-secret-cheat-sheet.html   (confidencial)
//   docs/REGLAMENTO_Y_COMPRA.md        + docs/reglamento-y-compra.html          (reglas + compra; la parte de premios es secreta)
import { writeFileSync } from 'node:fs';
import { quickGuide, secretSheet, rulebook, toMarkdown, toHtml } from './guides';

const quick = quickGuide();
const secret = secretSheet();
writeFileSync('docs/GUIA_RAPIDA_GABRIEL.md', toMarkdown(quick));
writeFileSync('docs/guia-rapida-gabriel.html', toHtml(quick));
writeFileSync('docs/GABRIEL_SECRET_CHEAT_SHEET.md', toMarkdown(secret));
writeFileSync('docs/gabriel-secret-cheat-sheet.html', toHtml(secret, { other: { href: 'guia-rapida-gabriel.html', label: 'Abrir la guía rápida (sin spoilers)' } }));
const rules = rulebook();
writeFileSync('docs/REGLAMENTO_Y_COMPRA.md', toMarkdown(rules));
writeFileSync('docs/reglamento-y-compra.html', toHtml(rules));
console.log('Guides written: docs/GUIA_RAPIDA_GABRIEL.md, docs/guia-rapida-gabriel.html, docs/GABRIEL_SECRET_CHEAT_SHEET.md, docs/gabriel-secret-cheat-sheet.html, docs/REGLAMENTO_Y_COMPRA.md, docs/reglamento-y-compra.html');
