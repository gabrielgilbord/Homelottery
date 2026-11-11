import { CHALLENGES } from '../data/challenges';
import { ChallengeList } from './Challenges';
import { PageHead, Section } from '../components/ui';
import { DeckStage } from '../components/DeckDrawer';
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
      <PageHead title="Couples Mode" sub="Siempre al nivel más suave de los dos, y siempre con derecho a pasar. Las recompensas románticas no se anuncian: se descubren." />

      <section className="stack" style={{ ['--gap' as string]: 'var(--s-4)' }}>
        <div className="split"><span className="label">Nivel que se juega hoy</span><button className="btn quiet sm" onClick={() => go('prefs')}><Icon name="sliders" size={14} />Mis límites</button></div>
        <div className="intensity" role="list">
          {INTENSITY_ORDER.map((i, k) => (
            <div key={i} role="listitem" className={(k <= li ? 'on' : '') + (k === li ? ' current' : '')} aria-current={k === li ? 'true' : undefined}>
              <div className="il">{INTENSITY_LABEL[i]}</div>
              <div className="xs" style={{ marginTop: 4 }}>{DESC[i]}</div>
            </div>
          ))}
        </div>
        <p className="small faint">{PLAYERS.every((p) => s.prefs[p].configured) ? 'Los dos habéis configurado vuestros límites.' : `Falta que ${PLAYERS.filter((p) => !s.prefs[p].configured).map((p) => PLAYER_NAME[p]).join(' y ')} configure sus límites.`} Los de cada uno son privados.</p>
      </section>

      <Section title="Barajas de pareja">
        <DeckStage deckIds={level !== 'sweet' ? ['know', 'truth-spicy', 'datetheme', 'secretplan'] : ['know', 'datetheme', 'secretplan']} />
      </Section>

      {INTENSITY_ORDER.map((i) => (
        <Section key={i} title={INTENSITY_LABEL[i]} eyebrow={DESC[i]} aside={<span className={'tag ' + i}>{list.filter((c) => c.intensity === i).length} pruebas</span>}>
          <ChallengeList list={list.filter((c) => c.intensity === i)} />
        </Section>
      ))}
    </div>
  );
}
