/**
 * Formatting utilities for addresses, numbers, prices, and percentages
 */

/**
 * Truncate an Ethereum address to display format
 * @example truncateAddress('0x1234567890abcdef1234567890abcdef12345678') // '0x1234...5678'
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length <= startChars + endChars + 3) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a number with locale-specific thousands separators
 * @example formatNumber('1234567.89') // '1,234,567.89'
 */
export function formatNumber(value: string | number, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a price value with appropriate precision
 * Small values show more decimals, large values show fewer
 * @example formatPrice('0.00001234') // '$0.000012'
 * @example formatPrice('1234.56') // '$1,234.56'
 */
export function formatPrice(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `$${value}`;

  if (num === 0) return '$0.00';
  if (num < 0.000001) return `$${num.toExponential(2)}`;
  if (num < 0.01) return `$${num.toFixed(6)}`;
  if (num < 1) return `$${num.toFixed(4)}`;
  if (num < 1000) return `$${num.toFixed(2)}`;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format a large number into compact currency notation (K, M, B, T)
 * @example formatCurrency('1234567') // '$1.23M'
 */
export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `$${value}`;

  const absNum = Math.abs(num);
  if (absNum >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (absNum >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (absNum >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (absNum >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Format a percentage change value with + or - prefix
 * @example formatPercent('12.34') // '+12.34%'
 * @example formatPercent('-5.6') // '-5.60%'
 */
export function formatPercent(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${value}%`;
  const prefix = num >= 0 ? '+' : '';
  return `${prefix}${num.toFixed(2)}%`;
}
