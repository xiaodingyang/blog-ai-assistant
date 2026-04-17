# Express + MongoDB Example

This example demonstrates how to integrate Blog AI Assistant with Express and MongoDB.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

3. Start MongoDB (if not running):

```bash
mongod
```

4. Run the server:

```bash
pnpm dev
```

## API Endpoints

- `POST /api/ai/ask` - Article-bound Q&A
- `POST /api/ai/chat` - General Q&A
- `GET /health` - Health check

## Testing

```bash
# Article Q&A
curl -X POST http://localhost:3000/api/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"articleId": "507f1f77bcf86cd799439011", "question": "What is React?"}'

# General Q&A
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is JavaScript?"}'
```
