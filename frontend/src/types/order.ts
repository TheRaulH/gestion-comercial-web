import { Producto } from "./product";

// types/order.ts
export type OrderStatus = "Pendiente" | "En cocina" | "Entregado" | "Cancelado";
export type PaymentMethod = "Efectivo" | "Tarjeta" | "QR";

export interface Order {
  id_pedido: number;
  id_usuario: number;
  id_arqueo: number;
  fecha_pedido: string;
  total: number;
  forma_pago: PaymentMethod; // Nuevo campo para la forma de pago
  estado: OrderStatus;
}

export interface OrderDetail {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  producto?: Producto; // Opcional para joins
}
