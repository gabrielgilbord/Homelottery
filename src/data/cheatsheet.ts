/* GABRIEL'S SECRET CHEAT SHEET — CONFIDENTIAL. Only rendered inside Host Mode. */

export interface CheckGroup { id: string; title: string; items: { id: string; text: string }[] }

export const TONIGHT: CheckGroup[] = [
  {
    id: 'update', title: 'Actualizar y descargar (déjalo corriendo antes de dormir)', items: [
      { id: 'ark', text: 'PS5: abrir ARK: Survival Ascended y dejar que descargue la actualización. Comprobar espacio libre en el SSD (Ajustes → Almacenamiento). Si no cabe, borra algo que no vayáis a jugar.' },
      { id: 'sf', text: 'PS5: abrir Split Fiction para que baje el parche pendiente.' },
      { id: 'rl', text: 'PS5: descargar Rocket League (gratis). Iniciarlo una vez para vincular la cuenta Epic y pasar las pantallas iniciales.' },
      { id: 'brawl', text: 'PS5 (opcional): descargar Brawlhalla (gratis) si hay espacio.' },
      { id: 'lol', text: 'PC: abrir el cliente de League of Legends, dejar que parchee e iniciar sesión con las dos cuentas para comprobar que funcionan.' },
      { id: 'psupdate', text: 'PS5: aplicar la actualización del sistema si la pide (Ajustes → Sistema → Software del sistema).' },
    ],
  },
  {
    id: 'charge', title: 'Dejar cargando', items: [
      { id: 'phone', text: 'Tu móvil al 100% (es la consola del concurso).' },
      { id: 'pads', text: 'Los 2 mandos de PS5.' },
      { id: 'speaker', text: 'Altavoz Bluetooth (si lo usáis).' },
      { id: 'leds', text: 'Velas LED o luces para el Episodio 06.' },
    ],
  },
  {
    id: 'app', title: 'Comprobar en HOMELOTTERY', items: [
      { id: 'pin', text: 'Crear el PIN de anfitrión (Host Mode). No lo apuntes en el móvil.' },
      { id: 'prefs', text: 'Configurar TUS límites en Preferencias (en privado).' },
      { id: 'hints', text: 'Host → Premios: escribir las pistas reales del "Tesoro de chocolate" y del "Regalo escondido" según dónde los escondas.' },
      { id: 'envmsg', text: 'Host → Sobres: reescribir el "Sobre Secreto de Gabriel" con tu mensaje personal.' },
      { id: 'home', text: 'Añadir HOMELOTTERY a la pantalla de inicio del móvil (Compartir → Añadir a inicio) y abrirla una vez con WiFi para que quede guardada sin conexión.' },
      { id: 'reset', text: 'Si has estado probando: Host → Ajustes → Reiniciar partida (conservando PIN y textos). Así mañana arranca en la Invitación.' },
      { id: 'leave', text: 'Dejar la app abierta en la pantalla de Invitación y bloquear el móvil.' },
    ],
  },
  {
    id: 'hide', title: 'Esconder y preparar premios', items: [
      { id: 'letter', text: 'Escribir la carta a mano para Tatiana (premio legendario "La Carta Secreta"). Sobre cerrado.' },
      { id: 'gift', text: 'Si tienes un regalo principal: envolverlo y esconderlo (premio legendario "El Regalo Legendario").' },
      { id: 'choc', text: 'Esconder una chocolatina (Bronze: "Tesoro de chocolate").' },
      { id: 'small', text: 'Esconder un detalle pequeño (Gold: "Regalo escondido"). Si no hay, edita el texto del premio por un vale.' },
      { id: 'crown', text: 'Opcional: corona de papel/cartón para la ceremonia final.' },
    ],
  },
  {
    id: 'food', title: 'Comida y bebida', items: [
      { id: 'eggs', text: 'Huevos, pan para tostadas, zumo (o naranjas), café, fruta, mantequilla/aceite.' },
      { id: 'snacks', text: 'Snacks para la tarde y la peli: palomitas, chocolate, frutos secos, nachos.' },
      { id: 'mixers', text: 'Bebidas SIN alcohol: agua con gas, tónica, refrescos, zumos, limón/lima, hielo. Imprescindible.' },
      { id: 'alcohol', text: 'Las bebidas con alcohol que ya tengáis (opcionales, nunca obligatorias).' },
      { id: 'spices', text: 'Para El Paladar de Oro: canela, pimentón, orégano, cacao, café, limón.' },
      { id: 'dinner', text: 'Plan de cena (o app de comida a domicilio) — puede tocar el premio "La cena es tuya".' },
    ],
  },
];

