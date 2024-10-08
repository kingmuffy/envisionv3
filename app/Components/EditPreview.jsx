import React, { useEffect, useState, useContext, useRef } from "react";
import { Canvas } from "@react-three/fiber";
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
import { Box, IconButton, Tooltip } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios"; // For API requests to fetch map URLs

const Preview = ({ id }) => {
  const { lights } = useContext(LightContext);
  const mapContext = useContext(MapContext);

  if (!mapContext) {
    throw new Error("MapContext must be used within a MapProvider");
  }

  const { materialParams, updateTrigger } = mapContext;
  const [connectedMaps, setConnectedMaps] = useState({});
  const [currentModel, setCurrentModel] = useState(null);
  const [uploadedModelPath, setUploadedModelPath] = useState(null);
  const defaultModelPath = "/Tetrad-Ruben-Midi-Standard.fbx";
  const fileInputRef = useRef(null);
  const textureLoader = useRef(new TextureLoader()).current;

  textureLoader.crossOrigin = "anonymous"; // Ensure cross-origin requests are allowed

  // Fetch maps from the backend using the provided 'id'
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await axios.get(`/api/maps?id=${id}`);
        const data = response.data.map;

        const initialMaps = {
          DIFFUSE: data.diffuseMapUrl || null,
          ENVIRONMENT: data.envMapUrl || null,
          REFRACTION: data.refractionMapUrl || null,
          BUMP: data.bumpMapUrl || null,
          NORMAL: data.normalMapUrl || null,
          DISPLACEMENT: data.displacementMapUrl || null,
          CLEARCOAT: data.clearcoatMapUrl || null,
          EMISSIVE: data.emissiveMapUrl || null,
          SHEEN: data.sheenMapUrl || null,
          AO: data.aoMapUrl || null,
          METALNESS: data.metalnessMapUrl || null,
          ROUGHNESS: data.roughnessMapUrl || null,
          ANISOTROPY: data.anisotropyMapUrl || null,
        };

        setConnectedMaps(initialMaps);
      } catch (error) {
        console.error("Error fetching maps from backend:", error);
      }
    };

    if (id) {
      fetchMaps();
    }
  }, [id]);

  // Load the 3D model (FBX)
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

  // Update material properties and apply maps from connectedMaps
  useEffect(() => {
    if (currentModel) {
      currentModel.traverse((child) => {
        if (child.isMesh && child.material) {
          updateMaterialProperties(child.material);
          updateTextures(child.material);
        }
      });
    }
  }, [currentModel, connectedMaps, updateTrigger]);

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
    material.side = DoubleSide;
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
    textureLoader.load(
      texturePath,
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
    texture.colorSpace = ["DIFFUSE", "EMISSIVE"].includes(mapType.toUpperCase())
      ? SRGBColorSpace
      : LinearSRGBColorSpace;

    assignTextureToMaterial(material, mapType, texture);
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
            default:
              return null;
          }
        })}
        {currentModel && <primitive object={currentModel} />}
        <gridHelper args={[100, 100, "#ffffff", "#555555"]} />
        <OrbitControls />
      </Canvas>
    </>
  );
};

export default Preview;
