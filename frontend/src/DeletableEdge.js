// DeletableEdge.js
// Custom smoothstep edge: hover highlights, select shows delete button.

import { useState } from 'react';
import { getSmoothStepPath, BaseEdge, EdgeLabelRenderer } from 'reactflow';
import { useStore } from './store';

const INTERACTION_WIDTH = 20;

const hoverStyle = { stroke: '#7C3AED', strokeWidth: 3 };

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
  const edgeStyle = hovered && !selected ? { ...style, ...hoverStyle } : style;

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
