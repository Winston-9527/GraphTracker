import { useState, useEffect, useCallback } from 'react';
import type { BinanceAlphaToken, TokenHolder, GraphData } from '@/types';
import { blockchainApi } from '@/lib/api/blockchain';
import { buildGraphData, generateMockHolders, generateMockTransactions } from '@/lib/graph/processor';
import type { HolderInfo, TransactionRecord } from '@/lib/graph/algorithms';

function tokenHoldersToHolderInfo(holders: TokenHolder[]): HolderInfo[] {
  return holders.map((h) => ({
    address: h.address,
    balance: h.balance,
    percentage: h.percentage,
    rank: h.rank,
  }));
}

function tokenTransactionsToRecords(txs: { from: string; to: string; value: string; timeStamp: string }[]): TransactionRecord[] {
  return txs.map((tx) => ({
    from: tx.from,
    to: tx.to,
    value: tx.value,
    timestamp: parseInt(tx.timeStamp) * 1000,
  }));
}

export interface UseTokenDataReturn {
  selectedToken: BinanceAlphaToken | null;
  setSelectedToken: (token: BinanceAlphaToken | null) => void;
  holders: TokenHolder[];
  graphData: GraphData | null;
  isLoading: boolean;
  isLoadingHolders: boolean;
  isLoadingGraph: boolean;
  error: string | null;
  analysisHolders: { address: string; balance: string; percentage: number }[];
  refreshHolders: () => void;
}

export function useTokenData(): UseTokenDataReturn {
  const [selectedToken, setSelectedTokenState] = useState<BinanceAlphaToken | null>(null);
  const [holders, setHolders] = useState<TokenHolder[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoadingHolders, setIsLoadingHolders] = useState(false);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const setSelectedToken = useCallback((token: BinanceAlphaToken | null) => {
    setSelectedTokenState(token);
    setHolders([]);
    setGraphData(null);
    setError(null);
  }, []);

  const refreshHolders = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!selectedToken) {
      setHolders([]);
      setGraphData(null);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setIsLoadingHolders(true);
      setError(null);

      try {
        const chainIdNum = parseInt(selectedToken!.chainId);
        if (![1, 56, 8453].includes(chainIdNum)) {
          throw new Error(`Unsupported chain ID: ${selectedToken!.chainId}`);
        }

        const tokenHolders = await blockchainApi.getTopTokenHolders(
          chainIdNum as 1 | 56 | 8453,
          selectedToken!.contractAddress,
          30
        );

        if (cancelled) return;

        setHolders(tokenHolders);
        setIsLoadingHolders(false);
        setIsLoadingGraph(true);

        let transactions: TransactionRecord[] = [];
        try {
          const tokenTxs = await blockchainApi.getTokenTransfers(
            chainIdNum as 1 | 56 | 8453,
            selectedToken!.contractAddress,
            undefined,
            1,
            100
          );
          transactions = tokenTransactionsToRecords(tokenTxs);
        } catch {
          transactions = generateMockTransactions(
            tokenHolders.map((h) => h.address),
            50
          );
        }

        if (cancelled) return;

        const holderInfo = tokenHoldersToHolderInfo(tokenHolders);
        const graph = buildGraphData({
          tokenAddress: selectedToken!.contractAddress,
          holders: holderInfo,
          transactions,
        });

        if (!cancelled) {
          setGraphData(graph);
        }
      } catch (err) {
        if (cancelled) return;
        console.warn('Failed to fetch real data, using mock data:', err);

        const mockHolders = generateMockHolders(20);
        const mockTransactions = generateMockTransactions(
          mockHolders.map((h) => h.address),
          50
        );

        const graph = buildGraphData({
          tokenAddress: selectedToken!.contractAddress,
          holders: mockHolders,
          transactions: mockTransactions,
        });

        setHolders(
          mockHolders.map((h) => ({
            address: h.address,
            balance: h.balance,
            percentage: h.percentage,
            rank: h.rank,
          }))
        );
        setGraphData(graph);
        setError('Using demo data (API unavailable)');
      } finally {
        if (!cancelled) {
          setIsLoadingHolders(false);
          setIsLoadingGraph(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [selectedToken, refreshKey]);

  const analysisHolders = holders.map((h) => ({
    address: h.address,
    balance: h.balance,
    percentage: h.percentage,
  }));

  return {
    selectedToken,
    setSelectedToken,
    holders,
    graphData,
    isLoading: isLoadingHolders || isLoadingGraph,
    isLoadingHolders,
    isLoadingGraph,
    error,
    analysisHolders,
    refreshHolders,
  };
}
