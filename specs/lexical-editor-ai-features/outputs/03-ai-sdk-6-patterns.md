# AI SDK Patterns Reference

Modern patterns for the Vercel AI SDK (version 4.x, not 6.x as originally thought).

## Executive Summary

The Vercel AI SDK provides a unified interface for AI model interactions with streaming support. The current version is 4.2.x. This document covers the modern patterns required for implementation, contrasting them with deprecated patterns found in the source application.

## Version Clarification

The AI SDK versioning can be confusing:
- **Current stable**: `ai@4.2.x` (npm package)
- **Previous**: `ai@3.x`
- There is no "AI SDK 6" - the original research request was based on incorrect version information

## Core Concepts

### Message Types

The AI SDK uses distinct message types for client and server contexts:

| Type | Context | Purpose |
|------|---------|---------|
| `UIMessage` | Client | Messages displayed in UI, used with `useChat` |
| `ModelMessage` | Server | Messages sent to AI models |
| `CoreMessage` | DEPRECATED | Legacy type, replaced by `ModelMessage` |

### UIMessage Structure (Client)

```typescript
interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  createdAt?: Date;

  // Modern: Content is in parts array
  parts: MessagePart[];

  // Optional metadata
  annotations?: unknown[];
  toolInvocations?: ToolInvocation[];
}

type MessagePart =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string | Uint8Array | URL }
  | { type: 'file'; data: string; mimeType: string }
  | { type: 'tool-invocation'; toolInvocationId: string; toolName: string; args: unknown };
```

### ModelMessage Structure (Server)

```typescript
interface ModelMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | ContentPart[];
}
```

## useChat Hook (Client)

The primary hook for chat interfaces:

```typescript
import { useChat } from 'ai/react';

function ChatComponent() {
  const {
    // State
    messages,           // UIMessage[]
    input,              // string - current input value
    isLoading,          // boolean - request in progress
    error,              // Error | undefined

    // Actions
    handleInputChange,  // (e: ChangeEvent<HTMLInputElement>) => void
    handleSubmit,       // (e: FormEvent) => void
    append,             // (message: Message) => void
    reload,             // () => void - retry last message
    stop,               // () => void - cancel streaming
    setMessages,        // (messages: Message[]) => void
    setInput,           // (value: string) => void
  } = useChat({
    // Configuration
    api: '/api/chat',           // endpoint URL
    id: 'unique-chat-id',       // chat session ID
    initialMessages: [],        // pre-populate messages

    // Callbacks
    onFinish: (message, options) => {
      // Called when streaming completes
      console.log('Finished:', message);
    },
    onError: (error) => {
      // Called on error
      console.error('Chat error:', error);
    },
    onResponse: (response) => {
      // Called when response starts
      if (!response.ok) {
        throw new Error('Response failed');
      }
    },

    // Advanced options
    sendExtraMessageFields: true,  // send custom fields
    streamProtocol: 'data',        // 'text' or 'data'
    fetch: customFetch,            // custom fetch function
    headers: { 'X-Custom': 'value' },
    body: { customField: 'value' },
  });

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} />
      <button type="submit" disabled={isLoading}>Send</button>
    </form>
  );
}
```

## streamText (Server)

The primary function for streaming AI responses:

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    // Model configuration
    model: openai('gpt-4-turbo'),

    // Messages (converted from UIMessage to ModelMessage)
    messages: await convertToModelMessages(messages),

    // System prompt
    system: 'You are a helpful assistant.',

    // Optional parameters
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,

    // Tool definitions
    tools: {
      weather: {
        description: 'Get weather for a location',
        parameters: z.object({
          location: z.string(),
        }),
        execute: async ({ location }) => {
          return { temperature: 72, condition: 'sunny' };
        },
      },
    },

    // Callbacks
    onChunk: ({ chunk }) => {
      console.log('Chunk:', chunk);
    },
    onFinish: ({ text, usage }) => {
      console.log('Finished:', text);
      console.log('Tokens used:', usage);
    },
  });

  // Return streaming response compatible with useChat
  return result.toUIMessageStreamResponse();
}
```

## Message Conversion (CRITICAL)

### Modern Pattern (REQUIRED)

```typescript
import { convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // MODERN: Async conversion
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
```

### Deprecated Pattern (DO NOT USE)

```typescript
// DEPRECATED - DO NOT USE
import { convertToCoreMessages, streamText } from "ai";

const result = await streamText({
  model: openai(aiModel),
  messages: convertToCoreMessages(messages),  // WRONG - sync, deprecated
});

return result.toDataStreamResponse();  // WRONG - deprecated method
```

## Response Methods

### toUIMessageStreamResponse (RECOMMENDED)

For use with `useChat` hook - returns properly formatted streaming response:

```typescript
const result = streamText({
  model: openai('gpt-4-turbo'),
  messages: await convertToModelMessages(messages),
});

// Modern: Use this for useChat compatibility
return result.toUIMessageStreamResponse();
```

### toDataStreamResponse (LEGACY)

Still works but `toUIMessageStreamResponse` is preferred for new code:

```typescript
// Legacy pattern - still functional
return result.toDataStreamResponse();
```

### toTextStreamResponse (Simple Text)

For simple text streaming without chat metadata:

```typescript
return result.toTextStreamResponse();
```

## React Server Components (RSC) Streaming

For server actions with streaming (used in source):

```typescript
"use server";

import { createStreamableValue } from "ai/rsc";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateText(prompt: string) {
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: [{ role: 'user', content: prompt }],
  });

  // Create streamable value for RSC
  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
