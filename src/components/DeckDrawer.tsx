import { useState } from 'react';
import { DECKS } from '../data/decks';
import { drawDeck, useGame, intensityAllowed } from '../state/store';
import { Icon } from './Icon';
import { Curtain, PlayerSwitch } from './ui';
import type { PlayerId } from '../types';

/**
 * One card stage for several prompt decks: pick a deck, deal a card.
 * Cards come without repetition and respect the couple's shared intensity.
 * Private decks deal behind the privacy curtain on a shared phone.
 */
export function DeckStage({ deckIds }: { deckIds: string[] }) {
  const s = useGame();
  const decks = deckIds.map((id) => DECKS.find((d) => d.id === id)!).filter(Boolean);
  const [deckId, setDeckId] = useState(decks[0].id);
  const [card, setCard] = useState<{ text: string; remaining: number; k: number; deck: string } | null>(null);
  const [hidden, setHidden] = useState(false);
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [curtain, setCurtain] = useState(false);
  const deck = decks.find((d) => d.id === deckId)!;
  const total = deck.cards.filter((c) => intensityAllowed(s, c.intensity)).length;
  const shown = card && card.deck === deckId ? card : null;

  const draw = () => { const r = drawDeck(deckId); if (r) { setCard({ ...r, k: Date.now(), deck: deckId }); setHidden(false); try { navigator.vibrate?.(12); } catch { /* noop */ } } };
  const onDraw = () => { if (deck.private && s.sharedScreen) setCurtain(true); else draw(); };

  return (
    <div className="deck-stage">
      {decks.length > 1 && (
        <div className="deck-tabs" role="tablist" aria-label="Barajas">
          {decks.map((d) => (
            <button key={d.id} role="tab" aria-selected={d.id === deckId} className={'chip' + (d.id === deckId ? ' on' : '')} onClick={() => { setDeckId(d.id); setHidden(false); }}>
              {d.private && <Icon name="eyeoff" size={13} />}{d.name}
            </button>
          ))}
        </div>
      )}
      {shown && !hidden ? (
        <div key={shown.k} className="prompt-card dealt" aria-live="polite">
          <div className="pc-deck"><span>{deck.name}</span><span>{shown.remaining > 0 ? `quedan ${shown.remaining}` : 'se baraja de nuevo'}</span></div>
          <div className="pc-text">{shown.text}</div>
          <div className="pc-foot">{deck.hint}</div>
        </div>
      ) : shown && hidden ? (
        <button className="prompt-hidden" onClick={() => setHidden(false)}><span className="cluster"><Icon name="eye" size={18} />Volver a mostrar</span></button>
      ) : (
        <div className="prompt-card">
          <div className="pc-deck"><span>{deck.name}</span><span>{total} cartas</span></div>
          <div className="pc-text idle">{deck.private ? 'Carta secreta. Solo la ve quien la roba.' : 'Roba una carta para empezar.'}</div>
          <div className="pc-foot">{deck.hint}</div>
        </div>
      )}
      {deck.private && s.sharedScreen && <PlayerSwitch value={who} onChange={setWho} label="Roba" />}
      <div className={shown && deck.private && !hidden ? 'grid-2' : 'stack'}>
        <button className="btn accent lg block" onClick={onDraw}><Icon name="cards" size={18} />{shown ? 'Otra carta' : 'Robar carta'}</button>
        {shown && deck.private && !hidden && <button className="btn ghost lg" onClick={() => setHidden(true)}><Icon name="eyeoff" size={18} />Ocultar</button>}
      </div>
      <Curtain open={curtain} to={who} label={`Carta secreta de ${deck.name}.`} onCancel={() => setCurtain(false)} onReveal={() => { setCurtain(false); draw(); }} />
    </div>
  );
}

/** Single-deck convenience wrapper. */
export function DeckDrawer({ deckId }: { deckId: string; compact?: boolean }) {
  return <DeckStage deckIds={[deckId]} />;
}
