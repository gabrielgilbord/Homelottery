import { useSyncExternalStore } from 'react';
import type {
  BoxTier, CardType, GameState, HistoryEntry, PlayerId, PlayerState, Prefs, PrizeRecord, CategoryId, Intensity,
} from '../types';
import { PLAYERS, PLAYER_NAME, rival, INTENSITY_ORDER } from '../types';
import { challengeById } from '../data/challenges';
import {
  ACHIEVEMENTS, BOXES, CARDS, CARD_TYPES, CARD_WEIGHTS, ENVELOPES, EVENTS, MISSIONS, PRIZES, PRIZE_CARD_COUNT, PRIZE_FOR,
  PRIZE_SPECIAL, WHEELS, boxByTier, prizeById, type Segment, type EventEffect,
} from '../data/rewards';
import { DECKS, BINGO_POOLS } from '../data/decks';
import { hashPin, pick, randInt, shuffle, uid, weightedPick, rand } from '../lib/random';

export const STORAGE_KEY = 'homelottery.v1';
const VERSION = 1;

/* ============================== INITIAL STATE ============================== */
const emptyStats = () => ({
  boxes: 0, spins: 0, allin: 0, thefts: 0, cardsUsed: 0, coopWins: 0, categories: [] as CategoryId[], bingos: 0,
  predictionsHit: 0, missionsDone: 0, comeback: 0, breakfast: 0, gold: 0, diamond: 0, legend: 0,
});

const newPlayer = (): PlayerState => ({
  coins: 50, points: 0, streak: 0, bestStreak: 0, losses: 0, lossStreak: 0, wins: 0, cards: [], keys: 0,
  doubleArmed: false, multiplier: 1, missions: [], freeBoxes: {}, stats: emptyStats(),
});

const defaultPrefs = (): Prefs => ({
  competition: 'normal', romance: 'spicy', spicy: true, alcohol: true, avoid: [], rewardStyle: 'all', limits: '', configured: false,
});

export function initialState(): GameState {
  return {
    version: VERSION, createdAt: Date.now(), introStep: 0, introDone: false, firstMissionDone: false, episode: 1,
    episodeStartedAt: { 1: Date.now() },
    players: { gabriel: newPlayer(), tatiana: newPlayer() },
    prefs: { gabriel: defaultPrefs(), tatiana: defaultPrefs() },
    history: [], completed: {}, prizes: [], drawnUnique: [], boxesOpened: { gabriel: {}, tatiana: {} },
    envelopesOpened: [], envelopesForced: [], achievements: {},
    host: { prizeOverrides: {}, envelopeOverrides: {}, checklist: {}, notes: '' },
    sharedScreen: true, decks: {}, bingo: {}, predictions: [], series: [], lottery: {}, roulettesSpun: {}, usedSeed: 0,
  };
}

/** Merge a stored (possibly older) state with defaults so new fields never crash the app. */
function migrate(raw: unknown): GameState {
  const base = initialState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<GameState>;
  const merged: GameState = { ...base, ...r, host: { ...base.host, ...(r.host || {}) } } as GameState;
  for (const p of PLAYERS) {
    merged.players[p] = { ...newPlayer(), ...(r.players?.[p] || {}) };
    merged.players[p].stats = { ...emptyStats(), ...(r.players?.[p]?.stats || {}) };
    merged.prefs[p] = { ...defaultPrefs(), ...(r.prefs?.[p] || {}) };
    merged.boxesOpened[p] = { ...(r.boxesOpened?.[p] || {}) };
  }
  return merged;
}

function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch { /* ignore corrupted storage */ }
  return initialState();
}

let state: GameState = load();
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
}

function commit<T>(mut: (s: GameState) => T): T {
  const next: GameState = structuredClone(state);
  const out = mut(next);
  automations(next);
  state = next;
  persist();
  listeners.forEach((l) => l());
  return out;
}

export function getState() { return state; }
export function useGame(): GameState {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => state);
}

// sync between tabs (e.g. host on laptop + players on phone in the same browser profile)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try { state = migrate(JSON.parse(e.newValue)); listeners.forEach((l) => l()); } catch { /* noop */ }
    }
  });
}

/* ============================== TOASTS ============================== */
export interface Toast { id: string; title: string; text?: string; tone?: 'gold' | 'good' | 'bad' | 'info' }
const toastListeners = new Set<(t: Toast) => void>();
export function onToast(fn: (t: Toast) => void) { toastListeners.add(fn); return () => { toastListeners.delete(fn); }; }
export function toast(title: string, text?: string, tone: Toast['tone'] = 'info') {
  const t = { id: uid(), title, text, tone };
  // defer so toasts raised inside commit appear after render
  setTimeout(() => toastListeners.forEach((l) => l(t)), 0);
}

/* ============================== HELPERS ============================== */
function log(s: GameState, e: Omit<HistoryEntry, 'uid' | 'at'>) {
  s.history.unshift({ uid: uid(), at: Date.now(), ...e });
  if (s.history.length > 600) s.history.length = 600;
}

function addCoins(s: GameState, p: PlayerId, n: number) { s.players[p].coins = Math.max(0, s.players[p].coins + Math.round(n)); }
function addPoints(s: GameState, p: PlayerId, n: number) { s.players[p].points = Math.max(0, s.players[p].points + Math.round(n)); }

function randomCardType(): CardType {
  return weightedPick(CARD_TYPES.map((t) => ({ t, weight: CARD_WEIGHTS[t] })))!.t;
}

function giveCard(s: GameState, p: PlayerId, type: CardType | 'random' = 'random'): CardType {
  const t = type === 'random' ? randomCardType() : type;
  s.players[p].cards.push({ uid: uid(), type: t, at: Date.now() });
  return t;
}

