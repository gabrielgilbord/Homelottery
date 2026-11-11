import type { BoxTier, CardType, Prize, PlayerId } from '../types';

/* ============================== MYSTERY CARDS ============================== */
export interface CardDef { type: CardType; name: string; short: string; rules: string; glyph: string; tone: string }
export const CARDS: Record<CardType, CardDef> = {
  double: { type: 'double', name: 'Double Trouble', short: 'Tu próxima victoria vale el doble.', rules: 'Actívala antes de una prueba. Si la ganas, recibes el doble de puntos y monedas. Si la pierdes, la carta se gasta igualmente.', glyph: 'x2', tone: '#e7c27d' },
  lucky: { type: 'lucky', name: 'Lucky Strike', short: '+40 monedas al instante.', rules: 'Úsala en cualquier momento para recibir 40 monedas.', glyph: 'star', tone: '#f0d48a' },
  steal: { type: 'steal', name: 'Steal a Coin', short: 'Roba 30 monedas al rival.', rules: 'Roba 30 monedas (o las que tenga si son menos). Si el rival tiene un Shield, el robo se bloquea y su Shield se consume.', glyph: 'hand', tone: '#d36b6b' },
  shield: { type: 'shield', name: 'Shield', short: 'Te protege del próximo ataque.', rules: 'Pasiva: mientras la tengas, bloquea automáticamente el próximo Steal, Swap o Revenge contra ti (y los robos de la ruleta).', glyph: 'shield', tone: '#8fb6d9' },
  revenge: { type: 'revenge', name: 'Revenge', short: 'Recupera la mitad de lo que perdiste.', rules: 'Úsala si el rival ganó el último duelo: le quitas la mitad de los puntos que ganó en él. Se bloquea con Shield.', glyph: 'bolt', tone: '#c04d6f' },
  swap: { type: 'swap', name: 'Swap', short: 'Intercambia una carta con el rival.', rules: 'Una carta tuya al azar pasa al rival y una suya al azar pasa a ti. El rival necesita al menos una carta. Se bloquea con Shield.', glyph: 'swap', tone: '#9d7ee0' },
  second: { type: 'second', name: 'Second Chance', short: 'Cobra parte del premio aunque perdieras.', rules: 'Úsala si perdiste el último duelo: recibes el 60% de los puntos y monedas que ganó el rival (él no pierde nada).', glyph: 'retry', tone: '#7fc7a8' },
  wild: { type: 'wild', name: 'Wild Card', short: 'Eliges la próxima prueba (+15 monedas).', rules: 'Recibes 15 monedas y el derecho a elegir la próxima prueba y su categoría. También sirve para pasar una prueba con recompensa.', glyph: 'wild', tone: '#e98bc0' },
  mystery: { type: 'mystery', name: 'Mystery Reward', short: 'Abre una Caja Bronce gratis.', rules: 'Se convierte en una Caja Bronce abierta al instante, gratis.', glyph: 'gift', tone: '#d8a15a' },
  mission: { type: 'mission', name: 'Secret Mission', short: 'Recibe una misión secreta.', rules: 'Recibes una misión secreta (solo tú la ves). Si la cumples, márcala en tu inventario: +40 monedas y +15 puntos.', glyph: 'eye', tone: '#b5a6ff' },
};
export const CARD_TYPES = Object.keys(CARDS) as CardType[];
/** weights when a random card is drawn */
export const CARD_WEIGHTS: Record<CardType, number> = { double: 10, lucky: 12, steal: 11, shield: 11, revenge: 8, swap: 8, second: 9, wild: 10, mystery: 9, mission: 12 };

export const MISSIONS = [
  'Consigue que {rival} diga la palabra "increíble" sin pedírselo.',
  'Haz que {rival} te dé un abrazo sin pedirlo directamente.',
  'Logra que {rival} cante al menos un verso de una canción.',
  'Consigue que {rival} se ría 3 veces en los próximos 15 minutos.',
  'Haz que {rival} te traiga algo de la cocina sin pedírselo de forma directa.',
  'Consigue que {rival} use la palabra "dinosaurio" en una frase.',
  'Haz que {rival} diga tu nombre completo.',
  'Logra que {rival} ponga la canción que tú querías poner.',
  'Consigue un beso de {rival} sin pedirlo con palabras.',
  'Haz que {rival} imite a alguien famoso.',
  'Consigue que {rival} te haga un cumplido en los próximos 20 minutos.',
  'Haz que {rival} diga "vale" cinco veces durante la próxima prueba.',
];

