"use client";
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";

export const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  const [cameras, setCameras] = useState([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const maxCameras = 4;

  const defaultCameraSettings = {
    position: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    near: 0.1,
    far: 1000,
    fov: 50,
    zoom: 1,
    minZoom: 0.1,
    maxZoom: 5,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
  };

  useEffect(() => {
    const fetchDefaultCamera = async () => {
      try {
        const response = await axios.get("/api/getdefaultcamera", {
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        if (response.data.status === "success") {
          const apiCameras = response.data.cameraSettings.map((camera) => ({
            name: camera.name,
            settings: {
              position: JSON.parse(camera.cameraposition || "{}"),
              target: JSON.parse(camera.targetPosition || "{}"),
              near: camera.near || defaultCameraSettings.near,
              far: camera.far || defaultCameraSettings.far,
              fov: camera.fov || defaultCameraSettings.fov,
              zoom: camera.zoom || defaultCameraSettings.zoom, // Add zoom
              minZoom:
                camera.minZoom !== undefined
                  ? camera.minZoom
                  : defaultCameraSettings.minZoom,
              maxZoom:
                camera.maxZoom !== undefined
                  ? camera.maxZoom
                  : defaultCameraSettings.maxZoom,
              minPolarAngle:
                camera.minPolarAngle !== undefined
                  ? camera.minPolarAngle
                  : defaultCameraSettings.minPolarAngle,
              maxPolarAngle:
                camera.maxPolarAngle !== undefined
                  ? camera.maxPolarAngle
                  : defaultCameraSettings.maxPolarAngle,
            },
          }));
          setCameras(apiCameras);
          setSnackbarMessage("Default camera settings loaded successfully!");
          setSnackbarOpen(true);
        } else {
          console.error("Failed to load default camera settings.");
          setSnackbarMessage("Failed to load default camera settings.");
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error("Error fetching default camera settings:", error);
        setSnackbarMessage("Error loading default camera settings.");
        setSnackbarOpen(true);
      }
    };

    fetchDefaultCamera();
  }, []);

  const addCamera = (newCamera) => {
    if (cameras.length < maxCameras) {
      setCameras((prevCameras) => [...prevCameras, newCamera]);
    } else {
      setSnackbarMessage("Max camera limit reached.");
      setSnackbarOpen(true);
    }
  };
  const duplicateCamera = (index) => {
    const cameraToDuplicate = cameras[index];
    const newCamera = {
      ...cameraToDuplicate,
      name: `${cameraToDuplicate.name} (Copy)`,
    };

    if (cameras.length < maxCameras) {
      addCamera(newCamera);
    } else {
      alert("Camera limit reached! Cannot duplicate further.");
    }
  };
  const setActiveCamera = (index) => {
    setActiveCameraIndex(index);
  };
  const renameCamera = (index, newName) => {
    setCameras((prevCameras) => {
      const updatedCameras = [...prevCameras];
      updatedCameras[index] = { ...updatedCameras[index], name: newName };
      return updatedCameras;
    });
  };

  const deleteCamera = (index) => {
    setCameras((prevCameras) => prevCameras.filter((_, i) => i !== index));
    if (activeCameraIndex === index && cameras.length > 1) {
      setActiveCamera(0);
    }
  };
  const updateActiveCameraSettings = (newSettings) => {
    setCameras((prevCameras) => {
      const updatedCameras = [...prevCameras];
      const currentCamera = updatedCameras[activeCameraIndex];

      if (!currentCamera) {
        return prevCameras;
      }

      updatedCameras[activeCameraIndex].settings = {
        ...currentCamera.settings,
        ...newSettings,
        position: {
          ...currentCamera.settings.position,
          ...(newSettings.position || {}),
        },
        target: {
          ...currentCamera.settings.target,
          ...(newSettings.target || {}),
        },
        zoom: newSettings.zoom ?? currentCamera.settings.zoom,
        minZoom: newSettings.minZoom ?? currentCamera.settings.minZoom,
        maxZoom: newSettings.maxZoom ?? currentCamera.settings.maxZoom,
        minPolarAngle:
          newSettings.minPolarAngle ?? currentCamera.settings.minPolarAngle,
        maxPolarAngle:
          newSettings.maxPolarAngle ?? currentCamera.settings.maxPolarAngle,
      };
      return updatedCameras;
    });
  };

  const handleViewCamera = () => {
    setUpdateTrigger((prev) => !prev);
  };

  const resetUpdateTrigger = () => {
    setUpdateTrigger(false);
  };

  const saveCameraSettings = async (projectName) => {
    try {
      const formattedCameras = cameras.map((camera) => ({
        name: camera.name,
        cameraposition: camera.settings.position,
        near: camera.settings.near,
        far: camera.settings.far,
        fov: camera.settings.fov,
        minZoom: camera.settings.minZoom,
        maxZoom: camera.settings.maxZoom,
        minPolarAngle: camera.settings.minPolarAngle,
        maxPolarAngle: camera.settings.maxPolarAngle,
        targetPosition: camera.settings.target,
      }));

      const response = await axios.post("/api/cameras", {
        projectName,
        cameraSettings: formattedCameras,
      });

      if (response.data.status === "success") {
        setSnackbarMessage("Camera settings saved successfully!");
        setSnackbarOpen(true);
        return { status: "success" };
      } else {
        setSnackbarMessage("Failed to save camera settings.");
        setSnackbarOpen(true);
        return { status: "error" };
      }
    } catch (error) {
      console.error("Error saving project and camera settings:", error);
      setSnackbarMessage("Error saving camera settings.");
      setSnackbarOpen(true);
      return { status: "error" };
    }
  };

  return (
    <CameraContext.Provider
      value={{
        cameras,
        activeCameraIndex,
        addCamera,
        setActiveCamera,
        updateActiveCameraSettings,
        saveCameraSettings,
        handleViewCamera,
        resetUpdateTrigger,
        setUpdateTrigger,
        updateTrigger,
        deleteCamera,
        renameCamera,
        duplicateCamera,
      }}
    >
      {children}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </CameraContext.Provider>
  );
};
