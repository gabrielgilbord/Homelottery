import { useState, type CSSProperties } from 'react';
import { BOXES, boxByTier } from '../data/rewards';
import { useGame, canOpenBox, openBox, toast } from '../state/store';
import { Curtain, Modal, PageHead, PlayerSwitch, Section, beep } from '../components/ui';
import { Icon } from '../components/Icon';
import { celebrate } from '../lib/celebrate';
import type { BoxTier, PlayerId, PrizeRecord } from '../types';
import { PLAYER_NAME } from '../types';

const RARITY: Record<BoxTier, string> = { bronze: 'Común', silver: 'Poco común', gold: 'Rara', diamond: 'Épica', legendary: 'Legendaria' };
const PRIZE_RARITY: Record<BoxTier, string> = { bronze: 'Premio común', silver: 'Premio poco común', gold: 'Premio raro', diamond: 'Premio épico', legendary: 'Premio legendario' };

export function Box3D({ tier, color, state, size }: { tier: BoxTier; color: string; state: 'idle' | 'locked' | 'charging' | 'open' | 'still'; size?: 'lg' }) {
  return (
    <div className={`box3d ${state} ${size || ''}`} data-tier={tier} style={{ ['--box' as string]: color } as CSSProperties} aria-hidden>
      <div className="glow" />
      <div className="face f-side" />
      <div className="face f-front" />
      <div className="lid"><div className="f-top" /></div>
    </div>
  );
}