/** consumes a Shield if present; returns true when the attack is blocked */
function shieldBlocks(s: GameState, target: PlayerId): boolean {
  const i = s.players[target].cards.findIndex((c) => c.type === 'shield');
  if (i < 0) return false;
  s.players[target].cards.splice(i, 1);
  return true;
}

export function bothSpicy(s: GameState) { return s.prefs.gabriel.spicy && s.prefs.tatiana.spicy; }

/** romance level used for the couple: always the gentler of the two */
export function sharedIntensity(s: GameState): Intensity {
  const a = INTENSITY_ORDER.indexOf(s.prefs.gabriel.romance);
  const b = INTENSITY_ORDER.indexOf(s.prefs.tatiana.romance);
  let lvl = INTENSITY_ORDER[Math.min(a, b)];
  if (!bothSpicy(s) && lvl !== 'sweet') lvl = 'sweet';
  return lvl;
}

export function intensityAllowed(s: GameState, i?: Intensity) {
  if (!i) return true;
  return INTENSITY_ORDER.indexOf(i) <= INTENSITY_ORDER.indexOf(sharedIntensity(s));
}

export function categoryAllowed(s: GameState, c: CategoryId) {
  return !s.prefs.gabriel.avoid.includes(c) && !s.prefs.tatiana.avoid.includes(c);
}

export function leader(s: GameState): PlayerId | null {
  const g = s.players.gabriel.points, t = s.players.tatiana.points;
  if (g === t) return null;
  return g > t ? 'gabriel' : 'tatiana';
}

/* ============================== CHALLENGE RESULTS ============================== */
export type Outcome = PlayerId | 'tie' | 'coop-win' | 'coop-fail';
export interface ResultSummary { lines: string[]; headline: string }

export function recordResult(challengeId: string, outcome: Outcome): ResultSummary {
  return commit((s) => {
    const c = challengeById(challengeId);
    if (!c) return { headline: 'Prueba no encontrada', lines: [] };
    const finale = s.episode === 8 ? 2 : 1;
    const lines: string[] = [];
    const delta: HistoryEntry['delta'] = {};
    const compChill = s.prefs.gabriel.competition === 'chill' || s.prefs.tatiana.competition === 'chill';
    const consolation = compChill ? 0.6 : 0.4;

    const pay = (p: PlayerId, pts: number, coins: number, why: string) => {
      addPoints(s, p, pts); addCoins(s, p, coins);
      delta[p] = { points: (delta[p]?.points || 0) + Math.round(pts), coins: (delta[p]?.coins || 0) + Math.round(coins) };
      lines.push(`${PLAYER_NAME[p]}: +${Math.round(pts)} pts · +${Math.round(coins)} monedas${why ? ' · ' + why : ''}`);
    };
    const bonus = (p: PlayerId) => {
      const b = c.reward.bonus;
      if (!b) return;
      if (b === 'card') { const t = giveCard(s, p); lines.push(`${PLAYER_NAME[p]} recibe la carta ${CARDS[t].name}`); }
      else if (b === 'key') { s.players[p].keys += 1; lines.push(`${PLAYER_NAME[p]} recibe una Llave Legendaria`); }
      else { const tier = b.replace('box-', '') as BoxTier; s.players[p].freeBoxes[tier] = (s.players[p].freeBoxes[tier] || 0) + 1; lines.push(`${PLAYER_NAME[p]} gana una ${boxByTier(tier).name} gratis (ábrela en Mystery Boxes)`); }
    };

    for (const p of PLAYERS) {
      const st = s.players[p].stats;
      if (!st.categories.includes(c.category)) st.categories.push(c.category);
    }

    let headline = '';
    if (outcome === 'gabriel' || outcome === 'tatiana') {
      const w = outcome, l = rival(w);
      const W = s.players[w], L = s.players[l];
      let mult = finale * W.multiplier;
      const why: string[] = [];
      if (W.doubleArmed) { mult *= 2; why.push('Double Trouble'); }
      if (W.multiplier > 1) why.push(`x${W.multiplier}`);
      if (finale > 1) why.push('Gran Final x2');
      let coins = c.reward.coins * mult;
      const streakBonus = Math.min(W.streak, 4) * 5;
      if (streakBonus) { coins += streakBonus; why.push(`racha +${streakBonus}`); }
      // catch-up: the trailing player earns more coins when winning
      if (W.points + 30 < L.points) { coins *= 1.5; why.push('bonus remontada'); }
      if (W.lossStreak >= 3) W.stats.comeback += 1;
      pay(w, c.reward.points * mult, coins, why.join(' · '));
      pay(l, 0, c.reward.coins * consolation * L.multiplier, 'consolación');
      bonus(w);
      W.wins += 1; W.streak += 1; W.bestStreak = Math.max(W.bestStreak, W.streak); W.lossStreak = 0;
      L.losses += 1; L.lossStreak += 1; L.streak = 0;
      if (challengeId === 'h-breakfast' && w === 'tatiana') { W.stats.breakfast += 1; }
      headline = `Gana ${PLAYER_NAME[w]}`;
    } else if (outcome === 'tie') {
      for (const p of PLAYERS) pay(p, c.reward.points * 0.6 * finale * s.players[p].multiplier, c.reward.coins * 0.6 * s.players[p].multiplier, 'empate');
      headline = 'Empate';
    } else if (outcome === 'coop-win') {
      for (const p of PLAYERS) { pay(p, c.reward.points * finale * s.players[p].multiplier, c.reward.coins * s.players[p].multiplier, 'equipo'); bonus(p); s.players[p].stats.coopWins += 1; }
      headline = '¡Superado en equipo!';
    } else {
      for (const p of PLAYERS) pay(p, 0, c.reward.coins * consolation, 'consolación');
      headline = 'No superado... esta vez';
    }
    if (challengeId === 'h-breakfast') { s.firstMissionDone = true; if (outcome !== 'tatiana') s.players.tatiana.stats.breakfast += 1; }

    // one-shot modifiers are spent on the next recorded challenge
    for (const p of PLAYERS) { s.players[p].doubleArmed = false; s.players[p].multiplier = 1; }
    s.completed[challengeId] = (s.completed[challengeId] || 0) + 1;
    log(s, { kind: 'result', challengeId, winner: outcome, delta, text: `${c.name} — ${headline}` });
    return { headline, lines };
  });
}

