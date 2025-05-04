import { apiClient } from "./client";
import {
  Movimiento,
  MovimientoCreate,
  MovimientoUpdate,
  MovimientoBalance,
} from "../types/movimiento";

// 1. Obtener todos los movimientos
export const obtenerMovimientos = async (): Promise<Movimiento[]> => {
  const response = await apiClient.get<{ movimientos: Movimiento[] }>(
    "/inventario/movimientos"
  );
  return response.data.movimientos;
};

// 2. Obtener un movimiento específico por ID
export const obtenerMovimientoPorId = async (
  id: number
): Promise<Movimiento> => {
  const response = await apiClient.get<Movimiento>(
    `/inventario/movimientos/${id}`
  );
  return response.data;
};

// 3. Obtener movimientos por producto
export const obtenerMovimientosPorProducto = async (
  idProducto: number
): Promise<Movimiento[]> => {
  const response = await apiClient.get<{ movimientos: Movimiento[] }>(
    `/inventario/movimientos/producto/${idProducto}`
  );
  return response.data.movimientos;
};

// 4. Obtener movimientos por tipo
export const obtenerMovimientosPorTipo = async (
  tipo: "Ingreso" | "Egreso"
): Promise<Movimiento[]> => {
  const response = await apiClient.get<{ movimientos: Movimiento[] }>(
    `/inventario/movimientos/tipo/${tipo}`
  );
  return response.data.movimientos;
};

// 5. Obtener movimientos por rango de fechas
export const obtenerMovimientosPorFechas = async (
  fechaInicio: string,
  fechaFin: string
): Promise<Movimiento[]> => {
  const response = await apiClient.get<{ movimientos: Movimiento[] }>(
    "/inventario/movimientos/fechas",
    { params: { fechaInicio, fechaFin } }
  );
  return response.data.movimientos;
};

// 6. Obtener balance de stock de un producto
export const obtenerBalanceProducto = async (
  idProducto: number
): Promise<MovimientoBalance> => {
  const response = await apiClient.get<MovimientoBalance>(
    `/inventario/movimientos/balance/${idProducto}`
  );
  return response.data;
};

// 7. Registrar nuevo movimiento
export const registrarMovimiento = async (
  nuevoMovimiento: MovimientoCreate
): Promise<Movimiento> => {
  const response = await apiClient.post<Movimiento>(
    "/inventario/movimientos",
    nuevoMovimiento
  );
  return response.data;
};

// 8. Actualizar movimiento
export const actualizarMovimiento = async (
  id: number,
  movimientoActualizado: MovimientoUpdate
): Promise<Movimiento> => {
  const response = await apiClient.put<Movimiento>(
    `/inventario/movimientos/${id}`,
    movimientoActualizado
  );
  return response.data;
};

// 9. Eliminar movimiento
export const eliminarMovimiento = async (id: number): Promise<void> => {
  await apiClient.delete(`/inventario/movimientos/${id}`);
};
