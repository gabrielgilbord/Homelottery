import { useState } from 'react';
import { CHALLENGES } from '../data/challenges';
import { COCKTAIL } from '../data/gaming';
import { ChallengeList } from './Challenges';
import { PageHead, PlayerSwitch, Section, Toggle } from '../components/ui';
import { DeckStage } from '../components/DeckDrawer';
import { OnAir } from '../components/Logo';
import { Icon } from '../components/Icon';
import { useGame } from '../state/store';
import { pick } from '../lib/random';
import { PLAYER_NAME, type PlayerId } from '../types';

export function CocktailLab() {
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
        <h2 className="h2">Laboratorio de cócteles</h2>
        <PlayerSwitch value={who} onChange={setWho} label="Para" />
      </div>
      <div className="setting" style={{ borderBottom: 0 }}>
        <span className="small muted">{canAlcohol ? 'Incluir una base con alcohol (opcional)' : `${PLAYER_NAME[who]} ha elegido sin alcohol: solo mocktails`}</span>
        <Toggle on={useAlc} onChange={(v) => canAlcohol && setAlc(v)} label="Base con alcohol" />
      </div>
      {mix && (
        <div key={mix.k} className="recipe" style={{ animation: 'pop .45s var(--ease-spring)' }}>
          <div><span className="label">Base</span><span className="h4">{mix.base}</span></div>
          <div><span className="label">Mezcla</span><span className="h4">{mix.mixer}</span></div>
          <div><span className="label">Toque final</span><span className="h4">{mix.garnish}</span></div>
          <div><span className="label">Estilo</span><span className="h4">{mix.style}</span></div>
        </div>
      )}
      <button className="btn primary lg block" onClick={gen}><Icon name="glass" size={18} />{mix ? 'Otra receta' : 'Generar receta'}</button>
      <p className="small faint">Sin cantidades: basta un sorbo para puntuar. Agua y refrescos siempre en la mesa.</p>
    </div>
  );
}

export default function Party() {
  const list = CHALLENGES.filter((c) => c.category === 'party');
  return (
    <div>
      <PageHead show="The Live Act" title="Fiesta" sub="La tarde es una fiesta. Beber nunca es obligatorio ni un castigo, y nunca decide quién gana: todo funciona igual con agua." aside={<OnAir label="Live" />} />
      <section aria-label="Barajas de fiesta">
        <DeckStage deckIds={['never', 'likely', 'truth', 'dare', 'quick', 'songs', 'mime', 'trial', 'blanks']} />
      </section>
      <section className="section"><CocktailLab /></section>
      <Section title="Juegos de fiesta"><ChallengeList list={list} /></Section>
    </div>
  );
}
