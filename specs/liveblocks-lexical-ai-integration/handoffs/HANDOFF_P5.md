# Phase 5 Handoff: AI Streaming & Dependency Cleanup

**Date**: 2026-02-03
**From**: P4 (Effect AI Migration)
**To**: P5 (AI Streaming & Dependency Cleanup)
**Status**: Pending

---

## Context from Previous Phases

### Phase 1-3: Infrastructure & Verification

| Phase | Focus | Key Outcomes |
|-------|-------|--------------|
| P1 | Infrastructure Verification | Fixed room pattern (`liveblocks:playground:*`), typed env via `Redacted.value(serverEnv.liveblocks.secretKey)` |
| P2 | Real Session Integration | Replaced mock sessions with better-auth, 401 for unauthenticated, UserMeta from real session |
| P3/P3.5 | AI Streaming Verification | Verified OpenAI API works, error handling implemented, presence broadcasting confirmed, Lexical version mismatch fixed |

### Phase 4: Effect AI Migration (Complete)

Phase 4 successfully migrated from Vercel AI SDK to Effect AI patterns:

**Files Created**:
- `apps/todox/src/services/ai/errors.ts` - TextImprovementError with S.TaggedError
- `apps/todox/src/services/ai/LlmLive.ts` - Config-driven OpenAI layer using @effect/ai-openai
- `apps/todox/src/services/ai/TextImprovementService.ts` - Effect.Service using LanguageModel.generateText
- `apps/todox/src/services/ai/index.ts` - Barrel export

**Key Patterns Established**:
- `Layer.unwrapEffect` + `Config.redacted("OPENAI_API_KEY")` for config-driven layers
- `Effect.Service<T>()()` with `accessors: true` + `Effect.fnUntraced` for methods
- `AiError._tag` to domain error code mapping via `Match.value`
- `Effect.runPromise` for server action execution

**Limitation Introduced**:
- **Non-streaming response**: Text returned atomically instead of progressively
- **UX Impact**: Users wait for complete generation before seeing any output

---

## Phase 5 Objectives

### Objective 1: Streaming Migration

Restore progressive token delivery using Effect AI's `LanguageModel.streamText`.

**What Changed in P4**:
```typescript
// P4: Non-streaming (current)
const result = yield* model.generateText({ prompt });
return { success: true, text: result.text };
```

**Target for P5**:
```typescript
// P5: Streaming with progressive delivery
const stream = model.streamText({ prompt });
// Bridge Effect.Stream to RSC or custom transport
```

**Key Challenge**: Bridging Effect's `Stream<StreamPart>` to a React-consumable format. Options:

1. **Server-Sent Events (SSE)**: Convert server action to API route with SSE
2. **Custom RSC Adapter**: Create adapter wrapping Effect.Stream for `createStreamableValue`
3. **WebSocket**: Real-time bidirectional streaming
4. **Polling with Accumulation**: Client polls for accumulated chunks (fallback)

### Objective 2: Dependency Cleanup

Remove unused Vercel AI SDK packages after streaming migration:

**Packages to Remove** from `apps/todox/package.json`:
- `@ai-sdk/openai` - Replaced by `@effect/ai-openai`
- `@ai-sdk/react` - Not used after migration
- `@ai-sdk/rsc` - RSC streaming transport (may keep if using hybrid approach)
- `ai` - Core Vercel AI SDK

**Verification**:
```bash
# After removal, ensure no imports remain
grep -r "@ai-sdk" apps/todox/src/
grep -r "from \"ai\"" apps/todox/src/

# Type check
bun run check --filter @beep/todox
```

---

## Prerequisites

Before starting Phase 5, understand:

### 1. Effect AI Streaming API

From `.claude/skills/effect-ai-streaming/SKILL.md`:

```typescript
// StreamPart protocol: start -> delta* -> end
type StreamPart =
  | { type: "text-start", id: string }
  | { type: "text-delta", id: string, delta: string }
  | { type: "text-end", id: string }
  | { type: "finish", reason: FinishReason, usage: Usage }
  | { type: "error", error: AiError };

// Consumption pattern
model.streamText({ prompt }).pipe(
  Stream.runForEach((part) =>
    Match.value(part).pipe(
      Match.tag("text-delta", ({ delta }) => Effect.sync(() => emit(delta))),
      Match.tag("finish", ({ usage }) => Effect.sync(() => recordMetrics(usage))),
      Match.orElse(() => Effect.void)
    )
  )
);
```

### 2. Current Hook State Machine

The `useAiStreaming` hook maintains these states:
```typescript
type AiOperationState = "idle" | "streaming" | "complete" | "error";
```

The streaming state should show progressive content, not just wait for completion.

### 3. RSC Streaming (Vercel AI SDK)

