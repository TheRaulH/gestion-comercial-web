// src/api/movimientosCajaApi.ts

import { apiClient } from "./client";
import {
  MovimientoCaja,
  MovimientoCajaCreate,
  MovimientoCajaUpdate,
} from "../types/movimientoCaja";

export const movimientosCajaApi = {
  create: (data: MovimientoCajaCreate) =>
    apiClient.post<MovimientoCaja>("/movimientos-caja", data),

  getAll: () => apiClient.get<MovimientoCaja[]>("/movimientos-caja"),

  getById: (id: number) =>
    apiClient.get<MovimientoCaja>(`/movimientos-caja/${id}`),

  getByArqueoId: (id_arqueo: number) =>
    apiClient.get<MovimientoCaja[]>(`/movimientos-caja/arqueo/${id_arqueo}`),

  update: (id: number, data: MovimientoCajaUpdate) =>
    apiClient.put<MovimientoCaja>(`/movimientos-caja/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<{ message: string }>(`/movimientos-caja/${id}`),
};
