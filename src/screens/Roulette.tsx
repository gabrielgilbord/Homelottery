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

function polar(cx: number, cy: number, r: number, a: number) { const rad = ((a - 90) * Math.PI) / 180; return [Math.round((cx + r * Math.cos(rad)) * 100) / 100, Math.round((cy + r * Math.sin(rad)) * 100) / 100]; }

/* Segment colours encode MEANING, not decoration:
   value (coins, boxes, keys) = champagne family · prizes = burnt orange · attacks = burgundy · luck = cream / ink · nothing = black. */
const KIND_FILL: Record<SegmentKind, string> = {
  coins: '#d6b77a', box: '#c19a55', key: '#ead2a0', legendary: '#f0d9a6', prize: '#e27a50',
  double: '#f2e9d8', multiplier: '#e3d6bf', event: '#2b2328', card: '#3a2f35', swap: '#d9cab0',
  steal: '#8e2a3c', revenge: '#6a1f30', nothing: '#171417',
};
const DARK_TEXT = new Set<SegmentKind>(['coins', 'box', 'key', 'legendary', 'prize', 'double', 'multiplier', 'swap']);
const BULBS = 28;

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
      <PageHead show="The Wheel" title="La ruleta" sub="Cada porción ocupa exactamente su probabilidad. Lo que ves es lo que hay." />

      <div className="wheel-tabs" role="radiogroup" aria-label="Ruleta">
        {WHEELS.map((w) => {
          const lk = s.episode < w.unlockEpisode;
          return (
            <button key={w.id} className="wheel-tab" role="radio" aria-checked={w.id === wheelId} aria-pressed={w.id === wheelId} data-locked={lk} onClick={() => !spinning && setWheelId(w.id)}>
              <span className="wtab-name">{w.name.replace('Ruleta de ', '').replace('Ruleta ', '')}</span>
              <span className="wtab-meta">{lk ? <><Icon name="lock" size={12} />Episodio {w.unlockEpisode}</> : `${w.cost} monedas`}</span>
            </button>
          );
        })}
      </div>

      <div className={'wheel-stage' + (spinning ? ' is-spinning' : '') + (res && !spinning ? ' has-result' : '')} data-wheel={wheel.id}>
        <p className="wheel-tagline">{wheel.tagline}</p>
        <div className="wheel-wrap" style={{ opacity: locked ? 0.4 : 1 }}>
          <svg className="wheel-bulbs" viewBox="0 0 200 200" aria-hidden>
            {Array.from({ length: BULBS }, (_, i) => { const [x, y] = polar(100, 100, 98, (i * 360) / BULBS); return <circle key={i} cx={x} cy={y} r="2.2" style={{ ['--i' as string]: i % 4 }} />; })}
          </svg>
          <svg className="wheel" viewBox="0 0 200 200" style={{ transform: `rotate(${rot}deg)`, transitionDuration: spinning ? undefined : '0s' }} role="img" aria-label={`${wheel.name} con ${segs.length} resultados`}>
            <circle cx="100" cy="100" r="93" className="wheel-rim" />
            {arcs.map(({ sg, a0, a1 }) => {
              const [x0, y0] = polar(100, 100, 88, a0), [x1, y1] = polar(100, 100, 88, a1);
              const large = a1 - a0 > 180 ? 1 : 0;
              const mid = (a0 + a1) / 2;
              const [tx, ty] = polar(100, 100, 83, mid);
              const span = a1 - a0;
              const fs = span < 14 ? 6.4 : span < 22 ? 7.6 : 8.6;
              return (
                <g key={sg.id}>
                  <path d={`M100 100 L${x0} ${y0} A88 88 0 ${large} 1 ${x1} ${y1} Z`} fill={KIND_FILL[sg.kind]} stroke="#171417" strokeWidth="0.7" />
                  <text x={tx} y={ty} fill={DARK_TEXT.has(sg.kind) ? '#171417' : '#f2e9d8'} fontSize={fs} className="wheel-label" textAnchor={mid > 180 ? 'start' : 'end'} dominantBaseline="middle" transform={`rotate(${mid > 180 ? mid + 90 : mid - 90} ${tx} ${ty})`}>{sg.label}</text>
                </g>
              );
            })}
            {arcs.map(({ sg, a0 }) => { const [px, py] = polar(100, 100, 90.5, a0); return <circle key={'peg' + sg.id} cx={px} cy={py} r="1.5" className="wheel-peg" />; })}
          </svg>
          <svg key={tick} className={'wheel-pointer' + (spinning ? ' tick' : '')} width="34" height="46" viewBox="0 0 34 46" aria-hidden>
            <path d="M17 44 L5 12 A12 12 0 1 1 29 12 Z" fill="#f2e9d8" stroke="#171417" strokeWidth="1.5" />
            <circle cx="17" cy="12" r="5" fill="#c65b35" stroke="#171417" strokeWidth="1.2" />
          </svg>
          <div className="wheel-hub">{locked ? <Icon name="lock" /> : <LogoMark size={30} frame="var(--cream)" />}</div>
        </div>
        <div className="wheel-controls">
          <PlayerSwitch value={who} onChange={(p) => !spinning && setWho(p)} label="Gira" />
          <button className="btn cta lg wheel-go" onClick={spin} disabled={spinning || locked}>
            {locked ? `Se abre en el episodio ${wheel.unlockEpisode}` : spinning ? 'Girando…' : `Girar por ${cost} monedas`}
          </button>
          <span className="small faint">{PLAYER_NAME[who]} tiene <span className="value-text num">{s.players[who].coins}</span> monedas</span>
        </div>
        {res && !spinning && (
          <div className="win-ticket" aria-live="polite">
            <span className="wt-k">Ha salido</span>
            <span className="wt-big">{res.segment.label}</span>
            <p className="wt-text">{res.text}</p>
          </div>
        )}
      </div>

      <Section title="Probabilidades" eyebrow={wheel.name}>
        <div className="odds">
          {segs.map((sg) => <div key={sg.id}><span><span className="sw" style={{ background: KIND_FILL[sg.kind] }} />{sg.label}</span><b className="num mono">{Math.round((sg.weight / total) * 100)}%</b></div>)}
        </div>
      </Section>

      <Modal open={!!dbl} onClose={() => dbl?.out && setDbl(null)} dismissable={!!dbl?.out} eyebrow="Doble o nada" title={dbl?.out ? (dbl.out.win ? 'Doble.' : 'Nada.') : `¿Cuánto se juega ${PLAYER_NAME[who]}?`}>
        {dbl && !dbl.out && (
          <div className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
            <div className="score num" style={{ textAlign: 'center', color: 'var(--value)' }}>{dbl.bet}</div>
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
