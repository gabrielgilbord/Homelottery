import { useState } from 'react';
import { Seg, beep } from './ui';
import { Icon } from './Icon';
import { randInt, rand, shuffle } from '../lib/random';

/* Table tools shared by Cartas y dados, every challenge sheet and the Night Show:
   dice, a coin and a random playing card (for when there is no physical deck). */
const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function Die({ v, rolling }: { v: number; rolling: boolean }) {
  return <div className={'die' + (rolling ? ' rolling' : '')} role="img" aria-label={`Dado: ${v}`}>{Array.from({ length: 9 }, (_, i) => <span key={i} className={PIPS[v].includes(i) ? 'on' : ''} />)}</div>;
}

export function DiceTool() {
  const [n, setN] = useState('2');
  const [vals, setVals] = useState<number[]>([6, 6]);
  const [rolling, setRolling] = useState(false);
  const roll = () => {
    setRolling(true);
    let k = 0;
    const i = setInterval(() => {
      setVals(Array.from({ length: +n }, () => randInt(6) + 1)); beep(500 + randInt(300), 20, 0.03);
      if (++k > 8) { clearInterval(i); setRolling(false); }
    }, 70);
  };
  return (
    <div className="tool">
      <div className="split"><span className="label">Dados</span><Seg value={n} onChange={(v) => { setN(v); setVals(Array.from({ length: +v }, () => 6)); }} label="Número de dados" options={['1', '2', '3', '5'].map((x) => ({ v: x, label: x }))} /></div>
      <div className="cluster" style={{ minHeight: 60 }}>{vals.map((v, i) => <Die key={i} v={v} rolling={rolling} />)}</div>
      <div className="split"><span className="small muted">Total <b className="num" style={{ color: 'var(--ivory)' }}>{vals.reduce((a, b) => a + b, 0)}</b></span><button className="btn accent sm" onClick={roll} disabled={rolling}><Icon name="dice" size={14} />Tirar</button></div>
    </div>
  );
}

export function CoinTool() {
  const [res, setRes] = useState<'CARA' | 'CRUZ' | null>(null);
  const [flip, setFlip] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const go = () => {
    setFlip(true); setRes(null);
    setTimeout(() => { const r = rand() < 0.5 ? 'CARA' : 'CRUZ'; setRes(r); setLog((l) => [r === 'CARA' ? 'C' : 'X', ...l].slice(0, 10)); setFlip(false); beep(990, 120, 0.04); }, 720);
  };
  return (
    <div className="tool">
      <span className="label">Moneda</span>
      <div className="cluster" style={{ ['--gap' as string]: 'var(--s-4)', minHeight: 64 }}>
        <div className={'coin' + (flip ? ' flip' : '')} aria-hidden>H</div>
        <div className="h2" aria-live="polite">{flip ? '…' : res ? (res === 'CARA' ? 'Cara' : 'Cruz') : 'Sin lanzar'}</div>
      </div>
      <div className="split"><span className="small faint num">{log.length ? `Últimos: ${log.join(' ')}` : 'Sin lanzamientos'}</span><button className="btn accent sm" onClick={go} disabled={flip}>Lanzar</button></div>
    </div>
  );
}

const SUIT = { spanish: ['Oros', 'Copas', 'Espadas', 'Bastos'], poker: ['♠', '♥', '♦', '♣'] };
const RANK = { spanish: ['As', '2', '3', '4', '5', '6', '7', 'Sota', 'Caballo', 'Rey'], poker: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] };
type Kind = 'spanish' | 'poker';
export function CardDrawTool() {
  const [kind, setKind] = useState<Kind>('poker');
  const [deck, setDeck] = useState<{ r: string; s: string }[]>([]);
  const [shown, setShown] = useState<{ r: string; s: string; k: number } | null>(null);
  const build = (k: Kind) => shuffle(SUIT[k].flatMap((s) => RANK[k].map((r) => ({ r, s }))));
  const draw = () => { const d = deck.length ? deck : build(kind); setShown({ ...d[0], k: Date.now() }); setDeck(d.slice(1)); beep(700, 40, 0.03); };
  const red = shown && /[♥♦]|Copas|Oros/.test(shown.s);
  return (
    <div className="tool">
      <div className="split"><span className="label">Carta al azar</span><Seg value={kind} onChange={(k) => { setKind(k); setDeck(build(k)); setShown(null); }} label="Baraja" options={[{ v: 'poker', label: 'Póker' }, { v: 'spanish', label: 'Española' }]} /></div>
      <div className="cluster" style={{ minHeight: 106 }}>
        {shown ? (
          <div key={shown.k} className={'pcard' + (red ? ' red' : '')} aria-live="polite" aria-label={`${shown.r} de ${shown.s}`}>
            <span className="pc-s">{shown.r}</span>
            <span className="pc-c">{kind === 'poker' ? shown.s : shown.s[0]}</span>
            <span className="pc-s" style={{ alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>{shown.r}</span>
          </div>
        ) : <span className="small faint">Roba una carta.</span>}
        {shown && kind === 'spanish' && <span className="h4">{shown.r} de {shown.s}</span>}
      </div>
      <div className="split"><span className="small faint num">{deck.length} en el mazo</span><button className="btn accent sm" onClick={draw}>Robar</button></div>
    </div>
  );
}

