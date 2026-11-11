import { useMemo, useState } from 'react';
import { CHALLENGES, challengeById } from '../data/challenges';
import { CATEGORIES } from '../data/episodes';
import { useGame, recordResult, skipChallenge, categoryAllowed, intensityAllowed, type Outcome, type ResultSummary } from '../state/store';
import { Icon } from '../components/Icon';
import { ConfirmButton, Modal, PageHead, Section, Seg, Timer } from '../components/ui';
import { go } from '../lib/router';
import { pick } from '../lib/random';
import type { CategoryId, Challenge, GameState } from '../types';
import { INTENSITY_LABEL, PLAYERS, PLAYER_NAME } from '../types';

export function allowed(s: GameState, c: Challenge) {
  return categoryAllowed(s, c.category) && intensityAllowed(s, c.intensity);
}

export function ChallengeCard({ c }: { c: Challenge }) {
  const s = useGame();
  const ok = allowed(s, c);
  const done = s.completed[c.id] || 0;
  return (
    <button className="card clickable challenge-card" data-theme={CATEGORIES[c.category].theme} onClick={() => go('challenge', c.id)} style={{ opacity: ok ? 1 : 0.4 }}>
      {done > 0 && <span className="done-badge row" style={{ gap: 4 }}><Icon name="check" size={16} />{done > 1 ? `x${done}` : ''}</span>}
      <div className="row" style={{ gap: 8 }}>
        <span className="eyebrow" style={{ fontSize: 10 }}>{c.sub || CATEGORIES[c.category].short}</span>
        {c.intensity && <span className={'chip ' + c.intensity}>{INTENSITY_LABEL[c.intensity]}</span>}
      </div>
      <h3 style={{ margin: '6px 0 0', fontSize: 17, paddingRight: 24 }}>{c.name}</h3>
      <p className="small muted" style={{ margin: '4px 0 0' }}>{c.tagline}</p>
      <div className="meta">
        <span><Icon name="timer" size={14} />{c.duration} min</span>
        <span><Icon name={c.mode === 'coop' ? 'heart' : 'bolt'} size={14} />{c.mode === 'coop' ? 'Equipo' : 'Duelo'}</span>
        <span><Icon name="star" size={14} />{c.reward.points}</span>
        <span><Icon name="coin" size={14} />{c.reward.coins}</span>
        {c.requires && <span style={{ color: 'var(--accent)' }}><Icon name="info" size={14} />{c.requires}</span>}
        {!ok && <span><Icon name="lock" size={14} />Fuera de vuestros límites</span>}
      </div>
    </button>
  );
}

export function ChallengeList({ list }: { list: Challenge[] }) {
  if (!list.length) return <div className="empty">No hay pruebas con estos filtros.</div>;
  return <div className="grid two">{list.map((c) => <ChallengeCard key={c.id} c={c} />)}</div>;
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

  const randomPick = () => {
    const pool = list.filter((c) => allowed(s, c) && !s.completed[c.id]);
    const c = pick(pool.length ? pool : list.filter((x) => allowed(s, x)));
    if (c) go('challenge', c.id);
  };

  return (
    <div>
      <PageHead eyebrow="03 · The Game Library" title="Challenges" sub={`${CHALLENGES.length} pruebas jugables. Cada una con reglas, materiales, puntuación y revancha.`} num="03" />
      <div className="stack">
        <input className="input" placeholder="Buscar prueba…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="scroll-x">
          <button className={'chip' + (cat === 'all' ? ' accent' : '')} onClick={() => setCat('all')}>Todas</button>
          {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => (
            <button key={c} className={'chip' + (cat === c ? ' accent' : '')} onClick={() => setCat(c)}>{CATEGORIES[c].short} · {CHALLENGES.filter((x) => x.category === c).length}</button>
          ))}
        </div>
        <div className="row wrap between">
          <Seg<Filter> value={f} onChange={setF} options={[{ v: 'all', label: 'Todas' }, { v: 'todo', label: 'Sin jugar' }, { v: 'quick', label: '≤10 min' }, { v: 'coop', label: 'Equipo' }]} />
          <button className="btn primary" onClick={randomPick}><Icon name="dice" />Prueba al azar</button>
        </div>
      </div>
      <Section title={`${list.length} pruebas`}>
        <ChallengeList list={list} />
      </Section>
    </div>
  );
}

