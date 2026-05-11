import { NextResponse } from 'next/server';
import {
  createOpenRouterClient,
  OpenRouterError,
  type OpenRouterAnalysisResponse,
  type TokenInfo,
  type HolderInfo,
} from '@/lib/ai/openrouter';
import { AnalysisCache, createCacheKey, hashHolders } from '@/lib/cache/analysis';
import type { AIAnalysisRequest, GraphAnalysis, AddressAnalysis } from '@/types';

const cache = new AnalysisCache<OpenRouterAnalysisResponse>();

function getClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey) {
    throw new OpenRouterError(
      'OpenRouter API key not configured',
      'CONFIG_ERROR',
      500
    );
  }

  if (!model) {
    throw new OpenRouterError(
      'OpenRouter model not configured',
      'CONFIG_ERROR',
      500
    );
  }

  return createOpenRouterClient({ apiKey, model });
}

function extractTokenInfo(body: AIAnalysisRequest): TokenInfo {
  return {
    name: body.token_address.slice(0, 6) + '...' + body.token_address.slice(-4),
    symbol: 'UNKNOWN',
    contractAddress: body.token_address,
  };
}

function extractHolders(body: AIAnalysisRequest): HolderInfo[] {
  return body.holder_data.map((h) => ({
    address: h.address,
    balance: h.balance,
    percentage: h.percentage,
  }));
}

function mapToGraphAnalysis(
  body: AIAnalysisRequest,
  aiResponse: OpenRouterAnalysisResponse
): GraphAnalysis {
  const holderAnalysis: AddressAnalysis[] = body.holder_data.map((holder) => ({
    address: holder.address,
    correlation_analysis: aiResponse.correlation_analysis,
    behavior_patterns: [
      {
        pattern: 'General Behavior',
        description: aiResponse.behavior_patterns,
        confidence: 0.85,
        evidence: ['AI-generated analysis'],
      },
    ],
    risk_assessment: {
      level: aiResponse.risk_assessment.level,
      score: aiResponse.risk_assessment.level === 'high' ? 80 : aiResponse.risk_assessment.level === 'medium' ? 50 : 20,
      details: aiResponse.risk_assessment.details,
      factors: ['AI analysis'],
    },
    recommendations: aiResponse.recommendations
      ? [aiResponse.recommendations]
      : ['Monitor token activity'],
    related_addresses: [],
    analyzed_at: new Date().toISOString(),
  }));

  return {
    token_symbol: extractTokenInfo(body).symbol,
    token_address: body.token_address,
    chain_id: body.chain_id,
    centralization_score: 50,
    risk_level: aiResponse.risk_assessment.level,
    key_findings: [
      aiResponse.correlation_analysis,
      aiResponse.behavior_patterns,
    ].filter(Boolean),
    holder_analysis: holderAnalysis,
    suspicious_patterns:
      aiResponse.risk_assessment.level === 'high'
        ? [aiResponse.risk_assessment.details]
        : [],
    analyzed_at: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const body: AIAnalysisRequest = await request.json();

    if (!body.token_address || !body.chain_id || !body.holder_data) {
      return NextResponse.json(
        { error: 'Missing required fields: token_address, chain_id, holder_data' },
        { status: 400 }
      );
    }

    const holders = extractHolders(body);
    const cacheKey = createCacheKey(body.token_address, hashHolders(holders));

    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(mapToGraphAnalysis(body, cached));
    }

    const client = getClient();
    const token = extractTokenInfo(body);

    const analysis = await client.analyzeHolders(token, holders);
    cache.set(cacheKey, analysis);

    return NextResponse.json(mapToGraphAnalysis(body, analysis));
  } catch (error) {
    console.error('AI analysis error:', error);

    if (error instanceof OpenRouterError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze token holders' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'AI Analysis API - Use POST with token holder data' },
    { status: 200 }
  );
}
