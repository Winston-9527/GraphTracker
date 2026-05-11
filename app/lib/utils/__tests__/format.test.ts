import { describe, it, expect } from 'vitest';
import {
  truncateAddress,
  formatNumber,
  formatPrice,
  formatCurrency,
  formatPercent,
} from '../format';

describe('truncateAddress', () => {
  it('truncates a long Ethereum address', () => {
    expect(truncateAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(
      '0x1234...5678'
    );
  });

  it('returns short addresses unchanged', () => {
    expect(truncateAddress('0x1234')).toBe('0x1234');
  });

  it('uses custom start and end lengths', () => {
    expect(truncateAddress('0x1234567890abcdef1234567890abcdef12345678', 8, 6)).toBe(
      '0x123456...345678'
    );
  });

  it('handles empty string', () => {
    expect(truncateAddress('')).toBe('');
  });
});

describe('formatNumber', () => {
  it('formats with thousands separators', () => {
    expect(formatNumber('1234567.89')).toBe('1,234,567.89');
  });

  it('formats number input', () => {
    expect(formatNumber(1234.5)).toBe('1,234.50');
  });

  it('returns original string for invalid input', () => {
    expect(formatNumber('not-a-number')).toBe('not-a-number');
  });

  it('uses custom decimal places', () => {
    expect(formatNumber('1234.5678', 3)).toBe('1,234.568');
  });
});

describe('formatPrice', () => {
  it('formats large prices with commas', () => {
    expect(formatPrice('1234.56')).toBe('$1,234.56');
  });

  it('shows more decimals for small prices', () => {
    expect(formatPrice('0.00001234')).toBe('$0.000012');
  });

  it('shows 4 decimals for prices under 1', () => {
    expect(formatPrice('0.1234')).toBe('$0.1234');
  });

  it('returns exponential for very tiny prices', () => {
    expect(formatPrice('0.00000000123')).toBe('$1.23e-9');
  });

  it('handles zero', () => {
    expect(formatPrice('0')).toBe('$0.00');
  });
});

describe('formatCurrency', () => {
  it('formats thousands as K', () => {
    expect(formatCurrency('1234')).toBe('$1.23K');
  });

  it('formats millions as M', () => {
    expect(formatCurrency('1234567')).toBe('$1.23M');
  });

  it('formats billions as B', () => {
    expect(formatCurrency('1500000000')).toBe('$1.50B');
  });

  it('formats trillions as T', () => {
    expect(formatCurrency('2000000000000')).toBe('$2.00T');
  });

  it('formats small values as plain dollars', () => {
    expect(formatCurrency('45.67')).toBe('$45.67');
  });
});

describe('formatPercent', () => {
  it('adds plus sign for positive values', () => {
    expect(formatPercent('12.34')).toBe('+12.34%');
  });

  it('keeps minus sign for negative values', () => {
    expect(formatPercent('-5.6')).toBe('-5.60%');
  });

  it('handles number input', () => {
    expect(formatPercent(0)).toBe('+0.00%');
  });
});
