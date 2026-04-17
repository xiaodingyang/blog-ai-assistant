import { ChatCompletionsConfig } from '@xdy-npm/blog-ai-assistant-core';

/**
 * 文章数据结构
 */
export interface Article {
  /** 文章 ID */
  id: string;
  /** 文章标题 */
  title: string;
  /** 文章内容 */
  content: string;
  /** 分类 ID */
  categoryId?: string | null;
  /** 创建时间 */
  createdAt?: Date;
  /** 更新时间 */
  updatedAt?: Date;
}

/**
 * 数据适配器接口
 */
export interface DataAdapter {
  /**
   * 根据 ID 获取文章
   * @param id 文章 ID
   * @returns 文章对象，不存在返回 null
   */
  getArticle(id: string): Promise<Article | null>;

  /**
   * 获取同分类下的其他文章
   * @param categoryId 分类 ID
   * @param excludeId 排除的文章 ID
   * @param limit 最大返回数量
   * @returns 文章数组
   */
  findRelatedArticles(
    categoryId: string,
    excludeId: string,
    limit: number
  ): Promise<Article[]>;
}

/**
 * 检索配置
 */
export interface RetrievalConfig {
  /** 返回的最大块数 */
  topK?: number;
  /** 最低匹配分数 */
  minScore?: number;
  /** 每块最大字符数 */
  chunkSize?: number;
  /** 块之间的重叠字符数 */
  overlap?: number;
}

/**
 * 分类扩展配置
 */
export interface CategoryConfig {
  /** 是否启用分类扩展 */
  enabled?: boolean;
  /** 最多检索几篇同分类文章 */
  maxDocs?: number;
  /** 无强命中时，同分类最多取几个块 */
  maxChunks?: number;
  /** 有命中时是否仍补充同分类 */
  mergeWithArticle?: boolean;
  /** 补充时最多取几个块 */
  mergedChunks?: number;
}

/**
 * 限流配置
 */
export interface RateLimitConfig {
  /** 匿名用户每小时限制 */
  anonPerHour?: number;
  /** 登录用户每小时限制 */
  userPerHour?: number;
}

/**
 * 服务配置
 */
export interface ServiceConfig {
  /** AI 配置 */
  ai: ChatCompletionsConfig;
  /** 数据适配器 */
  adapter: DataAdapter;
  /** 检索配置 */
  retrieval?: RetrievalConfig;
  /** 分类扩展配置 */
  category?: CategoryConfig;
  /** 限流配置 */
  rateLimit?: RateLimitConfig;
  /** 问题最大字符数 */
  maxQuestionLength?: number;
}

/**
 * 引用信息
 */
export interface Citation {
  /** 摘录内容 */
  excerpt: string;
  /** 文章 ID */
  articleId: string;
  /** 文章标题 */
  articleTitle: string;
  /** 来源类型 */
  source: 'current' | 'category';
}

/**
 * 问答响应
 */
export interface AskResponse {
  /** 回答内容 */
  answer: string;
  /** 引用列表 */
  citations: Citation[];
  /** 元信息 */
  meta: {
    /** 模型名称 */
    model: string;
    /** 回答模式 */
    answerMode: 'grounded' | 'freeform';
    /** 检索是否为空 */
    retrievalEmpty: boolean;
    /** 是否使用了分类扩展 */
    categoryBoostUsed: boolean;
    /** 检索详情 */
    retrieval?: {
      articleBestScore?: number;
      articleWeak?: boolean;
      categoryUsed?: boolean;
      categorySnippetCount?: number;
      categoryDocCount?: number;
    };
    /** 使用情况（开发环境） */
    usage?: any;
  };
}

/**
 * 文章问答请求
 */
export interface AskArticleRequest {
  /** 文章 ID */
  articleId: string;
  /** 用户问题 */
  question: string;
  /** 检索范围 */
  scope?: 'article' | 'article_then_category';
  /** 是否强制开启分类扩展 */
  categoryAssist?: boolean;
}

/**
 * 通用问答请求
 */
export interface AskGeneralRequest {
  /** 用户问题 */
  question: string;
}
