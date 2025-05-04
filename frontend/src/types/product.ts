// src/types/product.ts

export type TipoProducto = {
  id_tipo_producto: number;
  nombre: string;
};

export type Producto = {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock_actual: number;
  id_tipo_producto: number;
  activo: boolean;
};

export type ProductoStockUpdate = {
  cantidad: number;
};

export type ProductoCreateUpdate = {
  nombre: string;
  descripcion: string;
  precio: number;
  stock_actual: number;
  id_tipo_producto: number;
  activo: boolean;
};
