// toolbar.js

import { useState } from 'react';
import { DraggableNode } from './draggableNode';
import { nodeList, NODE_CATEGORIES } from './nodes';

const toolbarStyle = {
  background: '#FFFFFF',
  borderBottom: '1px solid #E2E8F0',
  padding: '12px 20px',
  userSelect: 'none',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
};

const titleStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: '#1E293B',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const logoStyle = {
  width: 24,
  height: 24,
  borderRadius: 6,
  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
};

const tabsStyle = {
  display: 'flex',
  gap: 4,
};

const nodeGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: 6,
        border: 'none',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
        background: active ? '#7C3AED' : 'transparent',
        color: active ? '#FFFFFF' : '#64748B',
      }}
    >
      {label}
    </button>
  );
}

export const PipelineToolbar = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? nodeList
    : nodeList.filter((n) => n.category === activeCategory);

  return (
    <div style={toolbarStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          <div style={logoStyle}>V</div>
          Pipeline Builder
        </div>
        <div style={tabsStyle}>
          {NODE_CATEGORIES.map((cat) => (
            <Tab
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>
      <div style={nodeGridStyle}>
        {filtered.map((node) => (
          <DraggableNode
            key={node.type}
            type={node.type}
            label={node.label}
            icon={node.icon}
          />
        ))}
      </div>
    </div>
  );
};
