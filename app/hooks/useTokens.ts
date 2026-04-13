'use client';

import { useState, useEffect, useCallback } from 'react';
import { BinanceAlphaToken } from '@/types';
import { mockTokens } from '@/app/lib/mockData';

interface UseTokensReturn {
  tokens: BinanceAlphaToken[];
  loading: boolean;
  error: Error | null;
  selectedToken: BinanceAlphaToken | null;
  setSelectedToken: (token: BinanceAlphaToken | null) => void;
  refreshTokens: () => Promise<void>;
}

export function useTokens(): UseTokensReturn {
  const [tokens, setTokens] = useState<BinanceAlphaToken[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedToken, setSelectedToken] = useState<BinanceAlphaToken | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const shuffled = [...mockTokens].sort(() => Math.random() - 0.5);
      setTokens(shuffled);
      
      if (!selectedToken && shuffled.length > 0) {
        setSelectedToken(shuffled[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tokens'));
    } finally {
      setLoading(false);
    }
  }, [selectedToken]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return {
    tokens,
    loading,
    error,
    selectedToken,
    setSelectedToken,
    refreshTokens: fetchTokens,
  };
}
