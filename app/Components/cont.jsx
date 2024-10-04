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
import { MapContext } from "../MapContext";
import { Switch, FormControlLabel } from "@mui/material";
import { ChromePicker } from "react-color"; // Import the ChromePicker
import axios from "axios"; // Import Axios

const ControlGUI = ({ addMapNode }) => {
  const [open, setOpen] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("materials");

  // Access the MapContext to update material parameters
  const { connectedMaps, materialParams, updateMaterialParams } = useContext(MapContext);
//method 2 
const handleSave1 = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("fabricName", fabricName);
      formData.append("fabricColor", fabricColor);

      for (const [mapType, file] of Object.entries(connectedMaps)) {
        if (file) {
          const formKey = `${mapType.toLowerCase()}MapUrl`;
          formData.append(formKey, file);
        }
      }

      for (const [paramName, value] of Object.entries(materialParams)) {
        formData.append(paramName, value);
      }

      const response = await axios.post("/api/fabric", formData);

      if (response.data.status === "success") {
        setSnackbarMessage("Fabric data saved successfully!");
      } else {
        setSnackbarMessage("Failed to save fabric data.");
      }
    } catch (error) {
      console.error("Error saving fabric data:", error);
      setSnackbarMessage("Error saving fabric data.");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  // Material settings
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
  const [opacity, setOpacity] = useState(1);
  const [ao, setAo] = useState(1);
  const [sheenIntensity, setSheenIntensity] = useState(0);
  const [sheenRoughness, setSheenRoughness] = useState(1);
  const [sheenColor, setSheenColor] = useState({ r: 1, g: 1, b: 1 });
  const [sheenEnabled, setSheenEnabled] = useState(false);
  const [emissiveColor, setEmissiveColor] = useState({ r: 0, g: 0, b: 0 });

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("bumpScale", bumpScale);
      formData.append("normalScaleX", normalX);
      formData.append("normalScaleY", normalY);
      formData.append("scaleX", scaleX);
      formData.append("scaleY", scaleY);
      formData.append("displacementScale", displacementScale);
      formData.append("displacementBias", displacementBias);
      formData.append("metalness", metalness);
      formData.append("roughness", roughness);
      formData.append("emissiveIntensity", emissive);
      formData.append("envIntensity", envIntensity);
      formData.append("clearcoat", clearcoat);
      formData.append("opacity", opacity);
      formData.append("aoMapIntensity", ao);
      formData.append("sheenIntensity", sheenIntensity);
      formData.append("sheenRoughness", sheenRoughness);
      formData.append("sheenEnabled", sheenEnabled);
      
      // Convert colors to hex and append
      formData.append("sheenColor", JSON.stringify(sheenColor));
      formData.append("emissiveColor", JSON.stringify(emissiveColor));

      // Append maps (connected maps)
      Object.entries(connectedMaps).forEach(([mapType, file]) => {
        if (file) {
          formData.append(`${mapType.toLowerCase()}MapUrl`, file);
        }
      });

      // Send data to the API using Axios
      const response = await axios.post("/api/fabric", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        console.log("Fabric data saved successfully!", response.data);
        // Optionally show a success notification
      } else {
        console.error("Failed to save fabric data.");
        // Optionally show an error notification
      }
    } catch (error) {
      console.error("Error saving fabric data:", error);
      // Optionally show an error notification
    }
  };

  // Handlers for sliders - update both state and MapContext
  const handleBumpScaleChange = (event, newValue) => {
    setBumpScale(newValue);
    updateMaterialParams("bumpScale", newValue);
  };

  // ... other handlers here ...

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
      {/* Sidebar Icon */}
      <IconButton
        onClick={handleToggle}
        sx={{
          position: "fixed",
          right: open ? "280px" : "0px",
          top: "10px",
          zIndex: 1300,
          padding: "4px",
          color: "black",
          backgroundColor: "transparent",
          border: "none",
        }}
      >
        <MenuOpenIcon fontSize="small" />
      </IconButton>

      {/* Drawer Panel */}
      <Box
        sx={{
          position: "fixed",
          right: open ? 0 : "-280px",
          top: 0,
          width: "280px",
          height: "97vh",
          backgroundColor: "#f5f5f5",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          transition: "right 0.3s ease",
          zIndex: 1200,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Header */}
        {/* ... Header Content ... */}

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
            onClick={handleSave} // Attach handleSave to the Save button
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
    </Box>
  );
};

ControlGUI.propTypes = {
  addMapNode: PropTypes.func.isRequired,
};

export default ControlGUI;
