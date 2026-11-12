import { useState } from 'react';
import { CHALLENGES } from '../data/challenges';
import { ChallengeList } from './Challenges';
import { ConfirmButton, Empty, PageHead, Section, Seg } from '../components/ui';
import { Icon } from '../components/Icon';
import { useGame, newSeries, seriesWin, deleteSeries } from '../state/store';
import { celebrate } from '../lib/celebrate';
import { PLAYERS, PLAYER_NAME } from '../types';

import { DiceTool, CoinTool, CardDrawTool } from '../components/Tools';

function SeriesTool() {
  const s = useGame();
  const [name, setName] = useState('');
  const [bo, setBo] = useState('3');
  return (
    <div className="stack" style={{ ['--gap' as string]: 'var(--s-4)' }}>
      <div className="surface stack">
        <label className="field">Nueva serie<input className="input" placeholder="Por ejemplo, Escoba a Dos" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <div className="split" style={{ flexWrap: 'wrap' }}>
          <Seg value={bo} onChange={setBo} label="Formato" options={[{ v: '3', label: 'Al mejor de 3' }, { v: '5', label: 'de 5' }, { v: '7', label: 'de 7' }]} />
          <button className="btn primary" onClick={() => { newSeries(name || 'Serie', +bo); setName(''); }}><Icon name="plus" size={16} />Crear serie</button>
        </div>
      </div>
      {s.series.length === 0 && <Empty icon="trophy">Sin series todavía. Crea una para llevar un torneo al mejor de tres.</Empty>}
      {s.series.map((se) => (
        <div key={se.uid} className="surface stack">
          <div className="split"><span className="h4">{se.name}</span><span className="small faint">Al mejor de {se.bestOf}</span></div>
          <div className="series">
            {PLAYERS.map((p, i) => {
              const btn = (
                <button key={p} className="btn lg" disabled={!!se.done} onClick={() => { seriesWin(se.uid, p); if (se.wins[p] + 1 >= Math.floor(se.bestOf / 2) + 1) celebrate(2); }}>
                  <span className={'pname ' + p}>{PLAYER_NAME[p]}</span>
                </button>
              );
              return i === 0 ? [btn, <span key="sc" className="h2 num" style={{ textAlign: 'center' }}>{se.wins.gabriel}<span className="faint"> – </span>{se.wins.tatiana}</span>] : btn;
            })}
          </div>
          <div className="split">
            <span className="small">{se.done ? <>Campeón: <b className={'pname ' + se.done}>{PLAYER_NAME[se.done]}</b> <span className="value-text">+15 monedas</span></> : <span className="faint">Toca el nombre de quien gana cada partida.</span>}</span>
            <ConfirmButton className="btn quiet sm" onConfirm={() => deleteSeries(se.uid)} confirmText="¿Borrar?">Borrar</ConfirmButton>
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
      <PageHead show="The Card Table" title="Cartas y dados" sub="Duelos de cartas, dados y papel pensados para dos. Casi todos empiezan en menos de dos minutos." />
      <div className="felt"><div className="grid-auto" style={{ ['--min' as string]: '240px' }}><DiceTool /><CoinTool /><CardDrawTool /></div></div>
      <Section title="Series y torneos" eyebrow="Torneos al mejor de 3, 5 o 7"><SeriesTool /></Section>
      <Section title="Baraja española"><ChallengeList list={list.filter((c) => c.sub === 'Baraja española')} /></Section>
      <Section title="Baraja de póker"><ChallengeList list={list.filter((c) => /póker|Faroleo|Velocidad|Memoria/.test(c.sub || ''))} /></Section>
      <Section title="Dados, monedas y papel"><ChallengeList list={list.filter((c) => /Dados|Monedas|Papel/.test(c.sub || ''))} /></Section>
    </div>
  );
}
