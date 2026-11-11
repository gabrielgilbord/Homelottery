import { useMemo, useState } from 'react';
import { CHALLENGES, challengeById } from '../data/challenges';
import { CATEGORIES } from '../data/episodes';
import { useGame, recordResult, skipChallenge, categoryAllowed, intensityAllowed, type Outcome, type ResultSummary } from '../state/store';
import { Icon } from '../components/Icon';
import { ConfirmButton, Empty, Modal, PageHead, Seg, Timer } from '../components/ui';
import { go } from '../lib/router';
import { pick } from '../lib/random';
import { celebrate } from '../lib/celebrate';
import type { CategoryId, Challenge, GameState } from '../types';
import { INTENSITY_LABEL, PLAYERS, PLAYER_NAME } from '../types';

export function allowed(s: GameState, c: Challenge) {
  return categoryAllowed(s, c.category) && intensityAllowed(s, c.intensity);
}

function Pips({ n }: { n: number }) {
  return <span className="pips" aria-label={`Dificultad ${n} de 3`}>{[1, 2, 3].map((i) => <i key={i} className={i <= n ? 'on' : ''} />)}</span>;
}

export function ChallengeCard({ c }: { c: Challenge }) {
  const s = useGame();
  const ok = allowed(s, c);
  const done = s.completed[c.id] || 0;
  return (
    <button className="ccard" data-world={CATEGORIES[c.category].theme} aria-disabled={!ok} onClick={() => go('challenge', c.id)}>
      <div className="ctop">
        <span className="cat">{c.sub || CATEGORIES[c.category].short}</span>
        <span className="cluster" style={{ ['--gap' as string]: '6px' }}>
          {c.intensity && <span className={'tag ' + c.intensity}>{INTENSITY_LABEL[c.intensity]}</span>}
          {done > 0 && <span className="tag ok"><Icon name="check" size={11} />{done > 1 ? `x${done}` : 'Jugada'}</span>}
          {!ok && <span className="tag"><Icon name="lock" size={11} />Límite</span>}
        </span>
      </div>
      <div className="ctitle">{c.name}</div>
      <div className="ctag">{c.tagline}</div>
      <div className="cmeta">
        <span><Icon name="timer" size={13} />{c.duration}′</span>
        <span><Icon name={c.mode === 'coop' ? 'users' : 'bolt'} size={13} />{c.mode === 'coop' ? 'Equipo' : 'Duelo'}</span>
        <Pips n={c.difficulty} />
        <span className="reward"><Icon name="coin" size={13} />{c.reward.coins} · {c.reward.points} pts</span>
      </div>
    </button>
  );
}

export function ChallengeList({ list }: { list: Challenge[] }) {
  if (!list.length) return <Empty icon="target">No hay pruebas con estos filtros.</Empty>;
  return <div className="catalog stagger">{list.map((c) => <ChallengeCard key={c.id} c={c} />)}</div>;
}

type Filter = 'all' | 'todo' | 'quick' | 'coop';

