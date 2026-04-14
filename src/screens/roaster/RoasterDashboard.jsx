import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';

export default function RoasterDashboard() {
  const { user } = useAuth();
  const [roastery, setRoastery] = useState(null);
  const [counts, setCounts] = useState({ beans: 0, cafes: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: r } = await supabase.from('roasteries').select('*').eq('owner_id', user.id).maybeSingle();
      setRoastery(r);
      if (!r) return;
      const [b, c] = await Promise.all([
        supabase.from('beans').select('*', { count: 'exact', head: true }).eq('roastery_id', r.id),
        supabase.from('cafes').select('*', { count: 'exact', head: true }).eq('roastery_id', r.id)
      ]);
      setCounts({ beans: b.count || 0, cafes: c.count || 0 });
    })();
  }, [user]);

  if (!roastery) return <div>No roastery found. Complete onboarding at /onboard/roaster.</div>;

  return (
    <>
      <h1 className="a-h1">{roastery.emoji} {roastery.name}</h1>
      <div style={{ color: 'var(--muted)', marginBottom: 24 }}>{roastery.city}</div>
      <div className="a-stat-grid">
        <div className="a-card">
          <div className="a-stat-label">Beans</div>
          <div className="a-stat-val">{counts.beans}</div>
        </div>
        <div className="a-card">
          <div className="a-stat-label">Cafés</div>
          <div className="a-stat-val">{counts.cafes}</div>
        </div>
      </div>
    </>
  );
}
