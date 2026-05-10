import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useHealthData } from './hooks/useHealthData';
import { ToastProvider } from './components/Toast';
import LoginScreen from './components/LoginScreen';
import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import Health from './pages/Health';
import Nutrition from './pages/Nutrition';
import Medical from './pages/Medical';
import Life from './pages/Life';
import Triathlon from './pages/Triathlon';

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();
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
          <Nav user={user} onLogout={logout} />
          <Routes>
            <Route path="/" element={<Dashboard {...healthData} />} />
            <Route path="/nutrition" element={<Nutrition {...healthData} />} />
            <Route path="/training" element={<Training {...healthData} />} />
            <Route path="/health" element={<Health {...healthData} />} />
            <Route path="/medical" element={<Medical {...healthData} />} />
            <Route path="/life" element={<Life {...healthData} />} />
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
