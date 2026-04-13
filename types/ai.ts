// AI Analysis Types

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 0-100
  details: string;
  factors: string[];
}

export interface BehaviorPattern {
  pattern: string;
  description: string;
  confidence: number;
  evidence: string[];
}

export interface AddressCorrelation {
  address: string;
  relationship: string;
  strength: number; // 0-1
  evidence: string[];
}

export interface AddressAnalysis {
  address: string;
  correlation_analysis: string;
  behavior_patterns: BehaviorPattern[];
  risk_assessment: RiskAssessment;
  recommendations: string[];
  related_addresses: AddressCorrelation[];
  analyzed_at: string;
}

export interface GraphAnalysis {
  token_symbol: string;
  token_address: string;
  chain_id: number;
  centralization_score: number; // 0-100
  risk_level: RiskLevel;
  key_findings: string[];
  holder_analysis: AddressAnalysis[];
  suspicious_patterns: string[];
  analyzed_at: string;
}

export interface AIAnalysisRequest {
  token_address: string;
  chain_id: number;
  holder_data: {
    address: string;
    balance: string;
    percentage: number;
    transactions?: {
      hash: string;
      from: string;
      to: string;
      value: string;
      timeStamp: string;
    }[];
  }[];
}
