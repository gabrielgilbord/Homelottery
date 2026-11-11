import { useGame, leader, availableEnvelopes, categoryAllowed, intensityAllowed } from '../state/store';
import { EPISODES, CATEGORIES } from '../data/episodes';
import { CHALLENGES, challengeById } from '../data/challenges';
import { ACHIEVEMENTS, BOXES, WHEELS } from '../data/rewards';
import { Icon } from '../components/Icon';
import { AnimatedNumber, Avatar, Section } from '../components/ui';
import { go } from '../lib/router';
import { PLAYERS, PLAYER_NAME, rival, type CategoryId } from '../types';

const WORLD_ROUTE: Record<CategoryId, string> = { home: 'challenges', couples: 'couples', cards: 'cards', gaming: 'gaming', party: 'party', movie: 'movie' };
const WORLD_ICON: Record<CategoryId, string> = { home: 'home', couples: 'heart', cards: 'cards', gaming: 'gamepad', party: 'glass', movie: 'film' };

export default function Home() {
  const s = useGame();
  const ep = EPISODES[s.episode - 1];
  const lead = leader(s);
  const gap = Math.abs(s.players.gabriel.points - s.players.tatiana.points);
  const picks = ep.picks.map(challengeById).filter((c) => c && categoryAllowed(s, c.category) && intensityAllowed(s, c.intensity));
  const next = picks.find((c) => !s.completed[c!.id]) || picks[0];
  const envs = availableEnvelopes(s).filter((e) => !e.hostOnly || s.envelopesForced.includes(e.id));
  const free = PLAYERS.flatMap((p) => Object.entries(s.players[p].freeBoxes).filter(([, n]) => (n || 0) > 0).map(([t, n]) => ({ p, t, n: n || 0 })));
  const unconfigured = PLAYERS.filter((p) => !s.prefs[p].configured);
  const results = s.history.filter((h) => h.kind === 'result').length;
  const achieved = Object.keys(s.achievements).length;

  return (
    <div>
      {/* Masthead: what is on air */}
      <section className="masthead" data-world={ep.theme === 'legendary' ? 'legend' : undefined}>
        <div className="cluster"><span className="live-dot" /><span className="eyebrow" style={{ color: 'var(--ivory-2)' }}>En emisión · EP {String(s.episode).padStart(2, '0')}/08 · {ep.time.replace(' – ', '–')}</span></div>
        <h1 className={'h1' + (s.episode === 8 ? ' legend-text' : '')}>{ep.title}</h1>
        <p className="lead">{ep.subtitle}</p>
        <div className="ticks-wrap" aria-label={`Progreso: episodio ${s.episode} de 8`}>
          <div className="episode-ticks">{EPISODES.map((e) => <i key={e.n} className={e.n < s.episode ? 'done' : e.n === s.episode ? 'now' : ''} />)}</div>
          <div className="ticks-labels eyebrow"><span>Desayuno</span><span>{results} {results === 1 ? 'prueba jugada' : 'pruebas jugadas'}</span><span>Gran Final</span></div>
        </div>
        <div className="cluster" style={{ marginTop: 'var(--s-3)' }}>
          {next && <button className="btn primary lg" onClick={() => go('challenge', next.id)}><Icon name="play" size={16} />Jugar: {next.name}</button>}
          <button className="btn ghost lg" onClick={() => go('show')}>Escaleta del día</button>
        </div>
      </section>

      {/* Scoreboard band */}
      <section className="scoreboard" aria-label="Marcador">
        {PLAYERS.map((p, i) => {
          const P = s.players[p];
          const side = (
            <div key={p} className={'side' + (i === 1 ? ' right' : '')}>
              <div className="who"><Avatar p={p} size="sm" /><span className={'pname ' + p}>{PLAYER_NAME[p]}</span>{lead === p && <span className="lead-mark">Lidera</span>}</div>
              <div className={'score ' + (lead === p ? 'leading' : lead ? 'trailing' : '')}><AnimatedNumber value={P.points} /></div>
              <div className="meta">
                <span className="coins"><Icon name="coin" size={13} /><AnimatedNumber value={P.coins} showDelta /></span>
                <span><Icon name="cards" size={13} />{P.cards.length}</span>
                {P.keys > 0 && <span><Icon name="key" size={13} />{P.keys}</span>}
                {P.streak >= 2 && <span style={{ color: 'var(--ivory)' }}><Icon name="flame" size={13} />{P.streak}</span>}
              </div>
            </div>
          );
          return i === 0 ? [side, <div key="mid" className="mid"><span className="vs">vs</span><span className="eyebrow">{lead ? `+${gap}` : 'empate'}</span></div>] : side;
        })}
      </section>

      <div className="home-cols">
        <div>
          {(envs.length > 0 || free.length > 0 || unconfigured.length > 0) && (
            <section style={{ marginBottom: 'var(--s-8)' }}>
              <div className="section-head"><h2 className="h3">Pendiente</h2><span className="eyebrow">{envs.length + free.length + unconfigured.length}</span></div>
              <div className="list">
                {envs.map((e) => (
                  <button key={e.id} className="row-item" data-world="boxes" onClick={() => go('show')}>
                    <span className="lead-icon"><Icon name="envelope" size={18} /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>{e.name}</span><span className="xs faint">Sobre secreto listo para abrir</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                ))}
                {free.map((f) => (
                  <button key={f.p + f.t} className="row-item" data-world="boxes" onClick={() => go('boxes')}>
                    <span className="lead-icon"><Icon name="gift" size={18} /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>{BOXES.find((b) => b.tier === f.t)?.name} gratis</span><span className="xs faint">Para {PLAYER_NAME[f.p]}{f.n > 1 ? ` · ${f.n} cajas` : ''}</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                ))}
                {unconfigured.length > 0 && (
                  <button className="row-item" data-world="couples" onClick={() => go('prefs')}>
                    <span className="lead-icon"><Icon name="sliders" size={18} /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>Límites sin configurar</span><span className="xs faint">Falta {unconfigured.map((p) => PLAYER_NAME[p]).join(' y ')} · en privado</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                )}
              </div>
            </section>
          )}

          <section>
            <div className="section-head"><h2 className="h3">En este episodio</h2><button className="btn quiet sm" onClick={() => go('challenges')}>Biblioteca<Icon name="chevron" size={14} /></button></div>
            <div className="list">
              {picks.slice(0, 5).map((c) => (
                <button key={c!.id} className="row-item" data-world={CATEGORIES[c!.category].theme} onClick={() => go('challenge', c!.id)}>
                  <span className="lead-icon"><Icon name={s.completed[c!.id] ? 'check' : WORLD_ICON[c!.category]} size={18} /></span>
                  <span className="grow">
                    <span className="h5" style={{ display: 'block' }}>{c!.name}</span>
                    <span className="xs faint mono">{c!.sub} · {c!.duration} min · {c!.mode === 'coop' ? 'equipo' : 'duelo'}</span>
                  </span>
                  <span className="xs mono value-text" style={{ whiteSpace: 'nowrap' }}>+{c!.reward.coins}</span>
                  <Icon name="chevron" size={18} className="chev" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="section-head"><h2 className="h3">Recompensas</h2><button className="btn quiet sm" onClick={() => go('inventory')}>Inventario<Icon name="chevron" size={14} /></button></div>
          <div className="ledger">
            <button className="ledger-cell" onClick={() => go('boxes')}>
              <div className="eyebrow">Cajas</div><div className="v">{BOXES.filter((b) => s.episode >= b.unlockEpisode).length}<span className="faint" style={{ fontSize: '0.6em' }}>/5</span></div>
            </button>
            <button className="ledger-cell" onClick={() => go('roulette')}>
              <div className="eyebrow">Ruletas</div><div className="v">{WHEELS.filter((w) => s.episode >= w.unlockEpisode).length}<span className="faint" style={{ fontSize: '0.6em' }}>/4</span></div>
            </button>
            <button className="ledger-cell" onClick={() => go('inventory')}>
              <div className="eyebrow">Premios</div><div className="v value-text">{s.prizes.length}</div>
            </button>
            <button className="ledger-cell" onClick={() => go('achievements')}>
              <div className="eyebrow">Logros</div><div className="v">{achieved}<span className="faint" style={{ fontSize: '0.6em' }}>/{ACHIEVEMENTS.length * 2}</span></div>
            </button>
          </div>
          {lead && <p className="small faint" style={{ marginTop: 'var(--s-4)' }}>{PLAYER_NAME[rival(lead)]} va {gap} puntos por detrás. Ganar remontando paga monedas x1,5.</p>}
        </aside>
      </div>

      <Section title="Arenas" eyebrow="Elige el ambiente">
        <div className="hscroll worlds">
          {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => (
            <button key={c} className="world-tile" data-world={CATEGORIES[c].theme} onClick={() => go(WORLD_ROUTE[c])}>
              <span className="wi"><Icon name={WORLD_ICON[c]} size={18} /></span>
              <span className="stack" style={{ ['--gap' as string]: '4px' }}>
                <span className="h4">{CATEGORIES[c].name}</span>
                <span className="xs faint mono">{CHALLENGES.filter((x) => x.category === c).length} pruebas</span>
              </span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
