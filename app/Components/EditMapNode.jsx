import React, { useRef, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import { MapContext } from "../EditContext";
import axios from "axios";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const EditMapNode = ({ id, data, handleNodeDelete }) => {
  const fileInputRef = useRef(null);
  const { updateConnectedMaps, disconnectMap } = useContext(MapContext);
  const [isUploading, setIsUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(""); // New snackbar message state
  const [selected, setSelected] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (data.mapType === "nulle") {
      setSnackbarMessage("Please connect the node before uploading a file.");
      setSnackbarOpen(true);
      fileInputRef.current.value = null;
      return;
    }

    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("fabricId", data.fabricId);
        formData.append("mapType", data.mapType);
        formData.append("file", file);

        const uploadResponse = await axios.put("/api/update", formData);

        if (uploadResponse.status === 200) {
          const fileUrl =
            uploadResponse.data.fabric[data.mapType.toLowerCase() + "MapUrl"];
          updateConnectedMaps({ [data.mapType]: fileUrl });
          data.thumbnail = fileUrl;
        } else {
          console.error("Error updating map:", uploadResponse.data.message);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsUploading(false);
        fileInputRef.current.value = null; // Reset after upload attempt
      }
    }
  };

  // Snackbar close handler
  const closeSnackbar = () => setSnackbarOpen(false);

  // Delete confirmation dialog handlers
  const handleDeleteClick = () => setOpenDeleteDialog(true);
  const cancelDelete = () => setOpenDeleteDialog(false); // This function is now defined
  const confirmDelete = async () => {
    try {
      console.log("Deleting mapType:", data.mapType);
      const formData = new FormData();
      formData.append("fabricId", data.fabricId);
      formData.append("mapType", data.mapType);

      const response = await axios.put("/api/updateMapUrlToNull", formData);

      if (response.status === 200) {
        console.log("Map deleted successfully:", response.data);
        handleNodeDelete({ id, data });
        disconnectMap(data.mapType);
      } else {
        console.error("Error deleting map:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting map:", error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <div
      onClick={() => setSelected(!selected)}
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
          onClick={handleDeleteClick}
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

      {/* Snackbar for feedback messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={closeSnackbar}
      >
        <Alert
          onClose={closeSnackbar}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Dialog for delete confirmation */}
      <Dialog
        open={openDeleteDialog}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this map?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
  handleNodeDelete: PropTypes.func.isRequired,
};

export default EditMapNode;
