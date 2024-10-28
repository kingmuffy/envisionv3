/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { Handle, Position } from "reactflow";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Tooltip } from "@mui/material";

const mapInfo = {
  Diffuse: "Defines the base color of the material.",
  Environment: "Controls environmental settings.",
  Refraction: "Determines how light bends through the material.",
  Bump: "Adds surface detail without changing geometry.",
  Normal:
    "The texture to create a normal map. The RGB values affect the surface normal for each pixel fragment and change the way the color is lit. Normal maps do not change the actual shape of the surface, only the lighting.",
  Displacement: "Modifies the surface geometry for added detail.",
  Emissive: "Makes the material appear self-illuminated.",
  Sheen: "Controls the transparency of the material.",
  AO: "Adds shading based on occlusion by surrounding objects.",
  Metalness: "Gives the surface a metallic appearance.",
  Roughness: "Determines the smoothness of the surface.",
  Clearcoat: "Adds a clear coat to the material.",
};
const MainNode = ({ data }) => (
  <div
    style={{
      padding: "12px 0px",
      backgroundColor: "#fff",
      border: "1px solid #ddd",
      borderRadius: "12px",
      width: "280px",
      color: "#333",
      fontFamily: "Avenir, sans-serif",
      position: "relative",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    }}
  >
    <div>
      <strong
        style={{
          display: "block",
          width: "100%",
          height: "40px",
          marginBottom: "12px",
          fontSize: "16px",
          textAlign: "left",
          color: "#333",
          fontFamily: "Avenir, sans-serif",
          fontWeight: "bold",
          borderBottom: "1px solid #e0e0e0",
          boxSizing: "border-box",
          paddingBottom: "5px",
          paddingLeft: "25px",
          paddingTop: "5px",
        }}
      >
        {data.label}
      </strong>
    </div>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        paddingLeft: "15px",
        paddingRight: "15px",
      }}
    >
      {data.maps.map((map, index) => {
        const mapName = typeof map === "string" ? map : map.name;
        const isHidden = typeof map === "object" && map.isHidden;

        // Skip hidden maps
        if (isHidden) return null;

        return (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Avenir, sans-serif",
              fontWeight: "bold",
              alignItems: "center",
              padding: "12px 15px",
              borderBottom:
                index !== data.maps.length - 1 ? "1px solid #e0e0e0" : "none",
              position: "relative",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontFamily: "Avenir, sans-serif",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                marginLeft: "5px",
                color: "#282828",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
              }}
            >
              {mapName}
              <Tooltip title={mapInfo[mapName]} arrow>
                <InfoOutlinedIcon
                  style={{
                    marginLeft: "15px",
                    fontSize: "14px",
                    color: "#DDDDDD",
                    cursor: "pointer",
                  }}
                />
              </Tooltip>
            </span>

            <Handle
              type="target"
              position={Position.Left}
              id={`handle-${mapName.toLowerCase()}`} // Use map name as handle identifier if it's an object
              style={{
                background: "#529D36",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                position: "absolute",
                left: "2px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </div>
        );
      })}
    </div>
  </div>
);

export default MainNode;
