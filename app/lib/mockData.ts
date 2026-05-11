import {
  BinanceAlphaToken,
  GraphData,
  GraphAnalysis,
  GraphNode,
  GraphEdge,
  AddressAnalysis,
  BehaviorPattern,
  RiskAssessment,
  AddressCorrelation,
} from '@/types';

// Mock Binance Alpha Tokens (6 realistic tokens)
export const mockTokens: BinanceAlphaToken[] = [
  {
    alphaId: 'alpha-001',
    symbol: 'PEPE',
    name: 'Pepe',
    chainId: '1',
    chainName: 'Ethereum',
    contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    price: '0.00001234',
    percentChange24h: '+15.42',
    volume24h: '2456789012',
    marketCap: '5234567890',
    liquidity: '890123456',
    totalSupply: '420690000000000',
    circulatingSupply: '420690000000000',
    iconUrl: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
    chainIconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    bnExclusiveState: false,
  },
  {
    alphaId: 'alpha-002',
    symbol: 'BONK',
    name: 'Bonk',
    chainId: '56',
    chainName: 'BSC',
    contractAddress: '0xA4B5f4E4fD6b2C5E8d3F7a1B2c3D4e5F6a7B8C9D0',
    price: '0.00002856',
    percentChange24h: '-8.23',
    volume24h: '1234567890',
    marketCap: '1876543210',
    liquidity: '456789012',
    totalSupply: '93526170000000',
    circulatingSupply: '93526170000000',
    iconUrl: 'https://cryptologos.cc/logos/bonk-bonk-logo.png',
    chainIconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    bnExclusiveState: true,
  },
  {
    alphaId: 'alpha-003',
    symbol: 'FLOKI',
    name: 'Floki Inu',
    chainId: '1',
    chainName: 'Ethereum',
    contractAddress: '0xcf0C122c6b73ff809C693DB651e98Da58e0F99D1',
    price: '0.00015678',
    percentChange24h: '+22.15',
    volume24h: '3456789012',
    marketCap: '1456789012',
    liquidity: '234567890',
    totalSupply: '9710981730000',
    circulatingSupply: '9710981730000',
    iconUrl: 'https://cryptologos.cc/logos/floki-floki-logo.png',
    chainIconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    bnExclusiveState: false,
  },
  {
    alphaId: 'alpha-004',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    chainId: '1',
    chainName: 'Ethereum',
    contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    price: '0.00002543',
    percentChange24h: '+5.67',
    volume24h: '4567890123',
    marketCap: '15123456789',
    liquidity: '1234567890',
    totalSupply: '589534802402323',
    circulatingSupply: '589271810417247',
    iconUrl: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
    chainIconUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    bnExclusiveState: false,
  },
  {
    alphaId: 'alpha-005',
    symbol: 'DOGE',
    name: 'Dogecoin',
    chainId: '56',
    chainName: 'BSC',
    contractAddress: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
    price: '0.123456',
    percentChange24h: '-2.34',
    volume24h: '6789012345',
    marketCap: '17890123456',
    liquidity: '2345678901',
    totalSupply: '132670764300',
    circulatingSupply: '132670764300',
    iconUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
    chainIconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    bnExclusiveState: true,
  },
  {
    alphaId: 'alpha-006',
    symbol: 'MEME',
    name: 'Memecoin',
    chainId: '8453',
    chainName: 'Base',
    contractAddress: '0xb131f4A55907B10d1F0A50d8b8aD91b5c0B5dC0E',
    price: '0.034567',
    percentChange24h: '+45.21',
    volume24h: '987654321',
    marketCap: '345678901',
    liquidity: '123456789',
    totalSupply: '69000000000',
    circulatingSupply: '69000000000',
    iconUrl: 'https://cryptologos.cc/logos/meme-meme-logo.png',
    chainIconUrl: 'https://cryptologos.cc/logos/base-base-logo.png',
    bnExclusiveState: false,
  },
];

// Helper to generate random addresses
const generateAddress = (prefix: string, index: number): string => {
  return `${prefix}${Array(40 - prefix.length)
    .fill(0)
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')}`;
};

