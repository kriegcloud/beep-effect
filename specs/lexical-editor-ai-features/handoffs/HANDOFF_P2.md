# Phase 2 Handoff: Server Integration

> AI streaming endpoint and client hooks using modern AI SDK 6 patterns.

---

## Previous Phase Summary

**Phase 1 (Infrastructure)** completed:
- ✅ `PreserveSelectionPlugin` with SAVE/RESTORE commands
- ✅ `AiAssistantPlugin/types.ts` with InsertionMode and AiOperationState
- ✅ `AiAssistantPlugin/commands.ts` with AI commands
- ✅ `AiAssistantPlugin/errors.ts` with Effect TaggedError classes
- ✅ `context/AiContext.tsx` with full state management
- ✅ `Editor.tsx` modified to register PreserveSelectionPlugin

**Note**: Pre-existing unrelated errors in `ComponentPickerPlugin` and `ToolbarPlugin` (`FileBreak` import issue) - not related to Phase 1 changes.

---

## Phase 2 Objectives

### Goal

Establish working AI streaming infrastructure using modern AI SDK 6 patterns.

### Tasks

| ID | Task | Agent | Priority |
|----|------|-------|----------|
| 2.1 | Update `app/api/chat/route.ts` with modern AI SDK 6 | `effect-code-writer` | Critical |
| 2.2 | Create/update `actions/ai.ts` server action | `effect-code-writer` | Critical |
| 2.3 | Create `plugins/AiAssistantPlugin/prompts.ts` | `effect-code-writer` | High |
| 2.4 | Create `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | `effect-code-writer` | High |

---

## Dependencies Available from Phase 1

```typescript
// Types
import type { InsertionMode, AiOperationState } from "./types";

// Errors
import { AiError, AiStreamError, AiSelectionError, AiErrorCode } from "./errors";

// Commands
import {
  OPEN_AI_PANEL_COMMAND,
  CLOSE_AI_PANEL_COMMAND,
  INSERT_AI_TEXT_COMMAND,
  CANCEL_AI_OPERATION_COMMAND
} from "./commands";

// Context
import { useAiContext, AiContextProvider } from "../context/AiContext";

// Selection
import {
  SAVE_SELECTION_COMMAND,
  RESTORE_SELECTION_COMMAND
} from "./plugins/PreserveSelectionPlugin";
```

---

## Files to Create/Modify

### 1. `app/api/chat/route.ts` (MODIFY/CREATE)

**Purpose**: Modern AI SDK 6 streaming endpoint.

**Critical Migration**:
- `CoreMessage` → `UIMessage`
- `convertToCoreMessages` → `convertToModelMessages` (ASYNC!)
- `toDataStreamResponse` → `toUIMessageStreamResponse`

```typescript
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4-turbo"),
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
```

### 2. `actions/ai.ts` (CREATE/UPDATE)

**Purpose**: Server action for RSC streaming.

```typescript
"use server";

