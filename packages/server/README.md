# @xiaodingyang/blog-ai-assistant-server

Express middleware for blog AI assistant.

## Installation

```bash
npm install @xiaodingyang/blog-ai-assistant-server @xiaodingyang/blog-ai-assistant-core
```

## Usage

```javascript
const express = require('express');
const { createAiAssistantRouter } = require('@xiaodingyang/blog-ai-assistant-server');

const app = express();
app.use(express.json());

const aiRouter = createAiAssistantRouter({
  ai: {
    apiBase: process.env.AI_API_BASE,
    apiKey: process.env.AI_API_KEY,
    model: 'gpt-4o-mini',
  },
  adapter: {
    async getArticle(id) {
      return await Article.findById(id);
    },
    async findRelatedArticles(categoryId, excludeId, limit) {
      return await Article.find({ category: categoryId }).limit(limit);
    },
  },
});

app.use('/api/ai', aiRouter);
```

## API Endpoints

- `POST /ask` - Article-bound Q&A
- `POST /chat` - General Q&A

## License

MIT
