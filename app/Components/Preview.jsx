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
import { Box, IconButton, Tooltip } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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
//model loading issue fix
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
const Preview = () => {
  const { lights } = useContext(LightContext);
  const { connectedMaps, materialParams, updateTrigger } =
    useContext(MapContext);
  const { cameras, activeCameraIndex } = useContext(CameraContext);
  const [currentModel, setCurrentModel] = useState(null);
  const [uploadedModelPath, setUploadedModelPath] = useState(null);
  const defaultModelPath = "/Tetrad-Ruben-Midi-Standard.fbx";
  const fileInputRef = useRef(null);
  const textureLoader = useRef(new TextureLoader()).current;

  useEffect(() => {
    const modelPath = uploadedModelPath || defaultModelPath;

    const loadModel = () => {
      const loader = new FBXLoader();
      loader.load(
        modelPath,
        (loadedModel) => {
          // if (currentModel) {
          //   disposeModel(currentModel);
          // }

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

  const disposeModel = (model) => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();

        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material?.dispose();
        }

        if (child.material?.map) {
          child.material.map.dispose();
        }
      }
    });
  };

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

      <Canvas
        shadows
        style={{ backgroundColor: "#EFEFEF" }}
        camera={{
          position: [
            cameras[activeCameraIndex]?.settings?.position.x || 0,
            cameras[activeCameraIndex]?.settings?.position.y || 5,
            cameras[activeCameraIndex]?.settings?.position.z || 10,
          ],
          fov: cameras[activeCameraIndex]?.settings?.fov || 50,
          near: cameras[activeCameraIndex]?.settings?.near || 0.1,
          far: cameras[activeCameraIndex]?.settings?.far || 1000,
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
                  groundColor={light.groundColor || "#0000ff"}
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
        {/* {currentModel && <primitive object={currentModel} />} */}
        {currentModel && (
          <PreviewScene
            model={currentModel}
            setCurrentModel={setCurrentModel}
          />
        )}
        <gridHelper args={[100, 100, "#ffffff", "#555555"]} />
        <OrbitControls />
        {cameras.map((camera, index) => (
          <CustomCameraHelper key={index} cameraSettings={camera.settings} />
        ))}
        <CameraUpdater />
      </Canvas>
    </>
  );
};

export default Preview;
