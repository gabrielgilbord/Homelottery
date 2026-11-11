import { CHALLENGES } from '../data/challenges';
import { ChallengeList } from './Challenges';
import { PageHead, Section } from '../components/ui';
import { DeckDrawer } from '../components/DeckDrawer';
import { Icon } from '../components/Icon';
import { useGame, sharedIntensity } from '../state/store';
import { INTENSITY_LABEL, INTENSITY_ORDER, PLAYERS, PLAYER_NAME } from '../types';
import { go } from '../lib/router';

export default function Couples() {
  const s = useGame();
  const level = sharedIntensity(s);
  const list = CHALLENGES.filter((c) => c.category === 'couples');
  return (
    <div>
      <PageHead eyebrow="07 · Couples Mode" title={<>Couples <span className="accent">Mode</span></>} sub="Complicidad, confianza, romance y algo de picante. Siempre al nivel más suave de los dos, y siempre con derecho a pasar." num="07" />

      <div className="card glow stack">
        <div className="row between wrap">
          <div><div className="eyebrow" style={{ fontSize: 10 }}>Nivel común activo</div><div className="h-show" style={{ fontSize: 40, color: 'var(--accent)' }}>{INTENSITY_LABEL[level]}</div></div>
          <button className="btn" onClick={() => go('prefs')}><Icon name="sliders" />Mis límites</button>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {INTENSITY_ORDER.map((i) => <div key={i} style={{ flex: 1, height: 6, borderRadius: 9, background: INTENSITY_ORDER.indexOf(i) <= INTENSITY_ORDER.indexOf(level) ? 'var(--accent)' : 'rgba(255,255,255,.08)' }} />)}
        </div>
        <p className="tiny faint" style={{ margin: 0 }}>
          {PLAYERS.map((p) => `${PLAYER_NAME[p]}: ${s.prefs[p].configured ? 'configurado' : 'pendiente'}`).join(' · ')}. Los límites individuales son privados: aquí solo se ve el nivel común.
        </p>
      </div>

      <Section title="Barajas de pareja">
        <div className="grid two">
          <DeckDrawer deckId="know" compact />
          <DeckDrawer deckId="datetheme" compact />
          <DeckDrawer deckId="secretplan" compact />
          {level !== 'sweet' && <DeckDrawer deckId="truth-spicy" compact />}
        </div>
      </Section>

      {INTENSITY_ORDER.map((i) => (
        <Section key={i} title={INTENSITY_LABEL[i]} aside={<span className={'chip ' + i}>{i === 'sweet' ? 'Tierno' : i === 'spicy' ? 'Picante' : 'Legendario'}</span>}>
          <ChallengeList list={list.filter((c) => c.intensity === i)} />
        </Section>
      ))}

      <p className="tiny faint" style={{ marginTop: 20 }}>Las recompensas románticas no se anuncian: se descubren en las cajas y en la Ruleta de Medianoche.</p>
    </div>
  );
}
