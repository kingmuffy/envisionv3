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
import { MapContext } from "../EditContext";
import { CameraContext } from "./CameraContext";
import {
  Box,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CustomCameraHelper from "./Helper/CustomCameraHelper";
import axios from "axios";

const mapTypeMappings = {
  diffuseMapUrl: "DIFFUSE",
  bumpMapUrl: "BUMP",
  normalMapUrl: "NORMAL",
  displacementMapUrl: "DISPLACEMENT",
  emissiveMapUrl: "EMISSIVE",
  aoMapUrl: "AO",
  metalnessMapUrl: "METALNESS",
  roughnessMapUrl: "ROUGHNESS",
  clearcoatMapUrl: "CLEARCOAT",
  envMapUrl: "ENVIRONMENT",
  anisotropyMapUrl: "ANISOTROPY",
  sheenMapUrl: "SHEEN",
};

// Component to handle camera updates based on active camera index

const Preview = ({ id }) => {
  const { cameras, activeCameraIndex, setActiveCamera, handleViewCamera } =
    useContext(CameraContext);
  const { lights } = useContext(LightContext);
  const { materialParams, updateTrigger } = useContext(MapContext);
  const [connectedMaps, setConnectedMaps] = useState({});
  const [currentModel, setCurrentModel] = useState(null);
  const [uploadedModelPath, setUploadedModelPath] = useState(null);
  const defaultModelPath = "/Wood Bros-Askham Large Fabric.fbx";
  const fileInputRef = useRef(null);
  const textureLoader = new TextureLoader();
  const orbitControlsRef = useRef();

  useEffect(() => {
    const fetchMaps = async (id) => {
      try {
        const response = await axios.get(`/api/maps?id=${id}`);
        const data = response.data.map;
        const initialMaps = Object.keys(data).reduce((acc, key) => {
          const mapType = mapTypeMappings[key];
          if (mapType && data[key]) {
            acc[mapType] = data[key];
          }
          return acc;
        }, {});
        setConnectedMaps(initialMaps);
      } catch (error) {
        console.error("Error fetching maps from backend:", error);
      }
    };

    if (id) {
      fetchMaps(id);
    }
  }, [id, updateTrigger]);

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
        camera.updateProjectionMatrix();
        resetUpdateTrigger();
      }
    }, [cameras, activeCameraIndex, updateTrigger, camera, resetUpdateTrigger]);

    return null;
  };

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
  // Update OrbitControls when active camera changes
  useEffect(() => {
    if (orbitControlsRef.current && cameras.length > 0) {
      const activeCameraSettings = cameras[activeCameraIndex].settings;
      orbitControlsRef.current.target.set(
        activeCameraSettings.target.x,
        activeCameraSettings.target.y,
        activeCameraSettings.target.z
      );
      orbitControlsRef.current.object.position.set(
        activeCameraSettings.position.x,
        activeCameraSettings.position.y,
        activeCameraSettings.position.z
      );
      orbitControlsRef.current.update();
    }
  }, [activeCameraIndex, cameras]);

  // Handle camera change from dropdown
  const handleCameraSelectChange = (event) => {
    const selectedIndex = event.target.value;
    setActiveCamera(selectedIndex);
    handleViewCamera(); // Trigger view update for selected camera
  };

  useEffect(() => {
    if (currentModel) {
      currentModel.traverse((child) => {
        if (child.isMesh && child.material) {
          updateMaterialProperties(child.material);
          updateTextures(child.material);
        }
      });
    }
  }, [currentModel, connectedMaps, updateTrigger, materialParams]);

  const createMaterial = () => {
    return new MeshPhysicalMaterial({
      color: 0xffffff,
      side: DoubleSide,
      ...extractMaterialProperties(),
    });
  };

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

  const updateMaterialProperties = (material) => {
    Object.assign(material, extractMaterialProperties());
    material.normalScale = new Vector2(
      materialParams.normalScaleX || 1,
      materialParams.normalScaleY || 1
    );
    material.needsUpdate = true;
  };

  const updateTextures = (material) => {
    const currentMapTypes = Object.keys(connectedMaps);

    currentMapTypes.forEach((mapType) => {
      const mapValue = connectedMaps[mapType];
      if (mapValue) {
        if (mapValue.startsWith("data:image")) {
          loadBase64Texture(material, mapType, mapValue);
        } else {
          loadUrlTexture(material, mapType, mapValue);
        }
      } else {
        resetSpecificMap(material, mapType);
      }
    });

    material.needsUpdate = true;
  };

  const loadUrlTexture = (material, mapType, texturePath) => {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(texturePath)}`;

    textureLoader.load(
      proxyUrl,

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

        assignTextureToMaterial(material, mapType, texture);
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture for ${mapType}:`, error);
      }
    );
  };

  const loadBase64Texture = (material, mapType, base64Texture) => {
    const texture = textureLoader.load(base64Texture);
    assignTextureToMaterial(material, mapType, texture);
  };

  const resetSpecificMap = (material, mapType) => {
    const resetMappings = {
      DIFFUSE: "map",
      SHEEN: "sheenColorMap",
      CLEARCOAT: "clearcoatMap",
      BUMP: "bumpMap",
      NORMAL: "normalMap",
      DISPLACEMENT: "displacementMap",
      EMISSIVE: "emissiveMap",
      AO: "aoMap",
      METALNESS: "metalnessMap",
      ROUGHNESS: "roughnessMap",
      ENVIRONMENT: "envMap",
      ANISOTROPY: "anisotropyMap",
    };
    material[resetMappings[mapType.toUpperCase()]] = null;
    material.needsUpdate = true;
  };

  const assignTextureToMaterial = (material, mapType, texture) => {
    const mapMappings = {
      DIFFUSE: "map",
      SHEEN: "sheenColorMap",
      CLEARCOAT: "clearcoatMap",
      BUMP: "bumpMap",
      NORMAL: "normalMap",
      DISPLACEMENT: "displacementMap",
      EMISSIVE: "emissiveMap",
      AO: "aoMap",
      METALNESS: "metalnessMap",
      ROUGHNESS: "roughnessMap",
      ENVIRONMENT: "envMap",
      ANISOTROPY: "anisotropyMap",
    };
    material[mapMappings[mapType.toUpperCase()]] = texture;
    material.needsUpdate = true;
  };

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

  return (
    <>
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
      <Box sx={{ position: "relative", height: "100%" }}>
        <Canvas shadows style={{ backgroundColor: "#EFEFEF" }}>
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
          {currentModel && <primitive object={currentModel} />}
          <gridHelper args={[100, 100, "#ffffff", "#555555"]} />
          <OrbitControls ref={orbitControlsRef} />
          {cameras.map((camera, index) => (
            <CustomCameraHelper key={index} cameraSettings={camera.settings} />
          ))}{" "}
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