```

Client consumption:

```typescript
import { readStreamableValue } from "ai/rsc";

async function handleGenerate() {
  const stream = await generateText("Hello");

  for await (const chunk of readStreamableValue(stream)) {
    setOutput(prev => prev + chunk);
  }
}
```

## Accessing Message Content (Modern)

### Modern Pattern (parts array)

```typescript
function getMessageText(message: UIMessage): string {
  // Modern: Content is in parts array
  const textPart = message.parts?.find(p => p.type === 'text');
  return textPart?.text ?? message.content ?? '';
}
```

### Legacy Pattern (direct content)

```typescript
// LEGACY - May not work with all message types
const text = message.content;
```

## Provider Configuration

### OpenAI

```typescript
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-4-turbo'),
  // or: openai('gpt-4o')
  // or: openai('gpt-3.5-turbo')
});
```

### Anthropic

```typescript
import { anthropic } from '@ai-sdk/anthropic';

const result = streamText({
  model: anthropic('claude-3-opus-20240229'),
  // or: anthropic('claude-3-sonnet-20240229')
  // or: anthropic('claude-3-haiku-20240307')
});
```

### Custom/Local Models

```typescript
import { createOpenAI } from '@ai-sdk/openai';

const customProvider = createOpenAI({
  baseURL: 'http://localhost:1234/v1',
  apiKey: 'not-needed-for-local',
});

const result = streamText({
  model: customProvider('local-model-name'),
});
```

## Error Handling Patterns

### Basic Error Handling

```typescript
import { APICallError, InvalidToolArgumentsError } from 'ai';

try {
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: 'Hello',
  });
} catch (error) {
  if (error instanceof APICallError) {
    console.error('API Error:', error.message);
    console.error('Status:', error.statusCode);
  } else if (error instanceof InvalidToolArgumentsError) {
    console.error('Invalid tool args:', error.message);
  } else {
    throw error;
  }
}
```

### With Effect (Recommended for this codebase)

```typescript
import * as Effect from "effect/Effect";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

// Define tagged error
class AIError extends S.TaggedError<AIError>()("AIError", {
  message: S.String,
  statusCode: S.optional(S.Number),
}) {}

// Wrap AI call in Effect
const generateWithEffect = (prompt: string) =>
  Effect.tryPromise({
    try: () =>
      streamText({
        model: openai('gpt-4-turbo'),
        messages: [{ role: 'user', content: prompt }],
      }),
    catch: (error) => new AIError({
      message: error instanceof Error ? error.message : 'Unknown error',
      statusCode: error?.statusCode,
    }),
  });
```

## Migration Checklist

When migrating from deprecated patterns:

| Old Pattern | New Pattern | Notes |
|-------------|-------------|-------|
| `CoreMessage` type | `UIMessage` (client) / `ModelMessage` (server) | Import from 'ai' |
| `convertToCoreMessages()` | `await convertToModelMessages()` | Now async! |
| `result.toDataStreamResponse()` | `result.toUIMessageStreamResponse()` | For useChat compat |
| `message.content` | `message.parts.find(p => p.type === 'text')?.text` | Content in parts |

## Complete Modern API Route Example

```typescript
// app/api/chat/route.ts
import { streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Modern: async conversion
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: `You are a helpful writing assistant.
      Keep responses concise and focused.
      Format output appropriately for document insertion.`,
    messages: modelMessages,
    temperature: 0.7,
  });

  // Modern: UIMessageStreamResponse for useChat
  return result.toUIMessageStreamResponse();
}
```

## Complete Modern Server Action Example

```typescript
// app/actions/ai.ts
"use server";

import { createStreamableValue } from "ai/rsc";
import { streamText, convertToModelMessages, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export async function improveText(
  selectedText: string,
  instruction: string,
  conversationHistory: UIMessage[]
) {
  // Build messages with context
  const messages: UIMessage[] = [
    ...conversationHistory,
    {
      id: crypto.randomUUID(),
      role: 'system',
      content: `The user has selected the following text:
"""
${selectedText}
"""
Apply the user's instruction to improve this text.`,
      parts: [{ type: 'text', text: '' }],
    },
    {
      id: crypto.randomUUID(),
      role: 'user',
      content: instruction,
      parts: [{ type: 'text', text: instruction }],
    },
  ];

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
```

## Key Takeaways

1. **Use `UIMessage` for client-side message handling**
2. **Use `convertToModelMessages()` (async) for server conversion**
3. **Use `toUIMessageStreamResponse()` for streaming with `useChat`**
4. **Access content via `message.parts` array, not `message.content` directly**
5. **Wrap AI calls in Effect for type-safe error handling**
6. **Use RSC streaming (`createStreamableValue`) for server actions**
