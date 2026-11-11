import { useState } from 'react';
import { CHALLENGES } from '../data/challenges';
import { ChallengeList } from './Challenges';
import { ConfirmButton, PageHead, Section, Seg } from '../components/ui';
import { Icon } from '../components/Icon';
import { useGame, newSeries, seriesWin, deleteSeries } from '../state/store';
import { randInt, rand, shuffle } from '../lib/random';
import { PLAYERS, PLAYER_NAME } from '../types';

const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function Die({ v, rolling }: { v: number; rolling: boolean }) {
  return (
    <div style={{ width: 54, height: 54, borderRadius: 12, background: 'linear-gradient(160deg,#fbf3e4,#d9c7a6)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', padding: 8, gap: 2, boxShadow: '0 10px 20px -8px rgba(0,0,0,.7)', animation: rolling ? 'shake .3s infinite' : undefined }}>
      {Array.from({ length: 9 }, (_, i) => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', margin: 'auto', background: PIPS[v].includes(i) ? '#5a1430' : 'transparent' }} />)}
    </div>
  );
}

function DiceTool() {
  const [n, setN] = useState(2);
  const [vals, setVals] = useState<number[]>([6, 6]);
  const [rolling, setRolling] = useState(false);
  const roll = () => {
    setRolling(true);
    let k = 0;
    const i = setInterval(() => {
      setVals(Array.from({ length: n }, () => randInt(6) + 1));
      if (++k > 8) { clearInterval(i); setRolling(false); }
    }, 70);
  };
  return (
    <div className="card stack">
      <div className="row between"><h3 style={{ margin: 0, fontSize: 16 }}>Dados</h3><Seg value={String(n)} onChange={(v) => { setN(+v); setVals(Array.from({ length: +v }, () => 6)); }} options={[1, 2, 3, 5].map((x) => ({ v: String(x), label: String(x) }))} /></div>
      <div className="row wrap" style={{ minHeight: 60 }}>{vals.map((v, i) => <Die key={i} v={v} rolling={rolling} />)}</div>
      <div className="row between"><span className="small muted">Total: <b>{vals.reduce((a, b) => a + b, 0)}</b></span><button className="btn primary sm" onClick={roll} disabled={rolling}><Icon name="dice" size={16} />Tirar</button></div>
    </div>
  );
}

function CoinTool() {
  const [res, setRes] = useState<string | null>(null);
  const [flip, setFlip] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const go = () => {
    setFlip(true);
    setTimeout(() => { const r = rand() < 0.5 ? 'CARA' : 'CRUZ'; setRes(r); setLog((l) => [r === 'CARA' ? 'C' : 'X', ...l].slice(0, 12)); setFlip(false); }, 700);
  };
  return (
    <div className="card stack">
      <h3 style={{ margin: 0, fontSize: 16 }}>Moneda</h3>
      <div className="row" style={{ gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at 40% 35%,#f8e7bd,#a37a3c)', color: '#3a2508', fontFamily: 'var(--font-display)', fontWeight: 700, transition: 'transform .7s', transform: flip ? 'rotateY(1080deg)' : 'none', boxShadow: '0 10px 24px -10px rgba(214,176,106,.7)' }}>{flip ? '' : res ? res[0] + res.slice(1).toLowerCase() : 'H'}</div>
        <div className="h-show" style={{ fontSize: 34, color: 'var(--accent)' }}>{flip ? '…' : res || '—'}</div>
      </div>
      <div className="row between"><span className="tiny faint">Historial: {log.join(' ') || '—'}</span><button className="btn primary sm" onClick={go} disabled={flip}>Lanzar</button></div>
    </div>
  );
}

const SPANISH = { suits: ['Oros', 'Copas', 'Espadas', 'Bastos'], ranks: ['As', '2', '3', '4', '5', '6', '7', 'Sota', 'Caballo', 'Rey'] };
const POKER = { suits: ['♠', '♥', '♦', '♣'], ranks: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] };
function CardDrawTool() {
  const [kind, setKind] = useState<'spanish' | 'poker'>('poker');
  const [deck, setDeck] = useState<string[]>([]);
  const [shown, setShown] = useState<string | null>(null);
  const build = (k: 'spanish' | 'poker') => { const d = k === 'spanish' ? SPANISH : POKER; return shuffle(d.suits.flatMap((s) => d.ranks.map((r) => (k === 'spanish' ? `${r} de ${s}` : `${r}${s}`)))); };
  const draw = () => { let d = deck.length ? deck : build(kind); const c = d[0]; d = d.slice(1); setDeck(d); setShown(c); };
  return (
    <div className="card stack">
      <div className="row between"><h3 style={{ margin: 0, fontSize: 16 }}>Carta al azar</h3><Seg value={kind} onChange={(k) => { setKind(k); setDeck(build(k)); setShown(null); }} options={[{ v: 'poker', label: 'Póker' }, { v: 'spanish', label: 'Española' }]} /></div>
      <div className="h-serif" style={{ fontSize: 26, minHeight: 34, color: shown && /[♥♦]|Copas|Oros/.test(shown) ? '#ff7a8f' : 'var(--ink)' }}>{shown || '—'}</div>
      <div className="row between"><span className="tiny faint">{deck.length} en el mazo</span><button className="btn primary sm" onClick={draw}>Robar</button></div>
    </div>
  );
}

function SeriesTool() {
  const s = useGame();
  const [name, setName] = useState('');
  const [bo, setBo] = useState('3');
  return (
    <div className="stack">
      <div className="card stack">
        <h3 style={{ margin: 0, fontSize: 16 }}>Nueva serie (torneo al mejor de…)</h3>
        <input className="input" placeholder="Ej. Escoba a Dos" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="row between wrap"><Seg value={bo} onChange={setBo} options={[{ v: '3', label: 'Mejor de 3' }, { v: '5', label: 'Mejor de 5' }, { v: '7', label: 'Mejor de 7' }]} />
          <button className="btn primary" onClick={() => { newSeries(name || 'Serie', +bo); setName(''); }}><Icon name="plus" size={16} />Crear</button></div>
      </div>
      {s.series.map((se) => (
        <div key={se.uid} className={'card tight' + (se.done ? '' : ' glow')}>
          <div className="row between"><b>{se.name}</b><span className="tiny faint">Al mejor de {se.bestOf}</span></div>
          <div className="row between" style={{ marginTop: 10 }}>
            {PLAYERS.map((p) => (
              <button key={p} className="btn" disabled={!!se.done} onClick={() => seriesWin(se.uid, p)} style={{ flex: 1 }}>
                <span className={'ptag ' + p}>{PLAYER_NAME[p]}</span><span className="h-show" style={{ fontSize: 26, marginLeft: 6 }}>{se.wins[p]}</span>
              </button>
            ))}
          </div>
          <div className="row between" style={{ marginTop: 8 }}>
            <span className="small">{se.done ? <>Campeón: <b className={'ptag ' + se.done}>{PLAYER_NAME[se.done]}</b> · +15 monedas</> : 'Toca el nombre de quien gana cada partida.'}</span>
            <ConfirmButton className="btn ghost sm" onConfirm={() => deleteSeries(se.uid)} confirmText="¿Borrar?">Borrar</ConfirmButton>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CardArena() {
  const list = CHALLENGES.filter((c) => c.category === 'cards');
  return (
    <div>
      <PageHead eyebrow="05 · Card Arena" title={<>Card <span className="gold-text">Arena</span></>} sub="Duelos de cartas, dados y papel diseñados para dos. Casi todos empiezan en menos de dos minutos." num="05" />
      <Section title="Mesa de juego">
        <div className="grid three"><DiceTool /><CoinTool /><CardDrawTool /></div>
      </Section>
      <Section title="Series y torneos"><SeriesTool /></Section>
      <Section title="Baraja española"><ChallengeList list={list.filter((c) => c.sub === 'Baraja española')} /></Section>
      <Section title="Baraja de póker"><ChallengeList list={list.filter((c) => /póker|Faroleo|Velocidad|Memoria/.test(c.sub || ''))} /></Section>
      <Section title="Dados, monedas y papel"><ChallengeList list={list.filter((c) => /Dados|Monedas|Papel/.test(c.sub || ''))} /></Section>
    </div>
  );
}
