import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  TokenHolder,
  Transaction,
  ContractInfo,
  AddressInfo,
  ChainId,
} from '@/types';
import {
  CHAIN_API_CONFIGS,
  getApiUrl,
  getApiKey,
  getExplorerWebUrl,
} from '@/lib/config/chains';

class RateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(
      (t) => now - t < this.windowMs
    );

    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0];
      const waitTime = this.windowMs - (now - oldest);
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      return this.acquire();
    }

    this.timestamps.push(Date.now());
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const isRetryable =
        error instanceof AxiosError &&
        (error.response?.status === 429 ||
          (error.response?.status ?? 0) >= 500 ||
          !error.response);

      if (!isRetryable || attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
}

export class BlockchainApiClient {
  private clients: Record<ChainId, AxiosInstance>;
  private rateLimiters: Record<ChainId, RateLimiter>;

  constructor() {
    this.clients = {
      1: this.createClient(1),
      56: this.createClient(56),
      8453: this.createClient(8453),
    };
    this.rateLimiters = {
      1: new RateLimiter(CHAIN_API_CONFIGS[1].rateLimitPerSecond),
      56: new RateLimiter(CHAIN_API_CONFIGS[56].rateLimitPerSecond),
      8453: new RateLimiter(CHAIN_API_CONFIGS[8453].rateLimitPerSecond),
    };
  }

  private createClient(chainId: ChainId): AxiosInstance {
    return axios.create({
      baseURL: getApiUrl(chainId),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getClient(chainId: ChainId): AxiosInstance {
    const client = this.clients[chainId];
    if (!client) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    return client;
  }

  private async rateLimitedRequest<T>(
    chainId: ChainId,
    requestFn: () => Promise<T>
  ): Promise<T> {
    await this.rateLimiters[chainId].acquire();
    return withRetry(requestFn);
  }

  async getTopTokenHolders(
    chainId: ChainId,
    contractAddress: string,
    limit: number = 50
  ): Promise<TokenHolder[]> {
    const client = this.getClient(chainId);
    const apiKey = getApiKey(chainId);

    const response = await this.rateLimitedRequest(chainId, () =>
      client.get('', {
        params: {
          module: 'token',
          action: 'tokenholderlist',
          contractaddress: contractAddress,
          page: 1,
          offset: limit,
          apikey: apiKey,
        },
      })
    );

    if (response.data.status !== '1') {
      throw new Error(
        `API Error: ${response.data.message || 'Unknown error'}`
      );
    }

    const totalSupply = response.data.result.reduce(
      (sum: number, item: Record<string, string>) =>
        sum + parseFloat(item.TokenHolderQuantity || '0'),
      0
    );

    return response.data.result.map(
      (item: Record<string, string>, index: number) => {
        const balance = item.TokenHolderQuantity || '0';
        const percentage =
          totalSupply > 0
            ? (parseFloat(balance) / totalSupply) * 100
            : 0;

        return {
          address: item.TokenHolderAddress,
          balance,
          percentage: parseFloat(percentage.toFixed(4)),
          rank: index + 1,
        };
      }
    );
  }

  async getTokenTransfers(
    chainId: ChainId,
    contractAddress: string,
    address?: string,
    page: number = 1,
    offset: number = 100,
    sort: 'asc' | 'desc' = 'desc'
  ): Promise<Transaction[]> {
    const client = this.getClient(chainId);
    const apiKey = getApiKey(chainId);

    const params: Record<string, string | number> = {
      module: 'account',
      action: 'tokentx',
      contractaddress: contractAddress,
      page,
      offset,
      sort,
      apikey: apiKey,
    };

    if (address) {
      params.address = address;
    }

    const response = await this.rateLimitedRequest(chainId, () =>
      client.get('', { params })
    );

    if (
      response.data.status !== '1' &&
      response.data.message !== 'No transactions found'
    ) {
      throw new Error(
        `API Error: ${response.data.message || 'Unknown error'}`
      );
    }

    const result = response.data.result || [];
    return result.map((tx: Record<string, string>) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timeStamp: tx.timeStamp,
      gasPrice: tx.gasPrice,
      gasUsed: tx.gasUsed,
    }));
  }

  async getAddressInfo(
    chainId: ChainId,
    address: string
  ): Promise<AddressInfo> {
    const client = this.getClient(chainId);
    const apiKey = getApiKey(chainId);

    const [balanceResponse, txResponse] = await Promise.all([
      this.rateLimitedRequest(chainId, () =>
        client.get('', {
          params: {
            module: 'account',
            action: 'balance',
            address,
            tag: 'latest',
            apikey: apiKey,
          },
        })
      ).catch(() => ({ data: { status: '0', result: '0' } })),

      this.rateLimitedRequest(chainId, () =>
        client.get('', {
          params: {
            module: 'account',
            action: 'txlist',
            address,
            page: 1,
            offset: 1,
            sort: 'desc',
            apikey: apiKey,
          },
        })
      ).catch(() => ({ data: { status: '0', result: [] } })),
    ]);

    const balance =
      balanceResponse.data.status === '1'
        ? balanceResponse.data.result
        : '0';

    let transactionCount: number | undefined;
    if (
      txResponse.data.status === '1' &&
      Array.isArray(txResponse.data.result)
    ) {
      transactionCount = txResponse.data.result.length;
    }

    return {
      address,
      balance,
      transactionCount,
      chainId,
      chainName: CHAIN_API_CONFIGS[chainId].name,
    };
  }

  async getContractInfo(
    chainId: ChainId,
    contractAddress: string
  ): Promise<ContractInfo> {
    const client = this.getClient(chainId);
    const apiKey = getApiKey(chainId);

    const [tokenResponse, contractResponse] = await Promise.all([
      this.rateLimitedRequest(chainId, () =>
        client.get('', {
          params: {
            module: 'stats',
            action: 'tokensupply',
            contractaddress: contractAddress,
            apikey: apiKey,
          },
        })
      ).catch(() => ({ data: { status: '0' } })),

      this.rateLimitedRequest(chainId, () =>
        client.get('', {
          params: {
            module: 'contract',
            action: 'getsourcecode',
            address: contractAddress,
            apikey: apiKey,
          },
        })
      ).catch(() => ({ data: { status: '0' } })),
    ]);

    return {
      address: contractAddress,
      name: contractResponse.data.result?.[0]?.ContractName,
      symbol: undefined,
      decimals: undefined,
      totalSupply:
        tokenResponse.data.status === '1'
          ? tokenResponse.data.result
          : undefined,
    };
  }

  getExplorerAddressUrl(chainId: ChainId, address: string): string {
    return `${getExplorerWebUrl(chainId)}/address/${address}`;
  }

  getExplorerTxUrl(chainId: ChainId, txHash: string): string {
    return `${getExplorerWebUrl(chainId)}/tx/${txHash}`;
  }

  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  formatTokenAmount(amount: string, decimals: number = 18): string {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toLocaleString('en-US', {
      maximumFractionDigits: decimals,
    });
  }
}

export const blockchainApi = new BlockchainApiClient();
