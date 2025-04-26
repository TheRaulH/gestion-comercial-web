// types/product.ts
export interface ProductType {
  id_tipo_producto: number;
  nombre: string;
}

export interface Product {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock_actual: number;
  id_tipo_producto: number;
  activo: boolean;
}

export interface InventoryMovement {
  id_movimiento: number;
  id_producto: number;
  tipo_movimiento: 'Ingreso' | 'Egreso';
  cantidad: number;
  fecha: string;
  observaciones: string;
}