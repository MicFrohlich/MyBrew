import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('social_posts')
      .select('*, profiles!social_posts_user_id_fkey(display_name, avatar_emoji), cafes(name), beans(name)')
      .order('created_at', { ascending: false })
      .limit(50);
    setPosts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { posts, loading, reload: load };
}

export async function createPost({ userId, content, cafeId, beanId }) {
  return supabase.from('social_posts').insert({ user_id: userId, content, cafe_id: cafeId, bean_id: beanId });
}

export async function upvotePost(id, current) {
  return supabase.from('social_posts').update({ upvotes: (current || 0) + 1 }).eq('id', id);
}
