import { Product } from "./product";

// types/order.ts
export type OrderStatus = 'Pendiente' | 'En cocina' | 'Entregado' | 'Cancelado';

export interface Order {
  id_pedido: number;
  id_usuario: number;
  id_arqueo: number;
  fecha_pedido: string;
  total: number;
  estado: OrderStatus;
}

export interface OrderDetail {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  producto?: Product; // Opcional para joins
}