// Mock Graph Nodes (holders, contracts, exchanges, whales)
export const mockGraphNodes: GraphNode[] = [
  // Contract node
  {
    id: 'contract-1',
    label: 'Token Contract',
    type: 'contract',
    balance: 0,
    rank: 0,
    address: mockTokens[0].contractAddress,
    percentage: 0,
    color: '#e74c3c',
    size: 50,
  },
  // Exchange nodes
  {
    id: 'exchange-1',
    label: 'Binance Hot Wallet',
    type: 'exchange',
    balance: 12500000000000,
    rank: 1,
    address: generateAddress('0x', 1),
    percentage: 2.97,
    color: '#f39c12',
    size: 45,
  },
  {
    id: 'exchange-2',
    label: 'Uniswap V3 Pool',
    type: 'exchange',
    balance: 8900000000000,
    rank: 2,
    address: generateAddress('0x', 2),
    percentage: 2.12,
    color: '#f39c12',
    size: 40,
  },
  // Whale nodes
  {
    id: 'whale-1',
    label: 'Whale #1',
    type: 'whale',
    balance: 21000000000000,
    rank: 3,
    address: generateAddress('0x', 3),
    percentage: 4.99,
    color: '#9b59b6',
    size: 55,
  },
  {
    id: 'whale-2',
    label: 'Whale #2',
    type: 'whale',
    balance: 15600000000000,
    rank: 4,
    address: generateAddress('0x', 4),
    percentage: 3.71,
    color: '#9b59b6',
    size: 48,
  },
  {
    id: 'whale-3',
    label: 'Whale #3',
    type: 'whale',
    balance: 9800000000000,
    rank: 5,
    address: generateAddress('0x', 5),
    percentage: 2.33,
    color: '#9b59b6',
    size: 42,
  },
  // Regular holders
  {
    id: 'holder-1',
    label: 'Holder A',
    type: 'holder',
    balance: 4500000000000,
    rank: 6,
    address: generateAddress('0x', 6),
    percentage: 1.07,
    color: '#4a90d9',
    size: 30,
  },
  {
    id: 'holder-2',
    label: 'Holder B',
    type: 'holder',
    balance: 3200000000000,
    rank: 7,
    address: generateAddress('0x', 7),
    percentage: 0.76,
    color: '#4a90d9',
    size: 28,
  },
  {
    id: 'holder-3',
    label: 'Holder C',
    type: 'holder',
    balance: 2800000000000,
    rank: 8,
    address: generateAddress('0x', 8),
    percentage: 0.67,
    color: '#4a90d9',
    size: 26,
  },
  {
    id: 'holder-4',
    label: 'Holder D',
    type: 'holder',
    balance: 1900000000000,
    rank: 9,
    address: generateAddress('0x', 9),
    percentage: 0.45,
    color: '#4a90d9',
    size: 24,
  },
  {
    id: 'holder-5',
    label: 'Holder E',
    type: 'holder',
    balance: 1200000000000,
    rank: 10,
    address: generateAddress('0x', 10),
    percentage: 0.29,
    color: '#4a90d9',
    size: 22,
  },
];

