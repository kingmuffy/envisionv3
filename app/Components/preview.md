"use client";
import React, { useEffect, useState, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import {
MeshPhysicalMaterial,
TextureLoader,
LinearSRGBColorSpace,
SRGBColorSpace,
DoubleSide,
Vector2,
RepeatWrapping,
} from "three";
import { LightContext } from "./LightContext";
import { MapContext } from "../MapContext";

const Preview = () => {
const { lights } = useContext(LightContext);
const { connectedMaps, updateTrigger } = useContext(MapContext);
const [currentModel, setCurrentModel] = useState(null);
const modelPath = "/Tetrad-Ruben-Midi-Standard.fbx";

useEffect(() => {
const loadModel = () => {
if (currentModel) {
currentModel.traverse((child) => {
if (child.isMesh) {
child.geometry.dispose();
if (child.material.isMaterial) {
child.material.dispose();
}
}
});
setCurrentModel(null);
}

      const loader = new FBXLoader();
      loader.load(
        modelPath,
        (loadedModel) => {
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.material = new MeshPhysicalMaterial({
                color: 0xffffff,
                side: DoubleSide,
                metalness: 0.0, // Set default to non-metallic
                roughness: 1.0, // Set default roughness
              });
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

}, [modelPath]);

// Update textures and materials whenever `updateTrigger` changes
useEffect(() => {
if (!currentModel) {
return;
}

    const loader = new TextureLoader();

    currentModel.traverse((child) => {
      if (child.isMesh) {
        const material = child.material;

        // Remove all maps to reset before applying new ones
        material.map = null;
        material.bumpMap = null;
        material.normalMap = null;
        material.displacementMap = null;
        material.emissiveMap = null;
        material.aoMap = null;
        material.metalnessMap = null;
        material.roughnessMap = null;

        // Reset metalness and roughness to default values
        material.metalness = 0.0;
        material.roughness = 1.0;

        // Apply maps from connectedMaps
        Object.entries(connectedMaps).forEach(([mapType, file]) => {
          if (file) {
            const textureURL = URL.createObjectURL(file);

            loader.load(
              textureURL,
              (texture) => {
                // Determine the appropriate color space for the texture
                if (["DIFFUSE", "EMISSIVE"].includes(mapType.toUpperCase())) {
                  texture.colorSpace = SRGBColorSpace;
                } else {
                  texture.colorSpace = LinearSRGBColorSpace;
                }

                texture.wrapS = RepeatWrapping;
                texture.wrapT = RepeatWrapping;

                switch (mapType.toUpperCase()) {
                  case "DIFFUSE":
                    material.map = texture;
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
                    // Do not force metalness to 1.0; instead, let the texture control it
                    break;
                  case "ROUGHNESS":
                    material.roughnessMap = texture;
                    break;
                  default:
                    console.warn(`Unknown map type: ${mapType}`);
                    break;
                }

                material.needsUpdate = true;
              },
              undefined,
              (error) => {
                console.error(`Failed to load texture for ${mapType}:`, error);
              }
            );
          }
        });

        // Ensure the material is updated after any change
        material.bumpScale = 1.0;
        material.normalScale = new Vector2(1, 1);
        material.side = DoubleSide;
        material.needsUpdate = true;
      }
    });

}, [currentModel, updateTrigger, connectedMaps]);

return (
<Canvas
shadows
camera={{ position: [0, 5, 10], fov: 50 }}
style={{ backgroundColor: "#EFEFEF" }} >
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
);
};

export default Preview;
