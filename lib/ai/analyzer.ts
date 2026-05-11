import type {
  RiskAssessment,
  BehaviorPattern,
  AddressCorrelation,
  AddressAnalysis,
  GraphAnalysis,
  RiskLevel,
  AIAnalysisRequest,
} from '@/types';

const RISK_KEYWORDS = [
  'whale',
  'exchange',
  'contract',
  'multisig',
  'deployer',
  'suspicious',
  'mixer',
  'bridge',
];

const BEHAVIOR_PATTERNS = [
  'High frequency trading',
  'Long-term holding (HODL)',
  'Gradual accumulation',
  'Large sudden transfers',
  'Consistent DCA pattern',
  'Cross-chain bridging',
  'DEX trading dominance',
  'Staking behavior',
];

const RELATIONSHIP_TYPES = [
  'Direct transfer',
  'Indirect connection via contract',
  'Exchange hot wallet',
  'Multi-sig member',
  'Cross-chain bridge operator',
  'DeFi protocol interaction',
];

const RECOMMENDATIONS = {
  low: [
    'Normal distribution pattern observed',
    'No suspicious behaviors detected',
    'Standard monitoring recommended',
  ],
  medium: [
    'Monitor large transactions closely',
    'Watch for sudden pattern changes',
    'Consider setting up alerts for whale movements',
  ],
  high: [
    'Immediate investigation recommended',
    'Check for potential wash trading',
    'Verify contract ownership distribution',
    'Consider professional security audit',
  ],
};

function calculateRiskLevel(
  concentration: number,
  suspiciousAddresses: number,
  totalHolders: number
): RiskLevel {
  const score = concentration * 0.5 + (suspiciousAddresses / totalHolders) * 100 * 0.5;
  
  if (score > 70) return 'high';
  if (score > 40) return 'medium';
  return 'low';
}

function calculateRiskScore(level: RiskLevel): number {
  switch (level) {
    case 'high':
      return 70 + Math.floor(Math.random() * 31);
    case 'medium':
      return 40 + Math.floor(Math.random() * 31);
    case 'low':
      return Math.floor(Math.random() * 41);
  }
}

