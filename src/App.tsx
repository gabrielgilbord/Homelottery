import { useEffect, useRef, useState } from 'react';
import { useRoute, go } from './lib/router';
import { useGame, leader } from './state/store';
import { Icon } from './components/Icon';
import { AnimatedNumber, Modal, Toaster } from './components/ui';
import { Wordmark, OnAir, EpNum } from './components/Logo';
import { challengeById } from './data/challenges';
import { EPISODES } from './data/episodes';
import type { CategoryId } from './types';
import Intro from './screens/Intro';
import Home from './screens/Home';
import Show from './screens/Show';
import Challenges, { ChallengeDetail } from './screens/Challenges';
import Gaming from './screens/Gaming';
import CardArena from './screens/CardArena';
import Party from './screens/Party';
import Couples from './screens/Couples';
import Movie from './screens/Movie';
import Boxes from './screens/Boxes';
import Roulette from './screens/Roulette';
import Inventory from './screens/Inventory';
import Leaderboard from './screens/Leaderboard';
import Achievements from './screens/Achievements';
import Host from './screens/Host';
import Prefs from './screens/Prefs';
import Night from './screens/Night';

export interface NavItem { id: string; label: string; icon: string; world: string; show?: string }
export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Esta noche', items: [
    { id: 'home', label: 'Inicio', icon: 'home', world: 'home' },
    { id: 'show', label: 'El programa', icon: 'show', world: 'show', show: "Tonight's show" },
    { id: 'challenges', label: 'Pruebas', icon: 'target', world: 'show' },
    { id: 'night', label: 'Night Show', icon: 'star', world: 'couples', show: 'Para jugar ahora, aparte' },
  ] },
  { title: 'Secciones', items: [
    { id: 'gaming', label: 'Gaming', icon: 'gamepad', world: 'gaming', show: 'The Arcade Break' },
    { id: 'cards', label: 'Cartas y dados', icon: 'cards', world: 'cards', show: 'The Card Table' },
    { id: 'party', label: 'Fiesta', icon: 'glass', world: 'party', show: 'The Live Act' },
    { id: 'couples', label: 'En pareja', icon: 'heart', world: 'couples', show: 'After Hours' },
    { id: 'movie', label: 'Noche de cine', icon: 'film', world: 'movie', show: 'The Screening Room' },
  ] },
  { title: 'Premios', items: [
    { id: 'boxes', label: 'Cajas misteriosas', icon: 'gift', world: 'boxes' },
    { id: 'roulette', label: 'Ruleta', icon: 'wheel', world: 'roulette' },
    { id: 'inventory', label: 'Inventario', icon: 'bag', world: 'boxes' },
  ] },
  { title: 'Marcador', items: [
    { id: 'leaderboard', label: 'Marcador', icon: 'trophy', world: 'show' },
    { id: 'achievements', label: 'Logros', icon: 'medal', world: 'boxes' },
    { id: 'prefs', label: 'Mis límites', icon: 'sliders', world: 'couples' },
  ] },
  { title: 'Presentador', items: [{ id: 'host', label: 'Host Mode', icon: 'lock', world: 'host', show: 'Control room' }] },
];
/** The ground each screen is printed on (see tokens.css SCHEMES). */
const SCHEME: Record<string, string> = {
  show: 'paper', challenges: 'paper', challenge: 'paper', leaderboard: 'paper', inventory: 'paper', achievements: 'paper', prefs: 'paper',
  gaming: 'ink', movie: 'ink', host: 'ink', cards: 'ink', couples: 'stage', party: 'live', night: 'stage',
};
const SCHEME_BG: Record<string, string> = { night: '#2a101b', paper: '#f2e9d8', ink: '#171417', stage: '#3b1320', live: '#9a3f26' };
const BOTTOM_LABEL: Record<string, string> = { home: 'Inicio', show: 'Programa', challenges: 'Pruebas', boxes: 'Premios' };
const ALL = NAV_GROUPS.flatMap((g) => g.items);
const BOTTOM = ['home', 'show', 'challenges', 'boxes'];
const CAT_WORLD: Record<CategoryId, string> = { home: 'home', couples: 'couples', cards: 'cards', gaming: 'gaming', party: 'party', movie: 'movie' };

