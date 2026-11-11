/* Proportional celebrations: 1 = small win, 2 = big reward, 3 = legendary.
   One short-lived canvas, ~2.2s, no dependencies. Skipped with reduced motion. */
const PALETTES: Record<number, string[]> = {
  1: ['#f3ebe1', '#e6cc98', '#c94a6f'],
  2: ['#f3ebe1', '#e6cc98', '#b89a62', '#c94a6f', '#9fb4ff'],
  3: ['#f2d7a0', '#f59ab4', '#b9a3ff', '#8fd9f2', '#f3ebe1', '#e6cc98'],
};

export function celebrate(level: 1 | 2 | 3 = 1) {
  if (typeof window === 'undefined') return;
  try { navigator.vibrate?.(level === 3 ? [40, 60, 40, 60, 120] : level === 2 ? [30, 50, 60] : 25); } catch { /* noop */ }
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = window.innerWidth, H = window.innerHeight;
  c.width = W * dpr; c.height = H * dpr;
  Object.assign(c.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '95' });
  document.body.appendChild(c);
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const n = level === 3 ? 160 : level === 2 ? 90 : 40;
  const colors = PALETTES[level];
  const ps = Array.from({ length: n }, (_, i) => {
    const fromSides = level > 1 && i % 2 === 0;
    const side = i % 4 === 0 ? 0 : W;
    return {
      x: fromSides ? side : W / 2 + (Math.random() - 0.5) * 60,
      y: fromSides ? H * 0.7 : H * 0.42,
      vx: fromSides ? (side === 0 ? 1 : -1) * (4 + Math.random() * 7) : (Math.random() - 0.5) * 11,
      vy: fromSides ? -(9 + Math.random() * 9) : -(4 + Math.random() * 9),
      w: 4 + Math.random() * 5, h: 7 + Math.random() * 7, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      c: colors[i % colors.length], shape: i % 5 === 0 ? 1 : 0,
    };
  });
  const start = performance.now();
  const dur = level === 3 ? 3000 : 2200;
  const tick = (t: number) => {
    const k = (t - start) / dur;
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k * k); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      if (p.shape) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (k < 1) requestAnimationFrame(tick); else c.remove();
  };
  requestAnimationFrame(tick);
}
