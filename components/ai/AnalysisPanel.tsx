'use client';

import { useState } from 'react';
import type { GraphAnalysis } from '@/types';

interface AnalysisPanelProps {
  analysis: GraphAnalysis | null;
  isLoading?: boolean;
  error?: string | null;
}

export function AnalysisPanel({ analysis, isLoading, error }: AnalysisPanelProps) {
  const [selectedHolder, setSelectedHolder] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">AI Analyzing token patterns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/50">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Analysis Error</h3>
        <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Select a token to view AI analysis results
        </p>
      </div>
    );
  }

  const riskColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">AI Analysis Results</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {analysis.token_address.slice(0, 6)}...{analysis.token_address.slice(-4)}
            </p>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${riskColors[analysis.risk_level]}`}>
            {analysis.risk_level.toUpperCase()} RISK
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Centralization Score</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {analysis.centralization_score.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Holders Analyzed</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {analysis.holder_analysis.length}
            </p>
          </div>
        </div>
      </div>

      {analysis.key_findings.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Key Findings</h3>
          <ul className="space-y-2">
            {analysis.key_findings.map((finding, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.suspicious_patterns.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
          <h3 className="mb-4 text-lg font-semibold text-red-800 dark:text-red-200">Suspicious Patterns Detected</h3>
          <ul className="space-y-2">
            {analysis.suspicious_patterns.map((pattern, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Holder Analysis</h3>
        <div className="space-y-3">
          {analysis.holder_analysis.map((holder) => (
            <button
              key={holder.address}
              onClick={() => setSelectedHolder(selectedHolder === holder.address ? null : holder.address)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${riskColors[holder.risk_assessment.level]}`}>
                    {holder.risk_assessment.level}
                  </span>
                  <span className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
                    {holder.address.slice(0, 8)}...{holder.address.slice(-6)}
                  </span>
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Score: {holder.risk_assessment.score}/100
                </span>
              </div>
              
              {selectedHolder === holder.address && (
                <div className="mt-4 space-y-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Risk Details</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{holder.risk_assessment.details}</p>
                  </div>
                  
                  {holder.behavior_patterns.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Behavior Patterns</p>
                      <ul className="mt-1 space-y-1">
                        {holder.behavior_patterns.map((pattern, idx) => (
                          <li key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">
                            {pattern.pattern} (confidence: {Math.round(pattern.confidence * 100)}%)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {holder.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recommendations</p>
                      <ul className="mt-1 space-y-1">
                        {holder.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
