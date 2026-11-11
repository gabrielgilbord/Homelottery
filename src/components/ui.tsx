import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from './Icon';
import type { CardType, PlayerId } from '../types';
import { PLAYERS, PLAYER_NAME } from '../types';
import { CARDS } from '../data/rewards';
import { onToast, type Toast } from '../state/store';
import { LogoMark } from './Logo';

/* ---------------- Page & section heads ---------------- */
/** Page header. The heading carries its own weight: no eyebrow above it. */
export function PageHead({ title, sub, children, aside }: { eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="split top">
        <h1 className="h1">{title}</h1>
        {aside}
      </div>
      {sub && <p className="lead">{sub}</p>}
      {children}
    </header>
  );
}

export function Section({ title, eyebrow, aside, children, id }: { title: ReactNode; eyebrow?: ReactNode; aside?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section className="section" id={id}>
      <div className="section-head">
        <div className="stack" style={{ ['--gap' as string]: '4px' }}>
          <h2 className="h2">{title}</h2>
          {eyebrow && <p className="small faint caption">{eyebrow}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

/* ---------------- Sheet (modal / dialog) ---------------- */
export function Modal({ open, onClose, title, eyebrow, children, wide, dismissable = true }: { open: boolean; onClose: () => void; title?: ReactNode; eyebrow?: string; children: ReactNode; wide?: boolean; dismissable?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && dismissable) onClose(); };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    setTimeout(() => ref.current?.focus(), 30);
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [open, onClose, dismissable]);
  if (!open) return null;
  return (
    <div className="overlay" onClick={() => dismissable && onClose()}>
      <div className={'sheet' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        {(title || eyebrow || dismissable) && (
          <div className="sheet-head">
            <div className="stack" style={{ ['--gap' as string]: '4px' }}>
              {title && <h2 className="h2">{title}</h2>}
              {eyebrow && <p className="small faint">{eyebrow}</p>}
            </div>
            {dismissable && <button className="btn icon ghost sm" onClick={onClose} aria-label="Cerrar"><Icon name="close" size={18} /></button>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------------- Privacy curtain (single-phone play) ---------------- */
export function Curtain({ open, to, label, onReveal, onCancel }: { open: boolean; to: PlayerId | 'host'; label?: string; onReveal: () => void; onCancel: () => void }) {
  const [p, setP] = useState(0);
  const raf = useRef<number>();
  const start = useRef(0);
  useEffect(() => { if (!open) setP(0); }, [open]);
  if (!open) return null;
  const name = to === 'host' ? 'Gabriel' : PLAYER_NAME[to];
  const begin = () => {
    start.current = performance.now();
    const tick = (t: number) => {
      const v = Math.min(1, (t - start.current) / 850);
      setP(v);
      if (v >= 1) { try { navigator.vibrate?.(20); } catch { /* noop */ } onReveal(); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const end = () => { if (raf.current) cancelAnimationFrame(raf.current); setP((v) => (v < 1 ? 0 : v)); };
  const C = 2 * Math.PI * 70;
  return (
    <div className="curtain" role="dialog" aria-modal="true" aria-label={`Pantalla privada para ${name}`}>
      <h2 className="h1">Solo para {name}</h2>
      <p className="muted" style={{ maxWidth: 320 }}>{label || 'Pasa el móvil. La otra persona mira hacia otro lado.'}</p>
      <button className="hold" onPointerDown={begin} onPointerUp={end} onPointerLeave={end} onPointerCancel={end} onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onReveal(); }} aria-label="Mantén pulsado para revelar">
        <svg className="ring" viewBox="0 0 150 150" aria-hidden><circle cx="75" cy="75" r="70" fill="none" stroke="rgba(243,235,225,.12)" strokeWidth="3" /><circle cx="75" cy="75" r="70" fill="none" stroke="var(--ivory)" strokeWidth="3" strokeDasharray={C} strokeDashoffset={C * (1 - p)} strokeLinecap="round" /></svg>
        <span className="stack" style={{ alignItems: 'center', ['--gap' as string]: '6px' }}><Icon name="eye" size={24} />Mantén pulsado</span>
      </button>
      <button className="btn quiet sm" onClick={onCancel}>Cancelar</button>
    </div>
  );
}

/* ---------------- Controls ---------------- */
export function PlayerSwitch({ value, onChange, label }: { value: PlayerId; onChange: (p: PlayerId) => void; label?: string }) {
  return (
    <div className="cluster">
      {label && <span className="label">{label}</span>}
      <div className="seg players" role="radiogroup" aria-label={label || 'Jugador'}>
        {PLAYERS.map((p) => (
          <button key={p} data-p={p} className={value === p ? 'on' : ''} onClick={() => onChange(p)} role="radio" aria-checked={value === p}>{PLAYER_NAME[p]}</button>
        ))}
      </div>
    </div>
  );
}

export function Seg<T extends string>({ value, options, onChange, block, label }: { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void; block?: boolean; label?: string }) {
  return (
    <div className={'seg' + (block ? ' block' : '')} role="tablist" aria-label={label}>
      {options.map((o) => <button key={o.v} role="tab" aria-selected={value === o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.label}</button>)}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return <button type="button" role="switch" className="switch" aria-checked={on} onClick={() => onChange(!on)} aria-label={label} />;
}

export function Range({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string }) {
  const p = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return <input className="range" type="range" aria-label={label} min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} style={{ ['--p' as string]: p + '%' } as CSSProperties} />;
}

/** Two-step confirmation for important actions (no blocking browser dialogs). */
export function ConfirmButton({ children, onConfirm, className = 'btn', confirmText = 'Toca otra vez para confirmar', disabled }: { children: ReactNode; onConfirm: () => void; className?: string; confirmText?: ReactNode; disabled?: boolean }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3500); return () => clearTimeout(t); }, [armed]);
  return (
    <button className={className + (armed ? ' is-armed' : '')} disabled={disabled} aria-live="polite"
      onClick={() => { if (armed) { setArmed(false); onConfirm(); } else { setArmed(true); try { navigator.vibrate?.(10); } catch { /* noop */ } } }}>
      {armed ? confirmText : children}
    </button>
  );
}

/* ---------------- Timer ---------------- */
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
      if (l <= 3 && l > 0) beep(660, 80);
      if (l <= 0) { setRun(false); try { navigator.vibrate?.([200, 100, 200]); } catch { /* noop */ } beep(880, 400); }
    }, 250);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const C = 2 * Math.PI * 46;
  const presets = [30, 60, 120, 180, 300, 600];
  return (
    <div className="timer">
      <div className={'timer-ring' + (left === 0 ? ' alarm' : '')} role="timer" aria-label={`${mm}:${ss}`}>
        <svg viewBox="0 0 100 100" aria-hidden><circle cx="50" cy="50" r="46" fill="none" stroke="var(--velvet-4)" strokeWidth="3" /><circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - left / total)} style={{ transition: 'stroke-dashoffset .25s linear' }} /></svg>
        <div className="t-digits">{mm}:{ss}</div>
      </div>
      <div className="stack grow">
        <div className="cluster">
          <button className="btn accent" onClick={() => { if (left === 0) setLeft(total); setRun(!run); }}><Icon name={run ? 'pause' : 'play'} size={16} />{run ? 'Pausar' : left === 0 ? 'Otra vez' : 'Empezar'}</button>
          <button className="btn icon ghost" onClick={() => { setRun(false); setLeft(total); }} aria-label="Reiniciar temporizador"><Icon name="reset" size={18} /></button>
        </div>
        <div className="cluster" style={{ ['--gap' as string]: '6px' }}>
          {presets.map((p) => (
            <button key={p} className={'chip' + (total === p ? ' on' : '')} onClick={() => { setRun(false); setTotal(p); setLeft(p); }}>{p < 60 ? `${p} s` : `${p / 60} min`}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

let audioCtx: AudioContext | null = null;
export function beep(freq = 880, ms = 200, vol = 0.06) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; o.type = 'sine'; g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ms / 1000);
    o.stop(audioCtx.currentTime + ms / 1000);
  } catch { /* audio unavailable */ }
}

/* ---------------- Toaster ---------------- */
export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => onToast(function show(t) {
    // never cover a reveal moment: wait until the stage closes
    if (document.querySelector('.reveal-stage, .ep-card, .overlay, .curtain')) { setTimeout(() => show(t), 600); return; }
    setItems((x) => [...x.slice(-2), t]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== t.id)), 4200);
  }), []);
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <button key={t.id} className={'toast ' + (t.tone || 'info')} onClick={() => setItems((x) => x.filter((i) => i.id !== t.id))}>
          <span className="t-icon"><Icon name={t.tone === 'gold' ? 'star' : t.tone === 'bad' ? 'info' : 'check'} size={16} /></span>
          <span className="stack" style={{ ['--gap' as string]: '2px', textAlign: 'left' }}><b className="small">{t.title}</b>{t.text && <span className="xs muted">{t.text}</span>}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Animated number with delta float ---------------- */
