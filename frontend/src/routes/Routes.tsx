// routes/Routes.tsx
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";

import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { Dashboard } from "../pages/Dashboard";
import { Products } from "../pages/Products";
import { Orders } from "../pages/Orders";
import { CashRegister } from "../pages/CashRegister";
import { Users } from "../pages/Users";
import Settings from "../pages/Settings";
import { CashRegisterAdmin } from "../pages/admin/CashRegisterAdmin";

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
      { path: "orders", element: <Orders /> },
      { path: "cash-register", element: <CashRegister /> },
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
