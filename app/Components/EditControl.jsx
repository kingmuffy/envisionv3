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
import { MapContext } from "../EditContext.jsx";
import { Switch, FormControlLabel } from "@mui/material";
import { useRouter } from "next/navigation";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { ChromePicker } from "react-color"; // Import the ChromePicker
import axios from "axios";
const ControlGUI = ({ addMapNode, id }) => {
  const {
    connectedMaps,
    materialParams,
    updateConnectedMaps,
    updateMaterialParams,
  } = useContext(MapContext);

  const [open, setOpen] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("materials");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [lightSceneName, setLightSceneName] = useState("");

  const [normalX, setNormalX] = useState(materialParams.normalScaleX || 1);
  const [normalY, setNormalY] = useState(materialParams.normalScaleY || 1);
  const [scaleX, setScaleX] = useState(materialParams.scaleX || 1);
  const [scaleY, setScaleY] = useState(materialParams.scaleY || 1);
  const [displacementScale, setDisplacementScale] = useState(
    materialParams.displacementScale || 1
  );
  const [displacementBias, setDisplacementBias] = useState(
    materialParams.displacementBias || 0
  );
  const [metalness, setMetalness] = useState(materialParams.metalness || 0.0);
  const [roughness, setRoughness] = useState(materialParams.roughness || 0.0);
  const [emissive, setEmissive] = useState(
    materialParams.emissiveIntensity || 0
  );
  const [envIntensity, setEnvIntensity] = useState(
    materialParams.envMapIntensity || 0
  );
  const [clearcoat, setClearcoat] = useState(materialParams.clearcoat || 0);
  const [opacity, setOpacity] = useState(materialParams.opacity || 1);
  const [ao, setAo] = useState(materialParams.aoMapIntensity || 1);
  const [sheen, setSheenIntensity] = useState(materialParams.sheen || 0);
  const [sheenRoughness, setSheenRoughness] = useState(
    materialParams.sheenRoughness || 1
  );
  const [sheenColor, setSheenColor] = useState(
    materialParams.sheenColor || { r: 1, g: 1, b: 1 }
  );
  const [sheenEnabled, setSheenEnabled] = useState(
    materialParams.sheenEnabled || false
  );
  const [emissiveColor, setEmissiveColor] = useState(
    materialParams.emissiveColor || { r: 0, g: 0, b: 0 }
  );
  const [anisotropy, setAnisotropy] = useState(materialParams.anisotropy || 0);

  const [materialName, setMaterialName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to manage dialog visibility
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState([]);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
  };

  const handleSave = async () => {
    if (selectedIcon === "materials" && !materialParams.materialName) {
      setSnackbarMessage("No material name entered, cannot save.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", id);

      for (const [paramName, value] of Object.entries(materialParams)) {
        formData.append(paramName, value);
      }

      const response = await axios.put("/api/updateparam", formData);

      if (response.data.status === "success") {
        setSnackbarMessage("Fabric data saved successfully!");
      } else {
        setSnackbarMessage("Failed to save fabric data.");
      }
    } catch (error) {
      console.error("Error saving fabric data:", error);
      setSnackbarMessage("Error saving fabric data.");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleMaterialNameChange = (event) => {
    const newValue = event.target.value;
    updateMaterialParams("materialName", newValue);
  };

  const handleBumpScaleChange = (event, newValue) => {
    updateMaterialParams("bumpScale", newValue);
  };

  const handleNormalXChange = (event, newValue) => {
    updateMaterialParams("normalScaleX", newValue);
  };

  const handleNormalYChange = (event, newValue) => {
    updateMaterialParams("normalScaleY", newValue);
  };

  const handleScaleXChange = (event, newValue) => {
    updateMaterialParams("scaleX", newValue);
  };

  const handleScaleYChange = (event, newValue) => {
    updateMaterialParams("scaleY", newValue);
  };

  const handleDisplacementScaleChange = (event, newValue) => {
    updateMaterialParams("displacementScale", newValue);
  };

  const handleDisplacementBiasChange = (event, newValue) => {
    updateMaterialParams("displacementBias", newValue);
  };

  const handleMetalnessChange = (event, newValue) => {
    updateMaterialParams("metalness", newValue);
  };

  const handleRoughnessChange = (event, newValue) => {
    updateMaterialParams("roughness", newValue);
  };

  const handleEmissiveChange = (event, newValue) => {
    updateMaterialParams("emissiveIntensity", newValue);
  };

  const handleEnvIntensityChange = (event, newValue) => {
    updateMaterialParams("envMapIntensity", newValue);
  };

  const handleClearcoatChange = (event, newValue) => {
    updateMaterialParams("clearcoat", newValue);
  };

  const handleOpacityChange = (event, newValue) => {
    updateMaterialParams("opacity", newValue);
  };

  const handleAoChange = (event, newValue) => {
    updateMaterialParams("aoMapIntensity", newValue);
  };

  const handleSheenIntensityChange = (event, newValue) => {
    updateMaterialParams("sheen", newValue);
  };

  const handleSheenRoughnessChange = (event, newValue) => {
    updateMaterialParams("sheenRoughness", newValue);
  };

  const handleSheenColorChange = (color) => {
    setSheenColor(color.hex);
    updateMaterialParams("sheenColor", color.hex);
  };
  const handleEmissiveColorChange = (color) => {
    updateMaterialParams("emissiveColor", color.hex);
  };

  const handleSheenToggle = (event) => {
    setSheenEnabled(event.target.checked);
    updateMaterialParams("sheenEnabled", event.target.checked);
  };
  const handleAnisotropyChange = (event, newValue) => {
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
                  padding: "6px",
                  borderRadius: "50%",
                  backgroundColor:
                    selectedIcon === "materials" ? "green" : "transparent",
                  border:
                    selectedIcon === "materials" ? "0.5px solid white" : "none",
                  "&:hover": {
                    backgroundColor:
                      selectedIcon === "materials"
                        ? "darkgreen"
                        : "rgba(255, 255, 255, 0.1)",
                  },
                  "&:focus": {
                    outline: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                  },
                }}
                onClick={() => handleIconSelect("materials")}
              >
                <BackupTableIcon sx={{ fontSize: "20px" }} />
              </IconButton>
              {/* Sun Icon */}
              <IconButton
                sx={{
                  color: selectedIcon === "sun" ? "white" : "white",
                  padding: "6px",
                  borderRadius: "50%",
                  backgroundColor:
                    selectedIcon === "sun" ? "green" : "transparent",
                  border: selectedIcon === "sun" ? "0.5px solid white" : "none",
                  "&:hover": {
                    backgroundColor:
                      selectedIcon === "sun"
                        ? "darkgreen"
                        : "rgba(255, 255, 255, 0.1)",
                  },
                  "&:focus": {
                    outline: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                  },
                }}
                onClick={() => handleIconSelect("sun")}
              >
                <WbSunnyIcon />
              </IconButton>
              {/* Camera Icon */}
              <IconButton
                sx={{
                  color: selectedIcon === "camera" ? "white" : "white",
                  padding: "6px",
                  borderRadius: "50%",
                  backgroundColor:
                    selectedIcon === "camera" ? "green" : "transparent",
                  border:
                    selectedIcon === "camera" ? "0.5px solid white" : "none",
                  "&:hover": {
                    backgroundColor:
                      selectedIcon === "camera"
                        ? "darkgreen"
                        : "rgba(255, 255, 255, 0.1)",
                  },
                  "&:focus": {
                    outline: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                  },
                }}
                onClick={() => handleIconSelect("camera")}
              >
                <VideocamIcon />
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
                  ? materialParams.materialName || ""
                  : selectedIcon === "sun"
                  ? lightSceneName || ""
                  : ""
              }
              onChange={
                selectedIcon === "materials"
                  ? handleMaterialNameChange
                  : selectedIcon === "sun"
                  ? (e) => setLightSceneName(e.target.value)
                  : undefined
              }
              InputLabelProps={{
                shrink:
                  selectedIcon === "materials"
                    ? Boolean(materialParams.materialName)
                    : selectedIcon === "sun"
                    ? Boolean(lightSceneName)
                    : false,
                style: {
                  position: "absolute",
                  top:
                    selectedIcon === "materials" || selectedIcon === "sun"
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
              {/* Accordion Section for materials */}
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
                            value={materialParams.bumpScale || 0.0}
                            onChange={handleBumpScaleChange}
                            label="Bump Scale"
                            min={0}
                            max={10}
                            step={0.1}
                          />
                        </Box>
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
                              value={materialParams.scaleX || 1}
                              onChange={handleScaleXChange}
                              label="Scale X"
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
                              value={materialParams.scaleY || 1}
                              onChange={handleScaleYChange}
                              label="Scale Y"
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
                              label="Normal X"
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
                              label="Normal Y"
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
                              value={materialParams.displacementScale || 1}
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
                              value={materialParams.displacementBias || 0}
                              onChange={handleDisplacementBiasChange}
                              label="Displacement Bias"
                            />
                          </Box>
                        </>
                      )}
                      {control === "METALNESS" && (
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
                            value={materialParams.metalness || 0.0}
                            onChange={handleMetalnessChange}
                            label="Metalness"
                          />
                        </Box>
                      )}
                      {control === "ROUGHNESS" && (
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
                            value={materialParams.roughness || 0.0}
                            onChange={handleRoughnessChange}
                            label="Roughness"
                          />
                        </Box>
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
                              value={materialParams.emissive || 0}
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
                            <Typography>Emissive Color</Typography>
                            <ChromePicker
                              color={materialParams.emissiveColor || "#000000"}
                              onChange={(color) =>
                                handleEmissiveColorChange(color)
                              }
                            />
                          </Box>
                        </>
                      )}
                      {control === "ENVIRONMENT" && (
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
                            value={materialParams.envMapIntensity || 0}
                            onChange={handleEnvIntensityChange}
                            label="Environment Intensity"
                          />
                        </Box>
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
                            value={materialParams.clearcoat || 0}
                            onChange={handleClearcoatChange}
                            label="clearcoat"
                          />
                        </Box>
                      )}

                      {control === "OPACITY" && (
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
                            value={materialParams.opacity || 1}
                            onChange={handleOpacityChange}
                            label="Opacity"
                          />
                        </Box>
                      )}
                      {control === "AO" && (
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
                            value={materialParams.ao || 1}
                            onChange={handleAoChange}
                            label="Ambient Occlusion Intensity"
                          />
                        </Box>
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
                            value={materialParams.anisotropy || 0}
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
                          <FormControlLabel
                            control={
                              <Switch
                                checked={sheenEnabled}
                                onChange={handleSheenToggle}
                                color="primary"
                              />
                            }
                            label="Enable Sheen"
                            labelPlacement="end"
                          />
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
                              value={materialParams.sheen || 0}
                              onChange={handleSheenIntensityChange}
                              label="Sheen Intensity"
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
                              value={materialParams.sheenRoughness || 1}
                              onChange={handleSheenRoughnessChange}
                              label="Sheen Roughness"
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
                            <Typography>Sheen Color</Typography>
                            <ChromePicker
                              color={materialParams.sheenColor || "#ffffff"}
                              onChange={(color) =>
                                handleSheenColorChange(color)
                              }
                            />
                          </Box>
                        </>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  <Divider
                    sx={{
                      borderBottomWidth: "0.5px",
                      backgroundColor: "#ccc",
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
            padding: "5px",
            gap: "10px",
            minHeight: "50px",
          }}
        >
          {selectedIcon === "materials" ? (
            <Button
              variant="contained"
              onClick={() => addMapNode()}
              sx={{
                backgroundColor: "green",
                color: "white",
                borderRadius: "10px",
                flexGrow: 1,
                fontSize: "10px",
                padding: "5px 10px",
                marginRight: "5px",
                "&:hover": {
                  backgroundColor: "darkgreen",
                },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Add Map
            </Button>
          ) : selectedIcon === "sun" ? (
            <Button
              variant="contained"
              hidden
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
          ) : null}
        </Box>
        {/* Dialog for loading the module */}
        {/* Dialog for loading the module */}
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
              <List>
                {listData.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "15px",
                      borderBottom: "1px solid lightgray",
                      paddingBottom: "10px",
                      marginBottom: "10px",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                    onClick={() => handleEditRedirect(item.id)}
                  >
                    {item.diffuseMapUrl ? (
                      <img
                        src={item.diffuseMapUrl}
                        alt={item.materialName || "Material Image"}
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "5px",
                          objectFit: "cover",
                          backgroundColor: "#f5f5f5",
                        }}
                      />
                    ) : (
                      <Avatar
                        variant="square"
                        sx={{
                          width: 70,
                          height: 70,
                          borderRadius: "5px",
                          backgroundColor: "grey.300",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "white",
                          fontSize: 14,
                        }}
                      >
                        No Image
                      </Avatar>
                    )}

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "black", fontWeight: "bold" }}
                      >
                        {item.materialName || item.name || "Unnamed"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "gray", marginTop: "5px" }}
                      >
                        Created on:{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
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

        {/* Footer Section */}
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
          >
            <CachedIcon sx={{ fontSize: "14px" }} />
          </IconButton>

          {/* Load button */}
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

          {/* Save button */}
          <Button
            variant="contained"
            onClick={handleSave}
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
