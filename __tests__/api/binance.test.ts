import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { getBinanceAlphaTokens, BinanceAPIError } from '@/lib/api/binance';
import type { BinanceAlphaResponse } from '@/types/binance';

vi.mock('axios');

describe('getBinanceAlphaTokens', () => {
  const mockToken = {
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
    chainIconUrl: 'https://example.com/chain.png',
    bnExclusiveState: false,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns data when API call succeeds', async () => {
    const mockResponse: BinanceAlphaResponse = {
      code: '000000',
      message: 'success',
      data: [mockToken],
    };

    vi.mocked(axios.get).mockResolvedValueOnce({
      data: mockResponse,
      status: 200,
    });

    const result = await getBinanceAlphaTokens();

    expect(result).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledWith(
      'https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/cex/alpha/all/token/list',
      expect.objectContaining({
        timeout: 10000,
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('throws BinanceAPIError when API returns non-success code', async () => {
    const mockResponse: BinanceAlphaResponse = {
      code: '100001',
      message: 'Invalid request',
      data: [],
    };

    vi.mocked(axios.get).mockResolvedValue({
      data: mockResponse,
      status: 200,
    });

    await expect(getBinanceAlphaTokens()).rejects.toThrow(BinanceAPIError);
    await expect(getBinanceAlphaTokens()).rejects.toThrow('Binance API error: Invalid request');
  });

  it('throws BinanceAPIError on network error', async () => {
    const networkError = new Error('Network Error');
    vi.mocked(axios.isAxiosError).mockReturnValueOnce(true);
    vi.mocked(axios.get).mockRejectedValueOnce(networkError);

    await expect(getBinanceAlphaTokens()).rejects.toThrow(BinanceAPIError);
  });

  it('throws BinanceAPIError on unexpected error', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce('unknown error');

    await expect(getBinanceAlphaTokens()).rejects.toThrow(BinanceAPIError);
    await expect(getBinanceAlphaTokens()).rejects.toThrow('Unexpected error occurred while fetching Binance Alpha tokens');
  });
});
