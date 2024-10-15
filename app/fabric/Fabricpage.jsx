"use client";
import React, {
  useCallback,
  useState,
  useMemo,
  useContext,
  useEffect,
  useRef,
} from "react";
import Split from "react-split";
import Preview from "../Components/Preview";
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import MainNode from "../Components/MainNode";
import MapNode from "../Components/MapNode";
import ControlGUI from "../Components/ControlGUI";
import { MapContext } from "../MapContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Box,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

function FabricPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showReactFlow, setShowReactFlow] = useState(true);
  const fileInputRef = useRef(null);
  const [uploadedModelPath, setUploadedModelPath] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(""); // New state to store uploaded file name

  const { updateConnectedMaps, disconnectMap } = useContext(MapContext);

  const mainNode = useMemo(
    () => ({
      id: "1",
      type: "mainNode",
      position: { x: 250, y: 5 },
      data: {
        label: "Fabric Name",
        maps: [
          "Diffuse",
          "Environment",
          "Refraction",
          "Bump",
          "Normal",
          "Displacement",
          "Clearcoat",
          "Emissive",
          "Sheen",
          "AO",
          "Metalness",
          "Roughness",
          "Anisotropy",
        ],
      },
    }),
    []
  );

  useEffect(() => {
    setNodes([mainNode]);
  }, [mainNode, setNodes]);

  const addMapNode = useCallback(() => {
    const mainNode = nodes.find((node) => node.id === "1");
    const mainNodeX = mainNode?.position?.x || 250;
    const mainNodeY = mainNode?.position?.y || 5;
    const gap = 10;

    const newMapNode = {
      id: `map-${nodes.length + 1}`,
      type: "mapNode",
      position: {
        x: mainNodeX - 220 - gap,
        y: mainNodeY + 50,
      },
      data: {
        label: "Upload a map",
        thumbnail: null,
        mapType: null,
        file: null,
        updateNodeData: (nodeId, file, thumbnail) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === nodeId
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      thumbnail,
                      label: file.name,
                      file,
                    },
                  }
                : node
            )
          );

          const mapNode = nodes.find((node) => node.id === nodeId);
          if (mapNode && mapNode.data.mapType) {
            updateConnectedMaps(mapNode.data.mapType, file);
          }
        },
      },
    };

    setNodes((nds) => [...nds, newMapNode]);
  }, [nodes, setNodes, updateConnectedMaps]);

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      if (!sourceNode || !sourceNode.data.file) {
        setSnackbarOpen(true);
        return;
      }

      const targetNode = nodes.find((node) => node.id === params.target);
      const targetHandleIndex = params.targetHandle?.replace("handle-", "");
      if (!targetHandleIndex) return;

      const targetMapType = targetNode?.data?.maps[parseInt(targetHandleIndex)];

      if (targetMapType) {
        const mapNodeId = params.source;
        setNodes((nds) =>
          nds.map((node) =>
            node.id === mapNodeId
              ? { ...node, data: { ...node.data, mapType: targetMapType } }
              : node
          )
        );

        updateConnectedMaps(targetMapType, sourceNode.data.file);
      }
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [nodes, setNodes, setEdges, updateConnectedMaps]
  );

  const onEdgeDoubleClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      const mapNodeId = edge.source;
      const mapType = nodes.find((node) => node.id === mapNodeId)?.data
        ?.mapType;

      if (mapType) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === mapNodeId
              ? { ...node, data: { ...node.data, mapType: null } }
              : node
          )
        );
        disconnectMap(mapType);
      }
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [nodes, setNodes, setEdges, disconnectMap]
  );

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  const triggerDeleteModal = useCallback((node) => {
    console.log("Triggering delete modal for node:", node);
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  const confirmDeleteNode = useCallback(() => {
    if (selectedNode) {
      const { id, data } = selectedNode;

      if (data.mapType) {
        disconnectMap(data.mapType);
      }

      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id)
      );
    }
    setModalOpen(false);
  }, [selectedNode, setNodes, setEdges, disconnectMap]);

  const handleFileUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedModelPath(url);
      setUploadedFileName(file.name); // Store the uploaded file name
    }
  }, []);

  const closeModal = () => setModalOpen(false);
  const closeSnackbar = () => setSnackbarOpen(false);

  const nodeTypes = useMemo(
    () => ({
      mainNode: MainNode,
      mapNode: (props) => (
        <MapNode {...props} onTriggerDelete={triggerDeleteModal} />
      ),
    }),
    [triggerDeleteModal]
  );

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* Custom Upload Icon */}
      <Box
        sx={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={handleFileUploadClick}
      >
        <IconButton component="span">
          <CloudUploadIcon sx={{ color: "grey", fontSize: 40 }} />
        </IconButton>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept=".fbx"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      <Split
        className="split-container"
        sizes={showReactFlow ? [50, 50] : [100, 0]}
        minSize={100}
        direction="horizontal"
        gutterSize={10}
        cursor="col-resize"
        style={{ height: "100vh" }}
      >
        <div style={{ height: "100%", overflow: "hidden" }}>
          <Preview
            uploadedModelPath={uploadedModelPath}
            fileName={uploadedFileName} // Pass file name to Preview if needed
            style={{ height: "100%" }}
          />
        </div>

        {showReactFlow && (
          <div style={{ flexGrow: 1, height: "100%", position: "relative" }}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeContextMenu={onNodeContextMenu}
                onEdgeDoubleClick={onEdgeDoubleClick}
                fitView
                defaultEdgeOptions={{
                  style: { strokeWidth: 4, stroke: "#6EB057" },
                }}
                style={{ height: "100%", background: "#D5D7DB" }}
              >
                <Controls />
                <Background />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        )}
      </Split>

      <ControlGUI
        addMapNode={addMapNode}
        style={{ height: "100vh", position: "absolute", top: 0 }}
        setShowReactFlow={setShowReactFlow}
      />

      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>Delete Node</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this map node?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteNode} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
      >
        <Alert
          onClose={closeSnackbar}
          severity="warning"
          sx={{ width: "100%" }}
        >
          You must upload a map before connecting nodes.
        </Alert>
      </Snackbar>
    </div>
  );
}

export default FabricPage;
