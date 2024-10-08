import React from "react";
import { Box, Slider, Typography, TextField } from "@mui/material";

const CustomSlider = ({
  value,
  onChange,
  label,
  min = 0,
  max = 1,
  step = 0.01,
  onInputChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "5px",
        marginBottom: "10px",
        marginRight: "5px",
      }}
    >
      <Typography
        sx={{
          fontSize: "10px",
          fontWeight: "normal",
          color: "#333",
          marginRight: "10px",
          marginLeft: "20px",
        }}
      >
        {label}
      </Typography>

      {/* Slider */}
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        sx={{
          width: "120px",
          height: "20px",
          padding: "0px",
          "& .MuiSlider-thumb": {
            display: "none",
          },
          "& .MuiSlider-track": {
            backgroundColor: "green",
            height: "100%",
            borderRadius: "2px",
          },
          "& .MuiSlider-rail": {
            backgroundColor: "#e0e0e0",
            height: "100%",
            borderRadius: "2px",
          },
        }}
      />

      {/* TextField for manual value input */}
      <TextField
        value={typeof value === "number" ? value.toFixed(2) : ""}
        onChange={onInputChange}
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

export default CustomSlider;
