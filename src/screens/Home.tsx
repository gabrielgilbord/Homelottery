import { useGame, leader, availableEnvelopes, categoryAllowed, intensityAllowed } from '../state/store';
import { EPISODES, CATEGORIES } from '../data/episodes';
import { CHALLENGES, challengeById } from '../data/challenges';
import { ACHIEVEMENTS, BOXES, WHEELS } from '../data/rewards';
import { Icon } from '../components/Icon';
import { AnimatedNumber } from '../components/ui';
import { OnAir, Wordmark } from '../components/Logo';
import { go } from '../lib/router';
import { PLAYERS, PLAYER_NAME, rival, type CategoryId } from '../types';

const WORLD_ROUTE: Record<CategoryId, string> = { home: 'challenges', couples: 'couples', cards: 'cards', gaming: 'gaming', party: 'party', movie: 'movie' };
export const WORLD_ICON: Record<CategoryId, string> = { home: 'home', couples: 'heart', cards: 'cards', gaming: 'gamepad', party: 'glass', movie: 'film' };
/** Each section of the show: Spanish name first, the show's own title as a brand detail. */
export const WORLD_SHOW: Record<CategoryId, { name: string; show: string }> = {
  gaming: { name: 'Gaming', show: 'The Arcade Break' },
  party: { name: 'Fiesta', show: 'The Live Act' },
  couples: { name: 'En pareja', show: 'After Hours' },
  movie: { name: 'Noche de cine', show: 'The Screening Room' },
  cards: { name: 'Cartas y dados', show: 'The Card Table' },
  home: { name: 'Retos de casa', show: 'Home Games' },
};
const WORLD_ORDER: CategoryId[] = ['gaming', 'party', 'couples', 'movie', 'cards', 'home'];

