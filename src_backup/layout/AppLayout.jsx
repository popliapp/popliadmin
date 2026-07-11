import * as React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import SideMenu from "../components/SideMenu";
// import AppNavbar from "../components/AppNavbar";
import Header from "../components/Header";

export default function AppLayout() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => setOpen(newOpen);

  return (
    <Box sx={{ display: "flex",minWidth:"100vw" , minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <SideMenu open={open} toggleDrawer={toggleDrawer} />
      {/* <AppNavbar open={open} toggleDrawer={toggleDrawer} /> */}

      <Box component="main" sx={{ flexGrow: 1, backgroundColor: "#f9fafb", display: 'flex', flexDirection: 'column' }}>
        <Header onToggleDashboard={toggleDrawer(true)} />

        <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
          {/* 👇 PAGE CONTENT COMES HERE */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
