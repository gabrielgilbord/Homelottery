/**
 * GAMEPLAY QA — a full simulated day of HOMELOTTERY, played through the real store API,
 * from the breakfast mission to the closing envelope. Asserts the economy stays sane at every step.
 * Set HL_SNAPSHOT=dir to also write mid-game save files (used for screenshots).
 */
import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import * as S from '../src/state/store';
import { CHALLENGES } from '../src/data/challenges';
import { EPISODES } from '../src/data/episodes';
import { WHEELS, ENVELOPES, PRIZES } from '../src/data/rewards';
import { LOTTERY_ITEMS } from '../src/data/gaming';
import { PLAYERS, type PlayerId, type BoxTier } from '../src/types';

const snapDir = process.env.HL_SNAPSHOT;
const snap = (name: string) => { if (snapDir) { mkdirSync(snapDir, { recursive: true }); writeFileSync(`${snapDir}/${name}.json`, S.exportSave()); } };

function invariants() {
  const s = S.getState();
  for (const p of PLAYERS) {
    const P = s.players[p];
    expect(P.coins, `${p} coins`).toBeGreaterThanOrEqual(0);
    expect(P.points, `${p} points`).toBeGreaterThanOrEqual(0);
    expect(P.keys, `${p} keys`).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(P.coins) && Number.isInteger(P.coins)).toBe(true);
    for (const n of Object.values(P.freeBoxes)) expect(n || 0).toBeGreaterThanOrEqual(0);
  }
  const uniq = s.prizes.map((r) => r.prizeId).filter((id) => PRIZES.find((p) => p.id === id)?.unique);
  expect(new Set(uniq).size, 'unique prizes never repeat').toBe(uniq.length);
}

let turn = 0;
const winnerFor = (): PlayerId => (turn++ % 3 === 2 ? 'gabriel' : 'tatiana');

function play(id: string) {
  const c = CHALLENGES.find((x) => x.id === id)!;
  expect(c, id).toBeTruthy();
  const r = S.recordResult(id, c.mode === 'coop' ? 'coop-win' : winnerFor());
  expect(r.lines.length).toBeGreaterThan(0);
  invariants();
}

function openAll(p: PlayerId) {
  for (const tier of ['bronze', 'silver', 'gold', 'diamond', 'legendary'] as BoxTier[]) {
    while ((S.getState().players[p].freeBoxes[tier] || 0) > 0) { const r = S.openBox(p, tier); expect('error' in r).toBe(false); }
  }
}

