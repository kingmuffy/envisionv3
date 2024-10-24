"use client";
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import * as THREE from "three";

export const MapContext = createContext();

export const MapProvider = ({ children, initialMaterialParams = {} }) => {
  const [connectedMaps, setConnectedMaps] = useState({});
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
    anisotropy: initialMaterialParams.anisotropy || 0.0,
  });
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Fetch initial maps data from API
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await axios.get("/api/maps");
        const mapData = response.data.map;

        // Initialize connected maps and material parameters
        setConnectedMaps({
          diffuse: {
            source: mapData.diffuseMapUrl,
            enabled: true,
            initialized: true,
          },
          environment: {
            source: mapData.envMapUrl,
            enabled: true,
            initialized: true,
          },
          refraction: {
            source: mapData.refractionMapUrl,
            enabled: true,
            initialized: true,
          },
          bump: {
            source: mapData.bumpMapUrl,
            enabled: true,
            initialized: true,
          },
          normal: {
            source: mapData.normalMapUrl,
            enabled: true,
            initialized: true,
          },
          displacement: {
            source: mapData.displacementMapUrl,
            enabled: true,
            initialized: true,
          },
          clearcoat: {
            source: mapData.clearcoatMapUrl,
            enabled: true,
            initialized: true,
          },
          emissive: {
            source: mapData.emissiveMapUrl,
            enabled: true,
            initialized: true,
          },
          sheen: {
            source: mapData.sheenMapUrl,
            enabled: true,
            initialized: true,
          },
          ao: { source: mapData.aoMapUrl, enabled: true, initialized: true },
          metalness: {
            source: mapData.metalnessMapUrl,
            enabled: true,
            initialized: true,
          },
          roughness: {
            source: mapData.roughnessMapUrl,
            enabled: true,
            initialized: true,
          },
          anisotropy: {
            source: mapData.anisotropyMapUrl,
            enabled: true,
            initialized: true,
          },
        });

        // Initialize material parameters
        setMaterialParams({
          bumpScale: mapData.bumpScale,
          sheen: mapData.sheen,
          displacementScale: mapData.displacementScale,
          emissiveIntensity: mapData.emissiveIntensity,
          metalness: mapData.metalness,
          roughness: mapData.roughness,
          displacementBias: mapData.displacementBias,
          flatShading: mapData.flatShading,
          aoMapIntensity: mapData.aoMapIntensity,
          clearcoat: mapData.clearcoat,
          normalScaleX: mapData.normalScaleX,
          normalScaleY: mapData.normalScaleY,
          envMapIntensity: mapData.envMapIntensity,
          sheenColor: mapData.sheenColor,
          scaleX: mapData.scaleX,
          scaleY: mapData.scaleY,
          sheenRoughness: mapData.sheenRoughness,
          anisotropy: mapData.anisotropy,
        });
      } catch (error) {
        console.error("Error fetching maps:", error);
      }
    };

    fetchMaps();
  }, []);

  // Function to update a connected map
  const updateConnectedMaps = (mapType, file, isEnabled = true) => {
    setConnectedMaps((prev) => ({
      ...prev,
      [mapType]: { source: file, enabled: isEnabled, initialized: false },
    }));
    setUpdateTrigger((prev) => prev + 1);
  };

  // Function to disconnect a map
  const disconnectMap = (mapType) => {
    setConnectedMaps((prev) => ({
      ...prev,
      [mapType]: { ...prev[mapType], enabled: false },
    }));
    setUpdateTrigger((prev) => prev + 1);
  };

  // Function to reset a map to its initialized state
  const resetMapToInitialized = (mapType) => {
    const updatedMaps = { ...connectedMaps };

    // Check if mapType exists in connectedMaps
    if (!updatedMaps[mapType]) {
      console.error(`Map type "${mapType}" does not exist in connectedMaps`);
      return;
    }

    // Reset map to its original state and ensure it's enabled
    updatedMaps[mapType].enabled = true; // Enable the map
    updatedMaps[mapType].initialized = true; // Mark as initialized (if relevant)

    // Optionally, reset the map source to its original link if stored
    if (updatedMaps[mapType].originalSource) {
      updatedMaps[mapType].source = updatedMaps[mapType].originalSource;
    }

    setConnectedMaps(updatedMaps); // Update the connected maps state
    setMapDisabledState((prevState) => ({
      ...prevState,
      [mapType]: false, // Ensure the toggle is turned ON (false means not disabled)
    }));

    // Reconnect the map to the model after resetting
    if (previewRef.current) {
      previewRef.current.reconnectMapToModel(mapType);
    }
  };

  // Function to update material parameters
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
        resetMapToInitialized, // Provide reset function to context
        materialParams,
        updateMaterialParams,
        updateTrigger,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export default MapProvider;
