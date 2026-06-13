import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SECTIONS } from '../constants';

export default function Nav({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const getPathForSection = (sectionId) => {
    return sectionId === 'dashboard' ? '/' : `/${sectionId}`;
  };

  const isActiveSection = (sectionId) => {
    const path = getPathForSection(sectionId);
    return location.pathname === path;
  };

  const handleTitleClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') setInstallPrompt(null);
    } else {
      setShowInstallBanner(b => !b);
    }
  };

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex bg-slate-900 border-b border-slate-700 px-4 py-2 items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-1">
          <button onClick={handleTitleClick} className="text-xl font-bold text-blue-400 mr-4 hover:text-blue-300 transition-colors cursor-pointer">
            💪 Mike's Fitness
          </button>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => navigate(getPathForSection(s.id))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActiveSection(s.id)
                  ? 'bg-blue-900/50 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
        <button onClick={onLogout} className="text-sm text-slate-500 hover:text-slate-300">
          Sign out
        </button>
      </nav>

      {/* Install banner */}
      {showInstallBanner && (
        <div className="bg-blue-900/80 border-b border-blue-700 px-4 py-3 text-center">
          <p className="text-sm text-blue-200">
            {installPrompt
              ? 'Tap to install Mike\'s Fitness as an app!'
              : 'To install: open in Safari/Chrome → Share → "Add to Home Screen"'}
          </p>
          <button onClick={() => setShowInstallBanner(false)} className="text-xs text-blue-400 mt-1">Dismiss</button>
        </div>
      )}

      {/* Mobile floating dock — translucent pill, spectrum indicator, docked 🦚 */}
      <nav className="md:hidden fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-slate-900/85 backdrop-blur-xl border border-slate-600/50 rounded-full px-2.5 py-2 shadow-2xl max-w-[calc(100vw-24px)]" style={{ bottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => navigate(getPathForSection(s.id))}
            className={`relative flex flex-col items-center gap-0.5 text-[10px] font-semibold px-3 py-1.5 min-w-[46px] transition-colors ${
              isActiveSection(s.id) ? 'text-slate-100' : 'text-slate-500'
            }`}
          >
            <span className="text-[22px] leading-none">{s.emoji}</span>
            <span>{s.label}</span>
            {isActiveSection(s.id) && <span className="absolute -bottom-0.5 w-4 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#e40303,#ff8c00,#ffd700,#008026,#3b82f6,#732982)' }} />}
          </button>
        ))}
        <a href="https://mikeslife.app/?rupert=1" title="Talk to Rupert"
          {...(typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone) ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          className="text-[24px] px-2.5 pb-1" style={{ filter: 'drop-shadow(0 0 7px rgba(52,211,153,.45))' }}>🦚</a>
      </nav>

      {/* Mobile header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button onClick={handleTitleClick} className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors">
          💪 Mike's Fitness
        </button>
        <button onClick={onLogout} className="text-xs text-slate-500 hover:text-slate-300">Sign out</button>
      </div>
    </>
  );
}