export function skipChallenge(challengeId: string) {
  commit((s) => {
    const c = challengeById(challengeId);
    log(s, { kind: 'skip', challengeId, text: `Prueba pasada sin penalización: ${c?.name ?? challengeId}` });
  });
}

/* ============================== BOXES ============================== */
export interface BoxEntryView { prizeId: string; weight: number; chance: number; eligible: boolean; reason?: string }

export function boxEntries(s: GameState, p: PlayerId, tier: BoxTier): BoxEntryView[] {
  const box = boxByTier(tier);
  const style = s.prefs[p].rewardStyle;
  const rows = box.entries.map((e) => {
    const pr = prizeById(e.prizeId)!;
    let w = e.weight;
    let reason: string | undefined;
    if (pr.unique && s.drawnUnique.includes(pr.id)) { w = 0; reason = 'Ya entregado (único)'; }
    if (PRIZE_FOR[pr.id] && PRIZE_FOR[pr.id] !== p) { w = 0; reason = `Solo para ${PLAYER_NAME[PRIZE_FOR[pr.id]]}`; }
    if (pr.kind === 'daring' && !bothSpicy(s)) { w = 0; reason = 'Picante desactivado'; }
    if (pr.intensity && !intensityAllowed(s, pr.intensity) && w > 0) { w = 0; reason = 'Fuera de los límites'; }
    if (w > 0 && style === 'romantic' && (pr.kind === 'romantic' || pr.kind === 'daring')) w *= 1.5;
    if (w > 0 && style === 'fun') { if (pr.kind === 'fun' || pr.kind === 'practical') w *= 1.5; if (pr.kind === 'romantic') w *= 0.7; }
    return { prizeId: pr.id, weight: w, chance: 0, eligible: w > 0, reason };
  });
  const total = rows.reduce((a, r) => a + r.weight, 0) || 1;
  rows.forEach((r) => (r.chance = r.weight / total));
  return rows;
}

export function canOpenBox(s: GameState, p: PlayerId, tier: BoxTier): { ok: boolean; why?: string; free?: boolean } {
  const box = boxByTier(tier);
  if (s.episode < box.unlockEpisode) return { ok: false, why: `Se desbloquea en el Episodio 0${box.unlockEpisode}` };
  if ((s.players[p].freeBoxes[tier] || 0) > 0) return { ok: true, free: true };
  if (tier === 'legendary') return s.players[p].keys > 0 ? { ok: true } : { ok: false, why: 'Necesitas una Llave Legendaria' };
  if (s.players[p].coins < box.cost) return { ok: false, why: `Necesitas ${box.cost} monedas` };
  return { ok: true };
}

function applyPrize(s: GameState, p: PlayerId, prizeId: string, source: PrizeRecord['box']): PrizeRecord {
  const pr = prizeById(prizeId)!;
  const eff = pr.effect || {};
  const extra: string[] = [];
  if (eff.coins) addCoins(s, p, eff.coins);
  if (eff.points) addPoints(s, p, eff.points);
  if (eff.key) s.players[p].keys += eff.key;
  if (eff.card) {
    const n = PRIZE_CARD_COUNT[pr.id] || 1;
    for (let i = 0; i < n; i++) extra.push(CARDS[giveCard(s, p, eff.card)].name);
  }
  const sp = PRIZE_SPECIAL[pr.id];
  if (sp === 'tax10') { const r = rival(p); const n = Math.min(10, s.players[r].coins); addCoins(s, r, -n); addCoins(s, p, n); }
  if (sp === 'rival10') addCoins(s, rival(p), 10);
  if (sp === 'combo') extra.push(CARDS[giveCard(s, p, 'lucky')].name);
  if (pr.unique) s.drawnUnique.push(pr.id);
  const text = (s.host.prizeOverrides[pr.id] || pr.text) + (extra.length ? `\n\nCartas recibidas: ${extra.join(', ')}.` : '');
  const rec: PrizeRecord = { uid: uid(), prizeId: pr.id, box: source, player: p, at: Date.now(), title: pr.title, text };
  s.prizes.unshift(rec);
  return rec;
}

function drawFromBox(s: GameState, p: PlayerId, tier: BoxTier): PrizeRecord {
  const entries = boxEntries(s, p, tier).filter((e) => e.eligible);
  const chosen = weightedPick(entries);
  const prizeId = chosen ? chosen.prizeId : (tier === 'legendary' ? 'l-jackpot' : `${tier[0]}-coins`);
  const rec = applyPrize(s, p, prizeId, tier);
  const st = s.players[p].stats;
  st.boxes += 1;
  if (tier === 'gold') st.gold += 1;
  if (tier === 'diamond') st.diamond += 1;
  if (tier === 'legendary') st.legend += 1;
  s.boxesOpened[p][tier] = (s.boxesOpened[p][tier] || 0) + 1;
  log(s, { kind: 'box', player: p, text: `${PLAYER_NAME[p]} abre una ${boxByTier(tier).name}: ${rec.title}` });
  return rec;
}

