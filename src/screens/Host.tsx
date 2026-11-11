import { useEffect, useState } from 'react';
import {
  useGame, setHostPin, checkHostPin, adjust, hostGiveCard, hostGiveKey, hostGiveBox, forceEnvelope, setEpisode, setPrizeOverride,
  setEnvelopeOverride, toggleChecklist, setHostNotes, resetGame, replayIntro, exportSave, importSave, setShared, boxEntries, toast, envelopeAvailable,
} from '../state/store';
import { EPISODES } from '../data/episodes';
import { BOXES, CARDS, CARD_TYPES, ENVELOPES, PRIZES, PRIZE_FOR, prizeById } from '../data/rewards';
import { GAMES } from '../data/gaming';
import { TONIGHT, TONIGHT_TIMELINE, MATERIALS, BREAKFAST, HOST_TIMELINE, PLAN_B, PRESENTER_TIPS } from '../data/cheatsheet';
import { CHALLENGES } from '../data/challenges';
import { ConfirmButton, PlayerSwitch, Section, Seg, Toggle, fmtTime } from '../components/ui';
import { Icon } from '../components/Icon';
import { PLAYER_NAME, type BoxTier, type CardType, type PlayerId } from '../types';

type Tab = 'sheet' | 'control' | 'prizes' | 'envelopes' | 'settings';

export default function Host({ unlocked, onUnlock, onLock }: { unlocked: boolean; onUnlock: () => void; onLock: () => void }) {
  const s = useGame();
  const [tab, setTab] = useState<Tab>('sheet');

  // auto-lock after 5 minutes without interaction
  useEffect(() => {
    if (!unlocked) return;
    let t = setTimeout(onLock, 5 * 60 * 1000);
    const reset = () => { clearTimeout(t); t = setTimeout(onLock, 5 * 60 * 1000); };
    window.addEventListener('pointerdown', reset);
    window.addEventListener('keydown', reset);
    return () => { clearTimeout(t); window.removeEventListener('pointerdown', reset); window.removeEventListener('keydown', reset); };
  }, [unlocked, onLock]);

  if (!unlocked) return <PinGate hasPin={!!s.host.pin} onUnlock={onUnlock} />;

  return (
    <div className="host">
      <div className="host-bar no-print">
        <div className="stack" style={{ ['--gap' as string]: '2px' }}>
          <span className="classified"><Icon name="lock" size={12} />CONFIDENTIAL · SOLO GABRIEL</span>
          <span className="h4">Sala de control</span>
        </div>
        <button className="btn danger sm" onClick={onLock}><Icon name="lock" size={14} />Bloquear</button>
      </div>
      <div className="no-print" style={{ marginBottom: 'var(--s-2)' }}>
        <Seg<Tab> value={tab} onChange={setTab} label="Secciones del presentador" options={[{ v: 'sheet', label: 'Cheat Sheet' }, { v: 'control', label: 'Control' }, { v: 'prizes', label: 'Premios' }, { v: 'envelopes', label: 'Sobres' }, { v: 'settings', label: 'Ajustes' }]} />
      </div>
      <p className="xs faint no-print" style={{ marginBottom: 'var(--s-6)' }}>Se bloquea al salir de esta pantalla o tras 5 minutos sin uso.</p>
      <div key={tab} className="page">
        {tab === 'sheet' && <CheatSheet />}
        {tab === 'control' && <Control />}
        {tab === 'prizes' && <Prizes />}
        {tab === 'envelopes' && <Envelopes />}
        {tab === 'settings' && <Settings />}
      </div>
    </div>
  );
}

