// StatusBar.js

import { useState } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';

// ── API ─────────────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:8000/pipelines/parse';

async function parsePipeline(nodes, edges) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })),
      edges: edges.map((e) => ({ source: e.source, target: e.target, id: e.id })),
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Server error (${res.status})`);
  }
  return res.json();
}

// ── Styles ──────────────────────────────────────────────────────────────────

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

const statStyle = { display: 'flex', alignItems: 'center', gap: 4 };

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

const shortcutHint = { fontSize: 11, color: '#CBD5E1', display: 'flex', gap: 12 };

const kbdStyle = {
  background: '#F1F5F9',
  borderRadius: 3,
  padding: '1px 4px',
  fontSize: 10,
  fontFamily: 'inherit',
  color: '#64748B',
  border: '1px solid #E2E8F0',
};

const clearHighlightBtnStyle = {
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid #FECACA',
  background: '#FEF2F2',
  color: '#DC2626',
  fontSize: 11,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

// Modal styles
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

const modalTitleStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: '#1E293B',
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  fontSize: 13,
  borderBottom: '1px solid #F1F5F9',
};

const labelStyle = { color: '#64748B', fontWeight: 500 };
const valueStyle = { color: '#1E293B', fontWeight: 600 };

const closeBtnStyle = {
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
  marginTop: 10,
  width: '100%',
};

const errorBannerStyle = {
  background: '#FEF2F2',
  border: '1px solid #FECACA',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 12,
  color: '#991B1B',
  lineHeight: 1.5,
};

const warningBannerStyle = {
  background: '#FFF7ED',
  border: '1px solid #FED7AA',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 12,
  color: '#9A3412',
  lineHeight: 1.5,
  marginTop: 8,
};

const highlightBtnStyle = {
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
  marginTop: 10,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
};

// ── Icons ───────────────────────────────────────────────────────────────────

const AnalysisIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const Spinner = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2a10 10 0 0 1 10 10">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite" />
    </path>
  </svg>
);

const HighlightIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Result Modal ────────────────────────────────────────────────────────────

function ResultModal({ result, error, onClose, onHighlight }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalTitleStyle}>
          {AnalysisIcon}
          Pipeline Analysis
        </div>

        {error ? (
          <div style={errorBannerStyle}>{error}</div>
        ) : result ? (
          <div>
            <div style={rowStyle}>
              <span style={labelStyle}>Nodes</span>
              <span style={valueStyle}>{result.num_nodes}</span>
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>Edges</span>
              <span style={valueStyle}>{result.num_edges}</span>
            </div>
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Valid DAG</span>
              <span style={{
                ...valueStyle,
                color: result.is_dag ? '#059669' : '#DC2626',
              }}>
                {result.is_dag ? '\u2713 Yes' : '\u2717 No'}
              </span>
            </div>

            {!result.is_dag && result.cycles && (
              <div style={warningBannerStyle}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  Cycle Detected
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                  {result.cycles.cycle_path.join(' \u2192 ')} \u2192 {result.cycles.cycle_path[0]}
                </div>
                <div style={{ fontSize: 11, color: '#B45309', marginTop: 6 }}>
                  {result.cycles.cycle_node_ids.length} node{result.cycles.cycle_node_ids.length !== 1 ? 's' : ''} and{' '}
                  {result.cycles.cycle_edges.length} edge{result.cycles.cycle_edges.length !== 1 ? 's' : ''} involved.
                  Remove or redirect an edge to break the loop.
                </div>
              </div>
            )}

            {!result.is_dag && !result.cycles && (
              <div style={warningBannerStyle}>
                Your pipeline contains a cycle. Remove or redirect an edge to break the loop.
              </div>
            )}

            {!result.is_dag && result.cycles && (
              <button
                onClick={() => {
                  onHighlight(result.cycles);
                  onClose();
                }}
                style={highlightBtnStyle}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#EF4444'; }}
              >
                {HighlightIcon} Highlight on Canvas
              </button>
            )}
          </div>
        ) : null}

        <button
          onClick={onClose}
          style={closeBtnStyle}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#6D28D9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#7C3AED'; }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── StatusBar ───────────────────────────────────────────────────────────────

export const StatusBar = () => {
  const {
    nodes, edges, addToast,
    highlightCycles, clearCycleHighlights, cycleHighlight,
  } = useStore(
    (s) => ({
      nodes: s.nodes,
      edges: s.edges,
      addToast: s.addToast,
      highlightCycles: s.highlightCycles,
      clearCycleHighlights: s.clearCycleHighlights,
      cycleHighlight: s.cycleHighlight,
    }),
    shallow,
  );

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const handleRun = async () => {
    if (loading) return;
    if (nodes.length === 0) {
      addToast('Add some nodes first', 'warning');
      return;
    }
    setLoading(true);
    try {
      const result = await parsePipeline(nodes, edges);
      setModal({ result, error: null });
    } catch (err) {
      const message = err.message === 'Failed to fetch'
        ? 'Unable to reach server. Is the backend running on localhost:8000?'
        : err.message || 'An unexpected error occurred.';
      setModal({ result: null, error: message });
      addToast('Pipeline analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleHighlight = (cycleInfo) => {
    highlightCycles(cycleInfo);
    addToast('Cycle highlighted on canvas', 'warning');
  };

  return (
    <>
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
          {cycleHighlight && (
            <button
              onClick={() => {
                clearCycleHighlights();
                addToast('Highlights cleared', 'info');
              }}
              style={clearHighlightBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
            >
              Clear Highlights
            </button>
          )}
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            ...runBtnStyle,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#6D28D9';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,58,237,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#7C3AED';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
            }
          }}
        >
          {loading ? Spinner : '\u25B6'} {loading ? 'Analyzing...' : 'Run Pipeline'}
        </button>
      </div>

      {modal && (
        <ResultModal
          result={modal.result}
          error={modal.error}
          onClose={() => setModal(null)}
          onHighlight={handleHighlight}
        />
      )}
    </>
  );
};
