"use client";
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import * as THREE from "three";

export const MapContext = createContext();

export const MapProvider = ({ children, initialMaterialParams = {} }) => {
  const [connectedMaps, setConnectedMaps] = useState({});
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [materialParams, setMaterialParams] = useState({
    materialName: initialMaterialParams.materialName || "", // Add materialName here

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
    opacity: initialMaterialParams.opacity || 1.0,
  });

  const [materialId, setMaterialId] = useState(null);

  useEffect(() => {
    const fetchMaterialParams = async () => {
      if (!materialId) return;

      try {
        const response = await axios.get(`/api/maps?id=${materialId}`);
        const mapsData = response.data.map;

        setMaterialParams((prev) => ({
          ...prev,
          ...mapsData,
        }));

        setConnectedMaps({
          diffuseMapUrl: mapsData.diffuseMapUrl || null,
          bumpMapUrl: mapsData.bumpMapUrl || null,
          normalMapUrl: mapsData.normalMapUrl || null,
          displacementMapUrl: mapsData.displacementMapUrl || null,
          emissiveMapUrl: mapsData.emissiveMapUrl || null,
          aoMapUrl: mapsData.aoMapUrl || null,
          metalnessMapUrl: mapsData.metalnessMapUrl || null,
          roughnessMapUrl: mapsData.roughnessMapUrl || null,
          clearcoatMapUrl: mapsData.clearcoatMapUrl || null,
          envMapUrl: mapsData.envMapUrl || null,
          anisotropyMapUrl: mapsData.anisotropyMapUrl || null,
          sheenMapUrl: mapsData.sheenMapUrl || null,
        });
      } catch (error) {
        console.error("Error fetching maps:", error);
      }
    };

    fetchMaterialParams();
  }, [materialId]);

  const updateConnectedMaps = (mapType, file) => {
    setConnectedMaps((prev) => ({
      ...prev,
      [mapType]: file,
    }));
    setUpdateTrigger((prev) => prev + 1);
  };

  const disconnectMap = (mapType) => {
    setConnectedMaps((prev) => {
      const updatedMaps = { ...prev };
      delete updatedMaps[mapType];
      return updatedMaps;
    });
    setUpdateTrigger((prev) => prev + 1);
  };

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
            [param]: { ...value },
          };
        }
      }
      return {
        ...prevParams,
        [param]: value,
      };
    });
  };

  const setInitialId = (id) => {
    setMaterialId(id);
  };

  return (
    <MapContext.Provider
      value={{
        connectedMaps,
        updateConnectedMaps,
        disconnectMap,
        materialParams,
        updateMaterialParams,
        updateTrigger,
        setInitialId,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
