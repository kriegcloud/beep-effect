# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing **Phase 2: Server Integration** of the lexical-editor-ai-features spec.

### Context

Phase 1 (Infrastructure) completed. The following are now available:
- `PreserveSelectionPlugin` with SAVE/RESTORE commands
- AI types (`InsertionMode`, `AiOperationState`)
- AI commands (`OPEN_AI_PANEL_COMMAND`, etc.)
- AI errors (`AiError`, `AiStreamError`, `AiSelectionError`)
- `AiContext` provider

**Dependencies confirmed**: `ai`, `@ai-sdk/openai`, `@ai-sdk/react` already installed.

### Your Mission

Create/modify 4 files:

| File | Purpose |
|------|---------|
| `app/api/chat/route.ts` | Modern AI SDK 6 streaming endpoint |
| `actions/ai.ts` | Server action for RSC streaming |
| `plugins/AiAssistantPlugin/prompts.ts` | Predefined prompt templates |
| `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | Client hook for stream consumption |

### Critical AI SDK 6 Migration

**These changes are MANDATORY - deprecated patterns will fail:**

```typescript
// OLD (BROKEN)
import { CoreMessage } from "ai";
messages: convertToCoreMessages(messages),  // SYNC
return result.toDataStreamResponse();

// NEW (REQUIRED)
import type { UIMessage } from "ai";
messages: await convertToModelMessages(messages),  // ASYNC!
return result.toUIMessageStreamResponse();
```

### Code Patterns

**API Route (app/api/chat/route.ts):**
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

**Server Action (actions/ai.ts):**
```typescript
"use server";

import { createStreamableValue } from "ai/rsc";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export async function improveText(selectedText: string, instruction: string) {
  const messages: UIMessage[] = [
    {
      id: crypto.randomUUID(),
      role: "system",
      content: `Improve the following text...\n${selectedText}`,
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

**Client Hook (useAiStreaming.ts):**
```typescript
"use client";

import { readStreamableValue } from "ai/rsc";
import { useState, useCallback, useRef } from "react";
import { improveText } from "@/actions/ai";

export function useAiStreaming() {
  const [streamedContent, setStreamedContent] = useState("");
  const [operationState, setOperationState] = useState<AiOperationState>("idle");
  const abortRef = useRef(false);

  const streamResponse = useCallback(async (selectedText: string, instruction: string) => {
    abortRef.current = false;
    setOperationState("streaming");
    setStreamedContent("");

    try {
      const stream = await improveText(selectedText, instruction);
      for await (const chunk of readStreamableValue(stream)) {
        if (abortRef.current) break;
        if (chunk) setStreamedContent((prev) => prev + chunk);
      }
      if (!abortRef.current) setOperationState("complete");
    } catch (e) {
      setOperationState("error");
    }
  }, []);

  return { streamedContent, operationState, streamResponse, abort, reset };
}
```

### Delegation Rules

You MUST delegate code writing to `effect-code-writer` agent. You coordinate and verify, you do NOT write source code directly.

### Reference Files

- Full context: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P2.md`
- Phase 1 types: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/types.ts`
- Phase 1 errors: `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/errors.ts`
- Synthesis report: `specs/lexical-editor-ai-features/outputs/05-synthesis-report.md`

### Base Path

All file paths relative to: `apps/todox/src/`

### Verification

After each file creation:
```bash
bun run check --filter @beep/todox
```

If upstream errors, isolate:
```bash
bun tsc --noEmit apps/todox/src/actions/ai.ts
```

### Success Criteria

- [ ] `app/api/chat/route.ts` uses modern AI SDK 6 patterns
- [ ] `actions/ai.ts` implements RSC streaming correctly
- [ ] `prompts.ts` has at least 5 predefined templates
- [ ] `useAiStreaming.ts` hook is type-safe and works
- [ ] No AI SDK deprecation warnings
- [ ] TypeScript compiles without errors related to Phase 2 files
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/lexical-editor-ai-features/handoffs/HANDOFF_P2.md`
