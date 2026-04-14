import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';
import { matchScore } from '../../lib/match.js';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function Scan() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const scannerRef = useRef(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (result) return;
    const id = 'barista-qr-reader';
    const el = document.getElementById(id);
    if (!el) return;
    const scanner = new Html5Qrcode(id);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 240 },
      async (decoded) => {
        try { await scanner.stop(); } catch {}
        await lookup(decoded);
      },
      () => {}
    ).catch(e => setErr(e?.message || String(e)));

    return () => { try { scanner.stop(); scanner.clear(); } catch {} };
  }, [result]);

  async function lookup(userId) {
    const { data: tp } = await supabase.from('taste_profiles')
      .select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    const { data: profile } = await supabase.from('profiles')
      .select('display_name, avatar_emoji').eq('user_id', userId).maybeSingle();
    const { data: bp } = await supabase.from('barista_profiles')
      .select('cafe_id').eq('user_id', user.id).single();
    const { data: menu } = await supabase.from('menu_today')
      .select('*, beans(*)').eq('cafe_id', bp.cafe_id).eq('active', true);
    const scored = (menu || []).map(m => ({ ...m, score: tp ? matchScore(tp, m.beans) : 75 }))
      .sort((a, b) => b.score - a.score);
    setResult({ profile, tp, menu: scored });
  }

  return (
    <div>
      <div className="b-title" style={{ marginBottom: 16 }}>{t('barista.scanCustomer')}</div>
      {!result && (
        <>
          <div id="barista-qr-reader" style={{ width: '100%', borderRadius: 14, overflow: 'hidden' }} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', textAlign: 'center', marginTop: 12 }}>
            {t('barista.scanHint')}
          </div>
          {err && <div style={{ color: 'var(--terra)', marginTop: 8 }}>{err}</div>}
        </>
      )}
      {result && (
        <div>
          <div className="b-card">
            <div className="b-bean-name">{result.profile?.avatar_emoji} {result.profile?.display_name}</div>
            <div className="b-bean-sub">Level: {result.tp?.level || '—'}</div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>
            {t('barista.matchForThem')}
          </div>
          {result.menu.map(m => (
            <div key={m.id} className="b-card">
              <div className="b-card-top">
                <div>
                  <div className="b-bean-name">{m.beans?.name}</div>
                  <div className="b-bean-sub">{m.beans?.origin} · {m.brew_method}</div>
                </div>
                <div style={{ color: 'var(--ba5)', fontWeight: 700 }}>{m.score}%</div>
              </div>
            </div>
          ))}
          <button className="b-btn" onClick={() => setResult(null)}>Scan another</button>
        </div>
      )}
    </div>
  );
}
