// src/api/authApi.ts
import { apiClient } from "./client";

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  nombre: string;
  email: string;
  password: string;
  es_administrador?: boolean;
};

export const authApi = {
  login: (data: LoginRequest) => apiClient.post("/usuarios/login", data),
  register: (data: RegisterRequest) =>
    apiClient.post("/usuarios/registro", data),
  me: () => apiClient.get("/usuarios/perfil"),
  updateProfile: (data: { nombre: string; email: string }) =>
    apiClient.put("/usuarios/perfil", data),
  changePassword: (data: { passwordActual: string; nuevaPassword: string }) =>
    apiClient.put("/usuarios/cambiar-password", data),
};
