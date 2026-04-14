import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Dashboard from '../screens/admin/Dashboard.jsx';
import Roasteries from '../screens/admin/Roasteries.jsx';
import AdminBeans from '../screens/admin/AdminBeans.jsx';
import Cafes from '../screens/admin/Cafes.jsx';
import Users from '../screens/admin/Users.jsx';
import '../styles/admin.css';

const NAV = [
  { to: '/admin',            end: true,  key: 'dashboard',  icon: '◈' },
  { to: '/admin/roasteries', end: false, key: 'roasteries', icon: '☕' },
  { to: '/admin/beans',      end: false, key: 'beans',      icon: '◉' },
  { to: '/admin/cafes',      end: false, key: 'cafes',      icon: '⌂' },
  { to: '/admin/users',      end: false, key: 'users',      icon: '☻' }
];

export default function AdminShell() {
  return (
    <div className="a-shell">
      <Sidebar items={NAV} />
      <main className="a-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="roasteries" element={<Roasteries />} />
          <Route path="beans" element={<AdminBeans />} />
          <Route path="cafes" element={<Cafes />} />
          <Route path="users" element={<Users />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>
    </div>
  );
}