/* ============================== MYSTERY BOXES ============================== */
export interface BoxDef { tier: BoxTier; name: string; cost: number; costLabel: string; unlockEpisode: number; tagline: string; color: string; entries: { prizeId: string; weight: number }[] }

/** Optional player restriction for personal prizes. */
export const PRIZE_FOR: Record<string, PlayerId> = { 'l-letter': 'tatiana', 'l-letter-g': 'gabriel', 'l-gift': 'tatiana', 'l-gift-g': 'gabriel' };

export const PRIZES: Prize[] = [
  // ---------- BRONZE ----------
  { id: 'b-coins', title: 'Bolsa de monedas', text: '+20 monedas para tu tesoro.', kind: 'advantage', prep: 'Nada. Automático.', effect: { coins: 20 } },
  { id: 'b-card', title: 'Carta del mazo', text: 'Una carta especial aleatoria para tu inventario.', kind: 'advantage', prep: 'Nada. Automático.', effect: { card: 'random' } },
  { id: 'b-snack', title: 'Snack a domicilio', text: 'Vale por un snack servido por tu rival cuando lo pidas, con reverencia incluida.', kind: 'fun', prep: 'Ten snacks en casa (patatas, chocolate, frutos secos).' },
  { id: 'b-dj', title: 'DJ Oficial', text: 'Controlas la música durante las próximas 3 canciones. Nada de vetos.', kind: 'fun', prep: 'Altavoz o tele con Spotify/YouTube listo.' },
  { id: 'b-compliments', title: 'Tres cumplidos', text: 'Vale por 3 cumplidos sinceros a demanda. Puedes cobrarlos cuando quieras.', kind: 'romantic', prep: 'Ninguna.' },
  { id: 'b-hidden-choc', title: 'Tesoro de chocolate', text: 'Hay un chocolate escondido para ti. Pista: en el sitio donde se guardan las cosas que se enfrían.', kind: 'special', prep: 'Esconde una chocolatina. Edita la pista en Host Mode → Premios si la escondes en otro sitio.', unique: true },
  { id: 'b-nochore', title: 'Libre de tarea', text: 'Vale: te libras de una tarea doméstica a tu elección (la hace el rival) esta semana.', kind: 'practical', prep: 'Ninguna.' },
  { id: 'b-remote', title: 'El Mando del Poder', text: 'Durante 1 hora tú controlas el mando de la tele. Absoluto.', kind: 'fun', prep: 'Ninguna.' },
  { id: 'b-hug', title: 'Abrazo de oso', text: 'Abrazo de 20 segundos cronometrados. Ahora mismo.', kind: 'romantic', prep: 'Ninguna.' },
  { id: 'b-tax', title: 'Impuesto revolucionario', text: 'Robas 10 monedas al rival. Los Shields no protegen de los impuestos.', kind: 'advantage', prep: 'Automático.', effect: { coins: 10 } },
  { id: 'b-event-dance', title: 'Evento: Pista de baile', text: '¡Evento sorpresa! Bailad juntos la próxima canción. Los dos recibís +10 monedas.', kind: 'event', prep: 'Música preparada.', effect: { coins: 10 } },

  // ---------- SILVER ----------
  { id: 's-coins', title: 'Cofre de plata', text: '+50 monedas.', kind: 'advantage', prep: 'Automático.', effect: { coins: 50 } },
  { id: 's-2cards', title: 'Doble carta', text: 'Dos cartas especiales aleatorias.', kind: 'advantage', prep: 'Automático.', effect: { card: 'random' } },
  { id: 's-massage', title: 'Masaje de 10 minutos', text: 'Vale por un masaje de 10 minutos en la zona que elijas. Cobrable hoy.', kind: 'romantic', prep: 'Ten crema o aceite a mano.' },
  { id: 's-bedbreakfast', title: 'Desayuno en la cama', text: 'Vale por un desayuno en la cama otro día, preparado por el rival.', kind: 'romantic', prep: 'Ninguna (recordatorio para el futuro).', unique: true },
  { id: 's-moviepick', title: 'La Butaca de Oro', text: 'Ganas automáticamente UNA subasta de la Movie Lottery (sin pagar). Úsalo en Movie Night.', kind: 'advantage', prep: 'Ninguna. Recuérdalo en la Movie Lottery.', unique: true },
  { id: 's-dessert', title: 'Postre sorpresa', text: 'El rival te prepara o trae un postre sorpresa antes de la noche.', kind: 'practical', prep: 'Ten helado, chocolate o fruta en casa.' },
  { id: 's-shield', title: 'Armadura de plata', text: 'Una carta Shield y +15 monedas.', kind: 'advantage', prep: 'Automático.', effect: { card: 'shield', coins: 15 } },
  { id: 's-veto', title: 'Vale de Veto', text: 'Anula una prueba o carta elegida por el rival. Una vez. Sin dar explicaciones.', kind: 'advantage', prep: 'Ninguna.' },
  { id: 's-rain', title: 'Evento: Lluvia de monedas', text: 'Llueven monedas: +25 para ti y +10 para el rival.', kind: 'event', prep: 'Automático.', effect: { coins: 25 } },
  { id: 's-kiss', title: 'Beso de película', text: 'Vale por un beso de película cuando tú digas. Con música de fondo si quieres.', kind: 'daring', prep: 'Ninguna.', intensity: 'spicy' },
  { id: 's-photo', title: 'Sesión de fotos absurda', text: 'Tú diriges una sesión de 5 fotos con las poses más ridículas que se te ocurran.', kind: 'fun', prep: 'Móvil con batería.' },

  // ---------- GOLD ----------
  { id: 'g-coins', title: 'Lingote de oro', text: '+100 monedas.', kind: 'advantage', prep: 'Automático.', effect: { coins: 100 } },
  { id: 'g-key', title: 'Llave Legendaria', text: 'Una Llave Legendaria. Abre una Caja Legendaria en la Gran Final.', kind: 'advantage', prep: 'Automático.', effect: { key: 1 } },
  { id: 'g-dinner', title: 'La cena es tuya', text: 'Tú eliges la cena de esta noche (pedida o cocinada por el rival).', kind: 'practical', prep: 'Ten a mano una app de comida a domicilio o ingredientes base.', unique: true },
  { id: 'g-massage', title: 'Masaje de 20 minutos', text: 'Masaje de 20 minutos con aceite, música y luz baja.', kind: 'romantic', prep: 'Aceite, toalla, playlist relajante.' },
  { id: 'g-plan', title: 'Plan del mes', text: 'Vale por un plan en pareja a tu elección durante el próximo mes (cine, cena, escapada corta...).', kind: 'special', prep: 'Ninguna.', unique: true },
  { id: 'g-combo', title: 'Combo de la suerte', text: 'Double Trouble + Lucky Strike para tu inventario.', kind: 'advantage', prep: 'Automático.', effect: { card: 'double', coins: 0 } },
  { id: 'g-gift', title: 'Regalo escondido', text: 'Hay un pequeño regalo escondido para ti. Pista: donde duermen los abrigos.', kind: 'special', prep: 'Compra/prepara un detalle pequeño y escóndelo. Cambia la pista en Host Mode → Premios.', unique: true },
  { id: 'g-spicy', title: 'Propuesta atrevida', text: 'Vale por una propuesta atrevida tuya que el otro acepta, siempre dentro de sus límites (y con derecho a cambiarla por otra).', kind: 'daring', prep: 'Ninguna.', intensity: 'spicy' },
  { id: 'g-points', title: 'Golpe de suerte', text: '+25 puntos en el marcador.', kind: 'advantage', prep: 'Automático.', effect: { points: 25 } },
  { id: 'g-chef', title: 'Chef privado', text: 'Mañana, el rival cocina lo que tú pidas (dentro de lo razonable).', kind: 'practical', prep: 'Ninguna.' },

  // ---------- DIAMOND ----------
  { id: 'd-coins', title: 'Diamante en bruto', text: '+150 monedas.', kind: 'advantage', prep: 'Automático.', effect: { coins: 150 } },
  { id: 'd-key', title: 'Llave y fortuna', text: 'Una Llave Legendaria y +50 monedas.', kind: 'advantage', prep: 'Automático.', effect: { key: 1, coins: 50 } },
  { id: 'd-trip', title: 'Excursión sorpresa', text: 'Vale por una excursión de un día planeada entera por el rival. Tú solo tienes que aparecer.', kind: 'special', prep: 'Piensa ideas de excursión cercanas.', unique: true },
  { id: 'd-spa', title: 'Noche de spa', text: 'Noche de spa en casa: baño o ducha relajante, velas, masaje completo y mascarilla.', kind: 'romantic', prep: 'Velas (LED si preferís), sales/aceite, mascarillas.', unique: true },
  { id: 'd-yesday', title: 'Medio Día del Sí', text: 'Medio día en el que el rival dice "sí" a tus planes (razonables). Cobrable cualquier fin de semana.', kind: 'special', prep: 'Ninguna.', unique: true },
  { id: 'd-points', title: 'Remontada de diamante', text: '+40 puntos en el marcador.', kind: 'advantage', prep: 'Automático.', effect: { points: 40 } },
  { id: 'd-3cards', title: 'Mazo de diamante', text: 'Tres cartas especiales aleatorias.', kind: 'advantage', prep: 'Automático.', effect: { card: 'random' } },
  { id: 'd-night', title: 'Noche a tu medida', text: 'Tú diseñas el final de esta noche, dentro de los límites de los dos.', kind: 'daring', prep: 'Ninguna.', intensity: 'spicy', unique: true },

  // ---------- LEGENDARY ----------
  { id: 'l-crown', title: 'La Corona de HOMELOTTERY', text: '+50 puntos y el título oficial de Leyenda de HOMELOTTERY.', kind: 'special', prep: 'Opcional: una corona de papel o cartón para coronar al ganador.', effect: { points: 50 }, unique: true },
  { id: 'l-wish', title: 'Deseo Legendario', text: 'Un deseo (razonable y dentro de los límites) concedido por el rival. Sin fecha de caducidad.', kind: 'special', prep: 'Ninguna.', unique: true },
  { id: 'l-letter', title: 'La Carta Secreta', text: 'Gabriel te ha escrito una carta a mano. Pídesela: está guardada en un sobre cerrado.', kind: 'romantic', prep: 'ESCRIBE ESTA NOCHE una carta a mano para Tatiana. Sobre cerrado, guardado donde puedas sacarlo rápido.', unique: true },
  { id: 'l-letter-g', title: 'La Carta Secreta', text: 'Tatiana te escribirá una carta a mano esta semana. Vale firmado.', kind: 'romantic', prep: 'Ninguna.', unique: true },
  { id: 'l-trip', title: 'El Gran Viaje', text: 'Vale por planificar juntos un viaje. Tú eliges el destino.', kind: 'special', prep: 'Ninguna (promesa para el futuro).', unique: true },
  { id: 'l-jackpot', title: 'JACKPOT', text: '+200 monedas y dos cartas aleatorias.', kind: 'advantage', prep: 'Automático.', effect: { coins: 200, card: 'random' } },
  { id: 'l-gift', title: 'El Regalo Legendario', text: 'Gabriel tiene un regalo guardado para ti. Este es el momento.', kind: 'special', prep: 'El regalo principal para Tatiana (si lo tienes). Envuelto y escondido. Si no hay regalo físico, edita el texto por un vale especial.', unique: true },
  { id: 'l-gift-g', title: 'El Regalo Legendario', text: 'Tatiana te prepara una sorpresa legendaria esta semana. Vale firmado.', kind: 'special', prep: 'Ninguna.', unique: true },
];

