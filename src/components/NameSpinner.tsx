import { useEffect, useRef, useState } from 'react';
import { pick } from '../lib/random';
import { Icon } from './Icon';
import { beep } from './ui';

/** Slot-machine picker: cycles, decelerates, lands on a crypto-random choice. */
export function NameSpinner({ items, label, button = 'Girar' }: { items: string[]; label: string; button?: string }) {
  const [val, setVal] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'spinning' | 'done'>('idle');
  const t = useRef<number>();
  useEffect(() => () => clearTimeout(t.current), []);
  const spin = () => {
    if (state === 'spinning') return;
    setState('spinning');
    const final = pick(items);
    let i = 0;
    const tick = () => {
      i++;
      if (i >= 20) { setVal(final); setState('done'); beep(880, 200, 0.05); return; }
      setVal(pick(items)); beep(1200, 18, 0.02);
      t.current = window.setTimeout(tick, 40 + i * i * 0.8);
    };
    tick();
  };
  return (
    <div className={'slot ' + state}>
      <div className="slot-text">
        <span className="label">{label}</span>
        <span className="slot-val" aria-live="polite">{val || 'Sin sortear'}</span>
      </div>
      <button className="btn" onClick={spin} disabled={state === 'spinning'} aria-label={button}><Icon name="dice" size={16} />Girar</button>
    </div>
  );
}