export function openBox(p: PlayerId, tier: BoxTier): PrizeRecord | { error: string } {
  const check = canOpenBox(state, p, tier);
  if (!check.ok) return { error: check.why || 'No disponible' };
  return commit((s) => {
    if (check.free) s.players[p].freeBoxes[tier]! -= 1;
    else if (tier === 'legendary') s.players[p].keys -= 1;
    else addCoins(s, p, -boxByTier(tier).cost);
    return drawFromBox(s, p, tier);
  });
}

export function redeemPrize(recUid: string, redeemed: boolean) {
  commit((s) => { const r = s.prizes.find((x) => x.uid === recUid); if (r) r.redeemed = redeemed; });
}

/* ============================== ROULETTE ============================== */
export interface SpinResult { index: number; segment: Segment; text: string; needsDouble: boolean; prize?: PrizeRecord }

export function wheelSegments(s: GameState, wheelId: string): Segment[] {
  const w = WHEELS.find((x) => x.id === wheelId)!;
  const spicy = bothSpicy(s);
  return w.segments.map((seg) => (seg.spicy && !spicy ? { ...seg, label: 'Cumplido', kind: 'prize' as const, text: 'El rival te dice un cumplido de película, mirando a los ojos.', spicy: false } : seg));
}

export function spinWheel(p: PlayerId, wheelId: string): SpinResult | { error: string } {
  const w = WHEELS.find((x) => x.id === wheelId)!;
  if (state.episode < w.unlockEpisode) return { error: `Se desbloquea en el Episodio 0${w.unlockEpisode}` };
  if (state.players[p].coins < w.cost) return { error: `Necesitas ${w.cost} monedas` };
  return commit((s) => {
    addCoins(s, p, -w.cost);
    const segs = wheelSegments(s, wheelId);
    const chosen = weightedPick(segs.map((seg, i) => ({ seg, i, weight: seg.weight })))!;
    const seg = chosen.seg;
    const r = rival(p);
    let text = '';
    let prize: PrizeRecord | undefined;
    switch (seg.kind) {
      case 'coins': addCoins(s, p, seg.value!); text = `+${seg.value} monedas para ${PLAYER_NAME[p]}.`; break;
      case 'nothing': addCoins(s, p, seg.value || 0); text = `¡Casi! Te llevas +${seg.value} monedas de consuelo.`; break;
      case 'double': text = 'DOBLE O NADA. Elige cuánto te juegas.'; break;
      case 'steal': {
        if (shieldBlocks(s, r)) { text = `${PLAYER_NAME[r]} tenía un Shield. Robo bloqueado (Shield consumido).`; break; }
        const n = Math.min(seg.value!, s.players[r].coins); addCoins(s, r, -n); addCoins(s, p, n);
        if (n > 0) s.players[p].stats.thefts += 1;
        text = `Robas ${n} monedas a ${PLAYER_NAME[r]}.`; break;
      }
      case 'swap': {
        const a = s.players[p].cards, b = s.players[r].cards;
        if (!a.length || !b.length) { addCoins(s, p, 20); text = 'No hay cartas que intercambiar: +20 monedas.'; break; }
        if (shieldBlocks(s, r)) { text = `Swap bloqueado por el Shield de ${PLAYER_NAME[r]}.`; break; }
        const i = randInt(a.length), j = randInt(b.length);
        const ca = a.splice(i, 1)[0], cb = b.splice(j, 1)[0];
        a.push(cb); b.push(ca);
        text = `Intercambio: das ${CARDS[ca.type].name} y recibes ${CARDS[cb.type].name}.`; break;
      }
      case 'card': { const names = []; for (let i = 0; i < (seg.value || 1); i++) names.push(CARDS[giveCard(s, p)].name); text = `Recibes: ${names.join(', ')}.`; break; }
      case 'box': s.players[p].freeBoxes[seg.box!] = (s.players[p].freeBoxes[seg.box!] || 0) + 1; text = `¡Una ${boxByTier(seg.box!).name} gratis! Ábrela en Mystery Boxes.`; break;
      case 'revenge': giveCard(s, p, 'revenge'); text = 'Recibes una carta Revenge.'; break;
      case 'multiplier': s.players[p].multiplier = Math.max(s.players[p].multiplier, seg.value!); text = `Multiplicador x${seg.value} para tu próxima prueba.`; break;
      case 'key': s.players[p].keys += 1; text = '¡LLAVE LEGENDARIA!'; break;
      case 'prize': {
        prize = { uid: uid(), prizeId: 'roulette-' + seg.id, box: 'roulette', player: p, at: Date.now(), title: seg.label, text: seg.text! };
        s.prizes.unshift(prize); text = seg.text!; break;
      }
      case 'legendary': {
        const rec = drawFromBox(s, p, 'legendary'); prize = rec; text = `PREMIO LEGENDARIO: ${rec.title}.`; break;
      }
      case 'event': text = runEvent(s, pick(EVENTS).id); break;
    }
    s.players[p].stats.spins += 1;
    s.roulettesSpun[wheelId] = (s.roulettesSpun[wheelId] || 0) + 1;
    log(s, { kind: 'roulette', player: p, text: `${PLAYER_NAME[p]} gira la ${w.name}: ${seg.label}` });
    return { index: chosen.i, segment: seg, text, needsDouble: seg.kind === 'double', prize };
  });
}

