import { Routes, Route, Navigate } from 'react-router-dom';
import Today from '../screens/barista/Today.jsx';
import Scan from '../screens/barista/Scan.jsx';
import Stats from '../screens/barista/Stats.jsx';
import BaristaProfile from '../screens/barista/BaristaProfile.jsx';
import BottomNav from '../components/BottomNav.jsx';
import '../styles/barista.css';

const NAV = [
  { to: '/barista',         end: true,  key: 'today',   icon: '◉' },
  { to: '/barista/scan',    end: false, key: 'scan',    icon: '⌬' },
  { to: '/barista/stats',   end: false, key: 'stats',   icon: '◈' },
  { to: '/barista/profile', end: false, key: 'profile', icon: '☻' }
];

export default function BaristaShell() {
  return (
    <div className="b-shell">
      <div className="b-body">
        <Routes>
          <Route index element={<Today />} />
          <Route path="scan" element={<Scan />} />
          <Route path="stats" element={<Stats />} />
          <Route path="profile" element={<BaristaProfile />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </div>
      <BottomNav items={NAV} theme="barista" />
    </div>
  );
}
