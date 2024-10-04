"use client";
import React, { createContext, useState } from "react";
import * as THREE from "three"; // Import THREE for color conversion

// Create the context
export const MapContext = createContext();

// Define the provider component
export const MapProvider = ({ children, initialMaterialParams = {} }) => {
  // State for connected maps, used to manage map types and their associated files
  const [connectedMaps, setConnectedMaps] = useState({});

  // State for material parameters, with defaults or values provided via initialMaterialParams
  const [materialParams, setMaterialParams] = useState({
    bumpScale: initialMaterialParams.bumpScale || 0.0,
    sheen: initialMaterialParams.sheen || true, // Set sheen to true to ensure it's enabled by default
    displacementScale: initialMaterialParams.displacementScale || 0.0,
    emissiveIntensity: initialMaterialParams.emissiveIntensity || 0.0,
    metalness: initialMaterialParams.metalness || 0.0,
    roughness: initialMaterialParams.roughness || 1.0,
    displacementBias: initialMaterialParams.displacementBias || 0.0,
    flatShading: initialMaterialParams.flatShading || false,
    aoMapIntensity: initialMaterialParams.aoMapIntensity || 0.0,
    clearcoat: initialMaterialParams.clearcoat || 0.0,
    normalScale: {
      x: initialMaterialParams.normalScaleX || 1.0,
      y: initialMaterialParams.normalScaleY || 1.0,
    },
    sheenColor: initialMaterialParams.sheenColor || { r: 1, g: 1, b: 1 }, // Default to white sheen color
    sheenRoughness: initialMaterialParams.sheenRoughness || 1.0,
    sheenEnabled: initialMaterialParams.sheenEnabled || false, // Track if sheen is enabled
  });

  // Function to update connected maps by map type (e.g., bump, displacement, etc.)
  const updateConnectedMaps = (mapType, file) => {
    setConnectedMaps((prev) => ({
      ...prev,
      [mapType]: file,
    }));
  };

  // Function to disconnect a map by its type
  const disconnectMap = (mapType) => {
    setConnectedMaps((prev) => {
      const updatedMaps = { ...prev };
      delete updatedMaps[mapType];
      return updatedMaps;
    });
  };

  // Function to update material parameters in the state
  const updateMaterialParams = (param, value) => {
    setMaterialParams((prevParams) => {
      // Handle sheenColor: it could come as a hex string or an RGB object
      if (param === "sheenColor") {
        if (typeof value === "string" && value.startsWith("#")) {
          // Convert hex to RGB format using THREE.Color
          const color = new THREE.Color(value);
          return {
            ...prevParams,
            sheenColor: {
              r: color.r,
              g: color.g,
              b: color.b,
            },
          };
        } else if (typeof value === "object" && value.r !== undefined) {
          // If it's already an RGB object, update directly
          return {
            ...prevParams,
            sheenColor: {
              ...prevParams.sheenColor,
              ...value,
            },
          };
        }
      }

      // If updating normalScale, handle x and y separately
      if (param === "normalScaleX" || param === "normalScaleY") {
        return {
          ...prevParams,
          normalScale: {
            ...prevParams.normalScale,
            [param === "normalScaleX" ? "x" : "y"]: value,
          },
        };
      }

      // Update any other material parameter
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
        disconnectMap, // Provide disconnectMap in the context value
        materialParams,
        updateMaterialParams,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
