export class StartCheckoutDto {
  productId: string;
  deliveryData: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
  };
  baseFee: number;
  deliveryFee: number;
}

export class ConfirmCheckoutDto {
  transactionId: string;
  paymentData: {
    cardNumber: string;
    cardExpMonth: string;
    cardExpYear: string;
    cardCvc: string;
    cardHolder: string;
  };
}
