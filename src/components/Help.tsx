import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { Modal } from './ui';
import { startTour } from './Tour';

/** Contextual help: what this screen is for, what to tap, in plain words. No secrets (players can open it). */
interface HelpPage { title: string; need?: string[]; steps: ReactNode[] }
const HELP: Record<string, HelpPage> = {
  home: { title: 'Inicio', steps: [
    <>Arriba, el <b>episodio en emisión</b> y el <b>marcador</b> (puntos de cada uno y monedas).</>,
    <>La <b>entrada naranja</b> es la siguiente prueba: tócala para jugarla.</>,
    <><b>Te espera</b>: sobres listos para abrir y cajas gratis. <b>En este episodio</b>: las pruebas propuestas (no hace falta jugarlas todas).</>,
    <><b>Night Show</b>: un juego aparte para una noche suelta, con su propio marcador.</>,
  ] },
  show: { title: 'El programa', steps: [
    <><b>Ahora en emisión</b>: el episodio actual. <b>Pruebas del episodio</b> las lista; <b>Pasar al siguiente episodio</b> avanza (dos toques).</>,
    <><b>Parrilla de hoy</b>: los 8 episodios con su horario. Toca uno para ver sus pruebas.</>,
    <><b>Sobres secretos</b>: el que se mueve está listo; tócalo para abrirlo. Los cerrados dicen debajo cuándo se abren.</>,
  ] },
  challenges: { title: 'Las pruebas', steps: [
    <>Todas las pruebas. Filtra por mundo arriba o <b>busca</b> por nombre.</>,
    <><b>Al azar</b> elige una por vosotros. Toca cualquiera para ver sus reglas y jugarla.</>,
    <>Las que no encajan con vuestros límites salen atenuadas.</>,
  ] },
  challenge: { title: 'Una prueba', steps: [
    <><b>1. Qué necesitáis</b>: lo que hay que tener a mano. Si falta algo, <b>Pasar o cambiar</b>.</>,
    <><b>2. Cómo se juega</b>: los pasos en orden. Hay un <b>temporizador</b> si hace falta.</>,
    <><b>3. Cómo se gana</b>: cómo se puntúa y quién gana.</>,
    <><b>4. Al acabar</b>: toca quién ha ganado y <b>vuelve a tocar para confirmar</b>. La app suma puntos y monedas sola.</>,
  ] },
  boxes: { title: 'Cajas misteriosas', need: ['Monedas (o una caja gratis, o una llave para la Legendary)'], steps: [
    <>Elige quién abre en <b>Abre: Gabriel / Tatiana</b>. A la derecha ves sus monedas y llaves.</>,
    <>Toca una caja. Elige <b>Delante de los dos</b> o <b>Solo para…</b> (sale la cortina: mantener pulsado para ver).</>,
    <>Sale el premio. <b>Guardar premio</b>: queda en Más → Inventario. Cuando se cumpla, allí pulsas <b>Canjear</b>.</>,
    <>Las cajas mejores se desbloquean en episodios más avanzados.</>,
  ] },
  roulette: { title: 'La ruleta', need: ['Monedas'], steps: [
    <>Elige la ruleta arriba y quién gira en <b>Gira</b>.</>,
    <>Pulsa <b>Girar por N monedas</b>. Lo que toca sale en un ticket debajo.</>,
    <>Si sale <b>Doble o nada</b>: eliges cuánto te juegas (máx. 100) y <b>Jugar</b> o <b>Plantarse</b>.</>,
    <>Abajo están las probabilidades de cada porción.</>,
  ] },
  inventory: { title: 'Inventario', steps: [
    <>Elige de quién es el inventario en <b>Ver</b>.</>,
    <><b>Cartas</b>: toca una y <b>Usar carta</b> (dos toques). Te explica qué hace antes.</>,
    <><b>Misiones</b>: <b>Ver mis misiones en privado</b> y <b>Cumplida</b> cuando la consigas.</>,
    <><b>Premios ganados</b>: cuando se cumpla uno, <b>Canjear</b>.</>,
  ] },
  leaderboard: { title: 'Marcador', steps: [
    <>Puntos de cada uno: gana el día quien tenga más al final de la Gran Final.</>,
    <>Debajo, el cara a cara (monedas, victorias, rachas…) y el <b>historial</b> de todo lo que ha pasado.</>,
  ] },
  achievements: { title: 'Logros', steps: [<>Se consiguen solos al jugar y pagan su premio al momento. Aquí ves cuáles lleva cada uno.</>] },
  prefs: { title: 'Mis límites', steps: [
    <>Cada uno abre <b>sus</b> ajustes en privado: competición, nivel romántico, picante, alcohol y mundos que prefiere evitar.</>,
    <>Siempre se juega al nivel más suave de los dos.</>,
    <><b>Sonidos del show</b> y <b>Un solo móvil</b> (cortinas de privacidad) también están aquí.</>,
  ] },
  movie: { title: 'Noche de cine', need: ['Cualquier peli o serie', 'Este móvil'], steps: [
    <><b>Antes del play</b>: <b>Subasta</b> (qué veis), un cartón de <b>Bingo</b> para cada uno y 3 <b>Predicciones</b> selladas cada uno.</>,
    <><b>Durante</b>: tocáis casillas del Bingo cuando pasan y el contador <b>En vivo</b>. Sin pausar.</>,
    <><b>En los créditos</b>: se revelan predicciones y se juegan El Examen de la Peli y Los Críticos (en <b>Modos</b>).</>,
    <>Cada pestaña tiene arriba su <b>Cómo funciona</b>.</>,
  ] },
  party: { title: 'Fiesta', steps: [
    <>Elige una baraja (Yo Nunca, Más Probable, Verdad, Reto…) y <b>Robar carta</b>. No se repiten.</>,
    <><b>Laboratorio de cócteles</b>: genera una receta con o sin alcohol. Beber nunca es obligatorio.</>,
    <>Abajo, los <b>juegos de fiesta</b>: toca uno para ver reglas y jugarlo.</>,
  ] },
  couples: { title: 'En pareja', steps: [
    <>Arriba, el nivel que se juega hoy (el más suave de los dos). Se cambia en <b>Mis límites</b>.</>,
    <>Las barajas de pareja se roban igual que en Fiesta. Las privadas piden la cortina.</>,
    <>Debajo, las pruebas por nivel: Sweet, Spicy y Legendary.</>,
  ] },
  gaming: { title: 'Gaming', need: ['La consola o el PC encendidos'], steps: [
    <>Arriba, el marcador arcade y las rondas jugadas.</>,
    <><b>Girar</b> sortea campeón, rol y modo de LoL.</>,
    <>Debajo, las pruebas por juego. Toca una para ver reglas.</>,
  ] },
  cards: { title: 'Cartas y dados', need: ['Baraja española o de póker y dados para algunas pruebas'], steps: [
    <>Herramientas en la mesa: <b>Tirar</b> dados, <b>Lanzar</b> moneda y <b>Robar</b> carta al azar desde la app.</>,
    <><b>Series</b>: crea una serie al mejor de 3, 5 o 7 y apunta quién gana cada partida.</>,
    <>Debajo, las pruebas de cartas y dados.</>,
  ] },
  host: { title: 'Host Mode', steps: [<>Solo para Gabriel, con PIN. Se bloquea solo al salir.</>] },
};
const BASICS: ReactNode[] = [
  <><b>Pruebas</b>: se juegan y al acabar se toca quién gana (dos toques). La app suma sola.</>,
  <><b>Puntos</b> deciden quién gana el día. <b>Monedas</b> se gastan en cajas, ruletas y subastas.</>,
  <><b>Episodios</b>: el día va por capítulos; se avanza en El programa.</>,
  <>¿No apetece una prueba? <b>Pasar o cambiar</b>, sin penalización.</>,
  <>Todo se guarda solo en este móvil, también sin internet.</>,
];

export function HelpButton({ route }: { route: string }) {
  const [open, setOpen] = useState(false);
  const page = HELP[route] || HELP.home;
  return (
    <>
      <button className="help-btn" onClick={() => setOpen(true)} aria-label={`Ayuda: ${page.title}`}><span aria-hidden>?</span></button>
      <Modal open={open} onClose={() => setOpen(false)} eyebrow="Ayuda" title={page.title}>
        <div className="stack help-sheet" style={{ ['--gap' as string]: 'var(--s-4)' }}>
          {page.need && <div className="howto-need" style={{ borderTop: 0, paddingTop: 0 }}><b>Qué necesitáis</b><ul>{page.need.map((n) => <li key={n}>{n}</li>)}</ul></div>}
          <ol className="steps">{page.steps.map((s, i) => <li key={i}><span>{s}</span></li>)}</ol>
          <div className="help-basics"><h3 className="h3"><Icon name="info" size={16} /> El juego en 5 frases</h3><ul>{BASICS.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
          <div className="grid-2">
            <button className="btn ghost lg" onClick={() => { setOpen(false); setTimeout(startTour, 50); }}>Ver el tutorial</button>
            <button className="btn cta lg" onClick={() => setOpen(false)}>Entendido</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
