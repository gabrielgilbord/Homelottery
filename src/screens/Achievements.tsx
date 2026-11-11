import { useGame } from '../state/store';
import { ACHIEVEMENTS } from '../data/rewards';
import { PageHead } from '../components/ui';
import { Icon } from '../components/Icon';
import { PLAYERS, PLAYER_NAME } from '../types';

export default function Achievements() {
  const s = useGame();
  const count = (p: string) => ACHIEVEMENTS.filter((a) => s.achievements[`${a.id}:${p}`]).length;
  return (
    <div>
      <PageHead eyebrow="13 · Achievements" title="Achievements" sub={`${ACHIEVEMENTS.length} logros por jugador. Cada uno trae su recompensa automática.`} num="13">
        <div className="row" style={{ marginTop: 12, gap: 14 }}>{PLAYERS.map((p) => <span key={p} className={'ptag ' + p}>{PLAYER_NAME[p]} {count(p)}/{ACHIEVEMENTS.length}</span>)}</div>
      </PageHead>
      <div className="grid two">
        {ACHIEVEMENTS.map((a) => {
          const got = PLAYERS.filter((p) => s.achievements[`${a.id}:${p}`]);
          const reward = [a.reward.coins && `${a.reward.coins} monedas`, a.reward.key && 'Llave Legendaria', a.reward.card && 'carta especial'].filter(Boolean).join(' + ');
          return (
            <div key={a.id} className={'card tight item' + (got.length ? ' glow' : '')} style={{ opacity: got.length ? 1 : 0.62 }}>
              <div className="item-icon" style={!got.length ? { color: 'var(--ink-3)', background: 'var(--glass)', borderColor: 'var(--line)' } : undefined}><Icon name={got.length ? a.glyph : 'lock'} /></div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15 }}>{a.name}</h3>
                <p>{a.desc}</p>
                <div className="row wrap" style={{ marginTop: 6, gap: 6 }}>
                  <span className="chip">{reward}</span>
                  {got.map((p) => <span key={p} className={'chip ptag ' + p}>{PLAYER_NAME[p]}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