function PinGate({ hasPin, onUnlock }: { hasPin: boolean; onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [err, setErr] = useState('');
  const tryIn = () => (checkHostPin(pin) ? onUnlock() : (setErr('PIN incorrecto. Inténtalo otra vez.'), setPin('')));
  return (
    <div className="host" style={{ maxWidth: 400, margin: '8vh auto 0' }}>
      <div className="panel" style={{ padding: 'var(--s-7) var(--s-6)', alignItems: 'center', textAlign: 'center', gap: 'var(--s-4)' }}>
        <span className="classified"><Icon name="lock" size={12} />SOLO GABRIEL</span>
        <h1 className="h2">Host Mode</h1>
        {!hasPin ? (
          <>
            <p className="small muted">Primera vez: crea un PIN de presentador de al menos 4 dígitos.</p>
            <input className="input pin-input" type="password" inputMode="numeric" autoComplete="new-password" aria-label="Nuevo PIN" placeholder="••••" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setErr(''); }} />
            <input className="input pin-input" type="password" inputMode="numeric" autoComplete="new-password" aria-label="Repetir PIN" placeholder="••••" value={pin2} onChange={(e) => { setPin2(e.target.value.replace(/\D/g, '')); setErr(''); }} />
            {err && <span className="error-text" role="alert">{err}</span>}
            <button className="btn primary block" onClick={() => { if (pin.length < 4) return setErr('El PIN necesita al menos 4 dígitos.'); if (pin !== pin2) return setErr('Los dos PIN no coinciden.'); setHostPin(pin); onUnlock(); }}>Crear PIN y entrar</button>
            <p className="xs faint">Tatiana: si estás leyendo esto, vuelve atrás. Aquí están los spoilers.</p>
          </>
        ) : (
          <>
            <p className="small muted">Introduce el PIN de presentador.</p>
            <input className="input pin-input" type="password" inputMode="numeric" autoComplete="current-password" aria-label="PIN" aria-invalid={!!err} placeholder="••••" autoFocus value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && tryIn()} />
            {err && <span className="error-text" role="alert">{err}</span>}
            <button className="btn primary block" onClick={tryIn}>Entrar</button>
          </>
        )}
      </div>
    </div>
  );
}

const prioClass = (p: string) => (p === 'IMPRESCINDIBLE' ? 'p1' : p === 'RECOMENDADO' ? 'p2' : p === 'OPCIONAL' ? 'p3' : 'p4');

function Check({ id, text }: { id: string; text: string }) {
  const s = useGame();
  const on = !!s.host.checklist[id];
  return (
    <button className={'check' + (on ? ' on' : '')} role="checkbox" aria-checked={on} onClick={() => toggleChecklist(id)}>
      <span className="box">{on && <Icon name="check" size={13} stroke={2.6} />}</span>
      <span className="c-text small">{text}</span>
    </button>
  );
}

function TimedCheck({ id, time, text }: { id: string; time: string; text: string }) {
  const s = useGame();
  const on = !!s.host.checklist[id];
  return (
    <button className={'check tl' + (on ? ' on' : '')} role="checkbox" aria-checked={on} onClick={() => toggleChecklist(id)} style={{ display: 'grid', gridTemplateColumns: '22px 76px 1fr', gap: 'var(--s-3)', alignItems: 'start' }}>
      <span className="box">{on && <Icon name="check" size={13} stroke={2.6} />}</span>
      <time className="digits small" style={{ color: on ? 'var(--ivory-3)' : 'var(--ivory)', paddingTop: 2 }}>{time}</time>
      <span className="c-text small">{text}</span>
    </button>
  );
}

function Block({ letter, title, children, breakBefore }: { letter: string; title: string; children: React.ReactNode; breakBefore?: boolean }) {
  return (
    <section className={'section' + (breakBefore ? ' print-break' : '')} style={{ marginTop: 'var(--s-8)' }}>
      <div className="section-head"><div className="cluster"><span className="h3 accent-text">{letter}</span><h2 className="h3">{title}</h2></div></div>
      {children}
    </section>
  );
}