export default function Challenges() {
  const s = useGame();
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [f, setF] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const list = useMemo(() => CHALLENGES.filter((c) => {
    if (cat !== 'all' && c.category !== cat) return false;
    if (f === 'todo' && s.completed[c.id]) return false;
    if (f === 'quick' && c.duration > 10) return false;
    if (f === 'coop' && c.mode !== 'coop') return false;
    if (q && !(c.name + ' ' + c.tagline + ' ' + (c.sub || '')).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [cat, f, q, s.completed]);
  const played = Object.keys(s.completed).length;

  const randomPick = () => {
    const pool = list.filter((c) => allowed(s, c) && !s.completed[c.id]);
    const c = pick(pool.length ? pool : list.filter((x) => allowed(s, x)));
    if (c) go('challenge', c.id);
  };

  return (
    <div>
      <PageHead eyebrow="Biblioteca de pruebas" title="Challenges" sub={`${CHALLENGES.length} pruebas en seis mundos. ${played} jugadas hasta ahora.`}
        aside={<button className="btn primary" onClick={randomPick}><Icon name="dice" size={16} />Al azar</button>} />
      <div className="filters">
        <label className="search"><Icon name="target" size={16} /><span className="sr-only">Buscar prueba</span><input className="input" placeholder="Buscar una prueba" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <div className="hscroll">
          <button className={'chip' + (cat === 'all' ? ' on' : '')} onClick={() => setCat('all')}>Todas · {CHALLENGES.length}</button>
          {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => (
            <button key={c} data-world={CATEGORIES[c].theme} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>
              <span className="dot" />{CATEGORIES[c].short} · {CHALLENGES.filter((x) => x.category === c).length}
            </button>
          ))}
        </div>
        <Seg<Filter> value={f} onChange={setF} label="Filtro" options={[{ v: 'all', label: 'Todas' }, { v: 'todo', label: 'Sin jugar' }, { v: 'quick', label: '≤ 10 min' }, { v: 'coop', label: 'Equipo' }]} />
      </div>
      <div className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>{list.length} resultados</div>
      <ChallengeList list={list} />
    </div>
  );
}

export function ChallengeDetail({ id }: { id: string }) {
  const s = useGame();
  const c = challengeById(id);
  const [result, setResult] = useState<ResultSummary | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  if (!c) return <Empty icon="target" action={<button className="btn sm" onClick={() => go('challenges')}>Volver a la biblioteca</button>}>Prueba no encontrada.</Empty>;
  const ok = allowed(s, c);
  const done = s.completed[c.id] || 0;
  const mods = PLAYERS.filter((p) => s.players[p].doubleArmed || s.players[p].multiplier > 1);

  const register = (o: Outcome) => {
    const r = recordResult(c.id, o);
    setResult(r);
    if (o !== 'coop-fail') celebrate(s.episode === 8 || c.reward.points >= 25 ? 2 : 1);
  };
  const alternatives = CHALLENGES.filter((x) => x.id !== c.id && x.category === c.category && allowed(s, x) && !s.completed[x.id]);

  return (
    <div>
      <button className="btn quiet sm" onClick={() => (history.length > 1 ? history.back() : go('challenges'))} style={{ marginBottom: 'var(--s-4)', marginLeft: -12 }}><Icon name="back" size={16} />Volver</button>
      <header className="detail-hero">
        <div className="cluster">
          <span className="eyebrow accent">{CATEGORIES[c.category].name} · {c.sub}</span>
          {c.intensity && <span className={'tag ' + c.intensity}>{INTENSITY_LABEL[c.intensity]}</span>}
          {done > 0 && <span className="tag ok">Jugada {done}×</span>}
        </div>
        <h1 className="h1">{c.name}</h1>
        <p className="lead">{c.tagline}</p>
        <div className="cluster">
          {c.drinks && <span className="tag">Bebida opcional · funciona con agua</span>}
          {c.requires && <span className="tag accent">Requiere {c.requires}</span>}
          {!ok && <span className="tag" style={{ ['--tone' as string]: 'var(--danger)' }}>Fuera de vuestros límites</span>}
        </div>
      </header>

      <dl className="specs" style={{ margin: 0 }}>
        <div><dt>Jugadores</dt><dd>{c.players}</dd></div>
        <div><dt>Duración</dt><dd>{c.duration} min</dd></div>
        <div><dt>Dificultad</dt><dd><Pips n={c.difficulty} /></dd></div>
        <div><dt>Recompensa</dt><dd className="value-text">{c.reward.points} pts · {c.reward.coins} monedas{c.reward.bonus ? ' + sorpresa' : ''}</dd></div>
      </dl>

      <div className="detail-grid section" style={{ marginTop: 'var(--s-8)' }}>
        <div className="stack" style={{ ['--gap' as string]: 'var(--s-8)' }}>
          <section>
            <div className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>Materiales</div>
            <div className="cluster">{c.materials.map((m) => <span key={m} className="chip">{m}</span>)}</div>
          </section>
          <section>
            <h2 className="h3" style={{ marginBottom: 'var(--s-3)' }}>Cómo se juega</h2>
            <ol className="steps">{c.steps.map((st, i) => <li key={i}><span>{st}</span></li>)}</ol>
          </section>
          <section className="rules3">
            <div><span className="eyebrow">Puntuación</span><span className="small">{c.scoring}</span></div>
            <div><span className="eyebrow">Victoria</span><span className="small">{c.win}</span></div>
            <div><span className="eyebrow">Revancha</span><span className="small">{c.rematch}</span></div>
            <div><span className="eyebrow">Premio</span><span className="small">{c.mode === 'coop' ? 'Si lo superáis, los dos cobráis la recompensa completa.' : 'Quien gana cobra la recompensa. Quien pierde, una consolación.'}{c.reward.bonus ? ' Además hay un premio sorpresa.' : ''}{s.episode === 8 ? ' Gran Final: puntos x2.' : ''}</span></div>
          </section>
        </div>

        <aside className="detail-aside stack" style={{ ['--gap' as string]: 'var(--s-4)' }}>
          <div className="surface"><div className="eyebrow" style={{ marginBottom: 'var(--s-4)' }}>Temporizador</div><Timer seconds={c.duration <= 5 ? 60 : Math.min(600, c.duration * 60)} /></div>
          <div className="surface result-panel">
            <div className="split"><span className="eyebrow">Resultado</span><span className="xs faint">Doble toque para confirmar</span></div>
            {mods.length > 0 && <div className="small value-text">{mods.map((p) => `${PLAYER_NAME[p]}: ${s.players[p].doubleArmed ? 'Double Trouble' : ''}${s.players[p].multiplier > 1 ? ` x${s.players[p].multiplier}` : ''}`).join(' · ')}</div>}
            {c.mode === 'duel' ? (
              <>
                {PLAYERS.map((p) => (
                  <ConfirmButton key={p} className={'winner-btn ' + p} onConfirm={() => register(p)} confirmText={<><span>¿Confirmas que gana {PLAYER_NAME[p]}?</span><Icon name="check" size={18} /></>}>
                    <span className="cluster"><span className={'avatar sm ' + p}>{PLAYER_NAME[p][0]}</span>Gana {PLAYER_NAME[p]}</span><Icon name="trophy" size={18} />
                  </ConfirmButton>
                ))}
                <div className="grid-2">
                  <ConfirmButton className="btn" onConfirm={() => register('tie')} confirmText="¿Empate?">Empate</ConfirmButton>
                  <button className="btn ghost" onClick={() => setSwapOpen(true)}>Pasar o cambiar</button>
                </div>
              </>
            ) : (
              <>
                <ConfirmButton className="winner-btn" onConfirm={() => register('coop-win')} confirmText={<><span>¿Superado?</span><Icon name="check" size={18} /></>}>
                  <span>Superado en equipo</span><Icon name="heart" size={18} />
                </ConfirmButton>
                <div className="grid-2">
                  <ConfirmButton className="btn" onConfirm={() => register('coop-fail')} confirmText="¿No superado?">No superado</ConfirmButton>
                  <button className="btn ghost" onClick={() => setSwapOpen(true)}>Pasar o cambiar</button>
                </div>
              </>
            )}
            <p className="xs faint">Pasar una prueba nunca resta nada.</p>
          </div>
        </aside>
      </div>

      <Modal open={!!result} onClose={() => setResult(null)}>
        {result && (
          <div className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
            <div className="result-hero">
              <span className="eyebrow accent">{c.name}</span>
              <h2 className="h2">{result.headline}</h2>
            </div>
            <div>{result.lines.map((l, i) => <div key={i} className="result-line"><span>{l}</span></div>)}</div>
            <div className="grid-2">
              <button className="btn" onClick={() => { setResult(null); go('boxes'); }}><Icon name="gift" size={16} />Cajas</button>
              <button className="btn" onClick={() => { setResult(null); go('roulette'); }}><Icon name="wheel" size={16} />Ruleta</button>
            </div>
            <button className="btn primary block" onClick={() => { setResult(null); go('show'); }}>Volver al episodio</button>
          </div>
        )}
      </Modal>

      <Modal open={swapOpen} onClose={() => setSwapOpen(false)} eyebrow="Sin presión" title="Pasar o cambiar">
        <div className="stack">
          <p className="muted">Pasar no resta nada. Elige otra prueba del mismo mundo.</p>
          <div className="list">
            {alternatives.slice(0, 4).map((a) => (
              <button key={a.id} className="row-item" onClick={() => { skipChallenge(c.id); setSwapOpen(false); go('challenge', a.id); }}>
                <span className="grow"><span className="h5" style={{ display: 'block' }}>{a.name}</span><span className="xs faint">{a.tagline}</span></span>
                <Icon name="chevron" size={18} className="chev" />
              </button>
            ))}
          </div>
          <button className="btn primary" onClick={() => { skipChallenge(c.id); setSwapOpen(false); const a = pick(alternatives); if (a) go('challenge', a.id); else go('challenges'); }}><Icon name="dice" size={16} />Sustituir al azar</button>
          <button className="btn ghost" onClick={() => { skipChallenge(c.id); setSwapOpen(false); go('challenges'); }}>Solo pasar</button>
        </div>
      </Modal>
    </div>
  );
}
