// submit.js

import { useStore } from './store';
import { shallow } from 'zustand/shallow';

export const SubmitButton = () => {
  const { nodes, edges } = useStore(
    (state) => ({ nodes: state.nodes, edges: state.edges }),
    shallow,
  );

  const handleSubmit = () => {
    alert(
      `Pipeline: ${nodes.length} node${nodes.length !== 1 ? 's' : ''}, ` +
      `${edges.length} edge${edges.length !== 1 ? 's' : ''}`,
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
      }}
    >
      <span style={{ fontSize: 12, color: '#94A3B8' }}>
        {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        {' \u00B7 '}
        {edges.length} edge{edges.length !== 1 ? 's' : ''}
      </span>
      <button
        type="button"
        onClick={handleSubmit}
        style={{
          padding: '8px 20px',
          borderRadius: 8,
          border: 'none',
          background: '#7C3AED',
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#6D28D9';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,58,237,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#7C3AED';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        }}
      >
        ▶ Run Pipeline
      </button>
    </div>
  );
};
