import { useMemo, useRef, useState } from 'react';
import { WHEELS } from '../data/rewards';
import { useGame, spinWheel, doubleOrNothing, wheelSegments, toast, type SpinResult } from '../state/store';
import { Modal, PageHead, PlayerSwitch, Range, Section, beep } from '../components/ui';
import { Icon } from '../components/Icon';
import { LogoMark } from '../components/Logo';
import { celebrate } from '../lib/celebrate';
import { PLAYER_NAME, type PlayerId } from '../types';
import { rand } from '../lib/random';
import type { SegmentKind } from '../data/rewards';

function polar(cx: number, cy: number, r: number, a: number) { const rad = ((a - 90) * Math.PI) / 180; return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]; }

/* Segment colors encode MEANING, not decoration: value = champagne family, attacks = wine, luck = ink. */
const KIND_FILL: Record<SegmentKind, string> = {
  coins: '#d9b46a', box: '#b88e45', key: '#f2d7a0', legendary: '#f2d7a0', prize: '#8a1e3c',
  double: '#2b1621', multiplier: '#361d2a', event: '#452534', card: '#22111a', swap: '#3a1d2b',
  steal: '#b5223a', revenge: '#7a1630', nothing: '#1a0b12',
};
const KIND_TEXT: Partial<Record<SegmentKind, string>> = { coins: '#2a1708', box: '#2a1708', key: '#2a1708', legendary: '#5a1430' };

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
              <span className="h5">{w.name.replace('Ruleta de ', '').replace('Ruleta ', '')}</span>
              <span className="small faint num">{lk ? `Desde el episodio ${w.unlockEpisode}` : `${w.cost} monedas`}</span>
            </button>
          );
        })}
      </div>

      <div className="wheel-stage">
        <p className="small muted" style={{ textAlign: 'center', maxWidth: 420 }}>{wheel.tagline}</p>
        <div className="wheel-wrap" style={{ opacity: locked ? 0.35 : 1 }}>
          <svg key={tick} className={'wheel-pointer' + (spinning ? ' tick' : '')} width="30" height="36" viewBox="0 0 30 36" aria-hidden><path d="M15 36 L2 6 Q15 -4 28 6 Z" fill="#f7ecdf" /><circle cx="15" cy="10" r="3.5" fill="#b5223a" /></svg>
          <svg className="wheel" viewBox="0 0 200 200" style={{ transform: `rotate(${rot}deg)`, transitionDuration: spinning ? undefined : '0s' }} role="img" aria-label={`${wheel.name} con ${segs.length} resultados`}>
            <circle cx="100" cy="100" r="99" fill="#140810" stroke="#d9b46a" strokeWidth="1.2" />
            {arcs.map(({ sg, a0, a1 }) => {
              const [x0, y0] = polar(100, 100, 92, a0), [x1, y1] = polar(100, 100, 92, a1);
              const large = a1 - a0 > 180 ? 1 : 0;
              const mid = (a0 + a1) / 2;
              const [tx, ty] = polar(100, 100, 64, mid);
              const narrow = a1 - a0 < 28;
              return (
                <g key={sg.id}>
                  <path d={`M100 100 L${x0} ${y0} A92 92 0 ${large} 1 ${x1} ${y1} Z`} fill={KIND_FILL[sg.kind]} stroke="rgba(26,11,18,.9)" strokeWidth="0.8" />
                  <text x={tx} y={ty} fill={KIND_TEXT[sg.kind] || '#f3ebe1'} fontSize={narrow || sg.label.length > 10 ? 5.6 : 7} fontWeight="700" fontFamily="Geist Sans, sans-serif" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${mid < 180 ? mid - 90 : mid + 90} ${tx} ${ty})`}>{sg.label}</text>
                </g>
              );
            })}
            {Array.from({ length: 48 }, (_, i) => { const [x0, y0] = polar(100, 100, 95, i * 7.5), [x1, y1] = polar(100, 100, i % 2 ? 97 : 98.5, i * 7.5); return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(217,180,106,.55)" strokeWidth="0.5" />; })}
          </svg>
          <div className="wheel-hub">{locked ? <Icon name="lock" /> : <LogoMark size={34} />}</div>
        </div>
        <PlayerSwitch value={who} onChange={(p) => !spinning && setWho(p)} label="Gira" />
        <button className="btn accent lg" onClick={spin} disabled={spinning || locked}>
          {locked ? `Se abre en el episodio ${wheel.unlockEpisode}` : spinning ? 'Girando' : `Girar por ${cost} monedas`}
        </button>
        <span className="small faint">{PLAYER_NAME[who]} tiene <span className="value-text num">{s.players[who].coins}</span> monedas</span>
        {res && !spinning && (
          <div className="prize-card" style={{ ['--box' as string]: 'var(--accent)' }} aria-live="polite">
            <span className="small accent-text" style={{ fontWeight: 700 }}>Ha salido {res.segment.label}</span>
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
