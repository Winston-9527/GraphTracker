export type RiskLevel = 'low' | 'medium' | 'high';

export interface OpenRouterAnalysisResponse {
  correlation_analysis: string;
  behavior_patterns: string;
  risk_assessment: {
    level: RiskLevel;
    details: string;
  };
  recommendations: string;
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: {
    type: 'json_object';
  };
}

export interface OpenRouterChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

export interface OpenRouterApiResponse {
  id: string;
  choices: OpenRouterChoice[];
  error?: {
    message: string;
    code: number;
  };
}

export interface TokenInfo {
  name: string;
  symbol: string;
  contractAddress: string;
}

export interface HolderInfo {
  address: string;
  balance: string;
  percentage: number;
}

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  endpoint?: string;
  timeout?: number;
}

const DEFAULT_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_TIMEOUT = 30000;

export function buildPrompt(token: TokenInfo, holders: HolderInfo[]): string {
  return `Analyze the following token's major holder addresses:
Token: ${token.name} (${token.symbol})
Contract Address: ${token.contractAddress}

Please analyze:
1. Correlation relationships between addresses
2. Wallet behavior patterns
3. Potential risk assessment

Data: ${JSON.stringify(holders, null, 2)}

Return in JSON format:
{
  "correlation_analysis": "string: analysis of address correlations and relationships",
  "behavior_patterns": "string: description of observed wallet behavior patterns",
  "risk_assessment": {
    "level": "low|medium|high",
    "details": "string: detailed risk explanation"
  },
  "recommendations": "string: actionable recommendations"
}`;
}

export function createOpenRouterClient(config: OpenRouterConfig) {
  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
  const timeout = config.timeout ?? DEFAULT_TIMEOUT;

  async function analyzeHolders(
    token: TokenInfo,
    holders: HolderInfo[]
  ): Promise<OpenRouterAnalysisResponse> {
    const prompt = buildPrompt(token, holders);

    const requestBody: OpenRouterRequest = {
      model: config.model,
      messages: [
        {
          role: 'system',
          content:
            'You are a blockchain security analyst. Analyze token holder data and provide structured JSON output. Be concise and factual.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
      response_format: {
        type: 'json_object',
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
          'HTTP-Referer':
            process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
          'X-Title': 'GraphTracker AI Analysis',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        throw new OpenRouterError(
          'API rate limit exceeded. Please try again later.',
          'RATE_LIMIT',
          429
        );
      }

      if (response.status === 401) {
        throw new OpenRouterError(
          'Invalid API key. Please check your OpenRouter configuration.',
          'AUTH_ERROR',
          401
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new OpenRouterError(
          `OpenRouter API error (${response.status}): ${errorText}`,
          'API_ERROR',
          response.status
        );
      }

      const data: OpenRouterApiResponse = await response.json();

      if (data.error) {
        throw new OpenRouterError(
          data.error.message,
          'API_ERROR',
          data.error.code
        );
      }

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new OpenRouterError(
          'Empty response from OpenRouter API',
          'EMPTY_RESPONSE',
          500
        );
      }

      return parseAnalysisResponse(content);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof OpenRouterError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new OpenRouterError(
          'Request timed out. Please try again.',
          'TIMEOUT',
          504
        );
      }

      throw new OpenRouterError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'UNKNOWN',
        500
      );
    }
  }

  return { analyzeHolders };
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export function parseAnalysisResponse(content: string): OpenRouterAnalysisResponse {
  const directParse = tryParseJson(content);
  if (directParse) return validateAnalysisResponse(directParse);

  const markdownParse = tryExtractMarkdownJson(content);
  if (markdownParse) return validateAnalysisResponse(markdownParse);

  const objectParse = tryExtractJsonObject(content);
  if (objectParse) return validateAnalysisResponse(objectParse);

  throw new OpenRouterError(
    'Failed to parse AI analysis response as JSON',
    'PARSE_ERROR',
    500
  );
}

function tryParseJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    return undefined;
  }
}

function tryExtractMarkdownJson(content: string): unknown {
  const match = content.match(/```json\s*([\s\S]*?)```/);
  if (!match || !match[1]) return undefined;
  try {
    return JSON.parse(match[1]);
  } catch {
    return undefined;
  }
}

function tryExtractJsonObject(content: string): unknown {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return undefined;
  try {
    return JSON.parse(match[0]);
  } catch {
    return undefined;
  }
}

function validateAnalysisResponse(
  data: unknown
): OpenRouterAnalysisResponse {
  if (!data || typeof data !== 'object') {
    throw new OpenRouterError(
      'Invalid response structure: not an object',
      'PARSE_ERROR',
      500
    );
  }

  const obj = data as Record<string, unknown>;

  const correlation_analysis =
    typeof obj.correlation_analysis === 'string'
      ? obj.correlation_analysis
      : '';
  const behavior_patterns =
    typeof obj.behavior_patterns === 'string' ? obj.behavior_patterns : '';
  const recommendations =
    typeof obj.recommendations === 'string' ? obj.recommendations : '';

  let riskLevel: RiskLevel = 'low';
  let riskDetails = '';

  if (
    obj.risk_assessment &&
    typeof obj.risk_assessment === 'object'
  ) {
    const ra = obj.risk_assessment as Record<string, unknown>;
    const level = ra.level;
    if (level === 'low' || level === 'medium' || level === 'high') {
      riskLevel = level;
    }
    riskDetails = typeof ra.details === 'string' ? ra.details : '';
  }

  return {
    correlation_analysis,
    behavior_patterns,
    risk_assessment: {
      level: riskLevel,
      details: riskDetails,
    },
    recommendations,
  };
}


