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
        shadow: -0.005,
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

  // Render Position and Target Controls for Directional and Spot Lights
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
          fontSize: "10px",
          fontWeight: "normal",
          marginLeft: "20px",
          color: "#333",
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
        sx={{
          width: "150px",
          "& .MuiInputBase-root": {
            height: "25px",
            padding: "0px",
            fontSize: "9px",
            textAlign: "center",
            backgroundColor: "#e0e0e0",
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
        sx={{
          width: "150px",
          "& .MuiInputBase-root": {
            height: "25px",
            padding: "0px",
            fontSize: "9px",
            textAlign: "center",
            backgroundColor: "#e0e0e0",
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
        sx={{
          width: "150px",
          "& .MuiInputBase-root": {
            height: "25px",
            padding: "0px",
            fontSize: "9px",
            textAlign: "center",
            backgroundColor: "#e0e0e0",
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
          fontSize: "10px",
          fontWeight: "normal",
          marginLeft: "20px",
          color: "#333",
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
        sx={{
          width: "150px",
          "& .MuiInputBase-root": {
            height: "25px",
            padding: "0px",
            fontSize: "9px",
            textAlign: "center",
            backgroundColor: "#e0e0e0",
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
        sx={{
          width: "150px",
          "& .MuiInputBase-root": {
            height: "25px",
            padding: "0px",
            fontSize: "9px",
            textAlign: "center",
            backgroundColor: "#e0e0e0",
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
        sx={{
          width: "150px",
          "& .MuiInputBase-root": {
            height: "25px",
            padding: "0px",
            fontSize: "9px",
            textAlign: "center",
            backgroundColor: "#e0e0e0",
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
              color: "green",
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: "green",
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
              backgroundColor: "green",
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
        overflowY: "hidden",
        height: "100vh",
      }}
    >
      {/* Light List */}
      <Box
        sx={{
          height: "calc(100vh - 350px)",
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
              sx={{ border: "none", padding: "0px" }}
            >
              <AccordionSummary
                sx={{ minHeight: "20px", padding: "0px", margin: 0 }}
              >
                <ExpandMoreIcon
                  sx={{ fontSize: "12px", paddingRight: "3px" }}
                />
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
                    sx={{ fontSize: "8px", fontWeight: "normal", margin: 0 }}
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

      {/* Add Light Section */}
      <Box
        sx={{
          position: "absolute",
          bottom: 65,
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          backgroundColor: "#f1f1f1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "70px",
        }}
      >
        <FormControl
          variant="outlined"
          className="custom-text-field"
          sx={{ marginBottom: 3, width: "70%" }}
        >
          <InputLabel
            shrink={true}
            sx={{
              transform: "translate(14px, -6px) scale(0.75)",
              backgroundColor: "white",
              padding: "0 4px",
            }}
          >
            Light Type
          </InputLabel>
          <Select
            value={lightType}
            onChange={(e) => setLightType(e.target.value)}
            label="Light Type"
          >
            <MenuItem value="ambient">Ambient</MenuItem>
            <MenuItem value="hemisphere">Hemisphere</MenuItem>
            <MenuItem value="directional">Directional</MenuItem>
            <MenuItem value="spot">Spot</MenuItem>
          </Select>
        </FormControl>
        <TextField
          variant="outlined"
          className="custom-text-field"
          label="Light Name"
          value={lightName}
          onChange={(e) => setLightName(e.target.value)}
          sx={{ marginBottom: 2, width: "70%" }}
          InputLabelProps={{
            shrink: true,
            style: {
              transform: "translate(14px, -6px) scale(0.75)",
              backgroundColor: "white",
              padding: "0 4px",
            },
          }}
        />
        <Button
          variant="contained"
          sx={{
            backgroundColor: "green",
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
