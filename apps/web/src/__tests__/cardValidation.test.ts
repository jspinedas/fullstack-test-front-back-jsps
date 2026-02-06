import {
  detectCardBrand,
  validateCardNumber,
  validateExpMonth,
  validateExpYear,
  validateCvc,
  validateCardHolderName,
  validatePhone,
  validateFullName,
  validateAddress,
  validateCity,
} from '../utils/cardValidation';

describe('detectCardBrand', () => {
  it('should detect VISA card', () => {
    expect(detectCardBrand('4532015112830366')).toBe('VISA');
    expect(detectCardBrand('4111111111111111')).toBe('VISA');
  });

  it('should detect MASTERCARD from 51-55', () => {
    expect(detectCardBrand('5425233010103442')).toBe('MASTERCARD');
    expect(detectCardBrand('5105105105105100')).toBe('MASTERCARD');
    expect(detectCardBrand('5555555555554444')).toBe('MASTERCARD');
  });

  it('should detect MASTERCARD from 2221-2720', () => {
    expect(detectCardBrand('2221000000000009')).toBe('MASTERCARD');
    expect(detectCardBrand('2720999999999996')).toBe('MASTERCARD');
  });

  it('should return UNKNOWN for other card numbers', () => {
    expect(detectCardBrand('6011000990139424')).toBe('UNKNOWN');
    expect(detectCardBrand('3530111333300000')).toBe('UNKNOWN');
  });

  it('should handle non-digit characters', () => {
    expect(detectCardBrand('4532-0151-1283-0366')).toBe('VISA');
    expect(detectCardBrand('4532 0151 1283 0366')).toBe('VISA');
  });

  it('should return UNKNOWN for empty string', () => {
    expect(detectCardBrand('')).toBe('UNKNOWN');
  });
});

describe('validateCardNumber', () => {
  it('should validate correct card numbers', () => {
    expect(validateCardNumber('4111111111111111')).toEqual({ isValid: true });
    expect(validateCardNumber('5425233010103442')).toEqual({ isValid: true });
  });

  it('should reject empty card number', () => {
    const result = validateCardNumber('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Card number is required');
  });

  it('should accept card numbers with formatting when digits are valid length', () => {
    const result = validateCardNumber('4111-1111-1111-1111');
    expect(result.isValid).toBe(true);
  });

  it('should reject card numbers with invalid length', () => {
    const result = validateCardNumber('123456789');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('13 and 19');
  });
});

describe('validateExpMonth', () => {
  it('should validate correct months', () => {
    expect(validateExpMonth('1')).toEqual({ isValid: true });
    expect(validateExpMonth('12')).toEqual({ isValid: true });
    expect(validateExpMonth(6)).toEqual({ isValid: true });
  });

  it('should reject empty month', () => {
    const result = validateExpMonth('');
    expect(result.isValid).toBe(false);
  });

  it('should reject invalid months', () => {
    expect(validateExpMonth('0').isValid).toBe(false);
    expect(validateExpMonth('13').isValid).toBe(false);
    expect(validateExpMonth('abc').isValid).toBe(false);
  });
});

describe('validateExpYear', () => {
  it('should validate current and future years', () => {
    const currentYear = new Date().getFullYear();
    const result = validateExpYear(currentYear);
    expect(result.isValid).toBe(true);

    const nextYear = currentYear + 5;
    expect(validateExpYear(nextYear)).toEqual({ isValid: true });
  });

  it('should reject past years', () => {
    const lastYear = new Date().getFullYear() - 1;
    const result = validateExpYear(lastYear);
    expect(result.isValid).toBe(false);
  });

  it('should reject years beyond 15 years', () => {
    const futureYear = new Date().getFullYear() + 16;
    const result = validateExpYear(futureYear);
    expect(result.isValid).toBe(false);
  });

  it('should reject empty year', () => {
    const result = validateExpYear('');
    expect(result.isValid).toBe(false);
  });
});

describe('validateCvc', () => {
  it('should validate 3-digit CVC', () => {
    expect(validateCvc('123')).toEqual({ isValid: true });
  });

  it('should validate 4-digit CVC', () => {
    expect(validateCvc('1234')).toEqual({ isValid: true });
  });

  it('should reject empty CVC', () => {
    const result = validateCvc('');
    expect(result.isValid).toBe(false);
  });

  it('should reject invalid CVC lengths', () => {
    expect(validateCvc('12').isValid).toBe(false);
    expect(validateCvc('12345').isValid).toBe(false);
  });

  it('should reject non-digit CVC', () => {
    const result = validateCvc('abc');
    expect(result.isValid).toBe(false);
  });
});

describe('validateCardHolderName', () => {
  it('should validate valid names', () => {
    expect(validateCardHolderName('John Doe')).toEqual({ isValid: true });
    expect(validateCardHolderName('ABC')).toEqual({ isValid: true });
  });

  it('should reject empty name', () => {
    const result = validateCardHolderName('');
    expect(result.isValid).toBe(false);
  });

  it('should reject names shorter than 3 characters', () => {
    const result = validateCardHolderName('Jo');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('3 letters');
  });

  it('should reject names with non-letter characters', () => {
    const result = validateCardHolderName('Juan 123');
    expect(result.isValid).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should validate valid phone numbers', () => {
    expect(validatePhone('3001234567')).toEqual({ isValid: true });
    expect(validatePhone('305987654')).toEqual({ isValid: true });
  });

  it('should accept phone with formatting characters', () => {
    expect(validatePhone('+57 300 123-4567')).toEqual({ isValid: true });
  });

  it('should reject empty phone', () => {
    const result = validatePhone('');
    expect(result.isValid).toBe(false);
  });

  it('should reject invalid phone lengths', () => {
    expect(validatePhone('12345').isValid).toBe(false);
    expect(validatePhone('123456789012345678').isValid).toBe(false);
  });
});

describe('validateFullName', () => {
  it('should validate valid names', () => {
    expect(validateFullName('John Doe')).toEqual({ isValid: true });
  });

  it('should reject empty name', () => {
    const result = validateFullName('');
    expect(result.isValid).toBe(false);
  });

  it('should reject names shorter than 3 characters', () => {
    const result = validateFullName('Jo');
    expect(result.isValid).toBe(false);
  });

  it('should reject names with non-letter characters', () => {
    const result = validateFullName('Maria 2026');
    expect(result.isValid).toBe(false);
  });
});

describe('validateAddress', () => {
  it('should validate valid addresses', () => {
    expect(validateAddress('123 Main Street')).toEqual({ isValid: true });
  });

  it('should reject empty address', () => {
    const result = validateAddress('');
    expect(result.isValid).toBe(false);
  });

  it('should reject addresses shorter than 3 characters', () => {
    const result = validateAddress('St');
    expect(result.isValid).toBe(false);
  });
});

describe('validateCity', () => {
  it('should validate valid cities', () => {
    expect(validateCity('New York')).toEqual({ isValid: true });
  });

  it('should reject empty city', () => {
    const result = validateCity('');
    expect(result.isValid).toBe(false);
  });

  it('should reject cities shorter than 3 characters', () => {
    const result = validateCity('NY');
    expect(result.isValid).toBe(false);
  });
});
