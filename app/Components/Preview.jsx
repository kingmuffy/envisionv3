"use client";
import React, { useEffect, useState, useContext, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import {
  MeshPhysicalMaterial,
  TextureLoader,
  SRGBColorSpace,
  LinearSRGBColorSpace,
  DoubleSide,
  Vector2,
  Color,
  RepeatWrapping,
} from "three";
import { LightContext } from "./LightContext";
import CustomCameraHelper from "./Helper/CustomCameraHelper";
import { MapContext } from "../MapContext";
import { CameraContext } from "../Components/CameraContext";
import {
  Box,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Component to handle camera updates based on active camera index
// Component to handle camera updates based on active camera index
const CameraUpdater = () => {
  const { camera } = useThree();
  const { cameras, activeCameraIndex, updateTrigger, resetUpdateTrigger } =
    useContext(CameraContext);

  useEffect(() => {
    if (updateTrigger && cameras.length > 0) {
      const activeCameraSettings = cameras[activeCameraIndex].settings;
      camera.position.set(
        activeCameraSettings.position.x,
        activeCameraSettings.position.y,
        activeCameraSettings.position.z
      );
      camera.lookAt(
        activeCameraSettings.target.x,
        activeCameraSettings.target.y,
        activeCameraSettings.target.z
      );
      camera.near = activeCameraSettings.near;
      camera.far = activeCameraSettings.far;
      camera.fov = activeCameraSettings.fov;
      camera.zoom = activeCameraSettings.zoom || 1; // Set zoom value
      camera.updateProjectionMatrix(); // IMPORTANT: Call this to apply changes to zoom, fov, etc.
      resetUpdateTrigger();
    }
  }, [cameras, activeCameraIndex, updateTrigger, camera, resetUpdateTrigger]);

  return null;
};

// Component to load and handle 3D model
const PreviewScene = ({ model, setCurrentModel }) => {
  const { scene } = useThree();

  useEffect(() => {
    if (model) {
      console.log("Adding new model to scene", model);
      scene.add(model);
      setCurrentModel(model);
      return () => {
        console.log("Removing previous model from scene", model);
        scene.remove(model);
        model.traverse((child) => {
          if (child.isMesh) {
            console.log("Disposing geometry and material of:", child.name);
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      };
    }
  }, [model, scene, setCurrentModel]);

  return null;
};

// Main Preview Component
const Preview = () => {
  const { lights } = useContext(LightContext);
  const { connectedMaps, materialParams, updateTrigger } =
    useContext(MapContext);
  const { cameras, activeCameraIndex, setActiveCamera, handleViewCamera } =
    useContext(CameraContext);

  const [currentModel, setCurrentModel] = useState(null);
  const [uploadedModelPath, setUploadedModelPath] = useState(null);
  const defaultModelPath = "/Wood Bros-Askham Large Fabric.fbx";
  const fileInputRef = useRef(null);
  const textureLoader = useRef(new TextureLoader()).current;

  // Reference for OrbitControls
  const orbitControlsRef = useRef();

  // Load model when path changes
  useEffect(() => {
    const modelPath = uploadedModelPath || defaultModelPath;

    const loadModel = () => {
      const loader = new FBXLoader();
      loader.load(
        modelPath,
        (loadedModel) => {
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              const material = createMaterial();
              child.material = material;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          setCurrentModel(loadedModel);
        },
        undefined,
        (error) => {
          console.error("Failed to load FBX model:", error);
        }
      );
    };

    loadModel();
  }, [uploadedModelPath]);

  // Update material properties and textures when model changes
  useEffect(() => {
    if (currentModel) {
      currentModel.traverse((child) => {
        if (child.isMesh && child.material) {
          updateMaterialProperties(child.material);
          updateTextures(child.material);
        }
      });
    }
  }, [currentModel, updateTrigger, connectedMaps, materialParams]);
  // Update OrbitControls when active camera changes
  useEffect(() => {
    if (orbitControlsRef.current && cameras.length > 0) {
      const activeCameraSettings = cameras[activeCameraIndex].settings;

      // Update the camera
      orbitControlsRef.current.object.position.set(
        activeCameraSettings.position.x,
        activeCameraSettings.position.y,
        activeCameraSettings.position.z
      );

      // Update the target and zoom limits
      orbitControlsRef.current.target.set(
        activeCameraSettings.target.x,
        activeCameraSettings.target.y,
        activeCameraSettings.target.z
      );
      orbitControlsRef.current.minDistance =
        activeCameraSettings.minZoom || 0.1;
      orbitControlsRef.current.maxDistance = activeCameraSettings.maxZoom || 5;

      orbitControlsRef.current.maxPolarAngle =
        activeCameraSettings.maxPolarAngle || Math.PI / 2;
      orbitControlsRef.current.minPolarAngle =
        activeCameraSettings.minPolarAngle || 0;

      orbitControlsRef.current.update(); // Reapply the changes to the OrbitControls
    }
  }, [activeCameraIndex, cameras, orbitControlsRef]);

  // Handle camera change from dropdown
  const handleCameraSelectChange = (event) => {
    const selectedIndex = event.target.value;
    setActiveCamera(selectedIndex);
    handleViewCamera(); // Trigger view update for selected camera
  };

  // Handle file upload click
  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedModelPath(url);
    }
  };

  // Create new material based on parameters
  const createMaterial = () => {
    return new MeshPhysicalMaterial({
      color: 0xffffff,
      side: DoubleSide,
      ...extractMaterialProperties(),
    });
  };

  // Extract material properties from context
  const extractMaterialProperties = () => {
    const sheenColor = new Color(
      materialParams.sheenColor?.r || 0,
      materialParams.sheenColor?.g || 0,
      materialParams.sheenColor?.b || 0
    );

    const emissiveColor = new Color(
      materialParams.emissiveColor?.r || 0,
      materialParams.emissiveColor?.g || 0,
      materialParams.emissiveColor?.b || 0
    );

    return {
      metalness: materialParams.metalness || 0,
      roughness: materialParams.roughness || 1,
      bumpScale: materialParams.bumpScale || 0,
      sheen: materialParams.sheenEnabled || false,
      sheenRoughness: materialParams.sheenRoughness || 1.0,
      sheenColor: sheenColor,
      displacementScale: materialParams.displacementScale || 0,
      displacementBias: materialParams.displacementBias || 0,
      aoMapIntensity: materialParams.aoMapIntensity || 1,
      emissive: emissiveColor,
      emissiveIntensity: materialParams.emissiveIntensity || 0,
      clearcoat: materialParams.clearcoat || 0,
      envMapIntensity: materialParams.envMapIntensity || 0,
      anisotropy: materialParams.anisotropy || 0,
    };
  };

  // Update material properties and textures
  const updateMaterialProperties = (material) => {
    Object.assign(material, extractMaterialProperties());
    material.normalScale = new Vector2(
      materialParams.normalScaleX || 1,
      materialParams.normalScaleY || 1
    );
    material.side = DoubleSide;
    material.needsUpdate = true;
  };

  const updateTextures = (material) => {
    const currentMapTypes = Object.keys(connectedMaps || []);

    currentMapTypes.forEach((mapType) => {
      const file = connectedMaps[mapType];
      if (file) {
        textureLoader.load(
          URL.createObjectURL(file),
          (texture) => {
            texture.colorSpace = ["DIFFUSE", "EMISSIVE"].includes(
              mapType.toUpperCase()
            )
              ? SRGBColorSpace
              : LinearSRGBColorSpace;

            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;

            if (mapType.toUpperCase() === "DIFFUSE") {
              texture.repeat.set(
                materialParams.scaleX || 1,
                materialParams.scaleY || 1
              );
            }

            const maxAnisotropy =
              textureLoader.manager?.renderer?.capabilities?.getMaxAnisotropy() ||
              1;
            texture.anisotropy = Math.min(
              maxAnisotropy,
              materialParams.anisotropy || 1
            );

            texture.needsUpdate = true;

            assignTextureToMaterial(material, mapType, texture);
          },
          undefined,
          (error) => {
            console.error(`Failed to load texture for ${mapType}:`, error);
          }
        );
      } else {
        resetSpecificMap(material, mapType);
      }
    });

    const allMapTypes = [
      "DIFFUSE",
      "SHEEN",
      "CLEARCOAT",
      "BUMP",
      "NORMAL",
      "DISPLACEMENT",
      "EMISSIVE",
      "AO",
      "METALNESS",
      "ROUGHNESS",
      "ENVIRONMENT",
      "ANISOTROPY",
    ];
    allMapTypes.forEach((mapType) => {
      if (!currentMapTypes.includes(mapType)) {
        resetSpecificMap(material, mapType);
      }
    });
  };

  const resetSpecificMap = (material, mapType) => {
    switch (mapType.toUpperCase()) {
      case "DIFFUSE":
        material.map = null;
        break;
      case "SHEEN":
        material.sheenColorMap = null;
        break;
      case "CLEARCOAT":
        material.clearcoatMap = null;
        break;
      case "BUMP":
        material.bumpMap = null;
        break;
      case "NORMAL":
        material.normalMap = null;
        break;
      case "DISPLACEMENT":
        material.displacementMap = null;
        break;
      case "EMISSIVE":
        material.emissiveMap = null;
        break;
      case "AO":
        material.aoMap = null;
        break;
      case "METALNESS":
        material.metalnessMap = null;
        break;
      case "ROUGHNESS":
        material.roughnessMap = null;
        break;
      case "ENVIRONMENT":
        material.envMap = null;
        break;
      case "ANISOTROPY":
        material.anisotropyMap = null;
        break;
      default:
        console.warn(`Unknown map type: ${mapType}`);
        break;
    }
    material.needsUpdate = true;
  };

  const assignTextureToMaterial = (material, mapType, texture) => {
    switch (mapType.toUpperCase()) {
      case "DIFFUSE":
        material.map = texture;
        break;
      case "SHEEN":
        material.sheenColorMap = texture;
        break;
      case "CLEARCOAT":
        material.clearcoatMap = texture;
        break;
      case "BUMP":
        material.bumpMap = texture;
        break;
      case "NORMAL":
        material.normalMap = texture;
        break;
      case "DISPLACEMENT":
        material.displacementMap = texture;
        break;
      case "EMISSIVE":
        material.emissiveMap = texture;
        break;
      case "AO":
        material.aoMap = texture;
        break;
      case "METALNESS":
        material.metalnessMap = texture;
        break;
      case "ROUGHNESS":
        material.roughnessMap = texture;
        break;
      case "ENVIRONMENT":
        material.envMap = texture;
        break;
      case "ANISOTROPY":
        material.anisotropyMap = texture;
        break;
      default:
        console.warn(`Unknown map type: ${mapType}`);
        break;
    }
    material.needsUpdate = true;
  };

  return (
    <>
      {/* File Upload Icon */}
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
        <Tooltip title="Upload Model">
          <IconButton component="span">
            <CloudUploadIcon sx={{ color: "grey", fontSize: 40 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept=".fbx"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {/* Main Canvas */}
      <Box sx={{ position: "relative", height: "100%" }}>
        <Canvas
          shadows
          style={{ height: "100%", backgroundColor: "#EFEFEF" }}
          camera={{
            position: [
              cameras[activeCameraIndex]?.settings?.position.x || 0,
              cameras[activeCameraIndex]?.settings?.position.y || 5,
              cameras[activeCameraIndex]?.settings?.position.z || 10,
            ],
            fov: cameras[activeCameraIndex]?.settings?.fov || 50,
            near: cameras[activeCameraIndex]?.settings?.near || 0.1,
            far: cameras[activeCameraIndex]?.settings?.far || 1000,
            zoom: cameras[activeCameraIndex]?.settings?.zoom || 1,
          }}
        >
          {lights.map((light) => {
            switch (light.type.toUpperCase()) {
              case "AMBIENT":
                return (
                  <ambientLight
                    key={light.id}
                    intensity={light.intensity}
                    color={light.color || "#ffffff"}
                  />
                );
              case "DIRECTIONAL":
                return (
                  <directionalLight
                    key={light.id}
                    intensity={light.intensity}
                    position={[
                      light.position?.x || 0,
                      light.position?.y || 0,
                      light.position?.z || 0,
                    ]}
                    castShadow={light.castShadow || false}
                    bias={0.0001}
                  />
                );
              case "HEMISPHERE":
                return (
                  <hemisphereLight
                    key={light.id}
                    intensity={light.intensity}
                    skyColor={light.color || "#ffffff"}
                    // groundColor={light.groundColor || "#0000ff"}
                  />
                );
              case "SPOT":
                return (
                  <spotLight
                    key={light.id}
                    intensity={light.intensity}
                    position={[
                      light.position?.x || 0,
                      light.position?.y || 0,
                      light.position?.z || 0,
                    ]}
                    angle={light.angle || 0.3}
                    decay={light.decay || 2}
                    castShadow={light.castShadow || false}
                  />
                );
              default:
                return null;
            }
          })}
          {/* Render Model */}
          {currentModel && (
            <PreviewScene
              model={currentModel}
              setCurrentModel={setCurrentModel}
            />
          )}
          <gridHelper args={[1000, 1000, "#ffffff", "#555555"]} />
          <OrbitControls
            ref={orbitControlsRef}
            minDistance={cameras[activeCameraIndex]?.settings?.minZoom || 0.1}
            maxDistance={cameras[activeCameraIndex]?.settings?.maxZoom || 5}
            minPolarAngle={
              cameras[activeCameraIndex]?.settings?.minPolarAngle || 0
            }
            maxPolarAngle={
              cameras[activeCameraIndex]?.settings?.maxPolarAngle || Math.PI / 2
            }
            enableZoom={true}
          />

          {cameras.map((camera, index) => (
            <CustomCameraHelper key={index} cameraSettings={camera.settings} />
          ))}
          <CameraUpdater />
        </Canvas>

        <Box
          sx={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <FormControl
            variant="outlined"
            sx={{
              minWidth: 250,
              backgroundColor: "#ffffff",
              borderRadius: "0px",
              boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Select
              displayEmpty
              value={activeCameraIndex === -1 ? "" : activeCameraIndex}
              onChange={handleCameraSelectChange}
              sx={{
                backgroundColor: "transparent",
                fontFamily: "Avenir",
                fontSize: "11px",
                fontWeight: 400,
                lineHeight: "35px",
                letterSpacing: "0.02em",
                textAlign: "left",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#529d36",
                  borderWidth: "1px",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#529d36",
                },
                "& .MuiSelect-icon": {
                  color: "gray",
                },
                "& .MuiSelect-select": {
                  padding: "10px",
                },
              }}
              inputProps={{
                "aria-label": "Select Camera View",
                style: {
                  fontFamily: "Avenir",
                  fontSize: "11px",
                  fontWeight: 400,
                  lineHeight: "35px",
                  letterSpacing: "0.02em",
                  textAlign: "left",
                },
              }}
            >
              <MenuItem value="" disabled>
                <span
                  style={{
                    fontStyle: "normal",
                    fontFamily: "Avenir",
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#333333",
                  }}
                >
                  Select Camera View
                </span>
              </MenuItem>
              {cameras.map((camera, index) => (
                <MenuItem key={index} value={index}>
                  {camera.name || `Camera ${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </>
  );
};
export default Preview;
