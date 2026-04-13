// Blockchain API Types

export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
  rank: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  gasPrice?: string;
  gasUsed?: string;
}

export interface ContractInfo {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string;
  creator?: string;
  creationTx?: string;
  creationTime?: string;
}

export interface ChainConfig {
  name: string;
  explorer: string;
  rpcUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  1: {
    name: 'Ethereum',
    explorer: 'etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  56: {
    name: 'BSC',
    explorer: 'bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
  },
  8453: {
    name: 'Base',
    explorer: 'basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  }
};

export type ChainId = keyof typeof SUPPORTED_CHAINS;
