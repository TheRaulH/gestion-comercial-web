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

const drawerWidth = 240;
const collapsedWidth = 72;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    boxSizing: "border-box",
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
  },
  "&.Mui-selected:hover": {
    backgroundColor: theme.palette.primary.light,
  },
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0, 1.5),
  padding: theme.spacing(1, 2),
}));

export const Sidebar = ({ mobileOpen, handleDrawerToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const mainMenuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Products", icon: <InventoryIcon />, path: "/products" },
    { text: "Orders", icon: <ReceiptIcon />, path: "/orders" },
    {
      text: "Cash Register",
      icon: <PointOfSaleIcon />,
      path: "/cash-register",
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
              selected={selected}
              onClick={() => handleNavigation(item.path)}
              onMouseEnter={() => setHoveredItem(item.text)}
              onMouseLeave={() => setHoveredItem(null)}
              sx={{
                justifyContent: collapsed ? "center" : "flex-start",
                minHeight: 48,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: "center",
                  color: selected
                    ? theme.palette.primary.main
                    : hoveredItem === item.text
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: selected ? "bold" : "normal",
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
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          p: 2,
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StoreIcon color="primary" fontSize="medium" />
            <Typography variant="h6" fontWeight="bold" noWrap>
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
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
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

      {/* Footer */}
      {!collapsed && (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            v1.0.0
          </Typography>
        </Box>
      )}
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
