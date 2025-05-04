// src/stores/productoStore.ts

import { create } from "zustand";
import {
  TipoProducto,
  Producto,
  ProductoCreateUpdate, 
} from "../types/product";

import {
  obtenerTiposProducto, 
  crearTipoProducto,
  actualizarTipoProducto,
  eliminarTipoProducto,
  obtenerProductos,
  obtenerProductosActivos,  
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  actualizarStockProducto,
  eliminarProducto,
  desactivarProducto,
} from "../api/productoApi";

type ProductoStore = {
  tiposProducto: TipoProducto[];
  productos: Producto[];
  isLoading: boolean;
  error: string | null;

  // Fetch
  fetchTiposProducto: () => Promise<void>;
  fetchProductos: () => Promise<void>;
  fetchProductosActivos: () => Promise<void>;
  fetchProductoPorId: (id: number) => Promise<Producto | null>;

  // TiposProducto Mutations
  createTipoProducto: (nombre: string, token: string) => Promise<void>;
  updateTipoProducto: (
    id: number,
    nombre: string,
    token: string
  ) => Promise<void>;
  deleteTipoProducto: (id: number, token: string) => Promise<void>;

  // Productos Mutations
  createProducto: (
    producto: ProductoCreateUpdate,
    token: string
  ) => Promise<void>;
  updateProducto: (
    id: number,
    producto: ProductoCreateUpdate,
    token: string
  ) => Promise<void>;
  updateStockProducto: (
    id: number,
    cantidad: number,
    token: string
  ) => Promise<void>;
  deleteProducto: (id: number, token: string) => Promise<void>;
  deactivateProducto: (id: number, token: string) => Promise<void>;
};

export const useProductoStore = create<ProductoStore>((set, get) => ({
  tiposProducto: [],
  productos: [],
  isLoading: false,
  error: null,

  fetchTiposProducto: async () => {
    set({ isLoading: true });
    try {
      const tipos = await obtenerTiposProducto();
      set({ tiposProducto: tipos, isLoading: false });
    } catch (error) {
      console.error("Error al cargar tipos de producto:", error);
      set({ error: "Error al obtener tipos de producto", isLoading: false });
    }
  },

  fetchProductos: async () => {
    set({ isLoading: true });
    try {
      const productos = await obtenerProductos();
      set({ productos, isLoading: false });
    } catch (error) {
      console.error("Error al cargar productos:", error);
      set({ error: "Error al obtener productos", isLoading: false });
    }
  },

  fetchProductosActivos: async () => {
    set({ isLoading: true });
    try {
      const productosActivos = await obtenerProductosActivos();
      set({ productos: productosActivos, isLoading: false });
    } catch (error) {
      console.error("Error al cargar productos activos:", error);
      set({ error: "Error al obtener productos activos", isLoading: false });
    }
  },

  fetchProductoPorId: async (id: number) => {
    try {
      const producto = await obtenerProductoPorId(id);
      return producto;
    } catch (error) {
      console.error("Error al cargar producto por ID:", error);
      set({ error: "Error al obtener el producto", isLoading: false });
      return null;
    }
  },

  createTipoProducto: async (nombre, token) => {
    try {
      await crearTipoProducto(nombre, token);
      await get().fetchTiposProducto();
    } catch (error) {
      console.error("Error al crear tipo producto:", error);
      set({ error: "Error al crear tipo de producto" });
    }
  },

  updateTipoProducto: async (id, nombre, token) => {
    try {
      await actualizarTipoProducto(id, nombre, token);
      await get().fetchTiposProducto();
    } catch (error) {
      console.error("Error al actualizar tipo producto:", error);
      set({ error: "Error al actualizar tipo de producto" });
    }
  },

  deleteTipoProducto: async (id, token) => {
    try {
      await eliminarTipoProducto(id, token);
      await get().fetchTiposProducto();
    } catch (error) {
      console.error("Error al eliminar tipo producto:", error);
      set({ error: "Error al eliminar tipo de producto" });
    }
  },

  createProducto: async (producto, token) => {
    try {
      await crearProducto(producto, token);
      await get().fetchProductos();
    } catch (error) {
      console.error("Error al crear producto:", error);
      set({ error: "Error al crear producto" });
    }
  },

  updateProducto: async (id, producto, token) => {
    try {
      await actualizarProducto(id, producto, token);
      await get().fetchProductos();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      set({ error: "Error al actualizar producto" });
    }
  },

  updateStockProducto: async (id, cantidad, token) => {
    try {
      await actualizarStockProducto(id, { cantidad }, token);
      await get().fetchProductos();
    } catch (error) {
      console.error("Error al actualizar stock del producto:", error);
      set({ error: "Error al actualizar stock del producto" });
    }
  },

  deleteProducto: async (id, token) => {
    try {
      await eliminarProducto(id, token);
      await get().fetchProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      set({ error: "Error al eliminar producto" });
    }
  },

  deactivateProducto: async (id, token) => {
    try {
      await desactivarProducto(id, token);
      await get().fetchProductos();
    } catch (error) {
      console.error("Error al desactivar producto:", error);
      set({ error: "Error al desactivar producto" });
    }
  },
}));
