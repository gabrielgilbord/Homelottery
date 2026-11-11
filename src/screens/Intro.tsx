import { useMemo, useState } from 'react';
import { useGame, setIntroStep, finishIntro, openEnvelope, updatePrefs } from '../state/store';
import { Icon } from '../components/Icon';
import { go } from '../lib/router';
import { ENVELOPES } from '../data/rewards';
import { Seg, Toggle } from '../components/ui';
import type { Intensity } from '../types';

function Particles() {
  const dots = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ left: (i * 37) % 100, delay: (i * 0.7) % 9, dur: 7 + (i % 5) })), []);
  return <div className="particles">{dots.map((d, i) => <i key={i} style={{ left: d.left + '%', bottom: 0, animationDelay: d.delay + 's', animationDuration: d.dur + 's' }} />)}</div>;
}

const RULES = [
  { icon: 'users', t: 'Dos protagonistas', d: 'Gabriel y Tatiana. Rivales, cómplices y concursantes a la vez.' },
  { icon: 'target', t: 'Pruebas para todo', d: 'Individuales y cooperativas: casa, cartas, consolas, fiesta, pareja y cine.' },
  { icon: 'coin', t: 'Monedas y puntos', d: 'Los puntos deciden quién gana el día. Las monedas compran suerte.' },
  { icon: 'gift', t: 'Cajas misteriosas', d: 'Nadie sabe lo que hay dentro hasta que se abre. Y lo que sale, se queda.' },
  { icon: 'cards', t: 'Cartas especiales', d: 'Roba, protege, duplica, intercambia... o recibe una misión secreta.' },
  { icon: 'wheel', t: 'La suerte lo cambia todo', d: 'Ruletas, doble o nada y eventos sorpresa. Siempre con monedas ficticias.' },
  { icon: 'eyeoff', t: 'Sin spoilers', d: 'Las sorpresas no se revelan antes de tiempo. Ni preguntes.' },
  { icon: 'heart', t: 'Regla de oro', d: 'Cualquier prueba se puede pasar o cambiar, sin penalización y sin explicaciones.' },
];

