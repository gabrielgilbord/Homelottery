import { useState } from 'react';
import { useGame, useCard, cardUsable, completeMission, redeemPrize, toast } from '../state/store';
import { CARDS } from '../data/rewards';
import { ConfirmButton, Curtain, Modal, MysteryCard, PageHead, PlayerSwitch, Section, fmtTime } from '../components/ui';
import { Icon } from '../components/Icon';
import { PLAYER_NAME, type CardInstance, type PlayerId } from '../types';

export default function Inventory() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [sel, setSel] = useState<CardInstance | null>(null);
  const [out, setOut] = useState<{ text: string; mission?: string } | null>(null);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [curtain, setCurtain] = useState<'missions' | 'missionResult' | null>(null);
  const P = s.players[who];
  const prizes = s.prizes.filter((p) => p.player === who);
  const activeMissions = P.missions.filter((m) => !m.done);

  const use = (c: CardInstance) => {
    const r = useCard(who, c.uid);
    setSel(null);
    if ('error' in r) { toast(CARDS[c.type].name, r.error, 'bad'); return; }
    if (r.mission && s.sharedScreen) { setOut(r); setCurtain('missionResult'); return; }
    setOut(r);
  };

  return (
    <div>
      <PageHead eyebrow="11 · Inventory" title="Inventory" sub="Cartas, llaves, cajas gratis, misiones secretas y todos los premios ganados." num="11" />
      <PlayerSwitch value={who} onChange={(p) => { setWho(p); setMissionsOpen(false); }} />

      <div className="grid four" style={{ marginTop: 14 }}>
        <div className="card tight"><Icon name="coin" style={{ color: 'var(--accent)' }} /><div className="h-show" style={{ fontSize: 30 }}>{P.coins}</div><div className="tiny faint">monedas</div></div>
        <div className="card tight"><Icon name="star" style={{ color: 'var(--accent)' }} /><div className="h-show" style={{ fontSize: 30 }}>{P.points}</div><div className="tiny faint">puntos</div></div>
        <div className="card tight"><Icon name="key" style={{ color: 'var(--accent)' }} /><div className="h-show" style={{ fontSize: 30 }}>{P.keys}</div><div className="tiny faint">llaves legendarias</div></div>
        <div className="card tight"><Icon name="gift" style={{ color: 'var(--accent)' }} /><div className="h-show" style={{ fontSize: 30 }}>{Object.values(P.freeBoxes).reduce((a, b) => a + (b || 0), 0)}</div><div className="tiny faint">cajas gratis</div></div>
      </div>
      {(P.doubleArmed || P.multiplier > 1) && <div className="card tight glow" style={{ marginTop: 12 }}><b>Activo:</b> {P.doubleArmed ? 'Double Trouble' : ''} {P.multiplier > 1 ? `Multiplicador x${P.multiplier}` : ''} <span className="small faint">· se gasta en la próxima prueba registrada</span></div>}

      <Section title={`Cartas especiales · ${P.cards.length}`}>
        {P.cards.length === 0 ? <div className="empty">Sin cartas. Se consiguen en pruebas, cajas, ruletas, sobres y logros.</div> : (
          <div className="grid four">{P.cards.map((c) => <MysteryCard key={c.uid} type={c.type} onClick={() => setSel(c)} />)}</div>
        )}
      </Section>

      <Section title="Misiones secretas" aside={<span className="tiny faint">{activeMissions.length} activas</span>}>
        {P.missions.length === 0 ? <div className="empty">Se reciben con la carta Secret Mission.</div> : !missionsOpen ? (
          <button className="btn block" onClick={() => (s.sharedScreen ? setCurtain('missions') : setMissionsOpen(true))}><Icon name="eye" />Ver mis misiones (privado)</button>
        ) : (
          <div className="stack">
            {P.missions.map((m) => (
              <div key={m.uid} className="card tight row between" style={{ opacity: m.done ? 0.5 : 1 }}>
                <span className="small">{m.text}</span>
                {m.done ? <span className="chip" style={{ color: 'var(--good)' }}>Cumplida</span> : <ConfirmButton className="btn sm primary" onConfirm={() => completeMission(who, m.uid)} confirmText="¿Cumplida?">Cumplida</ConfirmButton>}
              </div>
            ))}
            <button className="btn ghost sm" onClick={() => setMissionsOpen(false)}><Icon name="eyeoff" size={16} />Ocultar</button>
          </div>
        )}
      </Section>

      <Section title={`Premios ganados · ${prizes.length}`}>
        {prizes.length === 0 ? <div className="empty">Todavía no hay premios. Las cajas esperan.</div> : (
          <div className="stack">
            {prizes.map((r) => (
              <div key={r.uid} className="card tight" style={{ opacity: r.redeemed ? 0.55 : 1 }}>
                <div className="row between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div className="tiny faint">{r.box === 'roulette' ? 'Ruleta' : r.box === 'envelope' ? 'Sobre' : `${r.box[0].toUpperCase() + r.box.slice(1)} Box`} · {fmtTime(r.at)}</div>
                    <b>{r.title}</b>
                    <p className="small muted" style={{ margin: '4px 0 0', whiteSpace: 'pre-line' }}>{r.text}</p>
                  </div>
                  <button className={'chip' + (r.redeemed ? '' : ' accent')} onClick={() => redeemPrize(r.uid, !r.redeemed)}>{r.redeemed ? 'Canjeado' : 'Canjear'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Modal open={!!sel} onClose={() => setSel(null)} eyebrow={`Carta de ${PLAYER_NAME[who]}`} title={sel ? CARDS[sel.type].name : ''}>
        {sel && (() => {
          const chk = cardUsable(s, who, sel.type);
          return (
            <div className="stack">
              <div style={{ maxWidth: 180, margin: '0 auto', width: '100%' }}><MysteryCard type={sel.type} /></div>
              <p style={{ margin: 0 }}>{CARDS[sel.type].rules}</p>
              {chk.ok ? <ConfirmButton className="btn primary block" onConfirm={() => use(sel)} confirmText="Toca otra vez para usarla">Usar carta</ConfirmButton> : <div className="card tight small muted">{chk.why}</div>}
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!out && curtain === null} onClose={() => setOut(null)} eyebrow="Carta usada" title="Resultado">
        {out && <div className="stack"><p style={{ margin: 0 }}>{out.text}</p>{out.mission && <div className="card tight glow"><div className="eyebrow" style={{ fontSize: 10 }}>Tu misión secreta</div><p style={{ margin: '6px 0 0' }}>{out.mission}</p></div>}<button className="btn primary" onClick={() => setOut(null)}>OK</button></div>}
      </Modal>

      <Curtain open={curtain !== null} to={who} label={curtain === 'missionResult' ? 'Tu misión secreta está lista.' : 'Vas a ver tus misiones secretas.'} onCancel={() => { setCurtain(null); setOut(null); }}
        onReveal={() => { if (curtain === 'missions') setMissionsOpen(true); setCurtain(null); }} />
    </div>
  );
}
