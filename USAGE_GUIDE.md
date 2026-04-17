# 使用指南

本指南将帮助你在 5 分钟内将 Blog AI Assistant 集成到你的博客项目中。

## 📋 前置要求

- Node.js >= 16
- 一个支持 OpenAI API 格式的 AI 服务（OpenAI、Azure OpenAI、或其他兼容服务）
- 现有的博客项目（Express、Next.js、Nuxt.js 等）

## 🚀 快速开始

### 步骤 1：安装依赖

```bash
npm install @xdy-npm/blog-ai-assistant-core @xdy-npm/blog-ai-assistant-server @xdy-npm/blog-ai-assistant-react
```

### 步骤 2：配置环境变量

在项目根目录创建 `.env` 文件：

```env
AI_API_BASE=https://api.openai.com/v1
AI_API_KEY=sk-your-api-key-here
AI_MODEL=gpt-4o-mini
```

### 步骤 3：后端集成

#### Express 示例

```javascript
const express = require('express');
const { createAiAssistantRouter } = require('@xdy-npm/blog-ai-assistant-server');
require('dotenv').config();

const app = express();
app.use(express.json());

// 创建 AI 助手路由
const aiRouter = createAiAssistantRouter({
  ai: {
    apiBase: process.env.AI_API_BASE,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },
  adapter: {
    // 根据 ID 获取文章
    async getArticle(id) {
      // 从你的数据库获取文章
      // 示例：MongoDB
      return await Article.findById(id);
      
      // 示例：PostgreSQL + Prisma
      // return await prisma.article.findUnique({ where: { id } });
      
      // 示例：MySQL
      // const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);
      // return rows[0];
    },
    
    // 获取同分类文章（用于分类扩展）
    async findRelatedArticles(categoryId, excludeId, limit) {
      // 从你的数据库获取同分类文章
      // 示例：MongoDB
      return await Article.find({
        category: categoryId,
        _id: { $ne: excludeId },
        status: 'published',
      })
        .limit(limit)
        .sort({ createdAt: -1 });
      
      // 示例：PostgreSQL + Prisma
      // return await prisma.article.findMany({
      //   where: { categoryId, id: { not: excludeId }, status: 'published' },
      //   take: limit,
      //   orderBy: { createdAt: 'desc' },
      // });
    },
  },
});

app.use('/api/ai', aiRouter);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

#### Next.js API Route 示例

创建 `pages/api/ai/[...path].js`：

```javascript
import { createAiAssistantRouter } from '@xdy-npm/blog-ai-assistant-server';
import { prisma } from '@/lib/prisma';

const aiRouter = createAiAssistantRouter({
  ai: {
    apiBase: process.env.AI_API_BASE,
    apiKey: process.env.AI_API_KEY,
    model: 'gpt-4o-mini',
  },
  adapter: {
    async getArticle(id) {
      return await prisma.article.findUnique({ where: { id } });
    },
    async findRelatedArticles(categoryId, excludeId, limit) {
      return await prisma.article.findMany({
        where: { categoryId, id: { not: excludeId } },
        take: limit,
      });
    },
  },
});

export default aiRouter;
```

### 步骤 4：前端集成

#### React 示例

```tsx
import React, { useState } from 'react';
import { AiAssistant, AiButton } from '@xdy-npm/blog-ai-assistant-react';

function BlogPost({ article }) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div>
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
      
      {/* AI 助手悬浮按钮 */}
      <AiButton onClick={() => setAiOpen(true)} />
      
      {/* AI 问答弹窗 */}
      <AiAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        config={{
          apiBase: '/api/ai',
          articleId: article.id,
          articleTitle: article.title,
        }}
        theme={{
          primary: '#1890ff',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      />
    </div>
  );
}
```

#### Vue 3 示例

```vue
<template>
  <div>
    <h1>{{ article.title }}</h1>
    <div v-html="article.content"></div>
    
    <!-- 使用 React 组件需要通过 wrapper -->
    <div ref="aiContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createRoot } from 'react-dom/client';
import { AiAssistant, AiButton } from '@xdy-npm/blog-ai-assistant-react';

const props = defineProps(['article']);
const aiContainer = ref(null);

onMounted(() => {
  // 在 Vue 中渲染 React 组件
  const root = createRoot(aiContainer.value);
  root.render(
    <AiButton onClick={() => {/* 打开弹窗 */}} />
  );
});
</script>
```

## 🎨 自定义样式

### 主题配置

```tsx
<AiAssistant
  theme={{
    primary: '#1890ff',           // 主色调
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 渐变色
    borderRadius: 12,             // 圆角大小
  }}
/>
```

### 自定义 CSS

```css
/* 覆盖默认样式 */
.ai-assistant-button {
  bottom: 80px !important;
  right: 20px !important;
}

