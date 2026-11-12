import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { EPISODES } from '../src/data/episodes';
import { challengeById } from '../src/data/challenges';

// A real key/value storage, so we can prove the Night Show never writes the main game.
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => { mem.set(k, String(v)); },
  removeItem: (k: string) => { mem.delete(k); },
  clear: () => mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() { return mem.size; },
} as Storage;

let S: typeof import('../src/state/store');
let N: typeof import('../src/state/night');
beforeAll(async () => { S = await import('../src/state/store'); N = await import('../src/state/night'); });
beforeEach(() => { S.resetGame(false); N.resetNight(); });

describe('Night Show', () => {
  it('never reads or writes the main game', () => {
    const mainBefore = mem.get(S.STORAGE_KEY);
    const stateBefore = JSON.stringify(S.getState());
    N.toggleWorld('movie'); N.setLevel('spicy'); N.setLastCall(true);
    for (let i = 0; i < 6 && N.nextAct(); i++) N.scoreAct(i % 2 ? 'gabriel' : 'tatiana');
    N.swapAct(); N.closeShow();
    expect(mem.get(S.STORAGE_KEY)).toBe(mainBefore);
    expect(JSON.stringify(S.getState())).toBe(stateBefore);
    expect(mem.get(N.NIGHT_KEY)).toBeTruthy();
  });

  it('scores with the challenge points: win, tie 60 %, team success both, fail nothing, last call x2', () => {
    N.playAct('k-escoba'); N.scoreAct('tatiana');
    const pts = challengeById('k-escoba')!.reward.points;
    expect(N.getNight().points).toEqual({ gabriel: 0, tatiana: pts });
    N.playAct('h-egg'); N.scoreAct('tie');
    const egg = challengeById('h-egg')!.reward.points;
    expect(N.getNight().points.gabriel).toBe(Math.round(egg * 0.6));
    N.playAct('c-mirror'); N.scoreAct('coop');
    const mir = challengeById('c-mirror')!.reward.points;
    expect(N.getNight().points.gabriel).toBe(Math.round(egg * 0.6) + mir);
    const before = { ...N.getNight().points };
    N.playAct('h-tower'); N.scoreAct('fail');
    expect(N.getNight().points).toEqual(before);
    N.setLastCall(true); N.playAct('k-brisca'); N.scoreAct('gabriel');
    expect(N.getNight().points.gabriel).toBe(before.gabriel + challengeById('k-brisca')!.reward.points * 2);
  });

  it('respects worlds, level and the reserved challenges of tomorrow', () => {
    // "Nuevo Night Show" keeps the night's settings on purpose, so set them explicitly here.
    N.setLevel('sweet'); N.setKeepTomorrow(true);
    for (const w of N.NIGHT_WORLDS) if (N.getNight().worlds.includes(w) !== ['home', 'couples', 'cards', 'party'].includes(w)) N.toggleWorld(w);
    const tomorrow = new Set(EPISODES.flatMap((e) => e.picks));
    const pool = N.nightPool();
    expect(pool.length).toBeGreaterThan(10);
    for (const c of pool) {
      expect(N.getNight().worlds).toContain(c.category);
      expect(tomorrow.has(c.id)).toBe(false);
      expect(!c.intensity || c.intensity === 'sweet').toBe(true);
    }
    N.setKeepTomorrow(false);
    expect(N.nightPool().length).toBeGreaterThan(pool.length);
  });

  it('does not repeat a challenge in the same night', () => {
    const seen = new Set<string>();
    while (N.nextAct()) { const id = N.getNight().current!; expect(seen.has(id)).toBe(false); seen.add(id); N.scoreAct('tie'); }
    expect(N.nightPool().length).toBe(0);
  });
});
