# @xiaodingyang/blog-ai-assistant-react

React components for blog AI assistant.

## Installation

```bash
npm install @xiaodingyang/blog-ai-assistant-react
```

## Usage

```tsx
import React, { useState } from 'react';
import { AiAssistant, AiButton } from '@xiaodingyang/blog-ai-assistant-react';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AiButton onClick={() => setOpen(true)} />
      
      <AiAssistant
        open={open}
        onClose={() => setOpen(false)}
        config={{
          apiBase: '/api/ai',
          articleId: '123',
          articleTitle: 'My Article',
        }}
        theme={{
          primary: '#1890ff',
          borderRadius: 12,
        }}
      />
    </>
  );
}
```

## Components

### AiButton

Floating action button to open the assistant.

### AiAssistant

Modal dialog for Q&A interaction.

## License

MIT
