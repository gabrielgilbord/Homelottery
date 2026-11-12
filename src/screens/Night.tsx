import { useEffect, useState } from 'react';
import { challengeById } from '../data/challenges';
import { CATEGORIES } from '../data/episodes';
import { Icon } from '../components/Icon';
import { ConfirmButton, Seg, Toggle, AnimatedNumber } from '../components/ui';
import { OnAir, Seal } from '../components/Logo';
import { celebrate } from '../lib/celebrate';
import { go } from '../lib/router';
import { WORLD_ICON, WORLD_SHOW } from './Home';
import {
  useNight, getNight, nightPool, worldCount, nightLeader, toggleWorld, setLevel, setKeepTomorrow, setLastCall, setNoProps, setDrinks, drinkRule,
  nextAct, swapAct, playAct, scoreAct, closeShow, resetNight, quickCard, QUICK_DECKS, NIGHT_WORLDS,
} from '../state/night';
import { PLAYERS, PLAYER_NAME, INTENSITY_LABEL, type Intensity } from '../types';

const DIFF = ['', 'Fácil', 'Media', 'Difícil'];

/** NIGHT SHOW: an optional late-night game with its own scoreboard. Never touches the main show. */
export default function Night({ standalone, autoplay }: { standalone?: boolean; autoplay?: boolean }) {
  const n = useNight();
  // "Jugar ya": arriving from the Night Show button puts an act on screen straight away.
  // If an act is already in progress it is kept. The URL is cleaned so a reload never draws again.
  useEffect(() => {
    if (!autoplay) return;
    const s0 = getNight();
    if (!s0.current) nextAct();
    try { history.replaceState(null, '', '#/night'); } catch { /* noop */ }
    requestAnimationFrame(() => document.querySelector('.act-card')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }, [autoplay]);
  const [deck, setDeck] = useState(n.drinks ? 'never' : QUICK_DECKS[0]?.id || '');
  const [card, setCard] = useState<{ text: string; k: number } | null>(null);
  const [chooser, setChooser] = useState(false);
  const cur = n.current ? challengeById(n.current) : undefined;
  const pool = nightPool(n);
  const lead = nightLeader(n);
  const played = n.rounds.filter((r) => r.outcome !== 'skip');
  const g = n.points.gabriel, t = n.points.tatiana;
  const share = g + t === 0 ? 0.5 : g / (g + t);
  const mult = n.lastCall ? 2 : 1;

  return (
    <div className="night">
      <header className="night-head">
        <div className="nh-top">
          <OnAir label="Late night" />
          {standalone ? <button className="btn quiet sm" onClick={() => go('home')}>Volver a la invitación</button> : <span className="nh-note">Aparte del gran día</span>}
        </div>
        <h1 className="nh-title">Night Show</h1>
        <p className="nh-sub">Una noche suelta, para jugar ahora. Tiene su propio marcador y no toca la partida principal: ni puntos, ni monedas, ni premios, ni sobres.</p>
      </header>

      {/* Scoreboard of the night */}
      <section className="plate night-plate" aria-label={`Night Show: Gabriel ${g}, Tatiana ${t}`} style={{ ['--dg' as string]: Math.max(3, String(Math.max(g, t)).length) }}>
        <div className="plate-row">
          {PLAYERS.map((p, i) => (
            <div key={p} className={'plate-side ' + p + (i === 1 ? ' right' : '') + (lead === p ? ' leading' : lead ? ' trailing' : '')}>
              <span className="plate-name"><b>{PLAYER_NAME[p][0]}</b>{PLAYER_NAME[p]}</span>
              <span className="plate-score"><AnimatedNumber value={n.points[p]} /></span>
            </div>
          ))}
          <div className="plate-vs" aria-hidden>vs</div>
        </div>
        <div className="plate-tug" aria-hidden><i style={{ transform: `scaleX(${share})` }} /></div>
        <div className="plate-foot"><span>{played.length} {played.length === 1 ? 'número jugado' : 'números jugados'}</span><span>{n.lastCall ? 'Última ronda: puntos ×2' : lead ? `Lidera ${PLAYER_NAME[lead]}` : 'Empate'}</span></div>
      </section>

      {/* The show itself */}
      {n.closed ? (
        <section className="night-final" aria-live="polite">
          <Seal ring="Night Show · winner · Homelottery ·" size={112} className="result-seal"><Icon name="trophy" size={28} /></Seal>
          <h2 className="h1">{lead ? `Gana ${PLAYER_NAME[lead]}` : 'Empate'}</h2>
          <p className="muted">{g} a {t}, en {played.length} {played.length === 1 ? 'número' : 'números'}.</p>
          <div className="home-actions">
            <button className="btn cta lg" onClick={() => nextAct()}>Seguir jugando</button>
            <ConfirmButton className="btn ghost lg" onConfirm={() => resetNight()} confirmText="Toca otra vez: marcador a cero">Nuevo Night Show</ConfirmButton>
          </div>
        </section>
      ) : cur ? (
        <article className="act-card" data-world={CATEGORIES[cur.category].theme} key={cur.id}>
          <div className="ac-top">
            <span className="ac-world"><Icon name={WORLD_ICON[cur.category]} size={14} />{WORLD_SHOW[cur.category].name}</span>
            <span className="ac-n">Nº {String(played.length + 1).padStart(2, '0')}</span>
          </div>
          <h2 className="ac-title">{cur.name}</h2>
          <p className="ac-tag">{cur.tagline}</p>
          <div className="meta ac-meta">
            <span>{cur.mode === 'coop' ? 'En equipo' : 'Duelo'}</span><span>{cur.duration} min</span><span>{DIFF[cur.difficulty]}</span>
            {cur.intensity && <span>{INTENSITY_LABEL[cur.intensity]}</span>}
            <span className="ac-pts">+{cur.reward.points * mult} puntos</span>
          </div>
          {cur.requires && <p className="ac-warn"><Icon name="info" size={14} />{cur.requires}</p>}
          {n.drinks && <p className="ac-drinks"><Icon name="glass" size={16} /><span><b>Modo copas.</b> {drinkRule(cur)} Siempre opcional: el agua vale.</span></p>}
          <p className="ac-mat"><b>Materiales:</b> {cur.materials.join(', ')}.</p>
          <ol className="steps ac-steps">{cur.steps.map((st, i) => <li key={i}><span>{st}</span></li>)}</ol>
          <dl className="ac-rules">
            <div><dt>Puntuación</dt><dd>{cur.scoring}</dd></div>
            <div><dt>Victoria</dt><dd>{cur.win}</dd></div>
          </dl>
          <div className="ac-result">
            {cur.mode === 'coop' ? (
              <>
                <ConfirmButton className="winner-btn" onConfirm={() => { scoreAct('coop'); celebrate(1); }} confirmText="¿Superado? Toca otra vez">Superado en equipo<Icon name="heart" size={18} /></ConfirmButton>
                <ConfirmButton className="btn" onConfirm={() => scoreAct('fail')} confirmText="¿No superado?">No superado</ConfirmButton>
              </>
            ) : (
              <>
                {PLAYERS.map((p) => (
                  <ConfirmButton key={p} className={'winner-btn ' + p} onConfirm={() => { scoreAct(p); celebrate(1); }} confirmText={<><span>¿Gana {PLAYER_NAME[p]}?</span><Icon name="check" size={18} /></>}>
                    <span className="cluster" style={{ ['--gap' as string]: '10px' }}><span className={'avatar ' + p}>{PLAYER_NAME[p][0]}</span>Gana {PLAYER_NAME[p]}</span><Icon name="trophy" size={18} />
                  </ConfirmButton>
                ))}
                <ConfirmButton className="btn" onConfirm={() => scoreAct('tie')} confirmText="¿Empate?">Empate</ConfirmButton>
              </>
            )}
            <button className="btn ghost" onClick={() => swapAct()}><Icon name="dice" size={16} />Cambiar de reto</button>
          </div>
        </article>
      ) : (
        <section className="night-next">
          {pool.length > 0 ? (
            <>
              <button className="invite night-invite" onClick={() => nextAct()}>
                <span className="inv-main">
                  <span className="inv-k">{played.length === 0 ? 'Que empiece la noche' : 'Siguiente número'}</span>
                  <span className="inv-t">Sacar un reto al azar</span>
                  <span className="inv-m"><span>{pool.length} posibles con vuestros ajustes</span></span>
                </span>
                <span className="inv-stub" aria-hidden><Icon name="dice" size={26} /></span>
              </button>
              <div className="cluster" style={{ justifyContent: 'center', marginTop: 'var(--s-3)' }}>
                <button className="btn quiet" onClick={() => setChooser((v) => !v)} aria-expanded={chooser}>{chooser ? 'Ocultar la lista' : 'Elegir uno concreto'}</button>
                {played.length > 0 && <ConfirmButton className="btn quiet" onConfirm={() => { closeShow(); celebrate(2); }} confirmText="Toca otra vez para cerrar">Cerrar el show</ConfirmButton>}
              </div>
              {chooser && (
                <div className="list night-list">
                  {pool.map((c) => (
                    <button key={c.id} className="row-item" data-world={CATEGORIES[c.category].theme} onClick={() => { playAct(c.id); setChooser(false); }}>
                      <span className="lead-icon"><Icon name={WORLD_ICON[c.category]} size={18} /></span>
                      <span className="grow"><span className="h5" style={{ display: 'block' }}>{c.name}</span><span className="meta"><span>{c.duration} min</span><span>{c.mode === 'coop' ? 'En equipo' : 'Duelo'}</span><span>+{c.reward.points * mult} pts</span></span></span>
                      <Icon name="chevron" size={18} className="chev" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty">
              <span className="e-icon"><Icon name="sliders" size={20} /></span>
              <span>No quedan retos con estos ajustes. Enciende más mundos o sube el nivel abajo.</span>
              {played.length > 0 && <ConfirmButton className="btn" onConfirm={() => { closeShow(); celebrate(2); }} confirmText="Toca otra vez para cerrar">Cerrar el show</ConfirmButton>}
            </div>
          )}
        </section>
      )}

      {/* Settings of the night: the simple on/off switches */}
      <section className="section" aria-label="Ajustes de esta noche">
        <div className="section-head"><h2 className="h2">Ajustes de esta noche</h2></div>
        <div className="stack" style={{ ['--gap' as string]: 'var(--s-5)' }}>
          <div className="night-switches">
            <div className="setting"><span><b>Sin compras</b><span className="xs faint" style={{ display: 'block' }}>Solo retos con lo que hay en casa: sin barajas de cartas, dados, beer pong, consola ni peli puesta</span></span><Toggle on={n.noProps} onChange={setNoProps} label="Sin compras" /></div>
            <div className="setting"><span><b>Modo copas</b><span className="xs faint" style={{ display: 'block' }}>Cada reto lleva una regla de sorbo opcional. No cambia los puntos</span></span><Toggle on={n.drinks} onChange={(v) => { setDrinks(v); if (v) { setDeck('never'); setCard(null); } }} label="Modo copas" /></div>
          </div>
          <div className="field">Mundos que entran esta noche
            <div className="cluster">
              {NIGHT_WORLDS.map((c) => {
                const on = n.worlds.includes(c);
                return (
                  <button key={c} className={'chip' + (on ? ' on' : '')} aria-pressed={on} onClick={() => toggleWorld(c)}>
                    <Icon name={WORLD_ICON[c]} size={14} />{WORLD_SHOW[c].name}<span className="night-count">{worldCount(c, n)}</span>
                  </button>
                );
              })}
            </div>
            <span className="hint">{n.noProps ? 'Con “Sin compras”, Cine deja solo los retos que se juegan después de la peli (El Examen de Forks, Team Edward vs Team Jacob…).' : 'Gaming necesita la consola o el PC encendidos y Cine, una peli puesta.'}</span>
          </div>
          <label className="field">Nivel de esta noche
            <Seg<Intensity> block value={n.level} onChange={setLevel} label="Nivel de esta noche" options={[{ v: 'sweet', label: 'Sweet' }, { v: 'spicy', label: 'Spicy' }, { v: 'legendary', label: 'Legendary' }]} />
          </label>
          <div>
            <div className="setting"><span>Reservar las pruebas de mañana<span className="xs faint" style={{ display: 'block' }}>No salen las que están en los episodios del gran día</span></span><Toggle on={n.keepTomorrow} onChange={setKeepTomorrow} label="Reservar las pruebas de mañana" /></div>
            <div className="setting"><span>Última ronda: puntos ×2</span><Toggle on={n.lastCall} onChange={setLastCall} label="Última ronda" /></div>
          </div>
        </div>
      </section>

      {/* Quick card: a fast party/couples prompt between acts */}
      <section className="section" aria-label="Carta rápida">
        <div className="section-head"><h2 className="h2">Carta rápida</h2><span className="bc">Between acts</span></div>
        <div className="deck-stage">
          <div className="deck-tabs">
            {QUICK_DECKS.map((d) => <button key={d.id} className={'chip' + (deck === d.id ? ' on' : '')} aria-pressed={deck === d.id} onClick={() => { setDeck(d.id); setCard(null); }}>{d.name}</button>)}
          </div>
          <div className={'prompt-card' + (card ? ' dealt' : '')} key={card?.k}>
            <div className="pc-deck"><span>{QUICK_DECKS.find((d) => d.id === deck)?.name}</span><span>{INTENSITY_LABEL[n.level]}</span></div>
            <p className={'pc-text' + (card ? '' : ' idle')}>{card ? card.text : 'Roba una carta para animar la pausa.'}</p>
            <p className="pc-foot">{QUICK_DECKS.find((d) => d.id === deck)?.hint}</p>
          </div>
          <button className="btn primary lg block" onClick={() => { const t2 = quickCard(deck); setCard(t2 ? { text: t2, k: Date.now() } : null); }}><Icon name="cards" size={18} />Robar carta</button>
        </div>
      </section>

      {/* What happened tonight */}
      {n.rounds.length > 0 && (
        <section className="section" aria-label="Esta noche">
          <div className="section-head"><h2 className="h2">Esta noche</h2><ConfirmButton className="btn quiet sm" onConfirm={() => resetNight()} confirmText="¿Seguro? Toca otra vez">Empezar de cero</ConfirmButton></div>
          <ol className="acts">
            {[...n.rounds].reverse().map((r, i) => {
              const c = challengeById(r.id);
              return (
                <li key={r.at + r.id} className="act night-round">
                  <span className="act-n fig">{String(n.rounds.length - i).padStart(2, '0')}</span>
                  <span className="grow"><span className="act-t">{c?.name}</span>
                    <span className="meta"><span>{({ skip: 'Cambiado', tie: 'Empate', coop: 'Superado en equipo', fail: 'No superado' } as Record<string, string>)[r.outcome] || `Gana ${PLAYER_NAME[r.outcome as 'gabriel']}`}</span>{r.double && <span>×2</span>}</span>
                  </span>
                  {Math.max(r.points.gabriel, r.points.tatiana) > 0 && <span className="act-r fig">+{Math.max(r.points.gabriel, r.points.tatiana)}</span>}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
