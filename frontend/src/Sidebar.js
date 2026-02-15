// Sidebar.js
// Searchable, categorized node library with collapsible panel and sections.

import { useState } from 'react';
import { DraggableNode } from './draggableNode';
import { nodeList } from './nodes';
import { NodeCategory } from './constants';

const CATEGORIES = Object.values(NodeCategory);
const SIDEBAR_WIDTH = 220;
const COLLAPSED_WIDTH = 44;

// ── Styles ───────────────────────────────────────────────────────────────────

const expandedStyle = {
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
  background: '#FFFFFF',
  borderRight: '1px solid #E2E8F0',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: 'width 0.2s ease',
};

const collapsedStyle = {
  width: COLLAPSED_WIDTH,
  flexShrink: 0,
  background: '#FFFFFF',
  borderRight: '1px solid #E2E8F0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'width 0.2s ease, background 0.15s ease',
  position: 'relative',
};

const headerStyle = {
  padding: '10px 8px 8px 12px',
  fontSize: 11,
  fontWeight: 600,
  color: '#94A3B8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 6,
};

const collapseBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  border: '1px solid #E2E8F0',
  background: '#FFFFFF',
  borderRadius: 6,
  cursor: 'pointer',
  color: '#94A3B8',
  flexShrink: 0,
  transition: 'all 0.15s ease',
};

const searchStyle = {
  padding: '7px 10px 7px 30px',
  border: '1px solid #E2E8F0',
  borderRadius: 8,
  fontSize: 12,
  fontFamily: 'inherit',
  color: '#1E293B',
  background: '#F8FAFC',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};

const listStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '0 0 12px',
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px 4px',
  cursor: 'pointer',
  userSelect: 'none',
  fontSize: 11,
  fontWeight: 600,
  color: '#64748B',
  transition: 'color 0.15s ease',
};

const chevronStyle = (open) => ({
  fontSize: 9,
  transition: 'transform 0.2s ease',
  transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
  color: '#94A3B8',
});

const countBadge = {
  fontSize: 10,
  fontWeight: 500,
  color: '#94A3B8',
  background: '#F1F5F9',
  borderRadius: 4,
  padding: '1px 6px',
};

const nodeListStyleObj = {
  padding: '2px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const emptyStyle = {
  padding: '20px 12px',
  fontSize: 12,
  color: '#94A3B8',
  textAlign: 'center',
};

// ── Collapsed state styles ───────────────────────────────────────────────────

const collapsedInnerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  paddingTop: 12,
  width: '100%',
};

const expandTabStyle = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#F5F3FF',
  border: '1px solid #E9E5F5',
  borderRadius: 8,
  color: '#7C3AED',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

const verticalLabelStyle = {
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
  fontSize: 10,
  fontWeight: 600,
  color: '#94A3B8',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  userSelect: 'none',
  pointerEvents: 'none',
};

// ── SVG Icons ────────────────────────────────────────────────────────────────

const ChevronLeftIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const SearchIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ── Component ────────────────────────────────────────────────────────────────

export const Sidebar = () => {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState({});
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const toggleSection = (cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filtered = search
    ? nodeList.filter(
        (n) =>
          n.label.toLowerCase().includes(search.toLowerCase()) ||
          n.type.toLowerCase().includes(search.toLowerCase()),
      )
    : nodeList;

  const isSearching = search.length > 0;

  // ── Collapsed state ────────────────────────────────────────────────────

  if (panelCollapsed) {
    return (
      <div
        style={collapsedStyle}
        onClick={() => setPanelCollapsed(false)}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFE'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
        title="Expand node library"
      >
        <div style={collapsedInnerStyle}>
          <div
            style={expandTabStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#EDE9FE'; e.currentTarget.style.borderColor = '#7C3AED'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F3FF'; e.currentTarget.style.borderColor = '#E9E5F5'; }}
          >
            {ChevronRightIcon}
          </div>
          <span style={verticalLabelStyle}>Nodes</span>
        </div>
      </div>
    );
  }

  // ── Expanded state ─────────────────────────────────────────────────────

  return (
    <div style={expandedStyle}>
      <div style={headerStyle}>
        <span>Node Library</span>
        <button
          style={collapseBtnStyle}
          title="Collapse sidebar"
          onClick={() => setPanelCollapsed(true)}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.color = '#7C3AED'; e.currentTarget.style.background = '#F5F3FF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#FFFFFF'; }}
        >
          {ChevronLeftIcon}
        </button>
      </div>

      <div style={{ position: 'relative', margin: '0 12px 8px' }}>
        <span
          style={{
            position: 'absolute',
            left: 9,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94A3B8',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {SearchIcon}
        </span>
        <input
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchStyle}
          onFocus={(e) => (e.target.style.borderColor = '#7C3AED')}
          onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
        />
      </div>

      <div style={listStyle}>
        {filtered.length === 0 && (
          <div style={emptyStyle}>No nodes match "{search}"</div>
        )}

        {CATEGORIES.map((cat) => {
          const nodesInCat = filtered.filter((n) => n.category === cat);
          if (nodesInCat.length === 0) return null;

          const isOpen = isSearching || !collapsed[cat];

          return (
            <div key={cat}>
              <div
                style={sectionHeaderStyle}
                onClick={() => toggleSection(cat)}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1E293B')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={chevronStyle(isOpen)}>▶</span>
                  {cat}
                </div>
                <span style={countBadge}>{nodesInCat.length}</span>
              </div>

              {isOpen && (
                <div style={nodeListStyleObj}>
                  {nodesInCat.map((node) => (
                    <DraggableNode
                      key={node.type}
                      type={node.type}
                      label={node.label}
                      icon={node.icon}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
