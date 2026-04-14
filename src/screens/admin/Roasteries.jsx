import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';

const EMPTY = { id: '', name: '', city: '', emoji: '☕', website: '', description: '', tags: '' };

export default function Roasteries() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    const { data } = await supabase.from('roasteries').select('*').order('name');
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    const payload = { ...editing, tags: editing.tags.split(',').map(s => s.trim()).filter(Boolean) };
    if (editing._new) {
      delete payload._new;
      await supabase.from('roasteries').insert(payload);
    } else {
      delete payload._new;
      await supabase.from('roasteries').update(payload).eq('id', editing.id);
    }
    setEditing(null); load();
  }

  async function del(id) {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('roasteries').delete().eq('id', id);
    load();
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="a-h1" style={{ margin: 0 }}>{t('nav.roasteries')}</h1>
        <button className="a-btn" onClick={() => setEditing({ ...EMPTY, _new: true })}>
          + {t('admin.create')}
        </button>
      </div>

      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="a-table">
          <thead><tr><th>Name</th><th>City</th><th>Tags</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.emoji} {r.name}</td>
                <td>{r.city}</td>
                <td style={{ color: 'var(--muted)' }}>{(r.tags || []).join(', ')}</td>
                <td>
                  <div className="a-btn-row">
                    <button className="a-btn a-btn-ghost" onClick={() => setEditing({ ...r, tags: (r.tags || []).join(', ') })}>
                      {t('admin.edit')}
                    </button>
                    <button className="a-btn a-btn-danger" onClick={() => del(r.id)}>
                      {t('admin.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
             onClick={() => setEditing(null)}>
          <form className="a-card" onClick={e => e.stopPropagation()} onSubmit={save}
                style={{ width: 480, maxWidth: '90vw' }}>
            <div className="a-form-field">
              <label>ID (slug)</label>
              <input value={editing.id} disabled={!editing._new}
                     onChange={e => setEditing({ ...editing, id: e.target.value })} required />
            </div>
            <div className="a-form-field">
              <label>Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div className="a-form-field">
              <label>City</label>
              <input value={editing.city} onChange={e => setEditing({ ...editing, city: e.target.value })} required />
            </div>
            <div className="a-form-field">
              <label>Emoji</label>
              <input value={editing.emoji} onChange={e => setEditing({ ...editing, emoji: e.target.value })} />
            </div>
            <div className="a-form-field">
              <label>Website</label>
              <input value={editing.website || ''} onChange={e => setEditing({ ...editing, website: e.target.value })} />
            </div>
            <div className="a-form-field">
              <label>Description</label>
              <textarea rows={3} value={editing.description || ''}
                        onChange={e => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="a-form-field">
              <label>Tags (comma-separated)</label>
              <input value={editing.tags} onChange={e => setEditing({ ...editing, tags: e.target.value })} />
            </div>
            <div className="a-btn-row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="a-btn a-btn-ghost" onClick={() => setEditing(null)}>
                {t('admin.cancel')}
              </button>
              <button type="submit" className="a-btn">{t('admin.save')}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
