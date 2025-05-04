/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/movimientosCajaStore.ts

import { create } from "zustand";
import {
  MovimientoCaja,
  MovimientoCajaCreate,
  MovimientoCajaUpdate,
} from "../types/movimientoCaja";
import { movimientosCajaApi } from "../api/movimientoCajaApi";

type MovimientosCajaState = {
  movimientos: MovimientoCaja[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchByArqueoId: (id_arqueo: number) => Promise<void>;
  createMovimiento: (data: MovimientoCajaCreate) => Promise<void>;
  updateMovimiento: (id: number, data: MovimientoCajaUpdate) => Promise<void>;
  deleteMovimiento: (id: number) => Promise<void>;
};

export const useMovimientosCajaStore = create<MovimientosCajaState>((set) => ({
  movimientos: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const response = await movimientosCajaApi.getAll();
      set({ movimientos: response.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchByArqueoId: async (id_arqueo) => {
    set({ loading: true, error: null });
    try {
      const response = await movimientosCajaApi.getByArqueoId(id_arqueo);
      set({ movimientos: response.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createMovimiento: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await movimientosCajaApi.create(data);
      set((state) => ({
        movimientos: [...state.movimientos, response.data],
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateMovimiento: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await movimientosCajaApi.update(id, data);
      set((state) => ({
        movimientos: state.movimientos.map((mov) =>
          mov.id_movimiento === id ? response.data : mov
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deleteMovimiento: async (id) => {
    set({ loading: true, error: null });
    try {
      await movimientosCajaApi.delete(id);
      set((state) => ({
        movimientos: state.movimientos.filter(
          (mov) => mov.id_movimiento !== id
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
