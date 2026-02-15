import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { ConfirmModal } from './ConfirmModal';
import { nodeList } from '../nodes';

const nodeLabelMap = Object.fromEntries(
  nodeList.map((n) => [n.type, { label: n.label, icon: n.icon }]),
);

const MAX_RESULTS = 8;

const barStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  height: 48,
  background: '#FFFFFF',
  borderBottom: '1px solid #E2E8F0',
  flexShrink: 0,
  zIndex: 10,
};

const leftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexShrink: 0,
};

const logoStyle = {
  width: 28,
  height: 28,
  borderRadius: 7,
  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: 14,
  fontWeight: 800,
  flexShrink: 0,
};

const nameInputStyle = {
  border: '1px solid transparent',
  borderRadius: 6,
  padding: '4px 8px',
  fontSize: 14,
  fontWeight: 600,
  color: '#1E293B',
  fontFamily: 'inherit',
  background: 'transparent',
  outline: 'none',
  minWidth: 120,
  maxWidth: 280,
  transition: 'border-color 0.15s ease, background 0.15s ease',
};

const centerStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  padding: '0 16px',
  minWidth: 0,
};

const searchWrapperStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: 320,
};

const searchInputStyle = {
  width: '100%',
  padding: '6px 10px 6px 30px',
  border: '1px solid #E2E8F0',
  borderRadius: 7,
  fontSize: 12,
  fontFamily: 'inherit',
  color: '#1E293B',
  background: '#F8FAFC',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease, background 0.15s ease',
};

const searchIconStyle = {
  position: 'absolute',
  left: 9,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94A3B8',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
};

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: 4,
  background: '#FFFFFF',
  borderRadius: 8,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
  padding: 4,
  zIndex: 100,
  maxHeight: 280,
  overflowY: 'auto',
  animation: 'contextMenuIn 0.12s ease',
};

const resultItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '7px 10px',
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

const resultIdStyle = {
  marginLeft: 'auto',
  fontSize: 11,
  color: '#94A3B8',
  fontWeight: 400,
  flexShrink: 0,
};

const emptyResultStyle = {
  padding: '12px 10px',
  fontSize: 12,
  color: '#94A3B8',
  textAlign: 'center',
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexShrink: 0,
};

const dividerStyle = {
  width: 1,
  height: 24,
  background: '#E2E8F0',
  margin: '0 4px',
  flexShrink: 0,
};

const btnStyle = {
  padding: '6px 12px',
  borderRadius: 6,
  border: '1px solid #E2E8F0',
  background: '#FFFFFF',
  color: '#475569',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
};

const clearBtnStyle = {
  ...btnStyle,
  color: '#EF4444',
  borderColor: '#FEE2E2',
};

const undoBtnStyle = {
  ...btnStyle,
  padding: '6px 10px',
  gap: 5,
};

const kbdStyle = {
  fontSize: 10,
  color: '#94A3B8',
  fontFamily: 'inherit',
};

const SearchIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const TopBar = () => {
  const {
    pipelineName,
    setPipelineName,
    exportPipeline,
    clearCanvas,
    undo,
    redo,
    historyLen,
    futureLen,
    nodes,
    focusNode,
  } = useStore(
    (s) => ({
      pipelineName: s.pipelineName,
      setPipelineName: s.setPipelineName,
      exportPipeline: s.exportPipeline,
      clearCanvas: s.clearCanvas,
      undo: s.undo,
      redo: s.redo,
      historyLen: s.history.length,
      futureLen: s.future.length,
      nodes: s.nodes,
      focusNode: s.focusNode,
    }),
    shallow,
  );

  const [editing, setEditing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.select();
    }
  }, [editing]);

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return nodes
      .filter((node) => {
        const meta = nodeLabelMap[node.type];
        const label = meta ? meta.label.toLowerCase() : '';
        const id = node.id.toLowerCase();
        if (label.includes(q) || id.includes(q)) return true;
        if (node.data) {
          for (const val of Object.values(node.data)) {
            if (typeof val === 'string' && val.toLowerCase().includes(q)) return true;
          }
        }
        return false;
      })
      .slice(0, MAX_RESULTS);
  }, [search, nodes]);

  const showDropdown = searchFocused && search.trim().length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [results.length, search]);

  const selectResult = (nodeId) => {
    focusNode(nodeId);
    setSearch('');
    setSearchFocused(false);
    searchRef.current?.blur();
  };

  const onSearchKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) {
        selectResult(results[activeIndex].id);
      }
    } else if (e.key === 'Escape') {
      setSearch('');
      searchRef.current?.blur();
    }
  };

  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && e.target !== searchRef.current) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <div style={barStyle}>
      <div style={leftStyle}>
        <div style={logoStyle}>V</div>
        <input
          ref={inputRef}
          value={pipelineName}
          onChange={(e) => setPipelineName(e.target.value)}
          onFocus={() => setEditing(true)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          style={{
            ...nameInputStyle,
            borderColor: editing ? '#7C3AED' : 'transparent',
            background: editing ? '#F5F3FF' : 'transparent',
          }}
        />
      </div>

      <div style={centerStyle}>
        <div style={searchWrapperStyle}>
          <span style={searchIconStyle}>{SearchIcon}</span>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search nodes on canvas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              // Small delay so click on result registers before blur closes dropdown
              setTimeout(() => setSearchFocused(false), 150);
            }}
            onKeyDown={onSearchKeyDown}
            style={{
              ...searchInputStyle,
              borderColor: searchFocused ? '#7C3AED' : '#E2E8F0',
              background: searchFocused ? '#FFFFFF' : '#F8FAFC',
            }}
          />

          {showDropdown && (
            <div ref={dropdownRef} style={dropdownStyle}>
              {results.length === 0 ? (
                <div style={emptyResultStyle}>No nodes found</div>
              ) : (
                results.map((node, i) => {
                  const meta = nodeLabelMap[node.type];
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={node.id}
                      style={{
                        ...resultItemStyle,
                        background: isActive ? '#F5F3FF' : 'transparent',
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectResult(node.id);
                      }}
                    >
                      {meta?.icon && (
                        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#7C3AED' }}>
                          {meta.icon}
                        </span>
                      )}
                      <span>{meta?.label || node.type}</span>
                      <span style={resultIdStyle}>{node.id}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <div style={rightStyle}>
        <button
          onClick={undo}
          disabled={historyLen === 0}
          style={{
            ...undoBtnStyle,
            opacity: historyLen === 0 ? 0.4 : 1,
            cursor: historyLen === 0 ? 'default' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (historyLen > 0) {
              e.currentTarget.style.borderColor = '#7C3AED';
              e.currentTarget.style.color = '#7C3AED';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.color = '#475569';
          }}
        >
          ↩ Undo <span style={kbdStyle}>Ctrl+Z</span>
        </button>
        <button
          onClick={redo}
          disabled={futureLen === 0}
          style={{
            ...undoBtnStyle,
            opacity: futureLen === 0 ? 0.4 : 1,
            cursor: futureLen === 0 ? 'default' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (futureLen > 0) {
              e.currentTarget.style.borderColor = '#7C3AED';
              e.currentTarget.style.color = '#7C3AED';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.color = '#475569';
          }}
        >
          ↪ Redo <span style={kbdStyle}>Ctrl+Y</span>
        </button>

        <div style={dividerStyle} />

        <button
          onClick={exportPipeline}
          style={btnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7C3AED';
            e.currentTarget.style.color = '#7C3AED';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.color = '#475569';
          }}
        >
          Export
        </button>
        <button
          onClick={() => setShowClearConfirm(true)}
          style={clearBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FEF2F2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
          }}
        >
          Clear
        </button>
      </div>

      {showClearConfirm && (
        <ConfirmModal
          title="Clear Canvas"
          message="This will permanently remove all nodes and connections. This action cannot be undone."
          confirmLabel="Clear All"
          onConfirm={() => {
            clearCanvas();
            setShowClearConfirm(false);
          }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  );
};
