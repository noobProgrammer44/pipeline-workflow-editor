// nodes/index.js
// ═══════════════════════════════════════════════════════════════════════════════
// Single-file node registry. Every node in the pipeline editor is defined here.
//
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │  HOW TO ADD A NEW NODE:                                                    │
// │                                                                            │
// │  1. Add a config object to the `nodeConfigs` array below.                  │
// │  2. That's it. The toolbar, canvas, and drag-and-drop all pick it up.      │
// │                                                                            │
// │  Required keys:  type, label, category                                     │
// │  Optional keys:  icon, color, description, width, height, handles, fields  │
// │                  body (render prop for custom content — escape hatch)       │
// └─────────────────────────────────────────────────────────────────────────────┘

import { createNode } from "./BaseNode";
import { TextNode } from "./TextNode";
import {
  HandleType,
  HandlePosition,
  FieldType,
  NodeCategory,
} from "../constants";
import {
  InputIcon,
  LLMIcon,
  OutputIcon,
  TextIcon,
  FilterIcon,
  MergeIcon,
  HTTPIcon,
  ConditionalIcon,
  LoggerIcon,
  DelayIcon,
  NoteIcon,
} from "./NodeIcons";

// ─── Node Definitions ─────────────────────────────────────────────────────────

const nodeConfigs = [
  // ── Core Nodes ────────────────────────────────────────────────────────────

  {
    type: "customInput",
    label: "Input",
    icon: InputIcon,
    color: "#10B981",
    category: NodeCategory.CORE,
    handles: [
      { type: HandleType.SOURCE, position: HandlePosition.RIGHT, id: "value" },
    ],
    fields: [
      {
        type: FieldType.TEXT,
        name: "inputName",
        label: "Name",
        defaultFromId: (id) => id.replace("customInput-", "input_"),
      },
      {
        type: FieldType.SELECT,
        name: "inputType",
        label: "Type",
        default: "Text",
        options: ["Text", "File"],
      },
    ],
  },



  {
    type: "llm",
    label: "LLM",
    icon: LLMIcon,
    color: "#7C3AED",
    category: NodeCategory.CORE,
    description: "Processes text through a language model.",
    handles: [
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "system" },
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "prompt" },
      {
        type: HandleType.SOURCE,
        position: HandlePosition.RIGHT,
        id: "response",
      },
    ],
  },

  {
    type: "customOutput",
    label: "Output",
    icon: OutputIcon,
    color: "#3B82F6",
    category: NodeCategory.CORE,
    handles: [
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "value" },
    ],
    fields: [
      {
        type: FieldType.TEXT,
        name: "outputName",
        label: "Name",
        defaultFromId: (id) => id.replace("customOutput-", "output_"),
      },
      {
        type: FieldType.SELECT,
        name: "outputType",
        label: "Type",
        default: "Text",
        options: ["Text", "Image"],
      },
    ],
  },

  {
    type: "text",
    label: "Text",
    icon: TextIcon,
    color: "#F59E0B",
    category: NodeCategory.CORE,
    component: TextNode,
  },

  // ── Data Transformation ───────────────────────────────────────────────────

  {
    type: "filter",
    label: "Filter",
    icon: FilterIcon,
    color: "#06B6D4",
    category: NodeCategory.TRANSFORM,
    description: "Passes data through only if the condition matches.",
    handles: [
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "input" },
      { type: HandleType.SOURCE, position: HandlePosition.RIGHT, id: "passed" },
      {
        type: HandleType.SOURCE,
        position: HandlePosition.RIGHT,
        id: "rejected",
      },
    ],
    fields: [
      {
        type: FieldType.SELECT,
        name: "operator",
        label: "Operator",
        default: "contains",
        options: [
          { label: "Contains", value: "contains" },
          { label: "Equals", value: "equals" },
          { label: "Starts with", value: "startsWith" },
          { label: "Regex", value: "regex" },
        ],
      },
      {
        type: FieldType.TEXT,
        name: "condition",
        label: "Value",
        default: "",
        placeholder: "Match value or pattern",
      },
    ],
  },

  {
    type: "merge",
    label: "Merge",
    icon: MergeIcon,
    color: "#8B5CF6",
    category: NodeCategory.TRANSFORM,
    description: "Combines multiple inputs into one output.",
    handles: [
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "input_a" },
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "input_b" },
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "input_c" },
      { type: HandleType.SOURCE, position: HandlePosition.RIGHT, id: "merged" },
    ],
    fields: [
      {
        type: FieldType.SELECT,
        name: "strategy",
        label: "Strategy",
        default: "concat",
        options: [
          { label: "Concatenate", value: "concat" },
          { label: "JSON Object", value: "object" },
          { label: "Array", value: "array" },
        ],
      },
      {
        type: FieldType.TEXT,
        name: "separator",
        label: "Separator",
        default: "\\n",
        placeholder: "Used for concatenation",
      },
    ],
  },

  // ── API ───────────────────────────────────────────────────────────────────

  {
    type: "httpRequest",
    label: "HTTP Request",
    icon: HTTPIcon,
    color: "#EC4899",
    category: NodeCategory.API,
    handles: [
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "body" },
      {
        type: HandleType.SOURCE,
        position: HandlePosition.RIGHT,
        id: "response",
      },
    ],
    fields: [
      {
        type: FieldType.SELECT,
        name: "method",
        label: "Method",
        default: "GET",
        options: ["GET", "POST", "PUT", "DELETE"],
      },
      {
        type: FieldType.TEXT,
        name: "url",
        label: "URL",
        default: "",
        placeholder: "https://api.example.com/data",
      },
      {
        type: FieldType.SELECT,
        name: "contentType",
        label: "Content",
        default: "application/json",
        options: [
          { label: "JSON", value: "application/json" },
          { label: "Form Data", value: "multipart/form-data" },
          { label: "Plain Text", value: "text/plain" },
        ],
      },
    ],
  },

  // ── Logic ─────────────────────────────────────────────────────────────────

  {
    type: "conditional",
    label: "Conditional",
    icon: ConditionalIcon,
    color: "#F97316",
    category: NodeCategory.LOGIC,
    description: "Routes data based on a condition (if/else).",
    handles: [
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "input" },
      { type: HandleType.SOURCE, position: HandlePosition.RIGHT, id: "true" },
      { type: HandleType.SOURCE, position: HandlePosition.RIGHT, id: "false" },
    ],
    fields: [
      {
        type: FieldType.SELECT,
        name: "condition",
        label: "Check",
        default: "is_empty",
        options: [
          { label: "Is empty", value: "is_empty" },
          { label: "Is not empty", value: "is_not_empty" },
          { label: "Contains", value: "contains" },
          { label: "Equals", value: "equals" },
        ],
      },
      {
        type: FieldType.TEXT,
        name: "compareValue",
        label: "Value",
        default: "",
        placeholder: "Comparison value",
      },
    ],
  },

  // ── Utility ───────────────────────────────────────────────────────────────

  {
    type: "logger",
    label: "Logger",
    icon: LoggerIcon,
    color: "#64748B",
    category: NodeCategory.UTILITY,
    description: "Logs data for debugging. Passes input through unchanged.",
    handles: [
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "input" },
      { type: HandleType.SOURCE, position: HandlePosition.RIGHT, id: "output" },
    ],
    fields: [
      {
        type: FieldType.SELECT,
        name: "logLevel",
        label: "Level",
        default: "info",
        options: [
          { label: "Debug", value: "debug" },
          { label: "Info", value: "info" },
          { label: "Warning", value: "warn" },
          { label: "Error", value: "error" },
        ],
      },
      {
        type: FieldType.TEXT,
        name: "tag",
        label: "Tag",
        default: "",
        placeholder: "Optional label for log output",
      },
    ],
  },

  {
    type: "delay",
    label: "Delay",
    icon: DelayIcon,
    color: "#6366F1",
    category: NodeCategory.UTILITY,
    description: "Pauses execution for a set duration.",
    handles: [
      { type: HandleType.TARGET, position: HandlePosition.LEFT, id: "input" },
      { type: HandleType.SOURCE, position: HandlePosition.RIGHT, id: "output" },
    ],
    fields: [
      {
        type: FieldType.NUMBER,
        name: "seconds",
        label: "Seconds",
        default: 1,
        min: 0,
        step: 0.1,
      },
      {
        type: FieldType.TEXT,
        name: "label",
        label: "Label",
        default: "",
        placeholder: "Optional label",
      },
    ],
  },

  {
    type: "note",
    label: "Note",
    icon: NoteIcon,
    color: "#84CC16",
    category: NodeCategory.UTILITY,
    description: "Freeform note with character count (body slot demo).",
    handles: [
      { type: HandleType.SOURCE, position: HandlePosition.RIGHT, id: "output" },
    ],
    fields: [
      {
        type: FieldType.TEXT,
        name: "title",
        label: "Title",
        default: "Untitled",
      },
    ],
    body: ({ fieldValues, onChange }) => {
      const content = fieldValues.content || "";
      return (
        <div style={{ marginTop: 4 }}>
          <textarea
            value={content}
            onChange={(e) => onChange("content", e.target.value)}
            placeholder="Write anything..."
            rows={3}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #E2E8F0",
              borderRadius: 6,
              fontSize: 12,
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
              background: "#F8FAFC",
              color: "#1E293B",
              outline: "none",
            }}
          />
          <div
            style={{
              fontSize: 10,
              color: "#94A3B8",
              textAlign: "right",
              marginTop: 2,
            }}
          >
            {content.length} chars
          </div>
        </div>
      );
    },
  },
];

// ─── Auto-generated exports (never edit below this line) ──────────────────────

export const nodeTypes = Object.fromEntries(
  nodeConfigs.map((config) => [config.type, config.component || createNode(config)]),
);

export const nodeList = nodeConfigs.map(({ type, label, icon, category, color }) => ({
  type,
  label,
  icon,
  category,
  color,
}));

export const NODE_CATEGORIES = [
  "All",
  ...Object.values(NodeCategory),
];
