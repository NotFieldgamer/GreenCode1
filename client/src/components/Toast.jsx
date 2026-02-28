import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

let _addToast = null;

export function toast(message, type = 'info') {
  _addToast?.({ message, type, id: Date.now() });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback(t => {
    setToasts(p => [...p, t]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3200);
  }, []);

  useEffect(() => {
    _addToast = add;
    return () => { _addToast = null; };
  }, [add]);

  const icons = {
    success: <CheckCircle2 size={14} />,
    error:   <XCircle size={14} />,
    info:    <Info size={14} />,
  };

  return createPortal(
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast-bar toast-${t.type}`}>
          <span className="toast-icon">{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>,
    document.body
  );
}
