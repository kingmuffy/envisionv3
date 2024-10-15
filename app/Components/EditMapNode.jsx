import React, { useRef, useContext, useState } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import ImageIcon from "@mui/icons-material/Image";
import { MapContext } from "../EditContext";
import axios from "axios";

const EditMapNode = ({ id, data }) => {
  const fileInputRef = useRef(null);
  const { updateConnectedMaps } = useContext(MapContext);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const thumbnail = reader.result;
          data.updateNodeData(id, file, thumbnail);
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append("fabricId", data.fabricId);
        formData.append("mapType", data.mapType);
        formData.append("file", file);

        const uploadResponse = await axios.put("/api/update", formData);

        if (uploadResponse.status === 200) {
          const fileUrl = uploadResponse.data.fileUrl;

          updateConnectedMaps(data.mapType, fileUrl);
        } else {
          console.error("Error updating map:", uploadResponse.data.message);
        }
      } catch (error) {
        console.error("Error uploading file or updating map:", error);
      } finally {
        setIsUploading(false);
      }
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
        {isUploading ? (
          <div>Loading...</div>
        ) : data.thumbnail ? (
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

EditMapNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    updateNodeData: PropTypes.func.isRequired,
    thumbnail: PropTypes.string,
    mapType: PropTypes.string,
    fabricId: PropTypes.string.isRequired,
  }).isRequired,
};

export default EditMapNode;
