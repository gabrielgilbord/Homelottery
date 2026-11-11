import { CHALLENGES } from '../data/challenges';
import { GAMES, LOL_CHAMPIONS, LOL_ROLES } from '../data/gaming';
import { ChallengeList } from './Challenges';
import { PageHead, Section } from '../components/ui';
import { NameSpinner } from '../components/NameSpinner';
import { DeckDrawer } from '../components/DeckDrawer';
import { Icon } from '../components/Icon';

const GAME_PANELS = [
  { sub: 'League of Legends', id: 'lol', mark: 'LoL', note: 'PC · online' },
  { sub: 'Split Fiction', id: 'sf', mark: 'SF', note: 'PS5 · pantalla dividida' },
  { sub: 'ARK', id: 'ark', mark: 'ARK', note: 'PS5 · requiere actualización' },
  { sub: 'PlayStation F2P', id: 'ps', mark: 'PS', note: 'Gratis · local' },
];

export default function Gaming() {
  const list = CHALLENGES.filter((c) => c.category === 'gaming');
  const f2p = GAMES.filter((g) => g.price.startsWith('Gratis') && g.priority !== 'NO RECOMENDADO' && g.platform !== 'PC');
  return (
    <div>
      <PageHead eyebrow="Arena" title="Gaming Arena" sub="League of Legends, Split Fiction, ARK y los free-to-play de PlayStation que de verdad funcionan para dos en un sofá." />

      <div className="game-panel" data-game="lol">
        <div className="gp-head"><span className="gp-mark">LoL</span><div className="stack grow" style={{ ['--gap' as string]: '2px' }}><h2 className="h3">Herramientas de la Grieta</h2><span className="xs faint mono">Ruleta de campeón, rol y modo</span></div></div>
        <div className="grid-auto" style={{ ['--min' as string]: '200px' }}>
          <NameSpinner items={LOL_CHAMPIONS} label="Campeón" button="Girar campeón" />
          <NameSpinner items={LOL_ROLES} label="Rol" button="Girar rol" />
          <NameSpinner items={['ARAM', 'Normal', 'Personalizada 1v1', 'Práctica (farmeo)', 'Co-op vs IA']} label="Modo" button="Girar modo" />
        </div>
      </div>

      <Section title="Barajas secretas" eyebrow="Una regla oculta por partida">
        <div className="grid-auto" style={{ ['--min' as string]: '300px' }}>
          <DeckDrawer deckId="absurd-lol" />
          <DeckDrawer deckId="hidden-sf" />
        </div>
      </Section>

      {GAME_PANELS.map((g) => (
        <section key={g.id} className="section">
          <div className="game-panel" data-game={g.id}>
            <div className="gp-head">
              <span className="gp-mark">{g.mark}</span>
              <div className="stack grow" style={{ ['--gap' as string]: '2px' }}><h2 className="h3">{g.sub}</h2><span className="xs faint mono">{g.note}</span></div>
            </div>
            {g.id === 'ark' && <p className="small muted" style={{ marginBottom: 'var(--s-4)' }}>Si la actualización no ha terminado, estas pruebas se quedan para otro día. Plan B: Split Fiction o Rocket League.</p>}
            <ChallengeList list={list.filter((c) => c.sub === g.sub)} />
            {g.id === 'ps' && (
              <div className="list" style={{ marginTop: 'var(--s-5)' }}>
                {f2p.map((x) => (
                  <a key={x.name} className="row-item" href={x.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <span className="grow stack" style={{ ['--gap' as string]: '2px' }}>
                      <span className="cluster"><span className="h5">{x.name}</span><span className="tag value">{x.price}</span></span>
                      <span className="xs faint">{x.local} · PS Plus: {x.psPlus}</span>
                    </span>
                    <Icon name="download" size={18} className="chev" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
      <p className="xs faint" style={{ marginTop: 'var(--s-5)' }}>Precios y modos comprobados en las páginas oficiales de PlayStation y Epic Games (nov. 2026). Los tamaños de descarga se ven en la consola.</p>
    </div>
  );
}
