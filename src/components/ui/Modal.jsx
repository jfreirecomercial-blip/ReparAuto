import React, { useEffect, useRef } from 'react';

export default function Modal({ show, onClose, titulo, children, tamanho = 'md' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && show) onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [show, onClose]);

  if (!show) return null;

  const tamanhos = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${tamanhos[tamanho] || tamanhos.md} max-h-[90vh] flex flex-col page-enter`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-lg font-extrabold text-brand-900">{titulo}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
