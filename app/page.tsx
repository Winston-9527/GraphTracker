'use client';

import { useState } from 'react';
import { AnalysisPanel } from '@/components/ai/AnalysisPanel';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { mockAIAnalysisRequest } from '@/lib/ai/analyzer';
import { Brain, Play, AlertCircle } from 'lucide-react';

export default function AIAnalysisPage() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [analysisData, setAnalysisData] = useState<ReturnType<typeof mockAIAnalysisRequest> | null>(null);
  const [showMockWarning, setShowMockWarning] = useState(true);

  const { analysis, isLoading, error } = useAIAnalysis(
    analysisData,
    { revalidateOnFocus: false }
  );

  const handleAnalyze = () => {
    if (!tokenAddress || !tokenAddress.startsWith('0x')) {
      return;
    }
    
    const mockData = mockAIAnalysisRequest(tokenAddress, 56, 10);
    setAnalysisData(mockData);
  };

  const demoAddress = '0x1234567890abcdef1234567890abcdef12345678';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              AI Token Analysis
            </h1>
          </div>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Analyze token holder patterns and detect suspicious behaviors using AI
          </p>
        </div>

        {showMockWarning && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-950/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Demo Mode</h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  This module uses simulated AI analysis. In production, it will integrate with 
                  actual AI APIs (OpenAI, Anthropic, etc.) to provide real token analysis.
                </p>
              </div>
              <button
                onClick={() => setShowMockWarning(false)}
                className="text-sm text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label 
                htmlFor="token-address" 
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Token Contract Address
              </label>
              <input
                id="token-address"
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder={demoAddress}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAnalyze}
                disabled={!tokenAddress || isLoading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Analyze Token
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Quick demo:</span>
            <button
              onClick={() => setTokenAddress(demoAddress)}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Use demo address
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Analysis Features</h2>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  <span>Risk assessment for each holder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  <span>Behavior pattern detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  <span>Address correlation analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  <span>Centralization score calculation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  <span>Suspicious pattern identification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  <span>Actionable recommendations</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <AnalysisPanel analysis={analysis} isLoading={isLoading} error={error} />
          </div>
        </div>
      </div>
    </div>
  );
}
