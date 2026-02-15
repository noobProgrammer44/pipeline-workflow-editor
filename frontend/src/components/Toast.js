import { useStore } from '../store';

const containerStyle = {
  position: 'fixed',
  bottom: 56,
  right: 16,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  pointerEvents: 'none',
};

const TOAST_COLORS = {
  success: { bg: '#10B981', icon: '✓' },
  error: { bg: '#EF4444', icon: '✕' },
  warning: { bg: '#F59E0B', icon: '⚠' },
  info: { bg: '#1E293B', icon: 'ℹ' },
};

const toastStyle = (type) => ({
  padding: '10px 16px',
  borderRadius: 8,
  background: TOAST_COLORS[type]?.bg || '#1E293B',
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'inherit',
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  animation: 'toastSlideIn 0.25s ease',
  pointerEvents: 'auto',
});

export const ToastContainer = () => {
  const toasts = useStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div style={containerStyle}>
      {toasts.map((toast) => (
        <div key={toast.id} style={toastStyle(toast.type)}>
          <span style={{ fontSize: 14 }}>
            {TOAST_COLORS[toast.type]?.icon}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
};
