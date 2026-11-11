import { useState } from 'react';
import { useGame, leader } from '../state/store';
import { PageHead, Section, Seg, fmtTime } from '../components/ui';
import { Icon } from '../components/Icon';
import { PLAYERS, PLAYER_NAME } from '../types';

export default function Leaderboard() {
  const s = useGame();
  const [f, setF] = useState<'all' | 'result' | 'rewards'>('all');
  const l = leader(s);
  const max = Math.max(1, ...PLAYERS.map((p) => s.players[p].points));
  const hist = s.history.filter((h) => !h.secret).filter((h) => f === 'all' || (f === 'result' ? h.kind === 'result' || h.kind === 'skip' : ['box', 'roulette', 'card', 'envelope', 'achievement', 'lottery', 'mission', 'event'].includes(h.kind)));
  return (
    <div>
      <PageHead eyebrow="12 · Leaderboard" title="Leaderboard" sub={l ? <>Lidera <b className={'ptag ' + l}>{PLAYER_NAME[l]}</b> por {Math.abs(s.players.gabriel.points - s.players.tatiana.points)} puntos. Nada está decidido.</> : 'Empate técnico. Esto se pone interesante.'} num="12" />
      <div className="stack">
        {PLAYERS.slice().sort((a, b) => s.players[b].points - s.players[a].points).map((p, i) => {
          const P = s.players[p];
          return (
            <div key={p} className={'card' + (i === 0 && l ? ' glow' : '')}>
              <div className="row between">
                <div className="row"><div className={'avatar ' + p}>{PLAYER_NAME[p][0]}</div><div><b style={{ fontSize: 18 }}>{PLAYER_NAME[p]}</b><div className="tiny faint">{i === 0 && l ? 'Líder del día' : 'Aspirante'}</div></div></div>
                <div style={{ textAlign: 'right' }}><div className="score-num">{P.points}</div><div className="tiny faint">puntos</div></div>
              </div>
              <div className="progress" style={{ marginTop: 12 }}><i style={{ width: (P.points / max) * 100 + '%', background: `var(--${p})` }} /></div>
              <div className="stat-line" style={{ marginTop: 12 }}>
                <span><Icon name="coin" size={14} />{P.coins} monedas</span>
                <span><Icon name="trophy" size={14} />{P.wins} victorias</span>
                <span><Icon name="flame" size={14} />racha {P.streak} (mejor {P.bestStreak})</span>
                <span><Icon name="cards" size={14} />{P.cards.length} cartas</span>
                <span><Icon name="gift" size={14} />{P.stats.boxes} cajas</span>
              </div>
            </div>
          );
        })}
      </div>
      <Section title="Historial" aside={<Seg value={f} onChange={setF} options={[{ v: 'all', label: 'Todo' }, { v: 'result', label: 'Pruebas' }, { v: 'rewards', label: 'Premios' }]} />}>
        {hist.length === 0 ? <div className="empty">Aún no ha pasado nada. Pronto.</div> : (
          <div className="card tight">
            {hist.slice(0, 120).map((h) => (
              <div key={h.uid} className="history-item">
                <time>{fmtTime(h.at)}</time>
                <div style={{ flex: 1 }}>
                  <div>{h.text}</div>
                  {h.delta && <div className="tiny faint">{PLAYERS.filter((p) => h.delta?.[p]).map((p) => `${PLAYER_NAME[p]} ${h.delta![p]!.points ? `${h.delta![p]!.points! > 0 ? '+' : ''}${h.delta![p]!.points} pts ` : ''}${h.delta![p]!.coins ? `${h.delta![p]!.coins! > 0 ? '+' : ''}${h.delta![p]!.coins} mon.` : ''}`).join(' · ')}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
