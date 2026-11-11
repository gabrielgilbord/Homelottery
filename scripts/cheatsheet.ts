// Generates docs/GABRIEL_SECRET_CHEAT_SHEET.md from the same data the app uses.  Run: npm run cheatsheet
import { writeFileSync } from 'node:fs';
import { TONIGHT, MATERIALS, BREAKFAST, HOST_TIMELINE, PLAN_B, TOMORROW, PRESENTER_TIPS } from '../src/data/cheatsheet';
import { GAMES } from '../src/data/gaming';
import { BOXES, prizeById, PRIZE_FOR, WHEELS, ENVELOPES } from '../src/data/rewards';
import { EPISODES } from '../src/data/episodes';
import { CHALLENGES } from '../src/data/challenges';

const L: string[] = [];
const w = (s = '') => L.push(s);
w('# GABRIEL’S SECRET CHEAT SHEET');
w('**CONFIDENTIAL — DO NOT SHOW TATIANA**');
w();
w('> Versión imprimible. La versión interactiva (con checklist que se guarda) está en la app → Host Mode → Cheat Sheet.');
w();
w('## A. Preparación esta noche');
for (const g of TONIGHT) { w(`### ${g.title}`); for (const i of g.items) w(`- [ ] ${i.text}`); w(); }
w('## B. Descargas y videojuegos');
w('| Juego | Prioridad | Plataforma | Precio | Tamaño | PS Plus | Multijugador | Requisitos | Enlace oficial |');
w('|---|---|---|---|---|---|---|---|---|');
for (const g of GAMES) w(`| **${g.name}** — ${g.note} | ${g.priority} | ${g.platform} | ${g.price} | ${g.size} | ${g.psPlus} | ${g.local} | ${g.needs} | ${g.link} |`);
w();
w('Fuentes: fichas oficiales de PlayStation (ARK: pantalla dividida local para 2; Brawlhalla gratis con modos locales; Rocket League free-to-play), ayuda oficial de Epic Games (pantalla dividida de Rocket League y Fortnite) y Psyonix (Rocket League online sin PS Plus). Tamaño de ARK (~179 GB) según PSPrices (no oficial). El tamaño exacto del parche solo lo muestra la consola.');
w();
w('## C. Materiales');
w('### Probablemente ya en casa'); for (const m of MATERIALS.home) w(`- [ ] ${m}`);
w('### Comprar si falta'); for (const m of MATERIALS.buy) w(`- [ ] ${m}`);
w();
w('## D. El desayuno');
BREAKFAST.forEach((b, i) => w(`${i + 1}. **${b.t}.** ${b.d}`));
w();
w('## E. Cronograma de Gabriel');
for (const t of HOST_TIMELINE) w(`- **${t.time}** — ${t.what}`);
w();
for (const e of EPISODES) w(`- **${e.code} · ${e.title}** (${e.time}): ${e.hostNote}`);
w();
w('## F. Premios secretos');
w('Las probabilidades base están abajo. La app las ajusta en directo: los premios únicos ya entregados desaparecen, los premios atrevidos solo existen si los dos tenéis activado el modo picante, y los premios personales solo le pueden tocar a su destinatario.');
for (const b of BOXES) {
  const tot = b.entries.reduce((a, e) => a + e.weight, 0);
  w(`### ${b.name} — ${b.costLabel} · se desbloquea en el EP 0${b.unlockEpisode}`);
  w('| Premio | Prob. base | Tipo | Preparación física |'); w('|---|---|---|---|');
  for (const e of b.entries) { const p = prizeById(e.prizeId)!; w(`| **${p.title}**${p.unique ? ' (único)' : ''}${PRIZE_FOR[p.id] ? ` (solo ${PRIZE_FOR[p.id]})` : ''} — ${p.text} | ${((e.weight / tot) * 100).toFixed(0)}% | ${p.kind}${p.intensity ? ' / ' + p.intensity : ''} | ${p.prep} |`); }
  w();
}
w('### Ruletas');
for (const wh of WHEELS) { const tot = wh.segments.reduce((a, s) => a + s.weight, 0); w(`- **${wh.name}** (${wh.cost} monedas, EP 0${wh.unlockEpisode}): ` + wh.segments.map((s) => `${s.label} ${((s.weight / tot) * 100).toFixed(0)}%`).join(' · ')); }
w();
w('### Sobres secretos');
for (const e of ENVELOPES) w(`- **${e.name}** — ${e.condition} Recompensa: ${e.reward}.`);
w();
w('## G. Plan B');
for (const p of PLAN_B) w(`- **${p.q}:** ${p.a}`);
w();
w('## H. Checklist de mañana');
TOMORROW.forEach((t, i) => w(`${i + 1}. [ ] ${t}`));
w();
w('## Consejos de presentador');
for (const t of PRESENTER_TIPS) w(`- ${t}`);
w();
w(`_Biblioteca: ${CHALLENGES.length} pruebas jugables._`);
writeFileSync('docs/GABRIEL_SECRET_CHEAT_SHEET.md', L.join('\n') + '\n');
console.log('docs/GABRIEL_SECRET_CHEAT_SHEET.md written');
