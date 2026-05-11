import axios from 'axios';
import type { BinanceAlphaResponse } from '@/types/binance';

const BINANCE_ALPHA_API_URL =
  'https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/cex/alpha/all/token/list';

export class BinanceAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseData?: unknown
  ) {
    super(message);
    this.name = 'BinanceAPIError';
  }
}

export async function getBinanceAlphaTokens(): Promise<BinanceAlphaResponse> {
  try {
    const response = await axios.get<BinanceAlphaResponse>(BINANCE_ALPHA_API_URL, {
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (response.data.code !== '000000') {
      throw new BinanceAPIError(
        `Binance API error: ${response.data.message || 'Unknown error'}`,
        response.status,
        response.data
      );
    }

    return response.data;
  } catch (error) {
    if (error instanceof BinanceAPIError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      throw new BinanceAPIError(
        error.message || 'Network error occurred while fetching Binance Alpha tokens',
        error.response?.status,
        error.response?.data
      );
    }

    throw new BinanceAPIError('Unexpected error occurred while fetching Binance Alpha tokens');
  }
}
