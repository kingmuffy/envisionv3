"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const List = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const accordionsData = [
    { id: 1, label: "Accordion 1", status: "red" },
    { id: 2, label: "Accordion 2", status: "green" },
    { id: 3, label: "Accordion 3", status: "yellow" },
    { id: 4, label: "Accordion 4", status: "blue" },
    { id: 5, label: "Accordion 5", status: "orange" },
  ];

  const listItems = ["a", "b", "c", "d", "e"];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#fff",
        padding: "40px",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "24px",
          width: "90%",
          maxWidth: "600px",
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        {accordionsData.map((accordion) => (
          <Accordion
            key={accordion.id}
            expanded={expanded === `panel${accordion.id}`}
            onChange={handleChange(`panel${accordion.id}`)}
            sx={{
              marginBottom: "10px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "none",
              transition: "all 0.3s ease-in-out",
              border: "1px solid #e0e0e0",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#888" }} />}
              aria-controls={`panel${accordion.id}-content`}
              id={`panel${accordion.id}-header`}
              sx={{
                paddingLeft: "16px",
                paddingRight: "16px",
                backgroundColor: "#F3F4F6",
                borderRadius: "12px",
                transition: "background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: "#ECEFF1",
                },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "500",
                  color: "#333",
                  letterSpacing: "0.5px",
                }}
              >
                {accordion.label}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                padding: "16px 24px",
                backgroundColor: "#FFF",
                borderRadius: "12px",
              }}
            >
              <Grid
                container
                spacing={2}
                sx={{ borderBottom: "1px solid #e0e0e0" }}
              >
                <Grid
                  item
                  xs={6}
                  sx={{ padding: "8px", fontWeight: "bold", color: "#555" }}
                >
                  <Typography variant="body2">Item</Typography>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sx={{ padding: "8px", fontWeight: "bold", color: "#555" }}
                >
                  <Typography variant="body2">Status</Typography>
                </Grid>
              </Grid>
              {listItems.map((item, index) => (
                <Grid
                  key={index}
                  container
                  spacing={2}
                  sx={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <Grid
                    item
                    xs={6}
                    sx={{
                      padding: "8px",
                      color: "#555",
                      fontSize: "0.95rem",
                    }}
                  >
                    <Typography>{item}</Typography>
                  </Grid>

                  <Grid
                    item
                    xs={6}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      padding: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: accordion.status,
                        borderRadius: "50%",
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.2)",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
};

export default List;
