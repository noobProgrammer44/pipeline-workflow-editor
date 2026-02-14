// Sidebar.js
// Searchable, categorized node library with collapsible sections.

import { useState } from 'react';
import { DraggableNode } from './draggableNode';
import { nodeList } from './nodes';
import { NodeCategory } from './constants';

const CATEGORIES = Object.values(NodeCategory);

const sidebarStyle = {
  width: 220,
  flexShrink: 0,
  background: '#FFFFFF',
  borderRight: '1px solid #E2E8F0',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const headerStyle = {
  padding: '12px 12px 8px',
  fontSize: 11,
  fontWeight: 600,
  color: '#94A3B8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const searchStyle = {
  margin: '0 12px 8px',
  padding: '7px 10px 7px 30px',
  border: '1px solid #E2E8F0',
  borderRadius: 8,
  fontSize: 12,
  fontFamily: 'inherit',
  color: '#1E293B',
  background: '#F8FAFC',
  outline: 'none',
  width: 'calc(100% - 24px)',
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

const nodeListStyle = {
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

export const Sidebar = () => {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState({});

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

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>Node Library</div>

      <div style={{ position: 'relative', margin: '0 12px 8px' }}>
        <span
          style={{
            position: 'absolute',
            left: 9,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 13,
            color: '#94A3B8',
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...searchStyle,
            margin: 0,
            width: '100%',
          }}
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
                <div style={nodeListStyle}>
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
