import useSWR from 'swr';
import type { GraphAnalysis, AIAnalysisRequest } from '@/types';

const fetcher = async (url: string, requestData: AIAnalysisRequest) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze token');
  }

  return response.json();
};

export function useAIAnalysis(
  requestData: AIAnalysisRequest | null,
  options?: {
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  }
) {
  const { data, error, isLoading, mutate } = useSWR<GraphAnalysis>(
    requestData ? ['/api/analyze', requestData] : null,
    ([url, data]) => fetcher(url as string, data as AIAnalysisRequest),
    {
      refreshInterval: options?.refreshInterval ?? 0,
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
    }
  );

  return {
    analysis: data ?? null,
    isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
