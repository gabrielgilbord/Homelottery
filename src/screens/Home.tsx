import { useGame, leader, availableEnvelopes, categoryAllowed, intensityAllowed } from '../state/store';
import { EPISODES } from '../data/episodes';
import { challengeById } from '../data/challenges';
import { Icon } from '../components/Icon';
import { go } from '../lib/router';
import { PLAYERS, PLAYER_NAME } from '../types';
import { ACHIEVEMENTS, BOXES, WHEELS } from '../data/rewards';
import { Section } from '../components/ui';

export default function Home() {
  const s = useGame();
  const ep = EPISODES[s.episode - 1];
  const lead = leader(s);
  const nextChallenge = ep.picks.map(challengeById).find((c) => c && !s.completed[c.id] && categoryAllowed(s, c.category) && intensityAllowed(s, c.intensity));
  const envs = availableEnvelopes(s).filter((e) => !e.hostOnly || s.envelopesForced.includes(e.id));
  const unlockedBoxes = BOXES.filter((b) => s.episode >= b.unlockEpisode);
  const unlockedWheels = WHEELS.filter((w) => s.episode >= w.unlockEpisode);
  const results = s.history.filter((h) => h.kind === 'result').length;
  const progress = Math.min(100, Math.round(((s.episode - 1) / 7) * 100));
  const free = PLAYERS.flatMap((p) => Object.entries(s.players[p].freeBoxes).filter(([, n]) => (n || 0) > 0).map(([t, n]) => ({ p, t, n })));
  const unconfigured = PLAYERS.filter((p) => !s.prefs[p].configured);

  return (
    <div className="stack lg">
      <div className="hero" data-theme={ep.theme}>
        <div className="hero-rays" />
        <div style={{ position: 'relative' }}>
          <div className="row between">
            <span className="eyebrow">{ep.code} · En emisión</span>
            <span className="chip accent">{ep.mood}</span>
          </div>
          <h1 className="h-display" style={{ marginTop: 10 }}>{ep.title}</h1>
          <p className="muted" style={{ margin: '8px 0 16px', maxWidth: 520 }}>{ep.subtitle}</p>
          <div className="progress" style={{ marginBottom: 6 }}><i style={{ width: progress + '%' }} /></div>
          <div className="row between tiny faint"><span>Progreso del concurso</span><span>Episodio {s.episode} de 8 · {results} pruebas jugadas</span></div>
          <div className="row wrap" style={{ marginTop: 18 }}>
            <button className="btn primary" onClick={() => go('show')}><Icon name="show" />Ver el episodio</button>
            {nextChallenge && <button className="btn" onClick={() => go('challenge', nextChallenge.id)}><Icon name="target" />Siguiente: {nextChallenge.name}</button>}
          </div>
        </div>
      </div>

      <div className="versus">
        {PLAYERS.map((p, i) => {
          const P = s.players[p];
          const side = (
            <div key={p} className={`vs-side ${p}${lead === p ? ' lead' : ''}`}>
              <div className={'ptag ' + p} style={{ fontSize: 13, letterSpacing: '.14em' }}>{PLAYER_NAME[p].toUpperCase()}</div>
              <div className="score-num" style={{ marginTop: 6 }}>{P.points}</div>
              <div className="tiny faint">puntos</div>
              <div className="stat-line">
                <span><Icon name="coin" size={14} />{P.coins}</span>
                <span><Icon name="cards" size={14} />{P.cards.length}</span>
                {P.keys > 0 && <span><Icon name="key" size={14} />{P.keys}</span>}
                {P.streak >= 2 && <span style={{ color: 'var(--accent)' }}><Icon name="flame" size={14} />{P.streak}</span>}
              </div>
            </div>
          );
          return i === 0 ? [side, <div key="vs" className="vs-mid">VS</div>] : side;
        })}
      </div>

      {(envs.length > 0 || free.length > 0 || unconfigured.length > 0) && (
        <div className="stack">
          {envs.map((e) => (
            <button key={e.id} className="card clickable glow item" data-theme="boxes" onClick={() => go('show')}>
              <div className="item-icon"><Icon name="envelope" /></div>
              <div><h3>Sobre secreto disponible</h3><p>{e.name} — ábrelo en The Show.</p></div>
            </button>
          ))}
          {free.map((f) => (
            <button key={f.p + f.t} className="card clickable item" data-theme="boxes" onClick={() => go('boxes')}>
              <div className="item-icon"><Icon name="gift" /></div>
              <div><h3>{PLAYER_NAME[f.p]} tiene {f.n} caja{f.n! > 1 ? 's' : ''} gratis</h3><p>{BOXES.find((b) => b.tier === f.t)?.name} lista para abrir.</p></div>
            </button>
          ))}
          {unconfigured.length > 0 && (
            <button className="card clickable item" data-theme="couples" onClick={() => go('prefs')}>
              <div className="item-icon"><Icon name="sliders" /></div>
              <div><h3>Configurad vuestros límites</h3><p>Falta: {unconfigured.map((p) => PLAYER_NAME[p]).join(' y ')}. Cada uno en privado.</p></div>
            </button>
          )}
        </div>
      )}

      <Section title="Ahora en el plató" aside={<button className="btn sm ghost" onClick={() => go('challenges')}>Biblioteca<Icon name="chevron" size={16} /></button>}>
        <div className="grid two">
          {ep.picks.slice(0, 4).map((id) => {
            const c = challengeById(id); if (!c) return null;
            const ok = categoryAllowed(s, c.category) && intensityAllowed(s, c.intensity);
            return (
              <button key={id} className="card clickable challenge-card" onClick={() => go('challenge', id)} disabled={!ok} style={{ opacity: ok ? 1 : 0.45 }}>
                {s.completed[id] ? <span className="done-badge"><Icon name="check" /></span> : null}
                <div className="eyebrow" style={{ fontSize: 10 }}>{c.sub}</div>
                <h3 style={{ margin: '4px 0 0', fontSize: 17 }}>{c.name}</h3>
                <p className="small muted" style={{ margin: '4px 0 0' }}>{c.tagline}</p>
                <div className="meta"><span><Icon name="timer" size={14} />{c.duration} min</span><span><Icon name="coin" size={14} />{c.reward.coins}</span><span><Icon name="star" size={14} />{c.reward.points} pts</span></div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Recompensas desbloqueadas">
        <div className="grid four">
          <button className="card clickable tight" data-theme="boxes" onClick={() => go('boxes')}>
            <Icon name="gift" style={{ color: 'var(--accent)' }} /><div style={{ fontWeight: 800, marginTop: 8 }}>{unlockedBoxes.length} de 5 cajas</div>
            <div className="tiny faint">{unlockedBoxes.length ? unlockedBoxes.map((b) => b.name.replace(' Box', '')).join(' · ') : 'Desde el Episodio 02'}</div>
          </button>
          <button className="card clickable tight" data-theme="roulette" onClick={() => go('roulette')}>
            <Icon name="wheel" style={{ color: 'var(--accent)' }} /><div style={{ fontWeight: 800, marginTop: 8 }}>{unlockedWheels.length} de 4 ruletas</div>
            <div className="tiny faint">{unlockedWheels.length ? unlockedWheels.map((w) => w.name.replace('Ruleta ', '')).join(' · ') : 'Desde el Episodio 02'}</div>
          </button>
          <button className="card clickable tight" data-theme="inventory" onClick={() => go('inventory')}>
            <Icon name="bag" style={{ color: 'var(--accent)' }} /><div style={{ fontWeight: 800, marginTop: 8 }}>{s.prizes.length} premios</div>
            <div className="tiny faint">{s.players.gabriel.cards.length + s.players.tatiana.cards.length} cartas en juego</div>
          </button>
          <button className="card clickable tight" data-theme="boxes" onClick={() => go('achievements')}>
            <Icon name="medal" style={{ color: 'var(--accent)' }} /><div style={{ fontWeight: 800, marginTop: 8 }}>{Object.keys(s.achievements).length} logros</div>
            <div className="tiny faint">de {ACHIEVEMENTS.length * 2} posibles</div>
          </button>
        </div>
      </Section>
    </div>
  );
}
