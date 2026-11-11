import { useState } from 'react';
import { CHALLENGES } from '../data/challenges';
import { COCKTAIL } from '../data/gaming';
import { ChallengeList } from './Challenges';
import { PageHead, PlayerSwitch, Section, Toggle } from '../components/ui';
import { DeckDrawer } from '../components/DeckDrawer';
import { Icon } from '../components/Icon';
import { useGame } from '../state/store';
import { pick } from '../lib/random';
import { PLAYER_NAME, type PlayerId } from '../types';

function CocktailLab() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const canAlcohol = s.prefs[who].alcohol;
  const [alc, setAlc] = useState(false);
  const [mix, setMix] = useState<null | { base: string; mixer: string; garnish: string; style: string; k: number }>(null);
  const useAlc = alc && canAlcohol;
  const gen = () => {
    const base = useAlc ? pick(COCKTAIL.baseAlcohol) : pick(COCKTAIL.baseNoAlcohol);
    let mixer = pick(COCKTAIL.mixer);
    while (mixer === base) mixer = pick(COCKTAIL.mixer);
    setMix({ base, mixer, garnish: pick(COCKTAIL.garnish), style: pick(COCKTAIL.style), k: Date.now() });
  };
  return (
    <div className="party-hero stack" style={{ ['--gap' as string]: 'var(--s-4)' }}>
      <div className="split" style={{ flexWrap: 'wrap' }}>
        <div className="stack" style={{ ['--gap' as string]: '4px' }}><span className="eyebrow accent">Laboratorio</span><h2 className="h2">Cóctel o mocktail</h2></div>
        <PlayerSwitch value={who} onChange={setWho} label="Para" />
      </div>
      <div className="setting" style={{ borderBottom: 0 }}>
        <span className="small muted">{canAlcohol ? 'Incluir una base con alcohol (opcional)' : `${PLAYER_NAME[who]} ha elegido sin alcohol: solo mocktails`}</span>
        <Toggle on={useAlc} onChange={(v) => canAlcohol && setAlc(v)} label="Base con alcohol" />
      </div>
      {mix && (
        <div key={mix.k} className="recipe" style={{ animation: 'pop .45s var(--ease-spring)' }}>
          <div><div className="eyebrow">Base</div><div className="h4">{mix.base}</div></div>
          <div><div className="eyebrow">Mezcla</div><div className="h4">{mix.mixer}</div></div>
          <div><div className="eyebrow">Toque final</div><div className="h4">{mix.garnish}</div></div>
          <div><div className="eyebrow">Estilo</div><div className="h4">{mix.style}</div></div>
        </div>
      )}
      <div className="cluster"><button className="btn accent lg" onClick={gen}><Icon name="glass" size={18} />{mix ? 'Otra receta' : 'Generar receta'}</button></div>
      <p className="xs faint">Sin cantidades. Basta un sorbo para puntuar. Agua y refrescos siempre en la mesa.</p>
    </div>
  );
}

export default function Party() {
  const list = CHALLENGES.filter((c) => c.category === 'party');
  return (
    <div>
      <PageHead eyebrow="Arena" title="Party Mode" sub="La tarde es una fiesta. Beber nunca es obligatorio ni castigo, y nunca decide quién gana: todo funciona igual con agua." />
      <CocktailLab />
      <Section title="Barajas de fiesta" eyebrow="Sin repeticiones hasta agotar el mazo">
        <div className="grid-auto" style={{ ['--min' as string]: '300px' }}>
          {['never', 'likely', 'truth', 'dare', 'quick', 'songs', 'mime', 'trial', 'blanks'].map((d) => <DeckDrawer key={d} deckId={d} />)}
        </div>
      </Section>
      <Section title="Juegos de fiesta"><ChallengeList list={list} /></Section>
    </div>
  );
}
