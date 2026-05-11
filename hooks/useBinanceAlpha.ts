import useSWR from 'swr';
import { getBinanceAlphaTokens } from '@/lib/api/binance';
import { tokenCache, CACHE_KEY_BINANCE_ALPHA } from '@/lib/cache/tokens';
import type { BinanceAlphaToken } from '@/types/binance';

const fetcher = async (): Promise<BinanceAlphaToken[]> => {
  const cached = tokenCache.get(CACHE_KEY_BINANCE_ALPHA);
  if (cached) {
    return cached;
  }

  const response = await getBinanceAlphaTokens();
  const tokens = response.data;
  tokenCache.set(CACHE_KEY_BINANCE_ALPHA, tokens);
  return tokens;
};

export function useBinanceAlpha() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    'binance-alpha',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      onError: (err) => {
        console.error('Binance Alpha fetch error:', err);
      },
    }
  );

  return {
    tokens: data ?? [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    refresh: mutate,
  };
}