const today = () => {
  try { return new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }); } catch { return ''; }
};

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
  const done = picks.filter((c) => s.completed[c!.id]).length;

  return (
    <div className="home">
      {/* ===== The masthead: tonight's show ===== */}
      <section className="masthead" aria-label="En emisión">
        <div className="mh-top">
          <OnAir />
          <span className="mh-date">{today()}</span>
        </div>
        <div className="mh-title">
          <Wordmark size="xl" tagline="Gabriel × Tatiana" />
        </div>

        <div className="mh-ep">
          <div className="mh-num" aria-hidden>{String(s.episode).padStart(2, '0')}</div>
          <div className="mh-epbody">
            <span className="mh-when"><span className="bc">Episodio {s.episode} de 8</span><span>{ep.time.replace(' – ', ' a ')}</span></span>
            <h1 className="mh-h1">{ep.title}</h1>
            <p className="mh-sub">{ep.subtitle}</p>
            <ol className="mh-ticks" aria-label={`Episodio ${s.episode} de 8`}>
              {EPISODES.map((e) => <li key={e.n} className={e.n < s.episode ? 'past' : e.n === s.episode ? 'now' : ''} />)}
            </ol>
          </div>
        </div>
      </section>

      {/* ===== The scoreboard: a stage plate ===== */}
      <section className="plate" aria-label={`Marcador: Gabriel ${g}, Tatiana ${t}`} style={{ ['--dg' as string]: Math.max(3, String(Math.max(g, t)).length) }}>
        <div className="plate-row">
          {PLAYERS.map((p, i) => (
            <div key={p} className={'plate-side ' + p + (i === 1 ? ' right' : '') + (lead === p ? ' leading' : lead ? ' trailing' : '')}>
              <span className="plate-name"><b>{PLAYER_NAME[p][0]}</b>{PLAYER_NAME[p]}</span>
              <span className="plate-score"><AnimatedNumber value={s.players[p].points} /></span>
              <span className="plate-coins"><Icon name="coin" size={14} /><AnimatedNumber value={s.players[p].coins} showDelta /> monedas</span>
            </div>
          ))}
          <div className="plate-vs" aria-hidden>vs</div>
        </div>
        <div className="plate-tug" aria-hidden><i style={{ transform: `scaleX(${share})` }} /></div>
        <div className="plate-foot">
          <span>{lead ? <>Lidera <b className={'pname ' + lead}>{PLAYER_NAME[lead]}</b> por {gap}</> : 'Empate técnico'}</span>
          <span>{results} {results === 1 ? 'prueba jugada' : 'pruebas jugadas'}</span>
        </div>
      </section>

      {/* ===== The invitation: an admission ticket ===== */}
      {next && (
        <button className="invite" onClick={() => go('challenge', next.id)}>
          <span className="inv-main">
            <span className="inv-k">{done === 0 ? 'Que empiece el show' : 'Siguiente número'}</span>
            <span className="inv-t">{next.name}</span>
            <span className="inv-m"><span>{next.duration} min</span><span>{next.mode === 'coop' ? 'En equipo' : 'Duelo'}</span></span>
          </span>
          <span className="inv-stub" aria-hidden>
            <span className="inv-prize">+{next.reward.coins}</span>
            <span className="inv-cur">monedas</span>
            <Icon name="play" size={20} />
          </span>
        </button>
      )}
      <div className="home-sub-actions"><button className="btn quiet" onClick={() => go('show')}>Ver la escaleta completa</button></div>

      <div className="home-cols">
        <div className="stack" style={{ ['--gap' as string]: 'var(--s-9)' }}>
          {pending > 0 && (
            <section aria-label="Te espera">
              <div className="section-head"><h2 className="h2">Te espera</h2><span className="bc hot">Special guests</span></div>
              <div className="waiting">
                {envs.map((e) => (
                  <button key={e.id} className="mini-env" onClick={() => go('show')}>
                    <span className="me-env" aria-hidden><i /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>{e.name}</span><span className="small faint">Sobre secreto listo para abrir</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                ))}
                {free.map((f) => (
                  <button key={f.p + f.tier} className="mini-env box" onClick={() => go('boxes')}>
                    <span className="me-box" data-tier={f.tier} aria-hidden />
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>{BOXES.find((b) => b.tier === f.tier)?.name} gratis</span><span className="small faint">Para {PLAYER_NAME[f.p]}{f.n > 1 ? `, ${f.n} cajas` : ''}</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                ))}
                {unconfigured.length > 0 && (
                  <button className="mini-env" onClick={() => go('prefs')}>
                    <span className="lead-icon" data-world="couples" style={{ width: 40, height: 40, borderRadius: 6, display: 'grid', placeItems: 'center', color: 'var(--rose)', border: '1px solid var(--line-2)' }}><Icon name="sliders" size={18} /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>Configura tus límites</span><span className="small faint">Falta {unconfigured.map((p) => PLAYER_NAME[p]).join(' y ')}, en privado</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                )}
              </div>
            </section>
          )}

          <section aria-label="En este episodio">
            <div className="section-head"><h2 className="h2">En este episodio</h2><button className="btn quiet sm" onClick={() => go('challenges')}>Todas las pruebas</button></div>
            <ol className="acts">
              {picks.slice(0, 5).map((c, i) => (
                <li key={c!.id}>
                  <button className={'act' + (s.completed[c!.id] ? ' done' : '')} data-world={CATEGORIES[c!.category].theme} onClick={() => go('challenge', c!.id)}>
                    <span className="act-n fig">{String(i + 1).padStart(2, '0')}</span>
                    <span className="grow">
                      <span className="act-t">{c!.name}</span>
                      <span className="meta"><span><Icon name={WORLD_ICON[c!.category]} size={13} />{WORLD_SHOW[c!.category].name}</span><span>{c!.duration} min</span><span>{c!.mode === 'coop' ? 'En equipo' : 'Duelo'}</span></span>
                    </span>
                    {s.completed[c!.id] ? <span className="act-done"><Icon name="check" size={14} />Hecha</span> : <span className="act-r fig">+{c!.reward.coins}</span>}
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside aria-label="Premios">
          <div className="section-head"><h2 className="h2">Premios</h2><button className="btn quiet sm" onClick={() => go('inventory')}>Inventario</button></div>
          <div className="ledger">
            <button className="ledger-cell" onClick={() => go('boxes')}><span className="label">Cajas disponibles</span><span className="v">{BOXES.filter((b) => s.episode >= b.unlockEpisode).length}<small>de 5</small></span></button>
            <button className="ledger-cell" onClick={() => go('roulette')}><span className="label">Ruletas en juego</span><span className="v">{WHEELS.filter((w) => s.episode >= w.unlockEpisode).length}<small>de 4</small></span></button>
            <button className="ledger-cell" onClick={() => go('inventory')}><span className="label">Premios ganados</span><span className="v value-text">{s.prizes.length}</span></button>
            <button className="ledger-cell" onClick={() => go('achievements')}><span className="label">Logros</span><span className="v">{Object.keys(s.achievements).length}<small>de {ACHIEVEMENTS.length * 2}</small></span></button>
          </div>
          {lead && <p className="small faint" style={{ marginTop: 'var(--s-3)' }}>Si {PLAYER_NAME[rival(lead)]} gana remontando, cobra las monedas por 1,5.</p>}
        </aside>
      </div>

      {/* ===== The sections of the show: one ground each ===== */}
      <section className="section" aria-label="Las secciones del programa">
        <div className="section-head"><h2 className="h2">Las secciones</h2><span className="bc">Tonight’s show</span></div>
        <div className="worlds-mosaic">
          {WORLD_ORDER.map((c) => (
            <button key={c} className={'wtile w-' + c} data-world={CATEGORIES[c].theme} onClick={() => go(WORLD_ROUTE[c])}>
              <span className="wt-show">{WORLD_SHOW[c].show}</span>
              <span className="wt-name">{WORLD_SHOW[c].name}</span>
              <span className="wt-foot"><Icon name={WORLD_ICON[c]} size={18} /><span>{CHALLENGES.filter((x) => x.category === c).length} pruebas</span></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
