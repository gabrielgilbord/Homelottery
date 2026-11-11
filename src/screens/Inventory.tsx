import { useState } from 'react';
import { useGame, useCard, cardUsable, completeMission, redeemPrize, toast } from '../state/store';
import { CARDS } from '../data/rewards';
import { AnimatedNumber, ConfirmButton, Curtain, Empty, Modal, MysteryCard, PageHead, PlayerSwitch, Section, fmtTime } from '../components/ui';
import { Icon } from '../components/Icon';
import { celebrate } from '../lib/celebrate';
import { PLAYER_NAME, type CardInstance, type PlayerId } from '../types';

const SRC: Record<string, string> = { roulette: 'Ruleta', envelope: 'Sobre', card: 'Carta', bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond', legendary: 'Legendary' };

export default function Inventory() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [sel, setSel] = useState<CardInstance | null>(null);
  const [out, setOut] = useState<{ text: string; mission?: string } | null>(null);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [curtain, setCurtain] = useState<'missions' | 'missionResult' | null>(null);
  const P = s.players[who];
  const prizes = s.prizes.filter((p) => p.player === who);
  const active = P.missions.filter((m) => !m.done);
  const freeCount = Object.values(P.freeBoxes).reduce((a, b) => a + (b || 0), 0);

  const use = (c: CardInstance) => {
    const r = useCard(who, c.uid);
    setSel(null);
    if ('error' in r) { toast(CARDS[c.type].name, r.error, 'bad'); return; }
    celebrate(1);
    if (r.mission && s.sharedScreen) { setOut(r); setCurtain('missionResult'); return; }
    setOut(r);
  };

  return (
    <div>
      <PageHead show="Backstage" title="Inventario" sub="Cartas, llaves, cajas gratis, misiones secretas y todos los premios ganados." />
      <PlayerSwitch value={who} onChange={(p) => { setWho(p); setMissionsOpen(false); }} label="Ver" />

      <div className="ledger" style={{ marginTop: 'var(--s-6)' }}>
        <div><div className="label">Monedas</div><div className="v value-text"><AnimatedNumber value={P.coins} /></div></div>
        <div><div className="label">Puntos</div><div className="v"><AnimatedNumber value={P.points} /></div></div>
        <div><div className="label">Llaves</div><div className="v">{P.keys}</div></div>
        <div><div className="label">Cajas gratis</div><div className="v">{freeCount}</div></div>
      </div>
      {(P.doubleArmed || P.multiplier > 1) && <p className="small value-text" style={{ marginTop: 'var(--s-3)' }}>Activo: {P.doubleArmed ? 'Double Trouble ' : ''}{P.multiplier > 1 ? `multiplicador x${P.multiplier}` : ''} · se gasta en la próxima prueba.</p>}

      <Section title="Cartas especiales" eyebrow={`${P.cards.length} en la mano`}>
        {P.cards.length === 0 ? <Empty icon="cards">Sin cartas. Se consiguen en pruebas, cajas, ruletas, sobres y logros.</Empty> : (
          <div className="grid stagger" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(46%, 150px), 1fr))' }}>{P.cards.map((c) => <MysteryCard key={c.uid} type={c.type} onClick={() => setSel(c)} />)}</div>
        )}
      </Section>

      <Section title="Misiones secretas" eyebrow={`${active.length} activas`}>
        {P.missions.length === 0 ? <Empty icon="eye">Se reciben con la carta Secret Mission.</Empty> : !missionsOpen ? (
          <button className="btn ghost lg block" onClick={() => (s.sharedScreen ? setCurtain('missions') : setMissionsOpen(true))}><Icon name="eye" size={18} />Ver mis misiones en privado</button>
        ) : (
          <div className="stack">
            <div className="list">
              {P.missions.map((m) => (
                <div key={m.uid} className="row-item" style={{ opacity: m.done ? 0.5 : 1 }}>
                  <span className="grow small">{m.text}</span>
                  {m.done ? <span className="tag ok">Cumplida</span> : <ConfirmButton className="btn sm value" onConfirm={() => { completeMission(who, m.uid); celebrate(1); }} confirmText="¿Cumplida?">Cumplida</ConfirmButton>}
                </div>
              ))}
            </div>
            <button className="btn quiet sm" onClick={() => setMissionsOpen(false)}><Icon name="eyeoff" size={14} />Ocultar</button>
          </div>
        )}
      </Section>

      <Section title="Premios ganados" eyebrow={`${prizes.length} en total`}>
        {prizes.length === 0 ? <Empty icon="gift">Todavía no hay premios. Las cajas esperan.</Empty> : (
          <div className="list">
            {prizes.map((r) => (
              <div key={r.uid} className="row-item" style={{ alignItems: 'flex-start', opacity: r.redeemed ? 0.5 : 1 }}>
                <span className="grow stack" style={{ ['--gap' as string]: '4px' }}>
                  <span className="meta"><span>{SRC[r.box] || r.box}</span><span>{fmtTime(r.at)}</span></span>
                  <span className="h4">{r.title}</span>
                  <span className="small muted" style={{ whiteSpace: 'pre-line' }}>{r.text}</span>
                </span>
                <button className={'chip' + (r.redeemed ? '' : ' on')} aria-pressed={!!r.redeemed} onClick={() => redeemPrize(r.uid, !r.redeemed)}>{r.redeemed ? 'Canjeado' : 'Canjear'}</button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Modal open={!!sel} onClose={() => setSel(null)} eyebrow={`Carta de ${PLAYER_NAME[who]}`} title={sel ? CARDS[sel.type].name : ''}>
        {sel && (() => {
          const chk = cardUsable(s, who, sel.type);
          return (
            <div className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
              <div style={{ width: 170, margin: '0 auto' }}><MysteryCard type={sel.type} /></div>
              <p className="muted">{CARDS[sel.type].rules}</p>
              {chk.ok ? <ConfirmButton className="btn accent lg block" onConfirm={() => use(sel)} confirmText="Toca otra vez para usarla">Usar carta</ConfirmButton> : <p className="small faint" style={{ textAlign: 'center' }}>{chk.why}</p>}
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!out && curtain === null} onClose={() => setOut(null)} eyebrow="Carta usada" title="Resultado">
        {out && <div className="stack" style={{ ['--gap' as string]: 'var(--s-4)' }}><p>{out.text}</p>{out.mission && <div className="surface"><p className="label accent">Tu misión secreta</p><p className="h4" style={{ marginTop: 8 }}>{out.mission}</p></div>}<button className="btn primary block" onClick={() => setOut(null)}>Entendido</button></div>}
      </Modal>

      <Curtain open={curtain !== null} to={who} label={curtain === 'missionResult' ? 'Tu misión secreta está lista.' : 'Vas a ver tus misiones secretas.'} onCancel={() => { setCurtain(null); setOut(null); }}
        onReveal={() => { if (curtain === 'missions') setMissionsOpen(true); setCurtain(null); }} />
    </div>
  );
}
