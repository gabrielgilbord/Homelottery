import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { go, parseHash } from '../lib/router';
import { Icon } from './Icon';

/* =====================================================================
   Guided tour: a spotlight on the real interface, one short sentence per
   part, moving between screens when needed. Runs once after the
   Invitation; replay from the "?" help or Más → Tutorial.
   No secrets: it never opens a box, an envelope or Host Mode.
   ===================================================================== */
export const TOUR_KEY = 'homelottery.tour.v1';
export const tourDone = () => { try { return localStorage.getItem(TOUR_KEY) === 'done'; } catch { return true; } };
const markDone = () => { try { localStorage.setItem(TOUR_KEY, 'done'); } catch { /* storage blocked */ } };
export const startTour = () => window.dispatchEvent(new Event('hl:tour'));

interface Step { route?: string; param?: string; sel?: string; desk?: string; title: string; text: ReactNode }
const STEPS: Step[] = [
  { title: 'Bienvenidos al plató', text: <>HOMELOTTERY es un programa de tele para los dos. En un minuto os enseño dónde está cada cosa. Podéis saltarlo cuando queráis.</> },
  { route: 'home', sel: '.mh-ep', title: 'El episodio en emisión', text: <>El día va por <b>8 episodios</b>, como capítulos. Aquí veis cuál toca ahora, su título y su horario. Las rayitas son los 8 capítulos.</> },
  { route: 'home', sel: '.plate', title: 'El marcador', text: <><b>Puntos</b>: deciden quién gana el día. <b>Monedas</b>: se gastan en cajas, ruletas y subastas. Se suman solos.</> },
  { route: 'home', sel: '.invite', title: 'La siguiente prueba', text: <>La entrada naranja es <b>lo siguiente que toca jugar</b>. Tocadla y se abre la prueba.</> },
  { route: 'home', sel: '.bottomnav', desk: '.rail', title: 'Cómo moverse', text: <><b>Inicio</b>: esta pantalla. <b>Programa</b>: episodios y sobres. <b>Pruebas</b>: todas, con buscador. <b>Premios</b>: las cajas. <b>Más</b>: ruleta, inventario, marcador, cine, límites…</> },
  { route: 'home', sel: '.help-btn', title: '¿Perdidos?', text: <>Este <b>?</b> explica la pantalla en la que estéis, en cualquier momento.</> },
  { route: 'challenge', param: 'p-likely', sel: '.need-box', title: 'Una prueba por dentro', text: <>Cada prueba va en 4 bloques. <b>1. Qué necesitáis</b>: lo que hay que tener a mano.</> },
  { route: 'challenge', param: 'p-likely', sel: '.ctools', title: 'Las cartas, aquí mismo', text: <>Si la prueba usa cartas (Mímica, Yo Nunca…), dados, moneda o ruleta, <b>salen dentro de la prueba</b>. Robáis y jugáis sin cambiar de pantalla.</> },
  { route: 'challenge', param: 'p-likely', sel: '.result-panel', title: 'Al acabar', text: <>Tocad <b>quién ha ganado</b> y <b>otra vez para confirmar</b>. La app suma puntos y monedas. ¿No apetece? <b>Pasar o cambiar</b>, sin penalización.</> },
  { route: 'show', sel: '.now-block', title: 'El programa', text: <>El episodio en emisión, sus pruebas y <b>Pasar al siguiente episodio</b> cuando queráis avanzar.</> },
  { route: 'show', sel: '.env-grid', title: 'Los sobres secretos', text: <>El sobre que <b>se mueve</b> está listo: tocadlo para abrirlo. Los cerrados dicen debajo cuándo se abren.</> },
  { route: 'boxes', sel: '.vault', title: 'Cajas misteriosas', text: <>Se pagan con monedas y dan premios. Elegid arriba <b>quién abre</b> y tocad una caja. Las mejores se desbloquean más tarde.</> },
  { route: 'roulette', sel: '.wheel-stage', title: 'La ruleta', text: <>Elegid la ruleta y <b>quién gira</b>, y pulsad <b>Girar</b>. Lo que toca sale en un ticket.</> },
  { route: 'movie', sel: '.howto', title: 'Noche de cine', text: <>Para cualquier peli o serie: subasta, bingo, predicciones… Cada pestaña tiene su <b>Cómo funciona</b>.</> },
  { route: 'home', sel: '.night-door', title: 'Night Show', text: <>Un juego aparte para una noche suelta, con su propio marcador. Un toque y empezáis.</> },
  { route: 'home', title: '¡A jugar!', text: <>Eso es todo. El tutorial se repite desde el <b>?</b> o en <b>Más → Tutorial</b>. Que empiece el show.</> },
];

