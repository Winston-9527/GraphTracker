"use client";

import { useState, useCallback } from "react";
import { Network, BarChart3, Sparkles } from "lucide-react";
import { TokenList, TokenDetail } from "@/app/components/tokens";
import { GraphViewer } from "@/app/components/graph";
import { AnalysisPanel } from "@/app/components/analysis";
import type { BinanceAlphaToken, GraphData, GraphAnalysis } from "@/types";

// Mock data for demonstration - replace with actual API calls
const MOCK_TOKENS: BinanceAlphaToken[] = [
  {
    alphaId: "alpha-1",
    symbol: "PEPE",
    name: "Pepe",
    chainId: "1",
    chainName: "Ethereum",
    contractAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    price: "0.00001234",
    percentChange24h: "15.42",
    volume24h: "1234567890",
    marketCap: "5000000000",
    liquidity: "250000000",
    totalSupply: "420690000000000",
    circulatingSupply: "420690000000000",
    iconUrl: "",
    bnExclusiveState: false,
  },
  {
    alphaId: "alpha-2",
    symbol: "SHIB",
    name: "Shiba Inu",
    chainId: "1",
    chainName: "Ethereum",
    contractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    price: "0.00002567",
    percentChange24h: "-5.23",
    volume24h: "987654321",
    marketCap: "15000000000",
    liquidity: "500000000",
    totalSupply: "589534802402211300000",
    circulatingSupply: "589270951417032900000",
    iconUrl: "",
    bnExclusiveState: false,
  },
  {
    alphaId: "alpha-3",
    symbol: "FLOKI",
    name: "FLOKI",
    chainId: "1",
    chainName: "Ethereum",
    contractAddress: "0xcf0C122e6Bb4CF7E0c27eE0d3B8E46c0b3C9f5e2",
    price: "0.00015678",
    percentChange24h: "8.91",
    volume24h: "456789012",
    marketCap: "1200000000",
    liquidity: "150000000",
    totalSupply: "971246548745120000000000",
    circulatingSupply: "971246548745120000000000",
    iconUrl: "",
    bnExclusiveState: false,
  },
  {
    alphaId: "alpha-4",
    symbol: "DOGE",
    name: "Dogecoin",
    chainId: "1",
    chainName: "Ethereum",
    contractAddress: "0x4206931337dc273a630d8d3e9b76a82d8e6c0c8f",
    price: "0.123456",
    percentChange24h: "2.34",
    volume24h: "2345678901",
    marketCap: "18000000000",
    liquidity: "800000000",
    totalSupply: "132670764299999000000",
    circulatingSupply: "132670764299999000000",
    iconUrl: "",
    bnExclusiveState: false,
  },
  {
    alphaId: "alpha-5",
    symbol: "BONK",
    name: "Bonk",
    chainId: "1",
    chainName: "Ethereum",
    contractAddress: "0x6e26e5e2f5f8f8c8b8b8b8b8b8b8b8b8b8b8b8b",
    price: "0.00002345",
    percentChange24h: "-12.56",
    volume24h: "345678901",
    marketCap: "800000000",
    liquidity: "100000000",
    totalSupply: "93526183276777800000000000",
    circulatingSupply: "93526183276777800000000000",
    iconUrl: "",
    bnExclusiveState: false,
  },
];

// Mock graph data generator
function generateMockGraphData(token: BinanceAlphaToken): GraphData {
  const nodes = [
    {
      id: "contract",
      label: `${token.symbol} Contract`,
      type: "contract" as const,
      balance: 0,
      rank: 10,
      address: token.contractAddress,
      percentage: 0,
    },
    {
      id: "holder-1",
      label: "Whale #1",
      type: "whale" as const,
      balance: 150000000000,
      rank: 8,
      address: "0x1234567890abcdef1234567890abcdef12345678",
      percentage: 25.5,
    },
    {
      id: "holder-2",
      label: "Whale #2",
      type: "whale" as const,
      balance: 80000000000,
      rank: 7,
      address: "0xabcdef1234567890abcdef1234567890abcdef12",
      percentage: 13.2,
    },
    {
      id: "holder-3",
      label: "Exchange Wallet",
      type: "exchange" as const,
      balance: 120000000000,
      rank: 6,
      address: "0x7890abcdef1234567890abcdef1234567890abcd",
      percentage: 18.7,
    },
    {
      id: "holder-4",
      label: "Holder #4",
      type: "holder" as const,
      balance: 45000000000,
      rank: 5,
      address: "0xdef1234567890abcdef1234567890abcdef123456",
      percentage: 7.8,
    },
    {
      id: "holder-5",
      label: "Holder #5",
      type: "holder" as const,
      balance: 32000000000,
      rank: 4,
      address: "0x567890abcdef1234567890abcdef1234567890ab",
      percentage: 5.4,
    },
    {
      id: "holder-6",
      label: "Holder #6",
      type: "holder" as const,
      balance: 28000000000,
      rank: 3,
      address: "0x90abcdef1234567890abcdef1234567890abcdef",
      percentage: 4.8,
    },
    {
      id: "holder-7",
      label: "Holder #7",
      type: "holder" as const,
      balance: 21000000000,
      rank: 2,
      address: "0xcdef1234567890abcdef1234567890abcdef1234",
      percentage: 3.6,
    },
    {
      id: "holder-8",
      label: "Holder #8",
      type: "holder" as const,
      balance: 15000000000,
      rank: 1,
      address: "0x34567890abcdef1234567890abcdef123456789a",
      percentage: 2.5,
    },
  ];

  const edges = [
    { id: "e1", source: "contract", target: "holder-1", weight: 25.5 },
    { id: "e2", source: "contract", target: "holder-2", weight: 13.2 },
    { id: "e3", source: "contract", target: "holder-3", weight: 18.7 },
    { id: "e4", source: "contract", target: "holder-4", weight: 7.8 },
    { id: "e5", source: "contract", target: "holder-5", weight: 5.4 },
    { id: "e6", source: "contract", target: "holder-6", weight: 4.8 },
    { id: "e7", source: "contract", target: "holder-7", weight: 3.6 },
    { id: "e8", source: "contract", target: "holder-8", weight: 2.5 },
    { id: "e9", source: "holder-1", target: "holder-2", weight: 2.0 },
    { id: "e10", source: "holder-1", target: "holder-3", weight: 1.5 },
  ];

  return { nodes, edges };
}

