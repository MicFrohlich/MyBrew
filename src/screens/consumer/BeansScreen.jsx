import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useBeans } from '../../hooks/useBeans.js';
import { useTasteProfile } from '../../hooks/useCafes.js';
import BeanCard from '../../components/BeanCard.jsx';

export default function BeansScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { beans, loading } = useBeans();
  const tasteProfile = useTasteProfile(user?.id);
  const [filter, setFilter] = useState('all');

  const origins = useMemo(() => ['all', ...new Set(beans.map(b => b.origin).filter(Boolean))], [beans]);
  const filtered = filter === 'all' ? beans : beans.filter(b => b.origin === filter);

  return (
    <div style={{ padding: '52px 0 0' }}>
      <div className="c-section-head" style={{ marginTop: 0 }}>
        <div className="c-section-ttl">{t('nav.beans')}</div>
      </div>

      <div style={{ padding: '0 22px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {origins.map(o => (
          <button key={o} className={`ob-chip${filter === o ? ' sel' : ''}`}
                  onClick={() => setFilter(o)}
                  style={{ flexShrink: 0 }}>{o}</button>
        ))}
      </div>

      <div className="c-section-body">
        {loading && <div style={{ color: 'var(--muted)' }}>{t('common.loading')}</div>}
        {filtered.map(b => <BeanCard key={b.id} bean={b} tasteProfile={tasteProfile} />)}
      </div>
    </div>
  );
}
