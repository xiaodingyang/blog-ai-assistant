# @xdy-npm/blog-ai-assistant-core

Core retrieval and AI logic for blog AI assistant.

## Installation

```bash
npm install @xdy-npm/blog-ai-assistant-core
```

## Usage

### Text Chunking

```typescript
import { splitContentIntoChunks } from '@xdy-npm/blog-ai-assistant-core';

const chunks = splitContentIntoChunks(article.content, {
  maxLength: 900,
  overlap: 100,
});
```

### Keyword Extraction

```typescript
import { tokenizeQuestion } from '@xdy-npm/blog-ai-assistant-core';

const tokens = tokenizeQuestion('如何使用 React Hooks？');
// ['如何', '使用', 'react', 'hooks', '如何使', '何使用', ...]
```

### Chunk Scoring

```typescript
import { scoreChunk } from '@xdy-npm/blog-ai-assistant-core';

const score = scoreChunk(chunk.text, tokens);
```

### Top-K Selection

```typescript
import { pickTopChunks } from '@xdy-npm/blog-ai-assistant-core';

const topChunks = pickTopChunks(chunks, question, {
  topK: 6,
  minScore: 1,
});
```

### AI Calling

```typescript
import { callChatCompletions } from '@xdy-npm/blog-ai-assistant-core';

const { content, usage } = await callChatCompletions(
  [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is React?' },
  ],
  {
    apiBase: 'https://api.openai.com',
    apiKey: 'sk-xxx',
    model: 'gpt-4o-mini',
  }
);
```

### JSON Parsing

```typescript
import { parseModelJson } from '@xdy-npm/blog-ai-assistant-core';

const parsed = parseModelJson<{ answer: string }>(content);
```

## License

MIT
