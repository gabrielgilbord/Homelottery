import { describe, it, expect, beforeEach } from 'vitest';
import * as S from '../src/state/store';
import { CHALLENGES } from '../src/data/challenges';
import { BOXES, PRIZES, WHEELS, ENVELOPES } from '../src/data/rewards';
import { DECKS } from '../src/data/decks';

beforeEach(() => S.resetGame(false));

describe('content', () => {
  it('has at least 50 complete challenges with unique ids', () => {
    expect(CHALLENGES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(CHALLENGES.length);
    for (const c of CHALLENGES) {
      expect(c.steps.length, c.id).toBeGreaterThan(0);
      expect(c.materials.length, c.id).toBeGreaterThan(0);
      expect(c.scoring && c.win && c.rematch, c.id).toBeTruthy();
      expect(c.reward.points + c.reward.coins, c.id).toBeGreaterThan(0);
    }
  });
  it('every box entry points to an existing prize', () => {
    for (const b of BOXES) for (const e of b.entries) expect(PRIZES.find((p) => p.id === e.prizeId), e.prizeId).toBeTruthy();
  });
  it('decks are non-empty', () => { for (const d of DECKS) expect(d.cards.length).toBeGreaterThan(4); });
});

describe('results & economy', () => {
  it('duel winner gets reward, loser consolation, streak updates', () => {
    const c = CHALLENGES.find((x) => x.id === 'h-egg')!;
    const g0 = S.getState().players.gabriel.coins, t0 = S.getState().players.tatiana.coins;
    S.recordResult('h-egg', 'tatiana');
    const s = S.getState();
    expect(s.players.tatiana.points).toBe(c.reward.points);
    expect(s.players.tatiana.coins).toBe(t0 + c.reward.coins + 10); // +10 = "Primera Sangre" achievement
    expect(s.players.gabriel.coins).toBe(g0 + Math.round(c.reward.coins * 0.4));
    expect(s.players.tatiana.streak).toBe(1);
    expect(s.achievements['first-win:tatiana']).toBeTruthy();
  });
  it('coop win pays both, finale doubles points', () => {
    S.setEpisode(8);
    S.recordResult('c-know', 'coop-win');
    const s = S.getState();
    expect(s.players.gabriel.points).toBe(30);
    expect(s.players.tatiana.points).toBe(30);
  });
  it('double trouble doubles the next win and is consumed', () => {
    S.hostGiveCard('gabriel', 'double');
    const card = S.getState().players.gabriel.cards[0];
    const r = S.useCard('gabriel', card.uid);
    expect('error' in r).toBe(false);
    S.recordResult('h-egg', 'gabriel');
    expect(S.getState().players.gabriel.points).toBe(30);
    expect(S.getState().players.gabriel.doubleArmed).toBe(false);
  });
});

describe('boxes', () => {
  it('locked before unlock episode, opens with coins and records an immutable prize', () => {
    expect('error' in S.openBox('tatiana', 'bronze')).toBe(true); // episode 1
    S.setEpisode(2);
    S.adjust('tatiana', 1000, 0, 'test');
    const before = S.getState().players.tatiana.coins;
    const r = S.openBox('tatiana', 'bronze');
    expect('error' in r).toBe(false);
    const s = S.getState();
    expect(s.prizes.length).toBe(1);
    expect(s.players.tatiana.coins).toBeLessThanOrEqual(before - 30 + 20 + 10);
  });
  it('unique prizes never repeat and legendary needs keys', () => {
    S.setEpisode(8);
    S.adjust('tatiana', 100000, 0, 'test');
    for (let i = 0; i < 60; i++) S.openBox('tatiana', 'diamond');
    const ids = S.getState().prizes.map((p) => p.prizeId);
    for (const p of PRIZES.filter((x) => x.unique)) expect(ids.filter((i) => i === p.id).length).toBeLessThanOrEqual(1);
    expect('error' in S.openBox('gabriel', 'legendary')).toBe(true);
    S.hostGiveKey('gabriel');
    const r = S.openBox('gabriel', 'legendary');
    expect('error' in r).toBe(false);
    if (!('error' in r)) expect(['l-letter', 'l-gift']).not.toContain(r.prizeId); // tatiana-only prizes
  });
  it('daring prizes vanish if someone disables spicy', () => {
    S.updatePrefs('gabriel', { spicy: false });
    const rows = S.boxEntries(S.getState(), 'tatiana', 'silver');
    expect(rows.find((r) => r.prizeId === 's-kiss')!.eligible).toBe(false);
    const sum = rows.reduce((a, r) => a + r.chance, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
  });
});

describe('roulette & cards', () => {
  it('spins charge cost and apply a segment', () => {
    S.setEpisode(8);
    S.adjust('tatiana', 5000, 0, 'test');
    for (const w of WHEELS) for (let i = 0; i < 25; i++) {
      const r = S.spinWheel('tatiana', w.id);
      expect('error' in r).toBe(false);
      if (!('error' in r) && r.needsDouble) S.doubleOrNothing('tatiana', 10);
    }
    expect(S.getState().players.tatiana.stats.spins).toBe(100);
  });
  it('shield blocks a steal', () => {
    S.hostGiveCard('tatiana', 'shield');
    S.hostGiveCard('gabriel', 'steal');
    const t0 = S.getState().players.tatiana.coins;
    const c = S.getState().players.gabriel.cards[0];
    S.useCard('gabriel', c.uid);
    expect(S.getState().players.tatiana.coins).toBe(t0);
    expect(S.getState().players.tatiana.cards.length).toBe(0);
  });
  it('revenge only after rival won the last duel', () => {
    S.hostGiveCard('gabriel', 'revenge');
    const c = S.getState().players.gabriel.cards[0];
    expect('error' in S.useCard('gabriel', c.uid)).toBe(true);
    S.recordResult('h-egg', 'tatiana');
    const r = S.useCard('gabriel', c.uid);
    expect('error' in r).toBe(false);
    expect(S.getState().players.gabriel.points).toBeGreaterThan(0);
  });
  it('secret mission is stored and completable', () => {
    S.hostGiveCard('tatiana', 'mission');
    const c = S.getState().players.tatiana.cards[0];
    const r = S.useCard('tatiana', c.uid);
    expect('mission' in r && r.mission).toBeTruthy();
    const m = S.getState().players.tatiana.missions[0];
    S.completeMission('tatiana', m.uid);
    expect(S.getState().players.tatiana.missions[0].done).toBe(true);
  });
});

describe('envelopes, decks, bingo, lottery', () => {
  it('envelopes unlock by episode and pay once', () => {
    expect(S.envelopeAvailable(S.getState(), 'env-final')).toBe(false);
    S.setEpisode(8);
    S.openEnvelope('env-final');
    expect(S.getState().players.gabriel.keys).toBe(1);
    expect('error' in S.openEnvelope('env-final')).toBe(true);
    expect(S.getState().players.gabriel.keys).toBe(1);
    expect(ENVELOPES.find((e) => e.id === 'env-gabriel')!.hostOnly).toBe(true);
    expect(S.envelopeAvailable(S.getState(), 'env-gabriel')).toBe(false);
  });
  it('decks draw without repetition until exhausted', () => {
    const d = DECKS.find((x) => x.id === 'quick')!;
    const seen = new Set<number>();
    for (let i = 0; i < d.cards.length; i++) seen.add(S.drawDeck('quick')!.index);
    expect(seen.size).toBe(d.cards.length);
  });
  it('bingo needs a real line', () => {
    S.newBingo('twilight', 'tatiana');
    expect(S.claimBingo('twilight', 'tatiana')).toBe(false);
    for (const i of [0, 1, 2, 3]) S.toggleBingo('twilight', 'tatiana', i);
    expect(S.claimBingo('twilight', 'tatiana')).toBe(true);
    expect(S.claimBingo('twilight', 'tatiana')).toBe(false);
  });
  it('lottery: highest sealed bid wins and pays', () => {
    const g0 = S.getState().players.gabriel.coins, t0 = S.getState().players.tatiana.coins;
    expect(S.lotteryBid('genre', { gabriel: 10, tatiana: 20 })).toBe('tatiana');
    expect(S.getState().players.tatiana.coins).toBe(t0 - 20);
    expect(S.getState().players.gabriel.coins).toBe(g0);
  });
  it('host pin hashing works and reset keeps host data when asked', () => {
    S.setHostPin('2468');
    expect(S.checkHostPin('2468')).toBe(true);
    expect(S.checkHostPin('1111')).toBe(false);
    S.resetGame(true);
    expect(S.checkHostPin('2468')).toBe(true);
    S.resetGame(false);
    expect(S.checkHostPin('2468')).toBe(false);
  });
});
