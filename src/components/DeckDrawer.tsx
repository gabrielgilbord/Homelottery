import { useState } from 'react';
import { DECKS } from '../data/decks';
import { drawDeck, useGame, intensityAllowed } from '../state/store';
import { Icon } from './Icon';
import { Curtain, PlayerSwitch } from './ui';
import type { PlayerId } from '../types';

/** A deck of prompts drawn without repetition, filtered by the couple's shared intensity. Private decks use the curtain. */
export function DeckDrawer({ deckId }: { deckId: string; compact?: boolean }) {
  const s = useGame();
  const deck = DECKS.find((d) => d.id === deckId)!;
  const [card, setCard] = useState<{ text: string; remaining: number; k: number } | null>(null);
  const [hidden, setHidden] = useState(false);
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [curtain, setCurtain] = useState(false);
  const total = deck.cards.filter((c) => intensityAllowed(s, c.intensity)).length;

  const draw = () => { const r = drawDeck(deckId); if (r) { setCard({ ...r, k: Date.now() }); setHidden(false); } };
  const onDraw = () => { if (deck.private && s.sharedScreen) setCurtain(true); else draw(); };

  return (
    <div className="deck">
      <div className="split top">
        <div className="stack" style={{ ['--gap' as string]: '4px' }}>
          <h3 className="h4">{deck.name}</h3>
          <p className="xs faint">{deck.hint}</p>
        </div>
        <span className="cluster" style={{ ['--gap' as string]: '6px', flexShrink: 0 }}>
          {deck.private && <span className="tag accent"><Icon name="eyeoff" size={11} />Privada</span>}
          <span className="tag">{total}</span>
        </span>
      </div>
      {deck.private && s.sharedScreen && <PlayerSwitch value={who} onChange={setWho} label="Roba" />}
      {card && (hidden
        ? <button className="btn ghost" onClick={() => setHidden(false)}><Icon name="eye" size={16} />Volver a mostrar</button>
        : <div key={card.k} className="prompt" aria-live="polite">{card.text}<div className="p-meta">{card.remaining > 0 ? `Quedan ${card.remaining} sin salir` : 'Última carta · el mazo se baraja'}</div></div>)}
      <div className="cluster">
        <button className="btn accent" onClick={onDraw}><Icon name="cards" size={16} />{card ? 'Otra carta' : 'Robar carta'}</button>
        {card && deck.private && !hidden && <button className="btn quiet" onClick={() => setHidden(true)}><Icon name="eyeoff" size={16} />Ocultar</button>}
      </div>
      <Curtain open={curtain} to={who} label={`Carta secreta de “${deck.name}”.`} onCancel={() => setCurtain(false)} onReveal={() => { setCurtain(false); draw(); }} />
    </div>
  );
}
