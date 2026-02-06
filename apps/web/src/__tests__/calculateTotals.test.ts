import { calculateTotals, BASE_FEE, DELIVERY_FEE } from '../utils/calculateTotals';

describe('calculateTotals', () => {
  it('should calculate correct totals with product price', () => {
    const productPrice = 20000;
    const result = calculateTotals(productPrice);

    expect(result.productAmount).toBe(20000);
    expect(result.baseFee).toBe(BASE_FEE);
    expect(result.deliveryFee).toBe(DELIVERY_FEE);
    expect(result.total).toBe(20000 + BASE_FEE + DELIVERY_FEE);
  });

  it('should calculate correct totals with zero product price', () => {
    const result = calculateTotals(0);

    expect(result.productAmount).toBe(0);
    expect(result.baseFee).toBe(BASE_FEE);
    expect(result.deliveryFee).toBe(DELIVERY_FEE);
    expect(result.total).toBe(BASE_FEE + DELIVERY_FEE);
  });

  it('should calculate correct totals with high product price', () => {
    const productPrice = 5000000;
    const result = calculateTotals(productPrice);

    expect(result.productAmount).toBe(5000000);
    expect(result.total).toBe(5000000 + BASE_FEE + DELIVERY_FEE);
  });

  it('should return all required fields', () => {
    const result = calculateTotals(10000);

    expect(result).toHaveProperty('productAmount');
    expect(result).toHaveProperty('baseFee');
    expect(result).toHaveProperty('deliveryFee');
    expect(result).toHaveProperty('total');
  });
});
