import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useHealthData } from './hooks/useHealthData';
import { ToastProvider } from './components/Toast';
import LoginScreen from './components/LoginScreen';
import Nav from './components/Nav';
import RupertBanner from './components/RupertBanner';
import { db } from './firebase-config';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import Nutrition from './pages/Nutrition';
import Triathlon from './pages/Triathlon';

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh (PWA has no native one): drag down ≥80px from the top → full
  // re-fetch via reload. Apple Health data still only ARRIVES when the iPhone
  // Health Auto Export automation fires — this forces a re-read of Firestore.
  useEffect(() => {
    let startY = null;
    const onStart = (e) => { startY = window.scrollY <= 0 ? e.touches[0].clientY : null; };
    const onMove = (e) => {
      if (startY == null) return;
      if (e.touches[0].clientY - startY > 80) {
        startY = null;
        setRefreshing(true);
        setTimeout(() => window.location.reload(), 400);
      }
    };
    const onEnd = () => { startY = null; };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd);
    return () => { document.removeEventListener('touchstart', onStart); document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); };
  }, []);
  const healthData = useHealthData(user);
  const {
    data, loading: dataLoading,
  } = healthData;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-4xl mb-2">💪</div>
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  if (dataLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-slate-400">Loading health data...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen bg-slate-900">
          {refreshing && <div className="fixed top-0 inset-x-0 z-50 text-center py-2.5 bg-slate-800 text-emerald-400 text-sm border-b border-slate-700">⟳ Refreshing…</div>}
          <Nav user={user} onLogout={logout} />
          <RupertBanner db={db} accent="#34d399" />
          <Routes>
            <Route path="/" element={<Dashboard {...healthData} />} />
            <Route path="/nutrition" element={<Nutrition {...healthData} />} />
            <Route path="/training" element={<Training {...healthData} />} />
            <Route path="/triathlon" element={<Triathlon {...healthData} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <footer className="hidden md:block text-center py-4 text-slate-600 text-xs">
            Made by Mike Dulin, MD · Build 14
          </footer>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
