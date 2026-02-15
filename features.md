# VectorShift Pipeline Builder - Features

## Node Types (11)

### Core
- **Input** - Source node with configurable name and type (Text/File). Green.
- **LLM** - Language model processor with system and prompt inputs. Purple.
- **Output** - Sink node with configurable name and type (Text/Image). Blue.
- **Text** - Dynamic template node with `{{variable}}` syntax that auto-generates input handles per variable. Auto-resizing textarea with dynamic width. Amber.

### Transform
- **Filter** - Routes data based on condition (contains/equals/startsWith/regex). Outputs: passed, rejected. Cyan.
- **Merge** - Combines up to 3 inputs using concat, JSON object, or array strategy. Violet.

### API
- **HTTP Request** - Configurable method (GET/POST/PUT/DELETE), URL, and content type. Pink.

### Logic
- **Conditional** - If/else routing based on is_empty, is_not_empty, contains, or equals checks. Orange.

### Utility
- **Logger** - Debug logging passthrough with configurable level and tag. Slate.
- **Delay** - Pauses execution for a set duration (seconds). Indigo.
- **Note** - Freeform documentation with textarea and character count. Lime.

## Node Abstraction System

- **NodeShell** - Shared visual wrapper (container, header with icon/label/settings/delete, body area). Single source of truth for all node chrome.
- **BaseNode** - Configuration-driven renderer for standard nodes. Supports 5 field types: text, select, textarea, number, checkbox. Custom portal-based dropdown with keyboard navigation.
- **createNode(config)** - Factory that wraps BaseNode in memo for each node type. Adding a new node = one config object.
- **TextNode** - Custom component for dynamic variable-based handles, bypassing BaseNode but reusing NodeShell.

## Canvas

- Drag-and-drop node creation from sidebar
- Smoothstep edge connections with purple animated arrows and edge labels
- Grid snapping (20px)
- MiniMap with node-color coding
- Zoom controls
- Multi-select with Shift key
- Right-click context menu on nodes (Duplicate, Delete)
- Settings gear icon on every node header (opens context menu)
- Inline delete button on every node header

## Edges

- Custom DeletableEdge with 20px hover detection zone
- Hover highlight (thicker stroke)
- Selected state shows red delete button at midpoint
- Auto-generated labels from source handle name
- Cycle highlighting: edges turn red when part of a detected cycle

## TopBar

- Editable pipeline name
- Node search across type labels, IDs, and field values (max 8 results, keyboard navigable)
- Undo / Redo buttons with keyboard shortcuts
- Export pipeline as JSON file
- Clear canvas with confirmation modal

## Sidebar

- Collapsible node library (220px expanded, 44px collapsed)
- Search filter by node label
- Categorized sections (Core, Transform, API, Logic, Utility) with collapsible headers and count badges
- Drag nodes onto canvas to create

## StatusBar

- Live node and edge count
- Keyboard shortcut hints (Del, Ctrl+Z, Ctrl+D)
- **Run Pipeline** button with loading spinner
- **Clear Highlights** button (appears when cycle highlights are active)

## Pipeline Validation (Backend)

- **POST /pipelines/parse** endpoint (FastAPI + CORS for localhost:3000)
- Returns node count, edge count, and DAG validity
- **DAG check**: Kahn's topological sort algorithm
- **Cycle detection**: When not a DAG, identifies exact cycle-involved nodes and edges using iterative DFS + pruning (excludes downstream-of-cycle nodes)
- Response includes `cycles.cycle_path`, `cycles.cycle_node_ids`, `cycles.cycle_edges`

## Cycle Highlighting

- Result modal shows cycle details (affected node/edge count)
- "Highlight on Canvas" button turns cycle edges red and adds pulsing red border animation to cycle nodes
- Auto-pans/zooms to fit all affected nodes
- Auto-clears on any graph structural change (add/remove node or edge)
- Manual "Clear Highlights" button in status bar

## State Management (Zustand)

- Undo/Redo with 50-item history stack
- Toast notifications (success, error, warning, info) with 2.5s auto-dismiss
- Pipeline persistence: save/load to localStorage
- JSON export with timestamped filename
- Context menu state shared across components

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |
| Ctrl+D | Duplicate selected nodes |
| Delete | Delete selected nodes |
| Escape | Close menus, clear search |
| Arrow keys | Navigate search results / dropdowns |
| Enter | Confirm selection |
| Shift+Click | Multi-select |

## UI Polish

- Inter font family
- Purple accent color system with CSS custom properties
- Modal animations (overlay fade, panel scale)
- Toast slide-in animations
- Context menu scale-in animation
- Custom scrollbar styling
- Node hover glow and selection ring
- Handle scale-on-hover with glow
- Edge selection glow with drop shadow
