import { describe, it, expect, beforeEach } from 'vitest';
import { tokenCache, CACHE_KEY_BINANCE_ALPHA } from '@/lib/cache/tokens';
import type { BinanceAlphaToken } from '@/types/binance';

describe('tokenCache', () => {
  const mockTokens: BinanceAlphaToken[] = [
    {
      alphaId: 'alpha-1',
      symbol: 'TEST',
      name: 'Test Token',
      chainId: '1',
      chainName: 'Ethereum',
      contractAddress: '0x123',
      price: '1.00',
      percentChange24h: '5.00',
      volume24h: '1000000',
      marketCap: '10000000',
      liquidity: '500000',
      totalSupply: '1000000',
      circulatingSupply: '900000',
      iconUrl: 'https://example.com/icon.png',
      bnExclusiveState: false,
    },
  ];

  beforeEach(() => {
    tokenCache.clear();
  });

  it('stores and retrieves data', () => {
    tokenCache.set(CACHE_KEY_BINANCE_ALPHA, mockTokens);
    const result = tokenCache.get(CACHE_KEY_BINANCE_ALPHA);

    expect(result).toEqual(mockTokens);
  });

  it('returns null for missing keys', () => {
    const result = tokenCache.get('non-existent');
    expect(result).toBeNull();
  });

  it('returns null and deletes expired entries', () => {
    tokenCache.set(CACHE_KEY_BINANCE_ALPHA, mockTokens);
    expect(tokenCache.has(CACHE_KEY_BINANCE_ALPHA)).toBe(true);

    // Simulate expiry by manipulating internal state
    const entry = { data: mockTokens, timestamp: Date.now() - 6 * 60 * 1000 };
    (tokenCache as unknown as { cache: Map<string, { data: BinanceAlphaToken[]; timestamp: number }> }).cache.set(CACHE_KEY_BINANCE_ALPHA, entry);

    const result = tokenCache.get(CACHE_KEY_BINANCE_ALPHA);
    expect(result).toBeNull();
    expect(tokenCache.has(CACHE_KEY_BINANCE_ALPHA)).toBe(false);
  });

  it('checks key existence correctly', () => {
    expect(tokenCache.has(CACHE_KEY_BINANCE_ALPHA)).toBe(false);
    tokenCache.set(CACHE_KEY_BINANCE_ALPHA, mockTokens);
    expect(tokenCache.has(CACHE_KEY_BINANCE_ALPHA)).toBe(true);
  });

  it('clears all entries', () => {
    tokenCache.set(CACHE_KEY_BINANCE_ALPHA, mockTokens);
    tokenCache.set('other-key', mockTokens);
    tokenCache.clear();

    expect(tokenCache.has(CACHE_KEY_BINANCE_ALPHA)).toBe(false);
    expect(tokenCache.has('other-key')).toBe(false);
  });

  it('deletes a specific key', () => {
    tokenCache.set(CACHE_KEY_BINANCE_ALPHA, mockTokens);
    const deleted = tokenCache.delete(CACHE_KEY_BINANCE_ALPHA);

    expect(deleted).toBe(true);
    expect(tokenCache.has(CACHE_KEY_BINANCE_ALPHA)).toBe(false);
  });
});
