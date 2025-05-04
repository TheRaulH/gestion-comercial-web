// src/api/productoApi.ts

import { apiClient } from "./client";
import {
  TipoProducto,
  Producto,
  ProductoCreateUpdate,
  ProductoStockUpdate,
} from "../types/product";

// Funciones para Tipos de Producto
export const obtenerTiposProducto = async () => {
  const response = await apiClient.get<TipoProducto[]>("/tipos-producto");
  return response.data;
};

export const obtenerTipoProductoPorId = async (id: number) => {
  const response = await apiClient.get<TipoProducto>(`/tipos-producto/${id}`);
  return response.data;
};

export const crearTipoProducto = async (nombre: string, token: string) => {
  const response = await apiClient.post<TipoProducto>(
    "/tipos-producto",
    { nombre },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const actualizarTipoProducto = async (
  id: number,
  nombre: string,
  token: string
) => {
  const response = await apiClient.put<TipoProducto>(
    `/tipos-producto/${id}`,
    { nombre },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const eliminarTipoProducto = async (id: number, token: string) => {
  await apiClient.delete(`/tipos-producto/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Funciones para Productos
export const obtenerProductos = async () => {
  const response = await apiClient.get<Producto[]>("/productos");
  return response.data;
};

export const obtenerProductosActivos = async () => {
  const response = await apiClient.get<Producto[]>("/productos/activos");
  return response.data;
};

export const buscarProductos = async (query: string) => {
  const response = await apiClient.get<Producto[]>(
    `/productos/buscar?q=${query}`
  );
  return response.data;
};

export const obtenerProductosPorTipo = async (tipoId: number) => {
  const response = await apiClient.get<Producto[]>(`/productos/tipo/${tipoId}`);
  return response.data;
};

export const obtenerProductoPorId = async (id: number) => {
  const response = await apiClient.get<Producto>(`/productos/${id}`);
  return response.data;
};

export const crearProducto = async (
  producto: ProductoCreateUpdate,
  token: string
) => {
  const response = await apiClient.post<Producto>("/productos", producto, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const actualizarProducto = async (
  id: number,
  producto: ProductoCreateUpdate,
  token: string
) => {
  const response = await apiClient.put<Producto>(`/productos/${id}`, producto, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const actualizarStockProducto = async (
  id: number,
  stockUpdate: ProductoStockUpdate,
  token: string
) => {
  const response = await apiClient.put<Producto>(
    `/productos/${id}/stock`,
    stockUpdate,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const eliminarProducto = async (id: number, token: string) => {
  await apiClient.delete(`/productos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const desactivarProducto = async (id: number, token: string) => {
  await apiClient.put(
    `/productos/${id}/desactivar`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