export const MATERIALS = {
  home: [
    'Baraja española de 40 cartas', 'Baraja de póker', '1-10 dados (los que haya)', 'Monedas', 'Papel, folios y 2 bolígrafos de colores',
    'Papel cuadriculado (Hundir la Flota)', '2 vasos opacos (Dados Mentirosos)', '12 vasos (Pong de Vasos Libres) — vale de plástico o normales',
    'Pelota de ping-pong (o bola de papel de aluminio)', '2 cucharas soperas + 2 huevos duros, limones o mandarinas', 'Bandeja + paño',
    '15 objetos pequeños', 'Palillos chinos o pinzas + 2 cuencos', 'Antifaz o pañuelo', 'Calcetines hechos bola + cesto',
    'Cojines (obstáculos)', 'Aceite o crema de masaje + toalla', 'Garbanzos/legos/gominolas como fichas', 'Altavoz o tele con música', 'Manta y cojines para la peli',
  ],
  buy: [
    'Baraja española o de póker si no tenéis (cualquier bazar/supermercado)', 'Pelotas de ping-pong (opcional)', 'Velas LED (opcional)', 'Mascarillas faciales (premio "Noche de spa")',
    'Ingredientes del desayuno que falten', 'Palomitas y snacks', 'Hielo', 'Sobres de papel (si quieres versión física de los sobres)',
  ],
};

export const BREAKFAST = [
  { t: 'Preparación (15-20 min)', d: 'Café o zumo primero. Tostadas al final para que lleguen calientes. Huevos fritos a fuego medio con aceite caliente; sal al servir.' },
  { t: 'Presentación', d: 'Bandeja: huevos, tostadas, zumo, café, fruta cortada. Una servilleta doblada y, si puedes, una flor o una nota con "Episodio 01".' },
  { t: 'Prepara la cata a ciegas', d: 'Deja aparte 3 bocados para la Operación Desayuno: un trozo de fruta, una tostada con algo (mermelada, miel) y un bocado sorpresa (chocolate, queso, frutos secos).' },
  { t: 'El móvil', d: 'Abre HOMELOTTERY: debe estar en la pantalla "Buenos días, Tatiana". Brillo alto, volumen medio, sin notificaciones (modo No molestar).' },
  { t: 'La entrega', d: 'Entra con la bandeja, déjala, y dale el móvil sin decir nada. Solo: "Esto es para ti". Deja que lea sola la invitación (dura ~8 segundos en aparecer completa).' },
  { t: 'Iniciar el Episodio 01', d: 'Ella pulsa DESCUBRIR MI SORPRESA → Reglas → abre el Primer Sobre → configura sus límites → EMPEZAR LA MISIÓN. Tú haces de presentador de la Operación Desayuno y registras el resultado.' },
];

