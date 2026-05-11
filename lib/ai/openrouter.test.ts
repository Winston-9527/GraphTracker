import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createOpenRouterClient,
  parseAnalysisResponse,
  OpenRouterError,
  buildPrompt,
} from './openrouter';

describe('buildPrompt', () => {
  it('includes token name, symbol and contract address', () => {
    const token = {
      name: 'TestToken',
      symbol: 'TEST',
      contractAddress: '0x1234567890abcdef',
    };
    const holders = [
      { address: '0xaaa', balance: '1000', percentage: 10 },
    ];

    const prompt = buildPrompt(token, holders);

    expect(prompt).toContain('TestToken');
    expect(prompt).toContain('TEST');
    expect(prompt).toContain('0x1234567890abcdef');
    expect(prompt).toContain('0xaaa');
  });

  it('stringifies holder data', () => {
    const token = {
      name: 'T',
      symbol: 'T',
      contractAddress: '0x1',
    };
    const holders = [
      { address: '0xA', balance: '500', percentage: 5 },
      { address: '0xB', balance: '300', percentage: 3 },
    ];

    const prompt = buildPrompt(token, holders);

    expect(prompt).toContain('"address": "0xA"');
    expect(prompt).toContain('"address": "0xB"');
  });
});

describe('parseAnalysisResponse', () => {
  it('parses direct JSON response', () => {
    const content = JSON.stringify({
      correlation_analysis: 'Strong correlation found',
      behavior_patterns: 'Holding pattern',
      risk_assessment: { level: 'medium', details: 'Some risk' },
      recommendations: 'Monitor closely',
    });

    const result = parseAnalysisResponse(content);

    expect(result.correlation_analysis).toBe('Strong correlation found');
    expect(result.risk_assessment.level).toBe('medium');
    expect(result.recommendations).toBe('Monitor closely');
  });

  it('parses JSON wrapped in markdown code block', () => {
    const content = '```json\n{"correlation_analysis":"A","behavior_patterns":"B","risk_assessment":{"level":"low","details":"C"},"recommendations":"D"}\n```';

    const result = parseAnalysisResponse(content);

    expect(result.correlation_analysis).toBe('A');
    expect(result.risk_assessment.level).toBe('low');
  });

  it('parses JSON embedded in text', () => {
    const content = 'Here is the analysis: {"correlation_analysis":"X","behavior_patterns":"Y","risk_assessment":{"level":"high","details":"Z"},"recommendations":"W"}';

    const result = parseAnalysisResponse(content);

    expect(result.correlation_analysis).toBe('X');
    expect(result.risk_assessment.level).toBe('high');
  });

  it('throws on unparseable content', () => {
    expect(() => parseAnalysisResponse('not json')).toThrow(OpenRouterError);
  });

  it('defaults missing fields to empty strings and low risk', () => {
    const content = JSON.stringify({});

    const result = parseAnalysisResponse(content);

    expect(result.correlation_analysis).toBe('');
    expect(result.behavior_patterns).toBe('');
    expect(result.risk_assessment.level).toBe('low');
    expect(result.risk_assessment.details).toBe('');
    expect(result.recommendations).toBe('');
  });

  it('validates risk level to only allow low, medium, high', () => {
    const content = JSON.stringify({
      correlation_analysis: '',
      behavior_patterns: '',
      risk_assessment: { level: 'extreme', details: '' },
      recommendations: '',
    });

    const result = parseAnalysisResponse(content);

    expect(result.risk_assessment.level).toBe('low');
  });
});

describe('createOpenRouterClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns analysis on successful API call', async () => {
    const mockResponse = {
      id: 'test-id',
      choices: [
        {
          message: {
            role: 'assistant',
            content: JSON.stringify({
              correlation_analysis: 'Test correlation',
              behavior_patterns: 'Test behavior',
              risk_assessment: { level: 'low', details: 'Safe' },
              recommendations: 'Hold',
            }),
          },
          finish_reason: 'stop',
        },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    }));

    const client = createOpenRouterClient({
      apiKey: 'test-key',
      model: 'test-model',
    });

    const result = await client.analyzeHolders(
      { name: 'Token', symbol: 'TKN', contractAddress: '0x1' },
      [{ address: '0xA', balance: '100', percentage: 10 }]
    );

    expect(result.correlation_analysis).toBe('Test correlation');
    expect(result.risk_assessment.level).toBe('low');
  });

  it('throws RATE_LIMIT error on 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'Too many requests',
    }));

    const client = createOpenRouterClient({
      apiKey: 'test-key',
      model: 'test-model',
    });

    await expect(
      client.analyzeHolders(
        { name: 'T', symbol: 'T', contractAddress: '0x1' },
        []
      )
    ).rejects.toSatisfy((err: Error) => {
      expect(err).toBeInstanceOf(OpenRouterError);
      expect((err as OpenRouterError).code).toBe('RATE_LIMIT');
      expect((err as OpenRouterError).statusCode).toBe(429);
      return true;
    });
  });

  it('throws AUTH_ERROR on 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    }));

    const client = createOpenRouterClient({
      apiKey: 'bad-key',
      model: 'test-model',
    });

    await expect(
      client.analyzeHolders(
        { name: 'T', symbol: 'T', contractAddress: '0x1' },
        []
      )
    ).rejects.toSatisfy((err: Error) => {
      expect(err).toBeInstanceOf(OpenRouterError);
      expect((err as OpenRouterError).code).toBe('AUTH_ERROR');
      expect((err as OpenRouterError).statusCode).toBe(401);
      return true;
    });
  });

  it('throws TIMEOUT on AbortError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    }));

    const client = createOpenRouterClient({
      apiKey: 'test-key',
      model: 'test-model',
      timeout: 10,
    });

    await expect(
      client.analyzeHolders(
        { name: 'T', symbol: 'T', contractAddress: '0x1' },
        []
      )
    ).rejects.toSatisfy((err: Error) => {
      expect(err).toBeInstanceOf(OpenRouterError);
      expect((err as OpenRouterError).code).toBe('TIMEOUT');
      return true;
    });
  });

  it('throws EMPTY_RESPONSE when choices are empty', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'test', choices: [] }),
    }));

    const client = createOpenRouterClient({
      apiKey: 'test-key',
      model: 'test-model',
    });

    await expect(
      client.analyzeHolders(
        { name: 'T', symbol: 'T', contractAddress: '0x1' },
        []
      )
    ).rejects.toSatisfy((err: Error) => {
      expect(err).toBeInstanceOf(OpenRouterError);
      expect((err as OpenRouterError).code).toBe('EMPTY_RESPONSE');
      return true;
    });
  });
});
