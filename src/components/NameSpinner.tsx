import { useEffect, useRef, useState } from 'react';
import { pick } from '../lib/random';
import { Icon } from './Icon';

/** Slot-machine style picker: cycles quickly then lands on a random (crypto) choice. */
export function NameSpinner({ items, label, button = 'Girar' }: { items: string[]; label: string; button?: string }) {
  const [val, setVal] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const t = useRef<number>();
  useEffect(() => () => clearTimeout(t.current), []);
  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const final = pick(items);
    let i = 0;
    const steps = 22;
    const tick = () => {
      i++;
      if (i >= steps) { setVal(final); setSpinning(false); return; }
      setVal(pick(items));
      t.current = window.setTimeout(tick, 40 + i * i * 0.7);
    };
    tick();
  };
  return (
    <div className="card tight stack" style={{ gap: 10 }}>
      <div className="eyebrow" style={{ fontSize: 10 }}>{label}</div>
      <div className="h-show" style={{ fontSize: 34, minHeight: 36, color: spinning ? 'var(--ink-2)' : 'var(--accent)', textShadow: spinning ? 'none' : '0 0 24px var(--glow)' }}>{val || '— — —'}</div>
      <button className="btn primary sm" onClick={spin} disabled={spinning}><Icon name="dice" size={16} />{button}</button>
    </div>
  );
}
