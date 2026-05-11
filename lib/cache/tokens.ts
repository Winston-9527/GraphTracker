import type { BinanceAlphaToken } from '@/types/binance';

interface CacheEntry {
  data: BinanceAlphaToken[];
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

class TokenCache {
  private cache: Map<string, CacheEntry> = new Map();

  set(key: string, data: BinanceAlphaToken[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): BinanceAlphaToken[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

export const tokenCache = new TokenCache();

export const CACHE_KEY_BINANCE_ALPHA = 'binance-alpha-tokens';