export function ChallengeDetail({ id }: { id: string }) {
  const s = useGame();
  const c = challengeById(id);
  const [result, setResult] = useState<ResultSummary | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  if (!c) return <div className="empty">Prueba no encontrada. <button className="btn sm" onClick={() => go('challenges')}>Volver</button></div>;
  const ok = allowed(s, c);
  const done = s.completed[c.id] || 0;
  const mods = PLAYERS.filter((p) => s.players[p].doubleArmed || s.players[p].multiplier > 1);

  const register = (o: Outcome) => setResult(recordResult(c.id, o));
  const alternatives = CHALLENGES.filter((x) => x.id !== c.id && x.category === c.category && allowed(s, x) && !s.completed[x.id]);

  return (
    <div data-theme={CATEGORIES[c.category].theme}>
      <button className="btn ghost sm" onClick={() => history.length > 1 ? history.back() : go('challenges')} style={{ marginBottom: 14 }}><Icon name="back" size={16} />Volver</button>
      <PageHead eyebrow={`${CATEGORIES[c.category].name} · ${c.sub || ''}`} title={c.name} sub={c.tagline}>
        <div className="chips" style={{ marginTop: 12 }}>
          {c.intensity && <span className={'chip ' + c.intensity}>{INTENSITY_LABEL[c.intensity]}</span>}
          <span className="chip">{c.mode === 'coop' ? 'Cooperativo' : 'Duelo individual'}</span>
          {c.drinks && <span className="chip">Bebida opcional · funciona con agua</span>}
          {c.requires && <span className="chip accent">Requiere: {c.requires}</span>}
          {done > 0 && <span className="chip" style={{ color: 'var(--good)' }}>Jugada {done} {done === 1 ? 'vez' : 'veces'}</span>}
        </div>
      </PageHead>

      {!ok && <div className="card tight" style={{ marginBottom: 14, borderColor: 'rgba(239,122,122,.4)' }}><b>Fuera de vuestros límites actuales.</b> <span className="small muted">Se puede jugar igualmente si los dos queréis, o elegir otra.</span></div>}

      <div className="kv">
        <div><b>Jugadores</b>{c.players}</div>
        <div><b>Duración</b>{c.duration} min</div>
        <div><b>Dificultad</b>{'●'.repeat(c.difficulty)}{'○'.repeat(3 - c.difficulty)}</div>
        <div><b>Recompensa</b>{c.reward.points} pts · {c.reward.coins} monedas{c.reward.bonus ? ' · + sorpresa' : ''}</div>
      </div>

      <Section title="Materiales">
        <div className="chips">{c.materials.map((m) => <span key={m} className="chip">{m}</span>)}</div>
      </Section>

      <Section title="Cómo se juega">
        <div className="card"><ol className="steps">{c.steps.map((st, i) => <li key={i}>{st}</li>)}</ol></div>
      </Section>

      <div className="grid two section">
        <div className="card tight"><div className="eyebrow" style={{ fontSize: 10 }}>Puntuación</div><p style={{ margin: '6px 0 0' }}>{c.scoring}</p></div>
        <div className="card tight"><div className="eyebrow" style={{ fontSize: 10 }}>Condición de victoria</div><p style={{ margin: '6px 0 0' }}>{c.win}</p></div>
        <div className="card tight"><div className="eyebrow" style={{ fontSize: 10 }}>Revancha</div><p style={{ margin: '6px 0 0' }}>{c.rematch}</p></div>
        <div className="card tight"><div className="eyebrow" style={{ fontSize: 10 }}>Premio</div><p style={{ margin: '6px 0 0' }}>{c.mode === 'coop' ? 'Si lo superáis, los dos cobráis la recompensa completa.' : 'El ganador cobra la recompensa; el otro, una consolación.'} {c.reward.bonus ? 'Además hay un premio sorpresa.' : ''} {s.episode === 8 ? 'Gran Final: puntos x2.' : ''}</p></div>
      </div>

      <Section title="Temporizador">
        <div className="card"><Timer seconds={c.duration <= 5 ? 60 : Math.min(600, c.duration * 60)} /></div>
      </Section>

      <Section title="Registrar resultado">
        <div className="card glow stack">
          {mods.length > 0 && <div className="small accent">{mods.map((p) => `${PLAYER_NAME[p]}: ${s.players[p].doubleArmed ? 'Double Trouble activo' : ''}${s.players[p].multiplier > 1 ? ` x${s.players[p].multiplier}` : ''}`).join(' · ')}</div>}
          {c.mode === 'duel' ? (
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {PLAYERS.map((p) => (
                <ConfirmButton key={p} className="btn lg" onConfirm={() => register(p)} confirmText={`¿Gana ${PLAYER_NAME[p]}?`}>
                  <span className={'ptag ' + p}><Icon name="trophy" />Gana {PLAYER_NAME[p]}</span>
                </ConfirmButton>
              ))}
              <ConfirmButton className="btn" onConfirm={() => register('tie')} confirmText="¿Empate?"><Icon name="users" />Empate</ConfirmButton>
              <button className="btn ghost" onClick={() => setSwapOpen(true)}><Icon name="skip" />Pasar / cambiar</button>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <ConfirmButton className="btn primary lg" onConfirm={() => register('coop-win')} confirmText="¿Superado?"><Icon name="heart" />Superado</ConfirmButton>
              <ConfirmButton className="btn lg" onConfirm={() => register('coop-fail')} confirmText="¿No superado?">No superado</ConfirmButton>
              <button className="btn ghost" style={{ gridColumn: '1 / -1' }} onClick={() => setSwapOpen(true)}><Icon name="skip" />Pasar / cambiar</button>
            </div>
          )}
          <p className="tiny faint" style={{ margin: 0 }}>Toca dos veces para confirmar. Pasar una prueba nunca penaliza.</p>
        </div>
      </Section>

      <Modal open={!!result} onClose={() => setResult(null)} eyebrow={c.name} title={result?.headline}>
        {result && (
          <div className="stack">
            {result.lines.map((l, i) => <div key={i} className="card tight small">{l}</div>)}
            <div className="row wrap">
              <button className="btn primary" onClick={() => { setResult(null); go('show'); }}>Volver al episodio</button>
              <button className="btn" onClick={() => { setResult(null); go('boxes'); }}><Icon name="gift" />Cajas</button>
              <button className="btn" onClick={() => { setResult(null); go('roulette'); }}><Icon name="wheel" />Ruleta</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={swapOpen} onClose={() => setSwapOpen(false)} eyebrow="Sin presión" title="Pasar o cambiar">
        <div className="stack">
          <p className="muted" style={{ margin: 0 }}>Pasar no resta nada. Elige una alternativa de la misma categoría o vuelve a la biblioteca.</p>
          {alternatives.slice(0, 4).map((a) => (
            <button key={a.id} className="card clickable tight item" onClick={() => { skipChallenge(c.id); setSwapOpen(false); go('challenge', a.id); }}>
              <div className="item-icon"><Icon name="target" /></div>
              <div style={{ flex: 1 }}><h3 style={{ fontSize: 15 }}>{a.name}</h3><p className="tiny">{a.tagline}</p></div>
            </button>
          ))}
          <button className="btn" onClick={() => { skipChallenge(c.id); setSwapOpen(false); const a = pick(alternatives); if (a) go('challenge', a.id); else go('challenges'); }}><Icon name="dice" />Sustituir al azar</button>
          <button className="btn ghost" onClick={() => { skipChallenge(c.id); setSwapOpen(false); go('challenges'); }}>Solo pasar</button>
        </div>
      </Modal>
    </div>
  );
}
