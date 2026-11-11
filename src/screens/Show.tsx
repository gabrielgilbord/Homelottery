import { useState } from 'react';
import { useGame, setEpisode, openEnvelope, envelopeAvailable, trailingPlayer, leader } from '../state/store';
import { EPISODES, BREAKS, CATEGORIES } from '../data/episodes';
import { ENVELOPES, type EnvelopeDef } from '../data/rewards';
import { challengeById } from '../data/challenges';
import { Icon } from '../components/Icon';
import { ConfirmButton, Curtain, Modal, PageHead, Section } from '../components/ui';
import { go } from '../lib/router';
import { celebrate } from '../lib/celebrate';
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
    celebrate(d.id === 'env-final' || d.id === 'env-closing' ? 3 : 1);
  };
  const tryOpen = (d: EnvelopeDef) => {
    const to = recipient(d);
    if (to && s.sharedScreen) setCurtainFor({ def: d, to }); else doOpen(d);
  };
  const visible = ENVELOPES.filter((e) => !e.hostOnly || s.envelopesForced.includes(e.id) || s.envelopesOpened.includes(e.id));
  const ready = visible.filter((e) => !s.envelopesOpened.includes(e.id) && envelopeAvailable(s, e.id)).length;

  return (
    <div>
      <PageHead eyebrow={`Episodio ${String(s.episode).padStart(2, '0')} · ${cur.time}`} title={cur.title} sub={cur.playerNote}>
        <div className="cluster">
          {cur.categories.map((c) => <span key={c} className="chip" data-world={CATEGORIES[c].theme}><span className="dot" />{CATEGORIES[c].short}</span>)}
        </div>
        <div className="cluster" style={{ marginTop: 'var(--s-2)' }}>
          <button className="btn primary" onClick={() => setOpenEp(cur.n)}>Pruebas del episodio</button>
          {s.episode < 8 && (
            <ConfirmButton className="btn ghost" onConfirm={() => setEpisode(s.episode + 1)} confirmText={`Empezar el episodio ${String(s.episode + 1).padStart(2, '0')}`}>
              Siguiente episodio<Icon name="chevron" size={16} />
            </ConfirmButton>
          )}
        </div>
      </PageHead>

      <Section title="Sobres secretos" eyebrow={ready ? `${ready} listo${ready > 1 ? 's' : ''} para abrir` : `${s.envelopesOpened.length} abiertos`}>
        <div className="envelopes stagger">
          {visible.map((e) => {
            const opened = s.envelopesOpened.includes(e.id);
            const avail = envelopeAvailable(s, e.id);
            return (
              <div key={e.id} className={'env' + (avail && !opened ? ' ready' : '') + (!avail && !opened ? ' locked' : '')}>
                <div className="split">
                  <span className="seal" aria-hidden>{opened ? <Icon name="check" size={16} /> : avail ? 'G' : <Icon name="lock" size={14} />}</span>
                  <span className="eyebrow">{opened ? 'Abierto' : avail ? 'Disponible' : 'Bloqueado'}</span>
                </div>
                <div className="stack grow" style={{ ['--gap' as string]: '4px' }}>
                  <h3 className="h4">{e.name}</h3>
                  <p className="xs faint">{opened ? e.reward : avail ? 'Ábrelo ahora.' : e.condition}</p>
                </div>
                {avail && !opened && <button className="btn value sm" onClick={() => tryOpen(e)}>Romper el sello</button>}
                {opened && <button className="btn quiet sm" onClick={() => setEnv({ def: e, message: s.host.envelopeOverrides[e.id] || e.message, reward: e.reward })}>Releer</button>}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Escaleta del día" eyebrow="Horario orientativo">
        <div className="runlist">
          {EPISODES.map((e) => {
            const br = BREAKS.find((b) => b.after === e.n);
            const st = e.n === s.episode ? 'now' : e.n < s.episode ? 'past' : '';
            return (
              <div key={e.n}>
                <button className={'run ' + st} onClick={() => setOpenEp(e.n)} aria-current={st === 'now' ? 'step' : undefined}>
                  <span className="rn">{String(e.n).padStart(2, '0')}</span>
                  <span className="stack" style={{ ['--gap' as string]: '2px' }}>
                    <span className="cluster"><span className="xs mono faint">{e.time}</span>{st === 'now' && <span className="tag live"><span className="live-dot" style={{ width: 5, height: 5, boxShadow: 'none' }} />En emisión</span>}{st === 'past' && <span className="tag ok">Emitido</span>}</span>
                    <span className="h4">{e.title}</span>
                    <span className="small faint">{e.subtitle}</span>
                  </span>
                  <Icon name="chevron" size={18} className="faint" />
                </button>
                {br && <div className="run-break">{br.time} · {br.label}</div>}
              </div>
            );
          })}
        </div>
        <p className="small faint" style={{ marginTop: 'var(--s-4)' }}>No hace falta jugar todas las pruebas de un episodio. Con dos o cuatro el día respira.</p>
      </Section>

      <Modal open={openEp !== null} onClose={() => setOpenEp(null)} eyebrow={openEp ? `Episodio ${String(openEp).padStart(2, '0')}` : ''} title={openEp ? EPISODES[openEp - 1].title : ''}>
        {openEp && (() => {
          const e = EPISODES[openEp - 1];
          return (
            <div className="stack">
              <p className="muted">{e.playerNote}</p>
              <div className="list">
                {e.picks.map((id) => { const c = challengeById(id)!; return (
                  <button key={id} className="row-item" data-world={CATEGORIES[c.category].theme} onClick={() => { setOpenEp(null); go('challenge', id); }}>
                    <span className="lead-icon"><Icon name={s.completed[id] ? 'check' : 'target'} size={18} /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>{c.name}</span><span className="xs faint mono">{c.sub} · {c.duration} min · {c.mode === 'coop' ? 'equipo' : 'duelo'}</span></span>
                    <Icon name="chevron" size={18} className="chev" />
                  </button>
                ); })}
              </div>
              {openEp !== s.episode && <ConfirmButton className="btn ghost block" onConfirm={() => { setEpisode(openEp); setOpenEp(null); }} confirmText="Toca otra vez para saltar">Saltar a este episodio</ConfirmButton>}
            </div>
          );
        })()}
      </Modal>

      <Curtain open={!!curtainFor} to={curtainFor?.to || 'tatiana'} label={`Este sobre es solo para ${curtainFor ? PLAYER_NAME[curtainFor.to] : ''}.`} onCancel={() => setCurtainFor(null)} onReveal={() => { const d = curtainFor!.def; setCurtainFor(null); doOpen(d); }} />

      <Modal open={!!env} onClose={() => setEnv(null)} eyebrow="Sobre secreto" title={env?.def.name}>
        {env && (
          <div className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
            <div className="letter">{env.message}</div>
            <div className="split"><span className="eyebrow">Recompensa</span><b className="small value-text" style={{ textAlign: 'right' }}>{env.reward}</b></div>
            <button className="btn primary block" onClick={() => setEnv(null)}>Cerrar el sobre</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
