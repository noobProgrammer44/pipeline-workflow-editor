// DeletableEdge.js
// Custom smoothstep edge: hover highlights, select shows delete button, data-flow label.

import { useState } from 'react';
import { getSmoothStepPath, BaseEdge, EdgeLabelRenderer } from 'reactflow';
import { useStore } from './store';

const INTERACTION_WIDTH = 20;

const hoverStyle = { stroke: '#7C3AED', strokeWidth: 3 };

const labelStyle = {
  position: 'absolute',
  fontSize: 11,
  fontWeight: 500,
  fontFamily: 'inherit',
  color: '#64748B',
  background: 'rgba(255, 255, 255, 0.92)',
  padding: '2px 6px',
  borderRadius: 4,
  border: '1px solid #F1F5F9',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  lineHeight: 1.3,
};

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  label,
}) {
  const [hovered, setHovered] = useState(false);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const deleteEdge = useStore((s) => s.deleteEdge);
  const isCycleEdge = style?.stroke === '#ef4444';
  const activeHoverStyle = isCycleEdge ? { stroke: '#ef4444', strokeWidth: 3 } : hoverStyle;
  const edgeStyle = hovered && !selected ? { ...style, ...activeHoverStyle } : style;

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} markerEnd={markerEnd} />
      {/* Invisible wider path for hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={INTERACTION_WIDTH}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <EdgeLabelRenderer>
        {label && (
          <div
            style={{
              ...labelStyle,
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 14}px)`,
            }}
          >
            {label}
          </div>
        )}
        <button
          className={`edge-delete-btn${selected ? ' edge-delete-visible' : ''}`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: selected ? 'all' : 'none',
          }}
          onClick={(e) => {
            e.stopPropagation();
            deleteEdge(id);
          }}
        >
          ✕
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
