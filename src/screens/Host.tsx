import { useEffect, useState } from 'react';
import {
  useGame, setHostPin, checkHostPin, adjust, hostGiveCard, hostGiveKey, hostGiveBox, forceEnvelope, setEpisode, setPrizeOverride,
  setEnvelopeOverride, toggleChecklist, setHostNotes, resetGame, replayIntro, exportSave, importSave, setShared, boxEntries, toast, envelopeAvailable,
} from '../state/store';
import { EPISODES } from '../data/episodes';
import { BOXES, CARDS, CARD_TYPES, ENVELOPES, PRIZE_FOR, prizeById } from '../data/rewards';
import { GAMES } from '../data/gaming';
import { TONIGHT, MATERIALS, BREAKFAST, HOST_TIMELINE, PLAN_B, TOMORROW, PRESENTER_TIPS } from '../data/cheatsheet';
import { CHALLENGES } from '../data/challenges';
import { ConfirmButton, PageHead, PlayerSwitch, Section, Seg, Toggle, fmtTime } from '../components/ui';
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
    <div data-theme="host">
      <div className="row between no-print" style={{ marginBottom: 8 }}>
        <span className="classified"><Icon name="lock" size={14} />CONFIDENTIAL</span>
        <button className="btn danger sm" onClick={onLock}><Icon name="lock" size={16} />Bloquear</button>
      </div>
      <PageHead eyebrow="14 · Host Mode" title="Panel del presentador" sub="Solo para Gabriel. Se bloquea solo al salir de esta pantalla o tras 5 minutos sin uso." />
      <div className="scroll-x no-print" style={{ marginBottom: 10 }}>
        <Seg<Tab> value={tab} onChange={setTab} options={[{ v: 'sheet', label: 'Cheat Sheet' }, { v: 'control', label: 'Control' }, { v: 'prizes', label: 'Premios' }, { v: 'envelopes', label: 'Sobres' }, { v: 'settings', label: 'Ajustes' }]} />
      </div>
      {tab === 'sheet' && <CheatSheet />}
      {tab === 'control' && <Control />}
      {tab === 'prizes' && <Prizes />}
      {tab === 'envelopes' && <Envelopes />}
      {tab === 'settings' && <Settings />}
    </div>
  );
}

