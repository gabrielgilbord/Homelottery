/* PlayStation free-to-play research (verified Nov 2026 against official PlayStation / Epic pages where possible).
 * Sizes are NOT invented: when no official size was found it says so. */
export interface GameInfo {
  name: string; platform: string; price: string; size: string; psPlus: string; local: string; needs: string;
  priority: 'IMPRESCINDIBLE' | 'RECOMENDADO' | 'OPCIONAL' | 'NO DESCARGAR SI NO HAY TIEMPO' | 'NO RECOMENDADO';
  link: string; note: string;
}

export const GAMES: GameInfo[] = [
  {
    name: 'ARK: Survival Ascended (actualización)', platform: 'PS5', price: 'Ya lo tenéis', size: 'Instalación completa ~179 GB según PSPrices (no oficial). El tamaño del parche solo se ve en la consola.',
    psPlus: 'Para pantalla dividida local no hace falta. Online/servidores: revisar en la consola.', local: 'Sí: pantalla dividida local para 2 jugadores (ficha oficial PS Store).',
    needs: 'Espacio libre en el SSD. Dejar actualizando ESTA NOCHE.', priority: 'IMPRESCINDIBLE',
    link: 'https://store.playstation.com/es-es/concept/10008286', note: 'Si mañana a las 15:00 no ha terminado, Plan B: Split Fiction + Rocket League. Las reseñas de PS5 mencionan cierres inesperados: guardad a menudo.',
  },
  {
    name: 'Split Fiction (comprobar actualización)', platform: 'PS5', price: 'Ya lo tenéis', size: 'Consultar en la consola',
    psPlus: 'No para local.', local: 'Cooperativo a pantalla dividida para 2 en la misma consola.', needs: '2 mandos cargados.', priority: 'IMPRESCINDIBLE',
    link: 'https://www.playstation.com/es-es/games/split-fiction/', note: 'Abridlo esta noche para que descargue el parche pendiente.',
  },
  {
    name: 'Rocket League', platform: 'PS4 (se juega en PS5)', price: 'Gratis (free-to-play)', size: 'No publicado en la ficha: ver en la consola',
    psPlus: 'No. Psyonix confirmó que el online no requiere PS Plus.', local: 'Sí: pantalla dividida local (el 2.º mando pulsa Options).',
    needs: '2 mandos. Cuenta Epic vinculada al iniciar. Para jugar online, ambos con sesión PSN.', priority: 'IMPRESCINDIBLE',
    link: 'https://store.playstation.com/es-es/concept/203715', note: 'El mejor F2P para un 1 contra 1 en el sofá. Partidas de 5 minutos.',
  },
  {
    name: 'Brawlhalla', platform: 'PS4 (compatible con PS5)', price: 'Gratis', size: 'No publicado en la ficha',
    psPlus: 'La ficha no indica que el online requiera PS Plus. El modo local no lo necesita.', local: 'Sí: 1-4 jugadores locales (Free for All local, equipos locales).',
    needs: '2 mandos.', priority: 'RECOMENDADO',
    link: 'https://www.playstation.com/es-es/games/brawlhalla/', note: 'Lucha tipo plataformas, partidas cortas, perfecto para revanchas al mejor de 5.',
  },
  {
    name: 'Fortnite', platform: 'PS5', price: 'Gratis', size: 'Muy grande: consultar en la consola',
    psPlus: 'No para free-to-play.', local: 'Pantalla dividida en Battle Royale Dúos/Escuadrones (según la ayuda oficial de Epic). Requiere internet.',
    needs: '2 mandos, 2 cuentas PSN/Epic. Split-screen limita a 60 FPS.', priority: 'NO DESCARGAR SI NO HAY TIEMPO',
    link: 'https://www.playstation.com/es-es/games/fortnite/', note: 'Solo si ya lo tenéis instalado. Descarga pesada.',
  },
  {
    name: 'Fall Guys', platform: 'PS4/PS5', price: 'Gratis', size: '—', psPlus: 'No.', local: 'Sin pantalla dividida: necesitaríais dos consolas.',
    needs: '—', priority: 'NO RECOMENDADO', link: 'https://www.playstation.com/es-es/games/fall-guys/', note: 'Divertido, pero no sirve para jugar juntos en una sola consola.',
  },
  {
    name: 'League of Legends (cliente PC)', platform: 'PC', price: 'Gratis', size: 'Parche: lo indica el cliente de Riot',
    psPlus: '—', local: 'Online. Para jugar juntos hacen falta 2 PCs; con 1 PC, pruebas por turnos (Farm Master, Duelo contra bots).',
    needs: 'Abrir el cliente esta noche y dejar que parchee.', priority: 'IMPRESCINDIBLE',
    link: 'https://www.leagueoflegends.com/es-es/', note: 'Revisad que ambas cuentas inician sesión.',
  },
];

