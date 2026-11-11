import { useEffect, useState } from 'react';
import { CHALLENGES } from '../data/challenges';
import { BINGO_POOLS } from '../data/decks';
import { LOTTERY_ITEMS, MOVIE_PICKS } from '../data/gaming';
import { ChallengeList } from './Challenges';
import { ConfirmButton, Curtain, Modal, PageHead, PlayerSwitch, Section, Seg } from '../components/ui';
import { DeckDrawer } from '../components/DeckDrawer';
import { Icon } from '../components/Icon';
import {
  useGame, newBingo, toggleBingo, claimBingo, bingoHasLine, addPrediction, resolvePrediction,
  lotteryBid, lotteryChoice, lotteryGoldenSeat, lotteryReset, toast,
} from '../state/store';
import { PLAYERS, PLAYER_NAME, type PlayerId } from '../types';

type Tab = 'lottery' | 'bingo' | 'predict' | 'live' | 'modes';

export default function Movie() {
  const [tab, setTab] = useState<Tab>('lottery');
  return (
    <div>
      <PageHead eyebrow="08 · Movie & Series Night" title={<>Movie <span className="accent">Night</span></>} sub="No es sentarse a mirar la tele: es un concurso con palomitas. Todo está pensado para no tener que pausar." num="08" />
      <div className="scroll-x" style={{ marginBottom: 6 }}>
        <Seg<Tab> value={tab} onChange={setTab} options={[{ v: 'lottery', label: 'Movie Lottery' }, { v: 'bingo', label: 'Bingo' }, { v: 'predict', label: 'Predicciones' }, { v: 'live', label: 'Marcador en vivo' }, { v: 'modes', label: 'Modos y pelis' }]} />
      </div>
      {tab === 'lottery' && <Lottery />}
      {tab === 'bingo' && <Bingo />}
      {tab === 'predict' && <Predictions />}
      {tab === 'live' && <LiveCounter />}
      {tab === 'modes' && <Modes />}
    </div>
  );
}

/* ---------------- MOVIE LOTTERY: sealed-bid auctions ---------------- */
function Lottery() {
  const s = useGame();
  const [active, setActive] = useState<string | null>(null);
  return (
    <Section title="The Movie Lottery" aside={<span className="tiny faint">Subastas a sobre cerrado</span>}>
      <p className="small muted" style={{ marginTop: 0 }}>Cada decisión de la noche se subasta. Cada uno puja en secreto; la puja más alta gana y paga sus monedas (el otro no paga nada). Empate: decide el azar.</p>
      <div className="grid two">
        {LOTTERY_ITEMS.map((it) => {
          const lot = s.lottery[it.id];
          const golden = PLAYERS.filter((p) => s.prizes.some((r) => r.prizeId === 's-moviepick' && r.player === p && !r.redeemed));
          return (
            <div key={it.id} className={'card tight stack' + (lot?.winner && !lot.choice ? ' glow' : '')} style={{ gap: 10 }}>
              <div className="row between"><b>{it.name}</b>{lot?.winner && <span className={'ptag ' + lot.winner}>{PLAYER_NAME[lot.winner]}</span>}</div>
              {!lot && (
                <div className="row wrap">
                  <button className="btn primary sm" onClick={() => setActive(it.id)}><Icon name="coin" size={16} />Subastar</button>
                  {golden.map((p) => <button key={p} className="btn sm" onClick={() => lotteryGoldenSeat(it.id, p) && toast('Butaca de Oro', `${PLAYER_NAME[p]} gana "${it.name}" sin pujar`, 'gold')}>Butaca de Oro ({PLAYER_NAME[p]})</button>)}
                </div>
              )}
              {lot?.winner && !lot.choice && (
                <ChoicePicker itemId={it.id} options={it.id === 'title' ? MOVIE_PICKS.map((m) => m.title) : it.options} winner={lot.winner} />
              )}
              {lot?.choice && <div className="h-serif" style={{ fontSize: 18, color: 'var(--accent)' }}>{lot.choice}</div>}
              {lot && <ConfirmButton className="btn ghost sm" onConfirm={() => lotteryReset(it.id)} confirmText="¿Repetir subasta? (no devuelve monedas)">Repetir</ConfirmButton>}
            </div>
          );
        })}
      </div>
      {active && <BidFlow itemId={active} onClose={() => setActive(null)} />}
    </Section>
  );
}

