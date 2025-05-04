// src/types/detallePedido.ts

export interface DetallePedido {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

export interface DetallePedidoInput {
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

export interface DetallePedidoUpdate {
  cantidad?: number;
  precio_unitario?: number;
}
