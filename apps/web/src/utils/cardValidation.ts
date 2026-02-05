export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PaymentData {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolderName: string;
  brand: CardBrand;
}

export interface DeliveryData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length === 0) {
    return 'UNKNOWN';
  }

  const firstDigit = digits[0];
  const firstTwoDigits = digits.substring(0, 2);
  const firstFourDigits = digits.substring(0, 4);

  if (firstDigit === '4') {
    return 'VISA';
  }

  if (firstTwoDigits >= '51' && firstTwoDigits <= '55') {
    return 'MASTERCARD';
  }

  if (parseInt(firstFourDigits, 10) >= 2221 && parseInt(firstFourDigits, 10) <= 2720) {
    return 'MASTERCARD';
  }

  return 'UNKNOWN';
}

export function validateCardNumber(cardNumber: string): ValidationResult {
  const digits = cardNumber.replace(/\D/g, '');

  if (!digits) {
    return {
      isValid: false,
      error: 'Card number is required',
    };
  }

  if (!/^\d{13,19}$/.test(digits)) {
    return {
      isValid: false,
      error: 'Card number must be between 13 and 19 digits',
    };
  }

  return { isValid: true };
}

export function validateExpMonth(expMonth: string | number): ValidationResult {
  const month = String(expMonth).trim();

  if (!month) {
    return {
      isValid: false,
      error: 'Expiration month is required',
    };
  }

  const monthNum = parseInt(month, 10);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return {
      isValid: false,
      error: 'Expiration month must be between 01 and 12',
    };
  }

  return { isValid: true };
}

export function validateExpYear(expYear: string | number): ValidationResult {
  const year = String(expYear).trim();

  if (!year) {
    return {
      isValid: false,
      error: 'Expiration year is required',
    };
  }

  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 15;

  if (isNaN(yearNum) || yearNum < currentYear || yearNum > maxYear) {
    return {
      isValid: false,
      error: `Expiration year must be between ${currentYear} and ${maxYear}`,
    };
  }

  return { isValid: true };
}

export function validateCvc(cvc: string): ValidationResult {
  const digits = cvc.replace(/\D/g, '');

  if (!digits) {
    return {
      isValid: false,
      error: 'CVC is required',
    };
  }

  if (!/^\d{3,4}$/.test(digits)) {
    return {
      isValid: false,
      error: 'CVC must be 3 or 4 digits',
    };
  }

  return { isValid: true };
}

export function validateCardHolderName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Card holder name is required',
    };
  }

  if (trimmed.replace(/\s+/g, '').length < 3) {
    return {
      isValid: false,
      error: 'Card holder name must contain at least 3 letters',
    };
  }

  if (!/^[\p{L}\s]+$/u.test(trimmed)) {
    return {
      isValid: false,
      error: 'Card holder name must contain only letters and spaces',
    };
  }

  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const digits = phone.replace(/\D/g, '');

  if (!digits) {
    return {
      isValid: false,
      error: 'Phone is required',
    };
  }

  if (!/^\d{7,15}$/.test(digits)) {
    return {
      isValid: false,
      error: 'Phone must contain only digits (7–15 characters)',
    };
  }

  return { isValid: true };
}

export function validateFullName(fullName: string): ValidationResult {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Full name is required',
    };
  }

  if (trimmed.replace(/\s+/g, '').length < 3) {
    return {
      isValid: false,
      error: 'Full name must contain at least 3 letters',
    };
  }

  if (!/^[\p{L}\s]+$/u.test(trimmed)) {
    return {
      isValid: false,
      error: 'Full name must contain only letters and spaces',
    };
  }

  return { isValid: true };
}

export function validateAddress(address: string): ValidationResult {
  const trimmed = address.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Address is required',
    };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'Address must be at least 3 characters',
    };
  }

  return { isValid: true };
}

export function validateCity(city: string): ValidationResult {
  const trimmed = city.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'City is required',
    };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'City must be at least 3 characters',
    };
  }

  return { isValid: true };
}
