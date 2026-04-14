import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabase } from '../../lib/supabase.js';

const EMPTY = {
  id: '', name: '', origin: '', process: '', roast: '',
  score: 85, price: '', flavors: '',
  acidity: 5, body: 5, sweetness: 5, fruitiness: 5, intensity: 5, aroma: 5, finish: 5,
  trend: 'steady', methods: ''
};

const NUMERIC = ['score','acidity','body','sweetness','fruitiness','intensity','aroma','finish'];

export default function RoasterBeans() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [myRoasteryId, setMyRoasteryId] = useState(null);
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load(rid) {
    const id = rid || myRoasteryId;
    if (!id) return;
    const { data } = await supabase.from('beans').select('*').eq('roastery_id', id).order('name');
    setRows(data || []);
  }

  useEffect(() => {
    if (!user) return;
    supabase.from('roasteries').select('id').eq('owner_id', user.id).maybeSingle()
      .then(({ data }) => { if (data) { setMyRoasteryId(data.id); load(data.id); } });
  }, [user]);

  async function save(e) {
    e.preventDefault();
    const payload = {
      ...editing,
      roastery_id: myRoasteryId,
      flavors: editing.flavors.split(',').map(s => s.trim()).filter(Boolean),
      methods: editing.methods.split(',').map(s => s.trim()).filter(Boolean)
    };
    NUMERIC.forEach(k => { payload[k] = Number(payload[k]); });
    delete payload._new;
    if (editing._new) {
      await supabase.from('beans').insert(payload);
    } else {
      await supabase.from('beans').update(payload).eq('id', editing.id);
    }
    setEditing(null); load();
  }

  async function del(id) {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('beans').delete().eq('id', id);
    load();
  }

  if (!myRoasteryId) return <div>No roastery found. Complete onboarding at /onboard/roaster.</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="a-h1" style={{ margin: 0 }}>{t('nav.beans')}</h1>
        <button className="a-btn" onClick={() => setEditing({ ...EMPTY, _new: true })}>
          + {t('admin.create')}
        </button>
      </div>

      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="a-table">
          <thead><tr><th>Name</th><th>Origin</th><th>Score</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.origin}</td>
                <td>{r.score}</td>
                <td>
                  <div className="a-btn-row">
                    <button className="a-btn a-btn-ghost"
                            onClick={() => setEditing({
                              ...r,
                              flavors: (r.flavors || []).join(', '),
                              methods: (r.methods || []).join(', ')
                            })}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, overflowY: 'auto', padding: 20 }}
             onClick={() => setEditing(null)}>
          <form className="a-card" onClick={e => e.stopPropagation()} onSubmit={save}
                style={{ width: 560, maxWidth: '90vw' }}>
            <div className="a-form-field"><label>ID (slug)</label>
              <input value={editing.id} disabled={!editing._new}
                     onChange={e => setEditing({ ...editing, id: e.target.value })} required />
            </div>
            <div className="a-form-field"><label>Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="a-form-field"><label>Origin</label>
                <input value={editing.origin || ''} onChange={e => setEditing({ ...editing, origin: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Process</label>
                <input value={editing.process || ''} onChange={e => setEditing({ ...editing, process: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Roast</label>
                <input value={editing.roast || ''} onChange={e => setEditing({ ...editing, roast: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Price</label>
                <input value={editing.price || ''} onChange={e => setEditing({ ...editing, price: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Score (0–100)</label>
                <input type="number" step="0.1" value={editing.score}
                       onChange={e => setEditing({ ...editing, score: e.target.value })} />
              </div>
              <div className="a-form-field"><label>Trend</label>
                <select value={editing.trend}
                        onChange={e => setEditing({ ...editing, trend: e.target.value })}>
                  <option>hot</option><option>rising</option><option>steady</option><option>new</option>
                </select>
              </div>
            </div>
            <div className="a-form-field"><label>Flavors (comma-separated)</label>
              <input value={editing.flavors} onChange={e => setEditing({ ...editing, flavors: e.target.value })} />
            </div>
            <div className="a-form-field"><label>Brew methods (comma-separated)</label>
              <input value={editing.methods} onChange={e => setEditing({ ...editing, methods: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              {['acidity','body','sweetness','fruitiness','intensity','aroma','finish'].map(k => (
                <div key={k} className="a-form-field" style={{ margin: 0 }}>
                  <label>{k}</label>
                  <input type="number" step="0.1" min="0" max="10"
                         value={editing[k]}
                         onChange={e => setEditing({ ...editing, [k]: e.target.value })} />
                </div>
              ))}
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