import { createStreamableValue } from "ai/rsc";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export async function improveText(
  selectedText: string,
  instruction: string
) {
  const messages: UIMessage[] = [
    {
      id: crypto.randomUUID(),
      role: "system",
      content: `Improve the following text according to the user's instruction.
Selected text:
"""
${selectedText}
"""`,
      parts: [{ type: "text", text: "" }],
    },
    {
      id: crypto.randomUUID(),
      role: "user",
      content: instruction,
      parts: [{ type: "text", text: instruction }],
    },
  ];

  const result = streamText({
    model: openai("gpt-4-turbo"),
    messages: await convertToModelMessages(messages),
    temperature: 0.7,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
```

### 3. `plugins/AiAssistantPlugin/prompts.ts` (CREATE)

**Purpose**: Predefined AI prompt templates.

```typescript
export interface AiPromptTemplate {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly systemPrompt: string;
  readonly userPromptTemplate: (selectedText: string) => string;
}

export const PREDEFINED_PROMPTS: readonly AiPromptTemplate[] = [
  {
    id: "improve",
    label: "Improve writing",
    description: "Enhance clarity and flow",
    systemPrompt: "You are a writing assistant. Improve the text while preserving its meaning.",
    userPromptTemplate: (text) => `Improve this text:\n\n${text}`,
  },
  {
    id: "simplify",
    label: "Simplify",
    description: "Make text easier to understand",
    systemPrompt: "Simplify complex text while preserving key information.",
    userPromptTemplate: (text) => `Simplify this text:\n\n${text}`,
  },
  {
    id: "fix-grammar",
    label: "Fix grammar",
    description: "Correct grammatical errors",
    systemPrompt: "Fix grammar and spelling errors without changing the meaning.",
    userPromptTemplate: (text) => `Fix grammar in:\n\n${text}`,
  },
  {
    id: "shorter",
    label: "Make shorter",
    description: "Condense the text",
    systemPrompt: "Make the text more concise while keeping the main points.",
    userPromptTemplate: (text) => `Make this shorter:\n\n${text}`,
  },
  {
    id: "longer",
    label: "Make longer",
    description: "Expand with more detail",
    systemPrompt: "Expand the text with more detail and context.",
    userPromptTemplate: (text) => `Expand this with more detail:\n\n${text}`,
  },
  {
    id: "professional",
    label: "Professional tone",
    description: "Make more formal",
    systemPrompt: "Rewrite in a professional, formal tone.",
    userPromptTemplate: (text) => `Make this more professional:\n\n${text}`,
  },
  {
    id: "casual",
    label: "Casual tone",
    description: "Make more conversational",
    systemPrompt: "Rewrite in a casual, friendly tone.",
    userPromptTemplate: (text) => `Make this more casual:\n\n${text}`,
  },
] as const;

export function getPromptById(id: string): AiPromptTemplate | undefined {
  return PREDEFINED_PROMPTS.find((p) => p.id === id);
}
```

### 4. `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` (CREATE)

**Purpose**: Client hook for consuming server action stream.

```typescript
"use client";

import { readStreamableValue } from "ai/rsc";
import { useState, useCallback, useRef } from "react";
import { improveText } from "@/actions/ai";
import type { AiOperationState } from "../types";

interface UseAiStreamingReturn {
  readonly streamedContent: string;
  readonly operationState: AiOperationState;
  readonly error: string | null;
  readonly streamResponse: (selectedText: string, instruction: string) => Promise<void>;
  readonly abort: () => void;
  readonly reset: () => void;
}

export function useAiStreaming(): UseAiStreamingReturn {
  const [streamedContent, setStreamedContent] = useState("");
  const [operationState, setOperationState] = useState<AiOperationState>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const streamResponse = useCallback(
    async (selectedText: string, instruction: string) => {
      abortRef.current = false;
      setOperationState("streaming");
      setStreamedContent("");
      setError(null);

      try {
        const stream = await improveText(selectedText, instruction);

        for await (const chunk of readStreamableValue(stream)) {
          if (abortRef.current) {
            break;
          }
          if (chunk) {
            setStreamedContent((prev) => prev + chunk);
          }
        }

        if (!abortRef.current) {
          setOperationState("complete");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setOperationState("error");
      }
    },
    []
  );

  const abort = useCallback(() => {
    abortRef.current = true;
    setOperationState("idle");
  }, []);

  const reset = useCallback(() => {
    abortRef.current = false;
    setStreamedContent("");
    setOperationState("idle");
    setError(null);
  }, []);

  return {
    streamedContent,
    operationState,
    error,
    streamResponse,
    abort,
    reset,
  };
}
```

---

## Directory Structure After Phase 2

```
apps/todox/src/
├── actions/
│   └── ai.ts                       # MODIFIED/CREATED
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts            # MODIFIED
│   └── lexical/
│       ├── context/
│       │   └── AiContext.tsx       # FROM PHASE 1
│       └── plugins/
│           ├── AiAssistantPlugin/
│           │   ├── commands.ts     # FROM PHASE 1
│           │   ├── errors.ts       # FROM PHASE 1
│           │   ├── types.ts        # FROM PHASE 1
│           │   ├── prompts.ts      # NEW
│           │   └── hooks/
│           │       └── useAiStreaming.ts  # NEW
│           └── PreserveSelectionPlugin/
│               └── index.tsx       # FROM PHASE 1
```

---

## AI SDK 6 Migration Critical Notes

### 1. UIMessage Structure

```typescript
interface UIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  parts: Array<{ type: "text"; text: string } | { type: "image"; ... }>;
}
```

### 2. Async convertToModelMessages

```typescript
// OLD (SYNC - BROKEN)
messages: convertToCoreMessages(messages)

// NEW (ASYNC - REQUIRED)
messages: await convertToModelMessages(messages)
```

### 3. Response Methods

```typescript
// OLD
return result.toDataStreamResponse();

// NEW
return result.toUIMessageStreamResponse();
```

### 4. Content Access in Response

```typescript
// OLD
const content = message.content;

// NEW (parts-first)
const textPart = message.parts?.find(p => p.type === 'text');
const content = textPart?.text ?? message.content ?? '';
```

---

## Verification Commands

```bash
# Full type check
bun run check --filter @beep/todox

# Isolated file checks
bun tsc --noEmit apps/todox/src/actions/ai.ts
bun tsc --noEmit apps/todox/src/app/api/chat/route.ts
bun tsc --noEmit apps/todox/src/app/lexical/plugins/AiAssistantPlugin/prompts.ts
bun tsc --noEmit apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts
```

---

## Success Criteria

- [ ] `app/api/chat/route.ts` updated with modern AI SDK 6 patterns
- [ ] `actions/ai.ts` created with RSC streaming
- [ ] `prompts.ts` created with predefined templates
- [ ] `useAiStreaming.ts` hook created and working
- [ ] No AI SDK deprecation warnings
- [ ] Streaming works end-to-end (test via browser console or simple UI)

---

## Manual Testing

```typescript
// In browser console or test component:
import { useAiStreaming } from './plugins/AiAssistantPlugin/hooks/useAiStreaming';

// Inside component:
const { streamResponse, streamedContent, operationState } = useAiStreaming();

// Trigger stream:
await streamResponse("The quick brown fox", "Make this more formal");

// Watch streamedContent update as text streams in
```

---

## Blocking Issues

None expected. AI SDK packages already in package.json.

---

## Next Phase Preview

**Phase 3: UI Components** will:
- Create `FloatingAiPanel` component
- Implement command menu with cmdk/shadcn
- Add streaming preview display
- Create insertion mode buttons
