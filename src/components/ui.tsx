import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import type { CardType, PlayerId } from '../types';
import { PLAYERS, PLAYER_NAME } from '../types';
import { CARDS } from '../data/rewards';
import { onToast, type Toast } from '../state/store';

export function PageHead({ eyebrow, title, sub, num, children }: { eyebrow: string; title: ReactNode; sub?: ReactNode; num?: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      {num && <div className="num">{num}</div>}
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="h-display">{title}</h1>
      {sub && <p>{sub}</p>}
      {children}
    </header>
  );
}

export function Section({ title, aside, children }: { title: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="section">
      <div className="section-title"><h2>{title}</h2>{aside}</div>
      {children}
    </section>
  );
}

export function Modal({ open, onClose, title, eyebrow, children, wide }: { open: boolean; onClose: () => void; title?: ReactNode; eyebrow?: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" style={wide ? { maxWidth: 760 } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            {title && <h2 className="h-serif" style={{ fontSize: 24, marginTop: 4 }}>{title}</h2>}
          </div>
          <button className="btn icon ghost" onClick={onClose} aria-label="Cerrar"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Privacy curtain for single-phone play: the other player looks away, the owner holds to reveal. */
export function Curtain({ open, to, label, onReveal, onCancel }: { open: boolean; to: PlayerId | 'host'; label?: string; onReveal: () => void; onCancel: () => void }) {
  const [p, setP] = useState(0);
  const raf = useRef<number>();
  const start = useRef<number>(0);
  useEffect(() => { if (!open) setP(0); }, [open]);
  if (!open) return null;
  const name = to === 'host' ? 'Gabriel (Presentador)' : PLAYER_NAME[to];
  const begin = () => {
    start.current = performance.now();
    const tick = (t: number) => {
      const v = Math.min(1, (t - start.current) / 900);
      setP(v);
      if (v >= 1) { onReveal(); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const end = () => { if (raf.current) cancelAnimationFrame(raf.current); if (p < 1) setP(0); };
  const C = 2 * Math.PI * 70;
  return (
    <div className="curtain" role="dialog" aria-modal="true">
      <div className="eyebrow" style={{ color: '#f4d9a8' }}>Pantalla privada</div>
      <h2 className="h-display" style={{ fontSize: 30 }}>Solo para {name}</h2>
      <p style={{ maxWidth: 320, margin: 0, color: 'rgba(255,240,220,.8)' }}>{label || 'Pasa el móvil. Que la otra persona mire hacia otro lado.'}</p>
      <button className="hold-btn" onPointerDown={begin} onPointerUp={end} onPointerLeave={end} onContextMenu={(e) => e.preventDefault()}>
        <svg className="ring" viewBox="0 0 150 150"><circle cx="75" cy="75" r="70" fill="none" stroke="rgba(255,230,190,.15)" strokeWidth="4" /><circle cx="75" cy="75" r="70" fill="none" stroke="#f4e1b0" strokeWidth="4" strokeDasharray={C} strokeDashoffset={C * (1 - p)} strokeLinecap="round" /></svg>
        <span style={{ display: 'grid', placeItems: 'center', gap: 6 }}><Icon name="eye" size={26} />MANTÉN</span>
      </button>
      <button className="btn ghost sm" onClick={onCancel}>Cancelar</button>
    </div>
  );
}

export function PlayerSwitch({ value, onChange, label }: { value: PlayerId; onChange: (p: PlayerId) => void; label?: string }) {
  return (
    <div className="row wrap" style={{ gap: 8 }}>
      {label && <span className="small faint">{label}</span>}
      <div className="seg players" role="tablist">
        {PLAYERS.map((p) => (
          <button key={p} data-p={p} className={value === p ? 'on' : ''} onClick={() => onChange(p)} role="tab" aria-selected={value === p}>{PLAYER_NAME[p]}</button>
        ))}
      </div>
    </div>
  );
}

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map((o) => <button key={o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.label}</button>)}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return <button type="button" className={'toggle' + (on ? ' on' : '')} onClick={() => onChange(!on)} aria-pressed={on} aria-label={label} />;
}

/** Two-tap confirmation for important actions (no blocking browser dialogs). */
export function ConfirmButton({ children, onConfirm, className = 'btn', confirmText = '¿Seguro? Toca otra vez', disabled }: { children: ReactNode; onConfirm: () => void; className?: string; confirmText?: string; disabled?: boolean }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3500); return () => clearTimeout(t); }, [armed]);
  return (
    <button className={className + (armed ? ' danger' : '')} disabled={disabled} onClick={() => { if (armed) { setArmed(false); onConfirm(); } else setArmed(true); }}>
      {armed ? confirmText : children}
    </button>
  );
}

