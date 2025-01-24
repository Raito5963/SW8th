"use client";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
} from "@mui/material";
export default function ButtonAppBar() {

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar sx={{ minHeight: "56px", padding: "0 16px" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            事業名　と　スローガン的な何か
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
