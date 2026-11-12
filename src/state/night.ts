/* =====================================================================
   NIGHT SHOW · an optional, self-contained late-night game.
   Its own scoreboard, saved under its own key. It never reads or writes the
   main game (homelottery.v1): no coins, prizes, envelopes, achievements or
   "completed" marks are touched, so the full-day show stays intact.
   ===================================================================== */
import { useSyncExternalStore } from 'react';
import { CHALLENGES, challengeById } from '../data/challenges';
import { EPISODES } from '../data/episodes';
import { DECKS } from '../data/decks';
import { INTENSITY_ORDER, PLAYERS, type CategoryId, type Challenge, type Intensity, type PlayerId } from '../types';
import { pick } from '../lib/random';

export const NIGHT_KEY = 'homelottery.night.v1';
export const NIGHT_WORLDS: CategoryId[] = ['home', 'couples', 'cards', 'party', 'movie', 'gaming'];
export type NightOutcome = PlayerId | 'tie' | 'coop' | 'fail' | 'skip';
export interface NightRound { id: string; outcome: NightOutcome; points: Record<PlayerId, number>; double: boolean; at: number }
export interface NightState {
  v: 1;
  points: Record<PlayerId, number>;
  rounds: NightRound[];
  worlds: CategoryId[];
  level: Intensity;
  keepTomorrow: boolean;
  current: string | null;
  lastCall: boolean;
  /** Only challenges playable with what any home has: no physical decks, dice, pong cups, consoles or a film playing. */
  noProps: boolean;
  /** Drinking overlay: an optional sip rule on top of every act. Never changes the scoring. */
  drinks: boolean;
  closed: boolean;
  startedAt: number;
}

export function initialNight(): NightState {
  return { v: 1, points: { gabriel: 0, tatiana: 0 }, rounds: [], worlds: ['home', 'couples', 'cards', 'party'], level: 'sweet', keepTomorrow: true, current: null, lastCall: false, noProps: true, drinks: false, closed: false, startedAt: Date.now() };
}

function load(): NightState {
  try {
    const raw = localStorage.getItem(NIGHT_KEY);
    if (raw) return { ...initialNight(), ...JSON.parse(raw) } as NightState;
  } catch { /* storage blocked or corrupt: start clean */ }
  return initialNight();
}

let night: NightState = typeof localStorage !== 'undefined' ? load() : initialNight();
const listeners = new Set<() => void>();
function commit(mut: (s: NightState) => void) {
  const next: NightState = JSON.parse(JSON.stringify(night));
  mut(next);
  night = next;
  try { localStorage.setItem(NIGHT_KEY, JSON.stringify(night)); } catch { /* storage full or blocked */ }
  listeners.forEach((l) => l());
}
export function getNight() { return night; }
export function useNight(): NightState {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => night);
}

/* ---------------- the pool ---------------- */
const TOMORROW = new Set(EPISODES.flatMap((e) => e.picks));
/** Needs something that has to be bought or switched on: physical decks, dice, pong set, console/PC, a film playing.
    The app's own decks ("Baraja \"Yo Nunca\" (Fiesta)") do not count: they live in the phone. */
const PROPS = /baraja española|baraja de póker|\bdados?\b|ping-pong|vasos por jugador|\bPS5\b|\bPC\b|League of Legends|Split Fiction|\bARK\b|Rocket League|Brawlhalla|película|serie en inglés|episodio cualquiera|^Crepúsculo$|Bingo de Noche de cine|Una partida de LoL/i;
export function needsProps(c: Challenge): boolean {
  if (c.category === 'gaming') return true;
  if (c.category === 'movie' && c.duration >= 60) return true; // played while watching
  return c.materials.some((m) => PROPS.test(m));
}
const levelOk = (lv: Intensity, i?: Intensity) => !i || INTENSITY_ORDER.indexOf(i) <= INTENSITY_ORDER.indexOf(lv);

