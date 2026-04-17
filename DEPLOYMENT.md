# 部署指南

本指南介绍如何将 Blog AI Assistant 部署到生产环境。

## 📋 部署前检查清单

- [ ] 已完成本地开发和测试
- [ ] 已配置生产环境的 AI API Key
- [ ] 已设置数据库连接
- [ ] 已配置 CORS 和安全策略
- [ ] 已设置限流和监控
- [ ] 已准备好域名和 SSL 证书

## 🚀 部署方案

### 方案 1：Vercel 部署（推荐用于 Next.js）

#### 步骤 1：准备项目

确保你的 Next.js 项目已集成 Blog AI Assistant：

```javascript
// pages/api/ai/[...path].js
import { createAiAssistantRouter } from '@xdy-npm/blog-ai-assistant-server';

const aiRouter = createAiAssistantRouter({
  ai: {
    apiBase: process.env.AI_API_BASE,
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL,
  },
  adapter: {
    // 你的数据适配器
  },
});

export default aiRouter;
```

#### 步骤 2：配置环境变量

在 Vercel 项目设置中添加环境变量：

```
AI_API_BASE=https://api.openai.com/v1
AI_API_KEY=sk-your-production-key
AI_MODEL=gpt-4o-mini
DATABASE_URL=your-database-url
```

#### 步骤 3：部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 方案 2：Docker 部署

#### 步骤 1：创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建（如果需要）
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### 步骤 2：创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AI_API_BASE=${AI_API_BASE}
      - AI_API_KEY=${AI_API_KEY}
      - AI_MODEL=${AI_MODEL}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=your-password
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongodb_data:
```

#### 步骤 3：配置 Nginx

创建 `nginx.conf`：

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        
        # 重定向到 HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # AI API 特殊配置（增加超时）
        location /api/ai {
            proxy_pass http://app;
            proxy_read_timeout 120s;
            proxy_connect_timeout 120s;
            proxy_send_timeout 120s;
        }
    }
}
```

#### 步骤 4：部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止
docker-compose down
```

### 方案 3：传统服务器部署（PM2）

#### 步骤 1：安装 PM2

```bash
npm install -g pm2
```

#### 步骤 2：创建 ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'blog-ai-assistant',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    max_memory_restart: '1G',
  }],
};
```

#### 步骤 3：部署

```bash
# 启动应用
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup

# 查看状态
pm2 status

# 查看日志
pm2 logs blog-ai-assistant

# 重启
pm2 restart blog-ai-assistant

# 停止
pm2 stop blog-ai-assistant
```

### 方案 4：云平台部署

#### AWS Elastic Beanstalk

1. 安装 EB CLI：
```bash
pip install awsebcli
```

2. 初始化：
```bash
eb init -p node.js-18 blog-ai-assistant
```

3. 创建环境：
```bash
eb create production-env
```

4. 配置环境变量：
```bash
eb setenv AI_API_BASE=xxx AI_API_KEY=xxx
```

5. 部署：
```bash
eb deploy
```

#### Google Cloud Run

1. 创建 Dockerfile（同方案 2）

2. 构建镜像：
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/blog-ai-assistant
```

3. 部署：
```bash
gcloud run deploy blog-ai-assistant \
  --image gcr.io/PROJECT_ID/blog-ai-assistant \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars AI_API_BASE=xxx,AI_API_KEY=xxx
```

#### Azure App Service

1. 创建 Web App：
```bash
az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name blog-ai-assistant \
  --runtime "NODE|18-lts"
```

2. 配置环境变量：
```bash
az webapp config appsettings set \
  --resource-group myResourceGroup \
  --name blog-ai-assistant \
  --settings AI_API_BASE=xxx AI_API_KEY=xxx
```

3. 部署：
```bash
az webapp deployment source config-zip \
  --resource-group myResourceGroup \
  --name blog-ai-assistant \
  --src app.zip
```

## 🔒 生产环境安全配置

### 1. 环境变量管理

使用密钥管理服务：

```javascript
// 使用 AWS Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return JSON.parse(data.SecretString);
}

const secrets = await getSecret('blog-ai-assistant/prod');

const aiRouter = createAiAssistantRouter({
  ai: {
    apiBase: secrets.AI_API_BASE,
    apiKey: secrets.AI_API_KEY,
    model: secrets.AI_MODEL,
  },
});
```

### 2. HTTPS 配置

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 限流和防护

```javascript
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/ai', limiter);
```

### 4. 日志和监控

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// 记录 AI 请求
app.use('/api/ai', (req, res, next) => {
  logger.info('AI request', {
    ip: req.ip,
    path: req.path,
    method: req.method,
  });
  next();
});
```

## 📊 性能优化

### 1. 启用缓存

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

// 缓存文章内容
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

### 2. 使用 CDN

将静态资源部署到 CDN：

```javascript
// 配置 CDN 域名
const CDN_URL = 'https://cdn.your-domain.com';

// 在 HTML 中引用
<script src="${CDN_URL}/ai-assistant.js"></script>
```

### 3. 数据库优化

```javascript
// MongoDB 索引
db.articles.createIndex({ category: 1, createdAt: -1 });
db.articles.createIndex({ status: 1 });

// 使用连接池
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
  maxPoolSize: 10,
  minPoolSize: 2,
});
```

### 4. 启用压缩

```javascript
const compression = require('compression');
app.use(compression());
```

## 🔍 监控和告警

### 1. 健康检查

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

### 2. 性能监控

使用 New Relic 或 Datadog：

```javascript
// New Relic
require('newrelic');

// Datadog
const tracer = require('dd-trace').init();
```

### 3. 错误追踪

使用 Sentry：

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

## 🔄 持续集成/部署

### GitHub Actions 示例

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🐛 故障排查

### 常见问题

1. **AI 响应超时**
   - 增加 Nginx/代理超时时间
   - 检查 AI API 服务状态
   - 考虑使用更快的模型

2. **数据库连接失败**
   - 检查数据库连接字符串
   - 确认网络安全组配置
   - 检查数据库服务状态

3. **内存溢出**
   - 限制文章内容长度
   - 启用缓存减少数据库查询
   - 增加服务器内存

4. **CORS 错误**
   - 配置正确的 CORS 策略
   - 检查前端请求域名
   - 确认 credentials 设置

### 日志分析

```bash
# 查看错误日志
tail -f logs/error.log

# 搜索特定错误
grep "AI request failed" logs/combined.log

# 统计请求量
awk '{print $1}' access.log | sort | uniq -c | sort -nr
```

## 📚 更多资源

- [使用指南](./USAGE_GUIDE.md)
- [API 文档](./README.md)
- [示例项目](./examples)
- [问题反馈](https://github.com/xiaodingyang/blog-ai-assistant/issues)

---

**祝部署顺利！** 🚀
