// BaseNode.js
// Configuration-driven base component for all pipeline nodes.

import { useState, useEffect, useMemo, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { HandleType, HandlePosition, FieldType } from '../constants';

// ─── Constants ────────────────────────────────────────────────────────────────

const positionMap = {
  [HandlePosition.LEFT]: Position.Left,
  [HandlePosition.RIGHT]: Position.Right,
  [HandlePosition.TOP]: Position.Top,
  [HandlePosition.BOTTOM]: Position.Bottom,
};

// Static styles — zero allocations per render.
const FIELD_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 6,
  fontSize: 12,
  minWidth: 0,
};

const FIELD_STYLE_TEXTAREA = {
  ...FIELD_STYLE,
  alignItems: 'flex-start',
};

const INPUT_STYLE = {
  flex: 1,
  minWidth: 0,
  padding: '5px 8px',
  border: '1px solid #E2E8F0',
  borderRadius: 6,
  fontSize: 12,
  background: '#F8FAFC',
  color: '#1E293B',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const SELECT_STYLE = {
  ...INPUT_STYLE,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 6px center',
  paddingRight: 22,
};

const TEXTAREA_STYLE = { ...INPUT_STYLE, resize: 'vertical' };
const NUMBER_STYLE = { ...INPUT_STYLE, width: 64, flex: 'none' };

const LABEL_STYLE = {
  fontWeight: 500,
  whiteSpace: 'nowrap',
  color: '#475569',
  fontSize: 11,
  flexShrink: 0,
};

const LABEL_STYLE_TEXTAREA = { ...LABEL_STYLE, paddingTop: 4 };

const CHECKBOX_STYLE = {
  width: 14,
  height: 14,
  margin: 0,
  accentColor: '#7C3AED',
  cursor: 'pointer',
};

const DELETE_BTN_STYLE = {
  marginLeft: 'auto',
  background: 'rgba(0,0,0,0.15)',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: 0,
  fontSize: 11,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  width: 18,
  height: 18,
  flexShrink: 0,
  transition: 'background 0.1s ease',
};

// ─── NodeField ────────────────────────────────────────────────────────────────

function NodeField({ field, value, onChange }) {
  switch (field.type) {
    case FieldType.SELECT:
      return (
        <div style={FIELD_STYLE}>
          <label style={LABEL_STYLE}>{field.label}:</label>
          <select value={value} onChange={(e) => onChange(e.target.value)} style={SELECT_STYLE}>
            {(field.options || []).map((opt) => {
              const optVal = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              return <option key={optVal} value={optVal}>{optLabel}</option>;
            })}
          </select>
        </div>
      );

    case FieldType.TEXTAREA:
      return (
        <div style={FIELD_STYLE_TEXTAREA}>
          <label style={LABEL_STYLE_TEXTAREA}>{field.label}:</label>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            rows={field.rows || 2}
            style={TEXTAREA_STYLE}
          />
        </div>
      );

    case FieldType.NUMBER:
      return (
        <div style={FIELD_STYLE}>
          <label style={LABEL_STYLE}>{field.label}:</label>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={field.placeholder || ''}
            min={field.min}
            max={field.max}
            step={field.step}
            style={NUMBER_STYLE}
          />
        </div>
      );

    case FieldType.CHECKBOX:
      return (
        <div style={FIELD_STYLE}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            style={CHECKBOX_STYLE}
          />
          <label style={LABEL_STYLE}>{field.label}</label>
        </div>
      );

    case FieldType.TEXT:
    default:
      return (
        <div style={FIELD_STYLE}>
          <label style={LABEL_STYLE}>{field.label}:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            style={INPUT_STYLE}
          />
        </div>
      );
  }
}

// ─── Handle helpers ───────────────────────────────────────────────────────────

function computeHandleOffsets(handles) {
  return handles.map((h) => {
    const sameGroup = handles.filter(
      (other) => other.position === h.position && other.type === h.type
    );
    if (sameGroup.length <= 1) return undefined;
    const idx = sameGroup.indexOf(h);
    return `${((idx + 1) / (sameGroup.length + 1)) * 100}%`;
  });
}

function computeHandleStyles(handles, offsets, color) {
  return handles.map((h, i) => ({
    width: 12,
    height: 12,
    background: h.type === HandleType.SOURCE ? color : '#CBD5E1',
    border: '2.5px solid #fff',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
    ...(offsets[i] != null ? { top: offsets[i] } : undefined),
    ...h.style,
  }));
}

// ─── BaseNode ─────────────────────────────────────────────────────────────────

export function BaseNode({ id, data, config }) {
  const {
    label = 'Node',
    icon,
    description,
    color = '#64748B',
    width = 220,
    height = 'auto',
    handles = [],
    fields = [],
    body: BodySlot,
  } = config;

  const updateNodeField = useStore((state) => state.updateNodeField);
  const updateNodeFields = useStore((state) => state.updateNodeFields);
  const deleteNode = useStore((state) => state.deleteNode);

  const buildInitialValues = () => {
    const vals = {};
    fields.forEach((f) => {
      if (data?.[f.name] !== undefined) {
        vals[f.name] = data[f.name];
      } else if (f.defaultFromId) {
        vals[f.name] = f.defaultFromId(id);
      } else {
        vals[f.name] = f.default ?? '';
      }
    });
    return vals;
  };

  const [fieldValues, setFieldValues] = useState(buildInitialValues);

  useEffect(() => {
    updateNodeFields(id, buildInitialValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFieldChange = (fieldName, value) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
    updateNodeField(id, fieldName, value);
  };

  // ── Memoized styles ────────────────────────────────────────────────────

  const { containerStyle, headerStyle, bodyStyle } = useMemo(() => ({
    containerStyle: {
      width,
      minHeight: height === 'auto' ? 60 : height,
      background: '#FFFFFF',
      borderRadius: 10,
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      fontFamily: 'inherit',
      overflow: 'visible',
      transition: 'box-shadow 0.2s ease',
    },
    headerStyle: {
      background: color,
      color: '#FFFFFF',
      padding: '8px 12px',
      borderRadius: '10px 10px 0 0',
      fontSize: 13,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      letterSpacing: '0.01em',
      position: 'relative',
    },
    bodyStyle: {
      padding: (fields.length > 0 || BodySlot) ? '10px 12px' : '8px 12px',
      overflow: 'hidden',
    },
  }), [color, width, height, fields.length, BodySlot]);

  const descriptionStyle = useMemo(() => ({
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: (fields.length > 0 || BodySlot) ? 8 : 0,
    lineHeight: 1.4,
  }), [fields.length, BodySlot]);

  const handleOffsets = useMemo(() => computeHandleOffsets(handles), [handles]);
  const handleStyles = useMemo(
    () => computeHandleStyles(handles, handleOffsets, color),
    [handles, handleOffsets, color]
  );

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div style={containerStyle}>
      {handles.map((h, i) => (
        <Handle
          key={`${h.type}-${h.id}`}
          type={h.type}
          position={positionMap[h.position] || Position.Left}
          id={`${id}-${h.id}`}
          style={handleStyles[i]}
        />
      ))}

      <div style={headerStyle}>
        {icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <button
          className="node-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
          style={DELETE_BTN_STYLE}
          title="Delete node"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.15)';
          }}
        >
          ✕
        </button>
      </div>

      <div style={bodyStyle}>
        {description && <div style={descriptionStyle}>{description}</div>}
        {fields.map((f) => (
          <NodeField
            key={f.name}
            field={f}
            value={fieldValues[f.name]}
            onChange={(val) => handleFieldChange(f.name, val)}
          />
        ))}
        {BodySlot && (
          <BodySlot
            id={id}
            data={data}
            fieldValues={fieldValues}
            onChange={handleFieldChange}
          />
        )}
      </div>
    </div>
  );
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createNode(config) {
  const NodeComponent = memo(({ id, data }) => (
    <BaseNode id={id} data={data} config={config} />
  ));
  NodeComponent.displayName = config.label ? `${config.label}Node` : 'CustomNode';
  return NodeComponent;
}
