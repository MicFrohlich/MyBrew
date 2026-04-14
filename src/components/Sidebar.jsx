import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LangSwitcher from './LangSwitcher.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Sidebar({ items, title = 'Brew' }) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  return (
    <aside className="a-side">
      <div className="a-logo">{title}<em>ly</em></div>
      <nav style={{ flex: 1 }}>
        {items.map(it => (
          <NavLink key={it.to} to={it.to} end={it.end}
                   className={({ isActive }) => `a-nav-item${isActive ? ' active' : ''}`}>
            <span>{it.icon}</span>
            <span>{t(`nav.${it.key}`)}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LangSwitcher />
        <button onClick={signOut}
                style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          {t('profile.signOut')}
        </button>
      </div>
    </aside>
  );
}
