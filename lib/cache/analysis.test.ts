import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalysisCache, createCacheKey, hashHolders } from './analysis';

describe('AnalysisCache', () => {
  let cache: AnalysisCache<string>;

  beforeEach(() => {
    cache = new AnalysisCache<string>({ ttlMs: 1000 });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and retrieves data', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns undefined for missing keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('expires entries after TTL', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');

    vi.advanceTimersByTime(1001);

    expect(cache.get('key1')).toBeUndefined();
  });

  it('checks if key exists and is not expired', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);

    vi.advanceTimersByTime(1001);

    expect(cache.has('key1')).toBe(false);
  });

  it('deletes specific keys', () => {
    cache.set('key1', 'value1');
    cache.delete('key1');
    expect(cache.get('key1')).toBeUndefined();
  });

  it('clears all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
    expect(cache.size()).toBe(0);
  });

  it('returns correct size excluding expired entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);

    vi.advanceTimersByTime(1001);

    expect(cache.size()).toBe(0);
  });

  it('uses default TTL of 5 minutes when not specified', () => {
    const defaultCache = new AnalysisCache<number>();
    defaultCache.set('key1', 42);
    expect(defaultCache.get('key1')).toBe(42);

    vi.advanceTimersByTime(4 * 60 * 1000);
    expect(defaultCache.get('key1')).toBe(42);

    vi.advanceTimersByTime(2 * 60 * 1000);
    expect(defaultCache.get('key1')).toBeUndefined();
  });
});

describe('createCacheKey', () => {
  it('combines tokenId and holdersHash', () => {
    const key = createCacheKey('token123', 'hash456');
    expect(key).toBe('token123::hash456');
  });
});

describe('hashHolders', () => {
  it('produces consistent hash for same data', () => {
    const holders = [
      { address: '0xABC', balance: '1000', percentage: 10 },
      { address: '0xDEF', balance: '500', percentage: 5 },
    ];

    const hash1 = hashHolders(holders);
    const hash2 = hashHolders(holders);

    expect(hash1).toBe(hash2);
  });

  it('produces different hash for different data', () => {
    const holders1 = [
      { address: '0xABC', balance: '1000', percentage: 10 },
    ];
    const holders2 = [
      { address: '0xABC', balance: '1000', percentage: 11 },
    ];

    const hash1 = hashHolders(holders1);
    const hash2 = hashHolders(holders2);

    expect(hash1).not.toBe(hash2);
  });

  it('is case-insensitive for addresses', () => {
    const holders1 = [
      { address: '0xABC', balance: '1000', percentage: 10 },
    ];
    const holders2 = [
      { address: '0xabc', balance: '1000', percentage: 10 },
    ];

    const hash1 = hashHolders(holders1);
    const hash2 = hashHolders(holders2);

    expect(hash1).toBe(hash2);
  });

  it('is order-independent', () => {
    const holders1 = [
      { address: '0xABC', balance: '1000', percentage: 10 },
      { address: '0xDEF', balance: '500', percentage: 5 },
    ];
    const holders2 = [
      { address: '0xDEF', balance: '500', percentage: 5 },
      { address: '0xABC', balance: '1000', percentage: 10 },
    ];

    const hash1 = hashHolders(holders1);
    const hash2 = hashHolders(holders2);

    expect(hash1).toBe(hash2);
  });
});
