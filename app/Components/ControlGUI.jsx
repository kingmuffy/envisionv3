/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  AppBar,
  Toolbar,
  Divider,
  Dialog,
  DialogContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Alert,
  Snackbar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import VideocamIcon from "@mui/icons-material/Videocam";
import CachedIcon from "@mui/icons-material/Cached";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CheckIcon from "@mui/icons-material/Check";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import CustomSlider from "./Styles/CustomSlider.jsx";
import CameraSettings from "./Settings/CameraSettings";
import ColorPicker from "./Styles/ColorPicker.jsx";
import LightSettings from "./Settings/LightSettings.jsx";
import { LightContext } from "../Components/LightContext.jsx";
import { CameraContext } from "../Components/CameraContext.jsx";
import { MapContext } from "../MapContext.jsx";
import { Switch, FormControlLabel } from "@mui/material";
import { ChromePicker } from "react-color";
import axios from "axios";
import MaterialList from "./Dialog/MaterialList.jsx";
import LightList from "./Dialog/LightList.jsx";
import CameraList from "./Dialog/CameraList.jsx";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useRouter } from "next/navigation";

const ControlGUI = ({ addMapNode, setShowReactFlow }) => {
  const { connectedMaps, materialParams, updateConnectedMaps } =
    useContext(MapContext);
  const [open, setOpen] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("materials");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { lights, handleSaveLights } = useContext(LightContext);

  const { updateMaterialParams } = useContext(MapContext);
  //maps state
  //state
  const [bumpScale, setBumpScale] = useState(0.0);
  const [normalX, setNormalX] = useState(1);
  const [normalY, setNormalY] = useState(1);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [displacementScale, setDisplacementScale] = useState(1);
  const [displacementBias, setDisplacementBias] = useState(0);
  const [metalness, setMetalness] = useState(0.0);
  const [roughness, setRoughness] = useState(0.0);
  const [emissive, setEmissive] = useState(0);
  const [envIntensity, setEnvIntensity] = useState(0);
  const [clearcoat, setClearcoat] = useState(0);
  // const [specular, setSpecular] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [ao, setAo] = useState(1);
  const [sheen, setSheenIntensity] = useState(0);
  // const [sheenIntensity, setSheenIntensity] = useState(0);
  const [sheenRoughness, setSheenRoughness] = useState(1);
  const [sheenColor, setSheenColor] = useState({ r: 1, g: 1, b: 1 });
  const [sheenEnabled, setSheenEnabled] = useState(false);
  const [emissiveColor, setEmissiveColor] = useState({ r: 0, g: 0, b: 0 });
  const [anisotropy, setAnisotropy] = useState(0);
  const [loading, setLoading] = useState(false);
  const [materialName, setMaterialName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [listData, setListData] = useState([]);
  const [lightSceneName, setLightSceneName] = useState("");
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [cameraSceneName, setCameraSceneName] = useState("");
  const { saveCameraSettings } = useContext(CameraContext);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : null);
  };

  const handleToggle = () => {
    setOpen(!open);
  };
  // const handleSaveCamera = () => {
  //   const activeCamera =
  //     cameras.length > 0 ? cameras[cameras.length - 1] : null;

  //   if (!activeCamera) {
  //     setSnackbarMessage("No camera data available to save.");
  //     setSnackbarOpen(true);
  //     return;
  //   }

  //   saveCameraSettings(activeCamera)
  //     .then(() => {
  //       setSnackbarMessage("Camera settings saved successfully!");
  //       setSnackbarOpen(true);
  //     })
  //     .catch((error) => {
  //       console.error("Error saving camera:", error);
  //       setSnackbarMessage("Failed to save camera settings.");
  //       setSnackbarOpen(true);
  //     });
  // };
  const handleMaterialNameChange = (event) => {
    setMaterialName(event.target.value);
  };
  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
    setShowReactFlow(iconName === "materials");
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete("/api/delete", { data: { id } });

      setListData((prevData) => prevData.filter((item) => item.id !== id));

      setSnackbarMessage(
        "Project and related light scenes deleted successfully."
      );
    } catch (error) {
      console.error("Error deleting project:", error);
      setSnackbarMessage("Failed to delete project and related light scenes.");
    }
    setSnackbarOpen(true);
  };
  const handleDeletecamera = async (id) => {
    try {
      await axios.delete("/api/deletecamera", { data: { id } });
      setListData((prevData) => prevData.filter((item) => item.id !== id));
      setSnackbarMessage(
        "Project and related Camera scenes deleted successfully."
      );
    } catch (error) {
      console.error("Error deleting project:", error);
      setSnackbarMessage("Failed to delete project and related Camera scenes.");
    }

    setSnackbarOpen(true);
  };

  const handleMakeDefaultcamera = async (id) => {
    try {
      await axios.post("/api/defaultcamera", { id });
      setSnackbarMessage("Camera scene set as default.");
      setListData((prevData) =>
        prevData.map((item) => ({
          ...item,
          isDefault: item.id === id,
        }))
      );
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Failed to set default.");
    }
    setSnackbarOpen(true);
  };

  const handleMakeDefault = async (id) => {
    try {
      await axios.post("/api/default", { id });

      setSnackbarMessage("Light scene set as default.");
      setListData((prevData) =>
        prevData.map((item) => ({
          ...item,
          isDefault: item.id === id,
        }))
      );
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Failed to set default.");
    }
    setSnackbarOpen(true);
  };

  const handleSave = async () => {
    if (
      (selectedIcon === "materials" && !materialName.trim()) ||
      (selectedIcon === "sun" && !lightSceneName.trim()) ||
      (selectedIcon === "camera" && !cameraSceneName.trim())
    ) {
      const message =
        selectedIcon === "materials"
          ? "No material name entered, cannot save."
          : selectedIcon === "sun"
          ? "Please enter a name for the light scene."
          : selectedIcon === "camera"
          ? "Please enter a name for the camera scene."
          : "No name entered, cannot save.";

      setSnackbarMessage(message);
      setSnackbarOpen(true);
      return;
    }

    try {
      if (selectedIcon === "materials") {
        const formData = new FormData();
        formData.append("materialName", materialName);

        for (const [paramName, value] of Object.entries(materialParams)) {
          formData.append(paramName, value);
        }

        for (const [mapType, file] of Object.entries(connectedMaps)) {
          if (file) {
            const formKey = `${mapType.toLowerCase()}MapUrl`;
            formData.append(formKey, file);
          }
        }

        const response = await axios.post("/api/fabric", formData);

        if (response.data.status === "success") {
          setSnackbarMessage("Fabric data saved successfully!");
        } else {
          setSnackbarMessage("Failed to save fabric data.");
        }
      } else if (selectedIcon === "sun") {
        await handleSaveLights(lightSceneName);
        setSnackbarMessage("Light settings saved successfully!");
      } else if (selectedIcon === "camera") {
        const response = await saveCameraSettings(cameraSceneName);
        if (response.status === "success") {
          console.log("Camera settings saved successfully!");
        } else {
          console.log("Failed to save camera settings.");
        }
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setSnackbarMessage("Error saving data.");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleBumpScaleChange = (event, newValue) => {
    setBumpScale(newValue);
    updateMaterialParams("bumpScale", newValue);
  };

  const handleNormalXChange = (event, newValue) => {
    setNormalX(newValue);
    updateMaterialParams("normalScaleX", newValue);
  };

  const handleNormalYChange = (event, newValue) => {
    setNormalY(newValue);
    updateMaterialParams("normalScaleY", newValue);
  };

  const handleScaleXChange = (event, newValue) => {
    setScaleX(newValue);
    updateMaterialParams("scaleX", newValue);
  };

  const handleScaleYChange = (event, newValue) => {
    setScaleY(newValue);
    updateMaterialParams("scaleY", newValue);
  };

  const handleDisplacementScaleChange = (event, newValue) => {
    setDisplacementScale(newValue);
    updateMaterialParams("displacementScale", newValue);
  };

  const handleDisplacementBiasChange = (event, newValue) => {
    setDisplacementBias(newValue);
    updateMaterialParams("displacementBias", newValue);
  };

  const handleMetalnessChange = (event, newValue) => {
    setMetalness(newValue);
    updateMaterialParams("metalness", newValue);
  };

  const handleRoughnessChange = (event, newValue) => {
    setRoughness(newValue);
    updateMaterialParams("roughness", newValue);
  };

  const handleEmissiveChange = (event, newValue) => {
    setEmissive(newValue);
    updateMaterialParams("emissiveIntensity", newValue);
  };
  const handleEnvIntensityChange = (event, newValue) => {
    setEnvIntensity(newValue);
    updateMaterialParams("envMapIntensity", newValue);
  };

  const handleClearcoatChange = (event, newValue) => {
    setClearcoat(newValue);
    updateMaterialParams("clearcoat", newValue);
  };
  const handleOpacityChange = (event, newValue) => {
    setOpacity(newValue);
    updateMaterialParams("opacity", newValue);
  };
  const handleAoChange = (event, newValue) => {
    setAo(newValue);
    updateMaterialParams("aoMapIntensity", newValue);
  };
  const handleSheenIntensityChange = (event, newValue) => {
    setSheenIntensity(newValue);
    updateMaterialParams("sheen", newValue);
  };

  const handleSheenRoughnessChange = (event, newValue) => {
    setSheenRoughness(newValue);
    updateMaterialParams("sheenRoughness", newValue);
  };

  const handleSheenColorChange = (color) => {
    setSheenColor(color.hex);
    updateMaterialParams("sheenColor", color.hex);
  };
  const handleEmissiveColorChange = (color) => {
    setEmissiveColor(color.hex);
    updateMaterialParams("emissiveColor", color.hex);
  };

  const handleSheenToggle = (event) => {
    setSheenEnabled(event.target.checked);
    updateMaterialParams("sheenEnabled", event.target.checked);
  };
  const handleAnisotropyChange = (event, newValue) => {
    setAnisotropy(newValue);
    updateMaterialParams("anisotropy", newValue);
  };
  const router = useRouter();

  const handleEditRedirect = (id) => {
    router.push(`/edit/${id}`);
  };
  const handleLoadClick = async () => {
    setLoading(true);
    setIsDialogOpen(true);
    let apiEndpoint = "";

    if (selectedIcon === "materials") {
      apiEndpoint = "/api/materiallist";
    } else if (selectedIcon === "sun") {
      apiEndpoint = "/api/lightlist";
    } else if (selectedIcon === "camera") {
      apiEndpoint = "/api/cameralist";
    }

    try {
      const response = await axios.get(apiEndpoint);
      if (response.data.status === "success") {
        setListData(response.data.projects || []);
      } else {
        setSnackbarMessage("Failed to load data.");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setSnackbarMessage("Error loading data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "97vh",
        margin: "10px auto",
        backgroundColor: "white",
        display: "flex",

        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <IconButton
        onClick={handleToggle}
        sx={{
          position: "fixed",
          right: open ? "300px" : "0px",
          top: "10px",
          zIndex: 1300,
          padding: "4px",
          color: "black",
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          "&:focus": {
            outline: "none",
          },
        }}
      >
        <MenuOpenIcon fontSize="small" />
      </IconButton>

      <Box
        sx={{
          position: "fixed",
          right: open ? 0 : "-300px",
          top: 0,
          width: "300px",
          height: "97vh",
          backgroundColor: "white",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          transition: "right 0.3s ease",
          zIndex: 1200,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <AppBar
          position="static"
          sx={{
            backgroundColor: "#393A3D",
            padding: "5px",
            width: "300px",
            marginLeft: "auto",
            marginRight: "auto",
            borderRadius: "0px 0px 4px 4px",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontSize: "20px", fontFamily: "Avenir, sans-serif" }}
            >
              {selectedIcon === "sun"
                ? "Light"
                : selectedIcon === "camera"
                ? "Camera "
                : "Materials"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: "8px",
              }}
            >
              <IconButton
                sx={{
                  color: selectedIcon === "materials" ? "white" : "white",
                  padding: "9px",
                  borderRadius: "50%",

                  backgroundColor:
                    selectedIcon === "materials" ? "#529D36" : "transparent",
                  border:
                    selectedIcon === "materials" ? "none" : "1px solid #6B6C71",
                  "&:hover": {
                    backgroundColor:
                      selectedIcon === "materials"
                        ? "darkgreen"
                        : "rgba(255, 255, 255, 0.1)",
                    outline: "#393A3D",
                    border: "#393A3D",
                  },
                  "&:focus": {
                    outline: "#393A3D",
                    border: "#393A3D",
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "#393A3D",
                    border: "#393A3D",
                    boxShadow: "none",
                  },
                }}
                onClick={() => handleIconSelect("materials")}
              >
                <BackupTableIcon sx={{ fontSize: "20px" }} />
              </IconButton>

              <IconButton
                sx={{
                  color: selectedIcon === "sun" ? "white" : "white",
                  padding: "9px",
                  borderRadius: "50%",
                  backgroundColor:
                    selectedIcon === "sun" ? "#529D36" : "transparent",
                  border: selectedIcon === "sun" ? "none" : "1px solid #6B6C71",
                  "&:hover": {
                    backgroundColor:
                      selectedIcon === "sun"
                        ? "darkgreen"
                        : "rgba(255, 255, 255, 0.1)",
                    outline: "none",
                    border: "none",
                  },
                  "&:focus": {
                    outline: "none",
                    border: "none",
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    border: "none",
                    boxShadow: "none",
                  },
                }}
                onClick={() => handleIconSelect("sun")}
              >
                <WbSunnyIcon sx={{ fontSize: "20px" }} />
              </IconButton>

              <IconButton
                sx={{
                  color: selectedIcon === "camera" ? "white" : "white",
                  padding: "8px",
                  borderRadius: "100%",
                  backgroundColor:
                    selectedIcon === "camera" ? "#529D36" : "transparent",
                  border:
                    selectedIcon === "camera" ? "none" : "1px solid #6B6C71",
                  "&:hover": {
                    backgroundColor:
                      selectedIcon === "camera"
                        ? "darkgreen"
                        : "rgba(255, 255, 255, 0.1)",
                    outline: "none",
                    border: "none",
                  },
                  "&:focus": {
                    outline: "none",
                    border: "none",
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    border: "none",
                    boxShadow: "none",
                  },
                }}
                onClick={() => handleIconSelect("camera")}
              >
                <VideocamIcon sx={{ fontSize: "20px" }} />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flexGrow: 1,
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            overflowY: "auto",
          }}
        >
          <Box className="container">
            <TextField
              label={
                selectedIcon === "sun"
                  ? "Light Scene Name"
                  : selectedIcon === "camera"
                  ? "Camera Setting Name"
                  : "Material Name"
              }
              variant="outlined"
              className="custom-text-field"
              value={
                selectedIcon === "materials"
                  ? materialName
                  : selectedIcon === "sun"
                  ? lightSceneName
                  : selectedIcon === "camera"
                  ? cameraSceneName
                  : ""
              }
              onChange={
                selectedIcon === "materials"
                  ? handleMaterialNameChange
                  : selectedIcon === "sun"
                  ? (e) => setLightSceneName(e.target.value)
                  : selectedIcon === "camera"
                  ? (e) => setCameraSceneName(e.target.value)
                  : undefined
              }
              InputLabelProps={{
                shrink:
                  selectedIcon === "materials"
                    ? Boolean(materialName)
                    : selectedIcon === "sun"
                    ? Boolean(lightSceneName)
                    : selectedIcon === "camera"
                    ? Boolean(cameraSceneName)
                    : true,
                style: {
                  position: "absolute",
                  top: (
                    selectedIcon === "materials"
                      ? materialName
                      : selectedIcon === lightSceneName
                      ? lightSceneName
                      : cameraSceneName
                  )
                    ? "-5px"
                    : "50%",
                  left: "10px",
                  transform: "translateY(-50%)",
                  backgroundColor: "white",
                  padding: "0 4px",
                  color: "#C0C3C8",
                  fontSize: "11px",
                },
              }}
            />
          </Box>
          <Box
            sx={{
              flexGrow: 0,
              paddingBottom: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              overflowY: "auto",
              borderBottom: "1px solid #DDDDDD",
            }}
          >
            {selectedIcon === "materials" && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "Bold",
                  fontSize: "12px",
                  paddingLeft: "14px",
                  paddingTop: "10px",
                  paddingBottom: "15px",
                  color: "#282828",
                  letterSpacing: "1.5px",
                  fontFamily: "Avenir, sans-serif",
                }}
              >
                CONTROLS
              </Typography>
            )}

            {selectedIcon === "camera" && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  paddingTop: "10px",
                  paddingBottom: "15px",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "Bold",
                    fontSize: "12px",
                    color: "#282828",
                    letterSpacing: "1.5px",
                    fontFamily: "Avenir, sans-serif",
                  }}
                >
                  CAMERAS IN SCENE
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "Bold",
                    fontSize: "12px",
                    color: "#282828",
                    letterSpacing: "1.5px",
                    fontFamily: "Avenir, sans-serif",
                  }}
                >
                  ACTION
                </Typography>
              </Box>
            )}

            {selectedIcon === "sun" && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  paddingTop: "10px",
                  paddingBottom: "15px",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "Bold",
                    fontSize: "12px",
                    color: "#282828",
                    letterSpacing: "1.5px",
                    fontFamily: "Avenir, sans-serif",
                  }}
                >
                  LIGHTS IN SCENE
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "Bold",
                    fontSize: "12px",
                    color: "#282828",
                    letterSpacing: "1.5px",
                    fontFamily: "Avenir, sans-serif",
                  }}
                >
                  ACTION
                </Typography>
              </Box>
            )}
          </Box>

          {selectedIcon === "materials" ? (
            <Box sx={{ maxHeight: "80vh", overflowY: "auto" }}>
              {[
                "DIFFUSE",
                "ENVIRONMENT",
                "REFRACTION",
                "BUMP",
                "NORMAL",
                "DISPLACEMENT",
                "CLEARCOAT",
                "SHEEN",
                "EMISSIVE",
                "OPACITY",
                "AO",
                "ANISOTROPY",
                "METALNESS",
                "ROUGHNESS",
              ].map((control) => (
                <Box key={control}>
                  <Accordion
                    disableGutters
                    elevation={0}
                    expanded={expandedPanel === control}
                    onChange={handleAccordionChange(control)}
                    sx={{
                      border: "none",
                      padding: "0px",
                      "& .MuiAccordionSummary-root": {
                        minHeight: "10px",
                        padding: "0px",
                      },
                      "& .MuiAccordionDetails-root": {
                        padding: "2px",
                      },
                    }}
                  >
                    <AccordionSummary
                      sx={{ minHeight: "20px", padding: "0px", margin: 0 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {expandedPanel === control ? (
                          <ExpandMoreIcon sx={{ fontSize: "21px" }} />
                        ) : (
                          <ChevronRightIcon sx={{ fontSize: "21px" }} />
                        )}

                        <Typography
                          sx={{
                            width: "117px",
                            position: "relative",
                            fontSize: "10px",
                            letterSpacing: "0.02em",
                            lineHeight: "35px",
                            textTransform: "uppercase",
                            fontWeight: 800,
                            fontFamily: "Avenir, sans-serif",
                            color: "#282828",
                            textAlign: "left",
                            display: "inline-block",
                            height: "36px",
                            margin: 0,
                          }}
                        >
                          {control}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        padding: "0px",
                        marginTop: "2px",
                        maxHeight: "120px",
                        overflowY: "auto",
                      }}
                    >
                      {control === "BUMP" && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <CustomSlider
                            value={bumpScale}
                            onChange={handleBumpScaleChange}
                            label="bumpScale"
                            min={0}
                            max={10}
                            step={0.1}
                          />
                        </Box>
                        //break
                      )}
                      {control === "DIFFUSE" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={scaleX}
                              onChange={handleScaleXChange}
                              label="scaleX"
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={scaleY}
                              onChange={handleScaleYChange}
                              label="scaleY"
                            />
                          </Box>
                        </>
                      )}

                      {control === "NORMAL" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={materialParams.normalScaleX || 1}
                              onChange={handleNormalXChange}
                              label="NormalX"
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={materialParams.normalScaleY || 1}
                              onChange={handleNormalYChange}
                              label="NormalY"
                            />
                          </Box>
                        </>
                      )}

                      {control === "DISPLACEMENT" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={displacementScale}
                              onChange={handleDisplacementScaleChange}
                              label="Displacement Scale"
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={displacementBias}
                              onChange={handleDisplacementBiasChange}
                              label="Displacement Bias"
                            />
                          </Box>
                        </>
                      )}
                      {control === "METALNESS" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={metalness}
                              onChange={handleMetalnessChange}
                              label="Metalness"
                            />
                          </Box>
                        </>
                      )}

                      {control === "ROUGHNESS" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={roughness}
                              onChange={handleRoughnessChange}
                              label="Roughness"
                            />
                          </Box>
                        </>
                      )}

                      {control === "EMISSIVE" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={emissive}
                              onChange={handleEmissiveChange}
                              label="Emissive"
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "12px",
                                fontWeight: "normal",
                                color: "#333",
                                marginRight: "15px",
                                marginLeft: "10px",
                              }}
                            >
                              Emissive Color
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "5px",
                                width: "150px",
                              }}
                            >
                              <ChromePicker
                                disableAlpha
                                color={emissiveColor}
                                onChange={(color) =>
                                  handleEmissiveColorChange(color)
                                }
                                styles={{
                                  default: {
                                    picker: {
                                      width: "140px",
                                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                      border: "1px solid #ccc",
                                      borderRadius: "6px",
                                    },
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        </>
                      )}

                      {control === "ENVIRONMENT" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={envIntensity}
                              onChange={handleEnvIntensityChange}
                              label="E.Intensity"
                            />
                          </Box>
                        </>
                      )}

                      {control === "CLEARCOAT" && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <CustomSlider
                            value={clearcoat}
                            onChange={handleClearcoatChange}
                            label="clearcoat"
                          />
                        </Box>
                      )}
                      {control === "OPACITY" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={opacity}
                              onChange={handleOpacityChange}
                              label="opacity"
                            />
                          </Box>
                        </>
                      )}
                      {control === "AO" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={ao}
                              onChange={handleAoChange}
                              label="AO.Intensity"
                            />
                          </Box>
                        </>
                      )}

                      {control === "ANISOTROPY" && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <CustomSlider
                            value={anisotropy}
                            onChange={handleAnisotropyChange}
                            label="Anisotropy"
                            min={0}
                            max={16}
                            step={0.1}
                          />
                        </Box>
                      )}

                      {control === "SHEEN" && (
                        <>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              marginTop: 0,
                              marginBottom: 1,
                              gap: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "12px",
                                textAlign: "center",
                                color: "#333",
                                marginRight: "0px",
                                marginLeft: "20px",
                                fontFamily: "Avenir, sans-serif",
                              }}
                            >
                              sheenEnabled
                              <Switch
                                checked={sheenEnabled}
                                onChange={handleSheenToggle}
                                size="small"
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "green",
                                  },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                    {
                                      backgroundColor: "green",
                                    },
                                  "& .MuiSwitch-track": {
                                    backgroundColor: "#ccc",
                                  },
                                }}
                              />
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <CustomSlider
                              value={sheen}
                              onChange={handleSheenIntensityChange}
                              label="Intensity"
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "5px",
                            }}
                          >
                            <CustomSlider
                              value={sheenRoughness}
                              onChange={handleSheenRoughnessChange}
                              label="Roughness"
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "10px",
                                fontWeight: "normal",
                                color: "#333",
                                marginRight: "25px",
                                marginLeft: "20px",
                              }}
                            >
                              Sheen Color
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                gap: "5px",
                                width: "150px",
                                marginLeft: "0px",
                              }}
                            >
                              <ChromePicker
                                color={sheenColor}
                                disableAlpha
                                onChange={(color) =>
                                  handleSheenColorChange(color)
                                }
                                styles={{
                                  default: {
                                    picker: {
                                      width: "130px",
                                      boxShadow: "none",
                                      border: "1px solid #ddd",
                                      borderRadius: "4px",
                                    },
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        </>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  <Divider
                    sx={{
                      borderBottomWidth: "0.5px",
                      backgroundColor: "#ddd",
                      width: "90%",
                      margin: "0 auto",
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : selectedIcon === "camera" ? (
            <CameraSettings />
          ) : selectedIcon === "sun" ? (
            <LightSettings />
          ) : null}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#333",
            padding: "0px",
            gap: "10px",
            minHeight: "50px",
            position: "relative",
          }}
        >
          {selectedIcon === "materials" ? (
            <Box
              sx={{
                backgroundColor: "white",
                width: "380px",
                height: "50px",
                borderRadius: "3px 0px 0px 0px",
                padding: 0,
                margin: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Button
                variant="contained"
                onClick={() => addMapNode()}
                sx={{
                  backgroundColor: "#529D36",
                  color: "white",
                  width: "190px",
                  height: "30px",
                  padding: 0,
                  minWidth: 0,
                  borderRadius: "3px 0px 0px 0px",
                  "&:hover": {
                    backgroundColor: "darkgreen",
                  },
                }}
              >
                Add Map
              </Button>
            </Box>
          ) : selectedIcon === "sun" ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            ></Box>
          ) : selectedIcon === "sun" ? (
            <Button
              hidden
              variant="contained"
              sx={{
                backgroundColor: "green",
                color: "white",
                borderRadius: "10px",
                flexGrow: 1,
                fontSize: "10px",
                padding: "5px 10px",
                "&:hover": {
                  backgroundColor: "darkgreen",
                },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              startIcon={<CheckIcon sx={{ fontSize: "12px" }} />}
            >
              Save Light Scene
            </Button>
          ) : selectedIcon === "camera" ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <></>
            </Box>
          ) : null}
        </Box>
        <Dialog open={isDialogOpen} onClose={handleDialogClose}>
          <DialogContent sx={{ minWidth: "500px", padding: "20px" }}>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                marginBottom: "20px",
                color: "black",
                fontWeight: "bold",
              }}
            >
              {selectedIcon === "materials"
                ? "Material List"
                : selectedIcon === "sun"
                ? "Light List"
                : "Camera List"}
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {selectedIcon === "materials" && (
                  <MaterialList
                    listData={listData}
                    handleEditRedirect={handleEditRedirect}
                  />
                )}
                {selectedIcon === "sun" && (
                  <LightList
                    listData={listData}
                    handleDelete={handleDelete}
                    handleMakeDefault={handleMakeDefault}
                    handleSelect={(id) => console.log("Selected", id)}
                  />
                )}
                {selectedIcon === "camera" && (
                  <CameraList
                    listData={listData}
                    handleDelete={handleDeletecamera}
                    handleMakeDefault={handleMakeDefaultcamera}
                    handleSelectcamera={(id) => console.log("Selected", id)}
                  />
                )}
              </>
            )}

            <Button
              variant="contained"
              onClick={handleDialogClose}
              sx={{
                backgroundColor: "green",
                color: "white",
                borderRadius: "10px",
                fontSize: "14px",
                padding: "10px 20px",
                marginTop: "20px",
                "&:hover": {
                  backgroundColor: "darkgreen",
                },
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Close
            </Button>
          </DialogContent>
        </Dialog>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#333",
            padding: "5px",
            gap: "10px",
            minHeight: "50px",
          }}
        >
          <IconButton
            sx={{
              color: "white",
              padding: "6px",
              border: "1px solid white",
              borderRadius: "50%",
              backgroundColor: "transparent",
            }}
            onClick={() => window.location.reload()}
          >
            <CachedIcon sx={{ fontSize: "14px" }} />
          </IconButton>

          <Button
            variant="outlined"
            onClick={handleLoadClick}
            sx={{
              borderRadius: "10px",
              flexGrow: 1,
              marginRight: "5px",
              fontSize: "10px",
              color: "white",
              borderColor: "white",
              "&:hover": {
                borderColor: "lightgray",
                color: "lightgray",
              },
            }}
          >
            Load
          </Button>

          {/* Save button  */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#529D36",
              color: "white",
              borderRadius: "10px",
              flexGrow: 1,
              fontSize: "10px",
              padding: "5px 10px",
              "&:hover": { backgroundColor: "darkgreen" },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            startIcon={<CheckIcon sx={{ fontSize: "12px" }} />}
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={
            snackbarMessage === "Fabric data saved successfully!"
              ? "success"
              : "error"
          }
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

ControlGUI.propTypes = {
  addMapNode: PropTypes.func.isRequired,
};

export default ControlGUI;
//v3 - All UI updated
//v4 - all UI updated aligned with figma
