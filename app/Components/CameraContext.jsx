"use client";
import React, { createContext, useState } from "react";

export const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  const [cameras, setCameras] = useState([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [cameraHelpers, setCameraHelpers] = useState([]); //1

  const maxCameras = 4;

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
  }; //

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

  // update the active camera settings
  const updateActiveCameraSettings = (newSettings) => {
    setCameras((prevCameras) => {
      const updatedCameras = [...prevCameras];
      updatedCameras[activeCameraIndex].settings = {
        ...updatedCameras[activeCameraIndex].settings,
        ...newSettings,
      };
      return updatedCameras;
    });
  };

  const addCamera = (newCamera) => {
    setCameras((prevCameras) => [...prevCameras, newCamera]);
    setActiveCameraIndex(cameras.length);
  };

  const setActiveCamera = (index) => {
    setActiveCameraIndex(index);
  };

  const handleViewCamera = () => {
    setUpdateTrigger((prev) => !prev); // Toggle the state to force re-render
  };

  const resetUpdateTrigger = () => {
    setUpdateTrigger(false);
  };

  const saveCameraSettings = () => {
    console.log("Camera settings saved.");
  };

  return (
    <CameraContext.Provider
      value={{
        cameras,
        activeCameraIndex,
        addCamera,
        setActiveCamera,
        handleViewCamera,
        saveCameraSettings,
        updateTrigger,
        resetUpdateTrigger,
        updateActiveCameraSettings,
        renameCamera,
        deleteCamera,
        duplicateCamera,
        setCameraHelpers,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};
//1 camera full working with context + menu
//v4 - with UI with figma