export default function App() {
  const s = useGame();
  const route = useRoute();
  const [menu, setMenu] = useState(false);
  const [hostUnlocked, setHostUnlocked] = useState(false);
  const [epCard, setEpCard] = useState<number | null>(null);
  const prevEp = useRef(s.episode);

  // Host Mode locks itself as soon as you leave it — secrets never linger on screen.
  useEffect(() => { if (route.name !== 'host') setHostUnlocked(false); }, [route.name]);

  // Episode title card whenever the show advances
  useEffect(() => {
    if (s.episode !== prevEp.current && s.introDone) {
      setEpCard(s.episode);
      const t = setTimeout(() => setEpCard(null), 2600);
      prevEp.current = s.episode;
      return () => clearTimeout(t);
    }
    prevEp.current = s.episode;
  }, [s.episode, s.introDone]);

  const ch = route.name === 'challenge' ? challengeById(route.param || '') : undefined;
  const world = ch ? CAT_WORLD[ch.category] : ALL.find((n) => n.id === route.name)?.world || 'home';
  const scheme = !s.introDone && route.name !== 'night' ? 'night' : SCHEME[route.name] || 'night';
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.world = world;
    html.dataset.scheme = scheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', SCHEME_BG[scheme]);
  }, [world, scheme]);

  // The Night Show is self-contained: it can be played before the Invitation without spoiling it.
  if (!s.introDone && route.name === 'night') return (<><div className="stage-light" /><main className="content solo"><div className="page"><Night standalone /></div></main><Toaster /></>);
  if (!s.introDone) return (<><div className="stage-light" /><Intro /><Toaster /></>);

  let screen;
  switch (route.name) {
    case 'show': screen = <Show />; break;
    case 'challenges': screen = <Challenges />; break;
    case 'challenge': screen = <ChallengeDetail id={route.param || ''} />; break;
    case 'gaming': screen = <Gaming />; break;
    case 'cards': screen = <CardArena />; break;
    case 'party': screen = <Party />; break;
    case 'couples': screen = <Couples />; break;
    case 'movie': screen = <Movie />; break;
    case 'boxes': screen = <Boxes />; break;
    case 'roulette': screen = <Roulette />; break;
    case 'inventory': screen = <Inventory />; break;
    case 'leaderboard': screen = <Leaderboard />; break;
    case 'achievements': screen = <Achievements />; break;
    case 'host': screen = <Host unlocked={hostUnlocked} onUnlock={() => setHostUnlocked(true)} onLock={() => { setHostUnlocked(false); go('home'); }} />; break;
    case 'prefs': screen = <Prefs />; break;
    case 'night': screen = <Night />; break;
    default: screen = <Home />;
  }

  const lead = leader(s);
  const ep = EPISODES[s.episode - 1];
  const current = (id: string) => route.name === id || (id === 'challenges' && route.name === 'challenge');

  return (
    <>
      <div className="stage-light" />
      <div className="shell">
        <nav className="rail" aria-label="Secciones">
          <button className="brand" onClick={() => go('home')} aria-label="Ir al inicio">
            <Wordmark size="md" tagline="Private broadcast" />
          </button>
          {NAV_GROUPS.map((g) => (
            <div key={g.title} className="group">
              <div className="label">{g.title}</div>
              {g.items.map((n) => (
                <button key={n.id} className="navlink" data-world={n.world} style={{ ['--dot' as string]: 'var(--accent)' }} aria-current={current(n.id) ? 'page' : undefined} onClick={() => go(n.id)}>
                  <Icon name={n.icon} size={18} /><span className="nl">{n.label}{n.show && <small>{n.show}</small>}</span><span className="ndot" />
                </button>
              ))}
            </div>
          ))}
        </nav>

        <header className="topbar no-print">
          <button className="brand" onClick={() => go('home')} aria-label="Ir al inicio">
            <Wordmark size="sm" />
          </button>
          <div className="status">
            <OnAir small />
            <EpNum n={s.episode} size="sm" />
            <b>{ep.title}</b>
            <span className="faint">{ep.time.replace(' – ', ' a ')}</span>
          </div>
          <button className="scorepill" onClick={() => go('leaderboard')} aria-label={`Marcador: Gabriel ${s.players.gabriel.points}, Tatiana ${s.players.tatiana.points}`}>
            <span className={'s gabriel' + (lead === 'gabriel' ? ' lead' : '')}><i>G</i><AnimatedNumber value={s.players.gabriel.points} /></span>
            <span className="sep" aria-hidden>vs</span>
            <span className={'s tatiana' + (lead === 'tatiana' ? ' lead' : '')}><AnimatedNumber value={s.players.tatiana.points} /><i>T</i></span>
          </button>
        </header>

        <main className="content" key={route.name + (route.param || '')}>
          <div className="page">{screen}</div>
        </main>

        <nav className="bottomnav no-print" aria-label="Navegación principal">
          {BOTTOM.map((id) => { const n = ALL.find((x) => x.id === id)!; return (
            <button key={id} className="navbtn" aria-current={current(id) ? 'page' : undefined} onClick={() => go(id)}>
              <span className="ni"><Icon name={n.icon} size={21} /></span>{BOTTOM_LABEL[id]}
            </button>
          ); })}
          <button className="navbtn" aria-current={menu ? 'page' : undefined} aria-haspopup="dialog" onClick={() => setMenu(true)}><span className="ni"><Icon name="menu" size={21} /></span>Más</button>
        </nav>
      </div>

      <Modal open={menu} onClose={() => setMenu(false)} title="La parrilla de hoy">
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className="menu-group">
            <div className="label">{g.title}</div>
            <div className="menu-grid">
              {g.items.map((n) => (
                <button key={n.id} className="menu-tile" data-world={n.world} aria-current={current(n.id) ? 'page' : undefined} onClick={() => { setMenu(false); go(n.id); }}>
                  <Icon name={n.icon} size={20} className="mi" /><span className="nl">{n.label}{n.show && <small>{n.show}</small>}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </Modal>

      {epCard && (
        <div className={'ep-card' + (epCard === 8 ? ' finale' : '')} aria-live="polite">
          <div className="ep-card-in">
            <div className="ep-row"><OnAir label={epCard === 8 ? 'Grand finale' : 'Next act'} /><span className="bc">Episodio {epCard} de 8</span></div>
            <div className="ep-big" aria-hidden>{String(epCard).padStart(2, '0')}</div>
            <div className="ep-t">{EPISODES[epCard - 1].title}</div>
            <div className="ep-s">{EPISODES[epCard - 1].subtitle}</div>
          </div>
        </div>
      )}
      <Toaster />
    </>
  );
}
