import type { CSSProperties } from 'react';

/* Hand-drawn 24px stroke icon set (no emojis, no icon fonts). */
const P: Record<string, string> = {
  home: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5.5h4V20',
  show: 'M4 8h16v11H4zM8 4l4 4 4-4M7 12h6M7 15h4',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  gamepad: 'M7.5 8h9a4.5 4.5 0 0 1 4.3 5.8l-1 3.4a2.2 2.2 0 0 1-3.8.7L14 15.5h-4L8 17.9a2.2 2.2 0 0 1-3.8-.7l-1-3.4A4.5 4.5 0 0 1 7.5 8zM8 11v3M6.5 12.5h3M15.5 11.5h.01M17.5 13.5h.01',
  cards: 'M8 4h9a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM4.5 7.5 7 7M4 8l2.5 11.5 1-.2M12.5 9.5l-1.6 2.2 1.6 2.3 1.6-2.3z',
  glass: 'M6 4h12l-1.2 7a4.9 4.9 0 0 1-9.6 0zM12 16v4M8.5 20h7M7 8h10',
  heart: 'M12 20s-7.5-4.4-8.6-9.4A4.6 4.6 0 0 1 12 7.2a4.6 4.6 0 0 1 8.6 3.4C19.5 15.6 12 20 12 20z',
  film: 'M4 5h16v14H4zM8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4',
  gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7S10.5 3 8.5 3.8C6.6 4.6 8 7 12 7zm0 0s1.5-4 3.5-3.2C17.4 4.6 16 7 12 7z',
  wheel: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  bag: 'M5 8h14l-1 12H6zM9 8V6.5a3 3 0 0 1 6 0V8',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6M10 17h4',
  medal: 'M8 3h3l1 5M16 3h-3l-1 5M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 12.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2',
  key: 'M8 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM12 11h9M18 11v3M15.5 11v2',
  coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v10M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.5.8-2.5 1.9 0 2.6 5 1.4 5 4.1 0 1.1-1.1 2-2.6 2-1.2 0-2.2-.5-2.7-1.4',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z',
  bolt: 'M13 3 5 13.5h6L10 21l8-10.5h-6z',
  shield: 'M12 3 5 6v5.5c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5V6z',
  hand: 'M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v7.5a7 7 0 0 1-7 7h-.5a6.5 6.5 0 0 1-5.4-2.9L3 15.5a1.5 1.5 0 0 1 2.5-1.7L8 16',
  swap: 'M7 7h12M15 3l4 4-4 4M17 17H5M9 13l-4 4 4 4',
  retry: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5',
  wild: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeoff: 'M4 4l16 16M10.6 6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.8 3.6M6.5 7.6A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
  flame: 'M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.9 3.5-5.6 3.6-9.9 2.6 1.6 4 3.6 4.4 6 .8-.6 1.4-1.6 1.6-2.8 1.9 1.6 3.4 4 3.4 6.7 0 3.5-2.6 6.1-6.5 6.1z',
  crown: 'M3.5 8 8 11.5 12 5l4 6.5L20.5 8 19 18H5zM5 21h14',
  phoenix: 'M20 4c-6 0-11 3-13.5 9L4 20l3.5-2.5c3.5-.2 7-2.4 8.5-6-1.8.6-3.6.6-5 0 3-.7 5.5-2.5 7-5.5h-3c1.7-.7 3.4-1.4 5-2z',
  diamond: 'M6 4h12l3.5 5L12 21 2.5 9zM2.5 9h19M9 4l-1.5 5L12 21M15 4l1.5 5L12 21',
  dice: 'M5 5h14v14H5zM9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M10 2.5h4',
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  reset: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'M9 5l7 7-7 7',
  back: 'M15 5l-7 7 7 7',
  menu: 'M4 7h16M4 12h16M4 17h10',
  sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',
  envelope: 'M3.5 6h17v12h-17zM3.5 6.5 12 13l8.5-6.5',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.5-3.6 3.2-6 6.5-6s6 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.3c2 .9 3.3 3 3.5 5.7',
  skip: 'M5 5l9 7-9 7zM18 5v14',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01',
  printer: 'M7 9V3.5h10V9M7 17H4.5v-8h15v8H17M7 14h10v6.5H7z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  music: 'M9 18V5.5l11-2V16M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  mask: 'M3 7c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0v4c0 4.5-3.5 7.5-6 7.5-1.5 0-2.3-1.5-3-3-.7 1.5-1.5 3-3 3-2.5 0-6-3-6-7.5zM7 11h2.5M14.5 11H17',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  book: 'M5 4.5h11.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2zM5 18a2 2 0 0 1 2-2h11.5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z',
  download: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14',
  egg: 'M12 21c-4 0-6.5-2.8-6.5-6.8C5.5 9 8.5 3 12 3s6.5 6 6.5 11.2c0 4-2.5 6.8-6.5 6.8z',
};

export type IconName = keyof typeof P | string;

export function Icon({ name, size = 20, stroke = 1.6, style, className }: { name: IconName; size?: number; stroke?: number; style?: CSSProperties; className?: string }) {
  if (name === 'x2') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={className} aria-hidden>
        <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor" fontFamily="Manrope, sans-serif">x2</text>
      </svg>
    );
  }
  const d = P[name] || P.sparkle;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style} className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}
