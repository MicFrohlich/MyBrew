import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';
import LangSwitcher from '../../components/LangSwitcher.jsx';

export default function BaristaProfile() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [bp, setBp] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('barista_profiles').select('*, cafes(name)').eq('user_id', user.id).single()
      .then(({ data }) => setBp(data));
  }, [user]);

  return (
    <div>
      <div className="b-title">{profile?.display_name}</div>
      <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 4 }}>
        {bp?.cafes?.name}
      </div>

      <div className="b-card" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Bio
        </div>
        <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.5 }}>{bp?.bio}</div>
      </div>

      <div className="b-card">
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Specialties
        </div>
        <div style={{ fontSize: 13, color: '#fff' }}>{(bp?.specialties || []).join(' · ')}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <span style={{ fontSize: 13, color: '#fff' }}>{t('profile.language')}</span>
        <LangSwitcher />
      </div>

      <button className="b-btn" style={{ background: 'var(--terra)' }}
              onClick={async () => { await signOut(); navigate('/auth'); }}>
        {t('profile.signOut')}
      </button>
    </div>
  );
}