function ChoicePicker({ itemId, options, winner }: { itemId: string; options: string[]; winner: PlayerId }) {
  const [custom, setCustom] = useState('');
  return (
    <div className="stack" style={{ gap: 8 }}>
      <span className="small">Elige, <b className={'ptag ' + winner}>{PLAYER_NAME[winner]}</b>:</span>
      <div className="chips">{options.map((o) => <button key={o} className="chip" onClick={() => lotteryChoice(itemId, o)}>{o}</button>)}</div>
      <div className="row"><input className="input" placeholder="Otra opción…" value={custom} onChange={(e) => setCustom(e.target.value)} /><button className="btn sm" disabled={!custom.trim()} onClick={() => lotteryChoice(itemId, custom.trim())}>OK</button></div>
    </div>
  );
}

function BidFlow({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const s = useGame();
  const [step, setStep] = useState<'g-curtain' | 'g' | 't-curtain' | 't' | 'done'>(s.sharedScreen ? 'g-curtain' : 'g');
  const [bids, setBids] = useState<Record<PlayerId, number>>({ gabriel: 0, tatiana: 0 });
  const [val, setVal] = useState('0');
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const item = LOTTERY_ITEMS.find((i) => i.id === itemId)!;
  const who: PlayerId = step.startsWith('g') ? 'gabriel' : 'tatiana';

  const submit = () => {
    const n = Math.max(0, Math.min(s.players[who].coins, Math.floor(+val || 0)));
    const nb = { ...bids, [who]: n };
    setBids(nb); setVal('0');
    if (who === 'gabriel') setStep(s.sharedScreen ? 't-curtain' : 't');
    else {
      const r = lotteryBid(itemId, nb);
      if (typeof r === 'string') { setWinner(r); setStep('done'); } else { toast('Error', r.error, 'bad'); onClose(); }
    }
  };

  if (step === 'g-curtain' || step === 't-curtain') {
    return <Curtain open to={who} label={`Puja secreta por "${item.name}".`} onCancel={onClose} onReveal={() => setStep(who === 'gabriel' ? 'g' : 't')} />;
  }
  return (
    <Modal open onClose={onClose} eyebrow="Movie Lottery" title={step === 'done' ? 'Resultado' : `Puja de ${PLAYER_NAME[who]}`}>
      {step !== 'done' ? (
        <div className="stack">
          <p className="muted" style={{ margin: 0 }}>Por: <b>{item.name}</b>. Tienes {s.players[who].coins} monedas.</p>
          <input className="input" type="number" inputMode="numeric" min={0} max={s.players[who].coins} value={val} onChange={(e) => setVal(e.target.value)} style={{ fontSize: 28, textAlign: 'center' }} />
          <div className="chips">{[0, 10, 25, 50, 100].filter((n) => n <= s.players[who].coins).map((n) => <button key={n} className="chip" onClick={() => setVal(String(n))}>{n}</button>)}</div>
          <button className="btn primary block" onClick={submit}>Sellar puja</button>
        </div>
      ) : (
        <div className="stack prize-reveal">
          <div className="row" style={{ justifyContent: 'space-around' }}>
            {PLAYERS.map((p) => <div key={p} style={{ textAlign: 'center' }}><div className={'ptag ' + p}>{PLAYER_NAME[p]}</div><div className="h-show" style={{ fontSize: 44 }}>{bids[p]}</div></div>)}
          </div>
          {winner && <div className="h-display" style={{ fontSize: 26, textAlign: 'center' }}>Gana <span className={'ptag ' + winner}>{PLAYER_NAME[winner]}</span></div>}
          <button className="btn primary block" onClick={onClose}>Elegir</button>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- BINGO ---------------- */
function Bingo() {
  const s = useGame();
  const [pool, setPool] = useState<keyof typeof BINGO_POOLS>('twilight');
  const [who, setWho] = useState<PlayerId>('tatiana');
  const card = s.bingo[pool]?.[who];
  const line = card ? bingoHasLine(card.marked) : false;
  return (
    <Section title={`Bingo ${BINGO_POOLS[pool].name}`}>
      <div className="stack">
        <div className="row wrap between">
          <Seg value={pool} onChange={(v) => setPool(v as keyof typeof BINGO_POOLS)} options={Object.entries(BINGO_POOLS).map(([k, v]) => ({ v: k, label: v.name }))} />
          <PlayerSwitch value={who} onChange={setWho} />
        </div>
        {!card ? (
          <div className="empty stack" style={{ alignItems: 'center' }}>
            <span>{PLAYER_NAME[who]} todavía no tiene cartón.</span>
            <button className="btn primary" onClick={() => newBingo(pool, who)}>Generar cartón</button>
          </div>
        ) : (
          <>
            <div className="bingo">{card.cells.map((c, i) => <button key={i} className={card.marked[i] ? 'on' : ''} onClick={() => toggleBingo(pool, who, i)}>{c}</button>)}</div>
            <div className="row wrap between">
              {card.claimed ? <span className="chip accent">Línea cantada · +15 pts · +30 monedas</span> : (
                <button className="btn primary" disabled={!line} onClick={() => claimBingo(pool, who) && toast(BINGO_POOLS[pool].shout, `${PLAYER_NAME[who]} canta línea · +15 pts · +30 monedas`, 'gold')}>Cantar {BINGO_POOLS[pool].shout}</button>
              )}
              <ConfirmButton className="btn ghost sm" onConfirm={() => newBingo(pool, who)} confirmText="¿Cartón nuevo?">Cartón nuevo</ConfirmButton>
            </div>
          </>
        )}
        <p className="tiny faint" style={{ margin: 0 }}>Cada cartón es distinto y aleatorio. Las casillas son situaciones genéricas: ninguna afirma lo que pasa en un episodio concreto.</p>
      </div>
    </Section>
  );
}

/* ---------------- PREDICTIONS ---------------- */
function Predictions() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [text, setText] = useState('');
  const [show, setShow] = useState('Película');
  const [reveal, setReveal] = useState(false);
  const locked = s.predictions.filter((p) => p.status === 'locked');
  const resolved = s.predictions.filter((p) => p.status !== 'locked');
  return (
    <Section title="Predicciones bloqueadas">
      <div className="stack">
        <div className="card stack">
          <div className="row wrap between"><PlayerSwitch value={who} onChange={setWho} /><Seg value={show} onChange={setShow} options={['Película', 'Isla', 'LoL', 'Fiesta', 'Otro'].map((v) => ({ v, label: v }))} /></div>
          <textarea className="input" placeholder="Escribe tu predicción (el otro no debería mirar)…" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn primary" disabled={!text.trim()} onClick={() => { addPrediction(who, text.trim(), show); setText(''); toast('Predicción sellada', 'Se revelará al final.', 'good'); }}><Icon name="lock" size={16} />Sellar predicción</button>
        </div>
        <div className="row between"><b>{locked.length} selladas</b><button className="btn sm" onClick={() => setReveal(!reveal)}><Icon name={reveal ? 'eyeoff' : 'eye'} size={16} />{reveal ? 'Ocultar' : 'Revelar todas'}</button></div>
        {locked.map((p) => (
          <div key={p.uid} className="card tight row between" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}><span className={'ptag ' + p.player}>{PLAYER_NAME[p.player]}</span> <span className="chip">{p.show}</span>
              <div style={{ marginTop: 6 }}>{reveal ? p.text : '••••••••••••'}</div></div>
            {reveal && <div className="row"><button className="btn sm" onClick={() => resolvePrediction(p.uid, true)} aria-label="Acierto"><Icon name="check" size={16} /></button><button className="btn sm ghost" onClick={() => resolvePrediction(p.uid, false)} aria-label="Fallo"><Icon name="close" size={16} /></button></div>}
          </div>
        ))}
        {resolved.length > 0 && <div className="small faint">Resueltas: {resolved.filter((r) => r.status === 'hit').length} aciertos de {resolved.length}. Cada acierto: +3 pts y +10 monedas.</div>}
      </div>
    </Section>
  );
}

/* ---------------- LIVE COUNTER (no-pause tally) ---------------- */
function LiveCounter() {
  const KEY = 'homelottery.live';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '') as Record<string, number>; } catch { return {}; } };
  const [c, setC] = useState<Record<string, number>>(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* noop */ } }, [c]);
  const rows = [{ id: 'word', label: 'Palabra prohibida oída' }, { id: 'drama', label: 'Drama predicho' }, { id: 'line', label: 'Next line acertada' }];
  const inc = (k: string, d: number) => setC((x) => ({ ...x, [k]: Math.max(0, (x[k] || 0) + d) }));
  return (
    <Section title="Marcador en vivo" aside={<ConfirmButton className="btn ghost sm" onConfirm={() => setC({})} confirmText="¿A cero?">Reiniciar</ConfirmButton>}>
      <p className="small muted" style={{ marginTop: 0 }}>Botones grandes para tocar a ciegas durante la peli, sin pausar. Al final, registrad el ganador de la prueba correspondiente.</p>
      <div className="stack">
        {rows.map((r) => (
          <div key={r.id} className="card tight">
            <div className="small faint" style={{ marginBottom: 8 }}>{r.label}</div>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {PLAYERS.map((p) => (
                <button key={p} className="btn lg" onClick={() => inc(r.id + p, 1)} onContextMenu={(e) => { e.preventDefault(); inc(r.id + p, -1); }}>
                  <span className={'ptag ' + p}>{PLAYER_NAME[p]}</span><span className="h-show" style={{ fontSize: 30 }}>{c[r.id + p] || 0}</span>
                </button>
              ))}
            </div>
            <div className="row" style={{ marginTop: 6, gap: 6 }}>{PLAYERS.map((p) => <button key={p} className="btn ghost sm" style={{ flex: 1 }} onClick={() => inc(r.id + p, -1)}>−1 {PLAYER_NAME[p]}</button>)}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- MODES ---------------- */
function Modes() {
  const list = CHALLENGES.filter((c) => c.category === 'movie');
  return (
    <>
      <Section title="Cómo jugar sin pausar">
        <div className="grid three">
          {[
            { i: 'lock', t: 'Antes del play', d: 'Movie Lottery, cartones de Bingo, predicciones selladas y palabras prohibidas.' },
            { i: 'eye', t: 'Durante', d: 'Solo se marcan casillas y se toca el marcador en vivo. Nada de pausas.' },
            { i: 'trophy', t: 'En los créditos', d: 'Se revelan predicciones, se cuentan palabras y se registran ganadores.' },
          ].map((x) => <div key={x.t} className="card tight item"><div className="item-icon"><Icon name={x.i} /></div><div><h3 style={{ fontSize: 15 }}>{x.t}</h3><p>{x.d}</p></div></div>)}
        </div>
      </Section>
      <Section title="Twilight: The Vampire Game"><ChallengeList list={list.filter((c) => c.sub === 'Twilight')} /></Section>
      <Section title="La isla de las tentaciones: The Couples Detectives"><ChallengeList list={list.filter((c) => c.sub === 'La isla de las tentaciones')} /></Section>
      <Section title="English Night"><ChallengeList list={list.filter((c) => c.sub === 'English Night')} /></Section>
      <Section title="Barajas de English Night">
        <div className="grid three"><DeckDrawer deckId="forbidden" compact /><DeckDrawer deckId="translate" compact /><DeckDrawer deckId="accents" compact /></div>
      </Section>
      <Section title="Propuestas para la noche">
        <div className="grid two">
          {MOVIE_PICKS.map((m) => (
            <div key={m.title} className="card tight"><h3 style={{ margin: 0, fontSize: 16 }}>{m.title}</h3><p className="small muted" style={{ margin: '4px 0' }}>{m.why}</p><div className="tiny faint">{m.lang} · {m.where}</div></div>
          ))}
        </div>
        <p className="tiny faint" style={{ marginTop: 10 }}>No sabemos qué plataformas tenéis contratadas: consultad <a href="https://www.justwatch.com/es" target="_blank" rel="noreferrer">JustWatch España</a> para ver dónde está cada título hoy.</p>
      </Section>
    </>
  );
}