export const prizeById = (id: string) => PRIZES.find((p) => p.id === id);

/** how many cards each multi-card prize grants */
export const PRIZE_CARD_COUNT: Record<string, number> = { 's-2cards': 2, 'd-3cards': 3, 'l-jackpot': 2, 'g-combo': 1 };
/** extra effects not expressible in PrizeEffect */
export const PRIZE_SPECIAL: Record<string, 'tax10' | 'rival10' | 'combo'> = { 'b-tax': 'tax10', 's-rain': 'rival10', 'b-event-dance': 'rival10', 'g-combo': 'combo' };

export const BOXES: BoxDef[] = [
  {
    tier: 'bronze', name: 'Bronze Box', cost: 30, costLabel: '30 monedas', unlockEpisode: 2, tagline: 'Pequeña, humilde y sorprendentemente útil.', color: '#c98a55',
    entries: [
      { prizeId: 'b-coins', weight: 18 }, { prizeId: 'b-card', weight: 16 }, { prizeId: 'b-snack', weight: 10 }, { prizeId: 'b-dj', weight: 9 },
      { prizeId: 'b-compliments', weight: 10 }, { prizeId: 'b-hidden-choc', weight: 6 }, { prizeId: 'b-nochore', weight: 8 }, { prizeId: 'b-remote', weight: 7 },
      { prizeId: 'b-hug', weight: 8 }, { prizeId: 'b-tax', weight: 4 }, { prizeId: 'b-event-dance', weight: 4 },
    ],
  },
  {
    tier: 'silver', name: 'Silver Box', cost: 60, costLabel: '60 monedas', unlockEpisode: 3, tagline: 'Brilla un poco más. Promete un poco más.', color: '#c9cdd6',
    entries: [
      { prizeId: 's-coins', weight: 14 }, { prizeId: 's-2cards', weight: 10 }, { prizeId: 's-massage', weight: 12 }, { prizeId: 's-bedbreakfast', weight: 7 },
      { prizeId: 's-moviepick', weight: 6 }, { prizeId: 's-dessert', weight: 10 }, { prizeId: 's-shield', weight: 10 }, { prizeId: 's-veto', weight: 8 },
      { prizeId: 's-rain', weight: 8 }, { prizeId: 's-kiss', weight: 9 }, { prizeId: 's-photo', weight: 6 },
    ],
  },
  {
    tier: 'gold', name: 'Gold Box', cost: 110, costLabel: '110 monedas', unlockEpisode: 4, tagline: 'Aquí empiezan las cosas serias.', color: '#e2b65c',
    entries: [
      { prizeId: 'g-coins', weight: 10 }, { prizeId: 'g-key', weight: 7 }, { prizeId: 'g-dinner', weight: 10 }, { prizeId: 'g-massage', weight: 11 },
      { prizeId: 'g-plan', weight: 8 }, { prizeId: 'g-combo', weight: 10 }, { prizeId: 'g-gift', weight: 6 }, { prizeId: 'g-spicy', weight: 9 },
      { prizeId: 'g-points', weight: 7 }, { prizeId: 'g-chef', weight: 8 },
    ],
  },
  {
    tier: 'diamond', name: 'Diamond Box', cost: 180, costLabel: '180 monedas', unlockEpisode: 5, tagline: 'Rara. Fría. Inolvidable.', color: '#9fe3ff',
    entries: [
      { prizeId: 'd-coins', weight: 10 }, { prizeId: 'd-key', weight: 13 }, { prizeId: 'd-trip', weight: 9 }, { prizeId: 'd-spa', weight: 11 },
      { prizeId: 'd-yesday', weight: 9 }, { prizeId: 'd-points', weight: 9 }, { prizeId: 'd-3cards', weight: 10 }, { prizeId: 'd-night', weight: 9 },
    ],
  },
  {
    tier: 'legendary', name: 'Legendary Box', cost: 0, costLabel: '1 Llave Legendaria', unlockEpisode: 8, tagline: 'Solo se abre en la Gran Final. Solo con llave.', color: '#ff8fb1',
    entries: [
      { prizeId: 'l-crown', weight: 10 }, { prizeId: 'l-wish', weight: 14 }, { prizeId: 'l-letter', weight: 16 }, { prizeId: 'l-letter-g', weight: 16 },
      { prizeId: 'l-trip', weight: 12 }, { prizeId: 'l-jackpot', weight: 10 }, { prizeId: 'l-gift', weight: 20 }, { prizeId: 'l-gift-g', weight: 20 },
    ],
  },
];
export const boxByTier = (t: BoxTier) => BOXES.find((b) => b.tier === t)!;

