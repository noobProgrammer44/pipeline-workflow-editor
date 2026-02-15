// TextNode.js
// Dynamic Text node with auto-resize textarea and variable-based handles.
// Variables using {{ name }} syntax create input handles on the left side.

import { useState, useEffect, useMemo, useRef, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { TextIcon } from './NodeIcons';

// ─── Constants ──────────────────────────────────────────────────────────────

const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
const MIN_WIDTH = 260;
const MAX_WIDTH = 420;
const HEADER_H = 34;
const BODY_PAD = 10;
const VAR_ROW_H = 26;
const CHAR_W = 7.2;
const NODE_COLOR = '#F59E0B';

// ─── Styles ─────────────────────────────────────────────────────────────────

const containerBase = {
  background: '#FFFFFF',
  borderRadius: 10,
  border: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  fontFamily: 'inherit',
  overflow: 'visible',
  transition: 'box-shadow 0.2s ease',
};

const headerStyle = {
  background: NODE_COLOR,
  color: '#FFFFFF',
  padding: '8px 12px',
  borderRadius: '10px 10px 0 0',
  fontSize: 13,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  letterSpacing: '0.01em',
};

const btnStyle = {
  background: 'rgba(0,0,0,0.15)',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  width: 18,
  height: 18,
  flexShrink: 0,
  transition: 'background 0.1s ease',
  fontSize: 11,
  lineHeight: 1,
};

const bodyStyle = {
  padding: '10px 12px',
};

const varRowStyle = {
  display: 'flex',
  alignItems: 'center',
  height: VAR_ROW_H,
};

const varBadgeStyle = {
  fontSize: 11,
  fontWeight: 500,
  color: '#92400E',
  background: '#FFFBEB',
  border: '1px solid #FDE68A',
  borderRadius: 4,
  padding: '2px 8px',
  lineHeight: 1.3,
};

const textareaBase = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #E2E8F0',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: 'inherit',
  resize: 'none',
  boxSizing: 'border-box',
  background: '#F8FAFC',
  color: '#1E293B',
  outline: 'none',
  overflow: 'hidden',
  lineHeight: 1.5,
  transition: 'border-color 0.15s ease',
  minHeight: 36,
};

const handleBase = {
  width: 12,
  height: 12,
  border: '2.5px solid #fff',
  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
};

// ─── SVG Icons ──────────────────────────────────────────────────────────────

const SettingsIcon = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseVariables(text) {
  const vars = [];
  const seen = new Set();
  let match;
  const re = new RegExp(VAR_REGEX.source, VAR_REGEX.flags);
  while ((match = re.exec(text)) !== null) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      vars.push(match[1]);
    }
  }
  return vars;
}

// ─── Component ──────────────────────────────────────────────────────────────

function TextNodeInner({ id, data }) {
  const textareaRef = useRef(null);
  const [text, setText] = useState(data?.text ?? '{{input}}');

  const updateNodeField = useStore((s) => s.updateNodeField);
  const deleteNode = useStore((s) => s.deleteNode);
  const openContextMenu = useStore((s) => s.openContextMenu);

  // Sync initial text to store
  useEffect(() => {
    updateNodeField(id, 'text', text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Parse variables ──────────────────────────────────────────────────────

  const variables = useMemo(() => parseVariables(text), [text]);

  // ── Edge cleanup when variables are removed ──────────────────────────────

  const prevVarsRef = useRef(variables);
  useEffect(() => {
    const prev = prevVarsRef.current;
    const currSet = new Set(variables);
    const removed = prev.filter((v) => !currSet.has(v));

    if (removed.length > 0) {
      const handleIds = new Set(removed.map((v) => `${id}-${v}`));
      useStore.setState((state) => ({
        edges: state.edges.filter((e) => !handleIds.has(e.targetHandle)),
      }));
    }
    prevVarsRef.current = variables;
  }, [variables, id]);

  // ── Auto-resize textarea ─────────────────────────────────────────────────

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [text]);

  // ── Dynamic width ────────────────────────────────────────────────────────

  const nodeWidth = useMemo(() => {
    const lines = text.split('\n');
    const longest = Math.max(...lines.map((l) => l.length), 0);
    return Math.min(Math.max(MIN_WIDTH, longest * CHAR_W + 48), MAX_WIDTH);
  }, [text]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    setText(e.target.value);
    updateNodeField(id, 'text', e.target.value);
  };

  const hoverIn = (e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; };
  const hoverOut = (e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ ...containerBase, width: nodeWidth, minHeight: 60 }}>
      {/* ── Output handle (right, centered) ────────────────────────── */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{ ...handleBase, background: NODE_COLOR, right: -6 }}
      />

      {/* ── Variable handles (left, aligned with label rows) ─────── */}
      {variables.map((v, i) => (
        <Handle
          key={v}
          type="target"
          position={Position.Left}
          id={`${id}-${v}`}
          style={{
            ...handleBase,
            background: '#CBD5E1',
            left: -6,
            top: HEADER_H + BODY_PAD + i * VAR_ROW_H + VAR_ROW_H / 2,
          }}
        />
      ))}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={headerStyle}>
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{TextIcon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Text
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            openContextMenu(rect.left, rect.bottom + 4, id);
          }}
          style={{ ...btnStyle, marginLeft: 'auto' }}
          title="Node settings"
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          {SettingsIcon}
        </button>
        <button
          className="node-delete-btn"
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
          style={btnStyle}
          title="Delete node"
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          ✕
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div style={bodyStyle}>
        {/* Variable label rows — aligned with left-side handles */}
        {variables.map((v) => (
          <div key={v} style={varRowStyle}>
            <span style={varBadgeStyle}>{v}</span>
          </div>
        ))}

        {/* Textarea with auto-resize */}
        <textarea
          ref={textareaRef}
          className="nodrag nowheel"
          value={text}
          onChange={handleChange}
          placeholder={'Type text with {{ variables }}...'}
          style={{
            ...textareaBase,
            marginTop: variables.length > 0 ? 6 : 0,
          }}
          onFocus={(e) => { e.target.style.borderColor = NODE_COLOR; }}
          onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; }}
        />
      </div>
    </div>
  );
}

TextNodeInner.displayName = 'TextNode';
export const TextNode = memo(TextNodeInner);
