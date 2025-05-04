// src/types/movimiento.ts

export type TipoMovimiento = "Ingreso" | "Egreso";

export interface Movimiento {
  id: number;
  id_producto: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  fecha: string; // ISO 8601
  observaciones: string;
}

export interface MovimientoCreate {
  id_producto: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  observaciones: string;
}

export interface MovimientoUpdate extends MovimientoCreate {
  fecha: string; // ISO 8601
}

export interface MovimientoBalance {
  id_producto: number;
  stock: number;
}