/* ============================== ROULETTES ============================== */
export type SegmentKind = 'coins' | 'double' | 'steal' | 'swap' | 'card' | 'box' | 'revenge' | 'event' | 'multiplier' | 'key' | 'prize' | 'legendary' | 'nothing';
export interface Segment { id: string; label: string; kind: SegmentKind; weight: number; value?: number; box?: BoxTier; text?: string; spicy?: boolean; color: string }
export interface WheelDef { id: string; name: string; tagline: string; cost: number; unlockEpisode: number; theme: string; segments: Segment[] }

export const WHEELS: WheelDef[] = [
  {
    id: 'classic', name: 'Ruleta Clásica', tagline: 'La de siempre. Rojo, negro y nervios.', cost: 15, unlockEpisode: 2, theme: 'classic',
    segments: [
      { id: 'c1', label: '+30', kind: 'coins', value: 30, weight: 18, color: '#7a1630' },
      { id: 'c2', label: 'Doble o nada', kind: 'double', weight: 12, color: '#141016' },
      { id: 'c3', label: 'Robo 15', kind: 'steal', value: 15, weight: 11, color: '#7a1630' },
      { id: 'c4', label: 'Carta', kind: 'card', value: 1, weight: 14, color: '#141016' },
      { id: 'c5', label: 'Caja Bronce', kind: 'box', box: 'bronze', weight: 10, color: '#7a1630' },
      { id: 'c6', label: 'Revancha', kind: 'revenge', weight: 7, color: '#141016' },
      { id: 'c7', label: 'Evento', kind: 'event', weight: 12, color: '#7a1630' },
      { id: 'c8', label: 'x2', kind: 'multiplier', value: 2, weight: 8, color: '#141016' },
      { id: 'c9', label: '+5', kind: 'nothing', value: 5, weight: 8, color: '#3a2a10' },
    ],
  },
  {
    id: 'golden', name: 'Ruleta Dorada', tagline: 'Se desbloquea con la fiesta. Apuestas más altas.', cost: 40, unlockEpisode: 5, theme: 'golden',
    segments: [
      { id: 'g1', label: '+80', kind: 'coins', value: 80, weight: 16, color: '#8a6420' },
      { id: 'g2', label: 'Doble o nada', kind: 'double', weight: 12, color: '#2a1d08' },
      { id: 'g3', label: 'Robo 30', kind: 'steal', value: 30, weight: 10, color: '#8a6420' },
      { id: 'g4', label: 'Swap', kind: 'swap', weight: 8, color: '#2a1d08' },
      { id: 'g5', label: 'Caja Plata', kind: 'box', box: 'silver', weight: 12, color: '#8a6420' },
      { id: 'g6', label: '2 cartas', kind: 'card', value: 2, weight: 12, color: '#2a1d08' },
      { id: 'g7', label: 'Evento', kind: 'event', weight: 12, color: '#8a6420' },
      { id: 'g8', label: 'x2', kind: 'multiplier', value: 2, weight: 10, color: '#2a1d08' },
      { id: 'g9', label: 'Llave', kind: 'key', weight: 3, color: '#b0182f' },
    ],
  },
  {
    id: 'midnight', name: 'Ruleta de Medianoche', tagline: 'Para el episodio de pareja. Premios con pulso.', cost: 30, unlockEpisode: 6, theme: 'midnight',
    segments: [
      { id: 'm1', label: 'Beso 10 s', kind: 'prize', text: 'Beso de 10 segundos cronometrados, ahora.', weight: 12, spicy: true, color: '#5a1430' },
      { id: 'm2', label: 'Masaje 5 min', kind: 'prize', text: 'Masaje de 5 minutos donde tú elijas.', weight: 12, color: '#2a1240' },
      { id: 'm3', label: 'Tu canción', kind: 'prize', text: 'Eliges la próxima canción y el otro baila contigo.', weight: 12, color: '#5a1430' },
      { id: 'm4', label: 'Cumplidos', kind: 'prize', text: 'El rival te dice 3 cumplidos mirando a los ojos.', weight: 12, color: '#2a1240' },
      { id: 'm5', label: 'Carta', kind: 'card', value: 1, weight: 12, color: '#5a1430' },
      { id: 'm6', label: '+40', kind: 'coins', value: 40, weight: 14, color: '#2a1240' },
      { id: 'm7', label: 'Caja Plata', kind: 'box', box: 'silver', weight: 8, color: '#5a1430' },
      { id: 'm8', label: 'Doble o nada', kind: 'double', weight: 10, color: '#2a1240' },
      { id: 'm9', label: 'Susurro', kind: 'prize', text: 'El rival te susurra al oído lo que más le apetece hacer contigo esta noche.', weight: 8, spicy: true, color: '#7a1630' },
    ],
  },
  {
    id: 'legendary', name: 'Ruleta Legendaria', tagline: 'Solo en la Gran Final. Todo o casi todo.', cost: 80, unlockEpisode: 8, theme: 'legendary',
    segments: [
      { id: 'l1', label: '+150', kind: 'coins', value: 150, weight: 14, color: '#3a0f2a' },
      { id: 'l2', label: 'Llave', kind: 'key', weight: 10, color: '#0f0a14' },
      { id: 'l3', label: 'Caja Diamante', kind: 'box', box: 'diamond', weight: 8, color: '#3a0f2a' },
      { id: 'l4', label: 'Caja Oro', kind: 'box', box: 'gold', weight: 12, color: '#0f0a14' },
      { id: 'l5', label: 'x3', kind: 'multiplier', value: 3, weight: 10, color: '#3a0f2a' },
      { id: 'l6', label: 'Robo 50', kind: 'steal', value: 50, weight: 10, color: '#0f0a14' },
      { id: 'l7', label: 'LEGENDARIO', kind: 'legendary', weight: 4, color: '#b0182f' },
      { id: 'l8', label: 'Doble o nada', kind: 'double', weight: 14, color: '#0f0a14' },
      { id: 'l9', label: 'Evento', kind: 'event', weight: 12, color: '#3a0f2a' },
    ],
  },
];

