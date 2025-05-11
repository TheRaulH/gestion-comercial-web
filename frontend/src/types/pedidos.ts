// types/pedidos.ts

export type OrderStatus = "Pendiente" | "En cocina" | "Entregado" | "Cancelado";
export type PaymentMethod = "Efectivo" | "Tarjeta" | "QR";

export interface Pedido {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pedido: any;
  id_pedido: number;
  id_usuario: number;
  id_arqueo: number;
  fecha_pedido: string;
  total: number;
  forma_pago: PaymentMethod; // Añadido el campo forma_pago
  estado: OrderStatus;
}

export interface CrearPedidoDTO {
  id_arqueo: number;
  total: number;
  forma_pago: PaymentMethod; // Añadido el campo forma_pago
  estado?: OrderStatus;
}

export interface ActualizarEstadoDTO {
  estado: OrderStatus;
}

export interface ActualizarPedidoDTO {
  id_usuario?: number;
  id_arqueo?: number;
  fecha_pedido?: string;
  total?: number;
  forma_pago?: PaymentMethod; // Añadido el campo forma_pago
  estado?: OrderStatus;
}
