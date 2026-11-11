import { useMemo, useRef, useState } from 'react';
import { WHEELS } from '../data/rewards';
import { useGame, spinWheel, doubleOrNothing, wheelSegments, toast, type SpinResult } from '../state/store';
import { Modal, PageHead, PlayerSwitch, Range, Section, beep } from '../components/ui';
import { Icon } from '../components/Icon';
import { celebrate } from '../lib/celebrate';
import { PLAYER_NAME, type PlayerId } from '../types';
import { rand } from '../lib/random';
import type { SegmentKind } from '../data/rewards';

function polar(cx: number, cy: number, r: number, a: number) { const rad = ((a - 90) * Math.PI) / 180; return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]; }

/* Segment colors encode MEANING, not decoration: value = champagne family, attacks = wine, luck = ink. */
const KIND_FILL: Record<SegmentKind, string> = {
  coins: '#3a2f1c', box: '#4a3a1f', key: '#5c4a24', legendary: '#6a1830', prize: '#4a1427',
  double: '#1c1517', multiplier: '#241b1f', event: '#2a2024', card: '#1f1a2c', swap: '#2b1d2f',
  steal: '#541627', revenge: '#43121f', nothing: '#161113',
};
const KIND_TEXT: Partial<Record<SegmentKind, string>> = { coins: '#e6cc98', box: '#e6cc98', key: '#f2d7a0', legendary: '#f2d7a0' };

