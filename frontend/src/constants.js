// constants.js
// Centralized enums and constants for the pipeline editor.
// All magic strings live here — consumers import named constants.

// ─── Handle Types ────────────────────────────────────────────────────────────

export const HandleType = Object.freeze({
  SOURCE: 'source',
  TARGET: 'target',
});

// ─── Handle Positions ────────────────────────────────────────────────────────

export const HandlePosition = Object.freeze({
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom',
});

// ─── Field Types ─────────────────────────────────────────────────────────────

export const FieldType = Object.freeze({
  TEXT: 'text',
  SELECT: 'select',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  CHECKBOX: 'checkbox',
});

// ─── Edge / Connection Types ─────────────────────────────────────────────────

export const EdgeType = Object.freeze({
  SMOOTHSTEP: 'smoothstep',
});

// ─── Node Categories ─────────────────────────────────────────────────────────

export const NodeCategory = Object.freeze({
  CORE: 'Core',
  TRANSFORM: 'Transform',
  API: 'API',
  LOGIC: 'Logic',
  UTILITY: 'Utility',
});

// ─── Drag & Drop ─────────────────────────────────────────────────────────────

export const DRAG_TRANSFER_TYPE = 'application/reactflow';
