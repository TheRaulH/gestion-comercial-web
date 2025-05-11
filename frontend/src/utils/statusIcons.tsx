import { 
  CheckCircle as CheckIcon,  
  Cancel as CancelIcon,
  TakeoutDining,
  DoneAllRounded,
  Pending,  
} from "@mui/icons-material";

export const getStatusIcon = (estado: string) => {
  switch (estado) {
    case "Pendiente":
      return <Pending color="info" />;
    case "En cocina":
      return <TakeoutDining color="warning" />;
    case "Entregado":
      return <DoneAllRounded color="success" />;
    case "Cancelado":
      return <CancelIcon color="error" />;
    default:
      return <CheckIcon />;
  }
};

export const getStatusColor = (estado: string) => {
  switch (estado) {
    case "Pendiente":
      return "info";
    case "En cocina":
      return "warning";
    case "Entregado":
      return "success";
    case "Cancelado":
      return "error";
    default:
      return "default";
  }
};