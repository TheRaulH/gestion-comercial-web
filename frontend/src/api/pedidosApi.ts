// src/api/pedidosApi.ts

import { apiClient } from "./client";
import {
  Pedido,
  CrearPedidoDTO,
  ActualizarEstadoDTO,
  ActualizarPedidoDTO,
} from "../types/pedidos";

// 1. Crear un nuevo pedido
export const crearPedido = async (
  nuevoPedido: CrearPedidoDTO
): Promise<Pedido> => {
  console.log("datos Nuevo pedido:", nuevoPedido);
  const response = await apiClient.post<Pedido>("/pedidos", nuevoPedido);
  return response.data;
};

// 2. Obtener todos los pedidos (admin)
export const obtenerTodosPedidos = async (): Promise<Pedido[]> => {
  const response = await apiClient.get<Pedido[]>("/pedidos");
  return response.data;
};

// 3. Obtener mis pedidos
export const obtenerMisPedidos = async (): Promise<Pedido[]> => {
  const response = await apiClient.get<Pedido[]>("/pedidos/mis-pedidos");
  return response.data;
};

// 4. Obtener un pedido específico
export const obtenerPedidoPorId = async (id: number): Promise<Pedido> => {
  const response = await apiClient.get<Pedido>(`/pedidos/${id}`);
  return response.data;
};

// 5. Actualizar estado de pedido (admin)
export const actualizarEstadoPedido = async (
  id: number,
  data: ActualizarEstadoDTO
): Promise<void> => {
  await apiClient.put(`/pedidos/${id}/estado`, data);
};

// 6. Cancelar un pedido
export const cancelarPedido = async (id: number): Promise<void> => {
  await apiClient.put(`/pedidos/${id}/cancelar`);
};

// 7. Obtener pedidos por arqueo de caja (admin)
export const obtenerPedidosPorArqueo = async (
  idArqueo: number
): Promise<Pedido[]> => {
  const response = await apiClient.get<Pedido[]>(`/pedidos/arqueo/${idArqueo}`);
  return response.data;
};

// 8. Obtener pedidos por estado (admin)
export const obtenerPedidosPorEstado = async (
  estado: string
): Promise<Pedido[]> => {
  const response = await apiClient.get<Pedido[]>(`/pedidos/estado/${estado}`);
  return response.data;
};

// 9. Actualizar pedido completo (solo admin)
export const actualizarPedido = async (
  id: number,
  data: ActualizarPedidoDTO
): Promise<void> => {
  await apiClient.put(`/pedidos/${id}`, data);
};
