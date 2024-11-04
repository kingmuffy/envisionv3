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
    emissiveColor: initialMaterialParams.emissiveColor || 0x00000,
    diffuseColor: initialMaterialParams.diffuseColor || null,
    envMapIntensity: initialMaterialParams.envMapIntensity || 0.0,
    scaleX: initialMaterialParams.scaleX || 1.0,
    scaleY: initialMaterialParams.scaleY || 1.0,
    ior: initialMaterialParams.ior || 1.5,
    refractionRatio: initialMaterialParams.refractionRatio || 0.98,
    diffuseColorEnabled: initialMaterialParams.diffuseColorEnabled || false,

    anisotropy: initialMaterialParams.anisotropy || 0.0,
    fresnelColor: initialMaterialParams.fresnelColor || { r: 1, g: 0, b: 0 },
    fresnelIntensity: initialMaterialParams.fresnelIntensity || 1.0,
    fresnelPower: initialMaterialParams.fresnelPower || 2.0,
    fresnelBias: initialMaterialParams.fresnelBias || 0.1,
    diffuseMapEnabled: initialMaterialParams.diffuseMapEnabled || true,
    environmentMapEnabled: initialMaterialParams.environmentMapEnabled || true,
    refractionMapEnabled: initialMaterialParams.refractionMapEnabled || true,
    bumpMapEnabled: initialMaterialParams.bumpMapEnabled || true,
    normalMapEnabled: initialMaterialParams.normalMapEnabled || true,
    displacementMapEnabled:
      initialMaterialParams.displacementMapEnabled || true,
    clearcoatMapEnabled: initialMaterialParams.clearcoatMapEnabled || true,
    emissiveMapEnabled: initialMaterialParams.emissiveMapEnabled || true,
    sheenMapEnabled: initialMaterialParams.sheenMapEnabled || true,
    aoMapEnabled: initialMaterialParams.aoMapEnabled || true,
    metalnessMapEnabled: initialMaterialParams.metalnessMapEnabled || true,
    roughnessMapEnabled: initialMaterialParams.roughnessMapEnabled || true,
    anisotropyMapEnabled: initialMaterialParams.anisotropyMapEnabled || true,
    fresnelEnabled: initialMaterialParams.fresnelEnabled || false, // Add this line
  });

  const updateConnectedMaps = (mapType, file) => {
    setConnectedMaps((prev) => ({
      ...prev,
      [mapType]: file,
    }));
    setUpdateTrigger1((prev) => prev + 1);
  };

  const disconnectMap = (mapType) => {
    setConnectedMaps((prev) => {
      const updatedMaps = { ...prev };
      delete updatedMaps[mapType];
      return updatedMaps;
    });
    setUpdateTrigger1((prev) => prev + 1);
  };

  const updateMaterialParams = (param, value) => {
    setMaterialParams((prevParams) => {
      if (
        param === "sheenColor" ||
        param === "emissiveColor" ||
        param === "fresnelColor"
      ) {
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
      if (param === "diffuseColor") {
        return { ...prevParams, [param]: value }; // Set hex color directly
      }
      if (param === "diffuseColorEnabled" || param === "diffuseColor") {
        setUpdateTrigger1((prev) => prev + 1);
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
