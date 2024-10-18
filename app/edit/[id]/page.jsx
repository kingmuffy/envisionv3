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
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import MainNode from "../../Components/Editmainnode";
import MapNode from "../../Components/EditMapNode";
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
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Track custom messages for Snackbar
  const [currentModel, setCurrentModel] = useState(null);

  const fileInputRef = useRef(null);
  const [uploadedModelPath, setUploadedModelPath] = useState(null);
  const [deletedMaps, setDeletedMaps] = useState({});

  const mapContext = useContext(MapContext);
  if (!mapContext) {
    throw new Error("MapContext must be used within a MapProvider");
  }

  const { updateConnectedMaps, setInitialId } = mapContext;

  // Callback to receive currentModel from Preview
  const handleModelLoaded = useCallback((model) => {
    setCurrentModel(model); // Store the current model for future use
  }, []);

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
            mapType: mapNode.data.mapType, // Attach the mapType to the edge
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
        ],
      },
    }),
    []
  );

  useEffect(() => {
    setNodes([mainNode]);
  }, [mainNode]);

  const addMapNode = useCallback(() => {
    setSnackbarMessage(
      "You are currently in editing mode. You can only reassign a map, but not create new nodes."
    );
    setSnackbarOpen(true);
  }, []);

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      if (!sourceNode || !sourceNode.data.file) {
        setSnackbarMessage("You must upload a map before connecting nodes.");
        setSnackbarOpen(true);
        return;
      }

      const targetNode = nodes.find((node) => node.id === params.target);
      const targetMapType = params.targetHandle
        ?.replace("handle-", "")
        .toUpperCase(); // Extract the map type from handle ID

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

        setEdges((eds) =>
          addEdge(
            { ...params, animated: true, data: { mapType: targetMapType } },
            eds
          )
        );
      }
    },
    [nodes, setNodes, setEdges, updateConnectedMaps]
  );

  const onEdgeDoubleClick = useCallback((event) => {
    event.stopPropagation();
    setSnackbarMessage(
      "You are currently in editing mode. Disconnecting edges is not allowed."
    );
    setSnackbarOpen(true);
  }, []);

  const onEdgesDelete = useCallback(() => {
    setSnackbarMessage(
      "You are currently in editing mode. Deleting edges is not allowed."
    );
    setSnackbarOpen(true);
  }, []);

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
    () => ({ mainNode: MainNode, mapNode: MapNode }),
    []
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
        sizes={[50, 50]}
        minSize={100}
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
        <div style={{ height: "100%", overflow: "hidden" }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgesDelete={onEdgesDelete}
              onNodeContextMenu={(event) => {
                event.preventDefault();
                setSnackbarMessage(
                  "You are currently in editing mode. Deleting nodes is not allowed."
                );
                setSnackbarOpen(true);
              }}
              onEdgeDoubleClick={onEdgeDoubleClick}
              fitView
              defaultEdgeOptions={{ style: { strokeWidth: 4, stroke: "#333" } }}
              style={{ height: "100%" }}
            >
              <Controls />
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </Split>

      <ControlGUI
        id={id}
        addMapNode={addMapNode}
        style={{ height: "100vh", position: "absolute", top: 0 }}
      />

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
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default FabricPage;
