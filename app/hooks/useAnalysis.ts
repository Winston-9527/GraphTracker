'use client';

import { useState, useCallback } from 'react';
import { GraphAnalysis, BinanceAlphaToken, AIAnalysisRequest } from '@/types';
import { mockAnalysis } from '@/app/lib/mockData';

interface UseAnalysisReturn {
  analysis: GraphAnalysis | null;
  isLoading: boolean;
  error: Error | null;
  analyzeToken: (token: BinanceAlphaToken, holderData?: AIAnalysisRequest['holder_data']) => Promise<void>;
  clearAnalysis: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<GraphAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzeToken = useCallback(async (
    token: BinanceAlphaToken,
    holderData?: AIAnalysisRequest['holder_data']
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      const randomRiskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      
      const centralizationScore = Math.floor(Math.random() * 100);
      
      const updatedAnalysis: GraphAnalysis = {
        ...mockAnalysis,
        token_symbol: token.symbol,
        token_address: token.contractAddress,
        chain_id: parseInt(token.chainId),
        risk_level: randomRiskLevel,
        centralization_score: centralizationScore,
        analyzed_at: new Date().toISOString(),
        key_findings: [
          `Token ${token.symbol} shows ${randomRiskLevel} risk profile`,
          `Centralization score: ${centralizationScore}/100`,
          `Chain: ${token.chainName} (ID: ${token.chainId})`,
          `Market cap: $${(parseInt(token.marketCap) / 1e9).toFixed(2)}B`,
          `24h Volume: $${(parseInt(token.volume24h) / 1e6).toFixed(2)}M`,
          holderData ? `Analyzed ${holderData.length} holder addresses` : 'Using default holder dataset',
        ],
        holder_analysis: mockAnalysis.holder_analysis.map(ha => ({
          ...ha,
          risk_assessment: {
            ...ha.risk_assessment,
            score: Math.floor(Math.random() * 100),
            level: riskLevels[Math.floor(Math.random() * riskLevels.length)],
          },
          analyzed_at: new Date().toISOString(),
        })),
      };

      setAnalysis(updatedAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to analyze token'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    analysis,
    isLoading,
    error,
    analyzeToken,
    clearAnalysis,
  };
}