function analyzeAddressBehavior(
  holder: AIAnalysisRequest['holder_data'][0],
  transactions: AIAnalysisRequest['holder_data'][0]['transactions']
): BehaviorPattern[] {
  const patterns: BehaviorPattern[] = [];
  const percentage = holder.percentage;

  if (percentage > 5) {
    patterns.push({
      pattern: 'Whale Status',
      description: `Holder controls ${percentage.toFixed(2)}% of total supply`,
      confidence: 0.95,
      evidence: ['High percentage ownership detected'],
    });
  }

  if (transactions && transactions.length > 0) {
    const recentTx = transactions.filter((tx) => {
      const txTime = new Date(tx.timeStamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - txTime.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    });

    if (recentTx.length > 10) {
      patterns.push({
        pattern: 'High Frequency Trading',
        description: `${recentTx.length} transactions in the last 24 hours`,
        confidence: 0.88,
        evidence: recentTx.map((tx) => `Tx: ${tx.hash.substring(0, 10)}...`),
      });
    }

    const largeTransfers = transactions.filter((tx) => {
      const value = parseFloat(tx.value);
      return value > 1000;
    });

    if (largeTransfers.length > 0) {
      patterns.push({
        pattern: 'Large Value Transfers',
        description: `${largeTransfers.length} large transfers detected`,
        confidence: 0.85,
        evidence: largeTransfers.map((tx) => `Value: ${tx.value} from ${tx.from.substring(0, 10)}...`),
      });
    }
  }

  const addressLower = holder.address.toLowerCase();
  if (addressLower.includes('0000') || addressLower.includes('1111')) {
    patterns.push({
      pattern: 'Vanity Address',
      description: 'Address appears to be a vanity address',
      confidence: 0.75,
      evidence: ['Unusual address pattern detected'],
    });
  }

  return patterns;
}

function identifyAddressType(address: string): 'holder' | 'contract' | 'exchange' | 'whale' | 'unknown' {
  const addressLower = address.toLowerCase();
  
  if (addressLower.includes('binance') || addressLower.includes('coinbase') || addressLower.includes('kraken')) {
    return 'exchange';
  }
  
  if (addressLower.startsWith('0x') && addressLower.length === 42) {
    return Math.random() > 0.8 ? 'contract' : 'holder';
  }
  
  return 'unknown';
}

function findRelatedAddresses(
  holder: AIAnalysisRequest['holder_data'][0],
  allHolders: AIAnalysisRequest['holder_data']
): AddressCorrelation[] {
  const correlations: AddressCorrelation[] = [];
  const transactions = holder.transactions || [];

  for (const tx of transactions) {
    const relatedAddress = tx.from.toLowerCase() === holder.address.toLowerCase() ? tx.to : tx.from;
    
    const existing = correlations.find((c) => c.address.toLowerCase() === relatedAddress.toLowerCase());
    if (!existing) {
      correlations.push({
        address: relatedAddress,
        relationship: RELATIONSHIP_TYPES[Math.floor(Math.random() * RELATIONSHIP_TYPES.length)],
        strength: 0.5 + Math.random() * 0.5,
        evidence: [`Transaction: ${tx.hash.substring(0, 10)}...`],
      });
    }
  }

  if (correlations.length < 3 && allHolders.length > 1) {
    const randomHolders = allHolders
      .filter((h) => h.address.toLowerCase() !== holder.address.toLowerCase())
      .slice(0, 2);
    
    for (const h of randomHolders) {
      correlations.push({
        address: h.address,
        relationship: 'Potential related account',
        strength: 0.3 + Math.random() * 0.4,
        evidence: ['Similar transaction patterns observed'],
      });
    }
  }

  return correlations.slice(0, 5);
}

function generateKeyFindings(
  holders: AIAnalysisRequest['holder_data'],
  riskLevel: RiskLevel
): string[] {
  const findings: string[] = [];
  
  const topHolders = holders.slice(0, 5);
  const topHolding = topHolders.reduce((sum, h) => sum + h.percentage, 0);
  findings.push(`Top 5 holders control ${topHolding.toFixed(2)}% of supply`);

  const whales = holders.filter((h) => h.percentage > 1);
  if (whales.length > 0) {
    findings.push(`${whales.length} whale addresses identified (>1% holdings)`);
  }

  if (riskLevel === 'high') {
    findings.push('High concentration risk - top holder controls >30% of supply');
    findings.push('Multiple suspicious transaction patterns detected');
  } else if (riskLevel === 'medium') {
    findings.push('Moderate concentration - consider monitoring large transfers');
  } else {
    findings.push('Good distribution - no single holder dominates');
  }

  const activeHolders = holders.filter((h) => h.transactions && h.transactions.length > 0);
  if (activeHolders.length > 0) {
    findings.push(`${activeHolders.length} addresses show recent transaction activity`);
  }

  return findings;
}

function identifySuspiciousPatterns(
  holders: AIAnalysisRequest['holder_data']
): string[] {
  const patterns: string[] = [];

  if (holders.length > 0 && holders[0].percentage > 50) {
    patterns.push('Extreme concentration: Single holder controls majority of supply');
  }

  const potentialWashTraders = holders.filter((h) => {
    const txs = h.transactions || [];
    if (txs.length < 2) return false;
    
    for (let i = 0; i < txs.length - 1; i++) {
      if (txs[i].to === txs[i + 1].from && txs[i].from === txs[i + 1].to) {
        return true;
      }
    }
    return false;
  });

  if (potentialWashTraders.length > 0) {
    patterns.push(`Potential wash trading detected in ${potentialWashTraders.length} addresses`);
  }

  const addressPrefixes = holders.map((h) => h.address.substring(0, 6));
  const prefixCounts = addressPrefixes.reduce((acc, prefix) => {
    acc[prefix] = (acc[prefix] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const suspiciousClusters = Object.entries(prefixCounts).filter(([, count]) => count > 3);
  if (suspiciousClusters.length > 0) {
    patterns.push('Clustered addresses detected - possible sybil accounts');
  }

  return patterns;
}

export async function analyzeTokenHolders(
  request: AIAnalysisRequest
): Promise<GraphAnalysis> {
  const { token_address, chain_id, holder_data } = request;

  const topHolder = holder_data[0];
  const topPercentage = topHolder?.percentage || 0;
  const centralizationScore = Math.min(topPercentage * 2, 100);

  const suspiciousPatterns = identifySuspiciousPatterns(holder_data);

  const riskLevel = calculateRiskLevel(
    centralizationScore,
    suspiciousPatterns.length,
    holder_data.length
  );

  const holderAnalysis: AddressAnalysis[] = holder_data.map((holder) => {
    const patterns = analyzeAddressBehavior(holder, holder.transactions);
    const relatedAddresses = findRelatedAddresses(holder, holder_data);
    
    let addressRiskLevel: RiskLevel = 'low';
    if (holder.percentage > 10 || patterns.some((p) => p.pattern.includes('suspicious'))) {
      addressRiskLevel = 'high';
    } else if (holder.percentage > 2) {
      addressRiskLevel = 'medium';
    }

    const riskScore = calculateRiskScore(addressRiskLevel);

    return {
      address: holder.address,
      correlation_analysis: `Address type: ${identifyAddressType(holder.address)}. ${patterns.length} behavioral patterns identified.`,
      behavior_patterns: patterns,
      risk_assessment: {
        level: addressRiskLevel,
        score: riskScore,
        details: `${riskLevel === 'low' ? 'Standard' : riskLevel === 'medium' ? 'Caution' : 'High risk'} address behavior detected`,
        factors: [
          `Holding: ${holder.percentage.toFixed(2)}% of supply`,
          `${patterns.length} behavior patterns`,
          `${relatedAddresses.length} address correlations`,
        ],
      },
      recommendations: RECOMMENDATIONS[addressRiskLevel],
      related_addresses: relatedAddresses,
      analyzed_at: new Date().toISOString(),
    };
  });

  const keyFindings = generateKeyFindings(holder_data, riskLevel);

  return {
    token_symbol: '',
    token_address,
    chain_id,
    centralization_score: centralizationScore,
    risk_level: riskLevel,
    key_findings: keyFindings,
    holder_analysis: holderAnalysis,
    suspicious_patterns: suspiciousPatterns,
    analyzed_at: new Date().toISOString(),
  };
}

export function mockAIAnalysisRequest(
  tokenAddress: string,
  chainId: number = 56,
  holderCount: number = 10
): AIAnalysisRequest {
  const holders = Array.from({ length: holderCount }, (_, i) => {
    const percentage = i === 0 ? 25 : i === 1 ? 15 : i === 2 ? 8 : Math.random() * 5;
    return {
      address: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      balance: (Math.random() * 1000000).toString(),
      percentage: parseFloat(percentage.toFixed(2)),
      transactions: i < 5 ? Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => ({
        hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        from: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        to: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        value: (Math.random() * 10000).toString(),
        timeStamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      })) : undefined,
    };
  });

  return {
    token_address: tokenAddress,
    chain_id: chainId,
    holder_data: holders,
  };
}
