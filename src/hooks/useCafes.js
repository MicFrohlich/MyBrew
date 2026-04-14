import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useCafes() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cafeRows } = await supabase
        .from('cafes')
        .select('*, roasteries(name,emoji,color)');
      const { data: menuRows } = await supabase
        .from('menu_today')
        .select('cafe_id, bean_id, brew_method, active, beans(name,flavors,acidity,body,sweetness,fruitiness,intensity,aroma,finish)')
        .eq('active', true);
      const menuByCafe = {};
      (menuRows || []).forEach(r => {
        if (!menuByCafe[r.cafe_id]) menuByCafe[r.cafe_id] = [];
        menuByCafe[r.cafe_id].push(r);
      });
      setCafes((cafeRows || []).map(c => ({ ...c, menu: menuByCafe[c.id] || [] })));
      setLoading(false);
    })();
  }, []);

  return { cafes, loading };
}

export function useTasteProfile(userId) {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!userId) return;
    supabase.from('taste_profiles').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1).single()
      .then(({ data }) => setProfile(data));
  }, [userId]);
  return profile;
}
