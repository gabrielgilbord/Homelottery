import { useState } from 'react';
import { useGame, updatePrefs, sharedIntensity, setShared } from '../state/store';
import { CATEGORIES } from '../data/episodes';
import { Curtain, PageHead, PlayerSwitch, Section, Seg, Toggle } from '../components/ui';
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

  return (
    <div data-theme="couples">
      <PageHead eyebrow="Preferencias y límites" title="Vuestras reglas" sub="Cada uno configura lo suyo en privado. El juego siempre usa el nivel más suave de los dos y nunca enseña los límites del otro." />
      <div className="card glow row between wrap">
        <div><div className="tiny faint">Nivel común activo</div><div className="h-show" style={{ fontSize: 32, color: 'var(--accent)' }}>{INTENSITY_LABEL[sharedIntensity(s)]}</div></div>
        <div className="row"><span className="small">Modo un solo móvil (cortinas de privacidad)</span><Toggle on={s.sharedScreen} onChange={setShared} /></div>
      </div>

      <Section title="Configuración personal">
        <div className="row wrap between">
          <PlayerSwitch value={who} onChange={(x) => { setWho(x); setOpen(null); }} />
          {!visible && <button className="btn primary" onClick={() => (s.sharedScreen ? setCurtain(true) : setOpen(who))}><Icon name="eye" />Abrir mis ajustes</button>}
        </div>
        {visible && (
          <div className="card stack" style={{ marginTop: 14 }}>
            <label className="field">Nivel de competición
              <Seg value={p.competition} onChange={(v) => set({ competition: v })} options={[{ v: 'chill', label: 'Relax' }, { v: 'normal', label: 'Normal' }, { v: 'fierce', label: 'A muerte' }]} />
              <span className="tiny faint">"Relax" sube la consolación del que pierde (para los dos).</span>
            </label>
            <label className="field">Intensidad romántica máxima
              <Seg<Intensity> value={p.romance} onChange={(v) => set({ romance: v })} options={[{ v: 'sweet', label: 'Sweet' }, { v: 'spicy', label: 'Spicy' }, { v: 'legendary', label: 'Legendary' }]} />
            </label>
            <div className="row between"><span>Retos y premios picantes</span><Toggle on={p.spicy} onChange={(v) => set({ spicy: v })} /></div>
            <div className="row between"><span>Bebidas con alcohol para mí (siempre opcional)</span><Toggle on={p.alcohol} onChange={(v) => set({ alcohol: v })} /></div>
            <label className="field">Tipo de recompensas que prefiero
              <Seg value={p.rewardStyle} onChange={(v) => set({ rewardStyle: v })} options={[{ v: 'all', label: 'De todo' }, { v: 'romantic', label: 'Más románticas' }, { v: 'fun', label: 'Más divertidas' }]} />
            </label>
            <div className="field">Categorías que prefiero evitar
              <div className="chips">
                {(Object.keys(CATEGORIES) as CategoryId[]).map((c) => {
                  const on = p.avoid.includes(c);
                  return <button key={c} className={'chip' + (on ? ' spicy' : '')} onClick={() => set({ avoid: on ? p.avoid.filter((x) => x !== c) : [...p.avoid, c] })}>{on ? 'Evitar · ' : ''}{CATEGORIES[c].short}</button>;
                })}
              </div>
            </div>
            <label className="field">Límites personales (nota privada, solo para recordarlos)
              <textarea className="input" value={p.limits} onChange={(e) => set({ limits: e.target.value })} placeholder="Lo que no me apetece hoy…" />
            </label>
            <button className="btn" onClick={() => setOpen(null)}><Icon name="eyeoff" />Cerrar y ocultar</button>
          </div>
        )}
      </Section>
      <p className="tiny faint" style={{ marginTop: 18 }}>Siempre se puede pasar o sustituir cualquier prueba sin penalización. Siempre.</p>
      <Curtain open={curtain} to={who} label={`Ajustes privados de ${PLAYER_NAME[who]}.`} onCancel={() => setCurtain(false)} onReveal={() => { setCurtain(false); setOpen(who); }} />
    </div>
  );
}
