"use client";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
} from "@mui/material";
export default function ButtonAppBar() {

  return (
    <Box sx={{ display: "flex", flexDirection: "column" ,height:"5rem" }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            事業名　と　スローガン的な何か
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
