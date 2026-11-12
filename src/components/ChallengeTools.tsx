import type { ReactNode } from 'react';
import type { Challenge, Intensity } from '../types';
import { DECKS } from '../data/decks';
import { LOL_CHAMPIONS, LOL_ROLES } from '../data/gaming';
import { DeckStage } from './DeckDrawer';
import { DiceTool, CoinTool, CardDrawTool } from './Tools';
import { NameSpinner } from './NameSpinner';
import { Timer } from './ui';
import { Icon } from './Icon';
import { CocktailLab } from '../screens/Party';
import { go } from '../lib/router';

const norm = (x: string) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!]/g, '').trim();

/** App decks a challenge names in its materials, e.g. 'Baraja "Mímica" (Fiesta)' or 'Barajas "Verdad" y "Reto"'. */
export function decksFor(c: Challenge): string[] {
  const ids: string[] = [];
  for (const m of [...c.materials, ...c.steps]) {
    if (!/baraja/i.test(m)) continue;
    for (const [, name] of m.matchAll(/["“]([^"”]+)["”]/g)) {
      const n = norm(name);
      const d = DECKS.find((x) => norm(x.name) === n) || DECKS.find((x) => norm(x.name).startsWith(n));
      if (d && !ids.includes(d.id)) ids.push(d.id);
    }
  }
  return ids;
}

/** Which in-app tools a challenge needs, read from its materials. */
export function toolsFor(c: Challenge) {
  const m = c.materials.join(' | ');
  return {
    decks: decksFor(c),
    dice: /\bdados?\b/i.test(m),
    coin: /(^|\| )una moneda( \||$)/i.test(m),
    cards: /baraja (española|de póker)/i.test(m),
    champions: /ruleta de campeones/i.test(m),
    cocktails: /generador de cócteles/i.test(m),
    bingo: /bingo de noche de cine|noche de cine → bingo/i.test(m),
    predictions: /predicciones/i.test(m),
    timer: /temporizador/i.test(m),
  };
}

function Tool({ title, children, hint }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="ctool">
      <h3 className="ctool-h">{title}</h3>
      {hint && <p className="small faint" style={{ marginBottom: 'var(--s-3)' }}>{hint}</p>}
      {children}
    </div>
  );
}

/**
 * Everything the challenge asks for that the app can provide, right on the sheet.
 * `local` (Night Show): decks draw without touching the main game, and the links into the
 * main game (bingo, predictions, cocktails) are left out on purpose.
 */
export function ChallengeTools({ c, local, timer = false }: { c: Challenge; local?: { level: Intensity }; timer?: boolean }) {
  const t = toolsFor(c);
  const any = t.decks.length || t.dice || t.coin || t.cards || t.champions || (!local && (t.cocktails || t.bingo || t.predictions)) || (timer && t.timer);
  if (!any) return null;
  return (
    <section className="ctools" aria-label="Herramientas de esta prueba">
      <h2 className="h3 ctools-h"><Icon name="sparkle" size={18} />Lo tenéis aquí: herramientas de la prueba</h2>
      {t.decks.length > 0 && (
        <Tool title={t.decks.length > 1 ? 'Las barajas de esta prueba' : `La baraja “${DECKS.find((d) => d.id === t.decks[0])!.name}”`} hint="Robad las cartas desde aquí: no hace falta ir a otra pantalla.">
          <DeckStage deckIds={t.decks} local={local} />
        </Tool>
      )}
      {(t.dice || t.coin || t.cards) && (
        <div className="felt ctool-felt">
          {t.dice && <DiceTool />}
          {t.coin && <CoinTool />}
          {t.cards && <><p className="small" style={{ color: 'rgba(220,245,230,.85)' }}>¿Sin baraja de verdad? La app saca cartas al azar: sirve para las pruebas de robar una carta cada vez.</p><CardDrawTool /></>}
        </div>
      )}
      {t.champions && (
        <Tool title="Sorteo de LoL" hint="Campeón y rol al azar para cada uno.">
          <div className="slots"><NameSpinner items={LOL_CHAMPIONS} label="Campeón" button="Girar campeón" /><NameSpinner items={LOL_ROLES} label="Rol" button="Girar rol" /></div>
        </Tool>
      )}
      {!local && t.cocktails && <Tool title="Generador de cócteles"><CocktailLab /></Tool>}
      {!local && (t.bingo || t.predictions) && (
        <Tool title="Noche de cine" hint="Esta prueba usa las herramientas de cine de la app.">
          <div className="cluster">
            {t.bingo && <button className="btn primary" onClick={() => go('movie', 'bingo')}><Icon name="film" size={16} />Abrir el Bingo</button>}
            {t.predictions && <button className="btn primary" onClick={() => go('movie', 'predict')}><Icon name="lock" size={16} />Abrir Predicciones</button>}
          </div>
        </Tool>
      )}
      {timer && t.timer && <Tool title="Temporizador"><Timer seconds={c.duration <= 5 ? 60 : Math.min(600, c.duration * 60)} /></Tool>}
    </section>
  );
}