export default function Roulette() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [wheelId, setWheelId] = useState(() => [...WHEELS].reverse().find((w) => s.episode >= w.unlockEpisode)?.id || 'classic');
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [tick, setTick] = useState(0);
  const [res, setRes] = useState<SpinResult | null>(null);
  const [dbl, setDbl] = useState<{ bet: number; out?: { win: boolean; amount: number } } | null>(null);
  const ref = useRef(0);
  const wheel = WHEELS.find((w) => w.id === wheelId)!;
  const segs = wheelSegments(s, wheelId);
  const total = segs.reduce((a, x) => a + x.weight, 0);
  const arcs = useMemo(() => { let acc = 0; return segs.map((sg) => { const a0 = (acc / total) * 360; acc += sg.weight; return { sg, a0, a1: (acc / total) * 360 }; }); }, [segs, total]);
  const locked = s.episode < wheel.unlockEpisode;
  const cost = wheel.cost;

  const spin = () => {
    if (spinning) return;
    const r = spinWheel(who, wheelId);
    if ('error' in r) { toast(wheel.name, r.error, 'bad'); return; }
    const arc = arcs[r.index];
    const target = arc.a0 + (arc.a1 - arc.a0) * (0.2 + rand() * 0.6);
    const next = ref.current - (ref.current % 360) + 360 * 6 + (360 - target);
    ref.current = next;
    setSpinning(true); setRot(next); setRes(null);
    // ticking that slows down with the wheel
    let delay = 60; let elapsed = 0;
    const t = () => { if (elapsed > 5000) return; beep(1400, 25, 0.03); setTick((x) => x + 1); elapsed += delay; delay *= 1.11; setTimeout(t, delay); };
    t();
    setTimeout(() => {
      setSpinning(false); setRes(r); beep(880, 380, 0.07);
      const big = ['key', 'legendary', 'box'].includes(r.segment.kind) || (r.segment.kind === 'coins' && (r.segment.value || 0) >= 80);
      if (!r.needsDouble) celebrate(r.segment.kind === 'legendary' ? 3 : big ? 2 : 1);
      if (r.needsDouble) setDbl({ bet: Math.min(30, s.players[who].coins) });
    }, 5500);
  };

  return (
    <div>
      <PageHead eyebrow="Mesa de ruleta" title="Mystery Roulette" sub="Cada porción ocupa exactamente su probabilidad. Lo que ves es lo que hay." />

      <div className="wheel-tabs" role="radiogroup" aria-label="Ruleta">
        {WHEELS.map((w) => {
          const lk = s.episode < w.unlockEpisode;
          return (
            <button key={w.id} className="wheel-tab" role="radio" aria-checked={w.id === wheelId} aria-pressed={w.id === wheelId} data-locked={lk} onClick={() => !spinning && setWheelId(w.id)}>
              <span className="h5">{w.name.replace('Ruleta ', '')}</span>
              <span className="xs mono faint">{lk ? `EP 0${w.unlockEpisode}` : `${w.cost} monedas`}</span>
            </button>
          );
        })}
      </div>

      <div className="wheel-stage">
        <p className="small muted" style={{ textAlign: 'center', maxWidth: 420 }}>{wheel.tagline}</p>
        <div className="wheel-wrap" style={{ opacity: locked ? 0.35 : 1 }}>
          <svg key={tick} className={'wheel-pointer' + (spinning ? ' tick' : '')} width="30" height="36" viewBox="0 0 30 36" aria-hidden><path d="M15 36 L2 6 Q15 -4 28 6 Z" fill="#f3ebe1" /><circle cx="15" cy="10" r="3.5" fill="#7a1e3a" /></svg>
          <svg className="wheel" viewBox="0 0 200 200" style={{ transform: `rotate(${rot}deg)`, transitionDuration: spinning ? undefined : '0s' }} role="img" aria-label={`${wheel.name} con ${segs.length} resultados`}>
            <circle cx="100" cy="100" r="99" fill="#0b0809" stroke="rgba(243,235,225,.25)" strokeWidth="0.6" />
            {arcs.map(({ sg, a0, a1 }) => {
              const [x0, y0] = polar(100, 100, 92, a0), [x1, y1] = polar(100, 100, 92, a1);
              const large = a1 - a0 > 180 ? 1 : 0;
              const mid = (a0 + a1) / 2;
              const [tx, ty] = polar(100, 100, 64, mid);
              const narrow = a1 - a0 < 28;
              return (
                <g key={sg.id}>
                  <path d={`M100 100 L${x0} ${y0} A92 92 0 ${large} 1 ${x1} ${y1} Z`} fill={KIND_FILL[sg.kind]} stroke="rgba(243,235,225,.18)" strokeWidth="0.5" />
                  <text x={tx} y={ty} fill={KIND_TEXT[sg.kind] || '#f3ebe1'} fontSize={narrow || sg.label.length > 10 ? 5.6 : 7} fontWeight="600" fontFamily="Geist Sans, sans-serif" letterSpacing="0.2" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${mid + 90} ${tx} ${ty})`}>{sg.label}</text>
                </g>
              );
            })}
            {Array.from({ length: 48 }, (_, i) => { const [x0, y0] = polar(100, 100, 95, i * 7.5), [x1, y1] = polar(100, 100, i % 2 ? 97 : 98.5, i * 7.5); return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(243,235,225,.35)" strokeWidth="0.5" />; })}
          </svg>
          <div className="wheel-hub">{locked ? <Icon name="lock" /> : 'H'}</div>
        </div>
        <PlayerSwitch value={who} onChange={(p) => !spinning && setWho(p)} label="Gira" />
        <button className="btn accent lg" onClick={spin} disabled={spinning || locked}>
          {locked ? `Se abre en el episodio 0${wheel.unlockEpisode}` : spinning ? 'Girando' : <>Girar · <span className="num">{cost}</span> monedas</>}
        </button>
        <span className="xs faint mono">{PLAYER_NAME[who]} tiene <span className="value-text num">{s.players[who].coins}</span> monedas</span>
        {res && !spinning && (
          <div className="prize-card" style={{ ['--box' as string]: 'var(--accent)' }} aria-live="polite">
            <span className="eyebrow accent">{PLAYER_NAME[who]} · {res.segment.label}</span>
            <p className="h3" style={{ textAlign: 'center' }}>{res.text}</p>
          </div>
        )}
      </div>

      <Section title="Probabilidades" eyebrow={wheel.name}>
        <div className="odds">
          {segs.map((sg) => <div key={sg.id}><span><span className="sw" style={{ background: KIND_FILL[sg.kind], boxShadow: '0 0 0 1px var(--line-3)' }} />{sg.label}</span><b className="num mono">{Math.round((sg.weight / total) * 100)}%</b></div>)}
        </div>
      </Section>

      <Modal open={!!dbl} onClose={() => dbl?.out && setDbl(null)} dismissable={!!dbl?.out} eyebrow="Doble o nada" title={dbl?.out ? (dbl.out.win ? 'Doble.' : 'Nada.') : `¿Cuánto se juega ${PLAYER_NAME[who]}?`}>
        {dbl && !dbl.out && (
          <div className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
            <div className="score num" style={{ textAlign: 'center', color: 'var(--champagne)' }}>{dbl.bet}</div>
            <Range label="Apuesta" min={0} max={Math.min(100, s.players[who].coins)} value={dbl.bet} onChange={(v) => setDbl({ bet: v })} />
            <p className="small muted" style={{ textAlign: 'center' }}>50% de doblarlo. Máximo 100 monedas. Puedes plantarte.</p>
            <div className="grid-2">
              <button className="btn ghost lg" onClick={() => setDbl(null)}>Plantarse</button>
              <button className="btn accent lg" disabled={dbl.bet <= 0} onClick={() => { const out = doubleOrNothing(who, dbl.bet); setDbl({ ...dbl, out }); if (out.win) celebrate(dbl.bet >= 50 ? 2 : 1); else try { navigator.vibrate?.([80, 40, 80]); } catch { /* noop */ } }}>Jugar</button>
            </div>
          </div>
        )}
        {dbl?.out && (
          <div className="stack" style={{ textAlign: 'center', ['--gap' as string]: 'var(--s-5)' }}>
            <div className="score num" style={{ color: dbl.out.win ? 'var(--success)' : 'var(--danger)', animation: 'pop .5s var(--ease-spring)' }}>{dbl.out.win ? '+' : '−'}{dbl.out.amount}</div>
            <button className="btn primary block" onClick={() => setDbl(null)}>Continuar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
