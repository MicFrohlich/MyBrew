import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';

export default function Stats() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bp, setBp] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('barista_profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => setBp(data));
  }, [user]);

  if (!bp) return <div style={{ color: '#fff' }}>{t('common.loading')}</div>;

  const stats = [
    { label: t('barista.kudos'), value: bp.kudos },
    { label: t('barista.scansThisMonth'), value: 0 },
    { label: t('barista.avgMatch'), value: '—' },
    { label: t('barista.repeatRate'), value: '—' }
  ];

  return (
    <div>
      <div className="b-title" style={{ marginBottom: 20 }}>{t('nav.stats')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} className="b-card">
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {s.label}
            </div>
            <div className="b-bean-name" style={{ fontSize: 28, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
