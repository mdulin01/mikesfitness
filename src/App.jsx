import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useHealthData } from './hooks/useHealthData';
import LoginScreen from './components/LoginScreen';
import Nav from './components/Nav';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import Health from './pages/Health';
import Appointments from './pages/Appointments';
import Plan from './pages/Plan';

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const {
    data, loading: dataLoading,
    addWeight, updateAppointment, addAppointment, deleteAppointment,
    addLabResult, toggleDayCompletion, getWeekKey, toggleDailyItem,
  } = useHealthData(user);

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
        return <Dashboard data={data} toggleDayCompletion={toggleDayCompletion} getWeekKey={getWeekKey}
          toggleDailyItem={toggleDailyItem} setActiveSection={setActiveSection} />;
      case 'training':
        return <Training data={data} toggleDayCompletion={toggleDayCompletion} getWeekKey={getWeekKey} />;
      case 'health':
        return <Health data={data} addWeight={addWeight} addLabResult={addLabResult} />;
      case 'appointments':
        return <Appointments data={data} updateAppointment={updateAppointment}
          addAppointment={addAppointment} deleteAppointment={deleteAppointment} />;
      case 'plan':
        return <Plan />;
      default:
        return <Dashboard data={data} toggleDayCompletion={toggleDayCompletion} getWeekKey={getWeekKey}
          toggleDailyItem={toggleDailyItem} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Nav activeSection={activeSection} setActiveSection={setActiveSection} user={user} onLogout={logout} />
      {renderSection()}
    </div>
  );
}
