import React from "react";
import { List, ListItem, Typography, Avatar, Box } from "@mui/material";
const MaterialList = ({ listData, handleEditRedirect }) => {
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
          // onClick={() => handleEditRedirect(item.id)}
        >
          {item.diffuseMapUrl ? (
            <img
              src={item.diffuseMapUrl}
              alt={item.materialName || "Material Image"}
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "5px",
                objectFit: "cover",
                backgroundColor: "#f5f5f5",
              }}
            />
          ) : (
            <Avatar
              variant="square"
              sx={{
                width: 70,
                height: 70,
                borderRadius: "5px",
                backgroundColor: "grey.300",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: 14,
              }}
            >
              No Image
            </Avatar>
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "black", fontWeight: "bold" }}
            >
              {item.materialName || item.name || "Unnamed"}
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

export default MaterialList;
