/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/detallePedidoStore.ts

import { create } from "zustand";
import {
  DetallePedido,
  DetallePedidoInput,
  DetallePedidoUpdate,
} from "../types/detallePedido";
import {
  crearDetallePedido,
  obtenerDetallesPedidos,
  obtenerDetallePedidoPorId,
  obtenerDetallesPorPedidoId,
  actualizarDetallePedido,
  eliminarDetallePedido,
} from "../api/detallePedidoApi";

interface DetallePedidoState {
  detalles: DetallePedido[];
  detalleActual: DetallePedido | null;
  cargando: boolean;
  error: string | null;
  cargarDetalles: () => Promise<void>;
  cargarDetallePorId: (id: number) => Promise<void>;
  cargarDetallesPorPedidoId: (id_pedido: number) => Promise<void>;
  crearDetalle: (data: DetallePedidoInput) => Promise<void>;
  actualizarDetalle: (id: number, data: DetallePedidoUpdate) => Promise<void>;
  eliminarDetalle: (id: number) => Promise<void>;
}

export const useDetallePedidoStore = create<DetallePedidoState>((set) => ({
  detalles: [],
  detalleActual: null,
  cargando: false,
  error: null,

  cargarDetalles: async () => {
    set({ cargando: true, error: null });
    try {
      const data = await obtenerDetallesPedidos();
      set({ detalles: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ cargando: false });
    }
  },

  cargarDetallePorId: async (id: number) => {
    set({ cargando: true, error: null });
    try {
      const data = await obtenerDetallePedidoPorId(id);
      set({ detalleActual: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ cargando: false });
    }
  },

  cargarDetallesPorPedidoId: async (id_pedido: number) => {
    set({ cargando: true, error: null });
    try {
      const data = await obtenerDetallesPorPedidoId(id_pedido);
      set({ detalles: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ cargando: false });
    }
  },

  crearDetalle: async (data: DetallePedidoInput) => {
    set({ cargando: true, error: null });
    try {
      const nuevoDetalle = await crearDetallePedido(data);
      set((state) => ({ detalles: [...state.detalles, nuevoDetalle] }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ cargando: false });
    }
  },

  actualizarDetalle: async (id: number, data: DetallePedidoUpdate) => {
    set({ cargando: true, error: null });
    try {
      const detalleActualizado = await actualizarDetallePedido(id, data);
      set((state) => ({
        detalles: state.detalles.map((detalle) =>
          detalle.id_detalle === id ? detalleActualizado : detalle
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ cargando: false });
    }
  },

  eliminarDetalle: async (id: number) => {
    set({ cargando: true, error: null });
    try {
      await eliminarDetallePedido(id);
      set((state) => ({
        detalles: state.detalles.filter((detalle) => detalle.id_detalle !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ cargando: false });
    }
  },
}));