function runEvent(s: GameState, id: EventEffect): string {
  const ev = EVENTS.find((e) => e.id === id)!;
  switch (id) {
    case 'rain': PLAYERS.forEach((p) => addCoins(s, p, 20)); break;
    case 'underdog': { const l = leader(s); if (l) addPoints(s, rival(l), 15); else PLAYERS.forEach((p) => addPoints(s, p, 5)); break; }
    case 'happyhour': PLAYERS.forEach((p) => (s.players[p].multiplier = Math.max(2, s.players[p].multiplier))); break;
    case 'cardswap': {
      const g = s.players.gabriel.cards, t = s.players.tatiana.cards;
      const cg = g.length ? g.splice(randInt(g.length), 1)[0] : null;
      const ct = t.length ? t.splice(randInt(t.length), 1)[0] : null;
      if (cg) t.push(cg); if (ct) g.push(ct);
      break;
    }
    case 'leadertax': { const l = leader(s); if (l) { const n = Math.min(20, s.players[l].coins); addCoins(s, l, -n); addCoins(s, rival(l), n); } break; }
    case 'cuddle': PLAYERS.forEach((p) => addCoins(s, p, 10)); break;
    case 'cardsall': PLAYERS.forEach((p) => giveCard(s, p)); break;
    case 'laugh': break;
  }
  log(s, { kind: 'event', text: `Evento sorpresa: ${ev.title}` });
  return `EVENTO · ${ev.title}: ${ev.text}`;
}

export function doubleOrNothing(p: PlayerId, bet: number): { win: boolean; amount: number } {
  return commit((s) => {
    const amount = Math.max(1, Math.min(Math.floor(bet), s.players[p].coins));
    const win = rand() < 0.5;
    addCoins(s, p, win ? amount : -amount);
    if (win) s.players[p].stats.allin += 1;
    log(s, { kind: 'roulette', player: p, text: `${PLAYER_NAME[p]} juega Doble o Nada (${amount}): ${win ? 'GANA' : 'pierde'}` });
    return { win, amount };
  });
}

/* ============================== CARDS ============================== */
function lastDuel(s: GameState) {
  return s.history.find((h) => h.kind === 'result' && (h.winner === 'gabriel' || h.winner === 'tatiana'));
}

export function cardUsable(s: GameState, p: PlayerId, type: CardType): { ok: boolean; why?: string } {
  const r = rival(p);
  if (type === 'shield') return { ok: false, why: 'Es pasiva: se activa sola cuando te atacan.' };
  if (type === 'double' && s.players[p].doubleArmed) return { ok: false, why: 'Ya tienes un Double Trouble activo.' };
  if (type === 'swap' && (!s.players[r].cards.length || s.players[p].cards.length < 2)) return { ok: false, why: 'Hace falta que ambos tengáis cartas (además de esta).' };
  if (type === 'revenge' || type === 'second') {
    const d = lastDuel(s);
    if (!d || d.winner !== r) return { ok: false, why: `Solo si ${PLAYER_NAME[r]} ganó el último duelo.` };
    if (s.history.some((h) => h.kind === 'card' && h.challengeId === d.uid && h.player === p)) return { ok: false, why: 'Ya usaste una carta sobre ese duelo.' };
  }
  return { ok: true };
}

export function useCard(p: PlayerId, cardUid: string): { text: string; prize?: PrizeRecord; mission?: string } | { error: string } {
  const card = state.players[p].cards.find((c) => c.uid === cardUid);
  if (!card) return { error: 'Carta no encontrada' };
  const check = cardUsable(state, p, card.type);
  if (!check.ok) return { error: check.why! };
  return commit((s) => {
    const me = s.players[p];
    const r = rival(p);
    me.cards = me.cards.filter((c) => c.uid !== cardUid);
    me.stats.cardsUsed += 1;
    let text = '';
    let prize: PrizeRecord | undefined;
    let mission: string | undefined;
    let ref: string | undefined;
    switch (card.type) {
      case 'double': me.doubleArmed = true; text = 'Double Trouble activado: tu próxima prueba ganada vale el doble.'; break;
      case 'lucky': addCoins(s, p, 40); text = '+40 monedas.'; break;
      case 'steal': {
        if (shieldBlocks(s, r)) { text = `¡Bloqueado! ${PLAYER_NAME[r]} tenía un Shield.`; break; }
        const n = Math.min(30, s.players[r].coins); addCoins(s, r, -n); addCoins(s, p, n); if (n) me.stats.thefts += 1;
        text = `Robas ${n} monedas a ${PLAYER_NAME[r]}.`; break;
      }
      case 'revenge': {
        const d = lastDuel(s)!; ref = d.uid;
        if (shieldBlocks(s, r)) { text = `¡Bloqueado por el Shield de ${PLAYER_NAME[r]}!`; break; }
        const gained = d.delta?.[r]?.points || 0; const n = Math.min(Math.floor(gained / 2), s.players[r].points);
        addPoints(s, r, -n); addPoints(s, p, n); text = `Venganza: recuperas ${n} puntos de ${PLAYER_NAME[r]}.`; break;
      }
      case 'second': {
        const d = lastDuel(s)!; ref = d.uid;
        const gp = Math.round((d.delta?.[r]?.points || 0) * 0.6), gc = Math.round((d.delta?.[r]?.coins || 0) * 0.6);
        addPoints(s, p, gp); addCoins(s, p, gc); text = `Segunda oportunidad: +${gp} puntos y +${gc} monedas.`; break;
      }
      case 'swap': {
        if (shieldBlocks(s, r)) { text = `Swap bloqueado por el Shield de ${PLAYER_NAME[r]}.`; break; }
        const a = me.cards, b = s.players[r].cards;
        const ca = a.splice(randInt(a.length), 1)[0], cb = b.splice(randInt(b.length), 1)[0];
        a.push(cb); b.push(ca); text = `Das ${CARDS[ca.type].name} y recibes ${CARDS[cb.type].name}.`; break;
      }
      case 'wild': addCoins(s, p, 15); text = '+15 monedas. Tú eliges la próxima prueba y su categoría (o pasas una con recompensa).'; break;
      case 'mystery': prize = drawFromBox(s, p, 'bronze'); text = `Caja Bronce gratis: ${prize.title}.`; break;
      case 'mission': {
        const used = new Set(me.missions.map((m) => m.text));
        const pool = MISSIONS.map((m) => m.replace('{rival}', PLAYER_NAME[r])).filter((m) => !used.has(m));
        mission = pick(pool.length ? pool : MISSIONS.map((m) => m.replace('{rival}', PLAYER_NAME[r])));
        me.missions.push({ uid: uid(), text: mission, at: Date.now() });
        text = 'Misión secreta recibida. Solo tú puedes verla en tu inventario.'; break;
      }
      case 'shield': break;
    }
    log(s, { kind: 'card', player: p, challengeId: ref, text: `${PLAYER_NAME[p]} usa ${CARDS[card.type].name}` + (card.type === 'mission' ? '' : `: ${text}`) });
    return { text, prize, mission };
  });
}

