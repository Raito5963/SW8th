"use client";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Link,
} from "@mui/material";
import Image from 'next/image';
export default function ButtonAppBar() {

  return (
    <Box sx={{ display: "flex", flexDirection: "column" ,height:"5rem" }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" underline="none" color="inherit">
              <Image src="/gaga.png" alt="Gaga logo" width={250} height={50} />
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
