import { useTranslation } from 'react-i18next';

export default function LangSwitcher() {
  const { i18n, t } = useTranslation();
  const toggle = () => i18n.changeLanguage(i18n.language === 'he' ? 'en' : 'he');
  return (
    <button
      onClick={toggle}
      aria-label={t('profile.language')}
      style={{
        padding: '6px 12px', borderRadius: 20, border: '1px solid var(--br)',
        background: 'var(--s1)', color: 'var(--cream)', fontSize: 12, fontWeight: 500
      }}>
      {i18n.language === 'he' ? 'EN' : 'עברית'}
    </button>
  );
}
