"use client";
import React, { createContext, useState } from "react";

export const LightContext = createContext();

export const LightProvider = ({ children }) => {
  const maxLightsPerType = 5;

  const [lights, setLights] = useState([
    { id: 1, type: "AMBIENT", name: "Ambient Light", intensity: 0.5 },
    {
      id: 2,
      type: "DIRECTIONAL",
      name: "Directional Light",
      intensity: 0.8,
      position: { x: 0, y: 5, z: 5 },
      // castShadow: true,
      bias: -0.005,
    },
    {
      id: 3,
      type: "HEMISPHERE",
      name: "Hemisphere Light",
      intensity: 0.6,
      color: "#ffffff",
      groundColor: "#0000ff",
    },
    {
      id: 4,
      type: "SPOT",
      name: "Spot Light 1",
      intensity: 0.7,
      position: { x: 2, y: 5, z: 2 },
      angle: 0.3,
      decay: 2,
      castShadow: true,
    },
    {
      id: 5,
      type: "SPOT",
      name: "Spot Light 2",
      intensity: 0.7,
      position: { x: -2, y: 5, z: -2 },
      angle: 0.3,
      decay: 2,
      castShadow: true,
    },
  ]);

  const updateLight = (id, newSettings) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id ? { ...light, ...newSettings } : light
      )
    );
  };

  const deleteLight = (id) => {
    setLights((prevLights) => prevLights.filter((light) => light.id !== id));
  };

  const addLight = (newLight) => {
    const newLightId = lights.length + 1;

    const typeCount = lights.filter((l) => l.type === newLight.type).length;
    if (typeCount >= maxLightsPerType) {
      console.error(
        `Maximum ${maxLightsPerType} lights allowed for ${newLight.type}`
      );
      return;
    }

    const lightSettings = {
      AMBIENT: { intensity: 0.5 },
      DIRECTIONAL: {
        intensity: 1,
        position: { x: 0, y: 5, z: 0 },
        castShadow: false,
        bias: -0.005,
      },
      HEMISPHERE: {
        intensity: 0.6,
        color: "#ffffff",
        groundColor: "#0000ff",
      },
      SPOT: {
        intensity: 0.7,
        position: { x: 2, y: 5, z: 2 },
        angle: 0.3,
        decay: 2,
        castShadow: true,
      },
    };

    const lightType = newLight.type.toUpperCase();

    if (!lightSettings[lightType]) {
      console.error("Invalid light type:", lightType);
      return;
    }

    const newLightWithSettings = {
      id: newLightId,
      type: lightType,
      name: newLight.name,
      ...lightSettings[lightType],
    };

    setLights((prevLights) => [...prevLights, newLightWithSettings]);
  };

  const renameLight = (id, newName) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id ? { ...light, name: newName } : light
      )
    );
  };

  const duplicateLight = (id) => {
    const lightToDuplicate = lights.find((light) => light.id === id);
    if (!lightToDuplicate) return;

    const typeCount = lights.filter(
      (l) => l.type === lightToDuplicate.type
    ).length;
    if (typeCount >= maxLightsPerType) {
      console.error(
        `Maximum ${maxLightsPerType} lights allowed for ${lightToDuplicate.type}`
      );
      return;
    }

    const newLight = {
      ...lightToDuplicate,
      id: lights.length + 1,
      name: `${lightToDuplicate.name} (Copy)`,
    };
    setLights((prevLights) => [...prevLights, newLight]);
  };

  return (
    <LightContext.Provider
      value={{
        lights,
        updateLight,
        deleteLight,
        addLight,
        renameLight,
        duplicateLight,
      }}
    >
      {children}
    </LightContext.Provider>
  );
};