/* ============================== SURPRISE EVENTS ============================== */
export type EventEffect = 'rain' | 'underdog' | 'happyhour' | 'cardswap' | 'leadertax' | 'cuddle' | 'cardsall' | 'laugh';
export const EVENTS: { id: EventEffect; title: string; text: string }[] = [
  { id: 'rain', title: 'Lluvia de oro', text: 'Los dos recibís +20 monedas.' },
  { id: 'underdog', title: 'Viento a favor', text: 'Quien va perdiendo en puntos recibe +15 puntos.' },
  { id: 'happyhour', title: 'Happy Hour', text: 'La próxima prueba da doble recompensa a los dos.' },
  { id: 'cardswap', title: 'Mesa revuelta', text: 'Cada uno entrega una carta al azar al otro (si tiene).' },
  { id: 'leadertax', title: 'Impuesto al líder', text: 'El líder en puntos entrega 20 monedas al otro.' },
  { id: 'cuddle', title: 'Pausa de mimos', text: '2 minutos de abrazo en el sofá. +10 monedas cada uno.' },
  { id: 'cardsall', title: 'Reparto de cartas', text: 'Los dos recibís una carta aleatoria.' },
  { id: 'laugh', title: 'Reto relámpago', text: 'El primero que haga reír al otro en los próximos 2 minutos gana 15 monedas (regístralo en Host Mode o con el botón de la ruleta).' },
];

