import { SECTIONS } from '../constants';

export default function Nav({ activeSection, setActiveSection, user, onLogout }) {
  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex bg-white border-b border-gray-200 px-4 py-2 items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold text-blue-600 mr-4">💪 Mike's Fitness</span>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
        <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-700">
          Sign out
        </button>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 safe-area-bottom">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2 pt-2 pb-3 flex flex-col items-center gap-0.5 text-xs transition-colors ${
              activeSection === s.id ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <span className="text-lg">{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