export function completeMission(p: PlayerId, missionUid: string) {
  commit((s) => {
    const m = s.players[p].missions.find((x) => x.uid === missionUid);
    if (!m || m.done) return;
    m.done = true; addCoins(s, p, 40); addPoints(s, p, 15); s.players[p].stats.missionsDone += 1;
    log(s, { kind: 'mission', player: p, text: `${PLAYER_NAME[p]} completa una misión secreta: "${m.text}"` });
  });
  toast('Misión cumplida', '+40 monedas · +15 puntos', 'gold');
}

/* ============================== ENVELOPES ============================== */
export function trailingPlayer(s: GameState): PlayerId | null {
  for (const p of PLAYERS) if (s.players[p].lossStreak >= 3) return p;
  const l = leader(s);
  if (l && s.players[l].points - s.players[rival(l)].points >= 40) return rival(l);
  return null;
}

export function envelopeAvailable(s: GameState, id: string): boolean {
  if (s.envelopesForced.includes(id)) return true;
  const results = s.history.filter((h) => h.kind === 'result').length;
  switch (id) {
    case 'env-first': return true;
    case 'env-warmup': return s.episode >= 2;
    case 'env-five': return results >= 5;
    case 'env-comeback': return trailingPlayer(s) !== null;
    case 'env-gold': return PLAYERS.some((p) => s.players[p].stats.gold > 0);
    case 'env-party': return s.episode >= 5;
    case 'env-midnight': return s.episode >= 6;
    case 'env-cinema': return s.episode >= 7;
    case 'env-final': return s.episode >= 8;
    case 'env-closing': return PLAYERS.every((p) => s.players[p].stats.legend > 0);
    default: return false;
  }
}

export function openEnvelope(id: string): { message: string; reward: string } | { error: string } {
  if (state.envelopesOpened.includes(id)) return { error: 'Ya abierto' };
  if (!envelopeAvailable(state, id)) return { error: 'Todavía bloqueado' };
  return commit((s) => {
    const env = ENVELOPES.find((e) => e.id === id)!;
    s.envelopesOpened.push(id);
    let reward = env.reward;
    switch (id) {
      case 'env-first': addCoins(s, 'tatiana', 20); break;
      case 'env-warmup': PLAYERS.forEach((p) => addCoins(s, p, 15)); break;
      case 'env-five': { const names = PLAYERS.map((p) => `${PLAYER_NAME[p]}: ${CARDS[giveCard(s, p)].name}`); reward = names.join(' · '); break; }
      case 'env-comeback': { const t = trailingPlayer(s) || (leader(s) ? rival(leader(s)!) : 'tatiana'); addCoins(s, t, 40); giveCard(s, t, 'revenge'); reward = `${PLAYER_NAME[t]}: +40 monedas y una carta Revenge`; break; }
      case 'env-gold': PLAYERS.forEach((p) => addCoins(s, p, 20)); break;
      case 'env-party': PLAYERS.forEach((p) => addCoins(s, p, 25)); break;
      case 'env-midnight': { const names = PLAYERS.map((p) => `${PLAYER_NAME[p]}: ${CARDS[giveCard(s, p)].name}`); reward = names.join(' · '); break; }
      case 'env-cinema': PLAYERS.forEach((p) => addCoins(s, p, 40)); break;
      case 'env-final': PLAYERS.forEach((p) => (s.players[p].keys += 1)); break;
      case 'env-gabriel': addCoins(s, 'tatiana', 30); break;
    }
    log(s, { kind: 'envelope', text: `Sobre abierto: ${env.name}` });
    return { message: s.host.envelopeOverrides[id] || env.message, reward };
  });
}

/* ============================== EPISODES ============================== */
export function setEpisode(n: number) {
  commit((s) => {
    s.episode = Math.max(1, Math.min(8, n));
    if (!s.episodeStartedAt[s.episode]) s.episodeStartedAt[s.episode] = Date.now();
    log(s, { kind: 'episode', text: `Comienza el Episodio 0${s.episode}` });
  });
}

/* ============================== PREFS / INTRO / SETTINGS ============================== */
export function updatePrefs(p: PlayerId, patch: Partial<Prefs>) { commit((s) => { s.prefs[p] = { ...s.prefs[p], ...patch }; }); }
export function setIntroStep(n: number) { commit((s) => { s.introStep = n; }); }
export function finishIntro() { commit((s) => { s.introDone = true; s.introStep = 99; }); }
export function replayIntro() { commit((s) => { s.introDone = false; s.introStep = 0; }); }
export function setShared(v: boolean) { commit((s) => { s.sharedScreen = v; }); }

