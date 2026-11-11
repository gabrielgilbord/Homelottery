import { CHALLENGES } from '../data/challenges';
import { GAMES, LOL_CHAMPIONS, LOL_ROLES } from '../data/gaming';
import { ChallengeList } from './Challenges';
import { PageHead, Section } from '../components/ui';
import { NameSpinner } from '../components/NameSpinner';
import { DeckDrawer } from '../components/DeckDrawer';
import { Icon } from '../components/Icon';

const subs = ['League of Legends', 'Split Fiction', 'ARK', 'PlayStation F2P'];

export default function Gaming() {
  const list = CHALLENGES.filter((c) => c.category === 'gaming');
  return (
    <div>
      <PageHead eyebrow="04 · Gaming Arena" title={<>Gaming <span className="accent">Arena</span></>} sub="League of Legends, Split Fiction, ARK y los free-to-play de PlayStation que de verdad merecen la pena para dos." num="04" />

      <div className="card glow item" style={{ marginBottom: 8 }}>
        <div className="item-icon"><Icon name="info" /></div>
        <div><h3>Aviso ARK</h3><p>Las pruebas de ARK requieren el juego actualizado. Si la actualización no ha terminado, jugad Split Fiction o Rocket League: las pruebas de ARK se quedan para otro día.</p></div>
      </div>

      <Section title="Herramientas League of Legends">
        <div className="grid three">
          <NameSpinner items={LOL_CHAMPIONS} label="Ruleta de campeones" button="Girar campeón" />
          <NameSpinner items={LOL_ROLES} label="Ruleta de rol" button="Girar rol" />
          <NameSpinner items={['ARAM', 'Normal reclutamiento', 'Personalizada 1v1', 'Práctica (farmeo)', 'Co-op vs IA']} label="Modo de juego" button="Girar modo" />
        </div>
      </Section>

      <Section title="Barajas secretas">
        <div className="grid two">
          <DeckDrawer deckId="absurd-lol" />
          <DeckDrawer deckId="hidden-sf" />
        </div>
      </Section>

      {subs.map((sub) => (
        <Section key={sub} title={sub}>
          <ChallengeList list={list.filter((c) => c.sub === sub)} />
        </Section>
      ))}

      <Section title="Free-to-play recomendados (verificados)">
        <div className="grid two">
          {GAMES.filter((g) => g.price.startsWith('Gratis') && g.priority !== 'NO RECOMENDADO').map((g) => (
            <div key={g.name} className="card tight stack" style={{ gap: 8 }}>
              <div className="row between"><h3 style={{ margin: 0, fontSize: 16 }}>{g.name}</h3><span className="chip accent">{g.price}</span></div>
              <div className="small muted">{g.local}</div>
              <div className="tiny faint">PS Plus: {g.psPlus}</div>
              <a className="btn sm" href={g.link} target="_blank" rel="noreferrer"><Icon name="download" size={16} />Página oficial PlayStation</a>
            </div>
          ))}
        </div>
        <p className="tiny faint" style={{ marginTop: 10 }}>Precios y modos comprobados en las páginas oficiales de PlayStation y Epic Games (nov. 2026). Los tamaños de descarga no se publican en todas las fichas: miradlos en la consola.</p>
      </Section>
    </div>
  );
}
