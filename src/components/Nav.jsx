import { useState, useEffect } from 'react';
import { SECTIONS } from '../constants';

export default function Nav({ activeSection, setActiveSection, user, onLogout }) {
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
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === s.id
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

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 flex z-50">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2 pt-2 pb-3 flex flex-col items-center gap-0.5 text-xs transition-colors ${
              activeSection === s.id ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
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
