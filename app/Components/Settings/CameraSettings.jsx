/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomSlider from "../Styles/CustomSlider";

const CameraSettings = () => {
  const [focusDistance, setFocusDistance] = useState(10);
  const [focalLength, setFocalLength] = useState(50);
  const [aperture, setAperture] = useState(2.8);

  // Handlers for sliders
  const handleFocusDistanceChange = (event, newValue) => {
    setFocusDistance(newValue);
  };

  const handleFocalLengthChange = (event, newValue) => {
    setFocalLength(newValue);
  };

  const handleApertureChange = (event, newValue) => {
    setAperture(newValue);
  };

  return (
    <Box>
      {/* Camera Settings Accordion */}
      {["FOCUS", "FOCAL LENGTH", "APERTURE"].map((setting) => (
        <Box key={setting}>
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
              <ExpandMoreIcon sx={{ fontSize: "12px", paddingRight: "3px" }} />
              <Typography
                sx={{ fontSize: "8px", fontWeight: "normal", margin: 0 }}
              >
                {setting}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: "0px", marginTop: "2px" }}>
              {setting === "FOCUS" && (
                <CustomSlider
                  value={focusDistance}
                  onChange={handleFocusDistanceChange}
                  label="Focus Distance"
                />
              )}
              {setting === "FOCAL LENGTH" && (
                <CustomSlider
                  value={focalLength}
                  onChange={handleFocalLengthChange}
                  label="Focal Length"
                />
              )}
              {setting === "APERTURE" && (
                <CustomSlider
                  value={aperture}
                  onChange={handleApertureChange}
                  label="Aperture"
                />
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
  );
};

export default CameraSettings;
//v3 - All UI updated
