import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useBeans() {
  const [beans, setBeans] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('beans')
      .select('*, roasteries(name, emoji, color)')
      .order('score', { ascending: false })
      .then(({ data }) => { setBeans(data || []); setLoading(false); });
  }, []);
  return { beans, loading };
}
