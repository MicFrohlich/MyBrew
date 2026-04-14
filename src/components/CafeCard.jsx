import { useTranslation } from 'react-i18next';
import MatchBadge from './MatchBadge.jsx';
import { matchScore } from '../lib/match.js';

export default function CafeCard({ cafe, tasteProfile }) {
  const { t } = useTranslation();
  const best = cafe.menu.reduce((best, m) => {
    const s = tasteProfile ? matchScore(tasteProfile, m.beans) : 75;
    return s > (best?.score ?? -1) ? { ...m, score: s } : best;
  }, null);

  return (
    <div className="cafe-card">
      <div className="cc-top">
        <div>
          <div className="cc-name">{cafe.name}</div>
          <div className="cc-area">{cafe.addr}</div>
        </div>
        {best && <MatchBadge pct={best.score} />}
      </div>
      {best && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
          {t('home.brewingNow')}: <span style={{ color: 'var(--cream)' }}>{best.beans.name}</span>
        </div>
      )}
    </div>
  );
}
