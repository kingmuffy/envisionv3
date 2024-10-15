/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Divider,
  TextField,
  Switch,
  IconButton,
  MenuItem,
  Menu,
  Select,
  Button,
  InputLabel,
  FormControl,
  Snackbar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CustomSlider from "../Styles/CustomSlider";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Alert } from "@mui/material";
import { LightContext } from "../LightContext";

const LightSettings = () => {
  const { lights, updateLight, addLight, deleteLight, duplicateLight } =
    useContext(LightContext);

  const [renamingLightId, setRenamingLightId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentLightId, setCurrentLightId] = useState(null);
  const [lightType, setLightType] = useState("");
  const [lightName, setLightName] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const maxLights = 5;
  const [expandedPanel, setExpandedPanel] = useState(null);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : null);
  };
  const handleMenuClick = (event, lightId) => {
    setAnchorEl(event.currentTarget);
    setCurrentLightId(lightId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRenameChange = (e, lightId) => {
    updateLight(lightId, {
      ...lights.find((light) => light.id === lightId),
      name: e.target.value,
    });
  };

  // const handleDuplicate = (lightId) => {
  //   duplicateLight(lightId);

  //   handleMenuClose();
  // };

  const handleDuplicate = (lightId) => {
    const lightToDuplicate = lights.find((light) => light.id === lightId);
    const typeCount = lights.filter(
      (l) => l.type === lightToDuplicate.type
    ).length;
    if (typeCount >= maxLights) {
      setSnackbarOpen(true);
      handleMenuClose();
      return;
    }

    duplicateLight(lightId);
    handleMenuClose();
  };
  const handleDelete = (lightId) => {
    deleteLight(lightId);
    handleMenuClose();
  };

  const handleAddLight = () => {
    const typeCount = lights.filter(
      (l) => l.type === lightType.toUpperCase()
    ).length;

    if (lightType === "" || typeCount >= maxLights) {
      setSnackbarOpen(true);
      return;
    }

    const defaultSettings = {
      AMBIENT: { intensity: 0.5 },
      DIRECTIONAL: {
        intensity: 1,
        position: { x: 0, y: 5, z: 0 },
        castShadow: false,
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
    const newLight = {
      type: lightType.toUpperCase(),
      name:
        lightName ||
        `${
          lightType.charAt(0).toUpperCase() + lightType.slice(1).toLowerCase()
        } ${typeCount + 1}`,
      ...defaultSettings[lightType.toLowerCase()],
    };

    console.log(newLight);

    addLight(newLight);

    setLightType("");
    setLightName("");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const renderPositionControls = (light) => (
    <Box
      sx={{
        display: "flex",
        gap: 0.7,
        marginTop: 2,
        marginBottom: 2,
        marginRight: "5px",
      }}
    >
      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: "normal",
          color: "#282828",
          marginRight: "10px",
          marginLeft: "20px",
          fontFamily: "Avenir, sans-serif",
          textAlign: "left",
        }}
      >
        Position
      </Typography>
      <TextField
        value={light.position?.x ?? 0}
        onChange={(e) =>
          updateLight(light.id, {
            ...light,
            position: { ...light.position, x: parseFloat(e.target.value) },
          })
        }
        type="number"
        inputProps={{
          style: {
            MozAppearance: "textfield",
            paddingRight: 0,
          },
        }}
        sx={{
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
          "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
            {
              WebkitAppearance: "none",
              margin: 0,
            },
          width: "80px",
          "& .MuiInputBase-root": {
            height: "24px",
            padding: "0px 5px",
            fontSize: "12px",
            textAlign: "center",
            color: "#529d36",
            backgroundColor: "#ddd",
            fontFamily: "Avenir, sans-serif",
            fontWeight: "bold",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
      />

      <TextField
        value={light.position?.y ?? 0}
        onChange={(e) =>
          updateLight(light.id, {
            ...light,
            position: { ...light.position, y: parseFloat(e.target.value) },
          })
        }
        type="number"
        inputProps={{
          style: {
            MozAppearance: "textfield",
            paddingRight: 0,
          },
        }}
        sx={{
          width: "80px",
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
          "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
            {
              WebkitAppearance: "none",
              margin: 0,
            },
          "& .MuiInputBase-root": {
            height: "24px",
            padding: "0px",
            fontSize: "12px",
            textAlign: "center",
            color: "#529d36",
            backgroundColor: "#ddd",
            fontFamily: "Avenir, sans-serif",
            fontWeight: "bold",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
      />
      <TextField
        value={light.position?.z ?? 0}
        onChange={(e) =>
          updateLight(light.id, {
            ...light,
            position: { ...light.position, z: parseFloat(e.target.value) },
          })
        }
        type="number"
        inputProps={{
          style: {
            MozAppearance: "textfield",
            paddingRight: 0,
          },
        }}
        sx={{
          width: "80px",
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
          "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
            {
              WebkitAppearance: "none",
              margin: 0,
            },
          "& .MuiInputBase-root": {
            height: "24px",
            padding: "0px",
            fontSize: "12px",
            textAlign: "center",
            color: "#529d36",
            backgroundColor: "#ddd",
            fontFamily: "Avenir, sans-serif",
            fontWeight: "bold",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
      />
    </Box>
  );

  const renderTargetControls = (light) => (
    <Box
      sx={{
        display: "flex",
        gap: 0.7,
        marginTop: 2,
        marginBottom: 2,
        marginRight: "5px",
      }}
    >
      <Typography
        sx={{
          fontSize: "12px",
          fontWeight: "normal",
          color: "#282828",
          marginRight: "10px",
          marginLeft: "20px",
          fontFamily: "Avenir, sans-serif",
          textAlign: "left",
        }}
      >
        Target
      </Typography>
      <TextField
        value={light.target?.x ?? 0}
        onChange={(e) =>
          updateLight(light.id, {
            ...light,
            target: { ...light.target, x: parseFloat(e.target.value) },
          })
        }
        type="number"
        inputProps={{
          style: {
            MozAppearance: "textfield",
            paddingRight: 0,
          },
        }}
        sx={{
          width: "80px",
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
          "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
            {
              WebkitAppearance: "none",
              margin: 0,
            },
          "& .MuiInputBase-root": {
            height: "24px",
            padding: "0px",
            fontSize: "12px",
            textAlign: "center",
            color: "#529d36",
            backgroundColor: "#ddd",
            fontFamily: "Avenir, sans-serif",
            fontWeight: "bold",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
      />
      <TextField
        value={light.target?.y ?? 0}
        onChange={(e) =>
          updateLight(light.id, {
            ...light,
            target: { ...light.target, y: parseFloat(e.target.value) },
          })
        }
        type="number"
        inputProps={{
          style: {
            MozAppearance: "textfield", // For Firefox
            paddingRight: 0,
          },
        }}
        sx={{
          width: "80px",
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
          "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
            {
              WebkitAppearance: "none",
              margin: 0,
            },
          "& .MuiInputBase-root": {
            height: "24px",
            padding: "0px",
            fontSize: "12px",
            textAlign: "center",
            color: "#529d36",
            backgroundColor: "#ddd",
            fontFamily: "Avenir, sans-serif",
            fontWeight: "bold",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
      />
      <TextField
        value={light.target?.z ?? 0}
        onChange={(e) =>
          updateLight(light.id, {
            ...light,
            target: { ...light.target, z: parseFloat(e.target.value) },
          })
        }
        type="number"
        inputProps={{
          style: {
            MozAppearance: "textfield",
            paddingRight: 0,
          },
        }}
        sx={{
          width: "80px",
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
          "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
            {
              WebkitAppearance: "none",
              margin: 0,
            },
          "& .MuiInputBase-root": {
            height: "24px",
            padding: "0px",
            fontSize: "12px",
            textAlign: "center",
            color: "#529d36",
            backgroundColor: "#ddd",
            fontFamily: "Avenir, sans-serif",
            fontWeight: "bold",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
      />
    </Box>
  );

  const renderDirectionalControls = (light) => (
    <Box>
      <CustomSlider
        value={light.intensity ?? 0}
        label="Intensity"
        onChange={(e, newValue) =>
          updateLight(light.id, { ...light, intensity: newValue })
        }
      />
      {renderPositionControls(light)}
      {renderTargetControls(light)}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginTop: 1,
          marginBottom: 1,
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "10px",
            fontWeight: "normal",
            color: "#333",
            marginRight: "0px",
            marginLeft: "20px",
          }}
        >
          Cast Shadow
        </Typography>
        <Switch
          checked={light.castShadow ?? false}
          onChange={() =>
            updateLight(light.id, { ...light, castShadow: !light.castShadow })
          }
          size="small"
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "#529D36",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "#529D36",
            },
            "& .MuiSwitch-track": {
              backgroundColor: "#ccc",
            },
          }}
        />
      </Box>
    </Box>
  );

  const renderSpotControls = (light) => (
    <Box>
      <CustomSlider
        value={light.intensity ?? 0}
        label="Intensity"
        onChange={(e, newValue) =>
          updateLight(light.id, { ...light, intensity: newValue })
        }
      />
      <CustomSlider
        value={light.angle ?? 0}
        label="Angle"
        onChange={(e, newValue) =>
          updateLight(light.id, { ...light, angle: newValue })
        }
      />
      <CustomSlider
        value={light.decay ?? 0}
        label="Decay"
        onChange={(e, newValue) =>
          updateLight(light.id, { ...light, decay: newValue })
        }
      />
      {renderPositionControls(light)}
      {renderTargetControls(light)}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginTop: 1,
          marginBottom: 1,
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "10px",
            fontWeight: "normal",
            color: "#333",
            marginRight: "0px",
            marginLeft: "20px",
          }}
        >
          Cast Shadow
        </Typography>
        <Switch
          checked={light.castShadow ?? false}
          onChange={() =>
            updateLight(light.id, { ...light, castShadow: !light.castShadow })
          }
          size="small"
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: "green",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "#529D36",
            },
            "& .MuiSwitch-track": {
              backgroundColor: "#ccc",
            },
          }}
        />
      </Box>
    </Box>
  );

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
      {/* Light List */}
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
        {lights.map((light) => (
          <Box key={light.id}>
            <Accordion
              disableGutters
              elevation={0}
              expanded={expandedPanel === light.name} // Check if this panel is expanded
              onChange={handleAccordionChange(light.name)} // Toggle expanded state
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
                  {expandedPanel === light.name ? (
                    <ExpandMoreIcon sx={{ fontSize: "21px" }} />
                  ) : (
                    <ChevronRightIcon sx={{ fontSize: "21px" }} />
                  )}
                </Box>

                {renamingLightId === light.id ? (
                  <TextField
                    value={light.name}
                    onChange={(e) => handleRenameChange(e, light.id)}
                    size="small"
                    sx={{ width: "100px", fontSize: "8px" }}
                    onBlur={() => setRenamingLightId(null)}
                  />
                ) : (
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
                    {light.name}
                  </Typography>
                )}
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
                    onClick={(e) => handleMenuClick(e, light.id)}
                  >
                    <MoreVertIcon sx={{ fontSize: "12px" }} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && currentLightId === light.id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => setRenamingLightId(light.id)}>
                      Rename
                    </MenuItem>
                    <MenuItem onClick={() => handleDuplicate(light.id)}>
                      Duplicate
                    </MenuItem>
                    <MenuItem onClick={() => handleDelete(light.id)}>
                      Delete
                    </MenuItem>
                  </Menu>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "0px", marginTop: "2px" }}>
                {light.type === "AMBIENT" && (
                  <CustomSlider
                    value={light.intensity ?? 0}
                    label="Intensity"
                    onChange={(e, newValue) =>
                      updateLight(light.id, { ...light, intensity: newValue })
                    }
                  />
                )}
                {light.type === "HEMISPHERE" && (
                  <CustomSlider
                    value={light.intensity ?? 0}
                    label="Hemisphere Intensity"
                    onChange={(e, newValue) =>
                      updateLight(light.id, { ...light, intensity: newValue })
                    }
                  />
                )}
                {light.type === "DIRECTIONAL" &&
                  renderDirectionalControls(light)}
                {light.type === "SPOT" && renderSpotControls(light)}
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
          {/* <InputLabel
            shrink={false}
            sx={{
              transform: "translate(7px, -6px) scale(0.75)",
              backgroundColor: "white",
              padding: "0 4px",
            }}
          >
            Light Type
          </InputLabel> */}
          <Select
            displayEmpty
            value={lightType}
            onChange={(e) => setLightType(e.target.value)}
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
                Light Type
              </span>
            </MenuItem>
            <MenuItem value="ambient">Ambient</MenuItem>
            <MenuItem value="hemisphere">Hemisphere</MenuItem>
            <MenuItem value="directional">Directional</MenuItem>
            <MenuItem value="spot">Spot</MenuItem>
          </Select>
        </FormControl>
        <TextField
          variant="outlined"
          className="custom-text-field"
          placeholder="Light Name"
          value={lightName}
          onChange={(e) => setLightName(e.target.value)}
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
              fontSize: "11px",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: "35px",
              letterSpacing: "0.02em",
              textAlign: "left",
            },
            "& .MuiInputBase-input::placeholder": {
              fontFamily: "Avenir",
              fontSize: "11px",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: "35px",
              letterSpacing: "0.02em",
              textAlign: "left",
              color: "#666",
            },
          }}
          InputLabelProps={{
            shrink: false,
          }}
        />

        <Button
          variant="contained"
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
          onClick={handleAddLight}
        >
          Add
        </Button>
      </Box>

      {/* Snackbar for max lights */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="warning"
          sx={{ width: "100%" }}
        >
          Maximum 5 lights of this category can be added in the scene!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LightSettings;
//v3 - All UI updated
//v4- Ui with figma
