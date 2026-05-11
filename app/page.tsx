'use client';

import { useState } from 'react';
import { Menu, X, Network } from 'lucide-react';
import { TokenList } from '@/components/TokenList';
import { TokenInfo } from '@/components/TokenInfo';
import NetworkGraph from '@/components/NetworkGraph';
import { AIAnalysisPanel } from '@/components/AIAnalysisPanel';
import { useTokenData } from '@/hooks/useTokenData';
import { useBinanceAlpha } from '@/hooks/useBinanceAlpha';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { tokens, isLoading: isLoadingTokens } = useBinanceAlpha();
  const {
    selectedToken,
    setSelectedToken,
    graphData,
    isLoading,
    analysisHolders,
  } = useTokenData();

  const handleSelectToken = (token: typeof selectedToken) => {
    if (token) {
      setSelectedToken(token);
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 flex-shrink-0 border-r border-zinc-800 bg-zinc-950
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Network className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 leading-tight">GraphTracker</h1>
            <p className="text-[11px] text-zinc-500 leading-tight">Binance Alpha Analysis</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1.5 rounded-md text-zinc-500 hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <TokenList
            tokens={tokens}
            selectedTokenId={selectedToken?.alphaId}
            onSelectToken={handleSelectToken}
            isLoading={isLoadingTokens}
            className="h-full border-0 rounded-none"
          />
        </div>

        <div className="border-t border-zinc-800 flex-shrink-0 max-h-[45%] overflow-auto">
          <TokenInfo token={selectedToken} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-800"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600">
              <Network className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-zinc-100">GraphTracker</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {graphData ? (
            <NetworkGraph
              data={graphData}
              className="w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
                <Network className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-1">
                {isLoading ? 'Loading token data...' : 'Select a token'}
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                {isLoading
                  ? 'Fetching holder data and building the network graph...'
                  : 'Choose a token from the sidebar to visualize its holder network and run AI analysis.'}
              </p>
              {isLoading && (
                <div className="mt-4 h-1 w-32 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-pulse rounded-full" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-zinc-800 max-h-[40%] overflow-auto">
          <AIAnalysisPanel
            tokenAddress={selectedToken?.contractAddress}
            chainId={selectedToken ? parseInt(selectedToken.chainId) || 56 : undefined}
            holderData={analysisHolders}
          />
        </div>
      </main>
    </div>
  );
}
