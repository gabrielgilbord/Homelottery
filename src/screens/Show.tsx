import { useState } from 'react';
import { useGame, setEpisode, openEnvelope, envelopeAvailable, trailingPlayer, leader } from '../state/store';
import { EPISODES, BREAKS, CATEGORIES } from '../data/episodes';
import { ENVELOPES, type EnvelopeDef } from '../data/rewards';
import { challengeById } from '../data/challenges';
import { Icon } from '../components/Icon';
import { ConfirmButton, Curtain, Modal, PageHead, Section } from '../components/ui';
import { go } from '../lib/router';
import { PLAYER_NAME, rival, type PlayerId } from '../types';

export default function Show() {
  const s = useGame();
  const [openEp, setOpenEp] = useState<number | null>(null);
  const [env, setEnv] = useState<{ def: EnvelopeDef; message: string; reward: string } | null>(null);
  const [curtainFor, setCurtainFor] = useState<{ def: EnvelopeDef; to: PlayerId } | null>(null);
  const cur = EPISODES[s.episode - 1];

  const recipient = (d: EnvelopeDef): PlayerId | null => {
    if (d.to === 'tatiana' || d.to === 'gabriel') return d.to;
    if (d.to === 'trailing') return trailingPlayer(s) || (leader(s) ? rival(leader(s)!) : null);
    return null;
  };
  const doOpen = (d: EnvelopeDef) => {
    const r = openEnvelope(d.id);
    if ('error' in r) return;
    setEnv({ def: d, ...r });
  };
  const tryOpen = (d: EnvelopeDef) => {
    const to = recipient(d);
    if (to && s.sharedScreen) setCurtainFor({ def: d, to }); else doOpen(d);
  };

  const visibleEnvelopes = ENVELOPES.filter((e) => !e.hostOnly || s.envelopesForced.includes(e.id) || s.envelopesOpened.includes(e.id));

  return (
    <div>
      <PageHead eyebrow="02 · The Show" title={<>The <span className="gold-text">Show</span></>} sub="Ocho episodios, un día entero. El horario es orientativo: aquí manda el sofá." num={cur.code.replace('EP ', '')} />

      <div className="hero" data-theme={cur.theme}>
        <div className="hero-rays" />
        <div style={{ position: 'relative' }} className="stack">
          <div className="row between wrap"><span className="eyebrow">Episodio actual · {cur.time}</span><span className="chip accent">{cur.mood}</span></div>
          <h2 className="h-display" style={{ fontSize: 'clamp(26px,7vw,38px)' }}>{cur.title}</h2>
          <p className="muted" style={{ margin: 0 }}>{cur.playerNote}</p>
          <div className="chips">{cur.categories.map((c) => <span key={c} className="chip">{CATEGORIES[c].short}</span>)}</div>
          <div className="row wrap">
            <button className="btn primary" onClick={() => setOpenEp(cur.n)}><Icon name="target" />Pruebas del episodio</button>
            {s.episode < 8 && (
              <ConfirmButton className="btn" onConfirm={() => setEpisode(s.episode + 1)} confirmText={`¿Empezar el Episodio 0${s.episode + 1}?`}>
                <Icon name="skip" />Siguiente episodio
              </ConfirmButton>
            )}
          </div>
        </div>
      </div>

      <Section title="Sobres secretos" aside={<span className="tiny faint">{s.envelopesOpened.length} abiertos</span>}>
        <div className="grid three">
          {visibleEnvelopes.map((e) => {
            const opened = s.envelopesOpened.includes(e.id);
            const avail = envelopeAvailable(s, e.id);
            return (
              <div key={e.id} className={'card tight' + (avail && !opened ? ' glow' : '')} data-theme={avail && !opened ? 'boxes' : undefined} style={{ opacity: !avail && !opened ? 0.6 : 1 }}>
                <div className="item">
                  <div className="item-icon"><Icon name={opened ? 'check' : avail ? 'envelope' : 'lock'} /></div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15 }}>{e.name}</h3>
                    <p className="tiny">{opened ? 'Abierto' : avail ? 'Disponible ahora' : e.condition}</p>
                  </div>
                </div>
                {avail && !opened && <button className="btn primary sm block" style={{ marginTop: 12 }} onClick={() => tryOpen(e)}>Abrir sobre</button>}
                {opened && <button className="btn ghost sm block" style={{ marginTop: 12 }} onClick={() => setEnv({ def: e, message: s.host.envelopeOverrides[e.id] || e.message, reward: e.reward })}>Releer</button>}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Escaleta del día">
        <div className="timeline">
          {EPISODES.map((e) => {
            const br = BREAKS.find((b) => b.after === e.n);
            const state = e.n === s.episode ? 'current' : e.n < s.episode ? 'past' : '';
            return (
              <div key={e.n} className="stack" style={{ gap: 10 }}>
                <button className={'ep ' + state} onClick={() => setOpenEp(e.n)} style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', color: 'inherit', cursor: 'pointer' }}>
                  <div className="ep-num">{String(e.n).padStart(2, '0')}</div>
                  <div className="card tight" data-theme={e.theme}>
                    <div className="row between"><span className="tiny faint">{e.time}</span>{state === 'current' && <span className="chip accent">EN EMISIÓN</span>}{state === 'past' && <span className="chip"><Icon name="check" size={12} />Emitido</span>}</div>
                    <h3 style={{ margin: '4px 0 2px', fontSize: 16 }}>{e.title}</h3>
                    <p className="small muted" style={{ margin: 0 }}>{e.subtitle}</p>
                  </div>
                </button>
                {br && <div className="break-row">{br.time} · {br.label}</div>}
              </div>
            );
          })}
        </div>
        <p className="tiny faint" style={{ marginTop: 14 }}>Consejo: no hace falta jugar todas las pruebas de un episodio. Con 2-4 por episodio el día respira.</p>
      </Section>

      <Modal open={openEp !== null} onClose={() => setOpenEp(null)} eyebrow={openEp ? EPISODES[openEp - 1].code : ''} title={openEp ? EPISODES[openEp - 1].title : ''}>
        {openEp && (() => {
          const e = EPISODES[openEp - 1];
          return (
            <div className="stack">
              <p className="muted" style={{ margin: 0 }}>{e.playerNote}</p>
              {e.picks.map((id) => { const c = challengeById(id)!; return (
                <button key={id} className="card clickable tight item" onClick={() => { setOpenEp(null); go('challenge', id); }}>
                  <div className="item-icon" data-theme={CATEGORIES[c.category].theme}><Icon name={s.completed[id] ? 'check' : 'target'} /></div>
                  <div style={{ flex: 1 }}><h3 style={{ fontSize: 15 }}>{c.name}</h3><p className="tiny">{c.sub} · {c.duration} min · {c.mode === 'coop' ? 'Cooperativo' : 'Duelo'}</p></div>
                  <Icon name="chevron" />
                </button>
              ); })}
              {openEp !== s.episode && (
                <ConfirmButton className="btn block" onConfirm={() => { setEpisode(openEp); setOpenEp(null); }} confirmText="Toca otra vez para saltar">Saltar a este episodio</ConfirmButton>
              )}
            </div>
          );
        })()}
      </Modal>

      <Curtain open={!!curtainFor} to={curtainFor?.to || 'tatiana'} label={`Este sobre es solo para ${curtainFor ? PLAYER_NAME[curtainFor.to] : ''}.`} onCancel={() => setCurtainFor(null)} onReveal={() => { const d = curtainFor!.def; setCurtainFor(null); doOpen(d); }} />

      <Modal open={!!env} onClose={() => setEnv(null)} eyebrow="Sobre secreto" title={env?.def.name}>
        {env && (
          <div className="stack">
            <div className="letter">{env.message}</div>
            <div className="card tight row" data-theme="boxes"><Icon name="gift" style={{ color: 'var(--accent)' }} /><b>{env.reward}</b></div>
            <button className="btn primary block" onClick={() => setEnv(null)}>Guardar en el corazón</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
