import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-20 right-4 z-[100] space-y-2 w-80 max-w-[90vw]">
        {toasts.map((toast) => {
          const styleByType = {
            success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            error: 'bg-red-50 border-red-200 text-red-700',
            info: 'bg-blue-50 border-blue-200 text-blue-700',
          };
          return (
            <div
              key={toast.id}
              className={`rounded-xl border px-4 py-3 text-sm font-bold shadow-card ${styleByType[toast.type] || styleByType.info}`}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
}
