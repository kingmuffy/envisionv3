import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const CameraList = ({
  listData,
  handleDelete,
  handleMakeDefault,
  handleSelect,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 595 }} aria-label="camera scenes table">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Date
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listData.map((item) => (
            <TableRow
              key={item.id}
              sx={{
                "&:hover": {
                  backgroundColor: "#f0f0f0", // Light grey on hover
                },
              }}
            >
              <TableCell component="th" scope="row">
                {item.name || "Unnamed Camera"}
              </TableCell>
              <TableCell>
                {new Date(item.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {/* Delete Button */}
                <IconButton
                  onClick={() => handleDelete(item.id)}
                  aria-label="delete"
                  sx={{
                    color: "red",
                  }}
                >
                  <DeleteIcon />
                </IconButton>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleMakeDefault(item.id)}
                  startIcon={
                    item.isDefault ? (
                      <CheckIcon />
                    ) : (
                      <RadioButtonUncheckedIcon />
                    )
                  }
                  sx={{
                    marginRight: "10px",
                    textTransform: "none",
                    width: "130px",
                    color: item.isDefault ? "#ffffff" : "grey",
                    borderColor: item.isDefault ? "#B0B0B0" : "grey",
                    backgroundColor: item.isDefault ? "#B0B0B0" : "transparent",
                    fontWeight: item.isDefault ? "bold" : "normal",
                    "&:hover": {
                      backgroundColor: item.isDefault
                        ? "#A0A0A0"
                        : "transparent",
                      borderColor: item.isDefault ? "#A0A0A0" : "grey",
                    },
                  }}
                  disabled={item.isDefault}
                >
                  {item.isDefault ? "Default" : "Make Default"}
                </Button>

                {/* Select Button */}
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleSelect(item.id)}
                  startIcon={<RadioButtonUncheckedIcon />}
                  sx={{
                    textTransform: "none",
                    width: "100px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#388E3C",
                    },
                  }}
                >
                  Select
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CameraList;
