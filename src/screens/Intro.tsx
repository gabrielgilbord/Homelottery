import { useState, type CSSProperties } from 'react';
import { useGame, setIntroStep, finishIntro, openEnvelope, updatePrefs } from '../state/store';
import { Icon } from '../components/Icon';
import { go } from '../lib/router';
import { ENVELOPES } from '../data/rewards';
import { Seg, Toggle } from '../components/ui';
import { celebrate } from '../lib/celebrate';
import type { Intensity } from '../types';

const d = (s: number) => ({ animationDelay: s + 's' }) as CSSProperties;

const RULES = [
  { icon: 'users', t: 'Dos protagonistas', d: 'Gabriel y Tatiana. Rivales, cómplices y concursantes a la vez.' },
  { icon: 'target', t: 'Pruebas para todo', d: 'Casa, cartas, consolas, fiesta, pareja y cine. Individuales y en equipo.' },
  { icon: 'coin', t: 'Monedas y puntos', d: 'Los puntos deciden quién gana el día. Las monedas compran suerte.' },
  { icon: 'gift', t: 'Cajas misteriosas', d: 'Nadie sabe lo que hay dentro hasta que se abre. Lo que sale, se queda.' },
  { icon: 'cards', t: 'Cartas especiales', d: 'Roba, protege, duplica, intercambia o recibe una misión secreta.' },
  { icon: 'wheel', t: 'La suerte decide', d: 'Ruletas, doble o nada y eventos sorpresa, siempre con monedas ficticias.' },
  { icon: 'eyeoff', t: 'Sin spoilers', d: 'Las sorpresas no se revelan antes de tiempo. Ni lo intentes.' },
  { icon: 'heart', t: 'Regla de oro', d: 'Cualquier prueba se puede pasar o cambiar, sin penalización y sin explicaciones.' },
];