describe('a full day of HOMELOTTERY', () => {
  it('plays from breakfast to the closing envelope without breaking the economy', () => {
    S.resetGame(false);
    S.setHostPin('2468');
    // ---------- EP 01 · prologue ----------
    S.setIntroStep(2);
    expect('error' in S.openEnvelope('env-first')).toBe(false);
    S.updatePrefs('tatiana', { configured: true, romance: 'spicy', spicy: true, alcohol: true });
    S.updatePrefs('gabriel', { configured: true, romance: 'legendary', spicy: true, alcohol: true });
    S.finishIntro();
    S.recordResult('h-breakfast', 'tatiana');
    expect(S.getState().firstMissionDone).toBe(true);
    expect(S.getState().achievements['breakfast:tatiana']).toBeTruthy();
    invariants();

    // Locked before their episode
    expect('error' in S.openBox('tatiana', 'bronze')).toBe(true);
    expect('error' in S.spinWheel('tatiana', 'classic')).toBe(true);

    // ---------- every episode ----------
    for (const ep of EPISODES.slice(1)) {
      S.setEpisode(ep.n);
      expect(S.getState().episode).toBe(ep.n);
      // open every envelope that just became available (host-only ones stay closed)
      for (const e of S.availableEnvelopes(S.getState()).filter((x) => !x.hostOnly)) expect('error' in S.openEnvelope(e.id)).toBe(false);
      for (const id of ep.picks.slice(0, 4)) play(id);

      for (const p of PLAYERS) {
        openAll(p);
        // spend coins in the shop as players would
        for (const w of WHEELS.filter((x) => ep.n >= x.unlockEpisode)) {
          if (S.getState().players[p].coins >= w.cost + 20) {
            const r = S.spinWheel(p, w.id);
            expect('error' in r).toBe(false);
            if (!('error' in r) && r.needsDouble) S.doubleOrNothing(p, Math.min(20, S.getState().players[p].coins));
          }
        }
        const affordable = (['diamond', 'gold', 'silver', 'bronze'] as BoxTier[]).find((t) => S.canOpenBox(S.getState(), p, t).ok);
        if (affordable && affordable !== ('legendary' as BoxTier)) expect('error' in S.openBox(p, affordable)).toBe(false);
        openAll(p);
        // use every card that is currently usable
        for (const c of [...S.getState().players[p].cards]) {
          // a card used just before (Swap, an event…) can move this one out of the hand: only play cards still held
          if (!S.getState().players[p].cards.some((x) => x.uid === c.uid)) continue;
          if (S.cardUsable(S.getState(), p, c.type).ok) { const r = S.useCard(p, c.uid); expect('error' in r).toBe(false); }
        }
        openAll(p);
        for (const m of S.getState().players[p].missions.filter((x) => !x.done)) S.completeMission(p, m.uid);
        invariants();
      }

      if (ep.n === 3) { S.newSeries('Escoba', 3); const id = S.getState().series[0].uid; S.seriesWin(id, 'gabriel'); S.seriesWin(id, 'tatiana'); S.seriesWin(id, 'tatiana'); expect(S.getState().series[0].done).toBe('tatiana'); }
      if (ep.n === 5) snap('ep5-party');
      if (ep.n === 7) {
        // Movie lottery: sealed bids for every item
        for (const it of LOTTERY_ITEMS) {
          const g = Math.min(10, S.getState().players.gabriel.coins), t = Math.min(15, S.getState().players.tatiana.coins);
          const w = S.lotteryBid(it.id, { gabriel: g, tatiana: t });
          expect(typeof w).toBe('string');
          S.lotteryChoice(it.id, it.options[0] || 'Crepúsculo (Twilight, 2008)');
        }
        S.newBingo('twilight', 'tatiana');
        for (const i of [0, 5, 10, 15]) S.toggleBingo('twilight', 'tatiana', i);
        expect(S.claimBingo('twilight', 'tatiana')).toBe(true);
        S.addPrediction('gabriel', 'Habrá una escena en el bosque', 'Película');
        S.addPrediction('tatiana', 'Alguien llorará', 'Película');
        for (const p of S.getState().predictions) S.resolvePrediction(p.uid, true);
        snap('ep7-movie');
      }
      invariants();
    }

    // ---------- grand finale ----------
    const s = S.getState();
    expect(s.episode).toBe(8);
    expect(s.envelopesOpened).toContain('env-final');
    for (const p of PLAYERS) {
      expect(s.players[p].keys + s.players[p].stats.legend).toBeGreaterThanOrEqual(1);
      while (S.getState().players[p].keys > 0) expect('error' in S.openBox(p, 'legendary')).toBe(false);
      expect(S.getState().players[p].stats.legend).toBeGreaterThan(0);
    }
    // personal legendary prizes went to the right person
    for (const r of S.getState().prizes) {
      if (r.prizeId === 'l-letter' || r.prizeId === 'l-gift') expect(r.player).toBe('tatiana');
      if (r.prizeId === 'l-letter-g' || r.prizeId === 'l-gift-g') expect(r.player).toBe('gabriel');
    }
    // Gabriel's secret envelope only through Host Mode
    expect(S.envelopeAvailable(S.getState(), 'env-gabriel')).toBe(false);
    S.forceEnvelope('env-gabriel');
    expect('error' in S.openEnvelope('env-gabriel')).toBe(false);
    // closing ceremony
    expect(S.envelopeAvailable(S.getState(), 'env-closing')).toBe(true);
    expect('error' in S.openEnvelope('env-closing')).toBe(false);
    invariants();
    snap('ep8-finale');

    const end = S.getState();
    const opened = ENVELOPES.filter((e) => end.envelopesOpened.includes(e.id)).length;
    expect(opened).toBe(ENVELOPES.length);
    expect(Object.keys(end.achievements).length).toBeGreaterThan(10);
    expect(end.history.length).toBeGreaterThan(50);
    // persistence round-trip
    const json = S.exportSave();
    S.resetGame(true);
    expect(S.importSave(json)).toBe(true);
    expect(S.getState().players.tatiana.points).toBe(end.players.tatiana.points);
    expect(S.checkHostPin('2468')).toBe(true);
    // eslint-disable-next-line no-console
    console.log('DAY SUMMARY', JSON.stringify({
      points: { g: end.players.gabriel.points, t: end.players.tatiana.points },
      coins: { g: end.players.gabriel.coins, t: end.players.tatiana.coins },
      prizes: end.prizes.length, achievements: Object.keys(end.achievements).length, results: end.history.filter((h) => h.kind === 'result').length,
    }));
  });
});
