import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function BottomNav({ items, theme = 'consumer' }) {
  const { t } = useTranslation();
  const bg = theme === 'barista' ? '#0F2214' : 'var(--s1)';
  const activeColor = theme === 'barista' ? 'var(--ba5)' : 'var(--amber)';
  return (
    <nav style={{
      position: 'fixed', insetInlineStart: 0, insetInlineEnd: 0, bottom: 0,
      display: 'flex', background: bg, borderTop: '1px solid var(--br)',
      padding: '8px 0 10px', zIndex: 100
    }}>
      {items.map(it => (
        <NavLink key={it.to} to={it.to} end={it.end}
                 style={({ isActive }) => ({
                   flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                   gap: 2, fontSize: 10, fontWeight: 500, letterSpacing: '.5px',
                   textTransform: 'uppercase',
                   color: isActive ? activeColor : 'var(--muted)'
                 })}>
          <span style={{ fontSize: 20 }}>{it.icon}</span>
          <span>{t(`nav.${it.key}`)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
