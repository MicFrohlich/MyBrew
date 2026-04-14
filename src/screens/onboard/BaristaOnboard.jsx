import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';
import '../../styles/onboard.css';

const SPECIALTIES = ['V60','Chemex','Espresso','Latte art','AeroPress','Cold brew','Siphon','Milk drinks','Competition prep','Education'];

export default function BaristaOnboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [cafes, setCafes] = useState([]);
  const [cafeId, setCafeId] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [bio, setBio] = useState('');

  useEffect(() => {
    supabase.from('cafes').select('id, name, addr').then(({ data }) => setCafes(data || []));
  }, []);

  const STEPS = 4;
  const canNext = [displayName.trim().length > 0, !!cafeId, specialties.length > 0, bio.trim().length > 0][step];

  function toggleSpec(s) {
    setSpecialties(specialties.includes(s) ? specialties.filter(x => x !== s) : [...specialties, s]);
  }

  async function finish() {
    await supabase.from('profiles').update({ display_name: displayName, role: 'barista' }).eq('user_id', user.id);
    await supabase.from('barista_profiles').insert({
      user_id: user.id, cafe_id: cafeId, specialties, bio, yrs: 0, kudos: 0, rating: 5.0
    });
    window.location.assign('/');
  }

  return (
    <div className="ob">
      <div className="ob-head">
        <div className="pdots">{Array.from({length: STEPS}).map((_, i) => (
          <div key={i} className={`pdot${i === step ? ' a' : i < step ? ' d' : ''}`} />
        ))}</div>
        <div className="ob-title">
          {step === 0 && t('onboard.profile.title')}
          {step === 1 && 'Which café?'}
          {step === 2 && 'Your specialties'}
          {step === 3 && 'Short bio'}
        </div>
        <div className="ob-sub">{t('onboard.step', { current: step + 1, total: STEPS })}</div>
      </div>

      <div className="ob-body">
        {step === 0 && (
          <input className="ob-input" placeholder={t('onboard.profile.displayName')}
                 value={displayName} onChange={e => setDisplayName(e.target.value)} />
        )}
        {step === 1 && cafes.map(c => (
          <div key={c.id}
               className={`lv-card${cafeId === c.id ? ' sel' : ''}`}
               onClick={() => setCafeId(c.id)}>
            <div className="lv-ico">☕</div>
            <div>
              <div className="lv-name">{c.name}</div>
              <div className="lv-desc">{c.addr}</div>
            </div>
          </div>
        ))}
        {step === 2 && (
          <div className="ob-chips">
            {SPECIALTIES.map(s => (
              <button key={s} className={`ob-chip${specialties.includes(s) ? ' sel' : ''}`}
                      onClick={() => toggleSpec(s)}>{s}</button>
            ))}
          </div>
        )}
        {step === 3 && (
          <textarea className="ob-input" rows={5}
                    placeholder="A few sentences about your coffee journey…"
                    value={bio} onChange={e => setBio(e.target.value)} />
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
