import { useState } from 'react';
import { useGame, updatePrefs, sharedIntensity, setShared } from '../state/store';
import { CATEGORIES } from '../data/episodes';
import { Curtain, PageHead, PlayerSwitch, Section, Seg, Toggle, beep, setSound, soundOn } from '../components/ui';
import { Icon } from '../components/Icon';
import { INTENSITY_LABEL, PLAYER_NAME, type CategoryId, type Intensity, type PlayerId } from '../types';

export default function Prefs() {
  const s = useGame();
  const [who, setWho] = useState<PlayerId>('tatiana');
  const [open, setOpen] = useState<PlayerId | null>(null);
  const [curtain, setCurtain] = useState(false);
  const p = s.prefs[who];
  const set = (patch: Partial<typeof p>) => updatePrefs(who, { ...patch, configured: true });
  const visible = open === who;
  const [sound, setSoundState] = useState(soundOn);

  return (
    <div>
      <PageHead show="Private" title="Vuestras reglas" sub="Cada uno configura lo suyo en privado. El juego usa siempre el nivel más suave de los dos y nunca enseña los límites del otro." />
      <div className="ledger">
        <div><div className="label">Nivel que se juega</div><div className="v accent-text">{INTENSITY_LABEL[sharedIntensity(s)]}</div></div>
        <div className="stack" style={{ ['--gap' as string]: '8px' }}><div className="label">Un solo móvil</div><div className="cluster"><Toggle on={s.sharedScreen} onChange={setShared} label="Modo un solo móvil" /><span className="xs faint">Cortinas de privacidad</span></div></div>
        <div className="stack" style={{ ['--gap' as string]: '8px' }}><div className="label">Sonidos del show</div><div className="cluster"><Toggle on={sound} onChange={(v) => { setSound(v); setSoundState(v); if (v) beep(880, 120, 0.05); }} label="Sonidos del show" /><span className="xs faint">{sound ? 'Activados en este móvil' : 'Desactivados'}</span></div></div>
      </div>

      <Section title="Ajustes personales">
        <div className="split" style={{ flexWrap: 'wrap' }}>
          <PlayerSwitch value={who} onChange={(x) => { setWho(x); setOpen(null); }} />
          {!visible && <button className="btn accent" onClick={() => (s.sharedScreen ? setCurtain(true) : setOpen(who))}><Icon name="eye" size={16} />Abrir mis ajustes</button>}
        </div>
        {visible && (
          <div className="surface stack" style={{ marginTop: 'var(--s-5)', ['--gap' as string]: 'var(--s-5)' }}>
            <label className="field">Nivel de competición
              <Seg block value={p.competition} onChange={(v) => set({ competition: v })} label="Competición" options={[{ v: 'chill', label: 'Relax' }, { v: 'normal', label: 'Normal' }, { v: 'fierce', label: 'A muerte' }]} />
              <span className="hint">Relax sube la consolación de quien pierde, para los dos.</span>
            </label>
            <label className="field">Intensidad romántica máxima
              <Seg<Intensity> block value={p.romance} onChange={(v) => set({ romance: v })} label="Intensidad" options={[{ v: 'sweet', label: 'Sweet' }, { v: 'spicy', label: 'Spicy' }, { v: 'legendary', label: 'Legendary' }]} />
            </label>
            <div>
              <div className="setting"><span>Retos y premios picantes</span><Toggle on={p.spicy} onChange={(v) => set({ spicy: v })} label="Picante" /></div>
              <div className="setting"><span>Bebidas con alcohol para mí <span className="faint">(siempre opcional)</span></span><Toggle on={p.alcohol} onChange={(v) => set({ alcohol: v })} label="Alcohol" /></div>
            </div>
            <label className="field">Recompensas que prefiero
              <Seg block value={p.rewardStyle} onChange={(v) => set({ rewardStyle: v })} label="Recompensas" options={[{ v: 'all', label: 'De todo' }, { v: 'romantic', label: 'Románticas' }, { v: 'fun', label: 'Divertidas' }]} />
            </label>
            <div className="field">Mundos que prefiero evitar
              <div className="cluster">
                {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => {
                  const on = p.avoid.includes(c);
                  return <button key={c} className={'chip' + (on ? ' on' : '')} aria-pressed={on} onClick={() => set({ avoid: on ? p.avoid.filter((x) => x !== c) : [...p.avoid, c] })}>{on && <Icon name="close" size={12} />}{CATEGORIES[c].short}</button>;
                })}
              </div>
            </div>
            <label className="field">Límites personales
              <textarea className="input" value={p.limits} onChange={(e) => set({ limits: e.target.value })} placeholder="Lo que no me apetece hoy" />
              <span className="hint">Nota privada para recordarlo. No la lee nadie más.</span>
            </label>
            <button className="btn ghost" onClick={() => setOpen(null)}><Icon name="eyeoff" size={16} />Cerrar y ocultar</button>
          </div>
        )}
      </Section>
      <p className="small faint" style={{ marginTop: 'var(--s-6)' }}>Cualquier prueba se puede pasar o sustituir sin penalización.</p>
      <Curtain open={curtain} to={who} label={`Ajustes privados de ${PLAYER_NAME[who]}.`} onCancel={() => setCurtain(false)} onReveal={() => { setCurtain(false); setOpen(who); }} />
    </div>
  );
}
