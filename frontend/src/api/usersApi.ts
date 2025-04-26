// src/api/usersApi.ts
import { apiClient } from "./client";
import { User } from "../types/user";

type CreateUserRequest = {
  nombre: string;
  email: string;
  password: string;
  es_administrador?: boolean;
};

export const usersApi = {
  getUsers: () => apiClient.get<User[]>("/usuarios"),
  updateUser: (id: string, user: Partial<User>) =>
    apiClient.put(`/usuarios/${id}`, user),
  deleteUser: (id: string) => apiClient.delete(`/usuarios/${id}`),
  createUser: (user: CreateUserRequest) =>
    apiClient.post("/usuarios/registro", user),
};
