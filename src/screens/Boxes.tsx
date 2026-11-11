import { useState } from 'react';
import { BOXES, boxByTier } from '../data/rewards';
import { useGame, canOpenBox, openBox, toast } from '../state/store';
import { Curtain, Modal, PageHead, PlayerSwitch, Section } from '../components/ui';
import { Icon } from '../components/Icon';
import { beep } from '../components/ui';
import type { BoxTier, PlayerId, PrizeRecord } from '../types';
import { PLAYER_NAME } from '../types';

function Box3D({ color, state }: { color: string; state: 'idle' | 'shake' | 'open' }) {
  return (
    <div className={'box3d ' + (state === 'shake' ? 'shake' : state === 'open' ? 'open' : '')} style={{ ['--box' as string]: color }}>
      <div className="burst" />
      <div className="base" />
      <div className="ribbon" />
      <div className="lid" />
    </div>
  );
}

export default function Boxes() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [opening, setOpening] = useState<{ tier: BoxTier; phase: 'shake' | 'open'; rec?: PrizeRecord; privateReveal: boolean } | null>(null);
  const [ask, setAsk] = useState<BoxTier | null>(null);
  const [curtain, setCurtain] = useState<BoxTier | null>(null);

  const start = (tier: BoxTier, privateReveal: boolean) => {
    const res = openBox(who, tier);
    if ('error' in res) { toast('No se puede abrir', res.error, 'bad'); return; }
    // the prize is drawn and saved BEFORE the animation: closing the app cannot change it
    setOpening({ tier, phase: 'shake', rec: res, privateReveal });
    beep(520, 120);
    setTimeout(() => { setOpening((o) => (o ? { ...o, phase: 'open' } : o)); beep(990, 300); try { navigator.vibrate?.(80); } catch { /* noop */ } }, 1500);
  };
  const onTap = (tier: BoxTier) => {
    const c = canOpenBox(s, who, tier);
    if (!c.ok) { toast(boxByTier(tier).name, c.why, 'bad'); return; }
    if (s.sharedScreen) setAsk(tier); else start(tier, false);
  };

  return (
    <div>
      <PageHead eyebrow="09 · Mystery Boxes" title={<>Mystery <span className="gold-text">Boxes</span></>} sub="Lo que hay dentro no se enseña hasta que se abre. Y lo que sale queda registrado para siempre." num="09" />
      <div className="row wrap between" style={{ marginBottom: 14 }}>
        <PlayerSwitch value={who} onChange={setWho} label="Abre:" />
        <div className="row small" style={{ gap: 14 }}>
          <span className="row" style={{ gap: 4 }}><Icon name="coin" size={16} />{s.players[who].coins}</span>
          <span className="row" style={{ gap: 4 }}><Icon name="key" size={16} />{s.players[who].keys}</span>
        </div>
      </div>

      <div className="grid three">
        {BOXES.map((b) => {
          const c = canOpenBox(s, who, b.tier);
          const locked = s.episode < b.unlockEpisode;
          const free = s.players[who].freeBoxes[b.tier] || 0;
          return (
            <div key={b.tier} className={'card box-tile stack' + (c.ok ? ' glow' : '')} style={{ ['--box' as string]: b.color, gap: 6, textAlign: 'center', opacity: locked ? 0.55 : 1 }} data-theme={b.tier === 'legendary' ? 'legendary' : 'boxes'}>
              <Box3D color={locked ? '#4a4050' : b.color} state="idle" />
              <div className="tier" style={{ color: b.color }}>{b.name}</div>
              <div className="small muted">{b.tagline}</div>
              <div className="chips" style={{ justifyContent: 'center' }}>
                <span className="chip">{b.costLabel}</span>
                {free > 0 && <span className="chip accent">{free} gratis</span>}
                {locked && <span className="chip"><Icon name="lock" size={12} />Episodio 0{b.unlockEpisode}</span>}
              </div>
              <button className={'btn ' + (c.ok ? 'primary' : '')} disabled={locked} onClick={() => onTap(b.tier)} style={{ marginTop: 6 }}>
                {locked ? 'Bloqueada' : c.free ? 'Abrir gratis' : 'Abrir'}
              </button>
            </div>
          );
        })}
      </div>

      <Section title="Cómo funcionan">
        <div className="grid two">
          <div className="card tight small muted">Cada caja tiene su propia tabla de premios con probabilidades fijas. El sorteo usa aleatoriedad criptográfica del dispositivo.</div>
          <div className="card tight small muted">Los premios únicos solo pueden salir una vez en todo el día. Los premios picantes solo existen si los dos lo habéis activado.</div>
          <div className="card tight small muted">El premio se guarda en el momento de abrir: aunque se cierre la app, no cambia. Lo encontrarás en Inventory.</div>
          <div className="card tight small muted">La Legendary Box solo se abre en la Gran Final y con Llave Legendaria. Habrá llaves para los dos.</div>
        </div>
      </Section>

      <Modal open={!!ask} onClose={() => setAsk(null)} eyebrow={ask ? boxByTier(ask).name : ''} title="¿Cómo lo revelamos?">
        <div className="stack">
          <button className="btn primary lg block" onClick={() => { const t = ask!; setAsk(null); start(t, false); }}><Icon name="users" />Delante de los dos</button>
          <button className="btn lg block" onClick={() => { const t = ask!; setAsk(null); setCurtain(t); }}><Icon name="eyeoff" />En privado para {PLAYER_NAME[who]}</button>
        </div>
      </Modal>

      <Curtain open={!!curtain} to={who} label="Vas a abrir una caja en privado." onCancel={() => setCurtain(null)} onReveal={() => { const t = curtain!; setCurtain(null); start(t, true); }} />

      <Modal open={!!opening} onClose={() => opening?.phase === 'open' && setOpening(null)} eyebrow={opening ? `${boxByTier(opening.tier).name} · ${PLAYER_NAME[who]}` : ''}>
        {opening && (
          <div className="stack" style={{ alignItems: 'center', textAlign: 'center' }} data-theme={opening.tier === 'legendary' ? 'legendary' : 'boxes'}>
            <Box3D color={boxByTier(opening.tier).color} state={opening.phase} />
            {opening.phase === 'shake' && <div className="h-show" style={{ fontSize: 28, color: 'var(--ink-2)' }}>Abriendo…</div>}
            {opening.phase === 'open' && opening.rec && (
              <div className="prize-reveal stack" style={{ alignItems: 'center' }}>
                <div className="eyebrow">Has ganado</div>
                <h2 className="h-display gold-text" style={{ fontSize: 30 }}>{opening.rec.title}</h2>
                <p style={{ whiteSpace: 'pre-line', margin: 0, maxWidth: 420 }}>{opening.rec.text}</p>
                <p className="tiny faint" style={{ margin: 0 }}>Guardado en el inventario de {PLAYER_NAME[who]}{opening.privateReveal ? ' (puedes contarlo cuando quieras)' : ''}.</p>
                <button className="btn primary" onClick={() => setOpening(null)}>Genial</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
