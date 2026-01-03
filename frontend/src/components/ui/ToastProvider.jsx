import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const toastVariants = {
  success: { icon: 'OK', label: 'Berhasil' },
  error: { icon: '!', label: 'Gagal' },
  info: { icon: 'i', label: 'Info' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const variant = toastVariants[toast.type] || toastVariants.info;
          return (
            <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
              <div className="toast__icon" aria-hidden="true">
                {variant.icon}
              </div>
              <div className="toast__body">
                <p className="toast__label">{variant.label}</p>
                <p className="toast__message">{toast.message}</p>
              </div>
              <button
                type="button"
                className="toast__close"
                aria-label="Tutup notifikasi"
                onClick={() => removeToast(toast.id)}
              >
                x
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus dipakai di dalam ToastProvider');
  }
  return context;
};
