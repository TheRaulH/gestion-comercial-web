import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";

export const AuthLayout = () => {
  return (
    <Container maxWidth="sm">
      <Box mt={10}>
        <Outlet />
      </Box>
    </Container>
  );
};
