/* eslint-disable no-unused-vars */
import React, { useRef, useContext, useState } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import ImageIcon from "@mui/icons-material/Image";
import { MapContext } from "../MapContext";
import CloseIcon from "@mui/icons-material/Close";

const MapNode = ({ id, data, onTriggerDelete }) => {
  const fileInputRef = useRef(null);
  const { updateConnectedMaps } = useContext(MapContext);
  const [selected, setSelected] = useState(false);
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  //
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const thumbnail = reader.result;

        data.updateNodeData(id, file, thumbnail, file.name);

        if (data.mapType) {
          updateConnectedMaps(data.mapType, file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // green colour when selected
  const handleNodeClick = () => {
    setSelected(!selected);
  };

  //Delete
  const handleDeleteClick = () => {
    onTriggerDelete({ id, data });
  };

  return (
    <div
      onClick={handleNodeClick}
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#ffff",
        border: selected ? "2px solid #529d36" : "2px solid #ccc",
        borderRadius: "8px",
        padding: "5px 10px",

        width: "200px",
        position: "relative",
        boxShadow: selected ? "0 0 10px rgba(0, 0, 0, 0.2)" : "none",
      }}
    >
      {/* X Button */}
      {selected && (
        <div
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            backgroundColor: "#5AA447",
            color: "#fff",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={handleDeleteClick} // Trigger delete modal
        >
          <CloseIcon style={{ fontSize: "20px" }} />
        </div>
      )}
      <strong
        style={{
          flex: 1,
          textAlign: "left",
          fontSize: "14px",
          paddingRight: "10px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontWeight: "bold !important",
          fontFamily: "Avenir, sans-serif",
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
        style={{ background: "#529D36", borderRadius: "50%" }}
      />
      {/* <Handle
        type="target"
        position={Position.Left}
        id={`handle-${id}`}
        style={{ background: "#40E0D0", borderRadius: "50%" }}
      /> */}
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
  onTriggerDelete: PropTypes.func.isRequired,
};

export default MapNode;
//v2 with figma design
