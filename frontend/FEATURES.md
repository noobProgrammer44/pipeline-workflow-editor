# VectorShift Pipeline Builder — Feature Documentation

## Architecture

### Node Abstraction System

A **configuration-driven factory system** replaces per-node boilerplate. Every node is a plain config object — the framework handles rendering, state, store sync, and connections.

**Before:** 4 nodes across 4 files, local `useState` only (data lost on submit), 4 touch-points to add a node.
**After:** 11 nodes in a single registry, all field values auto-persisted to Zustand, 1 touch-point to add a node.

| Metric | Before | After |
|--------|--------|-------|
| Files per node | 1 file + 3 edits | 0 (config in registry) |
| Lines to add a node | ~43 | ~20 |
| Node types | 4 | 11 |
| Registration touch-points | 4 | 1 |

### Enum / Constants System

All magic strings replaced with frozen enum objects in `constants.js`:

- `HandleType` — `SOURCE`, `TARGET`
- `HandlePosition` — `LEFT`, `RIGHT`, `TOP`, `BOTTOM`
- `FieldType` — `TEXT`, `SELECT`, `TEXTAREA`, `NUMBER`, `CHECKBOX`
- `EdgeType` — `SMOOTHSTEP`
- `NodeCategory` — `CORE`, `TRANSFORM`, `API`, `LOGIC`, `UTILITY`
- `DRAG_TRANSFER_TYPE` — drag-and-drop MIME type

### Design System

Production-ready styling with a centralized design token system in `index.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#7C3AED` | Primary purple |
| `--bg-canvas` | `#FAFBFE` | Canvas background |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--border` | `#E2E8F0` | Default borders |
| `--text-primary` | `#1E293B` | Main text |
| `--shadow-sm` | layered | Subtle node shadow |
| `--shadow-node-selected` | purple ring | Selected node glow |

Typography: Inter font, 11-15px scale. Spacing: 2-32px scale.

### Performance

| Optimization | Impact |
|---|---|
| `React.memo` on factory output | Only interacted node re-renders |
| Batch `updateNodeFields` | 1 store update on mount instead of N |
| Module-level style constants | Zero allocations per render |
| `useMemo` on all computed styles | Computed once per node lifetime |
| Precomputed handle offsets/styles | Built once via `useMemo` |
| Functional `set()` in Zustand | No stale reads in rapid-fire updates |
| Immutable store updates | React Flow detects changes correctly |

---

## Application Layout

```
+-----------------------------------------------------------+
| [V] Pipeline Name      [Undo][Redo]  [Save][Export][Clear]|  TopBar
+----------+------------------------------------------------+
|          |                                                |
| SIDEBAR  |              CANVAS                            |
|          |                                                |
| [Search] |   Nodes + edges + minimap + controls           |
|          |                                                |
| > Core   |   Right-click: context menu (Delete/Duplicate) |
|   Input  |                                                |
|   LLM    |   Keyboard: Del, Ctrl+Z, Ctrl+D               |
|   Output |                                                |
|   Text   |                                                |
|          |                                                |
| > Trans  |                                                |
| > API    |                                                |
| > Logic  |                                                |
| > Util   |                                                |
+----------+------------------------------------------------+
| * 3 nodes * 2 edges   [Del][Ctrl+Z][Ctrl+D]  [> Run]     |  StatusBar
+-----------------------------------------------------------+
```

Components: `TopBar.js`, `Sidebar.js`, `ui.js` (canvas), `StatusBar.js`, `Toast.js`, `ContextMenu.js`, `ConfirmModal.js`

---

## User-Facing Features

### Canvas

- **Snap-to-grid** (20px)
- **Animated edges** — purple smoothstep curves with arrow markers
- **MiniMap** — pannable, zoomable, bottom-right
- **Zoom/pan controls** — bottom-left
- **Multi-select** — Shift+click or drag selection (purple rectangle)
- **Selected node glow** — purple ring via CSS
- **Node hover shadow** — subtle shadow increase on hover
- **Handle hover** — 1.4x scale with purple halo

### Node Management

- **Delete button** — X appears in node header on hover
- **Delete key** — removes selected nodes (with undo history)
- **Right-click context menu** — Delete, Duplicate with shortcut hints
- **Ctrl+D** — duplicate selected nodes (offset 50px)
- **Undo / Redo** — Ctrl+Z / Ctrl+Shift+Z, 50-step history stack
- History auto-pushes before: add node, delete, connect, drop

### Node Library (Sidebar)

- **Search** — filters nodes by name across all categories
- **Collapsible sections** — Core, Transform, API, Logic, Utility
- **Node count badges** — per category
- **Drag-and-drop** — drag from sidebar onto canvas
- Sections auto-expand when searching

### Top Bar

- **Editable pipeline name** — click to edit, Enter to confirm
- **Undo / Redo buttons** — disabled state when stack is empty
- **Save** — persists to localStorage
- **Export** — downloads pipeline as JSON file
- **Clear** — custom confirmation modal, irreversible (wipes undo history)

### Status Bar

- **Live counts** — nodes and edges
- **Keyboard shortcut hints** — Del, Ctrl+Z, Ctrl+D
- **Run Pipeline** — loading spinner, success toast with stats

### Notifications