/* ============================== SECRET ENVELOPES ============================== */
export type EnvelopeTo = 'both' | 'tatiana' | 'gabriel' | 'trailing' | 'leader';
export interface EnvelopeDef { id: string; name: string; condition: string; to: EnvelopeTo; message: string; reward: string; hostOnly?: boolean }

export const ENVELOPES: EnvelopeDef[] = [
  {
    id: 'env-first', name: 'El Primer Sobre', condition: 'Disponible desde el principio.', to: 'tatiana',
    message: 'Tatiana:\n\nHoy no hay obligaciones, no hay prisas y no hay planes aburridos.\n\nSolo tú, Gabriel y un montón de sorpresas.\n\nTu primera misión empieza con el desayuno.\n\n¿Crees que estás preparada para ganar?\n\nCon cariño,\nGabriel.',
    reward: '+20 monedas para Tatiana',
  },
  {
    id: 'env-warmup', name: 'Sobre del Calentamiento', condition: 'Se abre al empezar el Episodio 02.', to: 'both',
    message: 'El desayuno era el aperitivo. A partir de ahora, cada prueba suma, cada moneda cuenta y cada carta puede cambiarlo todo.\n\nRegla de oro del día: si algo no apetece, se pasa. Sin dramas. Esto va de pasarlo bien.',
    reward: '+15 monedas para cada uno',
  },
  {
    id: 'env-five', name: 'Sobre de las Cinco Pruebas', condition: 'Se desbloquea al completar 5 pruebas.', to: 'both',
    message: 'Cinco pruebas y seguís en pie. El mazo ha decidido premiaros.',
    reward: 'Una carta aleatoria para cada uno',
  },
  {
    id: 'env-comeback', name: 'Sobre de la Remontada', condition: 'Aparece si alguien pierde 3 duelos seguidos o va 40+ puntos por detrás.', to: 'trailing',
    message: 'Nadie está fuera de este concurso. Este sobre solo lo abre quien va por detrás.\n\nLa remontada empieza ahora.',
    reward: '+40 monedas y una carta Revenge',
  },
  {
    id: 'env-gold', name: 'Sobre Dorado', condition: 'Se desbloquea al abrir la primera Gold Box.', to: 'both',
    message: 'Alguien ha abierto oro. El mercado reacciona: hoy las cajas están vivas.',
    reward: '+20 monedas para cada uno',
  },
  {
    id: 'env-party', name: 'Sobre de la Fiesta', condition: 'Se abre al empezar el Episodio 05.', to: 'both',
    message: 'Se encienden las luces. Se desbloquea la Ruleta Dorada.\n\nRecordad: aquí todo funciona igual de bien con agua, refresco o mocktail. Lo que cuenta es la puntería, no el vaso.',
    reward: '+25 monedas para cada uno',
  },
  {
    id: 'env-midnight', name: 'Sobre de Medianoche', condition: 'Se abre al empezar el Episodio 06.', to: 'both',
    message: 'Baja la luz. Sube la complicidad.\n\nEn este episodio cada uno elige su nivel: Sweet, Spicy o Legendary. Se juega siempre al nivel más suave de los dos.',
    reward: 'Una carta aleatoria para cada uno',
  },
  {
    id: 'env-cinema', name: 'Sobre del Cine', condition: 'Se abre al empezar el Episodio 07.', to: 'both',
    message: 'Esta noche la película no se elige: se gana.\n\nAbrid la Movie Lottery. Las monedas deciden el género, la película, los snacks y las reglas.',
    reward: '+40 monedas para cada uno',
  },
  {
    id: 'env-final', name: 'Sobre de la Gran Final', condition: 'Se abre al empezar el Episodio 08.', to: 'both',
    message: 'Ha llegado el momento. Cada uno recibe una Llave Legendaria.\n\nLas Cajas Legendarias esperan. El marcador todavía puede cambiar.',
    reward: 'Una Llave Legendaria para cada uno',
  },
  {
    id: 'env-gabriel', name: 'Sobre Secreto de Gabriel', condition: 'Solo lo desbloquea Gabriel desde Host Mode, cuando él quiera.', to: 'tatiana', hostOnly: true,
    message: 'Tatiana:\n\nSi estás leyendo esto es porque he querido parar el concurso un momento.\n\nGracias por jugar, por reírte y por ser mi rival favorita.\n\n(Gabriel: reescribe este mensaje en Host Mode → Sobres.)',
    reward: '+30 monedas para Tatiana',
  },
  {
    id: 'env-closing', name: 'La Última Carta', condition: 'Se desbloquea al coronar al campeón (ambas Cajas Legendarias abiertas) o desde Host Mode.', to: 'both',
    message: 'Se apagan las luces del plató.\n\nHOMELOTTERY termina aquí, pero lo que ha pasado hoy se queda.\n\nGracias por jugar.\n\nGABRIEL × TATIANA — Temporada 1.',
    reward: 'Gloria eterna',
  },
];