// Mock Graph Edges (transactions between nodes)
export const mockGraphEdges: GraphEdge[] = [
  // Whale 1 transactions
  { id: 'edge-1', source: 'whale-1', target: 'exchange-1', weight: 5, label: '5 txs', color: '#34495e', width: 3 },
  { id: 'edge-2', source: 'whale-1', target: 'exchange-2', weight: 3, label: '3 txs', color: '#34495e', width: 2 },
  { id: 'edge-3', source: 'whale-1', target: 'holder-1', weight: 2, label: '2 txs', color: '#34495e', width: 2 },
  { id: 'edge-4', source: 'whale-1', target: 'holder-2', weight: 4, label: '4 txs', color: '#34495e', width: 3 },
  
  // Whale 2 transactions
  { id: 'edge-5', source: 'whale-2', target: 'exchange-1', weight: 8, label: '8 txs', color: '#34495e', width: 4 },
  { id: 'edge-6', source: 'whale-2', target: 'whale-1', weight: 2, label: '2 txs', color: '#e67e22', width: 2 },
  { id: 'edge-7', source: 'whale-2', target: 'holder-3', weight: 3, label: '3 txs', color: '#34495e', width: 2 },
  
  // Whale 3 transactions
  { id: 'edge-8', source: 'whale-3', target: 'exchange-2', weight: 6, label: '6 txs', color: '#34495e', width: 3 },
  { id: 'edge-9', source: 'whale-3', target: 'holder-4', weight: 2, label: '2 txs', color: '#34495e', width: 2 },
  { id: 'edge-10', source: 'whale-3', target: 'holder-5', weight: 1, label: '1 tx', color: '#34495e', width: 1 },
  
  // Exchange transactions
  { id: 'edge-11', source: 'exchange-1', target: 'holder-1', weight: 12, label: '12 txs', color: '#34495e', width: 5 },
  { id: 'edge-12', source: 'exchange-1', target: 'holder-2', weight: 8, label: '8 txs', color: '#34495e', width: 4 },
  { id: 'edge-13', source: 'exchange-2', target: 'holder-3', weight: 15, label: '15 txs', color: '#34495e', width: 5 },
  { id: 'edge-14', source: 'exchange-2', target: 'holder-4', weight: 7, label: '7 txs', color: '#34495e', width: 3 },
  
  // Inter-holder transactions
  { id: 'edge-15', source: 'holder-1', target: 'holder-3', weight: 2, label: '2 txs', color: '#34495e', width: 2 },
  { id: 'edge-16', source: 'holder-2', target: 'holder-5', weight: 1, label: '1 tx', color: '#34495e', width: 1 },
  { id: 'edge-17', source: 'holder-4', target: 'holder-5', weight: 3, label: '3 txs', color: '#34495e', width: 2 },
  
  // Contract interactions
  { id: 'edge-18', source: 'contract-1', target: 'exchange-1', weight: 25, label: '25 txs', color: '#e74c3c', width: 6 },
  { id: 'edge-19', source: 'contract-1', target: 'exchange-2', weight: 18, label: '18 txs', color: '#e74c3c', width: 5 },
];

// Mock Graph Data
export const mockGraphData: GraphData = {
  nodes: mockGraphNodes,
  edges: mockGraphEdges,
};

// Mock Risk Assessments
const mockRiskAssessments: RiskAssessment[] = [
  {
    level: 'high',
    score: 78,
    details: 'High concentration risk detected. Top 3 holders control over 11% of supply.',
    factors: [
      'Top holder controls 4.99% of supply',
      'Multiple whale addresses showing correlated trading patterns',
      'Limited distribution among retail holders',
      'High velocity of transactions between whale addresses',
    ],
  },
  {
    level: 'medium',
    score: 45,
    details: 'Moderate risk with some concentration but healthy exchange distribution.',
    factors: [
      'Exchange wallets hold reasonable liquidity',
      'Some whale clustering observed',
      'Transaction patterns show normal trading activity',
    ],
  },
  {
    level: 'low',
    score: 23,
    details: 'Well distributed token with healthy holder metrics.',
    factors: [
      'Broad holder distribution',
      'Low concentration in top wallets',
      'Regular trading activity across multiple exchanges',
    ],
  },
];

// Mock Behavior Patterns
const mockBehaviorPatterns: BehaviorPattern[] = [
  {
    pattern: 'Coordinated Trading',
    description: 'Multiple whale addresses show synchronized buy/sell patterns within 15-minute windows.',
    confidence: 0.87,
    evidence: [
      'Whale #1 and Whale #2 executed similar trades 12 times in 7 days',
      'Transaction timing correlation coefficient: 0.89',
      'Both addresses funded from same source exchange within 48 hours',
    ],
  },
  {
    pattern: 'Liquidity Provider',
    description: 'Address consistently provides liquidity to DEX pools and receives trading fees.',
    confidence: 0.92,
    evidence: [
      'Regular LP token mints and burns detected',
      'Fee collection pattern matches Uniswap V3 behavior',
      'No significant speculative trading observed',
    ],
  },
  {
    pattern: 'Accumulation Phase',
    description: 'Address showing steady accumulation pattern with minimal selling.',
    confidence: 0.76,
    evidence: [
      'Net positive balance change over 30 days',
      'Buy-to-sell ratio: 4.2:1',
      'Gradual position building with small frequent purchases',
    ],
  },
];