export function CheatSheet() {
  const s = useGame();
  const done = Object.values(s.host.checklist).filter(Boolean).length;
  const physical = PRIZES.filter((p) => !/^(Automático|Nada|Ninguna)/.test(p.prep));
  const total = TONIGHT_TIMELINE.length + HOST_TIMELINE.length + MATERIALS.home.length + MATERIALS.buy.length;
  return (
    <div>
      <div className="panel" style={{ padding: 'var(--s-6) var(--s-5)' }}>
        <span className="classified">CONFIDENTIAL — DO NOT SHOW TATIANA</span>
        <h2 className="h2">Gabriel’s Secret Cheat Sheet</h2>
        <p className="small muted">Todo lo necesario para que mañana tú también disfrutes. <span className="num">{done}/{total}</span> tareas marcadas.</p>
        <div className="progress"><i style={{ width: (done / total) * 100 + '%' }} /></div>
        <div className="cluster no-print"><button className="btn primary sm" onClick={() => window.print()}><Icon name="printer" size={14} />Imprimir o guardar PDF</button></div>
      </div>

      <Block letter="A" title="Esta noche, en orden">
        <div className="timeline">{TONIGHT_TIMELINE.map((t) => <TimedCheck key={t.id} id={t.id} time={t.time} text={t.what} />)}</div>
        <details style={{ marginTop: 'var(--s-4)' }}>
          <summary className="small" style={{ cursor: 'pointer', color: 'var(--ivory-2)' }}>Ver el detalle por tipo de tarea</summary>
          <div className="host-grid two" style={{ marginTop: 'var(--s-3)' }}>
            {TONIGHT.map((g) => <div key={g.id} className="panel"><h3>{g.title}</h3><ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>{g.items.map((i) => <li key={i.id} style={{ marginBottom: 6 }}>{i.text}</li>)}</ul></div>)}
          </div>
        </details>
      </Block>

      <Block letter="B" title="Mañana, en orden">
        <div className="timeline">{HOST_TIMELINE.map((t, i) => <TimedCheck key={i} id={'tm-' + i} time={t.time} text={t.what} />)}</div>
      </Block>

      <Block letter="C" title="Descargas y videojuegos" breakBefore>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Juego</th><th>Prioridad</th><th>Plataforma</th><th>Precio</th><th>Tamaño</th><th>PS Plus</th><th>Multijugador</th><th>Requisitos</th><th>Enlace</th></tr></thead>
            <tbody>
              {GAMES.map((g) => (
                <tr key={g.name}>
                  <td><b>{g.name}</b><div className="xs faint">{g.note}</div></td>
                  <td><span className={'prio ' + prioClass(g.priority)}>{g.priority}</span></td>
                  <td>{g.platform}</td><td>{g.price}</td><td>{g.size}</td><td>{g.psPlus}</td><td>{g.local}</td><td>{g.needs}</td>
                  <td><a href={g.link} target="_blank" rel="noreferrer">Oficial</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="xs faint prose" style={{ marginTop: 'var(--s-3)' }}>Fuentes: fichas oficiales de PlayStation (ARK: pantalla dividida local para 2; Brawlhalla gratis con modos locales; Rocket League free-to-play), ayuda oficial de Epic (pantalla dividida de Rocket League y Fortnite) y Psyonix (Rocket League online sin PS Plus). El tamaño de ARK (~179 GB) viene de PSPrices, no de Sony. Con ARK, Split Fiction y Rocket League tenéis de sobra.</p>
      </Block>

      <Block letter="D" title="Materiales">
        <div className="host-grid two">
          <div className="panel"><h3>Probablemente ya en casa</h3><div>{MATERIALS.home.map((m, i) => <Check key={i} id={'mh-' + i} text={m} />)}</div></div>
          <div className="panel"><h3>Comprar si falta</h3><div>{MATERIALS.buy.map((m, i) => <Check key={i} id={'mb-' + i} text={m} />)}</div></div>
        </div>
      </Block>

      <Block letter="E" title="El desayuno" breakBefore>
        <ol className="steps">{BREAKFAST.map((b, i) => <li key={i}><span><b>{b.t}.</b> <span className="muted">{b.d}</span></span></li>)}</ol>
        <div className="panel" style={{ marginTop: 'var(--s-4)' }}><span className="label">Texto de la invitación (aparece solo en la app)</span><p className="small muted" style={{ fontStyle: 'italic' }}>“Buenos días, Tatiana. Hoy Gabriel ha preparado algo para ti. Pero hay una pequeña condición… Hoy no vas a poder decidirlo todo. Habrá desafíos. Habrá apuestas. Habrá sorpresas. Habrá premios que todavía no conoces. Y puede que hoy descubras que tienes un pequeño rival en casa. Bienvenida a… HOMELOTTERY · GABRIEL × TATIANA · THE COUPLES EDITION”</p></div>
      </Block>

      <Block letter="F" title="Notas por episodio">
        <div className="host-grid two">
          {EPISODES.map((e) => <div key={e.n} className="panel"><span className="label">Episodio {e.n}, {e.time}</span><h3>{e.title}</h3><p className="small muted">{e.hostNote}</p></div>)}
        </div>
      </Block>

      <Block letter="G" title="Premios físicos que preparar">
        <div className="timeline">{physical.map((p) => <TimedCheck key={p.id} id={'pf-' + p.id} time={BOXES.find((b) => b.entries.some((x) => x.prizeId === p.id))?.name.replace(' Box', '') || ''} text={`${p.title}: ${p.prep}`} />)}</div>
      </Block>

      <Block letter="H" title="Catálogo completo de premios" breakBefore><PrizeCatalog compact /></Block>

      <Block letter="I" title="Plan B">
        <div className="rules3">{PLAN_B.map((p) => <div key={p.q}><span className="h5">{p.q}</span><span className="small muted">{p.a}</span></div>)}</div>
      </Block>

      <Block letter="J" title="Consejos y reglas internas">
        <ul className="small muted prose" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PRESENTER_TIPS.map((t) => <li key={t}>{t}</li>)}
          <li>Economía: cada uno empieza con 50 monedas. Ganar un duelo da puntos y monedas (+5 por racha, máximo +20). Perder da el 40% de las monedas como consolación (60% en modo Relax). Si el ganador iba 30 o más puntos por detrás, cobra x1,5 monedas. En la Gran Final los puntos valen doble.</li>
          <li>Cajas: Bronze 30 · Silver 60 · Gold 110 · Diamond 180 · Legendary con 1 llave. Cada uno recibe 1 llave en el Sobre de la Gran Final; hay más en Gold, Diamond, ruletas y logros.</li>
          <li>Biblioteca: {CHALLENGES.length} pruebas en 6 mundos.</li>
        </ul>
      </Block>
    </div>
  );
}

function PrizeCatalog({ compact }: { compact?: boolean }) {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [edit, setEdit] = useState<string | null>(null);
  const [txt, setTxt] = useState('');
  return (
    <div className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
      <div className="no-print"><PlayerSwitch value={who} onChange={setWho} label="Probabilidades para" /></div>
      {BOXES.map((b) => {
        const rows = boxEntries(s, who, b.tier);
        const baseTotal = b.entries.reduce((a, e) => a + e.weight, 0);
        return (
          <div key={b.tier} className="stack" style={{ ['--gap' as string]: 'var(--s-2)' }}>
            <div className="split"><span className="h4" style={{ color: b.color }}>{b.name}</span><span className="small faint">{b.costLabel}, desde el episodio {b.unlockEpisode}</span></div>
            <div className="table-wrap">
              <table className="t" style={{ minWidth: compact ? 600 : 720 }}>
                <thead><tr><th>Premio</th><th>Base</th><th>Ahora · {PLAYER_NAME[who]}</th><th>Preparación física</th>{!compact && <th className="no-print" />}</tr></thead>
                <tbody>
                  {b.entries.map((e) => {
                    const pr = prizeById(e.prizeId)!;
                    const r = rows.find((x) => x.prizeId === e.prizeId)!;
                    const ov = s.host.prizeOverrides[pr.id];
                    return (
                      <tr key={pr.id}>
                        <td>
                          <div className="cluster" style={{ ['--gap' as string]: '6px' }}><b>{pr.title}</b>{pr.unique && <span className="tag">único</span>}{PRIZE_FOR[pr.id] && <span className="tag">solo {PLAYER_NAME[PRIZE_FOR[pr.id]]}</span>}{ov && <span className="tag accent">editado</span>}</div>
                          <div className="xs faint" style={{ marginTop: 4 }}>{ov || pr.text}</div>
                          {edit === pr.id && (
                            <div className="stack no-print" style={{ marginTop: 8, ['--gap' as string]: '6px' }}>
                              <textarea className="input" value={txt} onChange={(ev) => setTxt(ev.target.value)} aria-label={`Texto de ${pr.title}`} />
                              <div className="cluster"><button className="btn sm primary" onClick={() => { setPrizeOverride(pr.id, txt); setEdit(null); toast('Premio actualizado', pr.title, 'good'); }}>Guardar</button><button className="btn sm ghost" onClick={() => { setPrizeOverride(pr.id, ''); setEdit(null); }}>Restaurar</button></div>
                            </div>
                          )}
                        </td>
                        <td className="num">{Math.round((e.weight / baseTotal) * 100)}%</td>
                        <td className="num">{r.eligible ? `${Math.round(r.chance * 100)}%` : <span className="xs faint">{r.reason}</span>}</td>
                        <td className="xs">{pr.prep}</td>
                        {!compact && <td className="no-print"><button className="btn sm ghost" onClick={() => { setEdit(pr.id); setTxt(ov || pr.text); }}>Editar</button></td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Prizes() {
  const s = useGame();
  return (
    <div>
      <p className="small muted prose" style={{ marginBottom: 'var(--s-5)' }}>Edita el texto de un premio, por ejemplo la pista de dónde has escondido algo. Afecta a premios futuros: los ya entregados no cambian.</p>
      <PrizeCatalog />
      <Section title="Premios entregados" eyebrow={`${s.prizes.length} en total`}>
        {s.prizes.length === 0 ? <p className="small faint">Ninguno todavía.</p> : <div className="log">{s.prizes.map((r) => <div key={r.uid} className="li"><time>{fmtTime(r.at)}</time><span className="small"><b className={'pname ' + r.player}>{PLAYER_NAME[r.player]}</b> · {r.box} · {r.title}{r.redeemed ? ' · canjeado' : ''}</span></div>)}</div>}
      </Section>
    </div>
  );
}

function Control() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [coins, setCoins] = useState('0');
  const [pts, setPts] = useState('0');
  const [why, setWhy] = useState('');
  const [card, setCard] = useState<CardType>('lucky');
  const [box, setBox] = useState<BoxTier>('bronze');
  return (
    <div className="host-grid two">
      <div className="panel">
        <h3>Episodio en emisión</h3>
        <div className="cluster" style={{ ['--gap' as string]: '6px' }}>{EPISODES.map((e) => <button key={e.n} className={'chip' + (s.episode === e.n ? ' on' : '')} onClick={() => setEpisode(e.n)}>EP {String(e.n).padStart(2, '0')}</button>)}</div>
        <p className="small muted">{EPISODES[s.episode - 1].hostNote}</p>
      </div>
      <div className="panel">
        <div className="split" style={{ flexWrap: 'wrap' }}><h3>Ajustar marcador</h3><PlayerSwitch value={who} onChange={setWho} /></div>
        <div className="grid-2">
          <label className="field">Monedas (+/−)<input className="input num" type="number" value={coins} onChange={(e) => setCoins(e.target.value)} /></label>
          <label className="field">Puntos (+/−)<input className="input num" type="number" value={pts} onChange={(e) => setPts(e.target.value)} /></label>
        </div>
        <label className="field">Motivo<input className="input" placeholder="Aparece en el historial" value={why} onChange={(e) => setWhy(e.target.value)} /></label>
        <ConfirmButton className="btn primary" onConfirm={() => { adjust(who, +coins || 0, +pts || 0, why); setCoins('0'); setPts('0'); setWhy(''); toast('Ajuste aplicado', PLAYER_NAME[who], 'good'); }}>Aplicar a {PLAYER_NAME[who]}</ConfirmButton>
      </div>
      <div className="panel">
        <h3>Regalar a {PLAYER_NAME[who]}</h3>
        <div className="cluster" style={{ flexWrap: 'nowrap' }}>
          <select className="input" aria-label="Carta" value={card} onChange={(e) => setCard(e.target.value as CardType)}>{CARD_TYPES.map((c) => <option key={c} value={c}>{CARDS[c].name}</option>)}</select>
          <button className="btn" onClick={() => { hostGiveCard(who, card); toast('Carta entregada', `${CARDS[card].name} para ${PLAYER_NAME[who]}`, 'good'); }}>Dar carta</button>
        </div>
        <div className="cluster" style={{ flexWrap: 'nowrap' }}>
          <select className="input" aria-label="Caja" value={box} onChange={(e) => setBox(e.target.value as BoxTier)}>{BOXES.map((b) => <option key={b.tier} value={b.tier}>{b.name}</option>)}</select>
          <button className="btn" onClick={() => { hostGiveBox(who, box); toast('Caja regalada', PLAYER_NAME[who], 'good'); }}>Dar caja</button>
        </div>
        <button className="btn ghost" onClick={() => { hostGiveKey(who); toast('Llave entregada', PLAYER_NAME[who], 'good'); }}><Icon name="key" size={14} />Dar Llave Legendaria</button>
      </div>
      <div className="panel">
        <h3>Notas privadas</h3>
        <textarea className="input" aria-label="Notas privadas" value={s.host.notes} onChange={(e) => setHostNotes(e.target.value)} placeholder="Ideas, recordatorios, dónde escondiste cada cosa" />
      </div>
      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <h3>Historial completo</h3>
        <div className="log">{s.history.slice(0, 80).map((h) => <div key={h.uid} className="li"><time>{fmtTime(h.at)}</time><span className="small">{h.secret && <span className="tag" style={{ marginRight: 6 }}>privado</span>}{h.text}</span></div>)}</div>
      </div>
    </div>
  );
}

function Envelopes() {
  const s = useGame();
  const [edit, setEdit] = useState<string | null>(null);
  const [txt, setTxt] = useState('');
  return (
    <div className="host-grid two">
      {ENVELOPES.map((e) => {
        const opened = s.envelopesOpened.includes(e.id);
        const avail = envelopeAvailable(s, e.id);
        return (
          <div key={e.id} className="panel">
            <div className="split"><h3>{e.name}</h3><span className={'tag' + (opened ? ' ok' : avail ? ' value' : '')}>{opened ? 'Abierto' : avail ? 'Disponible' : 'Bloqueado'}</span></div>
            <p className="xs faint">{e.condition} Para: {e.to === 'both' ? 'los dos' : e.to === 'trailing' ? 'quien va por detrás' : PLAYER_NAME[e.to as PlayerId] || e.to}. Recompensa: {e.reward}.</p>
            {edit === e.id ? (
              <>
                <textarea className="input" style={{ minHeight: 160 }} aria-label={`Mensaje de ${e.name}`} value={txt} onChange={(ev) => setTxt(ev.target.value)} />
                <div className="cluster"><button className="btn sm primary" onClick={() => { setEnvelopeOverride(e.id, txt); setEdit(null); toast('Sobre actualizado', e.name, 'good'); }}>Guardar</button><button className="btn sm ghost" onClick={() => { setEnvelopeOverride(e.id, ''); setEdit(null); }}>Restaurar</button></div>
              </>
            ) : <p className="small muted" style={{ whiteSpace: 'pre-line' }}>{s.host.envelopeOverrides[e.id] || e.message}</p>}
            <div className="cluster">
              {edit !== e.id && <button className="btn sm" onClick={() => { setEdit(e.id); setTxt(s.host.envelopeOverrides[e.id] || e.message); }}>Editar mensaje</button>}
              {!opened && !avail && <ConfirmButton className="btn sm ghost" onConfirm={() => { forceEnvelope(e.id); toast('Sobre desbloqueado', e.name, 'good'); }}>Desbloquear ahora</ConfirmButton>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Settings() {
  const s = useGame();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [keepHost, setKeepHost] = useState(true);
  const [imp, setImp] = useState('');
  return (
    <div className="host-grid two">
      <div className="panel">
        <h3>Presentación</h3>
        <div>
          <div className="setting"><span>Modo un solo móvil</span><Toggle on={s.sharedScreen} onChange={setShared} label="Modo un solo móvil" /></div>
          <div className="setting"><span>Invitación inicial</span><ConfirmButton className="btn sm" onConfirm={() => replayIntro()}>Volver a mostrar</ConfirmButton></div>
        </div>
        <label className="field">Cambiar PIN
          <span className="cluster" style={{ flexWrap: 'nowrap' }}><input className="input" type="password" inputMode="numeric" placeholder="Nuevo PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} /><button className="btn" disabled={pin.length < 4} onClick={() => { setHostPin(pin); setPin(''); toast('PIN actualizado', undefined, 'good'); }}>Guardar</button></span>
        </label>
      </div>
      <div className="panel">
        <h3>Copia de seguridad</h3>
        <button className="btn" onClick={() => { const blob = new Blob([exportSave()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'homelottery-partida.json'; a.click(); }}><Icon name="download" size={14} />Exportar partida</button>
        <textarea className="input" aria-label="Partida para importar" placeholder="Pega aquí una partida exportada para restaurarla" value={imp} onChange={(e) => setImp(e.target.value)} />
        <ConfirmButton className="btn" disabled={!imp.trim()} onConfirm={() => { const ok = importSave(imp); toast(ok ? 'Partida restaurada' : 'Ese texto no es una partida válida', undefined, ok ? 'good' : 'bad'); setImp(''); }}>Importar</ConfirmButton>
      </div>
      <div className="panel" style={{ borderColor: 'color-mix(in srgb, var(--danger) 35%, transparent)', gridColumn: '1 / -1' }}>
        <h3 style={{ color: 'var(--danger)' }}>Reinicio seguro</h3>
        <p className="small muted">Borra puntuaciones, monedas, premios, cartas e historial. Escribe REINICIAR para confirmar.</p>
        <div className="setting"><span>Conservar PIN, textos editados y checklist</span><Toggle on={keepHost} onChange={setKeepHost} label="Conservar datos del presentador" /></div>
        <input className="input" aria-label="Confirmación" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="REINICIAR" />
        <button className="btn danger" disabled={confirm !== 'REINICIAR'} onClick={() => { resetGame(keepHost); setConfirm(''); toast('Partida reiniciada', 'Empieza en la Invitación', 'good'); }}>Reiniciar partida</button>
      </div>
    </div>
  );
}
