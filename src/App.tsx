import { useEffect, useRef, useState } from 'react';
import { useRoute, go } from './lib/router';
import { useGame, leader } from './state/store';
import { Icon } from './components/Icon';
import { AnimatedNumber, Modal, Toaster } from './components/ui';
import { Wordmark } from './components/Logo';
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

export interface NavItem { id: string; label: string; icon: string; world: string }
export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'El show', items: [
    { id: 'home', label: 'Inicio', icon: 'home', world: 'home' },
    { id: 'show', label: 'The Show', icon: 'show', world: 'show' },
    { id: 'challenges', label: 'Challenges', icon: 'target', world: 'home' },
  ] },
  { title: 'Arenas', items: [
    { id: 'gaming', label: 'Gaming Arena', icon: 'gamepad', world: 'gaming' },
    { id: 'cards', label: 'Card Arena', icon: 'cards', world: 'cards' },
    { id: 'party', label: 'Party Mode', icon: 'glass', world: 'party' },
    { id: 'couples', label: 'Couples Mode', icon: 'heart', world: 'couples' },
    { id: 'movie', label: 'Movie Night', icon: 'film', world: 'movie' },
  ] },
  { title: 'Premios', items: [
    { id: 'boxes', label: 'Mystery Boxes', icon: 'gift', world: 'boxes' },
    { id: 'roulette', label: 'Roulette', icon: 'wheel', world: 'roulette' },
    { id: 'inventory', label: 'Inventario', icon: 'bag', world: 'boxes' },
  ] },
  { title: 'Marcador', items: [
    { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy', world: 'home' },
    { id: 'achievements', label: 'Logros', icon: 'medal', world: 'boxes' },
    { id: 'prefs', label: 'Preferencias', icon: 'sliders', world: 'couples' },
  ] },
  { title: 'Presentador', items: [{ id: 'host', label: 'Host Mode', icon: 'lock', world: 'host' }] },
];
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
  useEffect(() => { document.documentElement.dataset.world = world; }, [world]);

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
            <Wordmark />
            <div className="label" style={{ marginTop: 6 }}>Gabriel y Tatiana</div>
          </button>
          {NAV_GROUPS.map((g) => (
            <div key={g.title} className="group">
              <div className="label">{g.title}</div>
              {g.items.map((n) => (
                <button key={n.id} className="navlink" data-world={n.world} style={{ ['--dot' as string]: 'var(--accent)' }} aria-current={current(n.id) ? 'page' : undefined} onClick={() => go(n.id)}>
                  <Icon name={n.icon} size={18} />{n.label}<span className="ndot" />
                </button>
              ))}
            </div>
          ))}
        </nav>

        <header className="topbar no-print">
          <button className="brand" onClick={() => go('home')} aria-label="Ir al inicio">
            <Wordmark />
          </button>
          <div className="status">
            <span className="live-dot" />
            <span>Episodio {s.episode} de 8</span>
            <b style={{ color: 'var(--ivory)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ep.title}</b>
          </div>
          <button className="scorepill" onClick={() => go('leaderboard')} aria-label={`Marcador: Gabriel ${s.players.gabriel.points}, Tatiana ${s.players.tatiana.points}`}>
            <span className={'s' + (lead === 'gabriel' ? ' lead' : '')}><span className="avatar sm gabriel">G</span><AnimatedNumber value={s.players.gabriel.points} /></span>
            <span className="sep" />
            <span className={'s' + (lead === 'tatiana' ? ' lead' : '')}><AnimatedNumber value={s.players.tatiana.points} /><span className="avatar sm tatiana">T</span></span>
          </button>
        </header>

        <main className="content" key={route.name + (route.param || '')}>
          <div className="page">{screen}</div>
        </main>

        <nav className="bottomnav no-print" aria-label="Navegación principal">
          {BOTTOM.map((id) => { const n = ALL.find((x) => x.id === id)!; return (
            <button key={id} className="navbtn" aria-current={current(id) ? 'page' : undefined} onClick={() => go(id)}>
              <span className="ni"><Icon name={n.icon} size={21} /></span>{n.label.replace('Mystery ', '')}
            </button>
          ); })}
          <button className="navbtn" aria-current={menu ? 'page' : undefined} aria-haspopup="dialog" onClick={() => setMenu(true)}><span className="ni"><Icon name="menu" size={21} /></span>Más</button>
        </nav>
      </div>

      <Modal open={menu} onClose={() => setMenu(false)} title="Todas las secciones">
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className="menu-group">
            <div className="label">{g.title}</div>
            <div className="menu-grid">
              {g.items.map((n) => (
                <button key={n.id} className="menu-tile" data-world={n.world} aria-current={current(n.id) ? 'page' : undefined} onClick={() => { setMenu(false); go(n.id); }}>
                  <Icon name={n.icon} size={20} className="mi" />{n.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Modal>

      {epCard && (
        <div className={'ep-card' + (epCard === 8 ? ' finale' : '')} aria-live="polite">
          <div>
            <div className="ep-n">{epCard === 8 ? 'Llega la Gran Final' : `Episodio ${epCard} de 8`}</div>
            <div className="ep-t">{EPISODES[epCard - 1].title}</div>
          </div>
        </div>
      )}
      <Toaster />
    </>
  );
}
