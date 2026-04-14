import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';

export default function Today() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [baristaProfile, setBaristaProfile] = useState(null);
  const [menu, setMenu] = useState([]);
  const [beans, setBeans] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: bp } = await supabase.from('barista_profiles')
        .select('*, cafes(id, name)')
        .eq('user_id', user.id).single();
      setBaristaProfile(bp);
      if (!bp?.cafe_id) return;
      const { data: menuRows } = await supabase.from('menu_today')
        .select('*, beans(name, origin)')
        .eq('cafe_id', bp.cafe_id)
        .order('updated_at', { ascending: false });
      setMenu(menuRows || []);
      const { data: beanRows } = await supabase.from('beans').select('id, name, origin').order('name');
      setBeans(beanRows || []);
    })();
  }, [user]);

  async function toggle(row) {
    await supabase.from('menu_today').update({ active: !row.active }).eq('id', row.id);
    setMenu(menu.map(m => m.id === row.id ? { ...m, active: !row.active } : m));
  }

  async function addBean(beanId) {
    await supabase.from('menu_today').insert({
      cafe_id: baristaProfile.cafe_id, barista_id: baristaProfile.id,
      bean_id: beanId, brew_method: 'V60', active: true
    });
    setAdding(false);
    const { data } = await supabase.from('menu_today')
      .select('*, beans(name, origin)').eq('cafe_id', baristaProfile.cafe_id);
    setMenu(data || []);
  }

  return (
    <>
      <div className="b-head">
        <div className="b-title">{t('barista.todayMenu')}</div>
      </div>
      {menu.map(m => (
        <div key={m.id} className="b-card">
          <div className="b-card-top">
            <div>
              <div className="b-bean-name">{m.beans?.name}</div>
              <div className="b-bean-sub">{m.beans?.origin} · {m.brew_method}</div>
            </div>
            <button className={`b-toggle${m.active ? ' on' : ''}`} onClick={() => toggle(m)}>
              {m.active ? 'LIVE' : 'OFF'}
            </button>
          </div>
        </div>
      ))}

      {!adding && <button className="b-btn" onClick={() => setAdding(true)}>+ {t('barista.addBean')}</button>}

      {adding && (
        <div className="b-card" style={{ marginTop: 12 }}>
          {beans.map(b => (
            <div key={b.id} onClick={() => addBean(b.id)}
                 style={{ padding: '8px 0', cursor: 'pointer', color: '#fff', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              {b.name} — <span style={{ color: 'rgba(255,255,255,.5)' }}>{b.origin}</span>
            </div>
          ))}
          <button className="b-btn" onClick={() => setAdding(false)} style={{ background: 'transparent', border: '1px solid var(--br)' }}>
            {t('admin.cancel')}
          </button>
        </div>
      )}
    </>
  );
}
