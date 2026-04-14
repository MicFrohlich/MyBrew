import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';
import '../../styles/onboard.css';

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function RoasterOnboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [tags, setTags] = useState('');
  const [desc, setDesc] = useState('');

  const STEPS = 4;
  const canNext = [name.trim().length > 0, city.trim().length > 0, true, true][step];

  async function finish() {
    const id = slug(name);
    await supabase.from('roasteries').insert({
      id, name, city, description: desc,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      owner_id: user.id, emoji: '☕'
    });
    await supabase.from('profiles').update({ role: 'roaster', display_name: name }).eq('user_id', user.id);
    window.location.assign('/');
  }

  return (
    <div className="ob">
      <div className="ob-head">
        <div className="pdots">{Array.from({length: STEPS}).map((_, i) => (
          <div key={i} className={`pdot${i === step ? ' a' : i < step ? ' d' : ''}`} />
        ))}</div>
        <div className="ob-title">
          {step === 0 && 'Roastery name'}
          {step === 1 && 'City'}
          {step === 2 && 'Tags'}
          {step === 3 && 'Short description'}
        </div>
      </div>
      <div className="ob-body">
        {step === 0 && <input className="ob-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Origin Coffee Roasting" />}
        {step === 1 && <input className="ob-input" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Cape Town" />}
        {step === 2 && <input className="ob-input" value={tags} onChange={e => setTags(e.target.value)} placeholder="direct trade, microlots, washed-only" />}
        {step === 3 && <textarea className="ob-input" rows={5} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What makes your roastery unique?" />}
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
