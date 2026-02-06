export type DeliveryStatus = 'CREATED';

export type Delivery = {
  id: string;
  transactionId: string;
  productId: string;
  status: DeliveryStatus;
  address: string;
  city: string;
  phone: string;
  fullName: string;
};
