import { useState, useRef, useCallback, useEffect } from "react";
import ReactFlow, { Controls, Background, MiniMap } from "reactflow";
import { useStore } from "../store";
import { shallow } from "zustand/shallow";
import { nodeTypes, nodeList } from "../nodes";
import { EdgeType, DRAG_TRANSFER_TYPE } from "../constants";
import { ContextMenu } from "./ContextMenu";
import { DeletableEdge } from "./DeletableEdge";

import "reactflow/dist/style.css";

const nodeColorMap = Object.fromEntries(
  nodeList.map((n) => [n.type, n.color || "#7C3AED"]),
);

const gridSize = 20;
const proOptions = { hideAttribution: true };
const edgeTypes = { deletable: DeletableEdge };

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  pushHistory: state.pushHistory,
  undo: state.undo,
  redo: state.redo,
  deleteNode: state.deleteNode,
  deleteSelectedNodes: state.deleteSelectedNodes,
  duplicateSelectedNodes: state.duplicateSelectedNodes,
  setReactFlowInstance: state.setReactFlowInstance,
  contextMenu: state.contextMenu,
  openContextMenu: state.openContextMenu,
  closeContextMenu: state.closeContextMenu,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const {
    nodes,
    edges,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    pushHistory,
    undo,
    redo,
    deleteNode,
    duplicateSelectedNodes,
    setReactFlowInstance: storeSetInstance,
    contextMenu,
    openContextMenu,
    closeContextMenu,
  } = useStore(selector, shallow);

  // Push history before removals so undo works correctly
  const wrappedOnNodesChange = useCallback(
    (changes) => {
      const hasRemoval = changes.some((c) => c.type === "remove");
      if (hasRemoval) pushHistory();
      onNodesChange(changes);
    },
    [onNodesChange, pushHistory],
  );

  const wrappedOnEdgesChange = useCallback(
    (changes) => {
      const hasRemoval = changes.some((c) => c.type === "remove");
      if (hasRemoval) pushHistory();
      onEdgesChange(changes);
    },
    [onEdgesChange, pushHistory],
  );

  const wrappedOnConnect = useCallback(
    (connection) => {
      pushHistory();
      onConnect(connection);
    },
    [onConnect, pushHistory],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      const isEditing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        redo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        duplicateSelectedNodes();
        return;
      }

      if (e.key === "Escape") {
        closeContextMenu();
      }

      if (isEditing) return;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, duplicateSelectedNodes, closeContextMenu]);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    openContextMenu(event.clientX, event.clientY, node.id);
  }, [openContextMenu]);

  const onPaneClick = useCallback(() => {
    closeContextMenu();
  }, [closeContextMenu]);

  const getInitNodeData = (nodeID, type) => {
    return { id: nodeID, nodeType: `${type}` };
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData(DRAG_TRANSFER_TYPE)) {
        const appData = JSON.parse(
          event.dataTransfer.getData(DRAG_TRANSFER_TYPE),
        );
        const type = appData?.nodeType;

        if (typeof type === "undefined" || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        pushHistory();
        const nodeID = getNodeID(type);
        const newNode = {
          id: nodeID,
          type,
          position,
          data: getInitNodeData(nodeID, type),
        };

        addNode(newNode);
      }
    },
    [reactFlowInstance, getNodeID, addNode, pushHistory],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div
      ref={reactFlowWrapper}
      style={{ flex: 1, background: "#FAFBFE", position: "relative" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={wrappedOnNodesChange}
        onEdgesChange={wrappedOnEdgesChange}
        onConnect={wrappedOnConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={(instance) => { setReactFlowInstance(instance); storeSetInstance(instance); }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        snapToGrid
        connectionLineType={EdgeType.SMOOTHSTEP}
        connectionLineStyle={{ stroke: "#7C3AED", strokeWidth: 2 }}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        multiSelectionKeyCode="Shift"
        deleteKeyCode="Delete"
        fitView
      >
        <Background color="#E2E8F0" gap={gridSize} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => nodeColorMap[node.type] || "#7C3AED"}
          maskColor="rgba(248, 250, 252, 0.7)"
          pannable
          zoomable
        />
      </ReactFlow>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => closeContextMenu()}
          onDelete={(nodeId) => deleteNode(nodeId)}
          onDuplicate={() => duplicateSelectedNodes()}
        />
      )}
    </div>
  );
};