export const HOST_TIMELINE = [
  { time: '08:45', what: 'Despierta antes. Comprueba que ARK terminó. Móvil en No molestar, app en la Invitación.' },
  { time: '09:00', what: 'Desayuno: prepara la bandeja y los 3 bocados de la cata.' },
  { time: '09:30', what: 'EP 01 · Entrega bandeja + móvil. Operación Desayuno. No enseñes cajas ni ruletas.' },
  { time: '10:30', what: 'EP 02 · Pulsa "Siguiente episodio" en The Show. Se abre el Sobre del Calentamiento. 3-4 pruebas cortas (Caza Express, Memoria de Bandeja, Preguntas Relámpago, ¿Cuánto me conoces?). Primera Bronze Box y Ruleta Clásica.' },
  { time: '12:00', what: 'Pausa. Saca la mesa de cartas para después.' },
  { time: '12:30', what: 'EP 03 · Torneo: crea una Serie al mejor de 3 (Escoba o Brisca) en Card Arena + Dados Mentirosos. Se abre la Silver Box. Reparte en privado el "Plan Secreto" (Couples → baraja Plan Secreto).' },
  { time: '14:00', what: 'Comida + siesta. Tiempo libre de verdad.' },
  { time: '15:30', what: 'EP 04 · Gaming Arena: Ruleta de Campeones (LoL) o Split Fiction con Objetivo Oculto. Rocket League al mejor de 3. ARK solo si está actualizado. Gold Box disponible.' },
  { time: '17:30', what: 'Merienda. Prepara la barra: hielo, vasos, mocktails, fruta, vasitos para el Sommelier Ciego.' },
  { time: '18:00', what: 'EP 05 · Party: Sobre de la Fiesta, Ruleta Dorada, Laboratorio de Cócteles, Pong de Vasos Libres, Yo Nunca. Diamond Box disponible.' },
  { time: '19:45', what: 'Prepara el rincón del EP 06: luz baja, velas LED, manta, aceite de masaje, playlist.' },
  { time: '20:00', what: 'EP 06 · Couples: Cita Improvisada, Masaje de Estrellas, Mensaje en la Espalda. Ruleta de Medianoche. Cena ligera.' },
  { time: '21:15', what: 'EP 07 · Sobre del Cine (+40 monedas cada uno) → Movie Lottery → cartones de Bingo y predicciones selladas → play. Snacks listos.' },
  { time: '23:30', what: 'EP 08 · Sobre de la Gran Final (1 llave para cada uno). Triatlón Final (puntos x2). Ruleta Legendaria. Legendary Boxes al final. Ten la carta y el regalo a mano.' },
  { time: '00:00', what: 'Ceremonia: lee el marcador, corona al campeón, abre "La Última Carta" y El Último Baile.' },
];

export const PLAN_B = [
  { q: 'ARK no termina de actualizar', a: 'No pasa nada: en el EP 04 jugad Split Fiction (Silencio Total + Objetivo Oculto) y Rocket League al mejor de 3. Las pruebas de ARK quedan para otro día.' },
  { q: 'Un juego no funciona / no hay internet', a: 'Card Arena entero funciona sin conexión: Escoba, Dados Mentirosos, Hold\'em de salón. O Brawlhalla en local.' },
  { q: 'No tenemos algún material', a: 'Cada prueba lista sus materiales: elige otra de la misma categoría con "Pasar / cambiar" → "Sustituir al azar". Sin dados: usa la app (Card Arena → Dados). Sin baraja: Carta al azar en Card Arena.' },
  { q: 'Nos cansamos de una categoría', a: 'Salta de episodio en The Show (toca el episodio → "Saltar a este episodio") o usa "Prueba al azar" en Challenges filtrando por otra categoría.' },
  { q: 'Queremos cambiar el horario', a: 'El horario es solo orientativo. Los episodios se avanzan a mano: si vais tarde, juega 2 pruebas por episodio en lugar de 4.' },
  { q: 'No queremos seguir una prueba', a: '"Pasar / cambiar" en la prueba: no penaliza nunca. Si es romántica o picante, se pasa sin explicaciones.' },
  { q: 'Alguien va muy por detrás', a: 'El juego ya ayuda (bonus remontada, Sobre de la Remontada). Si hace falta más: Host → Control → regala una caja o carta, o lanza un Evento con la ruleta.' },
  { q: 'Se cierra la app o se apaga el móvil', a: 'Todo se guarda automáticamente en el navegador del móvil. Al volver a abrir, la partida sigue donde estaba. Para más seguridad: Host → Ajustes → Exportar partida.' },
  { q: 'Tatiana quiere usar su propio móvil', a: 'Los datos viven en cada dispositivo: el progreso NO se sincroniza entre móviles. Usad un solo móvil como "consola" del concurso (modo pantalla compartida, ya activado).' },
];

