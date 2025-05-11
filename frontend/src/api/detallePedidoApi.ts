// src/api/detallePedidoApi.ts

import { apiClient } from "./client";
import {
  DetallePedido,
  DetallePedidoInput,
  DetallePedidoUpdate,
} from "../types/detallePedido";

export const crearDetallePedido = async (
  data: DetallePedidoInput
): Promise<DetallePedido> => {
  console.log("datos Nuevo detalle pedido:", data);
  const response = await apiClient.post("/detalle-pedidos", data);
  return response.data;
};

export const obtenerDetallesPedidos = async (): Promise<DetallePedido[]> => {
  const response = await apiClient.get("/detalle-pedidos");
  return response.data;
};

export const obtenerDetallePedidoPorId = async (
  id: number
): Promise<DetallePedido> => {
  const response = await apiClient.get(`/detalle-pedidos/${id}`);
  return response.data;
};

export const obtenerDetallesPorPedidoId = async (
  id_pedido: number
): Promise<DetallePedido[]> => {
  const response = await apiClient.get(`/detalle-pedidos/pedido/${id_pedido}`);
  return response.data;
};

export const actualizarDetallePedido = async (
  id: number,
  data: DetallePedidoUpdate
): Promise<DetallePedido> => {
  const response = await apiClient.put(`/detalle-pedidos/${id}`, data);
  return response.data;
};

export const eliminarDetallePedido = async (id: number): Promise<void> => {
  await apiClient.delete(`/detalle-pedidos/${id}`);
};
