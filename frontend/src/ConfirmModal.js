// ConfirmModal.js

import { useEffect } from 'react';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  animation: 'modalOverlayIn 0.15s ease',
};

const panelStyle = {
  background: '#FFFFFF',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
  padding: '24px',
  width: 380,
  maxWidth: 'calc(100vw - 40px)',
  animation: 'modalPanelIn 0.2s ease',
};

const titleStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: '#1E293B',
  marginBottom: 8,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const messageStyle = {
  fontSize: 13,
  color: '#64748B',
  lineHeight: 1.5,
  marginBottom: 20,
};

const actionsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
};

const cancelBtnStyle = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid #E2E8F0',
  background: '#FFFFFF',
  color: '#475569',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const confirmBtnStyle = {
  padding: '8px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#EF4444',
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

export const ConfirmModal = ({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onConfirm, onCancel]);

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>
          ⚠️ {title}
        </div>
        <div style={messageStyle}>
          {message}
        </div>
        <div style={actionsStyle}>
          <button
            onClick={onCancel}
            style={cancelBtnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={confirmBtnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#DC2626')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#EF4444')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
