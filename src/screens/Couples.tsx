import { CHALLENGES } from '../data/challenges';
import { ChallengeList } from './Challenges';
import { PageHead, Section } from '../components/ui';
import { DeckDrawer } from '../components/DeckDrawer';
import { Icon } from '../components/Icon';
import { useGame, sharedIntensity } from '../state/store';
import { INTENSITY_LABEL, INTENSITY_ORDER, PLAYERS, PLAYER_NAME } from '../types';
import { go } from '../lib/router';

const DESC = { sweet: 'Complicidad y ternura', spicy: 'Con chispa y picante', legendary: 'Momentos que se recuerdan' };

export default function Couples() {
  const s = useGame();
  const level = sharedIntensity(s);
  const li = INTENSITY_ORDER.indexOf(level);
  const list = CHALLENGES.filter((c) => c.category === 'couples');
  return (
    <div>
      <PageHead eyebrow="Arena" title={<>Couples <span className="italic">Mode</span></>} sub="Siempre al nivel más suave de los dos y siempre con derecho a pasar. Las recompensas románticas no se anuncian: se descubren." />

      <section className="stack" style={{ ['--gap' as string]: 'var(--s-4)' }}>
        <div className="split"><span className="eyebrow">Nivel común activo</span><button className="btn quiet sm" onClick={() => go('prefs')}><Icon name="sliders" size={14} />Mis límites</button></div>
        <div className="intensity" role="list">
          {INTENSITY_ORDER.map((i, k) => (
            <div key={i} role="listitem" className={k <= li ? 'on' : ''} aria-current={k === li ? 'true' : undefined}>
              <div className="il">{INTENSITY_LABEL[i]}</div>
              <div className="xs" style={{ marginTop: 6 }}>{DESC[i]}</div>
            </div>
          ))}
        </div>
        <p className="xs faint">{PLAYERS.map((p) => `${PLAYER_NAME[p]}: ${s.prefs[p].configured ? 'configurado' : 'pendiente'}`).join(' · ')}. Los límites individuales son privados.</p>
      </section>

      <Section title="Barajas de pareja">
        <div className="grid-auto" style={{ ['--min' as string]: '300px' }}>
          <DeckDrawer deckId="know" />
          <DeckDrawer deckId="datetheme" />
          <DeckDrawer deckId="secretplan" />
          {level !== 'sweet' && <DeckDrawer deckId="truth-spicy" />}
        </div>
      </Section>

      {INTENSITY_ORDER.map((i) => (
        <Section key={i} title={INTENSITY_LABEL[i]} eyebrow={DESC[i]} aside={<span className={'tag ' + i}>{list.filter((c) => c.intensity === i).length}</span>}>
          <ChallengeList list={list.filter((c) => c.intensity === i)} />
        </Section>
      ))}
    </div>
  );
}
