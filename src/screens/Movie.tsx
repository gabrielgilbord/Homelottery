import { useEffect, useState, type CSSProperties } from 'react';
import { CHALLENGES } from '../data/challenges';
import { BINGO_POOLS } from '../data/decks';
import { LOTTERY_ITEMS, MOVIE_PICKS } from '../data/gaming';
import { ChallengeList } from './Challenges';
import { ConfirmButton, Curtain, Empty, Modal, PlayerSwitch, Section, Seg } from '../components/ui';
import { DeckStage } from '../components/DeckDrawer';
import { Icon } from '../components/Icon';
import { HowTo } from '../components/HowTo';
import { celebrate } from '../lib/celebrate';
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
      <header className="cinema-head">
        <div className="stack" style={{ ['--gap' as string]: 'var(--s-3)', maxWidth: 640 }}>
          <div className="marquee" aria-hidden>{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>
          <span className="bc" style={{ alignSelf: 'flex-start', color: 'var(--champagne)' }}>The Screening Room</span>
          <h1 className="h1">Noche de cine</h1>
          <p className="lead">Para cualquier peli o serie que elijáis. Antes del play: subasta, cartones y predicciones. Durante: se marca sin pausar. En los créditos: se cuenta quién gana.</p>
          <p className="credits" aria-label="Créditos">
            <span>Una producción</span><b>Homelottery</b><span>protagonizada por</span><b>Tatiana</b><span>y</span><b>Gabriel</b><span>en</span><b>sesión privada</b>
          </p>
        </div>
      </header>
      <div style={{ marginBottom: 'var(--s-6)' }}>
        <Seg<Tab> value={tab} onChange={setTab} label="Secciones de Movie Night" options={[{ v: 'lottery', label: 'Subasta' }, { v: 'bingo', label: 'Bingo' }, { v: 'predict', label: 'Predicciones' }, { v: 'live', label: 'En vivo' }, { v: 'modes', label: 'Modos' }]} />
      </div>
      <div key={tab} className="page">
        {tab === 'lottery' && <Lottery />}
        {tab === 'bingo' && <Bingo />}
        {tab === 'predict' && <Predictions />}
        {tab === 'live' && <LiveCounter />}
        {tab === 'modes' && <Modes />}
      </div>
    </div>
  );
}

/* ---------------- MOVIE LOTTERY: sealed-bid auctions ---------------- */
function Lottery() {
  const s = useGame();
  const [active, setActive] = useState<string | null>(null);
  return (
    <section>
      <div className="section-head"><h2 className="h2">The Movie Lottery</h2></div>
      <HowTo
        need={['Monedas del juego (las que tengáis cada uno)', 'Este móvil, que os vais pasando']}
        steps={[
          <><b>Se subasta cada decisión de la noche:</b> el género, qué peli o serie, el idioma, los snacks, cómo la veis y qué juegos activáis.</>,
          <>Toca <b>Subastar</b> en una fila. Primero puja Gabriel en secreto (con la cortina) y pulsa <b>Sellar puja</b>; luego Tatiana.</>,
          <>Gana la puja más alta y <b>solo paga quien gana</b>. Si empatáis, decide el azar.</>,
          <>Quien gana elige la opción (o escribe otra en <b>Otra opción</b>).</>,
          <>¿Os da igual pujar? Pujad 0 los dos y lo decide el azar.</>,
        ]}
      />
      <div style={{ borderTop: '1px solid var(--line)' }}>
        {LOTTERY_ITEMS.map((it) => {
          const lot = s.lottery[it.id];
          const golden = PLAYERS.filter((p) => s.prizes.some((r) => r.prizeId === 's-moviepick' && r.player === p && !r.redeemed));
          return (
            <div key={it.id} className={'lot' + (lot?.winner ? ' won' : '')}>
              <div className="split"><span className="h4">{it.name}</span>{lot?.winner ? <span className={'pname small ' + lot.winner}>{PLAYER_NAME[lot.winner]}</span> : <span className="small faint">Sin subastar</span>}</div>
              {!lot && (
                <div className="cluster">
                  <button className="btn accent sm" onClick={() => setActive(it.id)}><Icon name="coin" size={14} />Subastar</button>
                  {golden.map((p) => <button key={p} className="btn value sm" onClick={() => lotteryGoldenSeat(it.id, p) && toast('Butaca de Oro', `${PLAYER_NAME[p]} gana “${it.name}” sin pujar`, 'gold')}>Butaca de Oro · {PLAYER_NAME[p]}</button>)}
                </div>
              )}
              {lot?.winner && !lot.choice && <ChoicePicker itemId={it.id} options={it.id === 'title' ? MOVIE_PICKS.map((m) => m.title) : it.options} winner={lot.winner} />}
              {lot?.choice && <div className="h3 accent-text">{lot.choice}</div>}
              {lot && <ConfirmButton className="btn quiet sm" onConfirm={() => lotteryReset(it.id)} confirmText="¿Repetir? No devuelve monedas">Repetir subasta</ConfirmButton>}
            </div>
          );
        })}
      </div>
      {active && <BidFlow itemId={active} onClose={() => setActive(null)} />}
    </section>
  );
}

