import { useState } from 'react';
import { CHALLENGES } from '../data/challenges';
import { COCKTAIL } from '../data/gaming';
import { ChallengeList } from './Challenges';
import { PageHead, PlayerSwitch, Section, Toggle } from '../components/ui';
import { DeckDrawer } from '../components/DeckDrawer';
import { Icon } from '../components/Icon';
import { useGame } from '../state/store';
import { pick } from '../lib/random';
import type { PlayerId } from '../types';

function CocktailLab() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const canAlcohol = s.prefs[who].alcohol;
  const [alc, setAlc] = useState(false);
  const [mix, setMix] = useState<null | { base: string; mixer: string; garnish: string; style: string }>(null);
  const useAlc = alc && canAlcohol;
  const gen = () => {
    const base = useAlc ? pick(COCKTAIL.baseAlcohol) : pick(COCKTAIL.baseNoAlcohol);
    let mixer = pick(COCKTAIL.mixer);
    while (mixer === base) mixer = pick(COCKTAIL.mixer);
    setMix({ base, mixer, garnish: pick(COCKTAIL.garnish), style: pick(COCKTAIL.style) });
  };
  return (
    <div className="card glow stack">
      <div className="row between wrap"><h3 style={{ margin: 0, fontSize: 18 }}>Laboratorio de cócteles</h3><PlayerSwitch value={who} onChange={setWho} label="Para:" /></div>
      <div className="row between">
        <span className="small muted">{canAlcohol ? 'Incluir una base con alcohol (opcional)' : `${who === 'tatiana' ? 'Tatiana' : 'Gabriel'} ha elegido sin alcohol: solo mocktails`}</span>
        <Toggle on={useAlc} onChange={(v) => canAlcohol && setAlc(v)} />
      </div>
      {mix && (
        <div className="kv" style={{ animation: 'pop .45s cubic-bezier(.2,1.3,.3,1)' }}>
          <div><b>Base</b>{mix.base}</div><div><b>Mezcla</b>{mix.mixer}</div><div><b>Toque final</b>{mix.garnish}</div><div><b>Estilo</b>{mix.style}</div>
        </div>
      )}
      <button className="btn primary" onClick={gen}><Icon name="glass" />{mix ? 'Otra combinación' : 'Generar receta'}</button>
      <p className="tiny faint" style={{ margin: 0 }}>Sin cantidades obligatorias. Basta con un sorbo para puntuar. Ten siempre agua y refrescos en la mesa.</p>
    </div>
  );
}

export default function Party() {
  const list = CHALLENGES.filter((c) => c.category === 'party');
  return (
    <div>
      <PageHead eyebrow="06 · Party Mode" title={<>Party <span className="accent">Mode</span></>} sub="La tarde es una fiesta. Beber nunca es obligatorio, nunca es castigo y nunca decide quién gana: todo funciona igual con agua o mocktails." num="06" />
      <CocktailLab />
      <Section title="Barajas de fiesta">
        <div className="grid two">
          {['never', 'likely', 'truth', 'dare', 'quick', 'songs', 'mime', 'trial', 'blanks'].map((d) => <DeckDrawer key={d} deckId={d} compact />)}
        </div>
      </Section>
      <Section title="Juegos de fiesta"><ChallengeList list={list} /></Section>
    </div>
  );
}
