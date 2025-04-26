// src/api/cajaApi.ts
import { apiClient } from "./client";

export type Arqueo = {
  id_arqueo: number;
  id_usuario: number;
  saldo_inicial: string; // en backend viene como string
  ingresos: string;
  egresos: string;
  saldo_final: string;
  fecha_inicio: string;
  fecha_fin: string | null;
};

export const cajaApi = {
  // Usuario normal
  crearArqueo: (data: { saldo_inicial: number }) =>
    apiClient.post("/arqueos", data),
  obtenerMisArqueos: () => apiClient.get<Arqueo[]>("/arqueos/usuario"),
  obtenerArqueoAbierto: () => apiClient.get<Arqueo>("/arqueos/abierto"),
  obtenerArqueoPorId: (id: number) => apiClient.get<Arqueo>(`/arqueos/${id}`),
  cerrarArqueo: (
    id: number,
    data: { ingresos: number; egresos: number; saldo_final: number }
  ) => apiClient.put(`/arqueos/${id}/cerrar`, data),

  // Admin
  obtenerTodosLosArqueos: () => apiClient.get<Arqueo[]>("/arqueos"),
  obtenerTodosAbiertos: () =>
    apiClient.get<Arqueo[]>("/arqueos/admin/abiertos"),
  actualizarArqueo: (
    id: number,
    data: { saldo_inicial: number; ingresos: number; egresos: number }
  ) => apiClient.put(`/arqueos/${id}`, data),
  eliminarArqueo: (id: number) => apiClient.delete(`/arqueos/${id}`),
};
