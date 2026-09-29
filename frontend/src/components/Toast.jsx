import { useEffect, useState } from 'react';

let toastHandler = null;

export function showToast(message, type = 'success') {
  toastHandler?.(message, type);
}

export function ToastHost() {
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    toastHandler = (message, type) => setToast({ open: true, message, type });
    return () => {
      toastHandler = null;
    };
  }, []);

  useEffect(() => {
    if (!toast.open) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, open: false })), 3200);
    return () => clearTimeout(t);
  }, [toast.open, toast.message]);

  const styles = {
    success: 'border-nest-gold/40 bg-gradient-to-r from-nest-secondary to-nest-warm',
    error: 'border-nest-danger/50 bg-gradient-to-r from-nest-danger/95 to-[#6b3030]',
    info: 'border-nest-gold/30 bg-gradient-to-r from-[#1e3329] to-nest-warm',
  };

  const icon = {
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
    success: 'fa-circle-check',
  }[toast.type] || 'fa-circle-check';

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[100] flex items-center gap-3 px-4 py-3 rounded-xl text-mist text-sm shadow-folio border transition-all duration-300 safe-bottom ${
        styles[toast.type] || styles.success
      } ${toast.open ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}
    >
      <i className={`fa-solid ${icon} text-nest-gold`} />
      <span className="font-medium">{toast.message}</span>
    </div>
  );
}
