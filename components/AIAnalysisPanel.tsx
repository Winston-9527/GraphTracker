'use client';

import { useState, useCallback } from 'react';
import type { GraphAnalysis } from '@/types';

interface AIAnalysisPanelProps {
  tokenAddress?: string;
  chainId?: number;
  holderData?: {
    address: string;
    balance: string;
    percentage: number;
  }[];
  onAnalysisComplete?: (analysis: GraphAnalysis) => void;
}

export function AIAnalysisPanel({
  tokenAddress,
  chainId = 56,
  holderData,
  onAnalysisComplete,
}: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<GraphAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!tokenAddress || !holderData || holderData.length === 0) {
      setError('Please provide token address and holder data');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_address: tokenAddress,
          chain_id: chainId,
          holder_data: holderData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze token');
      }

      setAnalysis(data as GraphAnalysis);
      onAnalysisComplete?.(data as GraphAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, chainId, holderData, onAnalysisComplete]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-6 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              AI is analyzing token patterns...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Analysis Error
            </h3>
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={clearAnalysis}
            className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          >
            Dismiss
          </button>
        </div>
        <button
          onClick={runAnalysis}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="mb-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Run AI analysis to get insights on token holder patterns
        </p>
        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Analyze with AI
        </button>
      </div>
    );
  }

  const riskColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    medium:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              AI Analysis Results
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {analysis.token_address.slice(0, 6)}...
              {analysis.token_address.slice(-4)}
            </p>
          </div>
          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${riskColors[analysis.risk_level]}`}
          >
            {analysis.risk_level.toUpperCase()} RISK
          </div>
        </div>
      </div>

      {analysis.key_findings.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Key Findings
          </h3>
          <ul className="space-y-2">
            {analysis.key_findings.map((finding, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.suspicious_patterns.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
          <h3 className="mb-4 text-lg font-semibold text-red-800 dark:text-red-200">
            Risk Assessment
          </h3>
          <ul className="space-y-2">
            {analysis.suspicious_patterns.map((pattern, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300"
              >
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Re-analyze
        </button>
      </div>
    </div>
  );
}
