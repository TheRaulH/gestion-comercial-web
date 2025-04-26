// src/stores/userStore.ts
import { create } from "zustand";
import { usersApi } from "../api/usersApi";
import { User } from '../types/user';

type UserState = {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  createUser: (user: {
    nombre: string;
    email: string;
    password: string;
    es_administrador?: boolean;
  }) => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await usersApi.getUsers();
      set({ users: data });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      set({ error: "Error al obtener usuarios" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (id, user) => {
    set({ isLoading: true });
    try {
      await usersApi.updateUser(id, user);
      await useUserStore.getState().fetchUsers(); // Recargar lista
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      set({ error: "Error al actualizar usuario" });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true });
    try {
      await usersApi.deleteUser(id);
      await useUserStore.getState().fetchUsers(); // Recargar lista
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      set({ error: "Error al eliminar usuario" });
    } finally {
      set({ isLoading: false });
    }
  },

  createUser: async (user) => {
    set({ isLoading: true });
    try {
      await usersApi.createUser(user);
      await useUserStore.getState().fetchUsers();
    } catch (error) {
        console.error("Error al crear usuario:", error);
      set({ error: "Error al crear usuario" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
