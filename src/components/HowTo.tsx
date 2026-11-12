import type { ReactNode } from 'react';
import { Icon } from './Icon';

/** "Cómo funciona": what you need + numbered steps. Native <details>, so it folds away once learned. */
export function HowTo({ title = 'Cómo funciona', need, steps, open = true, children }: { title?: string; need?: ReactNode[]; steps: ReactNode[]; open?: boolean; children?: ReactNode }) {
  return (
    <details className="howto" open={open}>
      <summary><Icon name="info" size={16} /><span>{title}</span><Icon name="chevron" size={16} className="howto-chev" /></summary>
      <div className="howto-body">
        {need && need.length > 0 && (
          <div className="howto-need"><b>Qué necesitáis</b><ul>{need.map((n, i) => <li key={i}>{n}</li>)}</ul></div>
        )}
        <ol className="steps">{steps.map((s, i) => <li key={i}><span>{s}</span></li>)}</ol>
        {children}
      </div>
    </details>
  );
}