export const LOL_ROLES = ['Top', 'Jungla', 'Mid', 'ADC', 'Support'];
export const LOL_CHAMPIONS = [
  'Aatrox', 'Ahri', 'Akali', 'Alistar', 'Amumu', 'Anivia', 'Annie', 'Aphelios', 'Ashe', 'Aurelion Sol', 'Azir', 'Bard', 'Blitzcrank', 'Brand', 'Braum',
  'Caitlyn', 'Camille', 'Cassiopeia', "Cho'Gath", 'Corki', 'Darius', 'Diana', 'Dr. Mundo', 'Draven', 'Ekko', 'Elise', 'Evelynn', 'Ezreal', 'Fiddlesticks',
  'Fiora', 'Fizz', 'Galio', 'Gangplank', 'Garen', 'Gnar', 'Gragas', 'Graves', 'Gwen', 'Hecarim', 'Heimerdinger', 'Illaoi', 'Irelia', 'Ivern', 'Janna',
  'Jarvan IV', 'Jax', 'Jayce', 'Jhin', 'Jinx', "Kai'Sa", 'Kalista', 'Karma', 'Karthus', 'Kassadin', 'Katarina', 'Kayle', 'Kayn', 'Kennen', "Kha'Zix",
  'Kindred', 'Kled', "Kog'Maw", 'LeBlanc', 'Lee Sin', 'Leona', 'Lillia', 'Lissandra', 'Lucian', 'Lulu', 'Lux', 'Malphite', 'Malzahar', 'Maokai',
  'Master Yi', 'Miss Fortune', 'Mordekaiser', 'Morgana', 'Nami', 'Nasus', 'Nautilus', 'Neeko', 'Nidalee', 'Nocturne', 'Nunu y Willump', 'Olaf', 'Orianna',
  'Ornn', 'Pantheon', 'Poppy', 'Pyke', 'Qiyana', 'Quinn', 'Rakan', 'Rammus', "Rek'Sai", 'Rell', 'Renekton', 'Rengar', 'Riven', 'Rumble', 'Ryze',
  'Samira', 'Sejuani', 'Senna', 'Seraphine', 'Sett', 'Shaco', 'Shen', 'Shyvana', 'Singed', 'Sion', 'Sivir', 'Skarner', 'Sona', 'Soraka', 'Swain',
  'Sylas', 'Syndra', 'Tahm Kench', 'Taliyah', 'Talon', 'Taric', 'Teemo', 'Thresh', 'Tristana', 'Trundle', 'Tryndamere', 'Twisted Fate', 'Twitch',
  'Udyr', 'Urgot', 'Varus', 'Vayne', 'Veigar', "Vel'Koz", 'Vex', 'Vi', 'Viego', 'Viktor', 'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Xayah',
  'Xerath', 'Xin Zhao', 'Yasuo', 'Yone', 'Yorick', 'Yuumi', 'Zac', 'Zed', 'Zeri', 'Ziggs', 'Zilean', 'Zoe', 'Zyra',
];

