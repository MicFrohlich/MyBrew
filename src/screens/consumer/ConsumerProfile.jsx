import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import QRDisplay from '../../components/QRDisplay.jsx';
import LangSwitcher from '../../components/LangSwitcher.jsx';

export default function ConsumerProfile() {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/auth');
  }

  return (
    <div style={{ padding: '52px 22px 24px' }}>
      <div className="c-section-ttl">{profile?.display_name}</div>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{user?.email}</div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          {t('profile.myQR')}
        </div>
        {user && <QRDisplay value={user.id} />}
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>{t('profile.qrHint')}</div>
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--cream)' }}>{t('profile.language')}</span>
        <LangSwitcher />
      </div>

      <button onClick={() => navigate('/onboard')}
              style={{ marginTop: 20, width: '100%', padding: 14, borderRadius: 12,
                       border: '1px solid var(--br)', background: 'var(--s1)', color: 'var(--cream)', fontSize: 14 }}>
        {t('profile.editTaste')}
      </button>

      <button onClick={handleSignOut}
              style={{ marginTop: 12, width: '100%', padding: 14, borderRadius: 12,
                       border: 'none', background: 'var(--terra)', color: '#fff', fontSize: 14, fontWeight: 600 }}>
        {t('profile.signOut')}
      </button>
    </div>
  );
}
