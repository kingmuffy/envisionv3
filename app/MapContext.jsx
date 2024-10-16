"use client";
import React, { createContext, useState } from "react";
import * as THREE from "three";
export const MapContext = createContext();

export const MapProvider = ({ children, initialMaterialParams = {} }) => {
  const [connectedMaps, setConnectedMaps] = useState({});
  const [updateTrigger1, setUpdateTrigger1] = useState(0);

  const [materialParams, setMaterialParams] = useState({
    bumpScale: initialMaterialParams.bumpScale || 0.0,
    sheen: initialMaterialParams.sheen || true,
    displacementScale: initialMaterialParams.displacementScale || 0.0,
    emissiveIntensity: initialMaterialParams.emissiveIntensity || 0.0,
    metalness: initialMaterialParams.metalness || 0.0,
    roughness: initialMaterialParams.roughness || 1.0,
    displacementBias: initialMaterialParams.displacementBias || 0.0,
    flatShading: initialMaterialParams.flatShading || false,
    aoMapIntensity: initialMaterialParams.aoMapIntensity || 0.0,
    clearcoat: initialMaterialParams.clearcoat || 0.0,
    normalScaleX: initialMaterialParams.normalScaleX || 1.0,
    normalScaleY: initialMaterialParams.normalScaleY || 1.0,
    sheenColor: initialMaterialParams.sheenColor || { r: 1, g: 1, b: 1 },
    sheenRoughness: initialMaterialParams.sheenRoughness || 1.0,
    sheenEnabled: initialMaterialParams.sheenEnabled || false,
    emissiveColor: initialMaterialParams.emissiveColor || { r: 0, g: 0, b: 0 },
    envMapIntensity: initialMaterialParams.envMapIntensity || 0.0,
    scaleX: initialMaterialParams.scaleX || 1.0,
    scaleY: initialMaterialParams.scaleY || 1.0,
    // sheen: initialMaterialParams.sheen || 0.0,
    anisotropy: initialMaterialParams.anisotropy || 0.0,
  });

  const updateConnectedMaps = (mapType, file) => {
    setConnectedMaps((prev) => ({
      ...prev,
      [mapType]: file,
    }));
    // Trigger an update
    setUpdateTrigger1((prev) => prev + 1);
  };

  // Function to disconnect a map by its type
  const disconnectMap = (mapType) => {
    setConnectedMaps((prev) => {
      const updatedMaps = { ...prev };
      delete updatedMaps[mapType];
      return updatedMaps;
    });
    // Trigger an update after disconnection
    setUpdateTrigger1((prev) => prev + 1);
  };

  // Function to update material parameters in the state
  const updateMaterialParams = (param, value) => {
    setMaterialParams((prevParams) => {
      if (param === "sheenColor" || param === "emissiveColor") {
        if (typeof value === "string" && value.startsWith("#")) {
          const color = new THREE.Color(value);
          return {
            ...prevParams,
            [param]: { r: color.r, g: color.g, b: color.b },
          };
        } else if (typeof value === "object" && value.r !== undefined) {
          return {
            ...prevParams,
            [param]: { ...prevParams[param], ...value },
          };
        }
      }
      if (param === "normalScaleX" || param === "normalScaleY") {
        return {
          ...prevParams,
          [param]: value,
        };
      }
      return {
        ...prevParams,
        [param]: value,
      };
    });
  };

  return (
    <MapContext.Provider
      value={{
        connectedMaps,
        updateConnectedMaps,
        disconnectMap,
        materialParams,
        updateMaterialParams,
        updateTrigger1,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export default MapProvider;
//v2 with figma design
