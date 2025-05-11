// routes/Routes.tsx
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";

import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import { Orders } from "../pages/Orders";
import { CashRegister } from "../pages/CashRegister";
import { Users } from "../pages/Users";
import Settings from "../pages/Settings";
import { CashRegisterAdmin } from "../pages/admin/CashRegisterAdmin";
import LogoutPage from "../pages/Logout";
import { Products } from "../pages/Products";
import { ProductTypes } from "../pages/TypesProducts";
import { Movements } from "../pages/Movements";
import { CashMovements } from "../pages/MovementsCash";
import { CashRegisterDetails } from "../pages/admin/CashRegisterDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "products", element: <Products /> },
      { path: "tipos-producto", element: <ProductTypes /> },
      { path: "movimientos", element: <Movements /> },
      { path: "movimientos-caja", element: <CashMovements /> },

      { path: "orders", element: <Orders /> },
      { path: "cash-register", element: <CashRegister /> },
      { path: "logout", element: <LogoutPage /> },
      {
        path: "users",
        element: (
          <AdminRoute>
            <Users />
          </AdminRoute>
        ),
      },
      {
        path: "CRAdmin",
        element: (
          <AdminRoute>
            <CashRegisterAdmin />
          </AdminRoute>
        ),
      },
      // Nueva ruta para la página de detalles de arqueo
      {
        path: "cash-register-details/:id",
        element: (
          <AdminRoute>
            <CashRegisterDetails />
          </AdminRoute>
        ),
      },
      { path: "settings", element: <Settings></Settings> },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
]);
