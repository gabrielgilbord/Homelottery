import { useEffect, useState } from 'react';
import { useRoute, go } from './lib/router';
import { useGame } from './state/store';
import { Icon } from './components/Icon';
import { Modal, Toaster } from './components/ui';
import { PLAYER_NAME } from './types';
import { challengeById } from './data/challenges';
import { CATEGORIES } from './data/episodes';
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

export const NAV = [
  { id: 'home', label: 'Home', icon: 'home', theme: 'home' },
  { id: 'show', label: 'The Show', icon: 'show', theme: 'leader' },
  { id: 'challenges', label: 'Challenges', icon: 'target', theme: 'home' },
  { id: 'gaming', label: 'Gaming Arena', icon: 'gamepad', theme: 'gaming' },
  { id: 'cards', label: 'Card Arena', icon: 'cards', theme: 'cards' },
  { id: 'party', label: 'Party Mode', icon: 'glass', theme: 'party' },
  { id: 'couples', label: 'Couples Mode', icon: 'heart', theme: 'couples' },
  { id: 'movie', label: 'Movie Night', icon: 'film', theme: 'movie' },
  { id: 'boxes', label: 'Mystery Boxes', icon: 'gift', theme: 'boxes' },
  { id: 'roulette', label: 'Roulette', icon: 'wheel', theme: 'roulette' },
  { id: 'inventory', label: 'Inventory', icon: 'bag', theme: 'inventory' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy', theme: 'leader' },
  { id: 'achievements', label: 'Achievements', icon: 'medal', theme: 'boxes' },
  { id: 'host', label: 'Host Mode', icon: 'lock', theme: 'host' },
];

const BOTTOM = ['home', 'show', 'challenges', 'boxes'];

export default function App() {
  const s = useGame();
  const route = useRoute();
  const [menu, setMenu] = useState(false);
  const [hostUnlocked, setHostUnlocked] = useState(false);

  // Host mode locks itself as soon as you leave it — secrets never linger on screen.
  useEffect(() => { if (route.name !== 'host') setHostUnlocked(false); }, [route.name]);

  const navItem = NAV.find((n) => n.id === route.name);
  const ch = route.name === 'challenge' ? challengeById(route.param || '') : undefined;
  const theme = ch ? CATEGORIES[ch.category].theme : route.name === 'prefs' ? 'couples' : navItem?.theme || 'home';
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  if (!s.introDone) return (<><div className="ambient" /><Intro /><Toaster /></>);

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

  const g = s.players.gabriel, t = s.players.tatiana;
  return (
    <>
      <div className="ambient" />
      <div className="app">
        <aside className="sidebar">
          <button className="brand" onClick={() => go('home')} style={{ marginBottom: 22, padding: '0 6px' }}>
            <div className="brand-mark">H</div>
            <div><div className="brand-name">HOMELOTTERY</div><div className="brand-sub">Gabriel × Tatiana</div></div>
          </button>
          {NAV.map((n, i) => (
            <button key={n.id} className={'navlink' + (route.name === n.id ? ' active' : '')} onClick={() => go(n.id)}>
              <span className="navnum">{String(i + 1).padStart(2, '0')}</span><Icon name={n.icon} size={18} />{n.label}
            </button>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <button className={'navlink' + (route.name === 'prefs' ? ' active' : '')} onClick={() => go('prefs')}><span className="navnum" /><Icon name="sliders" size={18} />Preferencias y límites</button>
          </div>
        </aside>

        <header className="topbar no-print">
          <button className="brand" onClick={() => go('home')}>
            <div className="brand-mark">H</div>
            <div><div className="brand-name">HOMELOTTERY</div><div className="brand-sub">Ep 0{s.episode} · Gabriel × Tatiana</div></div>
          </button>
          <div className="mini-score" onClick={() => go('leaderboard')} style={{ cursor: 'pointer' }}>
            <span className="mini-chip"><span className="dot" style={{ background: 'var(--gabriel)' }}>G</span>{g.points}</span>
            <span className="mini-chip"><span className="dot" style={{ background: 'var(--tatiana)' }}>T</span>{t.points}</span>
          </div>
        </header>

        <main className="main">{screen}</main>

        <nav className="bottomnav no-print">
          {BOTTOM.map((id) => { const n = NAV.find((x) => x.id === id)!; return (
            <button key={id} className={'navbtn' + (route.name === id || (id === 'challenges' && route.name === 'challenge') ? ' active' : '')} onClick={() => go(id)}>
              <Icon name={n.icon} size={22} />{n.label.replace('Mystery ', '')}
            </button>
          ); })}
          <button className={'navbtn' + (menu ? ' active' : '')} onClick={() => setMenu(true)}><Icon name="menu" size={22} />Menú</button>
        </nav>
      </div>

      <Modal open={menu} onClose={() => setMenu(false)} eyebrow="HOMELOTTERY" title="Todas las secciones">
        <div className="menu-grid">
          {NAV.map((n, i) => (
            <button key={n.id} className="menu-tile" data-theme={n.theme} onClick={() => { setMenu(false); go(n.id); }}>
              <div className="row between"><Icon name={n.icon} style={{ color: 'var(--accent)' }} /><span className="n">{String(i + 1).padStart(2, '0')}</span></div>
              <b>{n.label.toUpperCase()}</b>
            </button>
          ))}
          <button className="menu-tile" data-theme="couples" onClick={() => { setMenu(false); go('prefs'); }}>
            <div className="row between"><Icon name="sliders" style={{ color: 'var(--accent)' }} /><span className="n">+</span></div>
            <b>PREFERENCIAS Y LÍMITES</b>
          </button>
        </div>
        <p className="tiny faint" style={{ marginTop: 14 }}>Jugadores: {PLAYER_NAME.gabriel} y {PLAYER_NAME.tatiana}. Todo se guarda automáticamente en este dispositivo.</p>
      </Modal>
      <Toaster />
    </>
  );
}
