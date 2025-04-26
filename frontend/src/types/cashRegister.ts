// types/cashRegister.ts
export interface CashRegister {
  id_arqueo: number;
  id_usuario: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  saldo_inicial: number;
  ingresos: number;
  egresos: number;
  saldo_final: number;
}

export interface CashMovement {
  id_movimiento: number;
  id_arqueo: number;
  tipo: 'Ingreso' | 'Egreso';
  monto: number;
  descripcion: string;
  fecha: string;
}