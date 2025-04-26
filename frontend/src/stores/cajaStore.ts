// src/stores/cajaStore.ts
import { create } from "zustand";
import { cajaApi, Arqueo } from "../api/cajaApi";

type CajaState = {
  arqueos: Arqueo[];
  arqueoAbierto: Arqueo | null;
  isLoading: boolean;
  error: string | null;
  fetchMisArqueos: () => Promise<void>;
  fetchArqueoAbierto: () => Promise<void>;
  crearArqueo: (saldo_inicial: number) => Promise<void>;
  cerrarArqueo: (
    id_arqueo: number,
    ingresos: number,
    egresos: number,
    saldo_final: number
  ) => Promise<void>;
  fetchTodosArqueos: () => Promise<void>;
  fetchTodosAbiertos: () => Promise<void>;
  actualizarArqueo: (
    id_arqueo: number,
    saldo_inicial: number,
    ingresos: number,
    egresos: number
  ) => Promise<void>;
  eliminarArqueo: (id_arqueo: number) => Promise<void>;
};

export const useCajaStore = create<CajaState>((set) => ({
  arqueos: [],
  arqueoAbierto: null,
  isLoading: false,
  error: null,

  fetchMisArqueos: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await cajaApi.obtenerMisArqueos();
      set({ arqueos: data });
    } catch (error) {
      console.error("Error al cargar arqueos:", error);
      set({ error: "Error al cargar tus arqueos" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchArqueoAbierto: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await cajaApi.obtenerArqueoAbierto();
      set({ arqueoAbierto: data });
    } catch (error) {
      console.error("Error al cargar arqueo abierto:", error);
      set({ arqueoAbierto: null, error: "No tienes arqueo abierto" });
    } finally {
      set({ isLoading: false });
    }
  },

  crearArqueo: async (saldo_inicial) => {
    set({ isLoading: true, error: null });
    try {
      await cajaApi.crearArqueo({ saldo_inicial });
      await useCajaStore.getState().fetchArqueoAbierto();
    } catch (error) {
      console.error("Error al crear arqueo:", error);
      set({ error: "Error al crear arqueo" });
    } finally {
      set({ isLoading: false });
    }
  },

  cerrarArqueo: async (id_arqueo, ingresos, egresos, saldo_final) => {
    console.log(
      "Cerrar arqueo");
    set({ isLoading: true, error: null });
    try {
      await cajaApi.cerrarArqueo(id_arqueo, { ingresos, egresos, saldo_final });
      await useCajaStore.getState().fetchMisArqueos();
      console.log("Arqueo cerrado exitosamente");
    } catch (error) {
      console.error("Error al cerrar arqueo:", error);
      set({ error: "Error al cerrar arqueo" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodosArqueos: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await cajaApi.obtenerTodosLosArqueos();
      set({ arqueos: data });
    } catch (error) {
      console.error("Error al cargar todos los arqueos:", error);
      set({ error: "Error al cargar todos los arqueos" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodosAbiertos: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await cajaApi.obtenerTodosAbiertos();
      set({ arqueos: data });
    } catch (error) {
      console.error("Error al cargar arqueos abiertos:", error);
      set({ error: "Error al cargar arqueos abiertos" });
    } finally {
      set({ isLoading: false });
    }
  },

  actualizarArqueo: async (id_arqueo, saldo_inicial, ingresos, egresos) => {
    set({ isLoading: true, error: null });
    try {
      await cajaApi.actualizarArqueo(id_arqueo, {
        saldo_inicial,
        ingresos,
        egresos,
      });
      await useCajaStore.getState().fetchTodosArqueos();
    } catch (error) {
      console.error("Error al actualizar arqueo:", error);
      set({ error: "Error al actualizar arqueo" });
    } finally {
      set({ isLoading: false });
    }
  },

  eliminarArqueo: async (id_arqueo) => {
    set({ isLoading: true, error: null });
    try {
      await cajaApi.eliminarArqueo(id_arqueo);
      await useCajaStore.getState().fetchTodosArqueos();
    } catch (error) {
      console.error("Error al eliminar arqueo:", error);
      set({ error: "Error al eliminar arqueo" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
