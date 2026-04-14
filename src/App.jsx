import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import AuthScreen from './screens/AuthScreen.jsx';
import ConsumerOnboard from './screens/onboard/ConsumerOnboard.jsx';
import BaristaOnboard from './screens/onboard/BaristaOnboard.jsx';
import RoasterOnboard from './screens/onboard/RoasterOnboard.jsx';
import ShopOnboard from './screens/onboard/ShopOnboard.jsx';
import ConsumerShell from './shells/ConsumerShell.jsx';
import BaristaShell from './shells/BaristaShell.jsx';
import AdminShell from './shells/AdminShell.jsx';
import RoasterShell from './shells/RoasterShell.jsx';

function RootRedirect() {
  const { loading, user, profile } = useAuth();
  if (loading) return <div style={{ padding: 40, color: 'var(--cream)' }}>Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return <div style={{ padding: 40, color: 'var(--cream)' }}>Loading profile…</div>;
  switch (profile.role) {
    case 'admin':   return <Navigate to="/admin" replace />;
    case 'barista': return <Navigate to="/barista" replace />;
    case 'roaster': return <Navigate to="/roaster" replace />;
    default:        return <Navigate to="/home" replace />;
  }
}

function RequireRole({ role, children }) {
  const { loading, user, profile } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return null;
  if (profile.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/onboard" element={<ConsumerOnboard />} />
          <Route path="/onboard/barista" element={<BaristaOnboard />} />
          <Route path="/onboard/roaster" element={<RoasterOnboard />} />
          <Route path="/onboard/shop" element={<ShopOnboard />} />
          <Route path="/home/*" element={<RequireRole role="consumer"><ConsumerShell /></RequireRole>} />
          <Route path="/barista/*" element={<RequireRole role="barista"><BaristaShell /></RequireRole>} />
          <Route path="/admin/*" element={<RequireRole role="admin"><AdminShell /></RequireRole>} />
          <Route path="/roaster/*" element={<RequireRole role="roaster"><RoasterShell /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
