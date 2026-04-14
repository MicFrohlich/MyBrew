import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';
import '../../styles/onboard.css';

const LEVELS = [
  { id: 'casual',    ico: '☕' },
  { id: 'exploring', ico: '🔎' },
  { id: 'expert',    ico: '🏆' }
];

const FLAVORS_BY_LEVEL = {
  casual:    ['Chocolate','Caramel','Fruity','Nutty','Vanilla','Spicy'],
  exploring: ['Blueberry','Citrus','Tropical','Stone Fruit','Dark Chocolate','Caramel','Hazelnut','Floral'],
  expert:    ['Jasmine','Rose','Bergamot','Raspberry','Passionfruit','Mango','Cocoa','Black Pepper','Tobacco','Honey']
};

const BREW = ['Espresso','Pour Over','French Press','AeroPress','Cold Brew','Drip','Moka','Capsule'];
const LOCS = ['Specialty','Cozy','Work-friendly','Social','Roastery'];

export default function ConsumerOnboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [level, setLevel] = useState(null);
  const [sliders, setSliders] = useState({});
  const [flavors, setFlavors] = useState([]);
  const [brewMethods, setBrewMethods] = useState([]);
  const [locationPrefs, setLocationPrefs] = useState([]);
  const [maxDistance, setMaxDistance] = useState(5);

  const STEPS = 5;
  const canNext = [displayName.trim().length > 0, !!level, flavors.length > 0, brewMethods.length > 0, locationPrefs.length > 0][step];

  function toggle(arr, setArr, v) { setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]); }

  async function finish() {
    await supabase.from('profiles').update({ display_name: displayName }).eq('user_id', user.id);
    await supabase.from('taste_profiles').insert({
      user_id: user.id, level, sliders, flavors,
      brew_methods: brewMethods, location_prefs: locationPrefs,
      max_distance_km: maxDistance
    });
    navigate('/home');
  }

  const sliderKeys = level === 'casual' ? ['sweet','strength','milk']
                   : level === 'exploring' ? ['acidity','body','roast']
                   : level === 'expert' ? ['acidity','body'] : [];

  return (
    <div className="ob">
      <div className="ob-head">
        <div className="pdots">{Array.from({length: STEPS}).map((_, i) => (
          <div key={i} className={`pdot${i === step ? ' a' : i < step ? ' d' : ''}`}/>
        ))}</div>
        <div className="ob-title">
          {step === 0 && t('onboard.profile.title')}
          {step === 1 && t('onboard.level.title')}
          {step === 2 && t('onboard.taste.title')}
          {step === 3 && t('onboard.brewing.title')}
          {step === 4 && t('onboard.location.title')}
        </div>
        <div className="ob-sub">{t('onboard.step', { current: step + 1, total: STEPS })}</div>
      </div>

      <div className="ob-body">
        {step === 0 && (
          <input className="ob-input" placeholder={t('onboard.profile.displayName')}
                 value={displayName} onChange={e => setDisplayName(e.target.value)} />
        )}

        {step === 1 && LEVELS.map(L => (
          <div key={L.id} className={`lv-card${level === L.id ? ' sel' : ''}`} onClick={() => setLevel(L.id)}>
            <div className="lv-ico">{L.ico}</div>
            <div>
              <div className="lv-name">{t(`onboard.level.${L.id}`)}</div>
              <div className="lv-desc">{t(`onboard.level.${L.id}Desc`)}</div>
            </div>
          </div>
        ))}

        {step === 2 && level && (
          <>
            {sliderKeys.map(k => (
              <div key={k} className="ob-slider">
                <label>{k}</label>
                <input type="range" min="0" max="100"
                       value={sliders[k] ?? 50}
                       onChange={e => setSliders({ ...sliders, [k]: +e.target.value })} />
              </div>
            ))}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>{t('onboard.taste.flavorNotes')}</div>
            <div className="ob-chips">
              {FLAVORS_BY_LEVEL[level].map(f => (
                <button key={f} className={`ob-chip${flavors.includes(f) ? ' sel' : ''}`}
                        onClick={() => toggle(flavors, setFlavors, f)}>{f}</button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <div className="ob-chips">
            {BREW.map(b => (
              <button key={b} className={`ob-chip${brewMethods.includes(b) ? ' sel' : ''}`}
                      onClick={() => toggle(brewMethods, setBrewMethods, b)}>{b}</button>
            ))}
          </div>
        )}

        {step === 4 && (
          <>
            <div className="ob-chips">
              {LOCS.map(l => (
                <button key={l} className={`ob-chip${locationPrefs.includes(l) ? ' sel' : ''}`}
                        onClick={() => toggle(locationPrefs, setLocationPrefs, l)}>{l}</button>
              ))}
            </div>
            <div className="ob-slider" style={{ marginTop: 24 }}>
              <label>{t('onboard.location.distance')}: {maxDistance} km</label>
              <input type="range" min="1" max="25" value={maxDistance}
                     onChange={e => setMaxDistance(+e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="ob-foot">
        {step > 0 && <button className="btn-back" onClick={() => setStep(step - 1)}>←</button>}
        <button className="btn-cont" disabled={!canNext}
                onClick={() => step === STEPS - 1 ? finish() : setStep(step + 1)}>
          {step === STEPS - 1 ? t('onboard.finish') : t('onboard.next')}
        </button>
      </div>
    </div>
  );
}