export function Tour({ autoStart }: { autoStart: boolean }) {
  const [i, setI] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // auto-start at most once per session (arriving at Inicio again must not restart it)
  const autoTried = useRef(false);
  useEffect(() => { if (autoStart && !autoTried.current) { autoTried.current = true; if (!tourDone()) setI(0); } }, [autoStart]);
  useEffect(() => { const on = () => setI(0); window.addEventListener('hl:tour', on); return () => window.removeEventListener('hl:tour', on); }, []);

  const step = i === null ? null : STEPS[i];
  // move to the step's screen, then find and frame its element
  useLayoutEffect(() => {
    if (!step) return;
    setRect(null);
    if (step.route) { const r = parseHash(); if (r.name !== step.route || (step.param && r.param !== step.param)) go(step.route, step.param); }
    let raf = 0, tries = 0, stop = false;
    const desk = window.matchMedia('(min-width: 900px)').matches;
    const sel = desk && step.desk ? step.desk : step.sel;
    const find = () => {
      if (stop) return;
      const el = sel ? (document.querySelector(sel) as HTMLElement | null) : null;
      if (el) {
        const fixed = getComputedStyle(el).position === 'fixed';
        if (!fixed) el.scrollIntoView({ block: 'center' });
        requestAnimationFrame(() => setRect(el.getBoundingClientRect()));
        return;
      }
      if (sel && tries++ < 60) raf = requestAnimationFrame(find);
    };
    raf = requestAnimationFrame(find);
    return () => { stop = true; cancelAnimationFrame(raf); };
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!step?.sel) return;
    const upd = () => { const el = document.querySelector(step.sel!) as HTMLElement | null; if (el) setRect(el.getBoundingClientRect()); };
    window.addEventListener('resize', upd); window.addEventListener('scroll', upd, { passive: true });
    return () => { window.removeEventListener('resize', upd); window.removeEventListener('scroll', upd); };
  }, [step]);

  useEffect(() => {
    if (i === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(); if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') back(); };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  if (i === null || !step) return null;
  const finish = () => { markDone(); setI(null); go('home'); };
  const next = () => (i < STEPS.length - 1 ? setI(i + 1) : finish());
  const back = () => i > 0 && setI(i - 1);

  const pad = 8;
  const hole = rect && rect.width > 0 ? { top: Math.max(4, rect.top - pad), left: Math.max(4, rect.left - pad), width: Math.min(window.innerWidth - 8, rect.width + pad * 2), height: Math.min(window.innerHeight - 8, rect.height + pad * 2) } : null;
  const cardAtTop = hole ? hole.top + hole.height / 2 > window.innerHeight / 2 : false;

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label={`Tutorial, paso ${i + 1} de ${STEPS.length}: ${step.title}`}>
      {hole ? <div className="tour-hole" style={hole} /> : <div className="tour-dim" />}
      <div className={'tour-card' + (hole ? (cardAtTop ? ' at-top' : ' at-bottom') : ' at-center')} key={i}>
        <div className="tour-top"><span className="bc">Tutorial</span><span className="tour-n">{i + 1} de {STEPS.length}</span></div>
        <h2 className="tour-title">{step.title}</h2>
        <p className="tour-text">{step.text}</p>
        <div className="tour-dots" aria-hidden>{STEPS.map((_, k) => <i key={k} className={k === i ? 'on' : k < i ? 'past' : ''} />)}</div>
        <div className="tour-actions">
          <button className="btn quiet sm" onClick={finish}>Saltar</button>
          <span className="cluster" style={{ ['--gap' as string]: '6px' }}>
            {i > 0 && <button className="btn ghost sm" onClick={back}><Icon name="chevron" size={14} style={{ transform: 'rotate(180deg)' }} />Atrás</button>}
            <button className="btn cta" onClick={next}>{i === STEPS.length - 1 ? 'Empezar' : 'Siguiente'}<Icon name="chevron" size={16} /></button>
          </span>
        </div>
      </div>
    </div>
  );
}