.ai-assistant-modal {
  max-width: 600px !important;
}
```

## ⚙️ 高级配置

### 检索配置

```javascript
createAiAssistantRouter({
  // ...其他配置
  retrieval: {
    topK: 6,          // 选择 Top-K 个最相关的文本块
    minScore: 1,      // 最低评分阈值
    chunkSize: 900,   // 文本块大小（字符数）
    overlap: 100,     // 文本块重叠大小
  },
});
```

### 分类扩展配置

```javascript
createAiAssistantRouter({
  // ...其他配置
  category: {
    enabled: true,    // 是否启用分类扩展
    maxDocs: 8,       // 最多扩展多少篇文章
    maxChunks: 6,     // 从扩展文章中最多选择多少个文本块
  },
});
```

### 限流配置

```javascript
createAiAssistantRouter({
  // ...其他配置
  rateLimit: {
    windowMs: 60000,  // 时间窗口（毫秒）
    max: 10,          // 最大请求数
  },
});
```

## 🔧 数据库适配

### MongoDB + Mongoose

```javascript
const Article = require('./models/Article');

const adapter = {
  async getArticle(id) {
    return await Article.findById(id).lean();
  },
  async findRelatedArticles(categoryId, excludeId, limit) {
    return await Article.find({
      category: categoryId,
      _id: { $ne: excludeId },
      status: 'published',
    })
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
  },
};
```

### PostgreSQL + Prisma

```javascript
import { prisma } from './lib/prisma';

const adapter = {
  async getArticle(id) {
    return await prisma.article.findUnique({
      where: { id },
      include: { category: true },
    });
  },
  async findRelatedArticles(categoryId, excludeId, limit) {
    return await prisma.article.findMany({
      where: {
        categoryId,
        id: { not: excludeId },
        status: 'PUBLISHED',
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  },
};
```

### MySQL + Sequelize

```javascript
const { Article } = require('./models');

const adapter = {
  async getArticle(id) {
    return await Article.findByPk(id, {
      include: ['category'],
    });
  },
  async findRelatedArticles(categoryId, excludeId, limit) {
    return await Article.findAll({
      where: {
        categoryId,
        id: { [Op.ne]: excludeId },
        status: 'published',
      },
      limit,
      order: [['createdAt', 'DESC']],
    });
  },
};
```

## 🐛 常见问题

### 1. CORS 错误

如果前端和后端不在同一域名，需要配置 CORS：

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true,
}));
```

### 2. API 超时

如果 AI 响应较慢，可以增加超时时间：

```javascript
createAiAssistantRouter({
  ai: {
    // ...其他配置
    timeout: 120000, // 120 秒
  },
});
```

### 3. 中文分词效果不佳

可以调整检索参数：

```javascript
retrieval: {
  topK: 8,        // 增加选择的文本块数量
  minScore: 0.5,  // 降低评分阈值
  chunkSize: 600, // 减小文本块大小
}
```

### 4. 引用验证失败

确保文章内容字段名称正确：

```javascript
// 如果你的文章内容字段不是 'content'，需要在适配器中转换
async getArticle(id) {
  const article = await Article.findById(id);
  return {
    ...article,
    content: article.body, // 将 body 字段映射为 content
  };
}
```

## 📊 性能优化

### 1. 缓存文章内容

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 分钟缓存

const adapter = {
  async getArticle(id) {
    const cacheKey = `article:${id}`;
    let article = cache.get(cacheKey);
    
    if (!article) {
      article = await Article.findById(id);
      cache.set(cacheKey, article);
    }
    
    return article;
  },
};
```

### 2. 数据库索引

确保在分类字段上创建索引：

```javascript
// MongoDB
articleSchema.index({ category: 1, createdAt: -1 });

// PostgreSQL
CREATE INDEX idx_articles_category ON articles(category_id, created_at DESC);
```

### 3. 限制文章内容长度

```javascript
async getArticle(id) {
  const article = await Article.findById(id);
  
  // 限制内容长度，避免超出 token 限制
  if (article.content.length > 50000) {
    article.content = article.content.substring(0, 50000);
  }
  
  return article;
}
```

## 🔐 安全建议

### 1. API Key 保护

- 永远不要在前端暴露 API Key
- 使用环境变量存储敏感信息
- 定期轮换 API Key

### 2. 用户认证

```javascript
const aiRouter = createAiAssistantRouter({
  // ...配置
  middleware: [
    // 添加认证中间件
    (req, res, next) => {
      const token = req.headers.authorization;
      if (!token || !verifyToken(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    },
  ],
});
```

### 3. 限流保护

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: '请求过于频繁，请稍后再试',
});

app.use('/api/ai', limiter, aiRouter);
```

## 📚 更多资源

- [GitHub 仓库](https://github.com/xiaodingyang/blog-ai-assistant)
- [API 文档](./README.md#-api-文档)
- [示例项目](./examples)
- [问题反馈](https://github.com/xiaodingyang/blog-ai-assistant/issues)

## 🤝 获取帮助

如果遇到问题：

1. 查看 [常见问题](#-常见问题)
2. 搜索 [GitHub Issues](https://github.com/xiaodingyang/blog-ai-assistant/issues)
3. 提交新的 Issue
4. 加入讨论区交流

---

**祝你使用愉快！** 🎉
