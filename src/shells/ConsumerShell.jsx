import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../screens/consumer/Home.jsx';
import MapView from '../screens/consumer/MapView.jsx';
import Feed from '../screens/consumer/Feed.jsx';
import BeansScreen from '../screens/consumer/BeansScreen.jsx';
import ConsumerProfile from '../screens/consumer/ConsumerProfile.jsx';
import BottomNav from '../components/BottomNav.jsx';
import '../styles/consumer.css';

const NAV = [
  { to: '/home',         end: true,  key: 'home',    icon: '⌂' },
  { to: '/home/map',     end: false, key: 'map',     icon: '◎' },
  { to: '/home/feed',    end: false, key: 'feed',    icon: '❋' },
  { to: '/home/beans',   end: false, key: 'beans',   icon: '◉' },
  { to: '/home/profile', end: false, key: 'profile', icon: '☻' }
];

export default function ConsumerShell() {
  return (
    <div className="c-shell">
      <div className="c-body">
        <Routes>
          <Route index element={<Home />} />
          <Route path="map" element={<MapView />} />
          <Route path="feed" element={<Feed />} />
          <Route path="beans" element={<BeansScreen />} />
          <Route path="profile" element={<ConsumerProfile />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </div>
      <BottomNav items={NAV} theme="consumer" />
    </div>
  );
}
