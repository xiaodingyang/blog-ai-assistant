/**
 * 文本分块配置
 */
export interface ChunkOptions {
  /** 每块最大字符数 */
  maxLength?: number;
  /** 块之间的重叠字符数 */
  overlap?: number;
}

/**
 * 检索配置
 */
export interface RetrievalOptions {
  /** 返回的最大块数 */
  topK?: number;
  /** 最低匹配分数 */
  minScore?: number;
}

/**
 * 文本块
 */
export interface TextChunk {
  /** 块内容 */
  text: string;
  /** 块索引 */
  index: number;
}

/**
 * 评分后的文本块
 */
export interface ScoredChunk extends TextChunk {
  /** 匹配分数 */
  score: number;
}

/**
 * 将长文本切分为可检索的段落
 * @param text 原始文本
 * @param options 分块配置
 * @returns 文本块数组
 */
export function splitContentIntoChunks(
  text: string,
  options: ChunkOptions = {}
): TextChunk[] {
  const { maxLength = 900, overlap = 100 } = options;

  const normalized = String(text || '').replace(/\r\n/g, '\n');
  const parts = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: TextChunk[] = [];
  let buf = '';

  const flush = () => {
    if (buf) {
      chunks.push({ text: buf, index: chunks.length });
      buf = '';
    }
  };

  for (const p of parts) {
    // 超长段落：滑动窗口切分
    if (p.length > maxLength) {
      flush();
      for (let i = 0; i < p.length; i += maxLength - overlap) {
        chunks.push({
          text: p.slice(i, i + maxLength),
          index: chunks.length,
        });
      }
      continue;
    }

    // 短段落：合并
    if (!buf) {
      buf = p;
    } else if (buf.length + 2 + p.length <= maxLength) {
      buf = `${buf}\n\n${p}`;
    } else {
      flush();
      buf = p;
    }
  }

  flush();

  return chunks.length ? chunks : [{ text: normalized.slice(0, maxLength) || '（正文为空）', index: 0 }];
}

/**
 * 从问题中提取关键词（中英文混合）
 * @param question 用户问题
 * @returns 关键词数组
 */
export function tokenizeQuestion(question: string): string[] {
  const s = String(question || '').trim().toLowerCase();

  // 英文单词
  const words = s.match(/[a-z0-9_]{2,}/g) || [];

  // 中文词组
  const cnSegs = s.match(/[\u4e00-\u9fa5]+/g) || [];

  // 中文二元组（bigrams）
  const bigrams: string[] = [];
  for (const seg of cnSegs) {
    for (let i = 0; i < seg.length - 1; i += 1) {
      bigrams.push(seg.slice(i, i + 2));
    }
  }

  // 原始问题片段（用于长问题）
  const extra = s.length >= 4 ? [s.slice(0, 24)] : [];

  return [...new Set([...words, ...cnSegs, ...bigrams, ...extra])].filter(Boolean);
}

/**
 * 计算文本块与关键词的匹配分数
 * @param chunk 文本块
 * @param tokens 关键词数组
 * @returns 匹配分数
 */
export function scoreChunk(chunk: string, tokens: string[]): number {
  const low = chunk.toLowerCase();
  let score = 0;

  for (const t of tokens) {
    if (t.length >= 2 && low.includes(t.toLowerCase())) {
      // 长词权重更高
      score += t.length >= 4 ? 3 : 2;
    }
  }

  return score;
}

/**
 * 从文本块中选择与问题最相关的 Top-K 块
 * @param chunks 文本块数组
 * @param question 用户问题
 * @param options 检索配置
 * @returns 选中的文本块
 */
export function pickTopChunks(
  chunks: TextChunk[],
  question: string,
  options: RetrievalOptions = {}
): ScoredChunk[] {
  const { topK = 6, minScore = 1 } = options;

  const tokens = tokenizeQuestion(question);

  // 无关键词时返回前 topK 块
  if (!tokens.length) {
    return chunks.slice(0, topK).map((chunk) => ({ ...chunk, score: 0 }));
  }

  // 计算每块的分数
  const scored: ScoredChunk[] = chunks.map((chunk) => ({
    ...chunk,
    score: scoreChunk(chunk.text, tokens),
  }));

  // 按分数降序，分数相同时保持原顺序
  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  // 优先返回有分数的块，不足时补充低分块
  const picked = scored.filter((x) => x.score >= minScore).slice(0, topK);
  const use = picked.length ? picked : scored.slice(0, topK);

  return use;
}

/**
 * 构建上下文块（用于 Prompt）
 * @param chunks 文本块数组
 * @param prefix 前缀标识（如"当前文章"）
 * @returns 格式化的上下文字符串
 */
export function buildContextBlock(chunks: TextChunk[], prefix = '摘录'): string {
  return chunks.map((chunk, i) => `【${prefix}${i + 1}】\n${chunk.text}`).join('\n\n');
}
