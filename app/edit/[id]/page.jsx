"use client";
import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
  useContext,
} from "react";
import Split from "react-split";
import Preview from "../../Components/EditPreview";
import {
  ReactFlowProvider,
  ReactFlow,
  Controls,
  useEdgesState,
  useNodesState,
  addEdge,
  Background,
  BackgroundVariant,
} from "reactflow";
// import { Background, BackgroundVariant } from "@xyflow/react";

import "reactflow/dist/style.css";
import MainNode from "../../Components/Editmainnode";
import EditMapNode from "../../Components/EditMapNode";
import ControlGUI from "../../Components/EditControl";
import { MapContext } from "../../EditContext";
import { Snackbar, Alert, IconButton, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

function FabricPage({ params }) {
  const { id } = params;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [currentModel, setCurrentModel] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null); // For tracking selected node
  const [showReactFlow, setShowReactFlow] = useState(true);

  const fileInputRef = useRef(null);
  const [uploadedModelPath, setUploadedModelPath] = useState(null);
  const [deletedMaps, setDeletedMaps] = useState({});

  const mapContext = useContext(MapContext);
  if (!mapContext) {
    throw new Error("MapContext must be used within a MapProvider");
  }
  const { updateConnectedMaps, disconnectMap, setInitialId } = mapContext;

  // Callback to receive currentModel from Preview
  const handleModelLoaded = useCallback((model) => {
    setCurrentModel(model); // Store the current model for future use
  }, []);

  const handleNodeDelete = useCallback(
    async (node) => {
      const { mapType, fabricId } = node.data;

      try {
        const formData = new FormData();
        formData.append("fabricId", fabricId);
        formData.append("mapType", mapType);

        const response = await axios.put("/api/updateMapUrlToNull", formData);

        if (response.status === 200) {
          setNodes((nds) => nds.filter((n) => n.id !== node.id));
          setSnackbarMessage(
            `${mapType} map was disconnected and set to null.`
          );
          setSnackbarOpen(true);

          // Disconnect the map in the context as well to ensure it updates in the model
          disconnectMap(mapType);
        } else {
          console.error("Error updating map URL to null:", response);
          setSnackbarMessage("Failed to update map URL.");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error updating map URL to null:", error);
        setSnackbarMessage("Failed to update map URL.");
        setSnackbarOpen(true);
      }
    },
    [setNodes, disconnectMap]
  );

  useEffect(() => {
    if (id) {
      setInitialId(id); // Set initial ID for context
      fetchMapData(id); // Fetch map data once when id changes
    }
  }, [id]);

  const fetchMapData = async (id) => {
    try {
      const response = await axios.get(`/api/maps?id=${id}`);
      const mapsData = response.data.map;

      const initialMaps = {
        Diffuse: mapsData.diffuseMapUrl,
        Environment: mapsData.envMapUrl,
        Refraction: mapsData.refractionMapUrl,
        Bump: mapsData.bumpMapUrl,
        Normal: mapsData.normalMapUrl,
        Displacement: mapsData.displacementMapUrl,
        Clearcoat: mapsData.clearcoatMapUrl,
        Emissive: mapsData.emissiveMapUrl,
        Sheen: mapsData.sheenMapUrl,
        AO: mapsData.aoMapUrl,
        Metalness: mapsData.metalnessMapUrl,
        Roughness: mapsData.roughnessMapUrl,
        Anisotropy: mapsData.anisotropyMapUrl,
      };

      const mapNodes = Object.entries(initialMaps)
        .filter(([mapType, mapUrl]) => mapUrl && !deletedMaps[mapType]) // Filter out deleted maps
        .map(([mapType, mapUrl], index) => {
          const mapNodeId = `map-${index + 1}`;
          return {
            id: mapNodeId,
            type: "mapNode",
            position: {
              x: Math.random() * 150 + 150,
              y: Math.random() * 250 + 50,
            },
            data: {
              label: mapType,
              thumbnail: mapUrl,
              mapType,
              fabricId: id,
              updateNodeData: (nodeId, file, thumbnail) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === nodeId
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            thumbnail,
                            file,
                            label: file.name,
                          },
                        }
                      : node
                  )
                );
                updateConnectedMaps(mapType, file);
              },
            },
          };
        });

      setNodes((prevNodes) => [...prevNodes, ...mapNodes]);
      setEdges((prevEdges) =>
        mapNodes.map((mapNode, index) => ({
          id: `edge-${mapNode.id}`,
          source: mapNode.id,
          target: "1",
          targetHandle: `handle-${mapNode.data.mapType.toLowerCase()}`, // Use the correct handle ID
          animated: true,
          data: {
            mapType: mapNode.data.mapType,
          },
        }))
      );
    } catch (error) {
      console.error("Error fetching map data:", error);
    }
  };

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
          { name: "Nulle", isHidden: true },
        ],
      },
    }),
    []
  );

  useEffect(() => {
    setNodes([mainNode]);
  }, [mainNode]);
  const addMapNode = useCallback(
    (mapType) => {
      const newNode = {
        id: `map-${nodes.length + 1}`,
        type: "mapNode",
        position: {
          x: Math.random() * 150 + 150,
          y: Math.random() * 250 + 50,
        },
        data: {
          label: `New Map ${nodes.length + 1}`,
          mapType: mapType || "nulle",
          fabricId: id,

          updateNodeData: (nodeId, file, thumbnail) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? {
                      ...node,
                      data: { ...node.data, thumbnail, file, label: file.name },
                    }
                  : node
              )
            );
            updateConnectedMaps(mapType, file);
          },
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, id, setNodes, updateConnectedMaps]
  );

  const onConnect = useCallback(
    (params) => {
      const targetMapType = params.targetHandle
        ?.replace("handle-", "")
        .toUpperCase();
      const sourceNode = nodes.find((node) => node.id === params.source);

      const hasExistingConnection = edges.some(
        (edge) => edge.source === params.source
      );

      if (hasExistingConnection) {
        setSnackbarMessage(
          "This node is already connected. Multiple connections are not allowed."
        );
        setSnackbarOpen(true);
        return;
      }

      if (sourceNode && targetMapType) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === sourceNode.id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    mapType: targetMapType,
                    label: targetMapType,
                  },
                }
              : node
          )
        );

        setEdges((eds) =>
          addEdge(
            {
              ...params,
              animated: true,
              data: { mapType: targetMapType },
            },
            eds
          )
        );

        if (sourceNode.data.file) {
          updateConnectedMaps(targetMapType, sourceNode.data.file);
        } else {
          console.warn(
            "A file has not been uploaded yet, but nodes are connected."
          );
        }
      }
    },
    [nodes, edges, setEdges, updateConnectedMaps]
  );

  const onEdgeDoubleClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      setSnackbarMessage("Edge deleted.");
      setSnackbarOpen(true);
    },
    [setEdges]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges) => {
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !deletedEdges.find((deletedEdge) => deletedEdge.id === edge.id)
        )
      );

      deletedEdges.forEach((edge) => {
        const targetMapType = edge.data.mapType;
        updateConnectedMaps(targetMapType, null);
      });

      setSnackbarMessage("Edge deleted successfully.");
      setSnackbarOpen(true);
    },
    [setEdges, updateConnectedMaps]
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      const nodeId = node.id;

      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );

      setSnackbarMessage("Node deleted.");
      setSnackbarOpen(true);
    },
    [setNodes, setEdges]
  );

  const closeSnackbar = () => setSnackbarOpen(false);

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedModelPath(url);
    }
  };

  const nodeTypes = useMemo(
    () => ({
      mainNode: MainNode,
      mapNode: (nodeProps) => (
        <EditMapNode {...nodeProps} handleNodeDelete={handleNodeDelete} />
      ),
    }),
    [handleNodeDelete]
  );

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
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
            style={{ height: "100%" }}
            id={id}
            onModelLoaded={handleModelLoaded}
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
                onEdgesDelete={onEdgesDelete}
                onNodeContextMenu={onNodeContextMenu}
                onNodeDoubleClick={(event, node) => handleNodeDelete(node)}
                fitView
                proOptions={{ hideAttribution: true }}
                defaultEdgeOptions={{
                  style: { strokeWidth: 4, stroke: "#333" },
                }}
                style={{ height: "100%" }}
              >
                <Controls />
                <Background
                  id="1"
                  gap={10}
                  color="#f1f1f1"
                  variant={BackgroundVariant.Cross}
                />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        )}
      </Split>

      <ControlGUI
        id={id}
        addMapNode={addMapNode}
        style={{ height: "100vh", position: "absolute", top: 0 }}
        setShowReactFlow={setShowReactFlow}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
      >
        <Alert
          onClose={closeSnackbar}
          severity="warning"
          addMapNode
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default FabricPage;
