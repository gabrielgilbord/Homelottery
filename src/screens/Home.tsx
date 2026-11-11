import { useGame, leader, availableEnvelopes, categoryAllowed, intensityAllowed } from '../state/store';
import { EPISODES, CATEGORIES } from '../data/episodes';
import { CHALLENGES, challengeById } from '../data/challenges';
import { ACHIEVEMENTS, BOXES, WHEELS } from '../data/rewards';
import { Icon } from '../components/Icon';
import { AnimatedNumber, Avatar } from '../components/ui';
import { go } from '../lib/router';
import { PLAYERS, PLAYER_NAME, rival, type CategoryId } from '../types';

const WORLD_ROUTE: Record<CategoryId, string> = { home: 'challenges', couples: 'couples', cards: 'cards', gaming: 'gaming', party: 'party', movie: 'movie' };
export const WORLD_ICON: Record<CategoryId, string> = { home: 'home', couples: 'heart', cards: 'cards', gaming: 'gamepad', party: 'glass', movie: 'film' };
const SHORT_TITLE: Record<number, string> = { 1: 'Desayuno', 2: 'Calentamiento', 3: 'El duelo', 4: 'Gaming', 5: 'Fiesta', 6: 'En pareja', 7: 'Cine', 8: 'Gran Final' };

