import { useState } from 'react';
import { DECKS } from '../data/decks';
import { drawDeck, useGame, intensityAllowed } from '../state/store';
import { Icon } from './Icon';
import { Curtain, PlayerSwitch } from './ui';
import type { PlayerId } from '../types';

/** A deck of prompts drawn without repetition, filtered by the couple's shared intensity. Private decks use the curtain. */
export function DeckDrawer({ deckId, compact }: { deckId: string; compact?: boolean }) {
  const s = useGame();
  const deck = DECKS.find((d) => d.id === deckId)!;
  const [card, setCard] = useState<{ text: string; remaining: number } | null>(null);
  const [hidden, setHidden] = useState(false);
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [curtain, setCurtain] = useState(false);
  const total = deck.cards.filter((c) => intensityAllowed(s, c.intensity)).length;
  const spicyCount = deck.cards.filter((c) => c.intensity && intensityAllowed(s, c.intensity)).length;

  const draw = () => {
    const r = drawDeck(deckId);
    if (r) { setCard(r); setHidden(false); }
  };
  const onDraw = () => { if (deck.private && s.sharedScreen) setCurtain(true); else draw(); };

  return (
    <div className="card stack">
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="row" style={{ gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 17 }}>{deck.name}</h3>
            {deck.private && <span className="chip accent"><Icon name="eyeoff" size={12} />Privada</span>}
          </div>
          <p className="small muted" style={{ margin: '4px 0 0' }}>{deck.hint}</p>
        </div>
        <span className="tiny faint" style={{ whiteSpace: 'nowrap' }}>{total} cartas{spicyCount ? ` · ${spicyCount} spicy` : ''}</span>
      </div>
      {deck.private && s.sharedScreen && <PlayerSwitch value={who} onChange={setWho} label="Roba:" />}
      {card && (
        <div style={{ position: 'relative', padding: compact ? '16px' : '22px 18px', borderRadius: 16, border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)', background: 'radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--accent-2) 30%, transparent), rgba(0,0,0,.3))', textAlign: 'center', animation: 'pop .45s cubic-bezier(.2,1.3,.3,1)' }}>
          {hidden ? (
            <button className="btn ghost sm" onClick={() => setHidden(false)}><Icon name="eye" />Mostrar de nuevo</button>
          ) : (
            <div className="h-serif" style={{ fontSize: compact ? 18 : 21, lineHeight: 1.35 }}>{card.text}</div>
          )}
          <div className="tiny faint" style={{ marginTop: 10 }}>{card.remaining > 0 ? `Quedan ${card.remaining} sin salir` : 'Última carta: el mazo se baraja de nuevo'}</div>
        </div>
      )}
      <div className="row wrap">
        <button className="btn primary" onClick={onDraw}><Icon name="cards" />{card ? 'Otra carta' : 'Robar carta'}</button>
        {card && deck.private && !hidden && <button className="btn ghost" onClick={() => setHidden(true)}><Icon name="eyeoff" />Ocultar</button>}
      </div>
      <Curtain open={curtain} to={who} label={`Carta secreta de "${deck.name}". Que la otra persona no mire.`} onCancel={() => setCurtain(false)} onReveal={() => { setCurtain(false); draw(); }} />
    </div>
  );
}
