// src/types/movimientosCaja.ts

export type MovimientoCaja = {
  id_movimiento: number;
  id_arqueo: number;
  tipo: "Ingreso" | "Egreso";
  monto: number;
  descripcion: string;
  fecha: string; // ISO string
};

export type MovimientoCajaCreate = Omit<MovimientoCaja, "id_movimiento">;

export type MovimientoCajaUpdate = Partial<
  Omit<MovimientoCaja, "id_movimiento" | "id_arqueo" | "tipo" | "fecha">
>;

//tipo de movimiento
export type TipoMovimientoCaja = "Ingreso" | "Egreso";
