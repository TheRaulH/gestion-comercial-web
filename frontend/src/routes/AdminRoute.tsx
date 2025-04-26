// src/routes/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

interface Props {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: Props) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || !user?.es_administrador) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
