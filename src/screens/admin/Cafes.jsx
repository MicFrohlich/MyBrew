import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';

const EMPTY = { name: '', addr: '', lat: '', lng: '', hours: '', roastery_id: '' };

export default function Cafes() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [roasteries, setRoasteries] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    const { data } = await supabase.from('cafes').select('*, roasteries(name)').order('name');
    setRows(data || []);
  }
  useEffect(() => {
    load();
    supabase.from('roasteries').select('id, name').then(({ data }) => setRoasteries(data || []));
  }, []);

  async function save(e) {
    e.preventDefault();
    const payload = {
      name: editing.name, addr: editing.addr, hours: editing.hours,
      lat: editing.lat ? Number(editing.lat) : null,
      lng: editing.lng ? Number(editing.lng) : null,
      roastery_id: editing.roastery_id || null
    };
    if (editing.id) {
      await supabase.from('cafes').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('cafes').insert(payload);
    }
    setEditing(null); load();
  }

  async function del(id) {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('cafes').delete().eq('id', id);
    load();
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="a-h1" style={{ margin: 0 }}>{t('nav.cafes')}</h1>
        <button className="a-btn" onClick={() => setEditing({ ...EMPTY })}>+ {t('admin.create')}</button>
      </div>

      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="a-table">
          <thead><tr><th>Name</th><th>Address</th><th>Roastery</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td style={{ color: 'var(--muted)' }}>{r.addr}</td>
                <td>{r.roasteries?.name || '—'}</td>
                <td>
                  <div className="a-btn-row">
                    <button className="a-btn a-btn-ghost" onClick={() => setEditing({ ...r })}>{t('admin.edit')}</button>
                    <button className="a-btn a-btn-danger" onClick={() => del(r.id)}>{t('admin.delete')}</button>
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
            <div className="a-form-field"><label>Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div className="a-form-field"><label>Address</label>
              <input value={editing.addr || ''} onChange={e => setEditing({ ...editing, addr: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="a-form-field"><label>Latitude</label>
                <input type="number" step="0.000001" value={editing.lat || ''}
                       onChange={e => setEditing({ ...editing, lat: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Longitude</label>
                <input type="number" step="0.000001" value={editing.lng || ''}
                       onChange={e => setEditing({ ...editing, lng: e.target.value })} />
              </div>
            </div>
            <div className="a-form-field"><label>Hours</label>
              <input value={editing.hours || ''} onChange={e => setEditing({ ...editing, hours: e.target.value })} />
            </div>
            <div className="a-form-field"><label>Roastery</label>
              <select value={editing.roastery_id || ''}
                      onChange={e => setEditing({ ...editing, roastery_id: e.target.value })}>
                <option value="">None</option>
                {roasteries.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="a-btn-row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="a-btn a-btn-ghost" onClick={() => setEditing(null)}>{t('admin.cancel')}</button>
              <button type="submit" className="a-btn">{t('admin.save')}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
