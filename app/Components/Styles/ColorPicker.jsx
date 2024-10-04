/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { TextField, Box, Typography } from "@mui/material";
import CustomSlider from "./CustomSlider";

const ColorPicker = () => {
  const [sheenColor, setSheenColor] = useState("#ffffff");

  const handleSheenColorChange = (event) => {
    setSheenColor(event.target.value);
  };
  return (
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
        Hex
      </Typography>
      {/* Color Picker Input */}
      <input
        type="color"
        value={sheenColor}
        onChange={handleSheenColorChange}
        style={{
          width: "120px",
          height: "20px",
          padding: "0px",

          cursor: "pointer",
          borderRadius: "2px",
          border: "none",
        }}
      />

      <TextField
        value={sheenColor}
        onChange={handleSheenColorChange}
        sx={{
          width: "50px",
          "& .MuiInputBase-root": {
            height: "20px",
            padding: "0px",
            fontSize: "10px",
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
};

export default ColorPicker;
//v3 - All UI updated
