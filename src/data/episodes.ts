import type { CategoryId } from '../types';

export interface Episode {
  n: number;
  code: string;
  title: string;
  subtitle: string;
  time: string;
  mood: string;
  categories: CategoryId[];
  picks: string[];
  playerNote: string;
  hostNote: string;
  theme: string;
}

export const EPISODES: Episode[] = [
  {
    n: 1, code: 'EP 01', title: 'Breakfast & The Invitation', subtitle: 'Huevos fritos, zumo y una sorpresa en bandeja.', time: '09:30 – 10:30',
    mood: 'Tierno · Sorpresa', categories: ['home'], picks: ['h-breakfast'], theme: 'dawn',
    playerNote: 'Desayunad tranquilos. La primera misión se juega en la mesa.',
    hostNote: 'Entrega bandeja + móvil con la Invitación abierta. Deja que Tatiana lea sola. Juega la Operación Desayuno, registra el resultado y no enseñes las cajas todavía.',
  },
  {
    n: 2, code: 'EP 02', title: 'The Warm-Up', subtitle: 'Pruebas rápidas, retos absurdos y primeras monedas.', time: '10:30 – 12:00',
    mood: 'Risas · Energía', categories: ['home', 'party', 'cards', 'couples'], picks: ['h-hunt', 'h-tray', 'p-quick', 'c-know', 'h-sock', 'k-coin'], theme: 'home',
    playerNote: 'Calentamiento: 3 o 4 pruebas cortas. Se abre la Ruleta Clásica y la Bronze Box.',
    hostNote: 'Elige 3-4 pruebas cortas. Al acabar, enseña la Bronze Box y la Ruleta Clásica: es la primera vez que ven el sistema de premios.',
  },
  {
    n: 3, code: 'EP 03', title: 'The Duel', subtitle: 'Cartas, dados, habilidad y apuestas ficticias.', time: '12:30 – 14:00',
    mood: 'Competitivo · Casino', categories: ['cards', 'home'], picks: ['k-escoba', 'k-liardice', 'k-holdem', 'k-pig', 'h-chef', 'h-taste'], theme: 'cards',
    playerNote: 'Torneo de cartas al mejor de tres y algún duelo de habilidad. Se desbloquea la Silver Box.',
    hostNote: 'Monta la mesa de cartas. Abre una Serie al mejor de 3 en Cartas y dados. Reparte el encargo del "Plan Secreto" (En pareja → baraja privada) antes de comer.',
  },
  {
    n: 4, code: 'EP 04', title: 'The Gaming Arena', subtitle: 'League of Legends, Split Fiction, ARK y juegos gratuitos.', time: '15:30 – 17:30',
    mood: 'Gamer · Neón', categories: ['gaming'], picks: ['g-champroulette', 'g-sf-silence', 'g-sf-hidden', 'g-rocket', 'g-ark-gather', 'g-brawl'], theme: 'gaming',
    playerNote: 'Después de comer y descansar: consolas y PC. Se desbloquea la Gold Box.',
    hostNote: 'Comprueba que ARK terminó de actualizar. Si no: Split Fiction + Rocket League. Usa las barajas privadas de Gaming con la cortina de privacidad.',
  },
  {
    n: 5, code: 'EP 05', title: 'The Afternoon Party', subtitle: 'Cócteles, pruebas de sabor y ruleta dorada.', time: '18:00 – 20:00',
    mood: 'Fiesta · Brindis', categories: ['party', 'home'], picks: ['p-cocktail', 'p-pong', 'p-sommelier', 'p-never', 'p-likely', 'p-songs'], theme: 'party',
    playerNote: 'Música, bebidas (con o sin alcohol, siempre opcional) y retos de fiesta. Ruleta Dorada y Diamond Box disponibles.',
    hostNote: 'Saca hielo, fruta, vasitos y mocktails. Abre el Laboratorio de Cócteles. Nunca uses la bebida como castigo: el vaso es decorativo.',
  },
  {
    n: 6, code: 'EP 06', title: 'The Couples Challenge', subtitle: 'Complicidad, retos sensuales y premios especiales.', time: '20:00 – 21:15',
    mood: 'Íntimo · Burdeos', categories: ['couples'], picks: ['c-microdate', 'c-massage', 'c-back', 'c-truth', 'c-secretplan', 'c-moviekiss'], theme: 'couples',
    playerNote: 'Luz baja, cena ligera y retos de pareja. Siempre al nivel más suave de los dos. Ruleta de Medianoche disponible.',
    hostNote: 'Velas LED, manta, playlist. Revisa que ambos han configurado sus límites. Entrega de los Planes Secretos aquí o en la Final.',
  },
  {
    n: 7, code: 'EP 07', title: 'The Evening Show', subtitle: 'Películas, series, música y pruebas en inglés.', time: '21:15 – 23:30',
    mood: 'Cine · Palomitas', categories: ['movie', 'party'], picks: ['m-tw-bingo', 'm-tw-oracle', 'm-isla-detectives', 'm-isla-bingo', 'm-en-bingo', 'm-en-forbidden'], theme: 'movie',
    playerNote: 'La Movie Lottery decide la película. Bingo, predicciones y palabras prohibidas sin pausar la peli.',
    hostNote: 'Antes de la peli: Movie Lottery (subastas). Generad los cartones de Bingo y bloquead predicciones. Snacks listos.',
  },
  {
    n: 8, code: 'EP 08', title: 'The Grand Finale', subtitle: 'Última competición, cajas legendarias y ceremonia.', time: '23:30 – 00:15',
    mood: 'Gala · Legendario', categories: ['home', 'couples', 'gaming'], picks: ['h-triathlon', 'c-slowdance', 'g-rocket', 'c-letter'], theme: 'legendary',
    playerNote: 'Triatlón final con puntos dobles, Ruleta Legendaria, Legendary Boxes y la coronación.',
    hostNote: 'Ten preparados los premios legendarios físicos (carta y regalo). Abrid las Legendary Boxes al final. Ceremonia: lee el marcador en voz alta, corona al campeón y abre La Última Carta.',
  },
];

export const BREAKS = [
  { after: 2, label: 'Pausa: ducha, paseo o nada', time: '12:00 – 12:30' },
  { after: 3, label: 'Comida, siesta o tiempo libre', time: '14:00 – 15:30' },
  { after: 4, label: 'Respiro: merienda', time: '17:30 – 18:00' },
];

export const CATEGORIES: Record<CategoryId, { name: string; short: string; theme: string; desc: string }> = {
  home: { name: 'Retos de casa', short: 'Casa', theme: 'home', desc: 'Memoria, equilibrio, cocina, puntería y competiciones absurdas.' },
  couples: { name: 'En pareja', short: 'Pareja', theme: 'couples', desc: 'Complicidad, confianza, romance y retos picantes, en tres niveles: Sweet, Spicy y Legendary.' },
  cards: { name: 'Cartas y dados', short: 'Cartas', theme: 'cards', desc: 'Baraja española, póker, dados, monedas y papel.' },
  gaming: { name: 'Gaming', short: 'Gaming', theme: 'gaming', desc: 'League of Legends, Split Fiction, ARK y free-to-play de PS.' },
  party: { name: 'Fiesta', short: 'Fiesta', theme: 'party', desc: 'Juegos de fiesta con bebidas opcionales. Nunca obligatorio beber.' },
  movie: { name: 'Noche de cine', short: 'Cine', theme: 'movie', desc: 'Twilight, La isla de las tentaciones y English Night.' },
};