/* ============================== ACHIEVEMENTS ============================== */
export interface AchievementDef { id: string; name: string; desc: string; reward: { coins?: number; key?: number; card?: boolean } ; glyph: string }
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-win', name: 'Primera Sangre', desc: 'Gana tu primer duelo.', reward: { coins: 10 }, glyph: 'bolt' },
  { id: 'streak3', name: 'En Racha', desc: 'Gana 3 duelos seguidos.', reward: { coins: 25 }, glyph: 'flame' },
  { id: 'streak5', name: 'Imparable', desc: 'Gana 5 duelos seguidos.', reward: { key: 1 }, glyph: 'crown' },
  { id: 'wins10', name: 'Veterano del Plató', desc: 'Gana 10 duelos.', reward: { coins: 50 }, glyph: 'trophy' },
  { id: 'comeback', name: 'Ave Fénix', desc: 'Gana un duelo justo después de perder 3 seguidos.', reward: { coins: 30, card: true }, glyph: 'phoenix' },
  { id: 'box1', name: 'Curiosidad', desc: 'Abre tu primera caja.', reward: { coins: 10 }, glyph: 'gift' },
  { id: 'box5', name: 'Coleccionista', desc: 'Abre 5 cajas.', reward: { coins: 30 }, glyph: 'gift' },
  { id: 'gold', name: 'Toque de Midas', desc: 'Abre una Gold Box.', reward: { coins: 20 }, glyph: 'star' },
  { id: 'diamond', name: 'Corte Perfecto', desc: 'Abre una Diamond Box.', reward: { card: true }, glyph: 'diamond' },
  { id: 'legend', name: 'Leyenda', desc: 'Abre una Legendary Box.', reward: { coins: 50 }, glyph: 'crown' },
  { id: 'spin1', name: 'Que Gire', desc: 'Gira una ruleta.', reward: { coins: 5 }, glyph: 'wheel' },
  { id: 'spin5', name: 'Croupier', desc: 'Gira 5 ruletas.', reward: { coins: 20 }, glyph: 'wheel' },
  { id: 'allin', name: 'All In', desc: 'Gana un Doble o Nada.', reward: { coins: 15 }, glyph: 'dice' },
  { id: 'thief', name: 'Guante Blanco', desc: 'Roba monedas con éxito.', reward: { coins: 10 }, glyph: 'hand' },
  { id: 'cards3', name: 'Estratega', desc: 'Usa 3 cartas especiales.', reward: { coins: 20 }, glyph: 'cards' },
  { id: 'coop5', name: 'Equipo Imbatible', desc: 'Superad 5 pruebas cooperativas.', reward: { coins: 30 }, glyph: 'heart' },
  { id: 'explorer', name: 'Todoterreno', desc: 'Participa en pruebas de las 6 categorías.', reward: { key: 1 }, glyph: 'compass' },
  { id: 'bingo', name: 'Cantor de Bingo', desc: 'Canta una línea en un Bingo de Movie Night.', reward: { coins: 20 }, glyph: 'film' },
  { id: 'oracle', name: 'Oráculo', desc: 'Acierta 3 predicciones.', reward: { coins: 25 }, glyph: 'eye' },
  { id: 'mission', name: 'Agente Secreto', desc: 'Completa una misión secreta.', reward: { coins: 15 }, glyph: 'eye' },
  { id: 'breakfast', name: 'Buenos Días', desc: 'Completa la Operación Desayuno.', reward: { coins: 10 }, glyph: 'sun' },
];
