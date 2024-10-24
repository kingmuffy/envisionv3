import React from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import { Tooltip, Typography, Box } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const InfoNode = ({ data }) => {
  const { links = {}, connectedFiles = {} } = data;

  const mapsWithLinks = Object.entries(links).filter(
    ([mapType, url]) => typeof url === "string" && url.trim() !== ""
  );

  return (
    <Box
      sx={{
        padding: "12px",
        backgroundColor: "#f5f5f5",
        borderRadius: "12px",
        border: "1px solid #ddd",
        width: "280px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: "8px",
          textAlign: "center",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        Map Links Info
      </Typography>

      {/* Loop through all maps initialized with links */}
      {mapsWithLinks.map(([mapType, url], index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 0",
            borderBottom:
              index < mapsWithLinks.length - 1 ? "1px solid #e0e0e0" : "none",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            {mapType}:
          </Typography>

          {connectedFiles[mapType] ? (
            <Tooltip title={connectedFiles[mapType].name} arrow>
              <InsertDriveFileIcon
                sx={{ color: "#529d36", cursor: "pointer" }}
              />
            </Tooltip>
          ) : (
            <Tooltip title={url} arrow>
              <LinkIcon sx={{ color: "#529d36", cursor: "pointer" }} />
            </Tooltip>
          )}
        </Box>
      ))}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#529d36",
          borderRadius: "50%",
          width: "8px",
          height: "8px",
        }}
      />
    </Box>
  );
};

InfoNode.propTypes = {
  data: PropTypes.shape({
    links: PropTypes.object.isRequired, // Object containing mapType => link (only maps with links should be passed)
    connectedFiles: PropTypes.object, // Object containing mapType => file (if a file is connected)
  }).isRequired,
};

export default InfoNode;
