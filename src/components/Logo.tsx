import type { CSSProperties, ReactNode } from 'react';

/* =====================================================================
   HOMELOTTERY brand system · one concept: THE SCREEN.
   A television screen drawn like a Didone letter (thick sides, hairline
   top and bottom). It replaces the O of HOME in the wordmark, holds the
   H in the monogram, and frames the "show star" in the symbol.
   All marks are authored SVG (no icon fonts, no emoji).
   ===================================================================== */

/** Outer and inner contour of the screen, evenodd → Didone stroke contrast. */
const SCREEN =
  'M7 2.6Q20 1.2 33 2.6Q38.2 3.2 38.7 8.2Q39.6 16 38.7 23.8Q38.2 28.8 33 29.4Q20 30.8 7 29.4Q1.8 28.8 1.3 23.8Q.4 16 1.3 8.2Q1.8 3.2 7 2.6Z' +
  'M8.4 4.6Q20 3.5 31.6 4.6Q34.1 4.9 34.4 8.6Q35 16 34.4 23.4Q34.1 27.1 31.6 27.4Q20 28.5 8.4 27.4Q5.9 27.1 5.6 23.4Q5 16 5.6 8.6Q5.9 4.9 8.4 4.6Z';
/** Four-point show star. */
const STAR = 'M20 7.5C20.9 13.2 22.6 15 28.2 16 22.6 17 20.9 18.8 20 24.5 19.1 18.8 17.4 17 11.8 16 17.4 15 19.1 13.2 20 7.5Z';

/** The symbol: screen + show star. */
export function LogoMark({ size = 28, star = 'var(--orange-2)', frame = 'currentColor', title }: { size?: number; star?: string; frame?: string; title?: string }) {
  return (
    <svg width={size * 1.25} height={size} viewBox="0 0 40 32" className="logo-mark" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d={SCREEN} fill={frame} fillRule="evenodd" />
      <path d={STAR} fill={star} />
    </svg>
  );
}

/** Monogram: the screen holding a Didone H whose crossbar became the show star. */
export function Monogram({ size = 40, ground = 'var(--burgundy)', ink = 'var(--cream)', star = 'var(--orange-2)', rounded = true }: { size?: number; ground?: string; ink?: string; star?: string; rounded?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="monogram">
      <rect width="64" height="64" rx={rounded ? 14 : 0} fill={ground} />
      <g transform="translate(6 9) scale(1.3)"><path d={SCREEN} fill={ink} fillRule="evenodd" /></g>
      {/* Didone H: heavy stems, hairline serifs */}
      <rect x="21.5" y="21" width="5.6" height="22" fill={ink} />
      <rect x="36.9" y="21" width="5.6" height="22" fill={ink} />
      <rect x="18.6" y="20.2" width="11.4" height="1.5" fill={ink} />
      <rect x="18.6" y="42.3" width="11.4" height="1.5" fill={ink} />
      <rect x="34" y="20.2" width="11.4" height="1.5" fill={ink} />
      <rect x="34" y="42.3" width="11.4" height="1.5" fill={ink} />
      <path d="M32 25.4C32.5 29.3 33.5 30.5 37 31.6 33.5 32.7 32.5 33.9 32 37.8 31.5 33.9 30.5 32.7 27 31.6 30.5 30.5 31.5 29.3 32 25.4Z" fill={star} />
    </svg>
  );
}

/** Wordmark: H [screen] MELOTTERY. The screen IS the O. */
export function Wordmark({ size = 'md', tagline }: { size?: 'sm' | 'md' | 'lg' | 'xl'; tagline?: ReactNode }) {
  return (
    <span className={'wordmark ' + size} aria-label="HOMELOTTERY" role="img">
      <span className="wm-row" aria-hidden>
        <span>H</span>
        <svg className="wm-o" viewBox="0 0 40 32"><path d={SCREEN} fill="currentColor" fillRule="evenodd" /><path d={STAR} fill="var(--orange-2)" className="wm-star" /></svg>
        <span>MELOTTERY</span>
      </span>
      {tagline && <span className="wm-tag" aria-hidden>{tagline}</span>}
    </span>
  );
}

/** The ON AIR lamp. Lights up once when mounted (prefers-reduced-motion: already lit). */
export function OnAir({ label = 'On air', small }: { label?: string; small?: boolean }) {
  return <span className={'onair-lamp' + (small ? ' sm' : '')} role="status" aria-label="En emisión"><i aria-hidden />{label}</span>;
}

/** Broadcast seal: a circular stamp with the show's legend around a centre. */
export function Seal({ children, ring = 'Homelottery · emisión privada · en directo desde casa ·', size = 112, style, className = '' }: { children?: ReactNode; ring?: string; size?: number; style?: CSSProperties; className?: string }) {
  const id = 'seal-' + ring.length + '-' + size;
  return (
    <span className={'seal-stamp ' + className} style={{ width: size, height: size, ...style }} aria-hidden>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <defs><path id={id} d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" /></defs>
        <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="1" />
        <text fontSize="10.4" fontWeight="700" letterSpacing="1.6" fill="currentColor" style={{ fontFamily: 'var(--f-edit)', textTransform: 'uppercase', fontStretch: '80%' }}>
          <textPath href={'#' + id} startOffset="0">{ring}</textPath>
        </text>
      </svg>
      <span className="seal-c">{children}</span>
    </span>
  );
}

/** Episode numeral in the show's editorial system: "Ep." + two-digit Didone figure. */
export function EpNum({ n, size = 'md' }: { n: number; size?: 'sm' | 'md' | 'giant' }) {
  return (
    <span className={'epnum ' + size} aria-label={`Episodio ${n}`}>
      <span className="ep-k" aria-hidden>Ep.</span>
      <span className="ep-d" aria-hidden>{String(n).padStart(2, '0')}</span>
    </span>
  );
}
