import { create } from "zustand";
import {
  Pedido,
  CrearPedidoDTO,
  ActualizarEstadoDTO,
  ActualizarPedidoDTO,
  PaymentMethod,
} from "../types/pedidos";
import {
  crearPedido,
  obtenerTodosPedidos,
  obtenerMisPedidos,
  obtenerPedidoPorId,
  obtenerPedidosPorArqueo,
  obtenerPedidosPorEstado,
  actualizarEstadoPedido,
  actualizarPedido,
  cancelarPedido,
} from "../api/pedidosApi";

type PedidoStore = {
  pedidos: Pedido[];
  pedidoSeleccionado: Pedido | null;
  isLoading: boolean;
  error: string | null;
  formaPagoSeleccionada: PaymentMethod | null; // Nuevo estado para la forma de pago
  setFormaPagoSeleccionada: (formaPago: PaymentMethod | null) => void;

  fetchTodosPedidos: () => Promise<void>;
  fetchMisPedidos: () => Promise<void>;
  fetchPedidoPorId: (id: number) => Promise<void>;
  fetchPedidosPorArqueo: (idArqueo: number) => Promise<void>;
  fetchPedidosPorEstado: (estado: string) => Promise<void>;
  crearNuevoPedido: (
    nuevo: Omit<CrearPedidoDTO, "forma_pago"> & { forma_pago: PaymentMethod }
  ) => Promise<Pedido>; // Actualiza la firma
  cambiarEstadoPedido: (
    id: number,
    estado: ActualizarEstadoDTO
  ) => Promise<void>;
  cancelarUnPedido: (id: number) => Promise<void>;
  actualizarPedidoCompleto: (
    id: number,
    data: Omit<ActualizarPedidoDTO, "forma_pago"> & {
      forma_pago?: PaymentMethod;
    } // Actualiza la firma
  ) => Promise<void>;
};

export const usePedidoStore = create<PedidoStore>((set) => ({
  pedidos: [],
  pedidoSeleccionado: null,
  isLoading: false,
  error: null,
  formaPagoSeleccionada: null, // Inicializa la forma de pago seleccionada
  setFormaPagoSeleccionada: (formaPago) =>
    set({ formaPagoSeleccionada: formaPago }),

  fetchTodosPedidos: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerTodosPedidos();
      set({ pedidos: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener todos los pedidos:", error);
      set({ error: "Error al obtener pedidos", isLoading: false });
    }
  },

  fetchMisPedidos: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerMisPedidos();
      set({ pedidos: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener mis pedidos:", error);
      set({ error: "Error al obtener mis pedidos", isLoading: false });
    }
  },

  fetchPedidoPorId: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerPedidoPorId(id);
      set({ pedidoSeleccionado: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener pedido:", error);
      set({ error: "Error al obtener pedido", isLoading: false });
    }
  },

  fetchPedidosPorArqueo: async (idArqueo: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerPedidosPorArqueo(idArqueo);
      set({ pedidos: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener pedidos por arqueo:", error);
      set({ error: "Error al obtener pedidos por arqueo", isLoading: false });
    }
  },

  fetchPedidosPorEstado: async (estado: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await obtenerPedidosPorEstado(estado);
      set({ pedidos: data, isLoading: false });
    } catch (error) {
      console.error("Error al obtener pedidos por estado:", error);
      set({ error: "Error al obtener pedidos por estado", isLoading: false });
    }
  },

  crearNuevoPedido: async (nuevo) => {
    set({ isLoading: true, error: null });
    try {
      console.log("datos Nuevo pedido en store:", nuevo);
      const pedidoCreado = await crearPedido(nuevo);
      await usePedidoStore.getState().fetchMisPedidos();
      return pedidoCreado; // 👈 RETORNAR EL PEDIDO
    } catch (error) {
      console.error("Error al crear pedido:", error);
      set({ error: "Error al crear pedido", isLoading: false });
      throw error; // 👈 También puedes relanzar el error para manejarlo externamente si hace falta
    }
  },

  cambiarEstadoPedido: async (id, estado) => {
    set({ isLoading: true, error: null });
    try {
      await actualizarEstadoPedido(id, estado);
      await usePedidoStore.getState().fetchTodosPedidos();
    } catch (error) {
      console.error("Error al cambiar estado del pedido:", error);
      set({ error: "Error al cambiar estado del pedido", isLoading: false });
    }
  },

  cancelarUnPedido: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await cancelarPedido(id);
      await usePedidoStore.getState().fetchMisPedidos();
    } catch (error) {
      console.error("Error al cancelar el pedido:", error);
      set({ error: "Error al cancelar el pedido", isLoading: false });
    }
  },

  actualizarPedidoCompleto: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await actualizarPedido(id, data);
      await usePedidoStore.getState().fetchTodosPedidos();
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      set({ error: "Error al actualizar pedido", isLoading: false });
    }
  },
}));
