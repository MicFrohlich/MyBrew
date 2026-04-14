import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useCafes, useTasteProfile } from '../../hooks/useCafes.js';
import CafeCard from '../../components/CafeCard.jsx';
import { matchScore } from '../../lib/match.js';

function bestCafeScore(cafe, tasteProfile) {
  if (!cafe.menu.length) return 0;
  return Math.max(...cafe.menu.map(m => matchScore(tasteProfile, m.beans)));
}

export default function Home() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const tasteProfile = useTasteProfile(user?.id);
  const { cafes, loading } = useCafes();

  const sorted = tasteProfile
    ? [...cafes].sort((a, b) => bestCafeScore(b, tasteProfile) - bestCafeScore(a, tasteProfile))
    : cafes;

  return (
    <>
      <div className="c-head">
        <div className="c-greet">
          {t('home.greeting')}
          <span>{profile?.display_name}</span>
        </div>
        <div className="av-circle">{profile?.avatar_emoji || '☕'}</div>
      </div>

      <div className="c-section-head">
        <div className="c-section-ttl">{t('home.forYou')}</div>
      </div>

      <div className="c-section-body">
        {loading && <div style={{ color: 'var(--muted)' }}>{t('common.loading')}</div>}
        {sorted.map(c => <CafeCard key={c.id} cafe={c} tasteProfile={tasteProfile} />)}
      </div>
    </>
  );
}
