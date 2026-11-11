import type { ReactNode } from 'react';
import { Icon } from './Icon';

/** Four families of envelope, each with its own paper and wax. */
export type EnvelopeKind = 'normal' | 'special' | 'prize' | 'surprise';
export const ENVELOPE_KIND: Record<string, EnvelopeKind> = {
  'env-gold': 'prize', 'env-final': 'prize', 'env-closing': 'prize',
  'env-first': 'special', 'env-gabriel': 'special', 'env-midnight': 'special',
  'env-comeback': 'surprise', 'env-five': 'surprise',
};
export const KIND_LABEL: Record<EnvelopeKind, string> = { normal: 'Sobre', special: 'Personal', prize: 'Premio', surprise: 'Sorpresa' };
const SEAL: Record<EnvelopeKind, ReactNode> = {
  normal: 'H',
  special: <Icon name="heart" size={16} />,
  prize: <Icon name="star" size={16} />,
  surprise: '?',
};

export type EnvelopeState = 'locked' | 'ready' | 'opened';

/** A physical envelope: paper, flap, wax seal, number and name. */
export function Envelope({ id, n, name, state, onClick, label }: { id: string; n: number; name: string; state: EnvelopeState; onClick?: () => void; label?: string }) {
  const kind = ENVELOPE_KIND[id] || 'normal';
  const body = (
    <>
      <span className="envl-flap" aria-hidden />
      {state === 'opened' && <span className="envl-letter" aria-hidden />}
      <span className="envl-seal" aria-hidden>{state === 'locked' ? <Icon name="lock" size={14} /> : state === 'opened' ? <Icon name="check" size={14} /> : SEAL[kind]}</span>
      <span className="envl-meta">
        <span className="envl-n">Nº {String(n).padStart(2, '0')}</span>
        <span className="envl-kind">{KIND_LABEL[kind]}</span>
      </span>
      <span className="envl-name">{name}</span>
    </>
  );
  const cls = `envl k-${kind} is-${state}`;
  return onClick
    ? <button className={cls} onClick={onClick} aria-label={label || name}>{body}</button>
    : <div className={cls} aria-label={label || name} role="img">{body}</div>;
}

/** The opening: flap lifts, the letter rises out of the envelope, then reads. */
export function EnvelopeReveal({ id, message, reward }: { id: string; message: string; reward: ReactNode }) {
  const kind = ENVELOPE_KIND[id] || 'normal';
  return (
    <div className={`env-reveal k-${kind}`}>
      <div className="er-stage" aria-hidden>
        <span className="er-back" />
        <span className="er-sheet" />
        <span className="er-front" />
        <span className="er-flap" />
      </div>
      <div className="er-letter">
        <p className="er-msg">{message}</p>
        <div className="er-reward"><span className="bc value">Recompensa</span><b>{reward}</b></div>
      </div>
    </div>
  );
}
