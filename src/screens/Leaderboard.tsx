import { useState } from 'react';
import { useGame, leader } from '../state/store';
import { ACHIEVEMENTS } from '../data/rewards';
import { AnimatedNumber, Avatar, Empty, PageHead, Section, Seg, fmtTime } from '../components/ui';
import { Icon } from '../components/Icon';
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
      <PageHead title="Marcador" sub={l ? <>Lidera <b className={'pname ' + l}>{PLAYER_NAME[l]}</b> por {gap} puntos. En la Gran Final los puntos valen doble.</> : 'Empate. Todo se decide en la siguiente prueba.'} />

      <section className="scorebug" style={{ marginTop: 0 }} aria-label="Puntos">
        {PLAYERS.map((p, i) => {
          const side = (
            <div key={p} className={'side' + (i === 1 ? ' right' : '')}>
              <div className="who"><Avatar p={p} size="sm" /><span className={'pname ' + p}>{PLAYER_NAME[p]}</span></div>
              <div className={'score' + (l && l !== p ? ' trailing' : '')}><AnimatedNumber value={s.players[p].points} /></div>
            </div>
          );
          return i === 0 ? [side, <div key="m" className="mid">{l ? <span className="crown"><Icon name="crown" size={14} />+{gap}</span> : '='}</div>] : side;
        })}
      </section>
      <div className="tug" aria-hidden style={{ marginBottom: 'var(--s-6)' }}><i style={{ transform: `scaleX(${share})` }} /></div>

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
