# Blog AI Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@xdy-npm/blog-ai-assistant-core.svg)](https://www.npmjs.com/package/@xdy-npm/blog-ai-assistant-core)
[![npm downloads](https://img.shields.io/npm/dm/@xdy-npm/blog-ai-assistant-core.svg)](https://www.npmjs.com/package/@xdy-npm/blog-ai-assistant-core)
[![GitHub stars](https://img.shields.io/github/stars/xiaodingyang/blog-ai-assistant.svg?style=social)](https://github.com/xiaodingyang/blog-ai-assistant)

轻量级博客 AI 问答助手，基于 RAG（Retrieval-Augmented Generation）架构，支持文章检索和分类扩展。

> 🎯 **核心优势**：无需向量数据库，5 分钟集成，支持任意数据库和框架

## ✨ 特性

- 🚀 **即插即用**：5 分钟集成到现有博客
- 🎯 **智能检索**：基于关键词匹配和评分机制，中英文混合支持
- 🔗 **引用溯源**：回答附带原文摘录和文章链接
- 📦 **轻量级**：无需向量数据库，纯关键词检索
- 🎨 **主题定制**：支持自定义样式和配色
- 🌐 **双模式**：文章绑定问答 + 全站通用问答
- 🔄 **分类扩展**：检索不足时自动从同分类文章补充
- 🛡️ **优雅降级**：无摘录时切换为通用技术解答，不拒答

## 📦 安装

```bash
# 使用 pnpm（推荐）
pnpm add @xdy-npm/blog-ai-assistant-core @xdy-npm/blog-ai-assistant-server @xdy-npm/blog-ai-assistant-react

# 使用 npm
npm install @xdy-npm/blog-ai-assistant-core @xdy-npm/blog-ai-assistant-server @xdy-npm/blog-ai-assistant-react

# 使用 yarn
yarn add @xdy-npm/blog-ai-assistant-core @xdy-npm/blog-ai-assistant-server @xdy-npm/blog-ai-assistant-react
```

## 🚀 快速开始

### 后端集成（Express）

```javascript
const express = require('express');
const { createAiAssistantRouter } = require('@xdy-npm/blog-ai-assistant-server');

const app = express();
app.use(express.json());

// 创建 AI 助手路由
const aiRouter = createAiAssistantRouter({
  // AI 配置
  ai: {
    apiBase: process.env.AI_API_BASE,
    apiKey: process.env.AI_API_KEY,
    model: 'gpt-4o-mini',
  },
  
  // 数据适配器
  adapter: {
    // 根据 ID 获取文章
    async getArticle(id) {
      return await Article.findById(id);
    },
    
    // 获取同分类文章
    async findRelatedArticles(categoryId, excludeId, limit) {
      return await Article.find({
        category: categoryId,
        _id: { $ne: excludeId },
        status: 'published',
      })
        .limit(limit)
        .sort({ createdAt: -1 });
    },
  },
  
  // 可选：检索配置
  retrieval: {
    topK: 6,
    minScore: 1,
    chunkSize: 900,
    overlap: 100,
  },
  
  // 可选：分类扩展配置
  category: {
    enabled: true,
    maxDocs: 8,
    maxChunks: 6,
  },
});

app.use('/api/ai', aiRouter);

app.listen(3000);
```

### 前端集成（React）

```tsx
import React, { useState } from 'react';
import { AiAssistant, AiButton } from '@xdy-npm/blog-ai-assistant-react';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 悬浮按钮 */}
      <AiButton onClick={() => setOpen(true)} />

      {/* 问答弹窗 */}
      <AiAssistant
        open={open}
        onClose={() => setOpen(false)}
        config={{
          apiBase: '/api/ai',
          articleId: '507f1f77bcf86cd799439011', // 文章页传入，非文章页为 null
          articleTitle: 'React Hooks 完全指南',
          authToken: userToken, // 可选
        }}
        theme={{
          primary: '#1890ff',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 12,
        }}
      />
    </>
  );
}
```

## 📖 API 文档

### 后端 API

#### POST /api/ai/ask

文章绑定问答接口。

**请求体**：
```json
{
  "articleId": "507f1f77bcf86cd799439011",
  "question": "如何使用 React Hooks？",
  "scope": "article_then_category",
  "categoryAssist": false
}
```

**响应**：
```json
{
  "code": 0,
  "data": {
    "answer": "React Hooks 是 React 16.8 引入的新特性...",
    "citations": [
      {
        "excerpt": "useState 是最常用的 Hook...",
        "articleId": "507f1f77bcf86cd799439011",
        "articleTitle": "React Hooks 完全指南",
        "source": "current"
      }
    ],
    "meta": {
      "model": "gpt-4o-mini",
      "answerMode": "grounded",
      "retrievalEmpty": false,
      "categoryBoostUsed": false
    }
  }
}
```

#### POST /api/ai/chat

全站通用问答接口。

**请求体**：
```json
{
  "question": "什么是闭包？"
}
```

### 配置选项

#### ServiceConfig

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ai` | `ChatCompletionsConfig` | ✅ | AI 配置 |
| `adapter` | `DataAdapter` | ✅ | 数据适配器 |
| `retrieval` | `RetrievalConfig` | ❌ | 检索配置 |
| `category` | `CategoryConfig` | ❌ | 分类扩展配置 |
| `rateLimit` | `RateLimitConfig` | ❌ | 限流配置 |
| `maxQuestionLength` | `number` | ❌ | 问题最大长度（默认 800） |

#### ChatCompletionsConfig

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `apiBase` | `string` | ✅ | API Base URL |
| `apiKey` | `string` | ✅ | API Key |
| `model` | `string` | ✅ | 模型名称 |
| `temperature` | `number` | ❌ | 温度参数（默认 0.25） |
| `maxTokens` | `number` | ❌ | 最大 token 数（默认 2048） |
| `timeout` | `number` | ❌ | 超时时间（默认 90000ms） |

#### DataAdapter

```typescript
interface DataAdapter {
  getArticle(id: string): Promise<Article | null>;
  findRelatedArticles(categoryId: string, excludeId: string, limit: number): Promise<Article[]>;
}
```

## 🎨 自定义样式

React 组件支持主题定制：

```tsx
<AiAssistant
  theme={{
    primary: '#1890ff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 12,
  }}
/>
```

## 🔧 高级用法

### 仅使用核心逻辑

如果你想自己实现 API 和 UI，可以只使用 `@xdy-npm/blog-ai-assistant-core`：

```typescript
import {
  splitContentIntoChunks,
  tokenizeQuestion,
  scoreChunk,
  pickTopChunks,
  callChatCompletions,
  parseModelJson,
} from '@xdy-npm/blog-ai-assistant-core';

// 1. 文本分块
const chunks = splitContentIntoChunks(article.content, {
  maxLength: 900,
  overlap: 100,
});

// 2. 关键词提取
const tokens = tokenizeQuestion(question);

// 3. 选择 Top-K 块
const topChunks = pickTopChunks(chunks, question, {
  topK: 6,
  minScore: 1,
});

// 4. 调用 AI
const { content } = await callChatCompletions(
  [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
  {
    apiBase: 'https://api.openai.com',
    apiKey: 'sk-xxx',
    model: 'gpt-4o-mini',
  }
);

// 5. 解析响应
const parsed = parseModelJson(content);
```

### 自定义数据适配器

适配不同的数据库和 ORM：

```typescript
// MongoDB + Mongoose
const adapter = {
  async getArticle(id) {
    return await Article.findById(id).lean();
  },
  async findRelatedArticles(categoryId, excludeId, limit) {
    return await Article.find({
      category: categoryId,
      _id: { $ne: excludeId },
    }).limit(limit).lean();
  },
};

// PostgreSQL + Prisma
const adapter = {
  async getArticle(id) {
    return await prisma.article.findUnique({ where: { id } });
  },
  async findRelatedArticles(categoryId, excludeId, limit) {
    return await prisma.article.findMany({
      where: {
        categoryId,
        id: { not: excludeId },
      },
      take: limit,
    });
  },
};
```

## 📚 示例项目

查看 [examples](./examples) 目录获取完整示例：

- [Express + MongoDB](./examples/express-mongodb)
- [Next.js](./examples/nextjs)
- [Docusaurus](./examples/docusaurus)

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

[MIT](./LICENSE)

## 🙏 致谢

本项目灵感来源于实际博客开发中的需求，感谢所有贡献者和使用者的支持。

## 📮 联系方式

- GitHub Issues: [https://github.com/xiaodingyang/blog-ai-assistant/issues](https://github.com/xiaodingyang/blog-ai-assistant/issues)
- Email: your.email@example.com

---

**Star ⭐ 本项目以支持开发！**
