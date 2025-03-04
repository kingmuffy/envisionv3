import React from "react";
import { Box, Slider, Typography, TextField } from "@mui/material";

const CustomSlider = ({
  value,
  onChange,
  label,
  min = 0,
  max = 1,
  step = 0.01,
}) => {
  const handleInputChange = (event) => {
    const newValue = parseFloat(event.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(null, newValue); // Call the onChange handler
    }
  };

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
          fontSize: "12px",
          fontWeight: "normal",
          color: "#282828",
          marginRight: "10px",
          marginLeft: "20px",
          fontFamily: "Avenir, sans-serif",
          textAlign: "left",
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
        track="inverted"
        sx={{
          width: "120px",
          height: "20px",
          padding: "0px",
          "& .MuiSlider-thumb": {
            width: "1px",
            height: "25px",
            backgroundColor: "green",
            "&:focus, &:hover, &:active, &:focus-visible": {
              boxShadow: "none",
              outline: "none",
              border: "none",
            },
            "&:before": {
              display: "none",
            },
          },
          "& .MuiSlider-track": {
            backgroundColor: "transparent",
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
      <Box sx={{ paddingLeft: "7px" }}>
        <TextField
          value={value}
          onChange={handleInputChange}
          sx={{
            width: "60px",
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
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
            "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
              {
                WebkitAppearance: "none",
                margin: 0,
              },
          }}
          inputProps={{
            step: step,
            min: min,
            max: max,
            type: "number",
          }}
        />
      </Box>
    </Box>
  );
};

export default CustomSlider;
