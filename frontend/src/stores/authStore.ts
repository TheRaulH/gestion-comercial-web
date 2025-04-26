// src/stores/authStore.ts
import { create } from "zustand";
import { User } from '../types/user';
import { authApi } from "../api/authApi";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
     
    set({ isLoading: true, error: null });
    try {
      console.log("Intentando iniciar sesión con:", email, password);
      const { data } = await authApi.login({ email, password });
      console.log("Respuesta del servidor:", data);
      localStorage.setItem("authToken", data.token);
      console.log("Token guardado en localStorage:", data.token);
      set({ user: data.usuario, isAuthenticated: true });
      console.log("Sesión iniciada con éxito:", data.usuario);
    } catch (error) {
      set({ error: "Credenciales inválidas" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.register({
        nombre: name,
        email,
        password,
      });
      localStorage.setItem("authToken", data.token); // Asumimos que backend devuelve token al registrarse
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      set({ error: "Error en el registro" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.me();
      set({ user: data, isAuthenticated: true });
    } catch (error) {
      console.error("Error al verificar autenticación", error);
      localStorage.removeItem("authToken");
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
