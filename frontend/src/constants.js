export const HandleType = Object.freeze({
  SOURCE: "source",
  TARGET: "target",
});

export const HandlePosition = Object.freeze({
  LEFT: "left",
  RIGHT: "right",
  TOP: "top",
  BOTTOM: "bottom",
});

export const FieldType = Object.freeze({
  TEXT: "text",
  SELECT: "select",
  TEXTAREA: "textarea",
  NUMBER: "number",
  CHECKBOX: "checkbox",
});

export const EdgeType = Object.freeze({
  SMOOTHSTEP: "smoothstep",
});

export const NodeCategory = Object.freeze({
  CORE: "Core",
  TRANSFORM: "Transform",
  API: "API",
  LOGIC: "Logic",
  UTILITY: "Utility",
});

export const DRAG_TRANSFER_TYPE = "application/reactflow";
