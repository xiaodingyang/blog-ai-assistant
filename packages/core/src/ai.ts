/**
 * OpenAI 兼容的 Chat Completions 配置
 */
export interface ChatCompletionsConfig {
  /** API Base URL */
  apiBase: string;
  /** API Key */
  apiKey: string;
  /** 模型名称 */
  model: string;
  /** 温度参数 */
  temperature?: number;
  /** 最大 token 数 */
  maxTokens?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * Chat 消息
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Chat Completions 响应
 */
export interface ChatCompletionsResponse {
  /** 模型返回的内容 */
  content: string;
  /** 使用情况（可选） */
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * 构建 Chat Completions URL
 */
function chatCompletionsUrl(baseRaw: string): string {
  const base = String(baseRaw || '').replace(/\/+$/, '');
  if (!base) return '';
  if (base.endsWith('/v1')) return `${base}/chat/completions`;
  return `${base}/v1/chat/completions`;
}

/**
 * 调用 OpenAI 兼容的 Chat Completions API
 * @param messages 消息数组
 * @param config 配置
 * @returns 响应内容
 */
export async function callChatCompletions(
  messages: ChatMessage[],
  config: ChatCompletionsConfig
): Promise<ChatCompletionsResponse> {
  const {
    apiBase,
    apiKey,
    model,
    temperature = 0.25,
    maxTokens = 2048,
    timeout = 90000,
  } = config;

  if (!apiKey || !apiBase || !model) {
    throw new Error('AI configuration incomplete: apiBase, apiKey, and model are required');
  }

  const url = chatCompletionsUrl(apiBase);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });
  } catch (err: any) {
    throw new Error(
      err.name === 'AbortError' ? 'Request timeout' : `Request failed: ${err.message}`
    );
  } finally {
    clearTimeout(timer);
  }

  const raw = await res.text();
  let json: any;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON response from API');
  }

  if (!res.ok) {
    const msg = json.error?.message || json.message || raw.slice(0, 200);
    throw new Error(`API error: ${msg}`);
  }

  const content = json.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('Empty or invalid content in API response');
  }

  return {
    content,
    usage: json.usage || undefined,
  };
}
