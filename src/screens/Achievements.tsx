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
      <PageHead show="Hall of fame" title="Logros" sub={`${ACHIEVEMENTS.length} logros por jugador. Cada uno paga su recompensa en cuanto se consigue.`}>
        <div className="cluster" style={{ ['--gap' as string]: 'var(--s-5)' }}>{PLAYERS.map((p) => <span key={p} className="stack" style={{ ['--gap' as string]: '2px' }}><span className={'pname small ' + p}>{PLAYER_NAME[p]}</span><span className="h3 num">{count(p)}<span className="faint">/{ACHIEVEMENTS.length}</span></span></span>)}</div>
      </PageHead>
      <div className="list">
        {ACHIEVEMENTS.map((a) => {
          const got = PLAYERS.filter((p) => s.achievements[`${a.id}:${p}`]);
          const reward = [a.reward.coins && `${a.reward.coins} monedas`, a.reward.key && 'Llave Legendaria', a.reward.card && 'carta especial'].filter(Boolean).join(' + ');
          return (
            <div key={a.id} className="row-item" data-world={got.length ? 'boxes' : undefined}>
              <span className="lead-icon" style={!got.length ? { color: 'var(--ivory-4)', background: 'var(--ink-2)' } : undefined}><Icon name={got.length ? a.glyph : 'lock'} size={18} /></span>
              <span className="grow stack" style={{ ['--gap' as string]: '2px' }}>
                <span className="h5" style={{ color: got.length ? 'var(--ivory)' : 'var(--ivory-2)' }}>{a.name}</span>
                <span className="small faint">{a.desc} <span className="value-text">Premio: {reward}.</span></span>
              </span>
              <span className="cluster" style={{ ['--gap' as string]: '4px', flexShrink: 0 }}>{got.map((p) => <span key={p} className={'avatar sm ' + p} title={PLAYER_NAME[p]}>{PLAYER_NAME[p][0]}</span>)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
