import { useState } from 'react';
import { useGame, setEpisode, openEnvelope, envelopeAvailable, trailingPlayer, leader } from '../state/store';
import { EPISODES, BREAKS, CATEGORIES } from '../data/episodes';
import { ENVELOPES, BOXES, WHEELS, type EnvelopeDef } from '../data/rewards';
import { Envelope, EnvelopeReveal } from '../components/Envelope';
import { OnAir } from '../components/Logo';
import { challengeById } from '../data/challenges';
import { Icon } from '../components/Icon';
import { ConfirmButton, Curtain, Modal, PageHead, Section } from '../components/ui';
import { WORLD_ICON } from './Home';
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

  /** What each episode brings to the table: unlocks and envelopes that open with it. */
  const incentive = (n: number) => [
    ...BOXES.filter((b) => b.unlockEpisode === n).map((b) => b.name),
    ...WHEELS.filter((w) => w.unlockEpisode === n).map((w) => w.name),
    ...ENVELOPES.filter((e) => !e.hostOnly && e.condition.includes(`Episodio 0${n}`)).map((e) => e.name),
  ];

  return (
    <div>
      <PageHead show="Tonight's show" title="El programa" sub="La guía de emisión de hoy: ocho episodios, tres pausas y once sobres secretos." />

      {/* Now on air */}
      <section className="now-block" data-world={CATEGORIES[cur.categories[0]].theme} aria-label="Ahora en emisión">
        <div className="nb-top"><OnAir small /><span className="nb-when">Episodio {s.episode} de 8</span><span className="nb-when faint-on">{cur.time.replace(' – ', ' a ')}</span></div>
        <div className="nb-main">
          <span className="nb-num" aria-hidden>{String(cur.n).padStart(2, '0')}</span>
          <div className="nb-body">
            <h2 className="nb-title">{cur.title}</h2>
            <p className="nb-note">{cur.playerNote}</p>
          </div>
        </div>
        <div className="cluster nb-worlds">
          {cur.categories.map((c) => <span key={c} className="nb-world" data-world={CATEGORIES[c].theme}><Icon name={WORLD_ICON[c]} size={14} />{CATEGORIES[c].short}</span>)}
        </div>
        <div className="home-actions">
          <button className="btn cta lg" onClick={() => setOpenEp(cur.n)}>Pruebas del episodio<Icon name="chevron" size={18} /></button>
          {s.episode < 8 && (
            <ConfirmButton className="btn ghost lg" onConfirm={() => setEpisode(s.episode + 1)} confirmText={`Toca otra vez: empieza el episodio ${s.episode + 1}`}>
              Pasar al siguiente episodio
            </ConfirmButton>
          )}
        </div>
      </section>

      <Section title="Parrilla de hoy" eyebrow="Horario orientativo. No hace falta jugarlo todo: con dos o cuatro pruebas por episodio el día respira." aside={<span className="bc">Programación</span>}>
        <ol className="guide">
          {EPISODES.map((e) => {
            const br = BREAKS.find((b) => b.after === e.n);
            const st = e.n === s.episode ? 'now' : e.n < s.episode ? 'past' : 'next';
            const done = e.picks.filter((id) => s.completed[id]).length;
            const inc = incentive(e.n);
            return (
              <li key={e.n}>
                <button className={'g-row ' + st} data-world={CATEGORIES[e.categories[0]].theme} onClick={() => setOpenEp(e.n)} aria-current={st === 'now' ? 'step' : undefined}>
                  <span className="g-time fig">{e.time.split(' – ')[0]}</span>
                  <span className="g-num" aria-hidden>{String(e.n).padStart(2, '0')}</span>
                  <span className="g-body">
                    <span className="g-title">{e.title}</span>
                    <span className="g-sub">{e.subtitle}</span>
                    <span className="g-meta">
                      <span className="g-prog" aria-label={`${done} de ${e.picks.length} pruebas jugadas`}>{e.picks.map((id) => <i key={id} className={s.completed[id] ? 'on' : ''} />)}</span>
                      <span>{done} de {e.picks.length}</span>
                      {inc.length > 0 && <span className="g-inc"><Icon name="gift" size={13} />{inc.join(', ')}</span>}
                    </span>
                  </span>
                  <span className="g-state">{st === 'past' ? <span className="stamp">Emitido</span> : st === 'now' ? <OnAir small /> : <span className="g-soon">Próximo</span>}</span>
                </button>
                {br && <div className="g-break"><span className="bc">Intermedio</span><span>{br.label}</span><span className="fig">{br.time}</span></div>}
              </li>
            );
          })}
        </ol>
      </Section>

      <Section title="Sobres secretos" eyebrow={ready ? `${ready} listo${ready > 1 ? 's' : ''} para abrir. Rompe el sello cuando queráis.` : `${s.envelopesOpened.length} abiertos de ${visible.length}`} aside={<span className="bc hot">Special guests</span>}>
        <div className="env-grid stagger">
          {visible.map((e) => {
            const opened = s.envelopesOpened.includes(e.id);
            const avail = envelopeAvailable(s, e.id);
            const n = ENVELOPES.findIndex((x) => x.id === e.id) + 1;
            const state = opened ? 'opened' : avail ? 'ready' : 'locked';
            return (
              <div key={e.id} className="env-item">
                <Envelope id={e.id} n={n} name={e.name} state={state}
                  label={opened ? `Releer ${e.name}` : avail ? `Romper el sello de ${e.name}` : `${e.name}, cerrado`}
                  onClick={opened ? () => setEnv({ def: e, message: s.host.envelopeOverrides[e.id] || e.message, reward: e.reward }) : avail ? () => tryOpen(e) : undefined} />
                <p className="env-cap">{opened ? <><b>Abierto.</b> {e.reward}</> : avail ? <b className="hot-text">Listo: toca para romper el sello</b> : e.condition}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Modal open={openEp !== null} onClose={() => setOpenEp(null)} eyebrow={openEp ? `Episodio ${openEp} de 8` : ''} title={openEp ? EPISODES[openEp - 1].title : ''}>
        {openEp && (() => {
          const e = EPISODES[openEp - 1];
          return (
            <div className="stack">
              <p className="muted">{e.playerNote}</p>
              <div className="list">
                {e.picks.map((id) => { const c = challengeById(id)!; return (
                  <button key={id} className="row-item" data-world={CATEGORIES[c.category].theme} onClick={() => { setOpenEp(null); go('challenge', id); }}>
                    <span className="lead-icon"><Icon name={s.completed[id] ? 'check' : 'target'} size={18} /></span>
                    <span className="grow"><span className="h5" style={{ display: 'block' }}>{c.name}</span><span className="meta"><span>{c.sub}</span><span>{c.duration} min</span><span>{c.mode === 'coop' ? 'En equipo' : 'Duelo'}</span></span></span>
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
            <EnvelopeReveal id={env.def.id} message={env.message} reward={env.reward} />
            <button className="btn primary block" onClick={() => setEnv(null)}>Guardar la carta</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