/* ---------------- Cocktail / mocktail lab ---------------- */
export const COCKTAIL = {
  baseAlcohol: ['Ron', 'Ginebra', 'Vodka', 'Tequila', 'Vermut', 'Vino blanco', 'Cava', 'Licor de café'],
  baseNoAlcohol: ['Agua con gas', 'Té frío', 'Zumo de naranja', 'Zumo de piña', 'Limonada', 'Ginger ale', 'Tónica', 'Cola', 'Zumo de manzana', 'Café frío'],
  mixer: ['Tónica', 'Lima', 'Limón', 'Zumo de piña', 'Zumo de naranja', 'Granadina o sirope', 'Ginger ale', 'Cola', 'Leche o bebida vegetal', 'Miel', 'Pepino', 'Frutos rojos'],
  garnish: ['Hoja de menta', 'Rodaja de naranja', 'Piel de limón', 'Canela', 'Fresa', 'Hielo picado', 'Borde de azúcar', 'Pimienta rosa', 'Una sombrillita imaginaria', 'Romero'],
  style: ['Tropical', 'Elegante de gala', 'Vampírico (rojo oscuro)', 'Isla de las tentaciones', 'Desayuno de campeones', 'Medianoche', 'Retro de los 80', 'Minimalista'],
};

/* ---------------- Movie night ---------------- */
export const MOVIE_PICKS = [
  { title: 'Crepúsculo (Twilight, 2008)', why: 'El plan estrella: Bingo Crepuscular, Oráculo Vampírico y Examen de Forks.', lang: 'Inglés con subtítulos o castellano', where: 'Comprobad en JustWatch España dónde está disponible hoy (alquiler o suscripción).' },
  { title: 'La isla de las tentaciones (cualquier episodio)', why: 'Bingo del Drama, Detector de Dramas y predicciones. Funciona con cualquier episodio.', lang: 'Castellano', where: 'Mediaset Infinity / Telecinco (verificad en vuestra cuenta).' },
  { title: 'Crazy, Stupid, Love (2011)', why: 'Comedia romántica con diálogos claros: perfecta para English Bingo y Guess the Next Line.', lang: 'Inglés', where: 'Comprobad disponibilidad en JustWatch.' },
  { title: 'The Proposal / La proposición (2009)', why: 'Inglés fácil de seguir, humor y romance: ideal para Forbidden Words.', lang: 'Inglés', where: 'Comprobad disponibilidad en JustWatch.' },
  { title: 'Brooklyn Nine-Nine (episodios sueltos)', why: 'Episodios de 20 minutos, muy citables, ideal para Accent Challenge.', lang: 'Inglés', where: 'Comprobad disponibilidad en JustWatch.' },
  { title: 'Friends (episodios sueltos)', why: 'Clásico para aprender expresiones: English Bingo funciona muy bien.', lang: 'Inglés', where: 'Comprobad disponibilidad en JustWatch.' },
];

export const LOTTERY_ITEMS = [
  { id: 'genre', name: 'Género', options: ['Romántica', 'Comedia', 'Fantasía / Vampiros', 'Reality', 'Serie en inglés', 'Terror suave'] },
  { id: 'title', name: 'Película o serie', options: [] as string[] },
  { id: 'lang', name: 'Idioma', options: ['Versión original con subtítulos en inglés', 'VO con subtítulos en castellano', 'Castellano'] },
  { id: 'snacks', name: 'Snacks', options: ['Palomitas', 'Nachos con salsa', 'Chocolate y fruta', 'Pizza', 'Helado', 'Sorpresa del ganador'] },
  { id: 'mode', name: 'Modo de visionado', options: ['Sofá y manta', 'Cine en la cama', 'Fuerte de cojines', 'Luces apagadas total'] },
  { id: 'rules', name: 'Retos activos', options: ['Bingo', 'Predicciones', 'Forbidden Words', 'Detector de Dramas', 'Todo a la vez'] },
];
