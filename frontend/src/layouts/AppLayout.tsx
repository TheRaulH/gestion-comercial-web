// src/layouts/AppLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box display="flex">
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <Box flexGrow={1}>
        <Navbar toggleSidebar={handleDrawerToggle} />
        <Box component="main" className="p-4">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
