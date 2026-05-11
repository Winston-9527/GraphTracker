import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useBinanceAlpha } from '@/hooks/useBinanceAlpha';
import { getBinanceAlphaTokens } from '@/lib/api/binance';
import { tokenCache, CACHE_KEY_BINANCE_ALPHA } from '@/lib/cache/tokens';
import type { BinanceAlphaToken } from '@/types/binance';

vi.mock('@/lib/api/binance');

const mockToken: BinanceAlphaToken = {
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
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('useBinanceAlpha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenCache.clear();
  });

  it('returns tokens on successful fetch', async () => {
    vi.mocked(getBinanceAlphaTokens).mockResolvedValueOnce({
      code: '000000',
      message: 'success',
      data: [mockToken],
    });

    const { result } = renderHook(() => useBinanceAlpha(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tokens).toEqual([mockToken]);
    expect(result.current.isError).toBe(false);
  });

  it('returns error state on API failure', async () => {
    vi.mocked(getBinanceAlphaTokens).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useBinanceAlpha(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.tokens).toEqual([]);
    expect(result.current.error).toBeDefined();
  });

  it('uses cache when available', async () => {
    tokenCache.set(CACHE_KEY_BINANCE_ALPHA, [mockToken]);

    const { result } = renderHook(() => useBinanceAlpha(), { wrapper });

    await waitFor(() => {
      expect(result.current.tokens).toEqual([mockToken]);
    });

    expect(result.current.isLoading).toBe(false);
    expect(getBinanceAlphaTokens).not.toHaveBeenCalled();
  });
});