Previous implementation used:
```typescript
// Server
import { createStreamableValue } from "@ai-sdk/rsc";
const stream = createStreamableValue(result.textStream);
return { success: true, stream: stream.value };

// Client
import { readStreamableValue } from "@ai-sdk/rsc";
for await (const chunk of readStreamableValue(stream)) {
  setStreamedContent(prev => prev + chunk);
}
```

The question is: Can we adapt Effect.Stream to this protocol, or do we need a different transport?

---

## Critical Files

### Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `apps/todox/src/services/ai/TextImprovementService.ts` | Add `improveTextStream` method returning `Stream<string>` | High |
| `apps/todox/src/actions/ai.ts` | Convert to streaming response or create new streaming endpoint | High |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | Consume streaming response | High |
| `apps/todox/package.json` | Remove unused Vercel AI SDK deps | Medium |

### Reference Files

| File | Purpose |
|------|---------|
| `.claude/skills/effect-ai-streaming/SKILL.md` | Effect AI streaming patterns and StreamPart protocol |
| `.claude/skills/effect-ai-language-model/SKILL.md` | LanguageModel API reference |
| `packages/knowledge/server/src/Extraction/MentionExtractor.ts` | Service pattern reference (may not use streaming) |
| `apps/todox/src/services/ai/LlmLive.ts` | Existing layer (no changes needed) |
| `apps/todox/src/services/ai/errors.ts` | Existing errors (no changes needed) |

---

## Research Tasks

Phase 5 requires discovery before implementation:

### Research 1: Effect.Stream to RSC Bridge

**Question**: How do we bridge `Stream<StreamPart, AiError, R>` to React streaming?

**Investigation**:
1. Check if `@ai-sdk/rsc` can accept an async iterable from Effect.Stream
2. Look for existing Effect-to-RSC adapters in the ecosystem
3. Evaluate creating a custom `StreamableValue` wrapper

**Potential Approach**:
```typescript
// Convert Effect.Stream to AsyncIterable
const asyncIterable = Stream.toAsyncIterable(effectStream);

// Wrap in RSC streamable value
const rscStream = createStreamableValue(asyncIterable);
```

### Research 2: Server Action vs API Route

**Question**: Can server actions truly stream, or do they buffer responses?

**Investigation**:
1. Test if server actions can incrementally return data
2. Check if RSC streaming works within server actions or requires API routes
3. Evaluate SSE/WebSocket alternatives if server actions don't support true streaming

### Research 3: Abort/Cancel with Effect.Stream

**Question**: How do we cleanly abort an Effect.Stream from the client?

**Investigation**:
1. Check Effect.Stream interruption patterns
2. Understand how AbortController integrates with Effect
3. Preserve the existing `abort()` functionality in the hook

---

## Conceptual Target Pattern

### Service Layer

```typescript
// TextImprovementService.ts
export class TextImprovementService extends Effect.Service<TextImprovementService>()(
  "@todox/TextImprovementService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const model = yield* LanguageModel.LanguageModel;

      return {
        // Existing non-streaming method (for backward compatibility)
        improveText: Effect.fnUntraced(function* (text, instruction) {
          // ... existing implementation
        }),

        // NEW: Streaming method
        improveTextStream: (text: string, instruction: string) =>
          model.streamText({ prompt: buildPrompt(text, instruction) }).pipe(
            Stream.filterMap((part) =>
              part.type === "text-delta" ? Option.some(part.delta) : Option.none()
            )
          ),
      };
    }),
  }
) {}
```

### Server Action / Endpoint

```typescript
// Option A: Keep RSC transport (if compatible)
"use server";
export async function improveTextStreaming(text: string, instruction: string) {
  const effectStream = TextImprovementService.improveTextStream(text, instruction).pipe(
    Effect.provide(TextImprovementLive)
  );

  // Convert to async iterable
  const asyncIterable = yield* Stream.toAsyncIterable(effectStream);

  // Wrap for RSC
  const stream = createStreamableValue(asyncIterable);
  return { success: true, stream: stream.value };
}

// Option B: API route with SSE
// app/api/ai/stream/route.ts
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Run Effect stream, writing to SSE
  Effect.runFork(
    TextImprovementService.improveTextStream(text, instruction).pipe(
      Stream.runForEach((delta) =>
        Effect.sync(() => writer.write(encoder.encode(`data: ${delta}\n\n`)))
      ),
      Effect.ensuring(Effect.sync(() => writer.close())),
      Effect.provide(TextImprovementLive)
    )
  );

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

### Client Hook

```typescript
// Option A: RSC consumption (if using RSC transport)
const streamResponse = useCallback(async (selectedText: string, instruction: string) => {
  setOperationState("streaming");
  setStreamedContent("");

  const result = await improveTextStreaming(selectedText, instruction);

  if (!result.success) {
    setError(result.error.message);
    setOperationState("error");
    return;
  }

  for await (const chunk of readStreamableValue(result.stream)) {
    if (abortRef.current) break;
    if (chunk !== undefined) {
      setStreamedContent((prev) => prev + chunk);
    }
  }

  setOperationState("complete");
}, []);

