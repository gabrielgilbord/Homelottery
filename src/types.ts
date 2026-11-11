export type PlayerId = 'gabriel' | 'tatiana';
export const PLAYERS: PlayerId[] = ['gabriel', 'tatiana'];
export const PLAYER_NAME: Record<PlayerId, string> = { gabriel: 'Gabriel', tatiana: 'Tatiana' };
export const rival = (p: PlayerId): PlayerId => (p === 'gabriel' ? 'tatiana' : 'gabriel');

export type Intensity = 'sweet' | 'spicy' | 'legendary';
export const INTENSITY_ORDER: Intensity[] = ['sweet', 'spicy', 'legendary'];
export const INTENSITY_LABEL: Record<Intensity, string> = { sweet: 'Sweet', spicy: 'Spicy', legendary: 'Legendary' };

export type CategoryId = 'home' | 'couples' | 'cards' | 'gaming' | 'party' | 'movie';

export type Mode = 'duel' | 'coop';

export interface Reward {
  points: number;
  coins: number;
  /** extra reward for the winner (or both in coop) — never reveals box contents */
  bonus?: 'box-bronze' | 'box-silver' | 'box-gold' | 'card' | 'key';
}

export interface Challenge {
  id: string;
  name: string;
  tagline: string;
  category: CategoryId;
  sub?: string;
  episodes: number[];
  materials: string[];
  mode: Mode;
  players: string;
  duration: number;
  difficulty: 1 | 2 | 3;
  steps: string[];
  scoring: string;
  win: string;
  reward: Reward;
  rematch: string;
  intensity?: Intensity;
  drinks?: boolean;
  requires?: string;
}

export type CardType =
  | 'double' | 'lucky' | 'steal' | 'shield' | 'revenge'
  | 'swap' | 'second' | 'wild' | 'mystery' | 'mission';

export interface CardInstance { uid: string; type: CardType; at: number }

export type BoxTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';

export type PrizeKind = 'fun' | 'romantic' | 'practical' | 'special' | 'daring' | 'advantage' | 'surprise' | 'event';

export interface PrizeEffect { coins?: number; points?: number; card?: CardType | 'random'; key?: number; box?: BoxTier }

export interface Prize {
  id: string;
  title: string;
  text: string;
  kind: PrizeKind;
  /** physical preparation for Gabriel (host only) */
  prep: string;
  effect?: PrizeEffect;
  unique?: boolean;
  intensity?: Intensity;
}

export interface PrizeRecord {
  uid: string;
  prizeId: string;
  box: BoxTier | 'roulette' | 'envelope' | 'card';
  player: PlayerId;
  at: number;
  title: string;
  text: string;
  redeemed?: boolean;
}

export interface Mission { uid: string; text: string; done?: boolean; at: number }

export interface PlayerState {
  coins: number;
  points: number;
  streak: number;
  bestStreak: number;
  losses: number;
  lossStreak: number;
  wins: number;
  cards: CardInstance[];
  keys: number;
  doubleArmed: boolean;
  multiplier: number;
  missions: Mission[];
  freeBoxes: Partial<Record<BoxTier, number>>;
  stats: PlayerStats;
}

export interface PlayerStats {
  boxes: number; spins: number; allin: number; thefts: number; cardsUsed: number; coopWins: number;
  categories: CategoryId[]; bingos: number; predictionsHit: number; missionsDone: number; comeback: number;
  breakfast: number; gold: number; diamond: number; legend: number;
}

export interface Prefs {
  competition: 'chill' | 'normal' | 'fierce';
  romance: Intensity;
  spicy: boolean;
  alcohol: boolean;
  avoid: CategoryId[];
  rewardStyle: 'all' | 'romantic' | 'fun';
  limits: string;
  configured: boolean;
}

export type HistoryKind =
  | 'result' | 'skip' | 'box' | 'roulette' | 'card' | 'envelope' | 'achievement'
  | 'episode' | 'adjust' | 'lottery' | 'mission' | 'event' | 'tournament' | 'system';

export interface HistoryEntry {
  uid: string;
  at: number;
  kind: HistoryKind;
  text: string;
  player?: PlayerId;
  challengeId?: string;
  winner?: PlayerId | 'tie' | 'coop-win' | 'coop-fail';
  delta?: Partial<Record<PlayerId, { coins?: number; points?: number }>>;
  /** private entries are hidden in player mode (e.g. secret missions) */
  secret?: boolean;
}

export interface BingoCard { cells: string[]; marked: boolean[]; claimed?: boolean }

export interface Prediction { uid: string; player: PlayerId; text: string; status: 'locked' | 'hit' | 'miss'; at: number; show: string }

export interface Series {
  uid: string;
  name: string;
  bestOf: number;
  wins: Record<PlayerId, number>;
  done?: PlayerId;
  at: number;
}

export interface LotteryAuction {
  id: string;
  winner?: PlayerId;
  bids?: Record<PlayerId, number>;
  choice?: string;
}

export interface GameState {
  version: number;
  createdAt: number;
  introStep: number; // 0..n, introDone when >= 99
  introDone: boolean;
  firstMissionDone: boolean;
  episode: number;
  episodeStartedAt: Record<number, number>;
  players: Record<PlayerId, PlayerState>;
  prefs: Record<PlayerId, Prefs>;
  history: HistoryEntry[];
  completed: Record<string, number>;
  prizes: PrizeRecord[];
  drawnUnique: string[];
  boxesOpened: Record<PlayerId, Partial<Record<BoxTier, number>>>;
  envelopesOpened: string[];
  envelopesForced: string[];
  achievements: Record<string, { player: PlayerId; at: number }>;
  host: {
    pin?: string;
    prizeOverrides: Record<string, string>;
    envelopeOverrides: Record<string, string>;
    checklist: Record<string, boolean>;
    notes: string;
  };
  sharedScreen: boolean;
  decks: Record<string, number[]>;
  bingo: Record<string, Partial<Record<PlayerId, BingoCard>>>;
  predictions: Prediction[];
  series: Series[];
  lottery: Record<string, LotteryAuction>;
  roulettesSpun: Record<string, number>;
  usedSeed: number;
}