// Mock analysis data generator
function generateMockAnalysis(token: BinanceAlphaToken): GraphAnalysis {
  const centralizationScore = Math.floor(Math.random() * 60) + 20;
  const riskLevel = centralizationScore > 60 ? "high" : centralizationScore > 40 ? "medium" : "low";

  return {
    token_symbol: token.symbol,
    token_address: token.contractAddress,
    chain_id: parseInt(token.chainId) || 1,
    centralization_score: centralizationScore,
    risk_level: riskLevel,
    key_findings: [
      `Top 3 holders control ${(centralizationScore * 0.8).toFixed(1)}% of total supply`,
      "Liquidity is well-distributed across multiple DEX pools",
      "No significant whale accumulation detected in last 7 days",
      "Contract has been audited by CertiK",
    ],
    holder_analysis: [
      {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        correlation_analysis: "High correlation with known whale wallets",
        behavior_patterns: [
          {
            pattern: "Accumulation",
            description: "Consistent buying over last 30 days",
            confidence: 0.85,
            evidence: ["15 buy transactions", "No significant sells"],
          },
        ],
        risk_assessment: {
          level: "medium",
          score: 45,
          details: "Moderate risk due to large holdings",
          factors: ["Large position size", "Recent accumulation"],
        },
        recommendations: ["Monitor for sudden movements"],
        related_addresses: [],
        analyzed_at: new Date().toISOString(),
      },
      {
        address: "0xabcdef1234567890abcdef1234567890abcdef12",
        correlation_analysis: "No significant correlations found",
        behavior_patterns: [],
        risk_assessment: {
          level: "low",
          score: 25,
          details: "Low risk holder",
          factors: ["Stable holding pattern"],
        },
        recommendations: [],
        related_addresses: [],
        analyzed_at: new Date().toISOString(),
      },
    ],
    suspicious_patterns: centralizationScore > 50 
      ? ["High concentration among top holders", "Potential coordinated buying detected"] 
      : [],
    analyzed_at: new Date().toISOString(),
  };
}

export default function Home() {
  const [selectedToken, setSelectedToken] = useState<BinanceAlphaToken | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [analysis, setAnalysis] = useState<GraphAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  const handleSelectToken = useCallback((token: BinanceAlphaToken) => {
    setSelectedToken(token);
    setGraphData(null);
    setAnalysis(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedToken) return;

    setIsAnalyzing(true);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockGraphData = generateMockGraphData(selectedToken);
    const mockAnalysis = generateMockAnalysis(selectedToken);

    setGraphData(mockGraphData);
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  }, [selectedToken]);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">GraphTracker</h1>
              <p className="text-xs text-zinc-500">Binance Alpha Token Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Analysis</span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-4 p-4 lg:p-6">
        {/* Left Sidebar - Token List */}
        <aside className="w-full lg:w-96 flex-shrink-0">
          <TokenList
            tokens={MOCK_TOKENS}
            selectedTokenId={selectedToken?.alphaId}
            onSelectToken={handleSelectToken}
            isLoading={isLoadingTokens}
            className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-7rem)]"
          />
        </aside>

        {/* Center Content */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Token Detail */}
          <div className="flex-shrink-0">
            <TokenDetail
              token={selectedToken}
              onAnalyze={selectedToken ? handleAnalyze : undefined}
              className={selectedToken ? "" : "h-[300px]"}
            />
          </div>

          {/* Graph Viewer */}
          <div className="flex-1 min-h-[400px]">
            <GraphViewer
              graphData={graphData}
              isLoading={isAnalyzing}
              className="h-full"
            />
          </div>
        </section>

        {/* Right Sidebar - Analysis Panel */}
        <aside className="w-full lg:w-96 flex-shrink-0">
          <AnalysisPanel
            analysis={analysis}
            isLoading={isAnalyzing}
            className="h-auto lg:h-[calc(100vh-7rem)]"
          />
        </aside>
      </main>

      {/* Mobile Footer Stats */}
      <footer className="lg:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>{MOCK_TOKENS.length} tokens available</span>
          </div>
          <div>
            {selectedToken ? (
              <span className="text-zinc-300">Selected: {selectedToken.symbol}</span>
            ) : (
              <span>Select a token to begin</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
