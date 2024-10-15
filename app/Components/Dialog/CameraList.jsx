import React from "react";
import { List, ListItem, Typography, Avatar, Box } from "@mui/material";

const CameraList = ({ listData }) => {
  return (
    <List>
      {listData.map((item) => (
        <ListItem
          key={item.id}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "15px",
            borderBottom: "1px solid lightgray",
            paddingBottom: "10px",
            marginBottom: "10px",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "black", fontWeight: "bold" }}
            >
              {item.cameraName || "Unnamed Camera"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "gray", marginTop: "5px" }}
            >
              Created on: {new Date(item.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default CameraList;