function PinGate({ hasPin, onUnlock }: { hasPin: boolean; onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [err, setErr] = useState('');
  return (
    <div data-theme="host" style={{ maxWidth: 420, margin: '6vh auto 0' }}>
      <div className="card glow stack" style={{ textAlign: 'center' }}>
        <div className="item-icon" style={{ margin: '0 auto' }}><Icon name="lock" /></div>
        <span className="classified" style={{ margin: '0 auto' }}>SOLO GABRIEL</span>
        <h1 className="h-display" style={{ fontSize: 28 }}>Host Mode</h1>
        {!hasPin ? (
          <>
            <p className="small muted" style={{ margin: 0 }}>Primera vez: crea un PIN de anfitrión (mínimo 4 dígitos). Tatiana: si estás leyendo esto, vuelve atrás y no hagas trampas.</p>
            <input className="input" type="password" inputMode="numeric" placeholder="Nuevo PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
            <input className="input" type="password" inputMode="numeric" placeholder="Repetir PIN" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} />
            {err && <div className="small" style={{ color: 'var(--bad)' }}>{err}</div>}
            <button className="btn primary" onClick={() => { if (pin.length < 4) return setErr('Mínimo 4 dígitos'); if (pin !== pin2) return setErr('No coinciden'); setHostPin(pin); onUnlock(); }}>Crear PIN y entrar</button>
          </>
        ) : (
          <>
            <p className="small muted" style={{ margin: 0 }}>Introduce el PIN de anfitrión.</p>
            <input className="input" type="password" inputMode="numeric" autoFocus placeholder="PIN" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && (checkHostPin(pin) ? onUnlock() : setErr('PIN incorrecto'))} style={{ textAlign: 'center', fontSize: 24, letterSpacing: '.4em' }} />
            {err && <div className="small" style={{ color: 'var(--bad)' }}>{err}</div>}
            <button className="btn primary" onClick={() => (checkHostPin(pin) ? onUnlock() : setErr('PIN incorrecto'))}>Entrar</button>
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
    <button className={'check-item' + (on ? ' on' : '')} onClick={() => toggleChecklist(id)}>
      <span className="check-box">{on && <Icon name="check" size={14} stroke={2.4} />}</span>
      <span className="check-text small">{text}</span>
    </button>
  );
}

export function CheatSheet() {
  const s = useGame();
  const done = Object.values(s.host.checklist).filter(Boolean).length;
  const total = TONIGHT.reduce((a, g) => a + g.items.length, 0) + TOMORROW.length;
  return (
    <div className="stack lg">
      <div className="card glow">
        <span className="classified">CONFIDENTIAL — DO NOT SHOW TATIANA</span>
        <h2 className="h-display" style={{ fontSize: 'clamp(24px,6vw,36px)', marginTop: 14 }}>GABRIEL'S SECRET CHEAT SHEET</h2>
        <p className="muted" style={{ margin: '8px 0 12px' }}>Todo lo necesario para que mañana puedas disfrutar tú también. {done}/{total} tareas marcadas.</p>
        <div className="progress"><i style={{ width: (done / total) * 100 + '%' }} /></div>
        <div className="row wrap no-print" style={{ marginTop: 14 }}>
          <button className="btn primary" onClick={() => window.print()}><Icon name="printer" />Imprimir / guardar PDF</button>
        </div>
      </div>

      <section>
        <div className="eyebrow">A · Preparación esta noche</div>
        <div className="grid two" style={{ marginTop: 10 }}>
          {TONIGHT.map((g) => (
            <div key={g.id} className="card tight"><h3 style={{ margin: '0 0 6px', fontSize: 16 }}>{g.title}</h3>{g.items.map((i) => <Check key={i.id} id={'t-' + i.id} text={i.text} />)}</div>
          ))}
        </div>
      </section>

      <section className="print-break">
        <div className="eyebrow">B · Descargas y videojuegos (verificado nov. 2026)</div>
        <div className="table-wrap" style={{ marginTop: 10 }}>
          <table className="t">
            <thead><tr><th>Juego</th><th>Prioridad</th><th>Plataforma</th><th>Precio</th><th>Tamaño</th><th>PS Plus</th><th>Multijugador</th><th>Requisitos</th><th>Enlace</th></tr></thead>
            <tbody>
              {GAMES.map((g) => (
                <tr key={g.name}>
                  <td><b>{g.name}</b><div className="tiny faint">{g.note}</div></td>
                  <td><span className={'prio ' + prioClass(g.priority)}>{g.priority}</span></td>
                  <td>{g.platform}</td><td>{g.price}</td><td>{g.size}</td><td>{g.psPlus}</td><td>{g.local}</td><td>{g.needs}</td>
                  <td><a href={g.link} target="_blank" rel="noreferrer">Oficial</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="tiny faint">Fuentes: fichas oficiales de PlayStation Store/playstation.com (ARK: pantalla dividida local 2 jugadores; Brawlhalla gratis con modos locales; Rocket League free-to-play), ayuda oficial de Epic (pantalla dividida de Rocket League y Fortnite) y declaración de Psyonix (Rocket League online sin PS Plus). El tamaño de ARK (~179 GB) viene de PSPrices, no de Sony: el tamaño real del parche lo verás en la consola. Recomendación: con ARK + Split Fiction + Rocket League tenéis de sobra.</p>
      </section>

      <section>
        <div className="eyebrow">C · Materiales</div>
        <div className="grid two" style={{ marginTop: 10 }}>
          <div className="card tight"><h3 style={{ margin: '0 0 6px', fontSize: 16 }}>Probablemente ya en casa</h3>{MATERIALS.home.map((m, i) => <Check key={i} id={'mh-' + i} text={m} />)}</div>
          <div className="card tight"><h3 style={{ margin: '0 0 6px', fontSize: 16 }}>Comprar si falta</h3>{MATERIALS.buy.map((m, i) => <Check key={i} id={'mb-' + i} text={m} />)}</div>
        </div>
      </section>

      <section className="print-break">
        <div className="eyebrow">D · El desayuno</div>
        <div className="stack" style={{ marginTop: 10 }}>
          {BREAKFAST.map((b, i) => <div key={i} className="card tight item"><div className="item-icon"><span className="h-show" style={{ fontSize: 20 }}>{i + 1}</span></div><div><h3 style={{ fontSize: 15 }}>{b.t}</h3><p>{b.d}</p></div></div>)}
          <div className="card tight"><div className="tiny faint">Texto de la invitación (aparece solo en la app)</div><p className="small" style={{ fontStyle: 'italic', margin: '6px 0 0' }}>"Buenos días, Tatiana. Hoy Gabriel ha preparado algo para ti. Pero hay una pequeña condición… Hoy no vas a poder decidirlo todo. Habrá desafíos. Habrá apuestas. Habrá sorpresas. Habrá premios que todavía no conoces. Y puede que hoy descubras que tienes un pequeño rival en casa. Bienvenida a… HOMELOTTERY · GABRIEL × TATIANA · THE COUPLES EDITION"</p></div>
        </div>
      </section>

      <section>
        <div className="eyebrow">E · Cronograma de Gabriel</div>
        <div className="card tight" style={{ marginTop: 10 }}>
          {HOST_TIMELINE.map((t) => <div key={t.time} className="history-item"><time style={{ minWidth: 50, fontWeight: 800, color: 'var(--accent)' }}>{t.time}</time><div className="small">{t.what}</div></div>)}
        </div>
        <div className="grid two" style={{ marginTop: 12 }}>
          {EPISODES.map((e) => <div key={e.n} className="card tight"><div className="tiny faint">{e.code} · {e.time}</div><b>{e.title}</b><p className="small muted" style={{ margin: '4px 0 0' }}>{e.hostNote}</p></div>)}
        </div>
      </section>

      <section className="print-break">
        <div className="eyebrow">F · Premios secretos</div>
        <PrizeCatalog compact />
      </section>

      <section>
        <div className="eyebrow">G · Plan B</div>
        <div className="grid two" style={{ marginTop: 10 }}>
          {PLAN_B.map((p) => <div key={p.q} className="card tight"><b>{p.q}</b><p className="small muted" style={{ margin: '4px 0 0' }}>{p.a}</p></div>)}
        </div>
      </section>

      <section>
        <div className="eyebrow">H · Checklist de mañana</div>
        <div className="card tight" style={{ marginTop: 10 }}>{TOMORROW.map((t, i) => <Check key={i} id={'m-' + i} text={`${i + 1}. ${t}`} />)}</div>
      </section>

      <section>
        <div className="eyebrow">Extra · Consejos de presentador y reglas internas</div>
        <div className="card tight" style={{ marginTop: 10 }}>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
            {PRESENTER_TIPS.map((t) => <li key={t} style={{ marginBottom: 6 }}>{t}</li>)}
            <li>Economía: cada uno empieza con 50 monedas. Ganar un duelo da puntos + monedas (+5 por racha, máx. +20); perder da 40% de las monedas como consolación (60% en modo Relax). Si el ganador iba 30+ puntos por detrás, cobra x1.5 monedas. En la Gran Final los puntos valen doble.</li>
            <li>Cajas: Bronze 30 · Silver 60 · Gold 110 · Diamond 180 · Legendary = 1 llave. Llaves: 1 por jugador en el Sobre de la Gran Final + Gold/Diamond/Ruletas/logros.</li>
            <li>Biblioteca: {CHALLENGES.length} pruebas en 6 categorías.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function PrizeCatalog({ compact }: { compact?: boolean }) {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [edit, setEdit] = useState<string | null>(null);
  const [txt, setTxt] = useState('');
  return (
    <div className="stack" style={{ marginTop: 10 }}>
      <div className="row wrap between no-print"><PlayerSwitch value={who} onChange={setWho} label="Probabilidades actuales para:" /></div>
      {BOXES.map((b) => {
        const rows = boxEntries(s, who, b.tier);
        const baseTotal = b.entries.reduce((a, e) => a + e.weight, 0);
        return (
          <div key={b.tier} className="card tight">
            <div className="row between"><b style={{ color: b.color, fontFamily: 'var(--font-display)', letterSpacing: '.08em' }}>{b.name}</b><span className="tiny faint">{b.costLabel} · desde EP 0{b.unlockEpisode}</span></div>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table className="t" style={{ minWidth: compact ? 560 : 640 }}>
                <thead><tr><th>Premio</th><th>Base</th><th>Ahora ({PLAYER_NAME[who]})</th><th>Preparación física</th>{!compact && <th />}</tr></thead>
                <tbody>
                  {b.entries.map((e) => {
                    const pr = prizeById(e.prizeId)!;
                    const r = rows.find((x) => x.prizeId === e.prizeId)!;
                    const ov = s.host.prizeOverrides[pr.id];
                    return (
                      <tr key={pr.id}>
                        <td><b>{pr.title}</b>{pr.unique && <span className="chip" style={{ marginLeft: 6 }}>único</span>}{PRIZE_FOR[pr.id] && <span className="chip" style={{ marginLeft: 6 }}>solo {PLAYER_NAME[PRIZE_FOR[pr.id]]}</span>}<div className="tiny faint">{ov || pr.text}</div>
                          {edit === pr.id && (
                            <div className="stack no-print" style={{ marginTop: 8, gap: 6 }}>
                              <textarea className="input" value={txt} onChange={(ev) => setTxt(ev.target.value)} />
                              <div className="row"><button className="btn sm primary" onClick={() => { setPrizeOverride(pr.id, txt); setEdit(null); }}>Guardar</button><button className="btn sm ghost" onClick={() => { setPrizeOverride(pr.id, ''); setEdit(null); }}>Restaurar original</button></div>
                            </div>
                          )}
                        </td>
                        <td>{Math.round((e.weight / baseTotal) * 100)}%</td>
                        <td>{r.eligible ? `${Math.round(r.chance * 100)}%` : <span className="tiny faint">{r.reason}</span>}</td>
                        <td className="tiny">{pr.prep}</td>
                        {!compact && <td><button className="btn sm ghost no-print" onClick={() => { setEdit(pr.id); setTxt(ov || pr.text); }}>Editar</button></td>}
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
    <div className="stack">
      <p className="small muted" style={{ margin: 0 }}>Edita el texto de un premio (por ejemplo, la pista de dónde has escondido algo). El cambio afecta a premios futuros: los ya entregados no cambian.</p>
      <PrizeCatalog />
      <Section title={`Premios entregados · ${s.prizes.length}`}>
        <div className="card tight">{s.prizes.length === 0 ? <span className="small faint">Ninguno todavía.</span> : s.prizes.map((r) => <div key={r.uid} className="history-item"><time>{fmtTime(r.at)}</time><div className="small"><b className={'ptag ' + r.player}>{PLAYER_NAME[r.player]}</b> · {r.box} · {r.title}{r.redeemed ? ' (canjeado)' : ''}</div></div>)}</div>
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
    <div className="stack lg">
      <div className="card stack">
        <h3 style={{ margin: 0 }}>Episodio</h3>
        <div className="scroll-x">{EPISODES.map((e) => <button key={e.n} className={'chip' + (s.episode === e.n ? ' accent' : '')} onClick={() => setEpisode(e.n)}>{e.code}</button>)}</div>
        <p className="tiny faint" style={{ margin: 0 }}>{EPISODES[s.episode - 1].hostNote}</p>
      </div>
      <div className="card stack">
        <div className="row between wrap"><h3 style={{ margin: 0 }}>Ajustes de marcador</h3><PlayerSwitch value={who} onChange={setWho} /></div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <label className="field">Monedas (+/−)<input className="input" type="number" value={coins} onChange={(e) => setCoins(e.target.value)} /></label>
          <label className="field">Puntos (+/−)<input className="input" type="number" value={pts} onChange={(e) => setPts(e.target.value)} /></label>
        </div>
        <input className="input" placeholder="Motivo (aparece en el historial)" value={why} onChange={(e) => setWhy(e.target.value)} />
        <ConfirmButton className="btn primary" onConfirm={() => { adjust(who, +coins || 0, +pts || 0, why); setCoins('0'); setPts('0'); setWhy(''); toast('Ajuste aplicado', PLAYER_NAME[who], 'good'); }}>Aplicar a {PLAYER_NAME[who]}</ConfirmButton>
        <div className="divider" />
        <div className="row wrap">
          <select className="input" style={{ flex: 1, minWidth: 160 }} value={card} onChange={(e) => setCard(e.target.value as CardType)}>{CARD_TYPES.map((c) => <option key={c} value={c}>{CARDS[c].name}</option>)}</select>
          <button className="btn" onClick={() => { hostGiveCard(who, card); toast('Carta entregada', `${CARDS[card].name} → ${PLAYER_NAME[who]}`, 'good'); }}>Dar carta</button>
        </div>
        <div className="row wrap">
          <select className="input" style={{ flex: 1, minWidth: 160 }} value={box} onChange={(e) => setBox(e.target.value as BoxTier)}>{BOXES.map((b) => <option key={b.tier} value={b.tier}>{b.name}</option>)}</select>
          <button className="btn" onClick={() => { hostGiveBox(who, box); toast('Caja regalada', PLAYER_NAME[who], 'good'); }}>Regalar caja</button>
          <button className="btn" onClick={() => { hostGiveKey(who); toast('Llave entregada', PLAYER_NAME[who], 'good'); }}><Icon name="key" size={16} />Dar llave</button>
        </div>
      </div>
      <div className="card stack">
        <h3 style={{ margin: 0 }}>Notas privadas</h3>
        <textarea className="input" value={s.host.notes} onChange={(e) => setHostNotes(e.target.value)} placeholder="Ideas, recordatorios, dónde escondiste cosas…" />
      </div>
      <div className="card tight">
        <h3 style={{ margin: '0 0 8px' }}>Historial completo (incluye entradas privadas)</h3>
        {s.history.slice(0, 80).map((h) => <div key={h.uid} className="history-item"><time>{fmtTime(h.at)}</time><div className="small">{h.secret && <span className="chip" style={{ marginRight: 6 }}>privado</span>}{h.text}</div></div>)}
      </div>
    </div>
  );
}

function Envelopes() {
  const s = useGame();
  const [edit, setEdit] = useState<string | null>(null);
  const [txt, setTxt] = useState('');
  return (
    <div className="stack">
      {ENVELOPES.map((e) => {
        const opened = s.envelopesOpened.includes(e.id);
        const avail = envelopeAvailable(s, e.id);
        return (
          <div key={e.id} className="card tight stack" style={{ gap: 8 }}>
            <div className="row between wrap"><b>{e.name}</b><span className="chip">{opened ? 'Abierto' : avail ? 'Disponible' : 'Bloqueado'}</span></div>
            <div className="tiny faint">Condición: {e.condition} · Para: {e.to === 'both' ? 'los dos' : e.to === 'trailing' ? 'quien va por detrás' : PLAYER_NAME[e.to as PlayerId] || e.to} · Recompensa: {e.reward}</div>
            {edit === e.id ? (
              <>
                <textarea className="input" style={{ minHeight: 160 }} value={txt} onChange={(ev) => setTxt(ev.target.value)} />
                <div className="row"><button className="btn sm primary" onClick={() => { setEnvelopeOverride(e.id, txt); setEdit(null); }}>Guardar</button><button className="btn sm ghost" onClick={() => { setEnvelopeOverride(e.id, ''); setEdit(null); }}>Restaurar original</button></div>
              </>
            ) : <div className="small muted" style={{ whiteSpace: 'pre-line' }}>{s.host.envelopeOverrides[e.id] || e.message}</div>}
            <div className="row wrap">
              {edit !== e.id && <button className="btn sm" onClick={() => { setEdit(e.id); setTxt(s.host.envelopeOverrides[e.id] || e.message); }}>Editar mensaje</button>}
              {!opened && !avail && <ConfirmButton className="btn sm" onConfirm={() => { forceEnvelope(e.id); toast('Sobre desbloqueado', e.name, 'good'); }}>Desbloquear ahora</ConfirmButton>}
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
    <div className="stack lg">
      <div className="card stack">
        <div className="row between"><span>Modo un solo móvil (cortinas de privacidad)</span><Toggle on={s.sharedScreen} onChange={setShared} /></div>
        <div className="row"><input className="input" type="password" inputMode="numeric" placeholder="Nuevo PIN" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} /><button className="btn" disabled={pin.length < 4} onClick={() => { setHostPin(pin); setPin(''); toast('PIN actualizado', undefined, 'good'); }}>Cambiar PIN</button></div>
        <ConfirmButton className="btn" onConfirm={() => { replayIntro(); }}>Volver a mostrar la Invitación</ConfirmButton>
      </div>
      <div className="card stack">
        <h3 style={{ margin: 0 }}>Copia de seguridad</h3>
        <button className="btn" onClick={() => { const blob = new Blob([exportSave()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'homelottery-partida.json'; a.click(); }}><Icon name="download" />Exportar partida</button>
        <textarea className="input" placeholder="Pega aquí una partida exportada para restaurarla" value={imp} onChange={(e) => setImp(e.target.value)} />
        <ConfirmButton className="btn" disabled={!imp.trim()} onConfirm={() => { toast(importSave(imp) ? 'Partida restaurada' : 'Archivo no válido', undefined, 'good'); setImp(''); }}>Importar</ConfirmButton>
      </div>
      <div className="card stack" style={{ borderColor: 'rgba(239,122,122,.35)' }}>
        <h3 style={{ margin: 0, color: '#ffb3b3' }}>Reinicio seguro</h3>
        <p className="small muted" style={{ margin: 0 }}>Borra puntuaciones, monedas, premios, cartas e historial. Escribe REINICIAR para confirmar.</p>
        <div className="row"><span className="small">Conservar PIN, textos editados y checklist</span><Toggle on={keepHost} onChange={setKeepHost} /></div>
        <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="REINICIAR" />
        <button className="btn danger" disabled={confirm !== 'REINICIAR'} onClick={() => { resetGame(keepHost); setConfirm(''); toast('Partida reiniciada', 'Empieza en la Invitación', 'good'); }}>Reiniciar partida</button>
      </div>
    </div>
  );
}
