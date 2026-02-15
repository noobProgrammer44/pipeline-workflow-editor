import { useMemo } from "react";
import { useStore } from "../../store";

export const HANDLE_BASE = {
  width: 12,
  height: 12,
  border: "2.5px solid #fff",
  boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
};

const btnStyle = {
  background: "rgba(0,0,0,0.15)",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  width: 18,
  height: 18,
  flexShrink: 0,
  transition: "background 0.1s ease",
  fontSize: 11,
  lineHeight: 1,
};

const iconWrapStyle = { display: "flex", alignItems: "center", flexShrink: 0 };
const labelSpanStyle = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const hoverIn = (e) => {
  e.currentTarget.style.background = "rgba(0,0,0,0.3)";
};
const hoverOut = (e) => {
  e.currentTarget.style.background = "rgba(0,0,0,0.15)";
};

const SettingsIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export function NodeShell({
  id,
  icon,
  label = "Node",
  color = "#64748B",
  width = 220,
  minHeight = 60,
  bodyPadding = "10px 12px",
  handles,
  children,
}) {
  const deleteNode = useStore((s) => s.deleteNode);
  const openContextMenu = useStore((s) => s.openContextMenu);

  const containerStyle = useMemo(
    () => ({
      width,
      minHeight,
      background: "#FFFFFF",
      borderRadius: 10,
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      fontFamily: "inherit",
      overflow: "visible",
      transition: "box-shadow 0.2s ease",
    }),
    [width, minHeight],
  );

  const headerStyle = useMemo(
    () => ({
      background: color,
      color: "#FFFFFF",
      padding: "8px 12px",
      borderRadius: "10px 10px 0 0",
      fontSize: 13,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 6,
      letterSpacing: "0.01em",
    }),
    [color],
  );

  const bodyStyleObj = useMemo(
    () => ({
      padding: bodyPadding,
      overflow: "hidden",
    }),
    [bodyPadding],
  );

  return (
    <div style={containerStyle}>
      {handles}

      <div style={headerStyle}>
        {icon && <span style={iconWrapStyle}>{icon}</span>}
        <span style={labelSpanStyle}>{label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            openContextMenu(rect.left, rect.bottom + 4, id);
          }}
          style={{ ...btnStyle, marginLeft: "auto" }}
          title="Node settings"
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          {SettingsIcon}
        </button>
        <button
          className="node-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
          style={btnStyle}
          title="Delete node"
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          ✕
        </button>
      </div>

      <div style={bodyStyleObj}>{children}</div>
    </div>
  );
}
