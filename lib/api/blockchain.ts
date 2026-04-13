import axios, { AxiosInstance } from 'axios';
import {
  TokenHolder,
  Transaction,
  ContractInfo,
  ChainId,
  SUPPORTED_CHAINS,
} from '@/types';

const API_KEYS: Record<ChainId, string | undefined> = {
  1: process.env.ETHERSCAN_API_KEY,
  56: process.env.BSCSCAN_API_KEY,
  8453: process.env.BASESCAN_API_KEY,
};

const EXPLORER_API_URLS: Record<ChainId, string> = {
  1: 'https://api.etherscan.io/api',
  56: 'https://api.bscscan.com/api',
  8453: 'https://api.basescan.org/api',
};

function getExplorerWebUrl(chainId: ChainId): string {
  const chain = SUPPORTED_CHAINS[chainId];
  return `https://${chain.explorer}`;
}

export class BlockchainApiClient {
  private clients: Record<ChainId, AxiosInstance>;

  constructor() {
    this.clients = {
      1: this.createClient(1),
      56: this.createClient(56),
      8453: this.createClient(8453),
    };
  }

  private createClient(chainId: ChainId): AxiosInstance {
    return axios.create({
      baseURL: EXPLORER_API_URLS[chainId],
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private getClient(chainId: ChainId): AxiosInstance {
    return this.clients[chainId];
  }

  async getTokenHolders(
    chainId: ChainId,
    contractAddress: string,
    page: number = 1,
    offset: number = 100
  ): Promise<TokenHolder[]> {
    const client = this.getClient(chainId);
    const apiKey = API_KEYS[chainId] || '';

    await this.getContractInfo(chainId, contractAddress);

    console.warn(
      'Token holder ranking requires specialized data provider. ' +
      'Standard explorer APIs do not provide this data.'
    );

    return [];
  }

  async getTransactions(
    chainId: ChainId,
    address: string,
    page: number = 1,
    offset: number = 100,
    sort: 'asc' | 'desc' = 'desc'
  ): Promise<Transaction[]> {
    const client = this.getClient(chainId);
    const apiKey = API_KEYS[chainId] || '';

    const response = await client.get('', {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        page,
        offset,
        sort,
        apikey: apiKey,
      },
    });

    if (response.data.status !== '1' && response.data.message !== 'No transactions found') {
      throw new Error(`API Error: ${response.data.message}`);
    }

    return response.data.result.map((tx: Record<string, string>) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timeStamp: tx.timeStamp,
      gasPrice: tx.gasPrice,
      gasUsed: tx.gasUsed,
    }));
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
    const apiKey = API_KEYS[chainId] || '';

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

    const response = await client.get('', { params });

    if (response.data.status !== '1' && response.data.message !== 'No transactions found') {
      throw new Error(`API Error: ${response.data.message}`);
    }

    return response.data.result.map((tx: Record<string, string>) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      timeStamp: tx.timeStamp,
      gasPrice: tx.gasPrice,
      gasUsed: tx.gasUsed,
    }));
  }

  async getContractInfo(
    chainId: ChainId,
    contractAddress: string
  ): Promise<ContractInfo> {
    const client = this.getClient(chainId);
    const apiKey = API_KEYS[chainId] || '';

    const [tokenResponse, contractResponse] = await Promise.all([
      client.get('', {
        params: {
          module: 'stats',
          action: 'tokensupply',
          contractaddress: contractAddress,
          apikey: apiKey,
        },
      }).catch(() => ({ data: { status: '0' } })),
      
      client.get('', {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: contractAddress,
          apikey: apiKey,
        },
      }).catch(() => ({ data: { status: '0' } })),
    ]);

    return {
      address: contractAddress,
      name: contractResponse.data.result?.[0]?.ContractName,
      symbol: undefined,
      decimals: undefined,
      totalSupply: tokenResponse.data.status === '1' ? tokenResponse.data.result : undefined,
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
