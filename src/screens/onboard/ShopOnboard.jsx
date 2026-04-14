import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';
import '../../styles/onboard.css';

export default function ShopOnboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [addr, setAddr] = useState('');
  const [hours, setHours] = useState('');
  const [roasteries, setRoasteries] = useState([]);
  const [roasteryId, setRoasteryId] = useState('');

  useEffect(() => {
    supabase.from('roasteries').select('id, name').then(({ data }) => setRoasteries(data || []));
  }, []);

  const STEPS = 4;
  const canNext = [name.trim().length > 0, addr.trim().length > 0, true, true][step];

  async function finish() {
    await supabase.from('cafes').insert({
      name, addr, hours, roastery_id: roasteryId || null
    });
    await supabase.from('profiles').update({ role: 'admin', display_name: name }).eq('user_id', user.id);
    window.location.assign('/');
  }

  return (
    <div className="ob">
      <div className="ob-head">
        <div className="pdots">{Array.from({length: STEPS}).map((_, i) => (
          <div key={i} className={`pdot${i === step ? ' a' : i < step ? ' d' : ''}`} />
        ))}</div>
        <div className="ob-title">
          {step === 0 && 'Shop name'}
          {step === 1 && 'Address'}
          {step === 2 && 'Hours'}
          {step === 3 && 'Linked roastery (optional)'}
        </div>
      </div>
      <div className="ob-body">
        {step === 0 && <input className="ob-input" value={name} onChange={e => setName(e.target.value)} />}
        {step === 1 && <input className="ob-input" value={addr} onChange={e => setAddr(e.target.value)} />}
        {step === 2 && <input className="ob-input" value={hours} onChange={e => setHours(e.target.value)} placeholder="Mon–Fri 7–17" />}
        {step === 3 && (
          <select className="ob-input" value={roasteryId} onChange={e => setRoasteryId(e.target.value)}>
            <option value="">None</option>
            {roasteries.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
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