export default function Intro() {
  const s = useGame();
  const step = s.introStep;
  const [envOpen, setEnvOpen] = useState(s.envelopesOpened.includes('env-first'));
  const letter = s.host.envelopeOverrides['env-first'] || ENVELOPES[0].message;

  const next = (n: number) => { setIntroStep(n); window.scrollTo({ top: 0 }); };

  return (
    <div className="intro" data-theme="dawn">
      <Particles />
      {step === 0 && (
        <div className="intro-inner reveal" key="s0">
          <div className="eyebrow" style={{ animationDelay: '.2s', color: '#ffc9a8' }}>Una producción de Gabriel</div>
          <p className="intro-line" style={{ animationDelay: '.6s', fontSize: 'clamp(24px,7vw,32px)', marginTop: 18 }}>
            Buenos días, Tatiana. <Icon name="heart" size={22} style={{ color: '#ff8fb1', verticalAlign: '-3px' }} />
          </p>
          <p className="intro-line" style={{ animationDelay: '1.4s' }}>Hoy Gabriel ha preparado algo para ti.</p>
          <p className="intro-line" style={{ animationDelay: '2.3s' }}>Pero hay una pequeña condición…</p>
          <p className="intro-line" style={{ animationDelay: '3.2s', fontStyle: 'italic' }}>Hoy no vas a poder decidirlo todo.</p>
          <div style={{ animationDelay: '4.1s', margin: '10px 0 14px' }}>
            {['Habrá desafíos.', 'Habrá apuestas.', 'Habrá sorpresas.', 'Habrá premios que todavía no conoces.'].map((l) => (
              <div key={l} className="h-show" style={{ fontSize: 'clamp(22px,6.5vw,30px)', letterSpacing: '.08em', color: '#ffe3c7' }}>{l}</div>
            ))}
          </div>
          <p className="intro-line" style={{ animationDelay: '5.2s' }}>Y puede que hoy descubras que tienes un pequeño rival en casa.</p>
          <p className="intro-line faint" style={{ animationDelay: '6.2s', marginTop: 10 }}>Bienvenida a…</p>
          <div style={{ animationDelay: '6.9s' }}>
            <div className="intro-logo gold-text">HOMELOTTERY</div>
            <div className="intro-ed">GABRIEL × TATIANA</div>
            <div className="eyebrow" style={{ marginTop: 6, color: '#ffc9a8' }}>The Couples Edition</div>
          </div>
          <div style={{ animationDelay: '7.8s', marginTop: 30 }}>
            <button className="btn gold lg" onClick={() => next(1)}>DESCUBRIR MI SORPRESA</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="intro-inner reveal" key="s1" style={{ justifyContent: 'flex-start' }}>
          <div className="eyebrow" style={{ color: '#ffc9a8' }}>Las reglas del show</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(30px,8vw,42px)', margin: '8px 0 20px', animationDelay: '.2s' }}>Así se juega</h1>
          <div className="stack" style={{ width: '100%', textAlign: 'left' }}>
            {RULES.map((r, i) => (
              <div key={r.t} className="card tight item" style={{ animation: `reveal .7s ${0.3 + i * 0.18}s cubic-bezier(.2,.8,.2,1) forwards`, opacity: 0, transform: 'translateY(14px)' }}>
                <div className="item-icon"><Icon name={r.icon} /></div>
                <div><h3>{r.t}</h3><p>{r.d}</p></div>
              </div>
            ))}
          </div>
          <div style={{ animationDelay: '2s', marginTop: 24, width: '100%' }}>
            <button className="btn gold lg block" onClick={() => next(2)}>ENTENDIDO. QUIERO MI SOBRE</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="intro-inner reveal" key="s2">
          <div className="eyebrow" style={{ color: '#ffc9a8' }}>Sobre nº 1</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(28px,8vw,40px)', margin: '8px 0 18px', animationDelay: '.2s' }}>The First Envelope</h1>
          {!envOpen ? (
            <div style={{ animationDelay: '.5s' }}>
              <button className="seal-env" onClick={() => { const r = openEnvelope('env-first'); void r; setEnvOpen(true); }} aria-label="Abrir sobre">
                <div className="env-body" /><div className="env-flap" /><div className="env-seal">G</div>
              </button>
              <p className="faint small">Toca el sello para abrirlo</p>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div className="letter" style={{ animation: 'pop .7s cubic-bezier(.2,1.2,.3,1)' }}>{letter}</div>
              <p className="small" style={{ color: '#ffd9b8', marginTop: 14 }}>+20 monedas de bienvenida para Tatiana.</p>
              <button className="btn gold lg block" style={{ marginTop: 14 }} onClick={() => next(3)}>ESTOY PREPARADA</button>
            </div>
          )}
        </div>
      )}

      {step === 3 && <QuickPrefs onDone={() => next(4)} />}

      {step === 4 && (
        <div className="intro-inner reveal" key="s4">
          <div className="eyebrow" style={{ color: '#ffc9a8' }}>Episodio 01 · Misión de bienvenida</div>
          <h1 className="h-display" style={{ fontSize: 'clamp(30px,8vw,44px)', margin: '10px 0 8px', animationDelay: '.2s' }}>Operación Desayuno</h1>
          <p className="intro-line" style={{ animationDelay: '.6s' }}>Tres rondas. Ocho minutos. Una bandeja.</p>
          <div className="card" style={{ textAlign: 'left', animationDelay: '1s', width: '100%' }}>
            <ol className="steps">
              <li><b>Cata a ciegas.</b> Ojos cerrados: Gabriel te da a probar 3 bocados. Adivina qué son.</li>
              <li><b>El brindis.</b> Con el zumo o el café, predice quién ganará la primera prueba del día.</li>
              <li><b>La pregunta del día.</b> ¿Qué es lo que más te apetece que pase hoy?</li>
            </ol>
          </div>
          <div style={{ animationDelay: '1.4s', marginTop: 20, width: '100%' }} className="stack">
            <button className="btn gold lg block" onClick={() => { finishIntro(); go('challenge', 'h-breakfast'); }}>EMPEZAR LA MISIÓN</button>
            <button className="btn ghost block" onClick={() => { finishIntro(); go('home'); }}>Ir al plató</button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickPrefs({ onDone }: { onDone: () => void }) {
  const s = useGame();
  const t = s.prefs.tatiana;
  return (
    <div className="intro-inner reveal" key="s3" style={{ justifyContent: 'flex-start' }}>
      <div className="eyebrow" style={{ color: '#ffc9a8' }}>Antes de empezar</div>
      <h1 className="h-display" style={{ fontSize: 'clamp(28px,8vw,40px)', margin: '8px 0 6px', animationDelay: '.2s' }}>Tus reglas, Tatiana</h1>
      <p className="muted" style={{ animationDelay: '.4s' }}>Se juega siempre al nivel más suave de los dos. Puedes cambiarlo cuando quieras en Preferencias.</p>
      <div className="card stack" style={{ textAlign: 'left', width: '100%', animationDelay: '.6s' }}>
        <label className="field">Nivel romántico máximo
          <Seg<Intensity> value={t.romance} onChange={(v) => updatePrefs('tatiana', { romance: v, configured: true })}
            options={[{ v: 'sweet', label: 'Sweet' }, { v: 'spicy', label: 'Spicy' }, { v: 'legendary', label: 'Legendary' }]} />
        </label>
        <div className="row between"><span className="small">Retos y premios picantes</span><Toggle on={t.spicy} onChange={(v) => updatePrefs('tatiana', { spicy: v, configured: true })} /></div>
        <div className="row between"><span className="small">Bebidas con alcohol disponibles para mí (siempre opcional)</span><Toggle on={t.alcohol} onChange={(v) => updatePrefs('tatiana', { alcohol: v, configured: true })} /></div>
        <label className="field">Nivel de competición
          <Seg value={t.competition} onChange={(v) => updatePrefs('tatiana', { competition: v, configured: true })}
            options={[{ v: 'chill', label: 'Relax' }, { v: 'normal', label: 'Normal' }, { v: 'fierce', label: 'A muerte' }]} />
        </label>
      </div>
      <div style={{ animationDelay: '.9s', marginTop: 18, width: '100%' }}>
        <button className="btn gold lg block" onClick={() => { updatePrefs('tatiana', { configured: true }); onDone(); }}>LISTO</button>
        <p className="tiny faint" style={{ marginTop: 10 }}>Gabriel configurará los suyos en privado. Nadie ve los límites del otro, solo el nivel común.</p>
      </div>
    </div>
  );
}