function ChoicePicker({ itemId, options, winner }: { itemId: string; options: string[]; winner: PlayerId }) {
  const [custom, setCustom] = useState('');
  return (
    <div className="stack" style={{ ['--gap' as string]: 'var(--s-2)' }}>
      <span className="small">Elige, <b className={'pname ' + winner}>{PLAYER_NAME[winner]}</b></span>
      <div className="cluster" style={{ ['--gap' as string]: '6px' }}>{options.map((o) => <button key={o} className="chip" onClick={() => lotteryChoice(itemId, o)}>{o}</button>)}</div>
      <div className="cluster" style={{ flexWrap: 'nowrap' }}><input className="input" placeholder="Otra opción" value={custom} onChange={(e) => setCustom(e.target.value)} /><button className="btn" disabled={!custom.trim()} onClick={() => lotteryChoice(itemId, custom.trim())}>Elegir</button></div>
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
  const max = s.players[who].coins;
  const n = Math.floor(+val || 0);
  const invalid = n < 0 || n > max;

  const submit = () => {
    if (invalid) return;
    const nb = { ...bids, [who]: n };
    setBids(nb); setVal('0');
    if (who === 'gabriel') setStep(s.sharedScreen ? 't-curtain' : 't');
    else {
      const r = lotteryBid(itemId, nb);
      if (typeof r === 'string') { setWinner(r); setStep('done'); celebrate(1); } else { toast('No se pudo pujar', r.error, 'bad'); onClose(); }
    }
  };

  if (step === 'g-curtain' || step === 't-curtain') {
    return <Curtain open to={who} label={`Puja secreta por “${item.name}”.`} onCancel={onClose} onReveal={() => setStep(who === 'gabriel' ? 'g' : 't')} />;
  }
  return (
    <Modal open onClose={onClose} eyebrow="Movie Lottery" title={step === 'done' ? 'Se abren los sobres' : `Puja de ${PLAYER_NAME[who]}`}>
      {step !== 'done' ? (
        <div className="stack" style={{ ['--gap' as string]: 'var(--s-4)' }}>
          <p className="muted">Por <b style={{ color: 'var(--ivory)' }}>{item.name}</b>. Tienes <span className="value-text num">{max}</span> monedas.</p>
          <label className="field"><span className="sr-only">Monedas</span>
            <input className="input num" type="number" inputMode="numeric" min={0} max={max} value={val} aria-invalid={invalid} onChange={(e) => setVal(e.target.value)} style={{ fontSize: 32, textAlign: 'center', fontFamily: 'var(--f-display)' }} />
          </label>
          {invalid && <span className="error-text">Puedes pujar entre 0 y {max} monedas.</span>}
          <div className="cluster">{[0, 10, 25, 50, 100].filter((x) => x <= max).map((x) => <button key={x} className={'chip' + (n === x ? ' on' : '')} onClick={() => setVal(String(x))}>{x}</button>)}</div>
          <button className="btn value lg block" disabled={invalid} onClick={submit}>Sellar puja</button>
        </div>
      ) : (
        <div className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
          <div className="grid-2">
            {PLAYERS.map((p) => <div key={p} className="stack" style={{ alignItems: 'center', ['--gap' as string]: '4px', animation: 'pop .5s var(--ease-spring) both' }}><span className={'pname ' + p}>{PLAYER_NAME[p]}</span><span className="score num">{bids[p]}</span></div>)}
          </div>
          {winner && <p className="h3" style={{ textAlign: 'center' }}>Gana <span className={'pname ' + winner}>{PLAYER_NAME[winner]}</span></p>}
          <button className="btn primary block" onClick={onClose}>Elegir</button>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- BINGO ---------------- */
function Bingo() {
  const s = useGame();
  const [pool, setPool] = useState<string>('peli');
  const [who, setWho] = useState<PlayerId>('tatiana');
  const card = s.bingo[pool]?.[who];
  const line = card ? bingoHasLine(card.marked) : false;
  const LINES = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], [0, 5, 10, 15], [3, 6, 9, 12]];
  const missing = card ? Math.min(...LINES.map((l) => l.filter((i) => !card.marked[i]).length)) : 4;
  return (
    <section className="stack" style={{ ['--gap' as string]: 'var(--s-4)' }}>
      <HowTo
        need={['Cualquier peli o serie', 'Este móvil (un cartón para cada uno, en el mismo móvil)']}
        steps={[
          <><b>Elegid el tipo de cartón</b> que pega con lo que vais a ver: Cualquier peli, Romántica, Acción, Terror o Serie / reality.</>,
          <><b>Un cartón para cada uno.</b> En “Cartón de” elige <b>Gabriel</b> y pulsa <b>Generar cartón</b>. Luego elige <b>Tatiana</b> y genera el suyo. Son distintos.</>,
          <><b>Dadle al play.</b> Cuando pase en pantalla algo de tu cartón, pon tu nombre en “Cartón de” y <b>toca esa casilla</b> (se pone granate). No hace falta pausar.</>,
          <><b>Línea</b> = 4 casillas seguidas en fila, columna o diagonal. Cuando la tengas, se enciende <b>Cantar</b>: púlsalo y grita la palabra. +15 puntos y +30 monedas.</>,
          <>Gana quien cante primero. Si os pica, seguid a cartón lleno.</>,
        ]}
      />
      <div className="stack" style={{ ['--gap' as string]: 'var(--s-3)' }}>
        <label className="field">Tipo de cartón
          <Seg value={pool} onChange={setPool} label="Tipo de cartón" options={Object.entries(BINGO_POOLS).filter(([, v]) => !v.archived).map(([k, v]) => ({ v: k, label: v.name }))} />
        </label>
        <div className="split" style={{ flexWrap: 'wrap' }}>
          <PlayerSwitch value={who} onChange={setWho} label="Cartón de" />
          <span className="cluster bingo-status">{PLAYERS.map((p) => <span key={p} className={'tag' + (s.bingo[pool]?.[p] ? ' ok' : '')}>{PLAYER_NAME[p]}: {s.bingo[pool]?.[p] ? (s.bingo[pool]![p]!.claimed ? 'cantó' : 'listo') : 'sin cartón'}</span>)}</span>
        </div>
      </div>
      {!card ? (
        <Empty icon="film" action={<button className="btn accent" onClick={() => newBingo(pool, who)}>Generar cartón</button>}>{PLAYER_NAME[who]} todavía no tiene cartón de {BINGO_POOLS[pool].name}.</Empty>
      ) : (
        <>
          <div className="bingo" style={{ maxWidth: 520 }}>{card.cells.map((c, i) => <button key={i} className={card.marked[i] ? 'on' : ''} aria-pressed={card.marked[i]} onClick={() => toggleBingo(pool, who, i)}>{c}</button>)}</div>
          {!card.claimed && <p className="bingo-hint">{line ? <b>¡Tienes línea! Pulsa Cantar.</b> : <>A {PLAYER_NAME[who]} le {missing === 1 ? 'falta 1 casilla' : `faltan ${missing} casillas`} para cantar línea.</>}</p>}
          <div className="cluster">
            {card.claimed ? <span className="tag ok">Línea cantada: +15 pts y +30 monedas</span> : (
              <button className="btn accent lg" disabled={!line} onClick={() => { if (claimBingo(pool, who)) { celebrate(2); toast(BINGO_POOLS[pool].shout, `${PLAYER_NAME[who]} canta línea · +15 pts · +30 monedas`, 'gold'); } }}>Cantar {BINGO_POOLS[pool].shout}</button>
            )}
            <ConfirmButton className="btn quiet sm" onConfirm={() => newBingo(pool, who)} confirmText="¿Cartón nuevo?">Cartón nuevo</ConfirmButton>
          </div>
        </>
      )}
      <p className="small faint prose">Cada cartón sale al azar de 24 situaciones típicas del tipo de peli. ¿Os equivocáis al tocar? Se toca otra vez y se desmarca.</p>
    </section>
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
    <section className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
      <HowTo
        need={['Una peli o serie (o cualquier cosa que vaya a pasar esta noche)', 'Este móvil, que os vais pasando']}
        steps={[
          <><b>Antes del play</b>, elige tu nombre y escribe una predicción: “acaban juntos”, “el amigo es el malo”, “alguien llora antes de la mitad”…</>,
          <>Pulsa <b>Sellar predicción</b>. Queda oculta (se ven puntitos). Escribid 3 cada uno.</>,
          <><b>Al acabar</b>, pulsad <b>Revelar todas</b> y marcad cada una con el botón de acierto o el de fallo.</>,
          <>Cada acierto suma solo <b>+3 puntos y +10 monedas</b> a quien la escribió.</>,
        ]}
      />
      <div className="surface stack">
        <div className="split" style={{ flexWrap: 'wrap' }}><PlayerSwitch value={who} onChange={setWho} /><Seg value={show} onChange={setShow} label="Tema" options={['Película', 'Serie', 'Fiesta', 'LoL', 'Otro'].map((v) => ({ v, label: v }))} /></div>
        <label className="field"><span className="sr-only">Predicción</span><textarea className="input" placeholder="Escribe tu predicción. El otro no debería mirar." value={text} onChange={(e) => setText(e.target.value)} /></label>
        <button className="btn accent" disabled={!text.trim()} onClick={() => { addPrediction(who, text.trim(), show); setText(''); toast('Predicción sellada', 'Se revelará al final.', 'good'); }}><Icon name="lock" size={16} />Sellar predicción</button>
      </div>
      <div className="split"><span className="h4">{locked.length} selladas</span><button className="btn ghost sm" onClick={() => setReveal(!reveal)}><Icon name={reveal ? 'eyeoff' : 'eye'} size={14} />{reveal ? 'Ocultar' : 'Revelar todas'}</button></div>
      {locked.length === 0 ? <Empty icon="lock">Nada sellado todavía.</Empty> : (
        <div className="list">
          {locked.map((p) => (
            <div key={p.uid} className="row-item">
              <span className="grow stack" style={{ ['--gap' as string]: '4px' }}>
                <span className="cluster"><span className={'pname small ' + p.player}>{PLAYER_NAME[p.player]}</span><span className="tag">{p.show}</span></span>
                <span className="small">{reveal ? p.text : '•••• •••• ••••'}</span>
              </span>
              {reveal && <span className="cluster" style={{ flexWrap: 'nowrap' }}><button className="btn icon sm" onClick={() => { resolvePrediction(p.uid, true); celebrate(1); }} aria-label="Acierto"><Icon name="check" size={16} /></button><button className="btn icon sm ghost" onClick={() => resolvePrediction(p.uid, false)} aria-label="Fallo"><Icon name="close" size={16} /></button></span>}
            </div>
          ))}
        </div>
      )}
      {resolved.length > 0 && <p className="small faint">Resueltas: {resolved.filter((r) => r.status === 'hit').length} aciertos de {resolved.length}. Cada acierto: +3 pts y +10 monedas.</p>}
    </section>
  );
}

/* ---------------- LIVE COUNTER (no-pause tally) ---------------- */
function LiveCounter() {
  const KEY = 'homelottery.live';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '') as Record<string, number>; } catch { return {}; } };
  const [c, setC] = useState<Record<string, number>>(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch { /* noop */ } }, [c]);
  const rows = [{ id: 'word', label: 'Palabra prohibida oída' }, { id: 'drama', label: 'Predicción que se cumple' }, { id: 'line', label: 'Cliché de peli que alguien canta antes' }];
  const inc = (k: string, d: number) => { setC((x) => ({ ...x, [k]: Math.max(0, (x[k] || 0) + d) })); try { navigator.vibrate?.(12); } catch { /* noop */ } };
  return (
    <section className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
      <HowTo
        need={['Este móvil a mano durante la peli']}
        steps={[
          <><b>Contador sin pausar:</b> botones grandes para tocar casi sin mirar.</>,
          <><b>Palabra prohibida oída:</b> para la prueba Palabras Prohibidas. Cada vez que en la peli dicen una de tus palabras, toca tu columna.</>,
          <><b>Predicción que se cumple</b> y <b>Cliché de peli</b>: para llevar la cuenta de lo que acertáis en voz alta (“¡ahora se besan!”).</>,
          <>¿Te equivocaste? <b>Restar uno</b>. Al final, registrad quién gana en la prueba correspondiente.</>,
        ]}
      />
      <div className="split"><p className="small muted prose">Los números se guardan aunque cierres la app.</p><ConfirmButton className="btn quiet sm" onConfirm={() => setC({})} confirmText="¿A cero?">Reiniciar</ConfirmButton></div>
      {rows.map((r) => (
        <div key={r.id} className="stack" style={{ ['--gap' as string]: 'var(--s-2)' }}>
          <h3 className="h4">{r.label}</h3>
          <div className="grid-2">
            {PLAYERS.map((p) => (
              <div key={p} className="stack" style={{ ['--gap' as string]: '6px' }}>
                <button className="winner-btn" style={{ ['--who' as string]: `var(--${p})`, minHeight: 84 } as CSSProperties} onClick={() => inc(r.id + p, 1)} aria-label={`Sumar uno a ${PLAYER_NAME[p]}`}>
                  <span className={'pname ' + p}>{PLAYER_NAME[p]}</span><span className="h2 num">{c[r.id + p] || 0}</span>
                </button>
                <button className="btn quiet sm" onClick={() => inc(r.id + p, -1)}>Restar uno</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------------- MODES ---------------- */
const POSTER_BG = ['#1a1020', '#0f1a22', '#1b1416', '#101820', '#1d1712', '#141022'];
function Modes() {
  const list = CHALLENGES.filter((c) => c.category === 'movie');
  return (
    <>
      <section>
        <h2 className="h2" style={{ marginBottom: 'var(--s-3)' }}>Cómo jugar sin pausar</h2>
        <ol className="steps">
          <li><span><b>Antes del play.</b> <span className="muted">Subasta (qué veis y con qué snacks), un cartón de Bingo para cada uno, 3 predicciones selladas y una carta de Palabras de peli por cabeza.</span></span></li>
          <li><span><b>Durante.</b> <span className="muted">Solo se marcan casillas del Bingo y se toca el contador En vivo. Nadie pausa.</span></span></li>
          <li><span><b>En los créditos.</b> <span className="muted">Se revelan predicciones, se cuentan palabras, El Examen de la Peli y Los Críticos. Registrad cada ganador en su prueba.</span></span></li>
        </ol>
      </section>
      <Section title="Para cualquier peli o serie" eyebrow="Las pruebas de la noche de cine"><ChallengeList list={list.filter((c) => c.sub === 'Cualquier peli o serie')} /></Section>
      <Section title="Palabras de peli" eyebrow="Cada uno roba una carta en privado: 3 palabras secretas">
        <DeckStage deckIds={['palabras']} />
      </Section>
      <Section title="En inglés (opcional)" eyebrow="Solo si os apetece practicar"><ChallengeList list={list.filter((c) => c.sub === 'English Night')} /></Section>
      <Section title="Barajas en inglés" eyebrow="Opcionales">
        <DeckStage deckIds={['forbidden', 'translate', 'accents']} />
      </Section>
      <Section title="Qué ver" eyebrow="Ideas por tipo de peli, para elegir en la subasta">
        <div className="poster-grid">
          {MOVIE_PICKS.map((m, i) => (
            <div key={m.title} className="poster" style={{ ['--pbg' as string]: POSTER_BG[i % POSTER_BG.length] } as CSSProperties}>
              <span className="small accent-text" style={{ fontWeight: 600 }}>{m.lang}</span>
              <span className="pt">{m.title}</span>
              <span className="small muted">{m.why}</span>
            </div>
          ))}
        </div>
        <p className="small faint" style={{ marginTop: 'var(--s-4)' }}>No sabemos qué plataformas tenéis contratadas: consultad <a href="https://www.justwatch.com/es" target="_blank" rel="noreferrer">JustWatch España</a>.</p>
      </Section>
    </>
  );
}
