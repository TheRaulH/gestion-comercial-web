
export interface Pedido {
  id: number;
  id_usuario: number;
  id_arqueo: number;
  fecha_pedido: string;
  total: number;
  estado: "Pendiente" | "En cocina" | "Listo" | "Entregado" | "Cancelado";
}

export interface CrearPedidoDTO {
  id_arqueo: number;
  total: number;
  estado: "Pendiente" | "En cocina" | "Listo" | "Entregado" | "Cancelado";
}

export interface ActualizarEstadoDTO {
  estado: "Pendiente" | "En cocina" | "Listo" | "Entregado" | "Cancelado";
}

export interface ActualizarPedidoDTO {
  id_usuario: number;
  id_arqueo: number;
  fecha_pedido: string;
  total: number;
  estado: "Pendiente" | "En cocina" | "Listo" | "Entregado" | "Cancelado";
}
