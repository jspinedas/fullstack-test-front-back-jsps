export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type CustomerInfo = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
};

export type Transaction = {
  id: string;
  productId: string;
  status: TransactionStatus;
  amount: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  provider: string;
  providerTransactionId?: string;
  failureReason?: string;
  customer: CustomerInfo;
};
