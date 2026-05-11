export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface AnalysisCacheConfig {
  ttlMs: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;

export class AnalysisCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private config: AnalysisCacheConfig = { ttlMs: DEFAULT_TTL_MS }) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + this.config.ttlMs,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    this.cleanup();
    return this.store.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export function createCacheKey(tokenId: string, holdersHash: string): string {
  return `${tokenId}::${holdersHash}`;
}

export function hashHolders(holders: { address: string; balance: string; percentage: number }[]): string {
  const normalized = holders
    .map((h) => `${h.address.toLowerCase()}:${h.balance}:${h.percentage.toFixed(4)}`)
    .sort()
    .join('|');
  return btoa(normalized).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
}
