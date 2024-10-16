"use client";
import React, { useState, useContext } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  IconButton,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Divider,
  snackbarMessage,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomSlider from "../Styles/CustomSlider";
import { CameraContext } from "../CameraContext";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const CameraSettings = () => {
  const {
    cameras,
    addCamera,
    setActiveCamera,
    handleViewCamera,
    saveCameraSettings,
    updateActiveCameraSettings,
    renameCamera,
    deleteCamera,
    duplicateCamera,
  } = useContext(CameraContext);

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);

  const [openWarningSnackbar, setOpenWarningSnackbar] = useState(false);
  const [cameraType, setCameraType] = useState("perspective");
  const [cameraName, setCameraName] = useState("");

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(null);
  const [cameraChanged, setCameraChanged] = useState(false);
  //  rename dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameInput, setRenameInput] = useState("");

  const [setCameraSuccess, setSetCameraSuccess] = useState(false);
  // State for tracking the expanded panel
  const [expandedPanel, setExpandedPanel] = useState(null);

  // Accordion toggle handler
  const handleAccordionChange = (panelName) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panelName : null);
  };
  const maxCameras = 4;

  const handleAddCamera = () => {
    if (cameras.length >= 4) {
      setSnackbarMessage("Max camera limit reached");
      setOpenWarningSnackbar(true);
      return;
    }

    const newCamera = {
      name: cameraName || `Camera ${cameras.length + 1}`,
      type: cameraType,
      settings: {
        position: { x: 0, y: 5, z: 10 },
        target: { x: 0, y: 0, z: 0 },
        near: 0.1,
        far: 1000,
        fov: 50,
      },
    };

    addCamera(newCamera);
    setOpenSuccessSnackbar(true);
    setCameraName("");
  };

  const handleViewCameraClick = (index) => {
    if (cameraChanged) {
      // setUnsavedCameraSnackbar(true); // Show warning snackbar if unsaved changes exist
    } else {
      setActiveCamera(index);
      handleViewCamera();
      setCameraChanged(false);
    }
  };

  const handleSetCamera = () => {
    saveCameraSettings();
    setCameraChanged(false);
    setSetCameraSuccess(true);
    // setOpenSuccessSnackbar(true);
  };
  // Snackbar close handlers
  const handleSuccessSnackbarClose = () => {
    setOpenSuccessSnackbar(false);
  };
  const handleWarningSnackbarClose = () => {
    setOpenWarningSnackbar(false);
  };

  const handleMenuOpen = (event, index) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCameraIndex(index);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedCameraIndex(null);
  };

  const handleRenameOpenDialog = () => {
    if (selectedCameraIndex !== null) {
      setRenameInput(cameras[selectedCameraIndex]?.name || "");
      setRenameDialogOpen(true);
    }
  };

  const handleRenameCloseDialog = () => {
    setRenameDialogOpen(false);
  };

  const handleRenameSubmit = () => {
    if (renameInput.trim() && selectedCameraIndex !== null) {
      renameCamera(selectedCameraIndex, renameInput.trim());
    }
    setRenameDialogOpen(false);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedCameraIndex !== null) {
      deleteCamera(selectedCameraIndex);
    }
    handleMenuClose();
  };

  const handleDuplicate = () => {
    if (selectedCameraIndex !== null) {
      const typeCount = cameras.length;

      if (typeCount >= maxCameras) {
        setSnackbarMessage("Max camera limit reached");
        setOpenWarningSnackbar(true);
        handleMenuClose();
        return;
      }

      duplicateCamera(selectedCameraIndex);
      handleMenuClose();
    }
  };

  // Handlers for sliders
  const handlePositionChange = (axis, newValue) => {
    setCameraChanged(true);
    updateActiveCameraSettings({
      position: {
        ...cameras[0]?.settings.position,
        [axis]: newValue,
      },
    });
  };

  const handleTargetChange = (axis, newValue) => {
    setCameraChanged(true);
    updateActiveCameraSettings({
      target: {
        ...cameras[0]?.settings.target,
        [axis]: newValue,
      },
    });
  };

  const handleNearChange = (event, newValue) => {
    setCameraChanged(true);
    updateActiveCameraSettings({ near: newValue });
  };

  const handleFarChange = (event, newValue) => {
    setCameraChanged(true);
    updateActiveCameraSettings({ far: newValue });
  };

  const handleFovChange = (event, newValue) => {
    setCameraChanged(true);
    updateActiveCameraSettings({ fov: newValue });
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: "5px",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        height: "100vh",
      }}
    >
      {/* Camera Settings Accordion List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          paddingRight: "10px",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "green",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1" },
        }}
      >
        {cameras.map((camera, index) => (
          <Accordion
            key={index}
            disableGutters
            elevation={0}
            expanded={expandedPanel === camera.name}
            onChange={handleAccordionChange(camera.name)}
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
                {/* Conditional Rendering for Icon */}
                {expandedPanel === camera.name ? (
                  <ExpandMoreIcon sx={{ fontSize: "21px" }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: "21px" }} />
                )}
              </Box>
              {/* <ExpandMoreIcon sx={{ fontSize: "12px", paddingRight: "3px" }} /> */}
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
                {camera.name} Settings
              </Typography>
              {/* Menu  Position for renmae , delete , duplicate camera  */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  marginLeft: "auto",
                  fontFamily: "Avenir, sans-serif",
                  color: "#282828",
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, index)}
                >
                  <MoreVertIcon sx={{ fontSize: "12px" }} />
                </IconButton>
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleRenameOpenDialog}>Rename</MenuItem>
                  <MenuItem onClick={handleDelete}>Delete</MenuItem>
                  <MenuItem
                    onClick={handleDuplicate}
                    disabled={cameras.length >= 4}
                  >
                    Duplicate
                  </MenuItem>
                </Menu>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: "0px", marginTop: "2px" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  marginBottom: "20px",
                }}
              >
                <Typography sx={{ fontSize: "12px", marginRight: "10px" }}>
                  cameraPos
                </Typography>

                {["x", "y", "z"].map((axis) => (
                  <Box
                    key={`position-${axis}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                      padding: "2px 6px",
                    }}
                  >
                    <TextField
                      type="number"
                      value={camera.settings.position[axis]}
                      onChange={(e) =>
                        handlePositionChange(axis, parseFloat(e.target.value))
                      }
                      inputProps={{
                        step: "0.1",
                        style: {
                          textAlign: "center",
                          padding: "0",
                          height: "22px",
                        },
                      }}
                      sx={{
                        width: "40px",
                        "& .MuiInputBase-input": {
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "green",
                          textAlign: "center",
                          padding: "0",
                        },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "transparent",
                          },
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {["near", "far", "fov"].map((setting) => (
                  <Box
                    key={setting}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "6px",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: "normal",
                        color: "#333",
                        minWidth: "30px",
                        textAlign: "left",
                        flexShrink: 1,
                        marginRight: "50px",
                      }}
                    >
                      {setting.charAt(0).toUpperCase() + setting.slice(1)}{" "}
                      {/* Capitalize first letter */}
                    </Typography>
                    <TextField
                      type="number"
                      value={camera.settings[setting]}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        if (!isNaN(newValue)) {
                          if (setting === "near") {
                            handleNearChange(null, newValue);
                          } else if (setting === "far") {
                            handleFarChange(null, newValue);
                          } else if (setting === "fov") {
                            handleFovChange(null, newValue);
                          }
                        }
                      }}
                      inputProps={{
                        step:
                          setting === "near"
                            ? "0.01"
                            : setting === "far"
                            ? "1"
                            : "0.1",
                        style: {
                          textAlign: "center",
                          padding: "5px 5px",
                          height: "25px",
                        },
                      }}
                      sx={{
                        flexGrow: 1,
                        width: "80px",
                        backgroundColor: "#f0f0f0", // Background color for consistency
                        "& .MuiInputBase-input": {
                          fontSize: "12px", // Adjust the font size for input
                          fontWeight: "bold",
                          color: "green", // Green color for consistency
                          textAlign: "center",
                          padding: "0",
                        },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "transparent", // Remove the default border
                          },
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  marginBottom: "20px",
                  marginTop: "20px",
                }}
              >
                <Typography sx={{ fontSize: "12px", marginRight: "10px" }}>
                  targetPos
                </Typography>

                {["x", "y", "z"].map((axis) => (
                  <Box
                    key={`target-${axis}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                      padding: "2px 6px",
                    }}
                  >
                    <TextField
                      type="number"
                      value={camera.settings.target[axis]}
                      onChange={(e) =>
                        handleTargetChange(axis, parseFloat(e.target.value))
                      }
                      inputProps={{
                        step: "0.1",
                        style: {
                          textAlign: "center",
                          padding: "0",
                          height: "22px",
                        },
                      }}
                      sx={{
                        width: "40px", // Smaller width for matching the design
                        "& .MuiInputBase-input": {
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "green",
                          textAlign: "center",
                          padding: "0", // Removing extra padding
                        },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "transparent", // No border outline
                          },
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>

              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <Tooltip
                  title="Make sure to click 'Set Camera' to save changes before switching cameras"
                  placement="top"
                  arrow
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewCameraClick(index)}
                    sx={{
                      width: "100%",
                      textTransform: "none",
                      fontSize: "14px",
                      borderRadius: "8px",
                      borderColor: "#ccc",
                      color: "#333",
                      "&:hover": {
                        borderColor: "#888",
                      },
                    }}
                  >
                    View Camera
                  </Button>
                </Tooltip>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSetCamera}
                  sx={{
                    width: "100%",
                    textTransform: "none",
                    fontSize: "14px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    borderRadius: "8px",
                    "&:hover": {
                      backgroundColor: "#388e3c",
                    },
                  }}
                >
                  Set Camera
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "0px",
        }}
      >
        <FormControl
          variant="outlined"
          className="custom-text-field"
          sx={{ marginBottom: 3, width: "70%" }}
        >
          <Select
            displayEmpty
            value={cameraType}
            onChange={(e) => setCameraType(e.target.value)}
            label=""
            sx={{
              backgroundColor: "transparent",
              fontFamily: "Avenir",
              fontSize: "11px",
              fontWeight: 400,
              lineHeight: "35px",
              letterSpacing: "0.02em",
              textAlign: "left",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#529d36",
                borderWidth: "1px",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#529d36",
              },
            }}
            inputProps={{
              "aria-label": "Without label",
              style: {
                fontFamily: "Avenir",
                fontSize: "11px",
                fontWeight: 400,
                lineHeight: "35px",
                letterSpacing: "0.02em",
                textAlign: "left",
              },
            }}
          >
            <MenuItem value="" disabled>
              <span
                style={{
                  fontStyle: "normal",
                  fontFamily: "Avenir",
                  fontSize: "11px",
                }}
              >
                Camera Type
              </span>
            </MenuItem>
            <MenuItem value="perspective">Perspective</MenuItem>
          </Select>
        </FormControl>

        <TextField
          variant="outlined" //
          className="custom-text-field"
          label="Camera Name"
          value={cameraName}
          onChange={(e) => setCameraName(e.target.value)}
          sx={{
            marginBottom: 2,
            width: "70%",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#529d36",
                borderWidth: "1px",
                borderRadius: "4px",
              },
              "&:hover fieldset": {
                borderColor: "#529d36",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#529d36",
              },
            },
            "& .MuiInputBase-input": {
              fontFamily: "Avenir",
              fontSize: "11px !important",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: "1.5 !important",
              padding: "12px 14px !important",
              letterSpacing: "0.02em",
              textAlign: "left",
            },
            "& .MuiFormLabel-root": {
              fontFamily: "Avenir",
              fontSize: "11px",
              color: "#666",
            },
            "& .MuiInputBase-input::placeholder": {
              fontFamily: "Avenir !important",
              fontSize: "11px !important",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: "1.5",
              letterSpacing: "0.02em",
              textAlign: "left",
              color: "#666",
            },
          }}
        />

        <Button
          variant="contained"
          onClick={handleAddCamera}
          disabled={cameras.length >= 4}
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
          Add Camera
        </Button>
      </Box>

      {/* Snackbar for Save Confirmation */}
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={3000}
        onClose={handleSuccessSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSuccessSnackbarClose} severity="success">
          Camera added successfully!
        </Alert>
      </Snackbar>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openWarningSnackbar}
        autoHideDuration={3000}
        onClose={handleWarningSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleWarningSnackbarClose} severity="warning">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={renameDialogOpen} onClose={handleRenameCloseDialog}>
        <DialogTitle>Rename Camera</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Camera Name"
            type="text"
            fullWidth
            variant="outlined"
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRenameSubmit} color="primary">
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Set Camera Success */}
      <Snackbar
        open={setCameraSuccess}
        autoHideDuration={3000}
        onClose={handleSuccessSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSuccessSnackbarClose} severity="success">
          Camera saved successfully! Click View Camera to see the changes.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CameraSettings;
//1 camera full working with context + menu
//2