- **Toast system** — auto-dismissing (2.5s), 4 types: success (green), error (red), warning (amber), info (dark)
- Triggered on: save, export, clear, undo, redo, delete, duplicate, run

### Confirmation Modal

- **Custom popup** — replaces native `window.confirm`
- Blurred backdrop, animated panel (scale + fade)
- Close on: Escape, click outside, Cancel button
- Confirm on: Enter key or confirm button

---

## Available Node Types

### Core
| Node | Icon | Color | Description |
|------|------|-------|-------------|
| Input | 📥 | `#10B981` | Pipeline input variable (text or file) |
| LLM | 🤖 | `#7C3AED` | Language model processing (system + prompt) |
| Output | 📤 | `#3B82F6` | Pipeline output variable (text or image) |
| Text | 📝 | `#F59E0B` | Static/template text with `{{variable}}` interpolation |

### Transform
| Node | Icon | Color | Description |
|------|------|-------|-------------|
| Filter | 🔍 | `#06B6D4` | Routes data by condition (contains, equals, startsWith, regex) |
| Merge | 🔗 | `#8B5CF6` | Combines up to 3 inputs (concatenate, JSON object, array) |

### API
| Node | Icon | Color | Description |
|------|------|-------|-------------|
| HTTP Request | 🌐 | `#EC4899` | Configurable API calls (GET/POST/PUT/DELETE) |

### Logic
| Node | Icon | Color | Description |
|------|------|-------|-------------|
| Conditional | 🔀 | `#F97316` | If/else branching with true/false outputs |

### Utility
| Node | Icon | Color | Description |
|------|------|-------|-------------|
| Logger | 📋 | `#64748B` | Debug passthrough with log level and tags |
| Delay | ⏱️ | `#6366F1` | Pauses execution for a set duration |
| Note | 🗒️ | `#84CC16` | Freeform annotation with live character count |

---

## Developer Experience

### Adding a New Node

Open `frontend/src/nodes/index.js` and add one object:

```js
{
  type: 'delay',
  label: 'Delay',
  icon: '⏱️',
  color: '#9E9E9E',
  category: NodeCategory.UTILITY,
  description: 'Pauses execution for a set duration.',
  handles: [
    { type: HandleType.TARGET, position: HandlePosition.LEFT, id: 'input' },
    { type: HandleType.SOURCE, position: HandlePosition.RIGHT, id: 'output' },
  ],
  fields: [
    { type: FieldType.NUMBER, name: 'ms', label: 'Delay (ms)', default: 1000 },
  ],
},
```

That's it. Sidebar, canvas, drag-and-drop, category filtering — all automatic.

### Built-in Field Types

| Type | Renders | Config |
|------|---------|--------|
| `FieldType.TEXT` | Text input | `placeholder` |
| `FieldType.SELECT` | Dropdown (custom chevron) | `options` (strings or `{label, value}`) |
| `FieldType.TEXTAREA` | Multi-line text | `placeholder`, `rows` |
| `FieldType.NUMBER` | Numeric input | `min`, `max`, `step`, `placeholder` |
| `FieldType.CHECKBOX` | Toggle (purple accent) | — |

### Escape Hatch: `body` Render Prop

For custom UI beyond the 5 field types:

```js
body: ({ fieldValues, onChange }) => (
  <input
    type="color"
    value={fieldValues.hex}
    onChange={(e) => onChange('hex', e.target.value)}
  />
),
```

Receives `{ id, data, fieldValues, onChange }` — same store contract as built-in fields.

---

## File Structure

```
frontend/src/
├── App.js              — Layout: TopBar + Sidebar + Canvas + StatusBar
├── TopBar.js           — Pipeline name, undo/redo, save/export/clear
├── Sidebar.js          — Searchable categorized node library
├── StatusBar.js        — Node/edge counts, shortcuts, Run button
├── ui.js               — React Flow canvas, keyboard shortcuts, context menu
├── store.js            — Zustand store (CRUD, history, persistence, toasts)
├── constants.js        — Enums: HandleType, FieldType, NodeCategory, etc.
├── draggableNode.js    — Drag-and-drop node card for sidebar
├── ContextMenu.js      — Right-click menu (delete, duplicate)
├── ConfirmModal.js     — Custom confirmation popup
├── Toast.js            — Auto-dismissing notifications
├── index.css           — Design tokens, globals, React Flow overrides, animations
└── nodes/
    ├── BaseNode.js     — Rendering engine + createNode() factory
    └── index.js        — Single-file node registry (11 configs)
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` | Delete selected nodes |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+D` | Duplicate selected |
| `Shift+Click` | Multi-select nodes |
| `Escape` | Close context menu / modal |
| `Enter` | Confirm modal |

---

## Bugs Fixed from Original Codebase

1. **State mutation in `updateNodeField`** — mutated node in-place, React Flow skipped re-renders
2. **Data never persisted to store** — `useState` only, lost on submit
3. **`console.log("Hi")` in `onNodesChange`** — hundreds of writes/sec during drag
4. **`"100wv"` invalid CSS** — fixed to `"100vw"`
5. **Incomplete `onDrop` dependency array** — missing `getNodeID`, `addNode`
6. **`nodeIDs` not initialized** — added explicit `{}` default
7. **Style objects recreated every render** — extracted to module-level constants + `useMemo`
8. **Stale-state reads** — all Zustand actions switched to functional `set()`
