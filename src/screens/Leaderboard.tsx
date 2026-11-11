import { useState } from 'react';
import { useGame, leader } from '../state/store';
import { AnimatedNumber, Avatar, Empty, PageHead, Section, Seg, fmtTime } from '../components/ui';
import { Icon } from '../components/Icon';
import { PLAYERS, PLAYER_NAME } from '../types';

export default function Leaderboard() {
  const s = useGame();
  const [f, setF] = useState<'all' | 'result' | 'rewards'>('all');
  const l = leader(s);
  const gap = Math.abs(s.players.gabriel.points - s.players.tatiana.points);
  const max = Math.max(1, ...PLAYERS.map((p) => s.players[p].points));
  const hist = s.history.filter((h) => !h.secret).filter((h) => f === 'all' || (f === 'result' ? h.kind === 'result' || h.kind === 'skip' : ['box', 'roulette', 'card', 'envelope', 'achievement', 'lottery', 'mission', 'event'].includes(h.kind)));
  const order = PLAYERS.slice().sort((a, b) => s.players[b].points - s.players[a].points);
  return (
    <div>
      <PageHead eyebrow="Marcador" title="Leaderboard" sub={l ? <>Lidera <b className={'pname ' + l}>{PLAYER_NAME[l]}</b> por {gap} puntos. Nada está decidido.</> : 'Empate. Esto se pone interesante.'} />
      <div className="podium">
        {order.map((p, i) => {
          const P = s.players[p];
          return (
            <div key={p} className="pl">
              <span className="rank">{l ? String(i + 1).padStart(2, '0') : '='}</span>
              <div className="stack" style={{ ['--gap' as string]: '6px', minWidth: 0 }}>
                <div className="cluster"><Avatar p={p} /><span className={'h3 pname ' + p} style={{ fontWeight: 400 }}>{PLAYER_NAME[p]}</span>{l === p && <span className="lead-mark">Lidera</span>}</div>
                <div className="bar"><i style={{ width: (P.points / max) * 100 + '%', background: `var(--${p})` }} /></div>
                <div className="cluster xs mono faint" style={{ ['--gap' as string]: '6px 14px' }}>
                  <span className="value-text"><Icon name="coin" size={12} /> {P.coins}</span>
                  <span>{P.wins} victorias</span><span>racha {P.streak} · mejor {P.bestStreak}</span><span>{P.cards.length} cartas</span><span>{P.stats.boxes} cajas</span>
                </div>
              </div>
              <span className="score"><AnimatedNumber value={P.points} /></span>
            </div>
          );
        })}
      </div>
      <Section title="Historial" aside={<Seg value={f} onChange={setF} label="Filtrar historial" options={[{ v: 'all', label: 'Todo' }, { v: 'result', label: 'Pruebas' }, { v: 'rewards', label: 'Premios' }]} />}>
        {hist.length === 0 ? <Empty icon="timer">Aún no ha pasado nada. Pronto.</Empty> : (
          <div className="log">
            {hist.slice(0, 120).map((h) => (
              <div key={h.uid} className="li">
                <time>{fmtTime(h.at)}</time>
                <div className="stack" style={{ ['--gap' as string]: '2px' }}>
                  <span>{h.text}</span>
                  {h.delta && <span className="xs mono faint">{PLAYERS.filter((p) => h.delta?.[p]).map((p) => { const d = h.delta![p]!; return `${PLAYER_NAME[p]} ${d.points ? `${d.points > 0 ? '+' : ''}${d.points} pts ` : ''}${d.coins ? `${d.coins > 0 ? '+' : ''}${d.coins} mon.` : ''}`; }).join(' · ')}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
