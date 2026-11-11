/** Cryptographically strong randomness (falls back to Math.random only if crypto is unavailable). */
export function rand(): number {
  const c = globalThis.crypto;
  if (c && 'getRandomValues' in c) {
    const buf = new Uint32Array(1);
    c.getRandomValues(buf);
    return buf[0] / 4294967296;
  }
  return Math.random();
}

export function randInt(maxExclusive: number): number {
  return Math.floor(rand() * maxExclusive);
}

export function pick<T>(arr: T[]): T {
  return arr[randInt(arr.length)];
}

export function weightedPick<T extends { weight: number }>(items: T[]): T | undefined {
  const total = items.reduce((s, i) => s + Math.max(0, i.weight), 0);
  if (total <= 0) return undefined;
  let r = rand() * total;
  for (const it of items) {
    r -= Math.max(0, it.weight);
    if (r < 0) return it;
  }
  return items[items.length - 1];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function uid(): string {
  return Date.now().toString(36) + '-' + randInt(1e9).toString(36);
}

/** Tiny non-cryptographic hash for the host PIN (works on http:// LAN too). It is a privacy curtain, not security. */
export function hashPin(pin: string): string {
  let h = 2166136261;
  const s = 'homelottery::' + pin;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
