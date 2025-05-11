// src/components/modals/CreateOrderModal.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { 
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
  Autocomplete,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { AddShoppingCart as AddDetailIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useProductoStore } from "../../stores/productoStore"; // Adjust path if needed
import { useCajaStore } from "../../stores/cajaStore"; // Adjust path if needed
import { PaymentMethod } from "../../types/pedidos"; // Adjust path if needed

interface DetallePedido {
  // Temporarily used client-side
  id_detalle: number;
  id_pedido: number; // Will be filled on backend
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

interface Producto { // Assuming Product interface is needed here
    id_producto: number;
    nombre: string;
    precio: number;
    // ... other product properties
}

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (orderData: any, details: Omit<DetallePedido, 'id_detalle' | 'id_pedido'>[]) => Promise<void>;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const { productos, fetchProductos } = useProductoStore();
  const { arqueoAbierto } = useCajaStore();
  const [orderData, setOrderData] = useState({
    id_arqueo: arqueoAbierto?.id_arqueo || 0,
    estado: "Pendiente",
    forma_pago: "Efectivo" as PaymentMethod,
  });
  const [details, setDetails] = useState<DetallePedido[]>([]);
  const [currentDetail, setCurrentDetail] = useState<{
    id_producto: number | null;
    cantidad: number;
    precio_unitario: number;
  }>({
    id_producto: null,
    cantidad: 1,
    precio_unitario: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when opening the modal
  useEffect(() => {
    if (open) {
      setOrderData({
        id_arqueo: arqueoAbierto?.id_arqueo || 0,
        estado: "Pendiente",
        forma_pago: "Efectivo",
      });
      setDetails([]);
      setCurrentDetail({
        id_producto: null,
        cantidad: 1,
        precio_unitario: 0,
      });
      setIsSubmitting(false);
      // Cargar productos when the modal opens if not already loaded
      if (productos.length === 0) {
        fetchProductos();
      }
    }
  }, [open, arqueoAbierto?.id_arqueo, productos.length, fetchProductos]);

  const handleAddDetail = () => {
    if (currentDetail.id_producto !== null && currentDetail.cantidad > 0) {
      const product = productos.find(
        (p: Producto) => p.id_producto === currentDetail.id_producto
      );

      if (product) {
        const existingDetailIndex = details.findIndex(
          (d) => d.id_producto === currentDetail.id_producto
        );

        if (existingDetailIndex > -1) {
          const updatedDetails = [...details];
          updatedDetails[existingDetailIndex].cantidad += currentDetail.cantidad;
          setDetails(updatedDetails);
        } else {
          const newDetail: DetallePedido = {
            id_detalle: Date.now(), // Temporary client-side ID
            id_pedido: 0, // Will be filled on backend
            id_producto: currentDetail.id_producto,
            cantidad: currentDetail.cantidad,
            precio_unitario: product.precio,
          };
          setDetails([...details, newDetail]);
        }

        setCurrentDetail({
          id_producto: null,
          cantidad: 1,
          precio_unitario: 0,
        });
      }
    }
  };

  const handleRemoveDetail = (id_detalleToRemove: number) => {
    setDetails(
      details.filter((detail) => detail.id_detalle !== id_detalleToRemove)
    );
  };

  const handleSubmit = async () => {
    if (details.length === 0) return;

    setIsSubmitting(true);
    try {
      const total = details.reduce(
        (sum, detail) => sum + detail.cantidad * detail.precio_unitario,
        0
      );

      // Asegúrate que los datos sean numéricos
      const detailsForBackend = details.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ id_detalle, id_pedido, ...rest }) => ({
          ...rest,
          cantidad: Number(rest.cantidad),
          precio_unitario: Number(rest.precio_unitario),
        })
      );
      console.log("Enviando detalles:", detailsForBackend);


      await onCreate({ ...orderData, total }, detailsForBackend);
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = details.reduce(
    (sum, detail) => sum + detail.cantidad * detail.precio_unitario,
    0
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isSubmitting}
      PaperProps={{ sx: { pointerEvents: isSubmitting ? "none" : "auto" } }}
    >
      <DialogTitle>Crear Nuevo Pedido</DialogTitle>
      <DialogContent dividers>
        
        {/* Use dividers for better visual separation */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Información del Pedido
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="ID Arqueo"
                  value={orderData.id_arqueo}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={orderData.estado}
                    label="Estado"
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        estado: e.target.value as any,
                      })
                    }
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="En cocina">En cocina</MenuItem>
                    {/* Add other relevant statuses if creation flow allows */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                
                {/* Forma de Pago row */}
                <FormControl component="fieldset">
                  <FormLabel component="legend">Forma de Pago</FormLabel>
                  <RadioGroup
                    row
                    value={orderData.forma_pago}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        forma_pago: e.target.value as PaymentMethod,
                      })
                    }
                  >
                    <FormControlLabel
                      value="Efectivo"
                      control={<Radio />}
                      label="Efectivo"
                    />
                    <FormControlLabel
                      value="Tarjeta"
                      control={<Radio />}
                      label="Tarjeta"
                    />
                    <FormControlLabel
                      value="QR"
                      control={<Radio />}
                      label="QR"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Detalles del Pedido
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <Autocomplete
                  fullWidth
                  options={productos as Producto[]} // Cast for better type safety if productos is any[]
                  getOptionLabel={(option) => option.nombre}
                  isOptionEqualToValue={(option, value) =>
                    option.id_producto === value.id_producto
                  }
                  value={
                    productos.find(
                      (p: Producto) =>
                        p.id_producto === currentDetail.id_producto
                    ) || null
                  }
                  onChange={(_event, newValue: Producto | null) => {
                    setCurrentDetail({
                      ...currentDetail,
                      id_producto: newValue
                        ? Number(newValue.id_producto)
                        : null,
                      precio_unitario: newValue ? Number(newValue.precio) : 0,
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Producto" />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Cantidad"
                  type="number"
                  value={currentDetail.cantidad}
                  onChange={(e) =>
                    setCurrentDetail({
                      ...currentDetail,
                      cantidad: Math.max(1, Number(e.target.value)),
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField
                  fullWidth
                  label="Precio"
                  value={currentDetail.precio_unitario.toString()} // Format price
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddDetailIcon />}
                  onClick={handleAddDetail}
                  disabled={
                    currentDetail.id_producto === null ||
                    currentDetail.cantidad <= 0
                  }
                >
                  Agregar
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {details.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <TableContainer component={Paper} variant="outlined">
                
                {/* Added variant */}
                <Table size="small">
                  
                  {/* Made table smaller */}
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio Unitario</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((detail) => {
                      const product = productos.find(
                        (p: Producto) => p.id_producto === detail.id_producto
                      );
                      return (
                        <TableRow key={detail.id_detalle}>
                          <TableCell>{product?.nombre || "N/A"}</TableCell>
                          <TableCell align="right">{detail.cantidad}</TableCell>
                          <TableCell align="right">
                            ${detail.precio_unitario.toString()}
                          </TableCell>
                          <TableCell align="right">
                            $
                            {(detail.cantidad * detail.precio_unitario).toFixed(
                              2
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() =>
                                handleRemoveDetail(detail.id_detalle)
                              }
                              color="error"
                              size="small"
                              aria-label="Eliminar detalle"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6">
                          ${totalAmount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>{" "}
                      {/* Empty cell for actions column */}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || details.length === 0}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          Crear Pedido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrderModal;