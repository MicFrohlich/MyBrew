import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ users: 0, cafes: 0, menu: 0 });

  useEffect(() => {
    (async () => {
      const [u, c, m] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('cafes').select('*', { count: 'exact', head: true }),
        supabase.from('menu_today').select('*', { count: 'exact', head: true }).eq('active', true)
      ]);
      setStats({ users: u.count || 0, cafes: c.count || 0, menu: m.count || 0 });
    })();
  }, []);

  return (
    <>
      <h1 className="a-h1">{t('nav.dashboard')}</h1>
      <div className="a-stat-grid">
        <div className="a-card">
          <div className="a-stat-label">{t('admin.totalUsers')}</div>
          <div className="a-stat-val">{stats.users}</div>
        </div>
        <div className="a-card">
          <div className="a-stat-label">{t('admin.activeCafes')}</div>
          <div className="a-stat-val">{stats.cafes}</div>
        </div>
        <div className="a-card">
          <div className="a-stat-label">{t('admin.menuUpdates')}</div>
          <div className="a-stat-val">{stats.menu}</div>
        </div>
      </div>
    </>
  );
}
