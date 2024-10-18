"use client";
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";

export const LightContext = createContext();

export const LightProvider = ({ children }) => {
  const maxLightsPerType = 5;
  const minLights = 1;
  const [lights, setLights] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  // Light presets definition to initialize new lights
  const lightPresets = {
    AMBIENT: (apiLight) => ({
      id: apiLight.id,
      type: "AMBIENT",
      name: apiLight.name || "Ambient Light",
      intensity: apiLight.intensity || 0.5,
    }),
    DIRECTIONAL: (apiLight) => ({
      id: apiLight.id,
      type: "DIRECTIONAL",
      name: apiLight.name || "Directional Light",
      intensity: apiLight.intensity || 1,
      position: apiLight.position
        ? { ...JSON.parse(apiLight.position) }
        : { x: 0, y: 5, z: 0 },
      bias: apiLight.bias || -0.005,
    }),
    HEMISPHERE: (apiLight) => ({
      id: apiLight.id,
      type: "HEMISPHERE",
      name: apiLight.name || "Hemisphere Light",
      intensity: apiLight.intensity || 0.6,
      color: apiLight.color || "#ffffff",
      groundColor: apiLight.groundColor || "#0000ff",
    }),
    SPOT: (apiLight) => ({
      id: apiLight.id,
      type: "SPOT",
      name: apiLight.name || "Spot Light",
      intensity: apiLight.intensity || 0.7,
      position: apiLight.position
        ? { ...JSON.parse(apiLight.position) }
        : { x: 2, y: 5, z: 2 },
      angle: apiLight.angle || 0.3,
      decay: apiLight.decay || 2,
      castShadow:
        apiLight.castShadow !== undefined ? apiLight.castShadow : true,
    }),
  };

  // Fetch default lights from API on component mount
  useEffect(() => {
    const fetchLightsFromAPI = async () => {
      try {
        const response = await axios.get("/api/getdefault", {
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const apiProject = response.data;
        if (!apiProject || !apiProject.lightSettings) {
          console.error("No light settings found in the response.");
          return;
        }

        const apiLights = apiProject.lightSettings;

        const mappedLights = apiLights.map((apiLight, index) => {
          const lightType = apiLight.lightType.toUpperCase();

          if (lightPresets[lightType]) {
            return lightPresets[lightType]({
              ...apiLight,
              id: index + 1,
            });
          }

          console.error(`Light type ${lightType} is not supported.`);
          return null;
        });

        setLights(mappedLights.filter((light) => light !== null));
        setSnackbarOpen(true);
        setSnackbarMessage("Default light settings loaded successfully!");
        setSeverity("success");
      } catch (error) {
        console.error("Failed to fetch lights from API:", error);
      }
    };

    fetchLightsFromAPI();
  }, []);

  // Update light settings by ID, ensuring deep copy of nested objects like `position` or `target`
  const updateLight = (id, newSettings) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id
          ? {
              ...light,
              ...newSettings,
              position: newSettings.position
                ? { ...newSettings.position }
                : light.position,
              target: newSettings.target
                ? { ...newSettings.target }
                : light.target,
              name: newSettings.name || light.name,
            }
          : light
      )
    );
  };

  // Delete a light by ID, ensuring minimum one light remains
  const deleteLight = (id) => {
    if (lights.length > minLights) {
      setLights((prevLights) => {
        const updatedLights = prevLights.filter((light) => light.id !== id);
        return updatedLights.map((light, index) => ({
          ...light,
          id: index + 1,
        }));
      });
    } else {
      console.error("Minimum 1 light required.");
      setSnackbarOpen(true);
      setSnackbarMessage("Minimum 1 light required.");
      setSeverity("warning");
    }
  };

  // Add a new light, ensuring it follows presets and deep copying the settings
  const addLight = (newLight) => {
    const typeCount = lights.filter((l) => l.type === newLight.type).length;
    if (typeCount >= maxLightsPerType) {
      console.error(
        `Maximum ${maxLightsPerType} lights allowed for ${newLight.type}`
      );
      setSnackbarOpen(true);
      setSnackbarMessage(
        `Maximum ${maxLightsPerType} lights allowed for ${newLight.type}`
      );
      setSeverity("warning");
      return;
    }

    const lightType = newLight.type.toUpperCase();

    if (lightPresets[lightType]) {
      const newLightWithSettings = {
        id: lights.length + 1,
        ...JSON.parse(JSON.stringify(lightPresets[lightType](newLight))),
      };
      setLights((prevLights) => [...prevLights, newLightWithSettings]);
    } else {
      console.error("Invalid light type:", lightType);
    }
  };

  // Rename a light by ID
  const renameLight = (id, newName) => {
    setLights((prevLights) =>
      prevLights.map((light) =>
        light.id === id ? { ...light, name: newName } : light
      )
    );
  };

  // Duplicate a light by ID, ensuring a unique new copy is created
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
      setSnackbarOpen(true);
      setSnackbarMessage(
        `Maximum ${maxLightsPerType} lights allowed for ${lightToDuplicate.type}`
      );
      setSeverity("warning");
      return;
    }

    const newLight = {
      ...JSON.parse(JSON.stringify(lightToDuplicate)),
      id: lights.length + 1,
      name: `${lightToDuplicate.name} (Copy)`,
    };
    setLights((prevLights) => [...prevLights, newLight]);
  };

  // Save lights settings to the server
  const handleSaveLights = async (projectName) => {
    try {
      const formattedLights = lights.map((light) => ({
        ...light,
        targetPosition: light.target ? light.target : null,
      }));

      console.log("Project Name:", projectName);
      console.log("Formatted Lights Data Sent:", formattedLights);

      const response = await axios.post("/api/lights", {
        projectName,
        lightSettings: formattedLights,
      });

      if (response.data.status === "success") {
        console.log("Project and lights saved successfully!");
      } else {
        console.error("Failed to save project and lights.");
      }
    } catch (error) {
      console.error("Error saving project and lights:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
        handleSaveLights,
      }}
    >
      {children}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LightContext.Provider>
  );
};