// Mock Address Correlations
const mockAddressCorrelations: AddressCorrelation[] = [
  {
    address: generateAddress('0x', 20),
    relationship: 'Same funding source',
    strength: 0.89,
    evidence: [
      'Both addresses funded from 0x1234...5678 within 24 hours',
      'Similar initial transaction patterns',
      'Shared CEX withdrawal origin',
    ],
  },
  {
    address: generateAddress('0x', 21),
    relationship: 'Trading partner',
    strength: 0.74,
    evidence: [
      '42 direct transactions between addresses',
      'Counterparty in 15% of all trades',
      'Reciprocal transaction pattern observed',
    ],
  },
  {
    address: generateAddress('0x', 22),
    relationship: 'Potential alternate wallet',
    strength: 0.65,
    evidence: [
      'Similar transaction timing patterns',
      'Complementary trading strategies',
      'Never directly transacted but highly correlated',
    ],
  },
];

// Mock Address Analyses
const mockAddressAnalyses: AddressAnalysis[] = [
  {
    address: mockGraphNodes[3].address || generateAddress('0x', 3),
    correlation_analysis: 'This address shows strong correlation with 2 other whale wallets, suggesting potential coordinated activity or shared ownership.',
    behavior_patterns: [mockBehaviorPatterns[0], mockBehaviorPatterns[2]],
    risk_assessment: mockRiskAssessments[0],
    recommendations: [
      'Monitor for continued coordinated trading',
      'Set alerts for large position changes',
      'Investigate relationship with correlated addresses',
    ],
    related_addresses: [mockAddressCorrelations[0], mockAddressCorrelations[1]],
    analyzed_at: new Date().toISOString(),
  },
  {
    address: mockGraphNodes[4].address || generateAddress('0x', 4),
    correlation_analysis: 'Moderate correlation with exchange wallets. Appears to be an active trader with diverse counterparties.',
    behavior_patterns: [mockBehaviorPatterns[1]],
    risk_assessment: mockRiskAssessments[1],
    recommendations: [
      'Normal trading activity observed',
      'Continue standard monitoring',
    ],
    related_addresses: [mockAddressCorrelations[1]],
    analyzed_at: new Date().toISOString(),
  },
  {
    address: mockGraphNodes[5].address || generateAddress('0x', 5),
    correlation_analysis: 'Low correlation with other major holders. Independent trading pattern observed.',
    behavior_patterns: [mockBehaviorPatterns[2]],
    risk_assessment: mockRiskAssessments[2],
    recommendations: [
      'Healthy distribution pattern',
      'No immediate concerns identified',
    ],
    related_addresses: [],
    analyzed_at: new Date().toISOString(),
  },
];

// Mock Graph Analysis
export const mockAnalysis: GraphAnalysis = {
  token_symbol: mockTokens[0].symbol,
  token_address: mockTokens[0].contractAddress,
  chain_id: parseInt(mockTokens[0].chainId),
  centralization_score: 67,
  risk_level: 'medium',
  key_findings: [
    'Top 10 holders control 18.4% of total supply',
    'Identified 3 potential whale clusters with correlated trading patterns',
    'Exchange liquidity is well-distributed across 2 major DEXs',
    'Transaction velocity suggests healthy trading activity',
    'No significant contract risk factors detected',
  ],
  holder_analysis: mockAddressAnalyses,
  suspicious_patterns: [
    'Coordinated trading detected between Whale #1 and Whale #2',
    'Unusual funding pattern: 3 addresses received funds from same source within 48h',
    'High transaction frequency between whale addresses (possible wash trading)',
  ],
  analyzed_at: new Date().toISOString(),
};

// Export all mock data
export default {
  mockTokens,
  mockGraphNodes,
  mockGraphEdges,
  mockGraphData,
  mockAnalysis,
  mockRiskAssessments,
  mockBehaviorPatterns,
  mockAddressCorrelations,
  mockAddressAnalyses,
};
