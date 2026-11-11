import { useGame } from '../state/store';
import { CHALLENGES } from '../data/challenges';
import { GAMES, LOL_CHAMPIONS, LOL_ROLES } from '../data/gaming';
import { ChallengeList } from './Challenges';
import { PageHead, Section } from '../components/ui';
import { NameSpinner } from '../components/NameSpinner';
import { DeckStage } from '../components/DeckDrawer';
import { Icon } from '../components/Icon';

const GAME_PANELS = [
  { sub: 'League of Legends', id: 'lol', mark: 'LoL', note: 'En PC, online' },
  { sub: 'Split Fiction', id: 'sf', mark: 'SF', note: 'PS5, pantalla dividida' },
  { sub: 'ARK', id: 'ark', mark: 'ARK', note: 'PS5, necesita estar actualizado' },
  { sub: 'PlayStation F2P', id: 'ps', mark: 'PS', note: 'Gratis, en la misma consola' },
];

/** Arcade scoreboard: P1 vs P2, gaming rounds played, who holds the high score. */
function ArcadeBoard() {
  const s = useGame();
  const games = CHALLENGES.filter((c) => c.category === 'gaming');
  const played = games.filter((c) => s.completed[c.id]).length;
  const g = s.players.gabriel.points, t = s.players.tatiana.points;
  return (
    <section className="arcade" aria-label={`Ronda ${played + 1} de ${games.length}. Gabriel ${g}, Tatiana ${t}`}>
      <div className="ar-row">
        <span className={'ar-p' + (g >= t ? ' hi' : '')}><b>P1</b>Gabriel<i>{String(g).padStart(4, '0')}</i></span>
        <span className="ar-vs" aria-hidden>VS</span>
        <span className={'ar-p right' + (t >= g ? ' hi' : '')}><b>P2</b>Tatiana<i>{String(t).padStart(4, '0')}</i></span>
      </div>
      <div className="ar-rounds" aria-hidden>
        <span>Ronda {played + 1}</span>
        <span className="ar-pips">{games.map((c) => <i key={c.id} className={s.completed[c.id] ? 'on' : ''} />)}</span>
        <span>{played} de {games.length}</span>
      </div>
    </section>
  );
}

export default function Gaming() {
  const list = CHALLENGES.filter((c) => c.category === 'gaming');
  const f2p = GAMES.filter((g) => g.price.startsWith('Gratis') && g.priority !== 'NO RECOMENDADO' && g.platform !== 'PC');
  return (
    <div>
      <PageHead show="The Arcade Break" title="Gaming" sub="League of Legends, Split Fiction, ARK y los gratuitos de PlayStation que funcionan para dos en el mismo sofá." />
      <ArcadeBoard />

      <div className="game-panel" data-game="lol">
        <div className="gp-head"><span className="gp-mark">LoL</span><div className="stack grow" style={{ ['--gap' as string]: '2px' }}><h2 className="h3">Sorteo para la Grieta</h2><span className="small faint">Campeón, rol y modo de juego</span></div></div>
        <div className="slots">
          <NameSpinner items={LOL_CHAMPIONS} label="Campeón" button="Girar campeón" />
          <NameSpinner items={LOL_ROLES} label="Rol" button="Girar rol" />
          <NameSpinner items={['ARAM', 'Normal', 'Personalizada 1v1', 'Práctica (farmeo)', 'Co-op vs IA']} label="Modo" button="Girar modo" />
        </div>
      </div>

      <Section title="Reglas secretas" eyebrow="Cada uno roba una en privado antes de la partida">
        <DeckStage deckIds={['absurd-lol', 'hidden-sf']} />
      </Section>

      {GAME_PANELS.map((g) => (
        <section key={g.id} className="section">
          <div className="game-panel" data-game={g.id}>
            <div className="gp-head">
              <span className="gp-mark">{g.mark}</span>
              <div className="stack grow" style={{ ['--gap' as string]: '2px' }}><h2 className="h3">{g.sub}</h2><span className="small faint">{g.note}</span></div>
            </div>
            {g.id === 'ark' && <p className="small muted" style={{ marginBottom: 'var(--s-4)' }}>Si la actualización no ha terminado, estas pruebas se quedan para otro día. Plan B: Split Fiction o Rocket League.</p>}
            <ChallengeList list={list.filter((c) => c.sub === g.sub)} />
            {g.id === 'ps' && (
              <div className="list" style={{ marginTop: 'var(--s-5)' }}>
                {f2p.map((x) => (
                  <a key={x.name} className="row-item" href={x.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <span className="grow stack" style={{ ['--gap' as string]: '2px' }}>
                      <span className="cluster"><span className="h5">{x.name}</span><span className="tag value">{x.price}</span></span>
                      <span className="small faint">{x.local}</span>
                    </span>
                    <Icon name="download" size={18} className="chev" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
      <p className="small faint" style={{ marginTop: 'var(--s-5)' }}>Precios y modos comprobados en las páginas oficiales de PlayStation y Epic Games (nov. 2026). Los tamaños de descarga se ven en la consola.</p>
    </div>
  );
}
