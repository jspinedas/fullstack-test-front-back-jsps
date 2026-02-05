export const BASE_FEE = 1500; // cents (in COP = 15 pesos)
export const DELIVERY_FEE = 5000; // cents (in COP = 50 pesos)

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
