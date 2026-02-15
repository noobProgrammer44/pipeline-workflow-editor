import { useState, useEffect, useMemo, useRef, memo } from "react";
import { Handle, Position } from "reactflow";
import { useStore } from "../../store";
import { TextIcon } from "./NodeIcons";
import { NodeShell, HANDLE_BASE } from "./NodeShell";

const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
const MIN_WIDTH = 260;
const MAX_WIDTH = 420;
const HEADER_H = 34;
const BODY_PAD = 10;
const VAR_ROW_H = 26;
const CHAR_W = 7.2;
const NODE_COLOR = "#F59E0B";

const varRowStyle = {
  display: "flex",
  alignItems: "center",
  height: VAR_ROW_H,
};

const varBadgeStyle = {
  fontSize: 11,
  fontWeight: 500,
  color: "#92400E",
  background: "#FFFBEB",
  border: "1px solid #FDE68A",
  borderRadius: 4,
  padding: "2px 8px",
  lineHeight: 1.3,
};

const textareaBase = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  fontSize: 12,
  fontFamily: "inherit",
  resize: "none",
  boxSizing: "border-box",
  background: "#F8FAFC",
  color: "#1E293B",
  outline: "none",
  overflow: "hidden",
  lineHeight: 1.5,
  transition: "border-color 0.15s ease",
  minHeight: 36,
};

export function parseVariables(text) {
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

function TextNodeInner({ id, data }) {
  const textareaRef = useRef(null);
  const [text, setText] = useState(data?.text ?? "{{input}}");

  const updateNodeField = useStore((s) => s.updateNodeField);

  useEffect(() => {
    updateNodeField(id, "text", text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const variables = useMemo(() => parseVariables(text), [text]);

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

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [text]);

  const nodeWidth = useMemo(() => {
    const lines = text.split("\n");
    const longest = Math.max(...lines.map((l) => l.length), 0);
    return Math.min(Math.max(MIN_WIDTH, longest * CHAR_W + 48), MAX_WIDTH);
  }, [text]);

  const handleChange = (e) => {
    setText(e.target.value);
    updateNodeField(id, "text", e.target.value);
  };

  const handleElements = (
    <>
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{ ...HANDLE_BASE, background: NODE_COLOR, right: -6 }}
      />
      {variables.map((v, i) => (
        <Handle
          key={v}
          type="target"
          position={Position.Left}
          id={`${id}-${v}`}
          style={{
            ...HANDLE_BASE,
            background: "#CBD5E1",
            left: -6,
            top: HEADER_H + BODY_PAD + i * VAR_ROW_H + VAR_ROW_H / 2,
          }}
        />
      ))}
    </>
  );

  return (
    <NodeShell
      id={id}
      icon={TextIcon}
      label="Text"
      color={NODE_COLOR}
      width={nodeWidth}
      handles={handleElements}
    >
      {variables.map((v) => (
        <div key={v} style={varRowStyle}>
          <span style={varBadgeStyle}>{v}</span>
        </div>
      ))}

      <textarea
        ref={textareaRef}
        className="nodrag nowheel"
        value={text}
        onChange={handleChange}
        placeholder={"Type text with {{ variables }}..."}
        style={{
          ...textareaBase,
          marginTop: variables.length > 0 ? 6 : 0,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = NODE_COLOR;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E2E8F0";
        }}
      />
    </NodeShell>
  );
}

TextNodeInner.displayName = "TextNode";
export const TextNode = memo(TextNodeInner);
