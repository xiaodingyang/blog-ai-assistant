/**
 * 归一化 JSON 中的引号（处理中文引号）
 */
function normalizeJsonishQuotes(s: string): string {
  return String(s || '')
    .replace(/[\u201c\u201d\u00ab\u00bb]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

/**
 * 从混合文本中提取第一个花括号平衡的 JSON 子串
 */
function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start < 0) return null;

  let depth = 0;
  let inStr = false;
  let esc = false;

  for (let i = start; i < text.length; i += 1) {
    const c = text[i];

    if (inStr) {
      if (esc) {
        esc = false;
      } else if (c === '\\') {
        esc = true;
      } else if (c === '"') {
        inStr = false;
      }
      continue;
    }

    if (c === '"') {
      inStr = true;
      continue;
    }

    if (c === '{') depth += 1;
    else if (c === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return null;
}

/**
 * 解析模型返回的 JSON（支持多种格式）
 * @param content 模型返回的原始内容
 * @returns 解析后的对象，失败返回 null
 */
export function parseModelJson<T = any>(content: string): T | null {
  if (content == null || typeof content !== 'string') return null;

  const trimmed = content.trim();

  const tryParse = (s: string): any => {
    try {
      return JSON.parse(normalizeJsonishQuotes(s));
    } catch {
      return null;
    }
  };

  // 1. 直接解析
  let parsed = tryParse(trimmed);
  if (parsed) return parsed;

  // 2. 提取 ```json 代码块
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    const inner = fence[1].trim();
    parsed = tryParse(inner);
    if (parsed) return parsed;

    const blob = extractBalancedJsonObject(inner);
    if (blob) {
      parsed = tryParse(blob);
      if (parsed) return parsed;
    }
  }

  // 3. 提取花括号平衡的 JSON
  const blob = extractBalancedJsonObject(trimmed);
  if (blob) {
    parsed = tryParse(blob);
    if (parsed) return parsed;
  }

  return null;
}

/**
 * 当 JSON 解析失败且无摘录时，将整段当作纯文本回答
 */
export function coercePlainAnswer(content: string): string | null {
  if (!content || typeof content !== 'string') return null;

  let t = content.trim();

  // 去掉单层代码围栏
  const fenced = t.match(/^```(?:markdown|md|text)?\s*\n?([\s\S]*?)\n?```\s*$/i);
  if (fenced) {
    t = fenced[1].trim();
  } else {
    const fenceAny = t.match(/^```\s*\n?([\s\S]*?)\n?```\s*$/);
    if (fenceAny) t = fenceAny[1].trim();
  }

  if (t.length < 2) return null;
  return t;
}
