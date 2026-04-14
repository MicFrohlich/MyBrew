import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useFeed, createPost, upvotePost } from '../../hooks/useFeed.js';

export default function Feed() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { posts, loading, reload } = useFeed();
  const [draft, setDraft] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    await createPost({ userId: user.id, content: draft, cafeId: null, beanId: null });
    setDraft('');
    reload();
  }

  async function up(p) {
    await upvotePost(p.id, p.upvotes);
    reload();
  }

  return (
    <div style={{ padding: '52px 0 0' }}>
      <div className="c-section-head" style={{ marginTop: 0 }}>
        <div className="c-section-ttl">{t('nav.feed')}</div>
      </div>

      <form onSubmit={submit} style={{ padding: '0 22px 16px' }}>
        <textarea
          value={draft} onChange={e => setDraft(e.target.value)}
          placeholder="What are you drinking?"
          style={{
            width: '100%', minHeight: 70, padding: 12,
            background: 'var(--s1)', border: '1px solid var(--br)',
            borderRadius: 12, color: 'var(--cream)', fontFamily: 'inherit', resize: 'vertical'
          }}
        />
        <button type="submit" className="btn-cont" style={{ marginTop: 8, width: '100%' }}>Post</button>
      </form>

      {loading && <div style={{ padding: 24, color: 'var(--muted)' }}>{t('common.loading')}</div>}

      {posts.map(p => (
        <div key={p.id} style={{
          padding: '14px 22px', borderBottom: '1px solid var(--br)'
        }}>
          <div style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>
            {p.profiles?.avatar_emoji || '☕'} {p.profiles?.display_name || 'user'}
          </div>
          <div style={{ fontSize: 14, marginTop: 6, color: 'var(--cream)' }}>{p.content}</div>
          <button onClick={() => up(p)}
                  style={{ fontSize: 12, color: 'var(--amber)', marginTop: 8, background: 'none', border: 'none', padding: 0 }}>
            ↑ {p.upvotes || 0}
          </button>
        </div>
      ))}
    </div>
  );
}
