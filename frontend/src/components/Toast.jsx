import { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, Info, X } from 'lucide-react';

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
    const t = setTimeout(() => setToast((s) => ({ ...s, open: false })), 3500);
    return () => clearTimeout(t);
  }, [toast.open, toast.message]);

  const styles = {
    success: 'border-forest-amber/40 bg-[#161B18]/95 text-forest-mist shadow-bioglow',
    error: 'border-rose-500/40 bg-[#2A1719]/95 text-rose-200',
    info: 'border-forest-sage/40 bg-[#182420]/95 text-forest-mist',
  };

  const Icon = {
    error: AlertTriangle,
    info: Info,
    success: Sparkles,
  }[toast.type] || Sparkles;

  if (!toast.open) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl transition-all duration-300 animate-slide-up ${
        styles[toast.type] || styles.success
      }`}
    >
      <div className="h-6 w-6 rounded-full bg-forest-amber/20 flex items-center justify-center text-forest-amber shrink-0">
        <Icon size={14} />
      </div>
      <span className="text-xs font-serif font-medium tracking-wide">{toast.message}</span>
      <button
        type="button"
        onClick={() => setToast((s) => ({ ...s, open: false }))}
        className="p-1 rounded text-forest-sage hover:text-forest-mist ml-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
