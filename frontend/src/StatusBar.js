// StatusBar.js

import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const barStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  height: 44,
  background: '#FFFFFF',
  borderTop: '1px solid #E2E8F0',
  flexShrink: 0,
};

const statsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  fontSize: 12,
  color: '#94A3B8',
};

const statStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const dotStyle = (color) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: color,
});

const runBtnStyle = {
  padding: '7px 20px',
  borderRadius: 8,
  border: 'none',
  background: '#7C3AED',
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s ease',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
};

const runBtnDisabledStyle = {
  ...runBtnStyle,
  background: '#A78BFA',
  cursor: 'not-allowed',
};

const shortcutHint = {
  fontSize: 11,
  color: '#CBD5E1',
  display: 'flex',
  gap: 12,
};

const kbdStyle = {
  background: '#F1F5F9',
  borderRadius: 3,
  padding: '1px 4px',
  fontSize: 10,
  fontFamily: 'inherit',
  color: '#64748B',
  border: '1px solid #E2E8F0',
};

export const StatusBar = () => {
  const { nodes, edges, addToast } = useStore(
    (s) => ({ nodes: s.nodes, edges: s.edges, addToast: s.addToast }),
    shallow,
  );

  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    if (nodes.length === 0) {
      addToast('Add some nodes first', 'warning');
      return;
    }
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      addToast(
        `Pipeline executed: ${nodes.length} node${nodes.length !== 1 ? 's' : ''}, ${edges.length} edge${edges.length !== 1 ? 's' : ''}`,
        'success',
      );
    }, 1500);
  };

  return (
    <div style={barStyle}>
      <div style={statsStyle}>
        <div style={statStyle}>
          <div style={dotStyle('#7C3AED')} />
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </div>
        <div style={statStyle}>
          <div style={dotStyle('#3B82F6')} />
          {edges.length} edge{edges.length !== 1 ? 's' : ''}
        </div>
        <div style={shortcutHint}>
          <span><kbd style={kbdStyle}>Del</kbd> delete</span>
          <span><kbd style={kbdStyle}>Ctrl+Z</kbd> undo</span>
          <span><kbd style={kbdStyle}>Ctrl+D</kbd> duplicate</span>
        </div>
      </div>

      <button
        onClick={handleRun}
        disabled={isRunning}
        style={isRunning ? runBtnDisabledStyle : runBtnStyle}
        onMouseEnter={(e) => {
          if (!isRunning) {
            e.currentTarget.style.background = '#6D28D9';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,58,237,0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isRunning) {
            e.currentTarget.style.background = '#7C3AED';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }
        }}
      >
        {isRunning ? (
          <>
            <span className="spinner" /> Running...
          </>
        ) : (
          <>▶ Run Pipeline</>
        )}
      </button>
    </div>
  );
};
