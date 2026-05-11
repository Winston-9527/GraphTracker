import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockAnalyzeHolders = vi.fn();
const mockCacheGet = vi.fn();
const mockCacheSet = vi.fn();

vi.doMock('@/lib/ai/openrouter', () => ({
  createOpenRouterClient: vi.fn(() => ({
    analyzeHolders: mockAnalyzeHolders,
  })),
  OpenRouterError: class OpenRouterError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode: number
    ) {
      super(message);
      this.name = 'OpenRouterError';
    }
  },
}));

vi.doMock('@/lib/cache/analysis', () => ({
  AnalysisCache: vi.fn().mockImplementation(function () {
    return {
      get: mockCacheGet,
      set: mockCacheSet,
    };
  }),
  createCacheKey: vi.fn((tokenId: string, hash: string) => `${tokenId}::${hash}`),
  hashHolders: vi.fn(() => 'testhash'),
}));

const { POST, GET } = await import('../../app/api/analyze/route');

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockAnalyzeHolders.mockReset();
    mockCacheGet.mockReset();
    mockCacheSet.mockReset();
    process.env.OPENROUTER_API_KEY = 'test-key';
    process.env.OPENROUTER_MODEL = 'test-model';
  });

  it('returns 400 when required fields are missing', async () => {
    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ token_address: '0x123' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('Missing required fields');
  });

  it('returns analysis result on valid request', async () => {
    mockAnalyzeHolders.mockResolvedValue({
      correlation_analysis: 'Test correlation',
      behavior_patterns: 'Test behavior',
      risk_assessment: { level: 'medium', details: 'Test risk' },
      recommendations: 'Test recommendation',
    });

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        token_address: '0x1234567890abcdef',
        chain_id: 56,
        holder_data: [
          { address: '0xAAA', balance: '1000', percentage: 10 },
        ],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.token_address).toBe('0x1234567890abcdef');
    expect(body.chain_id).toBe(56);
    expect(body.risk_level).toBe('medium');
    expect(body.holder_analysis).toBeInstanceOf(Array);
    expect(body.holder_analysis.length).toBe(1);
  });

  it('returns cached result when available', async () => {
    mockCacheGet.mockReturnValue({
      correlation_analysis: 'Cached correlation',
      behavior_patterns: 'Cached behavior',
      risk_assessment: { level: 'low', details: 'Cached risk' },
      recommendations: 'Cached recommendation',
    });

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        token_address: '0x1234567890abcdef',
        chain_id: 56,
        holder_data: [
          { address: '0xAAA', balance: '1000', percentage: 10 },
        ],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.risk_level).toBe('low');
    expect(mockAnalyzeHolders).not.toHaveBeenCalled();
  });

  it('returns 500 when OpenRouter API key is missing', async () => {
    delete process.env.OPENROUTER_API_KEY;

    const request = new Request('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        token_address: '0x123',
        chain_id: 56,
        holder_data: [{ address: '0xAAA', balance: '100', percentage: 1 }],
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error).toContain('API key not configured');
  });
});

describe('GET /api/analyze', () => {
  it('returns usage message', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.message).toContain('Use POST');
  });
});
