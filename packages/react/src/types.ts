/**
 * AI 助手配置
 */
export interface AiAssistantConfig {
  /** API Base URL */
  apiBase: string;
  /** 文章 ID（可选，文章页传入） */
  articleId?: string | null;
  /** 文章标题（可选） */
  articleTitle?: string | null;
  /** 认证 token（可选） */
  authToken?: string | null;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 主色调 */
  primary?: string;
  /** 渐变色 */
  gradient?: string;
  /** 圆角大小 */
  borderRadius?: number;
}

/**
 * 引用信息
 */
export interface Citation {
  excerpt: string;
  articleId: string;
  articleTitle?: string;
  source?: 'current' | 'category';
}

/**
 * 问答响应
 */
export interface AskResponse {
  answer: string;
  citations: Citation[];
  meta: {
    model?: string;
    answerMode?: 'grounded' | 'freeform';
    retrievalEmpty?: boolean;
    categoryBoostUsed?: boolean;
    retrieval?: {
      articleBestScore?: number;
      articleWeak?: boolean;
      categoryUsed?: boolean;
      categorySnippetCount?: number;
      categoryDocCount?: number;
    };
    usage?: unknown;
  };
}
