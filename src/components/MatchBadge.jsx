import { useTranslation } from 'react-i18next';

export default function MatchBadge({ pct }) {
  const { t } = useTranslation();
  return <span className="match-badge">{t('home.match', { pct })}</span>;
}