export function AnimatedNumber({ value, className, showDelta }: { value: number; className?: string; showDelta?: boolean }) {
  const [shown, setShown] = useState(value);
  const [delta, setDelta] = useState<{ v: number; k: number } | null>(null);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value;
    prev.current = value;
    if (from === to) return;
    if (showDelta) setDelta({ v: to - from, k: Date.now() });
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setShown(to); return; }
    const t0 = performance.now(), dur = Math.min(900, 300 + Math.abs(to - from) * 6);
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(from + (to - from) * e));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, showDelta]);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span className={(className || '') + ' num'}>{shown}</span>
      {delta && <span key={delta.k} className={'delta' + (delta.v < 0 ? ' neg' : '')} aria-hidden>{delta.v > 0 ? '+' : ''}{delta.v}</span>}
    </span>
  );
}

/* ---------------- Misc ---------------- */
export function MysteryCard({ type, onClick }: { type: CardType; onClick?: () => void }) {
  const d = CARDS[type];
  const style = { ['--tone' as string]: d.tone } as CSSProperties;
  const inner = (
    <>
      <div className="m-top"><LogoMark size={16} /></div>
      <div className="m-glyph"><Icon name={d.glyph} size={22} /></div>
      <div className="stack" style={{ ['--gap' as string]: '4px' }}><div className="m-name">{d.name}</div><div className="m-short">{d.short}</div></div>
    </>
  );
  return onClick ? <button className="mcard" style={style} onClick={onClick} aria-label={`${d.name}: ${d.short}`}>{inner}</button> : <div className="mcard" style={style}>{inner}</div>;
}

export function PTag({ p }: { p: PlayerId }) { return <span className={'pname ' + p}>{PLAYER_NAME[p]}</span>; }
export function Avatar({ p, size }: { p: PlayerId; size?: 'sm' | 'lg' }) { return <span className={`avatar ${p} ${size || ''}`} aria-hidden>{PLAYER_NAME[p][0]}</span>; }

export function Empty({ icon = 'sparkle', children, action }: { icon?: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty"><span className="e-icon"><Icon name={icon} size={20} /></span><span>{children}</span>{action}</div>;
}

export function fmtTime(t: number) {
  return new Date(t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
