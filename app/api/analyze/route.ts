import { NextResponse } from 'next/server';
import { analyzeTokenHolders } from '@/lib/ai/analyzer';
import type { AIAnalysisRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const body: AIAnalysisRequest = await request.json();

    if (!body.token_address || !body.chain_id || !body.holder_data) {
      return NextResponse.json(
        { error: 'Missing required fields: token_address, chain_id, holder_data' },
        { status: 400 }
      );
    }

    const analysis = await analyzeTokenHolders(body);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
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
