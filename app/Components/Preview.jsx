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
import * as THREE from "three";
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
} from "@mui/material";
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
      camera.zoom = activeCameraSettings.zoom || 1;
      camera.updateProjectionMatrix();
      resetUpdateTrigger();
    }
  }, [cameras, activeCameraIndex, updateTrigger, camera, resetUpdateTrigger]);

  return null;
};

const PreviewScene = ({ model, setCurrentModel }) => {
  const { scene } = useThree();

  useEffect(() => {
    if (model) {
      console.log("Adding new model to scene", model);
      scene.add(model);
      setCurrentModel(model);
      return () => {
        console.log("Removing model from scene", model);
        scene.remove(model);
        model.traverse((child) => {
          if (child.isMesh) {
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
  const { connectedMaps, materialParams, updateTrigger1 } =
    useContext(MapContext);
  const { cameras, activeCameraIndex, setActiveCamera, handleViewCamera } =
    useContext(CameraContext);
  const color = new Color()
    .setHex(materialParams.diffuseColor || 0xa26130)
    .convertSRGBToLinear();

  const [currentModel, setCurrentModel] = useState(null);
  const [uploadedModelPath, setUploadedModelPath] = useState(null);
  const defaultModelPath = "/Wood Bros-Askham Large Fabric.fbx";
  const fileInputRef = useRef(null);
  const textureLoader = useRef(new TextureLoader()).current;
  const orbitControlsRef = useRef();
  const materialRef = useRef();

  useEffect(() => {
    const modelPath = uploadedModelPath || defaultModelPath;

    const loadModel = () => {
      const loader = new FBXLoader();
      loader.load(
        modelPath,
        (loadedModel) => {
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              if (!materialRef.current) {
                materialRef.current = createMaterial();
              }
              child.material = materialRef.current;
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
  console.log("diffuseColor1", materialParams.diffuseColor);
  console.log("sheenColor", materialParams.sheenColor);
  console.log("emissiveColor", materialParams.diffuseColorEnabled);
  useEffect(() => {
    if (currentModel) {
      currentModel.traverse((child) => {
        if (child.isMesh && child.material) {
          updateMaterialProperties(child.material);
          updateTextures(child.material);
        }
      });
    }
  }, [currentModel, updateTrigger1, connectedMaps, materialParams]);

  useEffect(() => {
    if (orbitControlsRef.current && cameras.length > 0) {
      const activeCameraSettings = cameras[activeCameraIndex].settings;

      orbitControlsRef.current.object.position.set(
        activeCameraSettings.position.x,
        activeCameraSettings.position.y,
        activeCameraSettings.position.z
      );

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

      orbitControlsRef.current.update();
    }
  }, [activeCameraIndex, cameras, orbitControlsRef]);

  const handleCameraSelectChange = (event) => {
    const selectedIndex = event.target.value;
    setActiveCamera(selectedIndex);
    handleViewCamera();
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

  const createMaterial = () => {
    const material = new MeshPhysicalMaterial({
      color: new Color(materialParams.diffuseColor || 0xffffff),
      roughness: materialParams.roughness || 0.5,
      metalness: materialParams.metalness || 0.5,
      side: DoubleSide,
    });

    // material.onBeforeCompile = (shader) => {
    //   shader.uniforms.fresnelColor = {
    //     value: new THREE.Color(
    //       materialParams.fresnelColor?.r || 1,
    //       materialParams.fresnelColor?.g || 1,
    //       materialParams.fresnelColor?.b || 1
    //     ),
    //   };
    //   shader.uniforms.fresnelIntensity = {
    //     value: materialParams.fresnelIntensity || 1.0,
    //   };
    //   shader.uniforms.fresnelPower = {
    //     value: materialParams.fresnelPower || 2.0,
    //   };

    //   const disabled = 1; // Value that disables the Fresnel effect
    //   shader.uniforms.fresnelBias = {
    //     value: materialParams.fresnelEnabled
    //       ? materialParams.fresnelBias || 0.1
    //       : disabled,
    //   };

    //   // Customize vertex shader
    //   shader.vertexShader = `
    //     varying vec3 vWorldPosition;
    //     varying vec3 vNormalW;
    //     ${shader.vertexShader}
    //   `.replace(
    //     `#include <worldpos_vertex>`,
    //     `#include <worldpos_vertex>
    //     vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    //     vNormalW = normalize(normalMatrix * normal);
    //   `
    //   );

    //   // Customize fragment shader
    //   shader.fragmentShader = `
    //     uniform vec3 fresnelColor;
    //     uniform float fresnelIntensity;
    //     uniform float fresnelPower;
    //     uniform float fresnelBias;
    //     varying vec3 vWorldPosition;
    //     varying vec3 vNormalW;

    //     float fresnelEffect(vec3 viewDir, vec3 normal) {
    //       return fresnelIntensity * pow(1.0 - max(dot(viewDir, normal), fresnelBias), fresnelPower);
    //     }

    //     ${shader.fragmentShader}
    //   `.replace(
    //     `#include <dithering_fragment>`,
    //     `
    //     vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    //     float fresnelFactor = fresnelEffect(viewDir, vNormalW);
    //     vec3 fresnelBlendedColor = mix(gl_FragColor.rgb, fresnelColor, fresnelFactor);
    //     gl_FragColor.rgb = fresnelBlendedColor;
    //     #include <dithering_fragment>
    //     `
    //   );

    //   // Save the shader reference for dynamic updates
    //   material.userData.shader = shader;
    // };

    return material;
  };

  // Hook to update fresnel-related uniforms
  useEffect(() => {
    if (materialRef.current && materialRef.current.userData.shader) {
      const { shader } = materialRef.current.userData;

      // Update or delete the Fresnel define based on `fresnelEnabled`
      if (materialParams.fresnelEnabled) {
        shader.defines.USE_FRESNEL = ""; // Add the define to enable Fresnel calculations
        shader.uniforms.fresnelBias.value = materialParams.fresnelBias || 0.1;
      } else {
        delete shader.defines.USE_FRESNEL; // Remove the define to disable Fresnel calculations
        shader.uniforms.fresnelBias.value = 1; // Disable Fresnel by setting the bias to 1
      }

      // Update other uniforms
      shader.uniforms.fresnelIntensity.value =
        materialParams.fresnelIntensity || 1.0;
      shader.uniforms.fresnelPower.value = materialParams.fresnelPower || 2.0;
      shader.uniforms.fresnelColor.value = new Color(
        materialParams.fresnelColor?.r || 1,
        materialParams.fresnelColor?.g || 0,
        materialParams.fresnelColor?.b || 0
      );

      // Ensure the shader and material are updated
      shader.uniformsNeedUpdate = true;
      materialRef.current.needsUpdate = true;
    }
  }, [
    materialParams.fresnelEnabled,
    materialParams.fresnelIntensity,
    materialParams.fresnelPower,
    materialParams.fresnelBias,
    materialParams.fresnelColor,
  ]);

  const extractMaterialProperties = () => {
    // const sheenColor = new Color(
    //   materialParams.sheenColor?.r || 0,
    //   materialParams.sheenColor?.g || 0,
    //   materialParams.sheenColor?.b || 0
    // );

    const emissiveColor = new Color(
      materialParams.emissiveColor?.r || 0,
      materialParams.emissiveColor?.g || 0,
      materialParams.emissiveColor?.b || 0
    );
    console.log("inthe check", materialParams.sheenColor);
    return {
      metalness: materialParams.metalness || 0,
      roughness: materialParams.roughness || 1,
      bumpScale: materialParams.bumpScale || 0,
      sheen: materialParams.sheenEnabled || false,
      sheenRoughness: materialParams.sheenRoughness || 1.0,
      sheenColor: new Color(materialParams.sheenColor),
      displacementScale: materialParams.displacementScale || 0,
      displacementBias: materialParams.displacementBias || 0,
      aoMapIntensity: materialParams.aoMapIntensity || 1,
      emissive: emissiveColor,
      emissiveIntensity: materialParams.emissiveIntensity || 0,
      color: materialParams.diffuseColorEnabled
        ? new Color(materialParams.diffuseColor)
        : new Color("#F6F6F6"),
      clearcoat: materialParams.clearcoat || 0,
      envMapIntensity: materialParams.envMapIntensity || 0,
      anisotropy: materialParams.anisotropy || 0,
      ior: materialParams.ior || 1.5,
      refractionRatio: materialParams.refractionRatio || 0.98,
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
    const currentMapTypes = Object.keys(connectedMaps || []);
    console.log("currentMapTypes", currentMapTypes);
    currentMapTypes.forEach((mapType) => {
      const file = connectedMaps[mapType];
      const enabledKey = `${mapType.toLowerCase()}MapEnabled`; // Correctly match the enabled property
      const isEnabled = materialParams[enabledKey]; // Check if the map type is enabled

      if (file && isEnabled) {
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
