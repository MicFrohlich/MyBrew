import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import LangSwitcher from '../components/LangSwitcher.jsx';
import '../styles/auth.css';

const ROLES = ['consumer', 'barista', 'roaster', 'shop'];

export default function AuthScreen() {
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const fn = mode === 'signup' ? signUpWithEmail : signInWithEmail;
    const { data, error } = await fn(email, password);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    if (mode === 'signup' && data.user && role !== 'consumer') {
      sessionStorage.setItem('brewly-pending-role', role);
      navigate(`/onboard/${role === 'shop' ? 'shop' : role}`);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-top"><LangSwitcher /></div>
      <div className="auth-logo">Brew<em>ly</em></div>
      <div className="auth-tag">{t('app.tagline')}</div>

      <form className="auth-form" onSubmit={submit}>
        <button type="button" className="auth-btn auth-btn-g" onClick={signInWithGoogle}>
          <span style={{ fontWeight: 700 }}>G</span> {t('auth.continueWithGoogle')}
        </button>
        <div className="auth-divider">{t('auth.or')}</div>
        <input className="auth-input" type="email" placeholder={t('auth.email')}
               value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="auth-input" type="password" placeholder={t('auth.password')}
               value={password} onChange={e => setPassword(e.target.value)} required />

        {mode === 'signup' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>{t('auth.iAmA')}</div>
            <div className="auth-role-row">
              {ROLES.map(r => (
                <button key={r} type="button"
                        className={`auth-role${role === r ? ' sel' : ''}`}
                        onClick={() => setRole(r)}>{t(`auth.${r}`)}</button>
              ))}
            </div>
          </div>
        )}

        {err && <div className="auth-err">{err}</div>}

        <button className="auth-btn" type="submit" disabled={busy}>
          {busy ? t('common.loading') : (mode === 'signup' ? t('auth.signUp') : t('auth.signIn'))}
        </button>

        <div className="auth-toggle">
          <button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
            {mode === 'signup' ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </div>
      </form>
    </div>
  );
}
