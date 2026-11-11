import { useMemo, useRef, useState } from 'react';
import { WHEELS } from '../data/rewards';
import { useGame, spinWheel, doubleOrNothing, wheelSegments, toast, type SpinResult } from '../state/store';
import { Modal, PageHead, PlayerSwitch, Section, beep } from '../components/ui';
import { Icon } from '../components/Icon';
import { PLAYER_NAME, type PlayerId } from '../types';
import { rand } from '../lib/random';

function polar(cx: number, cy: number, r: number, a: number) { const rad = ((a - 90) * Math.PI) / 180; return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]; }

export default function Roulette() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [wheelId, setWheelId] = useState('classic');
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [res, setRes] = useState<SpinResult | null>(null);
  const [dbl, setDbl] = useState<{ bet: number; out?: { win: boolean; amount: number } } | null>(null);
  const ref = useRef(0);
  const wheel = WHEELS.find((w) => w.id === wheelId)!;
  const segs = wheelSegments(s, wheelId);
  const total = segs.reduce((a, x) => a + x.weight, 0);
  const arcs = useMemo(() => { let acc = 0; return segs.map((sg) => { const a0 = (acc / total) * 360; acc += sg.weight; return { sg, a0, a1: (acc / total) * 360 }; }); }, [segs, total]);
  const locked = s.episode < wheel.unlockEpisode;

  const spin = () => {
    if (spinning) return;
    const r = spinWheel(who, wheelId);
    if ('error' in r) { toast(wheel.name, r.error, 'bad'); return; }
    const arc = arcs[r.index];
    const span = arc.a1 - arc.a0;
    const target = arc.a0 + span * (0.2 + rand() * 0.6); // land inside the slice
    const base = ref.current - (ref.current % 360);
    const next = base + 360 * 6 + (360 - target);
    ref.current = next;
    setSpinning(true); setRot(next); setRes(null);
    let ticks = 0; const tk = setInterval(() => { beep(1200 - ticks * 30, 30); if (++ticks > 22) clearInterval(tk); }, 160 + ticks * 10);
    setTimeout(() => {
      setSpinning(false); setRes(r); beep(880, 350);
      if (r.needsDouble) setDbl({ bet: Math.min(30, s.players[who].coins) });
    }, 5300);
  };

  return (
    <div>
      <PageHead eyebrow="10 · Mystery Roulette" title={<>Mystery <span className="accent">Roulette</span></>} sub="Cada porción ocupa lo que vale su probabilidad: lo que ves es lo que hay." num="10" />
      <div className="scroll-x" style={{ marginBottom: 12 }}>
        {WHEELS.map((w) => (
          <button key={w.id} className={'chip' + (w.id === wheelId ? ' accent' : '')} onClick={() => !spinning && setWheelId(w.id)}>
            {s.episode < w.unlockEpisode && <Icon name="lock" size={12} />}{w.name} · {w.cost}
          </button>
        ))}
      </div>

      <div className="card glow stack" style={{ alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 className="h-display" style={{ fontSize: 24 }}>{wheel.name}</h2>
          <p className="small muted" style={{ margin: '4px 0 0' }}>{wheel.tagline}</p>
        </div>
        <div className="wheel-wrap" style={{ opacity: locked ? 0.4 : 1 }}>
          <div className="wheel-pointer" />
          <svg className="wheel" viewBox="0 0 200 200" style={{ transform: `rotate(${rot}deg)`, transitionDuration: spinning ? '5.2s' : '0s' }}>
            <circle cx="100" cy="100" r="99" fill="#d6b06a" />
            {arcs.map(({ sg, a0, a1 }) => {
              const [x0, y0] = polar(100, 100, 94, a0), [x1, y1] = polar(100, 100, 94, a1);
              const large = a1 - a0 > 180 ? 1 : 0;
              const mid = (a0 + a1) / 2;
              const [tx, ty] = polar(100, 100, 62, mid);
              return (
                <g key={sg.id}>
                  <path d={`M100 100 L${x0} ${y0} A94 94 0 ${large} 1 ${x1} ${y1} Z`} fill={sg.color} stroke="#d6b06a" strokeWidth="0.8" />
                  <text x={tx} y={ty} fill="#f7efe3" fontSize={sg.label.length > 9 ? 6.4 : 8} fontWeight="800" fontFamily="Manrope, sans-serif" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${mid} ${tx} ${ty})`}>{sg.label}</text>
                </g>
              );
            })}
            {Array.from({ length: 24 }, (_, i) => { const [x, y] = polar(100, 100, 97, i * 15); return <circle key={i} cx={x} cy={y} r="1.3" fill="#fff6dc" />; })}
          </svg>
          <div className="wheel-hub">{locked ? <Icon name="lock" /> : 'SPIN'}</div>
        </div>
        <div className="row wrap" style={{ justifyContent: 'center' }}>
          <PlayerSwitch value={who} onChange={(p) => !spinning && setWho(p)} label="Gira:" />
          <span className="chip"><Icon name="coin" size={12} />{s.players[who].coins}</span>
        </div>
        <button className="btn primary lg" onClick={spin} disabled={spinning || locked}>{locked ? `Se desbloquea en el Episodio 0${wheel.unlockEpisode}` : spinning ? 'Girando…' : `Girar · ${wheel.cost} monedas`}</button>
        {res && !spinning && (
          <div className="prize-reveal card tight" style={{ width: '100%', textAlign: 'center' }}>
            <div className="eyebrow">{PLAYER_NAME[who]} · {res.segment.label}</div>
            <div className="h-serif" style={{ fontSize: 20, marginTop: 6 }}>{res.text}</div>
          </div>
        )}
      </div>

      <Section title="Probabilidades de esta ruleta">
        <div className="grid three">
          {segs.map((sg) => <div key={sg.id} className="card tight row between"><span className="small">{sg.label}</span><b>{Math.round((sg.weight / total) * 100)}%</b></div>)}
        </div>
      </Section>

      <Modal open={!!dbl} onClose={() => dbl?.out && setDbl(null)} eyebrow="Doble o nada" title={dbl?.out ? (dbl.out.win ? '¡DOBLE!' : 'Nada…') : `¿Cuánto se juega ${PLAYER_NAME[who]}?`}>
        {dbl && !dbl.out && (
          <div className="stack">
            <div className="h-show" style={{ fontSize: 56, textAlign: 'center', color: 'var(--accent)' }}>{dbl.bet}</div>
            <input type="range" min={0} max={Math.min(100, s.players[who].coins)} value={dbl.bet} onChange={(e) => setDbl({ bet: +e.target.value })} />
            <p className="small muted" style={{ margin: 0, textAlign: 'center' }}>50% de ganar el doble. Máximo 100 monedas. Puedes plantarte con 0.</p>
            <div className="row">
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setDbl(null)}>Plantarse</button>
              <button className="btn primary" style={{ flex: 2 }} disabled={dbl.bet <= 0} onClick={() => setDbl({ ...dbl, out: doubleOrNothing(who, dbl.bet) })}>¡Jugar!</button>
            </div>
          </div>
        )}
        {dbl?.out && (
          <div className="stack prize-reveal" style={{ textAlign: 'center' }}>
            <div className="h-show" style={{ fontSize: 56, color: dbl.out.win ? 'var(--good)' : 'var(--bad)' }}>{dbl.out.win ? '+' : '−'}{dbl.out.amount}</div>
            <button className="btn primary" onClick={() => setDbl(null)}>Continuar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
