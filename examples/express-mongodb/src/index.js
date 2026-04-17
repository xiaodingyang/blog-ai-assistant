const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { createAiAssistantRouter, errorHandler } = require('@xdy-npm/blog-ai-assistant-server');

// Article Model
const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  status: { type: String, default: 'published' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Article = mongoose.model('Article', articleSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create AI Assistant router
const aiRouter = createAiAssistantRouter({
  ai: {
    apiBase: process.env.AI_API_BASE,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },
  adapter: {
    async getArticle(id) {
      const article = await Article.findById(id).lean();
      if (!article) return null;
      return {
        id: article._id.toString(),
        title: article.title,
        content: article.content,
        categoryId: article.category?.toString() || null,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      };
    },
    async findRelatedArticles(categoryId, excludeId, limit) {
      const articles = await Article.find({
        category: categoryId,
        _id: { $ne: excludeId },
        status: 'published',
      })
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      return articles.map((a) => ({
        id: a._id.toString(),
        title: a.title,
        content: a.content,
        categoryId: a.category?.toString() || null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));
    },
  },
  retrieval: {
    topK: 6,
    minScore: 1,
  },
  category: {
    enabled: true,
    maxDocs: 8,
  },
});

app.use('/api/ai', aiRouter);
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
