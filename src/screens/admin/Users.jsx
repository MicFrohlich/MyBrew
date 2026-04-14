import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase.js';

const ROLES = ['consumer', 'barista', 'roaster', 'admin'];

export default function Users() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);

  async function load() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setRows(data || []);
  }
  useEffect(() => { load(); }, []);

  async function setRole(userId, role) {
    await supabase.from('profiles').update({ role }).eq('user_id', userId);
    load();
  }

  return (
    <>
      <h1 className="a-h1">{t('nav.users')}</h1>
      <div className="a-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="a-table">
          <thead><tr><th>Name</th><th>Role</th><th>Change role</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.avatar_emoji} {r.display_name}</td>
                <td><span className={`a-role-badge a-role-${r.role}`}>{r.role}</span></td>
                <td>
                  <div className="a-btn-row">
                    {ROLES.filter(role => role !== r.role).map(role => (
                      <button key={role} className="a-btn a-btn-ghost" onClick={() => setRole(r.user_id, role)}>
                        → {role}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