export default function Boxes() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [stage, setStage] = useState<{ tier: BoxTier; phase: 'charging' | 'open'; rec: PrizeRecord; priv: boolean } | null>(null);
  const [ask, setAsk] = useState<BoxTier | null>(null);
  const [curtain, setCurtain] = useState<BoxTier | null>(null);

  const start = (tier: BoxTier, priv: boolean) => {
    const res = openBox(who, tier);
    if ('error' in res) { toast('No se puede abrir', res.error, 'bad'); return; }
    // The prize is drawn and saved BEFORE the animation: closing the app cannot change it.
    setStage({ tier, phase: 'charging', rec: res, priv });
    beep(330, 120, 0.04); setTimeout(() => beep(440, 120, 0.04), 500); setTimeout(() => beep(550, 120, 0.04), 1000);
    const wait = tier === 'legendary' ? 2100 : 1500;
    setTimeout(() => {
      setStage((o) => (o ? { ...o, phase: 'open' } : o));
      beep(990, 420, 0.07);
      celebrate(tier === 'legendary' ? 3 : tier === 'diamond' || tier === 'gold' ? 2 : 1);
    }, wait);
  };
  const onTap = (tier: BoxTier) => {
    const c = canOpenBox(s, who, tier);
    if (!c.ok) { toast(boxByTier(tier).name, c.why, 'bad'); return; }
    if (s.sharedScreen) setAsk(tier); else start(tier, false);
  };
  const P = s.players[who];
  const box = stage ? boxByTier(stage.tier) : null;

  return (
    <div>
      <PageHead eyebrow="La cámara acorazada" title="Mystery Boxes" sub="Lo que hay dentro no se enseña hasta que se abre. Lo que sale queda registrado para siempre."
        aside={<div className="stack" style={{ alignItems: 'flex-end', ['--gap' as string]: '2px' }}><span className="label">{PLAYER_NAME[who]}</span><span className="h3 num value-text">{P.coins}</span><span className="xs faint mono">{P.keys} llave{P.keys === 1 ? '' : 's'}</span></div>} />
      <div style={{ marginBottom: 'var(--s-5)' }}><PlayerSwitch value={who} onChange={setWho} label="Abre" /></div>

      <div className="vault stagger">
        {BOXES.map((b) => {
          const c = canOpenBox(s, who, b.tier);
          const locked = s.episode < b.unlockEpisode;
          const free = P.freeBoxes[b.tier] || 0;
          return (
            <button key={b.tier} className={'vault-item' + (b.tier === 'legendary' ? ' legend' : '')} style={{ ['--box' as string]: b.color } as CSSProperties} aria-disabled={locked || !c.ok} onClick={() => (locked ? toast(b.name, `Se desbloquea en el episodio 0${b.unlockEpisode}`, 'info') : onTap(b.tier))}>
              {locked && <span className="lockbadge"><Icon name="lock" size={12} /></span>}
              {free > 0 && <span className="tag value free">{free} gratis</span>}
              <Box3D tier={b.tier} color={b.color} state={locked ? 'locked' : c.ok ? 'idle' : 'still'} />
              <span className="small" style={{ color: locked ? 'var(--ivory-3)' : b.color, fontWeight: 600 }}>{RARITY[b.tier]}</span>
              <span className={'vname' + (b.tier === 'legendary' && !locked ? ' legend-text' : '')}>{b.name.replace(' Box', '')}</span>
              <span className="small faint num">{locked ? `Episodio ${b.unlockEpisode}` : c.free ? 'Gratis' : b.costLabel}</span>
            </button>
          );
        })}
      </div>

      <Section title="Reglas de la cámara">
        <div className="rules3">
          <div><span>Sorteo</span><span className="small muted">Cada caja tiene su tabla de premios con probabilidades fijas. Se sortea con aleatoriedad criptográfica del dispositivo.</span></div>
          <div><span>Únicos</span><span className="small muted">Los premios únicos solo pueden salir una vez en todo el día. Los atrevidos solo existen si los dos lo habéis activado.</span></div>
          <div><span>Registro</span><span className="small muted">El premio se guarda al abrir: aunque se cierre la app, no cambia. Queda en el inventario.</span></div>
          <div><span>Legendaria</span><span className="small muted">Solo en la Gran Final y con Llave Legendaria. Habrá llaves para los dos.</span></div>
        </div>
      </Section>

      <Modal open={!!ask} onClose={() => setAsk(null)} eyebrow={ask ? boxByTier(ask).name : ''} title="¿Cómo lo revelamos?">
        <div className="stack">
          <button className="btn primary lg block" onClick={() => { const t = ask!; setAsk(null); start(t, false); }}><Icon name="users" size={18} />Delante de los dos</button>
          <button className="btn ghost lg block" onClick={() => { const t = ask!; setAsk(null); setCurtain(t); }}><Icon name="eyeoff" size={18} />Solo para {PLAYER_NAME[who]}</button>
        </div>
      </Modal>

      <Curtain open={!!curtain} to={who} label="Vas a abrir una caja en privado." onCancel={() => setCurtain(null)} onReveal={() => { const t = curtain!; setCurtain(null); start(t, true); }} />

      {stage && box && (
        <div className={'reveal-stage' + (stage.phase === 'open' ? ' opened' : '')} style={{ ['--box' as string]: box.color } as CSSProperties} role="dialog" aria-modal="true" aria-label={`Abriendo ${box.name}`}>
          <div className="rays" />
          <div className="small" style={{ color: box.color, position: 'relative', fontWeight: 700 }}>{box.name} de {PLAYER_NAME[who]}</div>
          <div className="box-stage" style={{ position: 'relative', height: 230, paddingTop: 50, display: 'grid', placeItems: 'center' }}>
            <Box3D tier={stage.tier} color={box.color} state={stage.phase === 'charging' ? 'charging' : 'open'} size="lg" />
          </div>
          {stage.phase === 'charging' && <p className="small faint" style={{ position: 'relative' }}>Abriendo…</p>}
          {stage.phase === 'open' && (
            <div className={'prize-card' + (stage.tier === 'legendary' ? ' legend' : '')}>
              <span className="rarity">{PRIZE_RARITY[stage.tier]}</span>
              <h2 className={'h2' + (stage.tier === 'legendary' ? ' legend-text' : '')}>{stage.rec.title}</h2>
              <p className="muted" style={{ whiteSpace: 'pre-line' }}>{stage.rec.text}</p>
              <p className="small faint">Guardado en el inventario de {PLAYER_NAME[who]}{stage.priv ? '. Puedes contarlo cuando quieras.' : '.'}</p>
              <button className="btn primary block" onClick={() => setStage(null)} autoFocus>Guardar premio</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