export const TOMORROW = [
  'Comprobar ARK y mandos cargados',
  'Móvil en No molestar · HOMELOTTERY en la Invitación',
  'Preparar desayuno + 3 bocados de la cata',
  'Entregar bandeja y móvil: "Esto es para ti"',
  'Operación Desayuno → registrar resultado',
  'EP 02: Siguiente episodio → Sobre del Calentamiento',
  'EP 03: Serie al mejor de 3 + repartir Plan Secreto',
  'Comida y descanso',
  'EP 04: consola (ARK solo si está listo)',
  'EP 05: barra de bebidas con mocktails',
  'EP 06: luces bajas, masaje, Ruleta de Medianoche',
  'EP 07: Movie Lottery → Bingo → peli',
  'EP 08: llaves, Triatlón, Legendary Boxes, carta y regalo',
  'Ceremonia y Último Baile',
];

export const PRESENTER_TIPS = [
  'Habla como presentador de concurso: "¡Y la siguiente prueba es…!". La actitud es el 50% del show.',
  'Deja que Tatiana pulse los botones grandes (abrir cajas, girar ruletas): la emoción es suya.',
  'Cuando abras tú una caja, usa "En privado" si sospechas que puede salir un premio para ella.',
  'Si va perdiendo, no te dejes ganar descaradamente: el juego ya tiene mecánicas de remontada.',
  'Host Mode se bloquea solo al salir. Nunca lo dejes abierto: ciérralo con "Bloquear" antes de pasar el móvil.',
  'Los premios románticos no se anuncian. Si pregunta qué hay en las cajas: "Eso es información clasificada".',
];

/* Chronological plan for tonight: what to do, in order, without thinking. */
export const TONIGHT_TIMELINE = [
  { id: 'n1', time: '20:30', what: 'Revisa la lista "Comprar si falta" (sección Materiales). Baraja, pelotas, hielo, snacks, mascarillas.' },
  { id: 'n2', time: '21:00', what: 'PS5: lanza la actualización de ARK y la de Split Fiction, y descarga Rocket League. Si sobra espacio, Brawlhalla. Deja la consola en modo reposo con descargas activas.' },
  { id: 'n3', time: '21:15', what: 'PC: abre el cliente de League of Legends, deja que parchee y comprueba que las dos cuentas inician sesión.' },
  { id: 'n4', time: '21:30', what: 'iPhone: abre la URL en Safari → Compartir → Añadir a pantalla de inicio. Después ábrela DESDE EL ICONO con WiFi y espera 10 segundos: así queda guardada para funcionar sin internet.' },
  { id: 'n5', time: '21:40', what: 'Dentro de la app del icono (no en Safari: iOS guarda los datos por separado): crea el PIN en Host Mode y configura tus límites en Preferencias. Mañana se juega siempre desde el icono.' },
  { id: 'n6', time: '21:50', what: 'Host Mode → Premios: cambia las pistas de "Tesoro de chocolate" y "Regalo escondido". Host Mode → Sobres: escribe tu mensaje en el Sobre Secreto de Gabriel.' },
  { id: 'n7', time: '22:00', what: 'Escribe a mano la carta para Tatiana (premio legendario "La Carta Secreta") y guárdala en un sobre cerrado.' },
  { id: 'n8', time: '22:20', what: 'Esconde la chocolatina, el detalle pequeño y el regalo principal. Apunta cada escondite en Host Mode → Control → Notas privadas.' },
  { id: 'n9', time: '22:40', what: 'Monta la zona de juego: barajas, dados, papel, bolis, vasos, pelota, antifaz, aceite de masaje.' },
  { id: 'n10', time: '22:50', what: 'Pon a cargar el móvil, los dos mandos, el altavoz y las velas LED.' },
  { id: 'n11', time: '23:00', what: 'Desayuno: deja a mano bandeja, café, zumo o naranjas, huevos, pan, fruta y los 3 bocados sorpresa de la cata.' },
  { id: 'n12', time: '23:10', what: 'Host Mode → Ajustes → Reiniciar partida conservando PIN y textos. La app queda en "Buenos días, Tatiana". Prueba rápida: pon el modo avión, cierra la app y ábrela desde el icono; debe abrir. Quita el modo avión y bloquea el móvil.' },
  { id: 'n13', time: '23:15', what: 'Mira el progreso de ARK antes de dormir. Si no va a terminar, no pasa nada: Plan B ya está pensado.' },
];
