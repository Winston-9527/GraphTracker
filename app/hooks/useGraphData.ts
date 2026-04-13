'use client';

import { useState, useEffect, useCallback } from 'react';
import { GraphData, BinanceAlphaToken } from '@/types';
import { mockGraphData } from '@/app/lib/mockData';

interface UseGraphDataReturn {
  graphData: GraphData;
  isLoading: boolean;
  error: Error | null;
  generateGraphData: (token: BinanceAlphaToken) => Promise<void>;
  refreshGraphData: () => Promise<void>;
}

const emptyGraphData: GraphData = {
  nodes: [],
  edges: [],
};

export function useGraphData(): UseGraphDataReturn {
  const [graphData, setGraphData] = useState<GraphData>(emptyGraphData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const generateGraphData = useCallback(async (token: BinanceAlphaToken) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const randomizedNodes = mockGraphData.nodes.map(node => ({
        ...node,
        balance: Math.floor(node.balance * (0.8 + Math.random() * 0.4)),
        percentage: Number(((node.percentage || 0) * (0.9 + Math.random() * 0.2)).toFixed(2)),
      }));

      const randomizedEdges = mockGraphData.edges.map(edge => ({
        ...edge,
        weight: Math.floor(edge.weight * (0.7 + Math.random() * 0.6)),
      }));

      const updatedContractNode = randomizedNodes.find(n => n.type === 'contract');
      if (updatedContractNode) {
        updatedContractNode.address = token.contractAddress;
        updatedContractNode.label = `${token.symbol} Contract`;
      }

      setGraphData({
        nodes: randomizedNodes,
        edges: randomizedEdges,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate graph data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshGraphData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setGraphData(prev => ({
        nodes: prev.nodes.map(node => ({
          ...node,
          balance: Math.floor(node.balance * (0.95 + Math.random() * 0.1)),
        })),
        edges: prev.edges,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh graph data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setGraphData(mockGraphData);
  }, []);

  return {
    graphData,
    isLoading,
    error,
    generateGraphData,
    refreshGraphData,
  };
}
