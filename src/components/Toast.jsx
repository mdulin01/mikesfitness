import { useState, useCallback } from 'react';

import { ToastContext } from './toastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(toast => toast.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id}
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-auto animate-fade-in ${
              toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              'bg-slate-700 text-white'
            }`}>
            {toast.type === 'success' ? '✓ ' : toast.type === 'error' ? '✕ ' : ''}{toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