export function Timer({ seconds: initial = 60 }: { seconds?: number }) {
  const [total, setTotal] = useState(initial);
  const [left, setLeft] = useState(initial);
  const [run, setRun] = useState(false);
  const end = useRef(0);
  useEffect(() => {
    if (!run) return;
    end.current = Date.now() + left * 1000;
    const i = setInterval(() => {
      const l = Math.max(0, Math.round((end.current - Date.now()) / 1000));
      setLeft(l);
      if (l <= 0) { setRun(false); try { navigator.vibrate?.([200, 100, 200]); } catch { /* noop */ } beep(); }
    }, 200);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const presets = [30, 60, 120, 180, 300, 600];
  return (
    <div className="stack">
      <div className="timer">
        <div className={'timer-face' + (left === 0 ? ' alarm' : '')}>{mm}:{ss}</div>
        <div className="row">
          <button className="btn icon primary" onClick={() => { if (left === 0) setLeft(total); setRun(!run); }} aria-label={run ? 'Pausar' : 'Iniciar'}><Icon name={run ? 'pause' : 'play'} /></button>
          <button className="btn icon" onClick={() => { setRun(false); setLeft(total); }} aria-label="Reiniciar"><Icon name="reset" /></button>
        </div>
      </div>
      <div className="scroll-x">
        {presets.map((p) => (
          <button key={p} className={'chip' + (total === p ? ' accent' : '')} onClick={() => { setRun(false); setTotal(p); setLeft(p); }}>{p < 60 ? `${p} s` : `${p / 60} min`}</button>
        ))}
      </div>
    </div>
  );
}

let audioCtx: AudioContext | null = null;
export function beep(freq = 880, ms = 220) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; o.type = 'sine'; g.gain.value = 0.08;
    o.connect(g); g.connect(audioCtx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ms / 1000);
    o.stop(audioCtx.currentTime + ms / 1000);
  } catch { /* audio unavailable */ }
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => onToast((t) => {
    setItems((x) => [...x.slice(-2), t]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== t.id)), 4200);
  }), []);
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={'toast ' + (t.tone || '')} onClick={() => setItems((x) => x.filter((i) => i.id !== t.id))}>
          <Icon name={t.tone === 'gold' ? 'star' : t.tone === 'bad' ? 'info' : 'check'} style={{ color: t.tone === 'gold' ? 'var(--gold-hi)' : t.tone === 'bad' ? 'var(--bad)' : 'var(--good)', flexShrink: 0 }} />
          <div><b style={{ fontSize: 14 }}>{t.title}</b>{t.text && <div className="small muted">{t.text}</div>}</div>
        </div>
      ))}
    </div>
  );
}

export function MysteryCard({ type, onClick, footer }: { type: CardType; onClick?: () => void; footer?: ReactNode }) {
  const d = CARDS[type];
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp className="mcard" style={{ ['--tone' as string]: d.tone, cursor: onClick ? 'pointer' : 'default', color: 'inherit', font: 'inherit', textAlign: 'center' }} onClick={onClick}>
      <div className="tiny faint" style={{ letterSpacing: '.24em', textAlign: 'center' }}>HOMELOTTERY</div>
      <div className="glyph"><Icon name={d.glyph} size={24} /></div>
      <div>
        <div className="name">{d.name}</div>
        <div className="short" style={{ marginTop: 4 }}>{d.short}</div>
        {footer}
      </div>
    </Comp>
  );
}

export function PTag({ p }: { p: PlayerId }) {
  return <span className={'ptag ' + p}>{PLAYER_NAME[p]}</span>;
}

export function fmtTime(t: number) {
  const d = new Date(t);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
