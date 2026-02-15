// BaseNode.js
// Configuration-driven base component for all pipeline nodes.

import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { HandleType, HandlePosition, FieldType } from '../constants';
import { NodeShell, HANDLE_BASE } from './NodeShell';

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

const SELECT_TRIGGER_STYLE = {
  ...INPUT_STYLE,
  cursor: 'pointer',
  appearance: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingRight: 8,
  userSelect: 'none',
  position: 'relative',
};

const SELECT_DROPDOWN_BASE = {
  position: 'fixed',
  background: '#FFFFFF',
  borderRadius: 7,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
  padding: 3,
  zIndex: 1000,
  maxHeight: 160,
  overflowY: 'auto',
  animation: 'contextMenuIn 0.1s ease',
};

const SELECT_OPTION_STYLE = {
  display: 'block',
  width: '100%',
  padding: '5px 8px',
  border: 'none',
  background: 'transparent',
  borderRadius: 5,
  fontSize: 12,
  color: '#1E293B',
  fontFamily: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.1s ease',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  boxSizing: 'border-box',
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

// ─── Chevron SVG ─────────────────────────────────────────────────────────────

const ChevronDown = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// ─── CustomSelect ────────────────────────────────────────────────────────────

function CustomSelect({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [dropPos, setDropPos] = useState(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const normalized = useMemo(
    () => (options || []).map((o) => (typeof o === 'string' ? { label: o, value: o } : o)),
    [options],
  );

  const selectedLabel = normalized.find((o) => o.value === value)?.label || value || '';

  const close = useCallback(() => { setOpen(false); setActiveIdx(-1); setDropPos(null); }, []);

  const openDropdown = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 3, left: rect.left, width: rect.width });
    }
    setOpen(true);
    setActiveIdx(normalized.findIndex((o) => o.value === value));
  }, [normalized, value]);

  // Close on outside click — check both trigger and portal dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i < normalized.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i > 0 ? i - 1 : normalized.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (normalized[activeIdx]) {
        onChange(normalized[activeIdx].value);
      }
      close();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  const dropdown = open && dropPos ? createPortal(
    <div
      ref={dropdownRef}
      style={{
        ...SELECT_DROPDOWN_BASE,
        top: dropPos.top,
        left: dropPos.left,
        width: dropPos.width,
      }}
    >
      {normalized.map((opt, i) => {
        const isSelected = opt.value === value;
        const isActive = i === activeIdx;
        return (
          <button
            key={opt.value}
            style={{
              ...SELECT_OPTION_STYLE,
              background: isActive ? '#F5F3FF' : 'transparent',
              color: isSelected ? '#7C3AED' : '#1E293B',
              fontWeight: isSelected ? 600 : 400,
            }}
            onMouseEnter={() => setActiveIdx(i)}
            onMouseDown={(e) => {
              e.preventDefault();
              onChange(opt.value);
              close();
            }}
          >
            {isSelected && (
              <span style={{ marginRight: 4, fontSize: 10 }}>&#10003;</span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>,
    document.body,
  ) : null;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        ref={triggerRef}
        tabIndex={0}
        role="combobox"
        aria-expanded={open}
        onClick={() => { if (open) { close(); } else { openDropdown(); } }}
        onKeyDown={handleKeyDown}
        style={{
          ...SELECT_TRIGGER_STYLE,
          borderColor: open ? '#7C3AED' : '#E2E8F0',
          background: open ? '#FFFFFF' : '#F8FAFC',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel}
        </span>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          color: '#94A3B8',
          transition: 'transform 0.15s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          flexShrink: 0,
        }}>
          {ChevronDown}
        </span>
      </div>
      {dropdown}
    </div>
  );
}

// ─── NodeField ────────────────────────────────────────────────────────────────

function NodeField({ field, value, onChange }) {
  switch (field.type) {
    case FieldType.SELECT:
      return (
        <div style={FIELD_STYLE}>
          <label style={LABEL_STYLE}>{field.label}:</label>
          <CustomSelect options={field.options} value={value} onChange={onChange} />
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
  return handles.map((h, i) => {
    // Center the 12px handle on the node border edge
    const edgeOffset = {};
    if (h.position === HandlePosition.LEFT) edgeOffset.left = -6;
    if (h.position === HandlePosition.RIGHT) edgeOffset.right = -6;
    if (h.position === HandlePosition.TOP) edgeOffset.top = -6;
    if (h.position === HandlePosition.BOTTOM) edgeOffset.bottom = -6;

    return {
      ...HANDLE_BASE,
      background: h.type === HandleType.SOURCE ? color : '#CBD5E1',
      ...edgeOffset,
      ...(offsets[i] != null ? { top: offsets[i] } : undefined),
      ...h.style,
    };
  });
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

  const handleElements = handles.map((h, i) => (
    <Handle
      key={`${h.type}-${h.id}`}
      type={h.type}
      position={positionMap[h.position] || Position.Left}
      id={`${id}-${h.id}`}
      style={handleStyles[i]}
    />
  ));

  return (
    <NodeShell
      id={id}
      icon={icon}
      label={label}
      color={color}
      width={width}
      minHeight={height === 'auto' ? 60 : height}
      bodyPadding={(fields.length > 0 || BodySlot) ? '10px 12px' : '8px 12px'}
      handles={handleElements}
    >
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
    </NodeShell>
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
