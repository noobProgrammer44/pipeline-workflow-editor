// store.js

import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";


const MAX_HISTORY = 50;
const TOAST_DURATION_MS = 2500;
const DUPLICATE_OFFSET = 50;

const EDGE_STYLE = { stroke: "#7C3AED", strokeWidth: 2 };
const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  color: "#7C3AED",
  width: 16,
  height: 16,
};

export const useStore = create((set, get) => ({
  // ── Core state ──────────────────────────────────────────────────────────

  nodes: [],
  edges: [],
  nodeIDs: {},

  // ── Pipeline metadata ───────────────────────────────────────────────────

  pipelineName: "Untitled Pipeline",
  setPipelineName: (name) => set({ pipelineName: name }),

  // ── History (undo / redo) ───────────────────────────────────────────────

  history: [],
  future: [],

  pushHistory: () => {
    set((state) => ({
      history: [
        ...state.history,
        { nodes: state.nodes, edges: state.edges },
      ].slice(-MAX_HISTORY),
      future: [],
    }));
  },

  undo: () => {
    if (get().history.length === 0) return;
    set((state) => {
      const previous = state.history[state.history.length - 1];
      return {
        history: state.history.slice(0, -1),
        future: [{ nodes: state.nodes, edges: state.edges }, ...state.future],
        nodes: previous.nodes,
        edges: previous.edges,
      };
    });
    get().addToast("Undo", "info");
  },

  redo: () => {
    if (get().future.length === 0) return;
    set((state) => {
      const next = state.future[0];
      return {
        future: state.future.slice(1),
        history: [...state.history, { nodes: state.nodes, edges: state.edges }],
        nodes: next.nodes,
        edges: next.edges,
      };
    });
    get().addToast("Redo", "info");
  },

  // ── Toast notifications ─────────────────────────────────────────────────

  toasts: [],

  addToast: (message, type = "info") => {
    const id = Date.now() + Math.random();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, TOAST_DURATION_MS);
  },

  // ── Node ID generation ──────────────────────────────────────────────────

  getNodeID: (type) => {
    const prevIDs = get().nodeIDs;
    const next = (prevIDs[type] ?? 0) + 1;
    set({ nodeIDs: { ...prevIDs, [type]: next } });
    return `${type}-${next}`;
  },

  // ── Node CRUD ───────────────────────────────────────────────────────────

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },

  deleteNode: (nodeId) => {
    if (get().cycleHighlight) get().clearCycleHighlights();
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      ),
    }));
    get().addToast("Node deleted", "info");
  },

  deleteSelectedNodes: () => {
    const selected = get().nodes.filter((n) => n.selected);
    if (selected.length === 0) return;
    const ids = new Set(selected.map((n) => n.id));
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => !ids.has(n.id)),
      edges: state.edges.filter(
        (e) => !ids.has(e.source) && !ids.has(e.target),
      ),
    }));
    get().addToast(
      `Deleted ${selected.length} node${selected.length > 1 ? "s" : ""}`,
      "info",
    );
  },

  deleteEdge: (edgeId) => {
    if (get().cycleHighlight) get().clearCycleHighlights();
    get().pushHistory();
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    }));
    get().addToast("Edge deleted", "info");
  },

  duplicateSelectedNodes: () => {
    set((state) => {
      const selected = state.nodes.filter((n) => n.selected);
      if (selected.length === 0) return state;

      let nodeIDs = { ...state.nodeIDs };
      const newNodes = selected.map((node) => {
        const next = (nodeIDs[node.type] ?? 0) + 1;
        nodeIDs[node.type] = next;
        const newId = `${node.type}-${next}`;
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + DUPLICATE_OFFSET,
            y: node.position.y + DUPLICATE_OFFSET,
          },
          selected: false,
          data: { ...node.data, id: newId },
        };
      });

      return {
        history: [
          ...state.history,
          { nodes: state.nodes, edges: state.edges },
        ].slice(-MAX_HISTORY),
        future: [],
        nodeIDs,
        nodes: [
          ...state.nodes.map((n) => ({ ...n, selected: false })),
          ...newNodes,
        ],
      };
    });
    get().addToast("Node duplicated", "success");
  },

  // ── React Flow handlers ─────────────────────────────────────────────────

  onNodesChange: (changes) => {
    if (
      get().cycleHighlight &&
      changes.some((c) => c.type === "remove" || c.type === "add")
    ) {
      get().clearCycleHighlights();
    }
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    if (
      get().cycleHighlight &&
      changes.some((c) => c.type === "remove" || c.type === "add")
    ) {
      get().clearCycleHighlights();
    }
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    if (get().cycleHighlight) get().clearCycleHighlights();
    // Extract handle name from sourceHandle (format: "nodeId-handleName")
    const label = connection.sourceHandle
      ? connection.sourceHandle.replace(connection.source + "-", "")
      : "";
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          type: "deletable",
          animated: true,
          style: EDGE_STYLE,
          markerEnd: EDGE_MARKER,
          label,
        },
        state.edges,
      ),
    }));
  },

  // ── Field updates ───────────────────────────────────────────────────────

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, [fieldName]: fieldValue } };
        }
        return node;
      }),
    }));
  },

  updateNodeFields: (nodeId, fields) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...fields } };
        }
        return node;
      }),
    }));
  },

  // ── React Flow instance ────────────────────────────────────────────────

  reactFlowInstance: null,
  setReactFlowInstance: (instance) => set({ reactFlowInstance: instance }),

  focusNode: (nodeId) => {
    const { nodes, reactFlowInstance } = get();
    if (!reactFlowInstance) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Select only the target node
    set({
      nodes: nodes.map((n) => ({
        ...n,
        selected: n.id === nodeId,
      })),
    });

    // Pan + zoom to the node
    const width = node.width || 220;
    const height = node.height || 120;
    reactFlowInstance.fitBounds(
      { x: node.position.x, y: node.position.y, width, height },
      { padding: 0.5, duration: 400 },
    );
  },

  // ── Cycle highlighting ────────────────────────────────────────────────

  cycleHighlight: null,

  highlightCycles: (cycleInfo) => {
    const nodeIdSet = new Set(cycleInfo.cycle_node_ids);
    const edgeKeySet = new Set(
      cycleInfo.cycle_edges.map(([s, t]) => `${s}->${t}`),
    );

    set((state) => ({
      cycleHighlight: { nodeIds: nodeIdSet, edgeKeys: edgeKeySet },
      nodes: state.nodes.map((n) =>
        nodeIdSet.has(n.id) ? { ...n, className: "cycle-node" } : n,
      ),
      edges: state.edges.map((e) => {
        if (edgeKeySet.has(`${e.source}->${e.target}`)) {
          return {
            ...e,
            style: { stroke: "#ef4444", strokeWidth: 3 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#ef4444",
              width: 16,
              height: 16,
            },
          };
        }
        return e;
      }),
    }));

    // Pan/zoom to fit all affected nodes
    const { nodes, reactFlowInstance } = get();
    if (reactFlowInstance && nodeIdSet.size > 0) {
      const affected = nodes.filter((n) => nodeIdSet.has(n.id));
      if (affected.length > 0) {
        const xs = affected.map((n) => n.position.x);
        const ys = affected.map((n) => n.position.y);
        const maxX = Math.max(
          ...affected.map((n) => n.position.x + (n.width || 220)),
        );
        const maxY = Math.max(
          ...affected.map((n) => n.position.y + (n.height || 120)),
        );
        reactFlowInstance.fitBounds(
          {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: maxX - Math.min(...xs),
            height: maxY - Math.min(...ys),
          },
          { padding: 0.3, duration: 500 },
        );
      }
    }
  },

  clearCycleHighlights: () => {
    const current = get().cycleHighlight;
    if (!current) return;
    set((state) => ({
      cycleHighlight: null,
      nodes: state.nodes.map((n) =>
        n.className === "cycle-node" ? { ...n, className: undefined } : n,
      ),
      edges: state.edges.map((e) => {
        if (current.edgeKeys.has(`${e.source}->${e.target}`)) {
          return { ...e, style: EDGE_STYLE, markerEnd: EDGE_MARKER };
        }
        return e;
      }),
    }));
  },

  // ── Context menu ───────────────────────────────────────────────────────

  contextMenu: null,
  openContextMenu: (x, y, nodeId) => set({ contextMenu: { x, y, nodeId } }),
  closeContextMenu: () => set({ contextMenu: null }),

  // ── Canvas ──────────────────────────────────────────────────────────────

  clearCanvas: () => {
    const { nodes, edges } = get();
    if (nodes.length === 0 && edges.length === 0) return;
    set({ nodes: [], edges: [], nodeIDs: {}, history: [], future: [], cycleHighlight: null });
    get().addToast("Canvas cleared", "info");
  },

  // ── Persistence ─────────────────────────────────────────────────────────

  savePipeline: () => {
    const { nodes, edges, nodeIDs, pipelineName } = get();
    const data = { nodes, edges, nodeIDs, pipelineName, savedAt: Date.now() };
    try {
      localStorage.setItem("vectorshift-pipeline", JSON.stringify(data));
      get().addToast("Pipeline saved", "success");
      return true;
    } catch {
      get().addToast("Failed to save", "error");
      return false;
    }
  },

  loadPipeline: () => {
    try {
      const raw = localStorage.getItem("vectorshift-pipeline");
      if (!raw) {
        get().addToast("No saved pipeline found", "warning");
        return false;
      }
      const data = JSON.parse(raw);
      set({
        nodes: data.nodes || [],
        edges: data.edges || [],
        nodeIDs: data.nodeIDs || {},
        pipelineName: data.pipelineName || "Untitled Pipeline",
        history: [],
        future: [],
      });
      get().addToast("Pipeline loaded", "success");
      return true;
    } catch {
      get().addToast("Failed to load pipeline", "error");
      return false;
    }
  },

  exportPipeline: () => {
    const { nodes, edges, pipelineName } = get();
    const data = {
      name: pipelineName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pipelineName.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    get().addToast("Pipeline exported", "success");
  },
}));