/* ============================== DECKS ============================== */
export function drawDeck(deckId: string): { index: number; text: string; remaining: number } | null {
  const deck = DECKS.find((d) => d.id === deckId);
  if (!deck) return null;
  return commit((s) => {
    const allowed = deck.cards.map((c, i) => ({ c, i })).filter(({ c }) => intensityAllowed(s, c.intensity)).map(({ i }) => i);
    if (!allowed.length) return null;
    let used = (s.decks[deckId] || []).filter((i) => allowed.includes(i));
    let pool = allowed.filter((i) => !used.includes(i));
    if (!pool.length) { used = []; pool = allowed; }
    const index = pick(pool);
    s.decks[deckId] = [...used, index];
    return { index, text: deck.cards[index].text, remaining: pool.length - 1 };
  });
}

/* ============================== BINGO ============================== */
export function newBingo(poolId: string, p: PlayerId) {
  commit((s) => {
    const cells = shuffle(BINGO_POOLS[poolId].cells).slice(0, 16);
    s.bingo[poolId] = { ...(s.bingo[poolId] || {}), [p]: { cells, marked: cells.map(() => false) } };
  });
}
export function toggleBingo(poolId: string, p: PlayerId, i: number) {
  commit((s) => { const b = s.bingo[poolId]?.[p]; if (b && !b.claimed) b.marked[i] = !b.marked[i]; });
}
export function bingoHasLine(marked: boolean[]): boolean {
  const n = 4;
  for (let r = 0; r < n; r++) if ([0, 1, 2, 3].every((c) => marked[r * n + c])) return true;
  for (let c = 0; c < n; c++) if ([0, 1, 2, 3].every((r) => marked[r * n + c])) return true;
  if ([0, 5, 10, 15].every((i) => marked[i])) return true;
  if ([3, 6, 9, 12].every((i) => marked[i])) return true;
  return false;
}
export function claimBingo(poolId: string, p: PlayerId): boolean {
  const b = state.bingo[poolId]?.[p];
  if (!b || b.claimed || !bingoHasLine(b.marked)) return false;
  commit((s) => {
    s.bingo[poolId]![p]!.claimed = true;
    addPoints(s, p, 15); addCoins(s, p, 30); s.players[p].stats.bingos += 1;
    log(s, { kind: 'result', winner: p, delta: { [p]: { points: 15, coins: 30 } }, text: `${PLAYER_NAME[p]} canta ${BINGO_POOLS[poolId].shout} en el Bingo ${BINGO_POOLS[poolId].name}` });
  });
  return true;
}

/* ============================== PREDICTIONS ============================== */
export function addPrediction(p: PlayerId, text: string, show: string) {
  commit((s) => { s.predictions.unshift({ uid: uid(), player: p, text, status: 'locked', at: Date.now(), show }); });
}
export function resolvePrediction(id: string, hit: boolean) {
  commit((s) => {
    const pr = s.predictions.find((x) => x.uid === id);
    if (!pr || pr.status !== 'locked') return;
    pr.status = hit ? 'hit' : 'miss';
    if (hit) { addPoints(s, pr.player, 3); addCoins(s, pr.player, 10); s.players[pr.player].stats.predictionsHit += 1; }
    log(s, { kind: 'result', player: pr.player, text: `Predicción de ${PLAYER_NAME[pr.player]} ${hit ? 'ACERTADA (+3 pts, +10 monedas)' : 'fallada'}: "${pr.text}"` });
  });
}

/* ============================== SERIES (best of N) ============================== */
export function newSeries(name: string, bestOf: number) {
  commit((s) => { s.series.unshift({ uid: uid(), name, bestOf, wins: { gabriel: 0, tatiana: 0 }, at: Date.now() }); });
}
export function seriesWin(id: string, p: PlayerId) {
  commit((s) => {
    const se = s.series.find((x) => x.uid === id);
    if (!se || se.done) return;
    se.wins[p] += 1;
    const need = Math.floor(se.bestOf / 2) + 1;
    if (se.wins[p] >= need) {
      se.done = p; addCoins(s, p, 15);
      log(s, { kind: 'tournament', player: p, text: `${PLAYER_NAME[p]} gana la serie "${se.name}" (${se.wins.gabriel}-${se.wins.tatiana}) · +15 monedas` });
    }
  });
}
export function deleteSeries(id: string) { commit((s) => { s.series = s.series.filter((x) => x.uid !== id); }); }

/* ============================== MOVIE LOTTERY ============================== */
export function lotteryBid(itemId: string, bids: Record<PlayerId, number>): PlayerId | { error: string } {
  for (const p of PLAYERS) if (bids[p] < 0 || bids[p] > state.players[p].coins) return { error: `${PLAYER_NAME[p]} no tiene tantas monedas` };
  return commit((s) => {
    let w: PlayerId;
    if (bids.gabriel === bids.tatiana) w = rand() < 0.5 ? 'gabriel' : 'tatiana';
    else w = bids.gabriel > bids.tatiana ? 'gabriel' : 'tatiana';
    addCoins(s, w, -bids[w]);
    s.lottery[itemId] = { id: itemId, winner: w, bids };
    log(s, { kind: 'lottery', player: w, text: `Movie Lottery · ${PLAYER_NAME[w]} gana "${itemId}" pujando ${bids[w]}${bids.gabriel === bids.tatiana ? ' (empate decidido al azar)' : ''}` });
    return w;
  });
}
export function lotteryGoldenSeat(itemId: string, p: PlayerId): boolean {
  const rec = state.prizes.find((r) => r.prizeId === 's-moviepick' && r.player === p && !r.redeemed);
  if (!rec) return false;
  commit((s) => {
    s.prizes.find((r) => r.uid === rec.uid)!.redeemed = true;
    s.lottery[itemId] = { id: itemId, winner: p };
    log(s, { kind: 'lottery', player: p, text: `Movie Lottery · ${PLAYER_NAME[p]} usa La Butaca de Oro para "${itemId}"` });
  });
  return true;
}
export function lotteryChoice(itemId: string, choice: string) { commit((s) => { if (s.lottery[itemId]) s.lottery[itemId].choice = choice; }); }
export function lotteryReset(itemId: string) { commit((s) => { delete s.lottery[itemId]; }); }

