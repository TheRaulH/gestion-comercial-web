// src/components/Navbar.tsx
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
} from "@mui/icons-material";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { ConfirmLogoutDialog } from "./ConfirmLogoutDialog";

interface NavbarProps {
  toggleSidebar?: () => void;
}

export const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setAnchorEl(null);
    setLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
    setLogoutDialogOpen(false);
  };

  const handleCancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        className="bg-white text-gray-800 shadow-md"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar className="flex justify-between items-center">
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleSidebar}
              className="mr-2"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" className="font-bold">
            My Store Admin
          </Typography>

          <Box className="flex items-center gap-2">
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar className="bg-blue-600 w-8 h-8">
                  <AccountCircle />
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={handleClose}
                  className="flex items-center gap-2"
                >
                  <AccountCircle fontSize="small" />
                  <Typography>Perfil</Typography>
                </MenuItem>
                <MenuItem
                  onClick={handleClose}
                  className="flex items-center gap-2"
                >
                  <Settings fontSize="small" />
                  <Typography>Configuración</Typography>
                </MenuItem>
                <MenuItem
                  onClick={handleLogoutClick}
                  className="flex items-center gap-2"
                  aria-label="logout"
                >
                  <Logout fontSize="small" />
                  <Typography>Salir</Typography>
                </MenuItem>
              </Menu>
            </div>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Confirmación de Logout */}
      <ConfirmLogoutDialog
        open={logoutDialogOpen}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};
