// draggableNode.js

import { DRAG_TRANSFER_TYPE } from './constants';

const cardStyle = {
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
  borderRadius: 7,
  background: '#FFFFFF',
  border: '1px solid #F1F5F9',
  fontSize: 12,
  fontWeight: 500,
  color: '#1E293B',
  fontFamily: 'inherit',
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

export const DraggableNode = ({ type, label, icon }) => {
  const onDragStart = (event, nodeType) => {
    const appData = { nodeType };
    event.dataTransfer.setData(DRAG_TRANSFER_TYPE, JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={type}
      onDragStart={(event) => onDragStart(event, type)}
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#F5F3FF';
        e.currentTarget.style.borderColor = '#DDD6FE';
        e.currentTarget.style.color = '#6D28D9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#FFFFFF';
        e.currentTarget.style.borderColor = '#F1F5F9';
        e.currentTarget.style.color = '#1E293B';
      }}
      draggable
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
      <span>{label}</span>
    </div>
  );
};