export default function Home() {
  const s = useGame();
  const ep = EPISODES[s.episode - 1];
  const lead = leader(s);
  const g = s.players.gabriel.points, t = s.players.tatiana.points;
  const gap = Math.abs(g - t);
  const share = g + t === 0 ? 0.5 : g / (g + t);
  const picks = ep.picks.map(challengeById).filter((c) => c && categoryAllowed(s, c.category) && intensityAllowed(s, c.intensity));
  const next = picks.find((c) => !s.completed[c!.id]) || picks[0];
  const envs = availableEnvelopes(s).filter((e) => !e.hostOnly || s.envelopesForced.includes(e.id));
  const free = PLAYERS.flatMap((p) => Object.entries(s.players[p].freeBoxes).filter(([, n]) => (n || 0) > 0).map(([tier, n]) => ({ p, tier, n: n || 0 })));
  const unconfigured = PLAYERS.filter((p) => !s.prefs[p].configured);
  const results = s.history.filter((h) => h.kind === 'result').length;
  const pending = envs.length + free.length + (unconfigured.length ? 1 : 0);

  return (
    <div>
      {/* The stage: what's on air + the scorebug */}
      <section className="stage" aria-label="En emisión">
        <div className="onair"><span className="live-dot" />En directo<span className="when">Episodio {s.episode} de 8, {ep.time.replace(' – ', ' a ')}</span></div>
        <h1>{ep.title}</h1>
        <p className="lead">{ep.subtitle}</p>

        <div className="scorebug" aria-label={`Marcador: Gabriel ${g}, Tatiana ${t}`}>
          {PLAYERS.map((p, i) => {
            const P = s.players[p];
            const side = (
              <div key={p} className={'side' + (i === 1 ? ' right' : '')}>
                <div className="who"><Avatar p={p} size="sm" /><span className={'pname ' + p}>{PLAYER_NAME[p]}</span></div>
                <div className={'score' + (lead && lead !== p ? ' trailing' : '')}><AnimatedNumber value={P.points} /></div>
                <span className="coins"><Icon name="coin" size={14} /><AnimatedNumber value={P.coins} showDelta /></span>
              </div>
            );
            return i === 0 ? [side, <div key="mid" className="mid">{lead ? <span className="crown"><Icon name="crown" size={14} />+{gap}</span> : 'Empate'}</div>] : side;
          })}
        </div>
        <div className="tug" aria-hidden><i style={{ transform: `scaleX(${share})` }} /></div>
        <div className="tug-caption"><span>{lead ? `Lidera ${PLAYER_NAME[lead]}` : 'Igualados'}</span><span>{results} {results === 1 ? 'prueba jugada' : 'pruebas jugadas'}</span></div>
      </section>

      <div className="home-actions">
        {next && (
          <button className="btn primary lg" onClick={() => go('challenge', next.id)}>
            <span className="t">Jugar ahora: {next.name}</span><Icon name="play" size={18} />
          </button>
        )}
        <button className="btn ghost lg" onClick={() => go('show')}>Ver el programa de hoy</button>
      </div>

      <section className="section" aria-label="Programa del día">
        <div className="section-head"><h2 className="h2">Programa de hoy</h2><button className="btn quiet sm" onClick={() => go('show')}>Escaleta<Icon name="chevron" size={14} /></button></div>
        <div className="lineup">
          {EPISODES.map((e) => (
            <button key={e.n} className={e.n === s.episode ? 'now' : e.n < s.episode ? 'past' : ''} aria-current={e.n === s.episode ? 'step' : undefined} onClick={() => go('show')}>
              <span className="n">{e.n}</span>
              <span className="t">{SHORT_TITLE[e.n]}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="home-cols">
        <div className="stack" style={{ ['--gap' as string]: 'var(--s-9)' }}>
          {pending > 0 && (
            <section>
              <div className="section-head"><h2 className="h2">Te espera</h2></div>
              <div className="list">
                {envs.map((e) => (
                  <button key={e.id} className="row-item" data-world="boxes" onClick={() => go('show')}>
                    <span className="lead-icon"><Icon name="envelope" size={18} /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>{e.name}</span><span className="small faint">Sobre secreto listo para abrir</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                ))}
                {free.map((f) => (
                  <button key={f.p + f.tier} className="row-item" data-world="boxes" onClick={() => go('boxes')}>
                    <span className="lead-icon"><Icon name="gift" size={18} /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>{BOXES.find((b) => b.tier === f.tier)?.name} gratis</span><span className="small faint">Para {PLAYER_NAME[f.p]}{f.n > 1 ? `, ${f.n} cajas` : ''}</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                ))}
                {unconfigured.length > 0 && (
                  <button className="row-item" data-world="couples" onClick={() => go('prefs')}>
                    <span className="lead-icon"><Icon name="sliders" size={18} /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>Configura tus límites</span><span className="small faint">Falta {unconfigured.map((p) => PLAYER_NAME[p]).join(' y ')}, en privado</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                )}
              </div>
            </section>
          )}

          <section>
            <div className="section-head"><h2 className="h2">En este episodio</h2><button className="btn quiet sm" onClick={() => go('challenges')}>Todas<Icon name="chevron" size={14} /></button></div>
            <div className="list">
              {picks.slice(0, 5).map((c) => (
                <button key={c!.id} className="row-item" data-world={CATEGORIES[c!.category].theme} onClick={() => go('challenge', c!.id)}>
                  <span className="lead-icon"><Icon name={s.completed[c!.id] ? 'check' : WORLD_ICON[c!.category]} size={18} /></span>
                  <span className="grow">
                    <span className="h5" style={{ display: 'block' }}>{c!.name}</span>
                    <span className="meta"><span>{c!.duration} min</span><span>{c!.mode === 'coop' ? 'En equipo' : 'Duelo'}</span></span>
                  </span>
                  <span className="small value-text num" style={{ fontWeight: 700 }}>+{c!.reward.coins}</span>
                  <Icon name="chevron" size={18} className="chev" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="section-head"><h2 className="h2">Premios</h2><button className="btn quiet sm" onClick={() => go('inventory')}>Inventario<Icon name="chevron" size={14} /></button></div>
          <div className="ledger">
            <button className="ledger-cell" onClick={() => go('boxes')}><span className="label">Cajas disponibles</span><span className="v">{BOXES.filter((b) => s.episode >= b.unlockEpisode).length}<small>de 5</small></span></button>
            <button className="ledger-cell" onClick={() => go('roulette')}><span className="label">Ruletas en juego</span><span className="v">{WHEELS.filter((w) => s.episode >= w.unlockEpisode).length}<small>de 4</small></span></button>
            <button className="ledger-cell" onClick={() => go('inventory')}><span className="label">Premios ganados</span><span className="v value-text">{s.prizes.length}</span></button>
            <button className="ledger-cell" onClick={() => go('achievements')}><span className="label">Logros</span><span className="v">{Object.keys(s.achievements).length}<small>de {ACHIEVEMENTS.length * 2}</small></span></button>
          </div>
          {lead && <p className="small faint" style={{ marginTop: 'var(--s-3)' }}>Si {PLAYER_NAME[rival(lead)]} gana remontando, cobra las monedas por 1,5.</p>}
        </aside>
      </div>

      <section className="section">
        <div className="section-head"><h2 className="h2">Mundos</h2></div>
        <div className="worlds">
          {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => (
            <button key={c} className="world-tile" data-world={CATEGORIES[c].theme} onClick={() => go(WORLD_ROUTE[c])}>
              <span className="wi"><Icon name={WORLD_ICON[c]} size={20} /></span>
              <span className="wn">{CATEGORIES[c].name}</span>
              <span className="small faint">{CHALLENGES.filter((x) => x.category === c).length} pruebas</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
