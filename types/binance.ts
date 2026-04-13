// Binance Alpha Token Types
export interface BinanceAlphaToken {
  alphaId: string;
  symbol: string;
  name: string;
  chainId: string;
  chainName: string;
  contractAddress: string;
  price: string;
  percentChange24h: string;
  volume24h: string;
  marketCap: string;
  liquidity: string;
  totalSupply: string;
  circulatingSupply: string;
  iconUrl: string;
  chainIconUrl?: string;
  bnExclusiveState: boolean;
}

export interface BinanceAlphaResponse {
  code: string;
  message: string;
  data: BinanceAlphaToken[];
}
