export const BASE_FEE = 1500;
export const DELIVERY_FEE = 5000;

export interface Totals {
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
}

export function calculateTotals(productPrice: number): Totals {
  const productAmount = productPrice;
  const baseFee = BASE_FEE;
  const deliveryFee = DELIVERY_FEE;
  const total = productAmount + baseFee + deliveryFee;

  return {
    productAmount,
    baseFee,
    deliveryFee,
    total,
  };
}