/** Challenges that fit tonight's settings and have not been played tonight. */
export function nightPool(s: NightState = night): Challenge[] {
  const played = new Set(s.rounds.map((r) => r.id));
  return CHALLENGES.filter((c) => s.worlds.includes(c.category) && levelOk(s.level, c.intensity) && !(s.keepTomorrow && TOMORROW.has(c.id)) && !(s.noProps && needsProps(c)) && !played.has(c.id) && c.id !== s.current);
}
/** How many challenges each world offers with the current settings. */
export function worldCount(c: CategoryId, s: NightState = night) {
  return nightPool({ ...s, worlds: [c], rounds: s.rounds, current: null }).length;
}

/* ---------------- actions ---------------- */
export function toggleWorld(c: CategoryId) { commit((s) => { s.worlds = s.worlds.includes(c) ? s.worlds.filter((x) => x !== c) : [...s.worlds, c]; }); }
export function setLevel(l: Intensity) { commit((s) => { s.level = l; }); }
export function setKeepTomorrow(v: boolean) { commit((s) => { s.keepTomorrow = v; }); }
export function setLastCall(v: boolean) { commit((s) => { s.lastCall = v; }); }
export function setNoProps(v: boolean) { commit((s) => { s.noProps = v; }); }
export function setDrinks(v: boolean) { commit((s) => { s.drinks = v; }); }

/** The optional sip rule shown on every act in Modo copas. Water always counts; never mandatory. */
export function drinkRule(c: Challenge): string {
  return c.mode === 'coop'
    ? 'Si lo superáis, brindáis los dos. Si no, sorbo para los dos.'
    : 'Quien pierde da un sorbo. En empate, brindáis los dos.';
}

/** Draws the next act at random from the pool. Returns false when the pool is empty. */
export function nextAct(): boolean {
  const c = pick(nightPool());
  commit((s) => { s.current = c ? c.id : null; s.closed = false; });
  return !!c;
}
/** Swap the current act for another one, without scoring it. */
export function swapAct(): boolean {
  const cur = night.current;
  if (cur) commit((s) => { s.rounds.push({ id: cur, outcome: 'skip', points: { gabriel: 0, tatiana: 0 }, double: false, at: Date.now() }); });
  return nextAct();
}
export function playAct(id: string) { if (challengeById(id)) commit((s) => { s.current = id; s.closed = false; }); }

/** Scores the current act with the challenge's own points: the winner takes them all, a tie gives
    both 60 %, a team success gives both the full points, a team fail gives nothing. Last call doubles. */
export function scoreAct(outcome: Exclude<NightOutcome, 'skip'>) {
  const c = night.current ? challengeById(night.current) : undefined;
  if (!c) return;
  commit((s) => {
    const mult = s.lastCall ? 2 : 1;
    const pts: Record<PlayerId, number> = { gabriel: 0, tatiana: 0 };
    if (outcome === 'tie') PLAYERS.forEach((p) => (pts[p] = Math.round(c.reward.points * 0.6 * mult)));
    else if (outcome === 'coop') PLAYERS.forEach((p) => (pts[p] = c.reward.points * mult));
    else if (outcome !== 'fail') pts[outcome] = c.reward.points * mult;
    PLAYERS.forEach((p) => (s.points[p] += pts[p]));
    s.rounds.push({ id: c.id, outcome, points: pts, double: s.lastCall, at: Date.now() });
    s.current = null;
  });
}
export function closeShow() { commit((s) => { s.closed = true; s.current = null; }); }
export function resetNight() { const keep = night; commit((s) => { Object.assign(s, initialNight(), { worlds: keep.worlds, level: keep.level, keepTomorrow: keep.keepTomorrow, noProps: keep.noProps, drinks: keep.drinks }); }); }

/* ---------------- quick cards (public party/couples decks, never private ones) ---------------- */
export const QUICK_DECKS = DECKS.filter((d) => !d.private && (d.section === 'party' || d.section === 'couples'));
export function quickCard(deckId: string, level: Intensity = night.level): string | null {
  const d = QUICK_DECKS.find((x) => x.id === deckId);
  if (!d) return null;
  const cards = d.cards.filter((c) => levelOk(level, c.intensity));
  return cards.length ? pick(cards).text : null;
}

export function nightLeader(s: NightState = night): PlayerId | null {
  if (s.points.gabriel === s.points.tatiana) return null;
  return s.points.gabriel > s.points.tatiana ? 'gabriel' : 'tatiana';
}
