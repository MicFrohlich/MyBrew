import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import RoasterDashboard from '../screens/roaster/RoasterDashboard.jsx';
import RoasterBeans from '../screens/roaster/RoasterBeans.jsx';
import RoasterCafes from '../screens/roaster/RoasterCafes.jsx';
import '../styles/admin.css';

const NAV = [
  { to: '/roaster',        end: true,  key: 'dashboard', icon: '◈' },
  { to: '/roaster/beans',  end: false, key: 'beans',     icon: '◉' },
  { to: '/roaster/cafes',  end: false, key: 'cafes',     icon: '⌂' }
];

export default function RoasterShell() {
  return (
    <div className="a-shell">
      <Sidebar items={NAV} />
      <main className="a-main">
        <Routes>
          <Route index element={<RoasterDashboard />} />
          <Route path="beans" element={<RoasterBeans />} />
          <Route path="cafes" element={<RoasterCafes />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>
    </div>
  );
}