// Option B: SSE consumption
const streamResponse = useCallback(async (selectedText: string, instruction: string) => {
  setOperationState("streaming");
  setStreamedContent("");

  const response = await fetch("/api/ai/stream", {
    method: "POST",
    body: JSON.stringify({ text: selectedText, instruction }),
  });

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done || abortRef.current) break;

    const text = decoder.decode(value);
    const lines = text.split("\n").filter((l) => l.startsWith("data: "));
    for (const line of lines) {
      const delta = line.slice(6);
      setStreamedContent((prev) => prev + delta);
    }
  }

  setOperationState("complete");
}, []);
```

---

## Success Criteria

Phase 5 is COMPLETE when ALL boxes checked:

### Streaming Implementation

- [ ] Service exposes `improveTextStream` method using `LanguageModel.streamText`
- [ ] Server endpoint/action delivers progressive token updates
- [ ] Client receives tokens incrementally (not batched)
- [ ] First token latency < 2 seconds
- [ ] Tokens appear progressively in UI during generation

### State Management

- [ ] `useAiStreaming` hook consumes streaming response correctly
- [ ] State transitions: idle -> streaming -> complete/error
- [ ] Progressive content updates during streaming state
- [ ] Abort/cancel stops stream cleanly
- [ ] Error handling displays user-friendly messages

### Dependency Cleanup

- [ ] `@ai-sdk/openai` removed from package.json
- [ ] `@ai-sdk/react` removed from package.json
- [ ] `@ai-sdk/rsc` removed (unless kept for transport)
- [ ] `ai` package removed
- [ ] No remaining imports from removed packages
- [ ] `grep -r "@ai-sdk" apps/todox/src/` returns empty

### Code Quality

- [ ] Type check passes: `bun run check --filter @beep/todox`
- [ ] Lint passes: `bun run lint --filter @beep/todox`
- [ ] Effect namespace imports used correctly
- [ ] Match.tag pattern for StreamPart handling
- [ ] Proper resource cleanup (no memory leaks)

---

## Known Risks

### Risk 1: RSC Streaming Incompatibility

**Risk**: `createStreamableValue` may not accept Effect's async iterable format.
**Mitigation**: Fall back to SSE API route approach.
**Impact**: Medium - requires alternative implementation path.

### Risk 2: Server Action Buffering

**Risk**: Next.js server actions may buffer responses instead of streaming.
**Mitigation**: Use API route with SSE if needed.
**Impact**: Medium - architectural change required.

### Risk 3: Abort Signal Integration

**Risk**: Integrating AbortController with Effect.Stream may require custom handling.
**Mitigation**: Use Effect.fiberId and Effect.interruptFiber patterns.
**Impact**: Low - documented patterns exist.

### Risk 4: Error Propagation in Streams

**Risk**: Errors mid-stream may not propagate correctly to client.
**Mitigation**: Handle `error` StreamPart type and set error state.
**Impact**: Low - standard Effect error handling applies.

---

## Agent Recommendations

| Agent | Task | Rationale |
|-------|------|-----------|
| `mcp-researcher` | Effect.Stream to RSC adapter patterns | Verify @effect/ai streaming API |
| `codebase-researcher` | Find existing streaming patterns in codebase | Check if similar bridges exist |
| `effect-code-writer` | Implement streaming service method | Core implementation |
| `effect-code-writer` | Create streaming endpoint/action | Server-side delivery |
| `code-reviewer` | Review Effect pattern compliance | Ensure no native methods, proper error handling |
| `test-writer` | Create streaming integration test | Verify end-to-end flow |

---

## Environment Requirements

```bash
# Root .env file must contain:
OPENAI_API_KEY=sk-...

# Verify Effect AI packages:
bun pm ls @effect/ai @effect/ai-openai --filter @beep/todox

# Start dev server for testing:
cd apps/todox && bun run dev
```

---

## Handoff Checklist

Before starting Phase 5:

- [x] P4 complete: Effect AI migration done, non-streaming working
- [x] Type check passes
- [x] Lint passes (pre-existing warnings only)
- [x] AI operations work end-to-end (non-streaming)
- [x] Error handling verified
- [ ] Effect AI streaming skill reviewed (`.claude/skills/effect-ai-streaming/SKILL.md`)
- [ ] Dev server starts successfully
- [ ] OpenAI API key configured in root `.env`
