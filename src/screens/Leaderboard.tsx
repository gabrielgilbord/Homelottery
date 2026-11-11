import { useState } from 'react';
import { useGame, leader } from '../state/store';
import { ACHIEVEMENTS } from '../data/rewards';
import { AnimatedNumber, Empty, PageHead, Section, Seg, fmtTime } from '../components/ui';
import { Seal } from '../components/Logo';
import { PLAYERS, PLAYER_NAME, type PlayerId } from '../types';

export default function Leaderboard() {
  const s = useGame();
  const [f, setF] = useState<'all' | 'result' | 'rewards'>('all');
  const l = leader(s);
  const gap = Math.abs(s.players.gabriel.points - s.players.tatiana.points);
  const share = s.players.gabriel.points + s.players.tatiana.points === 0 ? 0.5 : s.players.gabriel.points / (s.players.gabriel.points + s.players.tatiana.points);
  const ach = (p: PlayerId) => ACHIEVEMENTS.filter((a) => s.achievements[`${a.id}:${p}`]).length;
  const rows: { k: string; v: (p: PlayerId) => number; higher?: boolean }[] = [
    { k: 'Monedas', v: (p) => s.players[p].coins },
    { k: 'Victorias', v: (p) => s.players[p].wins },
    { k: 'Mejor racha', v: (p) => s.players[p].bestStreak },
    { k: 'Cajas abiertas', v: (p) => s.players[p].stats.boxes },
    { k: 'Cartas en mano', v: (p) => s.players[p].cards.length },
    { k: 'Logros', v: ach },
  ];
  const hist = s.history.filter((h) => !h.secret).filter((h) => f === 'all' || (f === 'result' ? h.kind === 'result' || h.kind === 'skip' : ['box', 'roulette', 'card', 'envelope', 'achievement', 'lottery', 'mission', 'event'].includes(h.kind)));
  return (
    <div>
      <PageHead show="Scoreboard" title="Marcador" sub={l ? <>Lidera <b className={'pname ' + l}>{PLAYER_NAME[l]}</b> por {gap} puntos. En la Gran Final los puntos valen doble.</> : 'Empate. Todo se decide en la siguiente prueba.'} />

      <section className="board" aria-label="Puntos" style={{ ['--dg' as string]: Math.max(3, String(Math.max(s.players.gabriel.points, s.players.tatiana.points)).length) }}>
        <div className="board-row">
          {PLAYERS.map((p, i) => (
            <div key={p} className={'board-side ' + p + (i === 1 ? ' right' : '') + (l === p ? ' leading' : l ? ' trailing' : '')}>
              <span className="board-name"><b>{PLAYER_NAME[p][0]}</b>{PLAYER_NAME[p]}</span>
              <span className="board-score"><AnimatedNumber value={s.players[p].points} /></span>
            </div>
          ))}
        </div>
        <div className="plate-tug" aria-hidden><i style={{ transform: `scaleX(${share})` }} /></div>
        {l && <Seal ring="Winner · líder del marcador · Homelottery ·" size={84} className={'board-seal ' + (l === 'gabriel' ? 'at-left' : 'at-right')}>+{gap}</Seal>}
      </section>

      <table className="h2h">
        <caption className="sr-only">Comparativa Gabriel contra Tatiana</caption>
        <tbody>
          {rows.map((r) => {
            const gv = r.v('gabriel'), tv = r.v('tatiana');
            return (
              <tr key={r.k}>
                <td className={'gabriel' + (gv > tv ? ' win' : '')}>{gv}</td>
                <th scope="row">{r.k}</th>
                <td className={'tatiana' + (tv > gv ? ' win' : '')}>{tv}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Section title="Historial" aside={<Seg value={f} onChange={setF} label="Filtrar historial" options={[{ v: 'all', label: 'Todo' }, { v: 'result', label: 'Pruebas' }, { v: 'rewards', label: 'Premios' }]} />}>
        {hist.length === 0 ? <Empty icon="timer">Todavía no ha pasado nada. Juega la primera prueba.</Empty> : (
          <div className="log">
            {hist.slice(0, 120).map((h) => (
              <div key={h.uid} className="li">
                <time>{fmtTime(h.at)}</time>
                <div className="stack" style={{ ['--gap' as string]: '2px' }}>
                  <span>{h.text}</span>
                  {h.delta && (
                    <span className="meta">{PLAYERS.filter((p) => h.delta?.[p]).map((p) => { const d = h.delta![p]!; return <span key={p}><span className={'pname ' + p}>{PLAYER_NAME[p]}</span>{d.points ? ` ${d.points > 0 ? '+' : ''}${d.points} pts` : ''}{d.coins ? ` ${d.coins > 0 ? '+' : ''}${d.coins} monedas` : ''}</span>; })}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
