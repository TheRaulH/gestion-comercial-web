import { CreditScore, LocalAtm, Payments, QrCode2 } from "@mui/icons-material";
import { PaymentMethod } from "../types/pedidos";

const getPaymentIcon = (paymentMethod: PaymentMethod) => {
    switch (paymentMethod) {
      case "Efectivo":
        return <LocalAtm color="success" />;
      case "Tarjeta":
        return <CreditScore color="info" />;
      case "QR":
        return <QrCode2 color="primary" />;
      default:
        return <Payments />;
    }
  };

export default getPaymentIcon;