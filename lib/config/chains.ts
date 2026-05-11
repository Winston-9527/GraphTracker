import { ChainId, ChainConfig, SUPPORTED_CHAINS } from '@/types';

export type { ChainId } from '@/types';
export { SUPPORTED_CHAINS };

export interface ChainApiConfig extends ChainConfig {
  apiUrl: string;
  apiKeyEnvVar: string;
  rateLimitPerSecond: number;
}

export const CHAIN_API_CONFIGS: Record<ChainId, ChainApiConfig> = {
  1: {
    ...SUPPORTED_CHAINS[1],
    apiUrl: 'https://api.etherscan.io/api',
    apiKeyEnvVar: 'ETHERSCAN_API_KEY',
    rateLimitPerSecond: 5,
  },
  56: {
    ...SUPPORTED_CHAINS[56],
    apiUrl: 'https://api.bscscan.com/api',
    apiKeyEnvVar: 'BSCSCAN_API_KEY',
    rateLimitPerSecond: 5,
  },
  8453: {
    ...SUPPORTED_CHAINS[8453],
    apiUrl: 'https://api.basescan.org/api',
    apiKeyEnvVar: 'BASESCAN_API_KEY',
    rateLimitPerSecond: 5,
  },
};

export function getApiUrl(chainId: ChainId): string {
  const config = CHAIN_API_CONFIGS[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return config.apiUrl;
}

export function getApiKey(chainId: ChainId): string {
  const config = CHAIN_API_CONFIGS[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return process.env[config.apiKeyEnvVar] || '';
}

export function getExplorerWebUrl(chainId: ChainId): string {
  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return `https://${chain.explorer}`;
}
