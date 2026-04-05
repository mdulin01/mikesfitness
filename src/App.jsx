import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useHealthData } from './hooks/useHealthData';
import LoginScreen from './components/LoginScreen';
import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import Health from './pages/Health';
import Events from './pages/Events';
import Nutrition from './pages/Nutrition';
import Trends from './pages/Trends';
import Plan from './pages/Plan';

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const healthData = useHealthData(user);
  const {
    data, loading: dataLoading,
  } = healthData;

  const [activeSection, setActiveSection] = useState('dashboard');

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

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard {...healthData} setActiveSection={setActiveSection} />;
      case 'nutrition':
        return <Nutrition {...healthData} />;
      case 'training':
        return <Training {...healthData} />;
      case 'health':
        return <Health {...healthData} />;
      case 'events':
        return <Events {...healthData} />;
      case 'trends':
        return <Trends {...healthData} />;
      case 'plan':
        return <Plan />;
      default:
        return <Dashboard {...healthData} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Nav activeSection={activeSection} setActiveSection={setActiveSection} user={user} onLogout={logout} />
      {renderSection()}
    </div>
  );
}
