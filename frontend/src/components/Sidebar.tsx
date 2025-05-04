// src/components/Sidebar.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Typography,
  Tooltip,
  Avatar,
  styled,
  IconButton,
} from "@mui/material";
import {
  Store as StoreIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  PointOfSale as PointOfSaleIcon,
  Group as GroupIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const drawerWidth = 260;
const collapsedWidth = 72;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    boxSizing: "border-box",
    // Ensure the background color from the theme is applied
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary, // Default text color for the drawer
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  // Default state styles
  color: theme.palette.text.secondary, // Default text color
  "& .MuiListItemIcon-root": {
    color: theme.palette.text.secondary, // Default icon color
  },

  // Hover state styles
  "&:hover": {
    backgroundColor: "rgba(181, 202, 225, 0.08)", // A subtle hover effect using secondary color with opacity
    color: theme.palette.primary.main, // Change text color on hover
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main, // Change icon color on hover
    },
  },

  // Selected state styles
  "&.Mui-selected": {
    backgroundColor: theme.palette.secondary.main, // Use secondary color for background
    color: theme.palette.primary.main, // Use primary color for text
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main, // Use primary color for icon
    },
  },
  // Hover state on selected item (optional, keep the selected style)
  "&.Mui-selected:hover": {
    backgroundColor: theme.palette.secondary.main, // Keep the same background on hover
  },

  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0, 1.5),
  padding: theme.spacing(1.2, 2), // Slightly increased vertical padding
  minHeight: 40, // Increased minimum height for list items
}));

export const Sidebar = ({ mobileOpen, handleDrawerToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const mainMenuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Products", icon: <InventoryIcon />, path: "/products" },
    {
      text: "Tipos de Productos",
      icon: <InventoryIcon />,
      path: "/tipos-producto",
    },
    { text: "Orders", icon: <ReceiptIcon />, path: "/orders" },
    { text: "Movements", icon: <ReceiptIcon />, path: "/movimientos" },
    {
      text: "Cash Register",
      icon: <PointOfSaleIcon />,
      path: "/cash-register",
    },
    {
      text: "Movements Cash",
      icon: <PointOfSaleIcon />,
      path: "/movimientos-caja",
    },
    { text: "Users", icon: <GroupIcon />, path: "/users" },
    { text: "Admin Cash R.", icon: <ReceiptIcon />, path: "/CRAdmin" },
  ];

  const secondaryMenuItems = [
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
    { text: "Logout", icon: <LogoutIcon />, path: "/logout" },
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const renderMenuItems = (items: typeof mainMenuItems) => {
    return items.map((item) => {
      const selected = isActive(item.path);
      const showTooltip = collapsed && !isMobile;

      return (
        <Tooltip
          key={item.text}
          title={item.text}
          placement="right"
          disableHoverListener={!showTooltip}
          arrow
        >
          <ListItem disablePadding>
            <StyledListItemButton
              className="h-12"
              selected={selected}
              onClick={() => handleNavigation(item.path)}
              // Removed onMouseEnter/Leave from here as hover is handled by StyledListItemButton
              sx={{
                justifyContent: collapsed ? "center" : "flex-start",
                // minHeight handled by StyledListItemButton
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: "center",
                  // Colors handled by StyledListItemButton
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: selected ? "bold" : "normal",
                    // Color handled by StyledListItemButton
                  }}
                />
              )}
            </StyledListItemButton>
          </ListItem>
        </Tooltip>
      );
    });
  };

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        // Background color is now set on StyledDrawer paper
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          p: 2,
          minHeight: 40,
          color: theme.palette.text.secondary, // Ensure header elements use a visible color
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StoreIcon color="primary" fontSize="medium" />
            <Typography
              variant="h6"
              fontWeight="bold"
              noWrap
              sx={{ color: theme.palette.text.secondary }} // Use text.secondary for header title
            >
              My Store
            </Typography>
          </Box>
        )}
        {collapsed && (
          <Tooltip title="My Store" placement="right" arrow>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
              }}
            >
              <StoreIcon fontSize="small" />
            </Avatar>
          </Tooltip>
        )}
        {!isMobile && (
          <IconButton
            onClick={toggleCollapse}
            size="small"
            sx={{
              color: theme.palette.text.secondary, // Default color
              "&:hover": {
                color: theme.palette.primary.main, // Hover color
              },
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Main Menu */}
      <List sx={{ flexGrow: 1, py: 1 }}>{renderMenuItems(mainMenuItems)}</List>

      <Divider />

      {/* Secondary Menu */}
      <List sx={{ py: 1 }}>{renderMenuItems(secondaryMenuItems)}</List>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper, // Apply background color
              color: theme.palette.text.secondary, // Apply text color
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <StyledDrawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: collapsed ? collapsedWidth : drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: collapsed ? collapsedWidth : drawerWidth,
              borderRight: "none",
              boxShadow: theme.shadows[1],
              // Background and text colors are handled by StyledDrawer
            },
          }}
          open
        >
          {drawer}
        </StyledDrawer>
      )}
    </>
  );
};