export default function Intro() {
  const s = useGame();
  const step = s.introStep;
  const [envOpen, setEnvOpen] = useState(s.envelopesOpened.includes('env-first'));
  const letter = s.host.envelopeOverrides['env-first'] || ENVELOPES[0].message;
  const next = (n: number) => { setIntroStep(n); document.querySelector('.intro')?.scrollTo({ top: 0 }); };

  return (
    <div className="intro" data-world="couples">
      {step === 0 && (
        <div className="intro-inner seq" key="s0">
          <span className="eyebrow" style={d(0.2)}>Una producción de Gabriel</span>
          <p className="intro-line" style={{ ...d(0.7), fontSize: 'clamp(2rem, 1.4rem + 3vw, 2.75rem)' }}>Buenos días, <span className="italic">Tatiana.</span></p>
          <p className="intro-line muted" style={d(1.5)}>Hoy Gabriel ha preparado algo para ti.</p>
          <p className="intro-line muted" style={d(2.3)}>Pero hay una pequeña condición…</p>
          <p className="intro-line italic" style={d(3.1)}>Hoy no vas a poder decidirlo todo.</p>
          <div className="intro-list" style={d(3.9)}>
            <span>Habrá desafíos.</span><span>Habrá apuestas.</span><span>Habrá sorpresas.</span><span>Habrá premios que todavía no conoces.</span>
          </div>
          <p className="intro-line muted" style={d(4.9)}>Y puede que hoy descubras que tienes un pequeño rival en casa.</p>
          <div className="stack" style={{ ...d(5.9), ['--gap' as string]: 'var(--s-3)', marginTop: 'var(--s-4)' } as CSSProperties}>
            <span className="eyebrow">Bienvenida a…</span>
            <div className="intro-logo">Home<i>lottery</i></div>
            <span className="eyebrow" style={{ color: 'var(--ivory-2)' }}>Gabriel × Tatiana · The Couples Edition</span>
          </div>
          <div style={{ ...d(6.8), marginTop: 'var(--s-5)' }}>
            <button className="btn value lg block" onClick={() => next(1)}>Descubrir mi sorpresa</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="intro-inner seq" key="s1">
          <span className="eyebrow accent" style={d(0.1)}>Las reglas del show</span>
          <h1 className="h1" style={d(0.25)}>Así se juega</h1>
          <div style={d(0.5)}>
            {RULES.map((r) => (
              <div key={r.t} className="rule-row">
                <span className="ri"><Icon name={r.icon} size={20} /></span>
                <span className="stack" style={{ ['--gap' as string]: '2px' }}><span className="h5">{r.t}</span><span className="small muted">{r.d}</span></span>
              </div>
            ))}
          </div>
          <div style={d(0.9)}><button className="btn value lg block" onClick={() => next(2)}>Entendido. Quiero mi sobre</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="intro-inner seq" key="s2" style={{ textAlign: 'center' }}>
          <span className="eyebrow accent" style={d(0.1)}>Sobre número uno</span>
          <h1 className="h1" style={d(0.25)}>The First <span className="italic">Envelope</span></h1>
          {!envOpen ? (
            <div style={d(0.5)}>
              <button className="seal-env" onClick={() => { openEnvelope('env-first'); setEnvOpen(true); celebrate(1); }} aria-label="Romper el sello y abrir el sobre">
                <div className="eb" /><div className="ef" /><div className="es">G</div>
              </button>
              <p className="small faint">Toca el sello</p>
            </div>
          ) : (
            <div className="stack" style={{ ['--gap' as string]: 'var(--s-4)', textAlign: 'left' }}>
              <div className="letter">{letter}</div>
              <p className="small value-text" style={{ textAlign: 'center' }}>+20 monedas de bienvenida para Tatiana</p>
              <button className="btn value lg block" onClick={() => next(3)}>Estoy preparada</button>
            </div>
          )}
        </div>
      )}

      {step === 3 && <QuickPrefs onDone={() => next(4)} />}

      {step === 4 && (
        <div className="intro-inner seq" key="s4">
          <span className="eyebrow accent" style={d(0.1)}>Episodio 01 · Misión de bienvenida</span>
          <h1 className="h1" style={d(0.25)}>Operación <span className="italic">Desayuno</span></h1>
          <p className="lead" style={d(0.45)}>Tres rondas. Ocho minutos. Una bandeja.</p>
          <ol className="steps" style={d(0.65)}>
            <li><span><b>Cata a ciegas.</b> <span className="muted">Ojos cerrados: Gabriel te da a probar tres bocados. Adivina qué son.</span></span></li>
            <li><span><b>El brindis.</b> <span className="muted">Con el zumo o el café, predice quién ganará la primera prueba del día.</span></span></li>
            <li><span><b>La pregunta del día.</b> <span className="muted">¿Qué es lo que más te apetece que pase hoy?</span></span></li>
          </ol>
          <div className="stack" style={d(0.9)}>
            <button className="btn value lg block" onClick={() => { finishIntro(); go('challenge', 'h-breakfast'); }}>Empezar la misión</button>
            <button className="btn quiet block" onClick={() => { finishIntro(); go('home'); }}>Ir al plató</button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickPrefs({ onDone }: { onDone: () => void }) {
  const s = useGame();
  const t = s.prefs.tatiana;
  const set = (patch: Partial<typeof t>) => updatePrefs('tatiana', { ...patch, configured: true });
  return (
    <div className="intro-inner seq" key="s3">
      <span className="eyebrow accent" style={d(0.1)}>Antes de empezar</span>
      <h1 className="h1" style={d(0.25)}>Tus reglas, <span className="italic">Tatiana</span></h1>
      <p className="muted" style={d(0.4)}>Se juega siempre al nivel más suave de los dos. Puedes cambiarlo cuando quieras.</p>
      <div className="stack" style={{ ...d(0.6), ['--gap' as string]: 'var(--s-5)' } as CSSProperties}>
        <label className="field">Nivel romántico máximo
          <Seg<Intensity> block value={t.romance} onChange={(v) => set({ romance: v })} label="Nivel romántico" options={[{ v: 'sweet', label: 'Sweet' }, { v: 'spicy', label: 'Spicy' }, { v: 'legendary', label: 'Legendary' }]} />
        </label>
        <label className="field">Competición
          <Seg block value={t.competition} onChange={(v) => set({ competition: v })} label="Competición" options={[{ v: 'chill', label: 'Relax' }, { v: 'normal', label: 'Normal' }, { v: 'fierce', label: 'A muerte' }]} />
        </label>
        <div>
          <div className="setting"><span className="small">Retos y premios picantes</span><Toggle on={t.spicy} onChange={(v) => set({ spicy: v })} label="Picante" /></div>
          <div className="setting"><span className="small">Bebidas con alcohol para mí <span className="faint">(siempre opcional)</span></span><Toggle on={t.alcohol} onChange={(v) => set({ alcohol: v })} label="Alcohol" /></div>
        </div>
      </div>
      <div className="stack" style={d(0.85)}>
        <button className="btn value lg block" onClick={() => { set({}); onDone(); }}>Listo</button>
        <p className="xs faint" style={{ textAlign: 'center' }}>Gabriel configurará los suyos en privado. Nadie ve los límites del otro.</p>
      </div>
    </div>
  );
}
