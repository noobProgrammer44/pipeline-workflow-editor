// ContextMenu.js
// Right-click context menu for nodes on the canvas.

import { useEffect, useRef } from 'react';

const menuStyle = {
  position: 'fixed',
  zIndex: 1000,
  background: '#FFFFFF',
  borderRadius: 8,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
  padding: 4,
  minWidth: 160,
  animation: 'contextMenuIn 0.12s ease',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '7px 12px',
  border: 'none',
  background: 'transparent',
  borderRadius: 5,
  fontSize: 12,
  fontWeight: 500,
  color: '#1E293B',
  fontFamily: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.1s ease',
};

const deleteItemStyle = {
  ...itemStyle,
  color: '#EF4444',
};

const dividerStyle = {
  height: 1,
  background: '#F1F5F9',
  margin: '4px 0',
};

const DuplicateIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const TrashIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const ContextMenu = ({ x, y, nodeId, onClose, onDelete, onDuplicate }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ ...menuStyle, left: x, top: y }}
    >
      <button
        style={itemStyle}
        onClick={() => { onDuplicate(nodeId); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F3FF')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>{DuplicateIcon}</span>
        Duplicate
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94A3B8' }}>Ctrl+D</span>
      </button>
      <div style={dividerStyle} />
      <button
        style={deleteItemStyle}
        onClick={() => { onDelete(nodeId); onClose(); }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>{TrashIcon}</span>
        Delete
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#FDA4AF' }}>Del</span>
      </button>
    </div>
  );
};