/* ============================== HOST ============================== */
export function setHostPin(pin: string) { commit((s) => { s.host.pin = hashPin(pin); }); }
export function checkHostPin(pin: string) { return state.host.pin === hashPin(pin); }
export function setPrizeOverride(id: string, text: string) { commit((s) => { if (text.trim()) s.host.prizeOverrides[id] = text; else delete s.host.prizeOverrides[id]; }); }
export function setEnvelopeOverride(id: string, text: string) { commit((s) => { if (text.trim()) s.host.envelopeOverrides[id] = text; else delete s.host.envelopeOverrides[id]; }); }
export function toggleChecklist(id: string) { commit((s) => { s.host.checklist[id] = !s.host.checklist[id]; }); }
export function setHostNotes(t: string) { commit((s) => { s.host.notes = t; }); }
export function forceEnvelope(id: string) { commit((s) => { if (!s.envelopesForced.includes(id)) s.envelopesForced.push(id); }); }
export function adjust(p: PlayerId, coins: number, points: number, reason: string) {
  commit((s) => {
    addCoins(s, p, coins); addPoints(s, p, points);
    log(s, { kind: 'adjust', player: p, delta: { [p]: { coins, points } }, text: `Ajuste del presentador para ${PLAYER_NAME[p]}: ${points >= 0 ? '+' : ''}${points} pts, ${coins >= 0 ? '+' : ''}${coins} monedas${reason ? ' · ' + reason : ''}` });
  });
}
export function hostGiveCard(p: PlayerId, type: CardType) { commit((s) => { giveCard(s, p, type); log(s, { kind: 'adjust', player: p, text: `El presentador entrega ${CARDS[type].name} a ${PLAYER_NAME[p]}`, secret: true }); }); }
export function hostGiveKey(p: PlayerId) { commit((s) => { s.players[p].keys += 1; log(s, { kind: 'adjust', player: p, text: `El presentador entrega una Llave Legendaria a ${PLAYER_NAME[p]}` }); }); }
export function hostGiveBox(p: PlayerId, tier: BoxTier) { commit((s) => { s.players[p].freeBoxes[tier] = (s.players[p].freeBoxes[tier] || 0) + 1; log(s, { kind: 'adjust', player: p, text: `El presentador regala una ${boxByTier(tier).name} a ${PLAYER_NAME[p]}` }); }); }

export function resetGame(keepHost: boolean) {
  const host = state.host;
  state = initialState();
  if (keepHost) state.host = { ...host };
  persist();
  listeners.forEach((l) => l());
}

export function exportSave(): string { return JSON.stringify(state); }
export function importSave(json: string): boolean {
  try { state = migrate(JSON.parse(json)); persist(); listeners.forEach((l) => l()); return true; } catch { return false; }
}

/* ============================== AUTOMATIONS (achievements) ============================== */
function automations(s: GameState) {
  for (const p of PLAYERS) {
    const P = s.players[p], st = P.stats;
    const conds: Record<string, boolean> = {
      'first-win': P.wins >= 1, streak3: P.bestStreak >= 3, streak5: P.bestStreak >= 5, wins10: P.wins >= 10, comeback: st.comeback > 0,
      box1: st.boxes >= 1, box5: st.boxes >= 5, gold: st.gold > 0, diamond: st.diamond > 0, legend: st.legend > 0, spin1: st.spins >= 1,
      spin5: st.spins >= 5, allin: st.allin > 0, thief: st.thefts > 0, cards3: st.cardsUsed >= 3, coop5: st.coopWins >= 5,
      explorer: st.categories.length >= 6, bingo: st.bingos > 0, oracle: st.predictionsHit >= 3, mission: st.missionsDone > 0, breakfast: st.breakfast > 0,
    };
    for (const a of ACHIEVEMENTS) {
      const key = `${a.id}:${p}`;
      if (s.achievements[key] || !conds[a.id]) continue;
      s.achievements[key] = { player: p, at: Date.now() };
      const parts: string[] = [];
      if (a.reward.coins) { addCoins(s, p, a.reward.coins); parts.push(`+${a.reward.coins} monedas`); }
      if (a.reward.key) { P.keys += a.reward.key; parts.push('Llave Legendaria'); }
      if (a.reward.card) parts.push(CARDS[giveCard(s, p)].name);
      log(s, { kind: 'achievement', player: p, text: `Logro de ${PLAYER_NAME[p]}: ${a.name} (${parts.join(', ')})` });
      toast(`Logro desbloqueado · ${PLAYER_NAME[p]}`, `${a.name} — ${parts.join(', ')}`, 'gold');
    }
  }
}

/* ============================== PURE HELPERS FOR UI ============================== */
export function availableEnvelopes(s: GameState) {
  return ENVELOPES.filter((e) => !s.envelopesOpened.includes(e.id) && envelopeAvailable(s, e.id));
}
export function prizeCatalogStats() {
  return BOXES.map((b) => {
    const total = b.entries.reduce((a, e) => a + e.weight, 0);
    return { box: b, rows: b.entries.map((e) => ({ prize: PRIZES.find((p) => p.id === e.prizeId)!, base: e.weight / total })) };
  });
}
