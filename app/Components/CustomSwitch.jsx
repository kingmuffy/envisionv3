import React from "react";

const CustomSwitch = ({ checked, onChange }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "40px",
        height: "20px",
        backgroundColor: checked ? "green" : "#ccc",
        borderRadius: "10px",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.3s",
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          backgroundColor: "#fff",
          borderRadius: "50%",
          position: "absolute",
          top: "1px",
          left: checked ? "20px" : "2px",
          transition: "left 0.3s",
        }}
      />
    </div>
  );
};

export default CustomSwitch;
