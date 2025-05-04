import { create } from "zustand";
import {
  Movimiento,
  MovimientoCreate,
  MovimientoUpdate,
  MovimientoBalance,
  TipoMovimiento,
} from "../types/movimiento";
import {
  obtenerMovimientos,
  obtenerMovimientoPorId,
  obtenerMovimientosPorProducto,
  obtenerMovimientosPorTipo,
  obtenerMovimientosPorFechas,
  obtenerBalanceProducto,
  registrarMovimiento,
  actualizarMovimiento as apiActualizarMovimiento,
  eliminarMovimiento as apiEliminarMovimiento,
} from "../api/movimientoApi";

type MovimientoStore = {
  movimientos: Movimiento[];
  movimientoSeleccionado: Movimiento | null;
  balanceStock: MovimientoBalance | null;
  isLoading: boolean;
  error: string | null;
  fetchMovimientos: () => Promise<void>;
  fetchMovimientoPorId: (id: number) => Promise<void>;
  fetchMovimientosPorProducto: (idProducto: number) => Promise<void>;
  fetchMovimientosPorTipo: (tipo: TipoMovimiento) => Promise<void>;
  fetchMovimientosPorFechas: (
    fechaInicio: string,
    fechaFin: string
  ) => Promise<void>;
  fetchBalanceStock: (idProducto: number) => Promise<void>;
  crearMovimiento: (data: MovimientoCreate) => Promise<void>;
  actualizarMovimiento: (id: number, data: MovimientoUpdate) => Promise<void>;
  eliminarMovimiento: (id: number) => Promise<void>;
};

export const useMovimientoStore = create<MovimientoStore>((set) => ({
  movimientos: [],
  movimientoSeleccionado: null,
  balanceStock: null,
  isLoading: false,
  error: null,

  fetchMovimientos: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerMovimientos();

      set({ movimientos: data, isLoading: false });
      console.log("Movimientos obtenidos:", data);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
      set({ error: "Error al obtener movimientos", isLoading: false });
    }
  },

  fetchMovimientoPorId: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerMovimientoPorId(id);
      set({ movimientoSeleccionado: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener movimiento por ID:", error);
      set({ error: "Error al obtener movimiento por ID", isLoading: false });
    }
  },

  fetchMovimientosPorProducto: async (idProducto: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerMovimientosPorProducto(idProducto);
      set({ movimientos: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener movimientos por producto:", error);
      set({
        error: "Error al obtener movimientos por producto",
        isLoading: false,
      });
    }
  },

  fetchMovimientosPorTipo: async (tipo: TipoMovimiento) => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerMovimientosPorTipo(tipo);
      set({ movimientos: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener movimientos por tipo:", error);
      set({ error: "Error al obtener movimientos por tipo", isLoading: false });
    }
  },

  fetchMovimientosPorFechas: async (fechaInicio: string, fechaFin: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerMovimientosPorFechas(fechaInicio, fechaFin);
      set({ movimientos: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener movimientos por fechas:", error);
      set({
        error: "Error al obtener movimientos por fechas",
        isLoading: false,
      });
    }
  },

  fetchBalanceStock: async (idProducto: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerBalanceProducto(idProducto);
      set({ balanceStock: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener balance de stock:", error);
      set({ error: "Error al obtener balance de stock", isLoading: false });
    }
  },

  crearMovimiento: async (data: MovimientoCreate) => {
    set({ isLoading: true, error: null });
    try {
      await registrarMovimiento(data);
      await useMovimientoStore.getState().fetchMovimientos();
    } catch (error) {
      console.error("Error al crear movimiento:", error);
      set({ error: "Error al crear movimiento", isLoading: false });
    }
  },

  actualizarMovimiento: async (id: number, data: MovimientoUpdate) => {
    set({ isLoading: true, error: null });
    try {
      await apiActualizarMovimiento(id, data);
      await useMovimientoStore.getState().fetchMovimientos();
    } catch (error) {
      console.error("Error al actualizar movimiento:", error);
      set({ error: "Error al actualizar movimiento", isLoading: false });
    }
  },

  eliminarMovimiento: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiEliminarMovimiento(id);
      await useMovimientoStore.getState().fetchMovimientos();
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      set({ error: "Error al eliminar movimiento", isLoading: false });
    }
  },
}));
