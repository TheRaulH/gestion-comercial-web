// src/components/modals/OrderDetailsModal.tsx 
import { useEffect } from "react";
import {
  Box, 
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useDetallePedidoStore } from "../../stores/detallePedidoStore"; // Adjust path if needed
import { useProductoStore } from "../../stores/productoStore"; // Adjust path if needed

 

interface Producto {
  // Assuming Product interface is needed here to find name
  id_producto: number;
  nombre: string;
  precio: number;
  // ... other product properties
}

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  open,
  onClose,
  orderId,
}) => {
  const { detalles, cargando, cargarDetallesPorPedidoId } =
    useDetallePedidoStore();
  // Assuming products are fetched globally or when needed elsewhere
  // If not, you might need fetchProductos here too, but let's assume they are available.
  const { productos } = useProductoStore();

  useEffect(() => {
    if (open && orderId) {
      cargarDetallesPorPedidoId(orderId);
    }
  }, [open, orderId, cargarDetallesPorPedidoId]);

  const getProductName = (idProducto: number) => {
    return (
      productos.find((p: Producto) => p.id_producto === idProducto)?.nombre ||
      "N/A"
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalles del Pedido</DialogTitle>
      <DialogContent>
        {cargando ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Unitario</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detalles.map((detalle) => (
                  <TableRow key={detalle.id_detalle}>
                    <TableCell>{getProductName(detalle.id_producto)}</TableCell>
                    <TableCell align="right">{detalle.cantidad}</TableCell>
                    <TableCell align="right">
                      ${detalle.precio_unitario}
                    </TableCell>
                    <TableCell align="right">
                      {(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsModal;
