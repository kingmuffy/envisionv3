import React, { useRef, useContext } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import ImageIcon from "@mui/icons-material/Image";
import { MapContext } from "../MapContext";

const MapNode = ({ id, data }) => {
  const fileInputRef = useRef(null);
  const { updateConnectedMaps } = useContext(MapContext);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const thumbnail = reader.result;
        // Update node data (this will update the UI)
        data.updateNodeData(id, file, thumbnail, file.name);

        // Update connected maps in the context
        if (data.mapType) {
          updateConnectedMaps(data.mapType, file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "5px 10px",
        fontFamily: "Barlow, sans-serif",
        width: "200px",
        position: "relative",
      }}
    >
      <strong
        style={{
          flex: 1,
          textAlign: "left",
          fontSize: "14px",
          paddingRight: "10px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {data.label || "Map Node"}
      </strong>
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={handleImageClick}
      >
        {data.thumbnail ? (
          <img
            src={data.thumbnail}
            alt={data.label}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <ImageIcon style={{ width: "50%", height: "50%", color: "#ccc" }} />
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#40E0D0", borderRadius: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`handle-${id}`}
        style={{ background: "#40E0D0", borderRadius: "50%" }}
      />
    </div>
  );
};

MapNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    updateNodeData: PropTypes.func.isRequired,
    thumbnail: PropTypes.string,
    mapType: PropTypes.string,
  }).isRequired,
};

export default MapNode;
