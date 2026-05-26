import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, tipo = 'info', duracao = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tipo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duracao);
  }, []);

  const sucesso = useCallback((msg) => addToast(msg, 'sucesso'), [addToast]);
  const erro = useCallback((msg) => addToast(msg, 'erro'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  const cores = {
    sucesso: 'bg-green-600',
    erro: 'bg-red-600',
    info: 'bg-brand-700',
  };

  const icons = {
    sucesso: 'fa-solid fa-check-circle',
    erro: 'fa-solid fa-exclamation-circle',
    info: 'fa-solid fa-info-circle',
  };

  return (
    <ToastContext.Provider value={{ addToast, sucesso, erro, info }}>
      {children}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${cores[toast.tipo] || cores.info} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-medium custom-toast page-enter`}
          >
            <i className={icons[toast.tipo] || icons.info}></i>
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-auto text-white/70 hover:text-white transition"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
