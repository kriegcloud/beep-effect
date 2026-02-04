# Phase 5 Orchestrator Prompt: AI Streaming & Dependency Cleanup

> **Spec**: Liveblocks Lexical AI Integration
> **Phase**: 5 of 5
> **Focus**: Restore streaming UX using Effect AI patterns and remove Vercel AI SDK dependencies

Copy-paste this entire prompt to start Phase 5 implementation.

---

## Mission Statement

Restore progressive token streaming to the AI text improvement feature using Effect AI's `LanguageModel.streamText`, and clean up unused Vercel AI SDK dependencies. Phase 4 migrated to Effect AI but sacrificed streaming for simplicity. This phase completes the migration by implementing true streaming while maintaining the Effect-first patterns established in P4.

---

## Context

### Phase 1-4 Summary

| Phase | Focus | Key Outcomes |
|-------|-------|--------------|
| P1 | Infrastructure | Fixed room pattern, typed environment access |
| P2 | Session Integration | Real better-auth sessions, proper UserMeta |
| P3/P3.5 | AI Verification | Confirmed OpenAI works, fixed Lexical version mismatch |
| P4 | Effect AI Migration | Created Effect services, non-streaming MVP |

### Current State (Post-P4)

**Service Layer** (`apps/todox/src/services/ai/TextImprovementService.ts`):
```typescript
// Uses generateText (non-streaming)
improveText: Effect.fnUntraced(function* (text, instruction) {
  const result = yield* model.generateText({ prompt }).pipe(Effect.mapError(mapAiError));
  return result.text;
});
```

**Server Action** (`apps/todox/src/actions/ai.ts`):
```typescript
// Returns complete text atomically
export async function improveText(selectedText, instruction): Promise<AiResult> {
  // ... Effect.runPromise returns { success: true, text }
}
```

**Client Hook** (`hooks/useAiStreaming.ts`):
```typescript
// Receives atomic text, not streaming
setStreamedContent(result.text);
setOperationState("complete");
```

**Problem**: Users see no output until full generation completes. UX regression from P3.

### Target State (Post-P5)

**Service Layer**:
```typescript
// Uses streamText for progressive delivery
improveTextStream: (text: string, instruction: string) =>
  model.streamText({ prompt }).pipe(
    Stream.filterMap((part) =>
      part.type === "text-delta" ? Option.some(part.delta) : Option.none()
    )
  );
```

**Server Endpoint**:
```typescript
// Delivers tokens progressively via SSE or RSC streaming
```

**Client Hook**:
```typescript
// Consumes stream progressively
for await (const chunk of streamSource) {
  setStreamedContent(prev => prev + chunk);
}
```

---

## Workflow: Discovery -> Execute -> Check -> Verify

### Step 1: Discovery (Critical Research)

Before implementation, research the streaming bridge approach:

**Task 1.1: Effect.Stream to Async Iterable**

**Agent**: `mcp-researcher` + `codebase-researcher`

```
Research how to convert Effect.Stream to async iterable for consumption:

1. Check Effect docs for Stream.toAsyncIterable or similar
2. Search codebase for existing stream-to-iterable patterns:
   grep -r "toAsyncIterable\|AsyncIterable" packages/
3. Examine @effect/platform for streaming utilities
4. Document the conversion pattern

Output: Code snippet showing Effect.Stream -> AsyncIterable conversion
```

**Task 1.2: RSC vs SSE Streaming**

**Agent**: `codebase-researcher`

```
Determine whether to use RSC createStreamableValue or SSE:

1. Test if @ai-sdk/rsc createStreamableValue accepts custom async iterables
2. Check Next.js docs for server action streaming capabilities
3. Look for existing SSE patterns in the codebase:
   grep -r "text/event-stream\|EventSource" apps/
4. Evaluate complexity/compatibility tradeoffs

Output: Recommended approach (RSC transport vs SSE API route)
```

**Task 1.3: StreamPart Protocol**

**Agent**: `mcp-researcher`

```
Understand the Effect AI StreamPart protocol:

1. Review .claude/skills/effect-ai-streaming/SKILL.md
2. Search Effect AI docs for streamText return type
3. Document the StreamPart variants we care about:
   - text-delta: Progressive token delivery
   - finish: Completion with usage stats
   - error: Error propagation
4. Document how to filter to text-delta only

Output: StreamPart handling pattern with Match.tag
```

### Step 2: Execute (Implementation)

Based on discovery findings, implement one of these approaches:

#### Approach A: SSE API Route (Recommended)

**Task 2.1: Create Streaming Service Method**

**Agent**: `effect-code-writer`

```
Add streaming method to TextImprovementService:

File: apps/todox/src/services/ai/TextImprovementService.ts

Requirements:
1. Add improveTextStream method using LanguageModel.streamText
2. Filter StreamParts to text-delta only
3. Map to string chunks
4. Preserve error handling via mapAiError
5. Add Effect.logDebug for telemetry

Target signature:
improveTextStream: (text: string, instruction: string) =>
  Stream.Stream<string, TextImprovementError, LanguageModel.LanguageModel>

Implementation:
improveTextStream: (text: string, instruction: string) => {
  const prompt = Prompt.make([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserContent(text, instruction) },
  ]);

  return model.streamText({ prompt }).pipe(
    Stream.mapEffect((part) =>
      Match.value(part).pipe(
        Match.tag("text-delta", ({ delta }) => Effect.succeed(delta)),
        Match.tag("error", ({ error }) => Effect.fail(mapAiError(error))),
        Match.orElse(() => Effect.succeed(""))
      )
    ),
    Stream.filter((s) => s.length > 0)
  );
}

Reference:
- .claude/skills/effect-ai-streaming/SKILL.md
- Current TextImprovementService.ts
```

**Task 2.2: Create SSE Streaming Endpoint**

**Agent**: `effect-code-writer`

```
Create API route for streaming:

File: apps/todox/src/app/api/ai/stream/route.ts

Requirements:
1. Accept POST with { text: string, instruction: string }
2. Validate input with Effect Schema
3. Create SSE response stream
4. Run Effect stream, writing deltas to SSE
5. Handle errors gracefully
6. Set proper headers for SSE

Implementation pattern:
import { NextRequest } from "next/server";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Layer from "effect/Layer";
import { TextImprovementService, LlmLive } from "@/services/ai";

const TextImprovementLive = TextImprovementService.Default.pipe(Layer.provide(LlmLive));

export async function POST(request: NextRequest) {
  const { text, instruction } = await request.json();

  const encoder = new TextEncoder();
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  // Run Effect stream in background
  Effect.runFork(
    Effect.gen(function* () {
      const service = yield* TextImprovementService;

      yield* service.improveTextStream(text, instruction).pipe(
        Stream.runForEach((delta) =>
          Effect.sync(() => writer.write(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)))
        )
      );

      yield* Effect.sync(() => writer.write(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)));
    }).pipe(
      Effect.catchTag("TextImprovementError", (error) =>
        Effect.sync(() =>
          writer.write(encoder.encode(`data: ${JSON.stringify({ error: { code: error.code, message: error.message } })}\n\n`))
        )
      ),
      Effect.ensuring(Effect.sync(() => writer.close())),
      Effect.provide(TextImprovementLive)
    )
  );

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

Reference:
- .claude/rules/effect-patterns.md
- Existing API routes in apps/todox/src/app/api/
```

**Task 2.3: Update Client Hook for SSE**

**Agent**: `effect-code-writer`

```
Update useAiStreaming to consume SSE:

File: apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts

Requirements:
1. Replace improveText call with fetch to /api/ai/stream
2. Read SSE response using ReadableStream
3. Parse SSE data format: data: {"delta": "..."}\n\n
4. Handle done: true and error payloads
5. Support abort via AbortController
6. Preserve state machine: idle -> streaming -> complete/error

Key changes:
const streamResponse = useCallback(async (selectedText: string, instruction: string) => {
  abortControllerRef.current = new AbortController();
  setOperationState("streaming");
  setStreamedContent("");
  setError(null);

  try {
    const response = await fetch("/api/ai/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText, instruction }),
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = JSON.parse(line.slice(6));

        if (json.error) {
          setError(json.error.message);
          setOperationState("error");
          return;
        }

        if (json.done) {
          setOperationState("complete");
          return;
        }

        if (json.delta) {
          setStreamedContent((prev) => prev + json.delta);
        }
      }
    }

    setOperationState("complete");
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      setOperationState("idle");
      return;
    }
    setOperationState("error");
    setError(err instanceof Error ? err.message : "An unexpected error occurred");
  }
}, []);

const abort = useCallback(() => {
  abortControllerRef.current?.abort();
  setOperationState("idle");
}, []);

Reference:
- Current useAiStreaming.ts
- SSE consumption patterns
```

#### Approach B: RSC Transport (Alternative)

If discovery shows RSC is viable, implement this instead:

**Task 2.1-alt: Create Streaming Server Action**

```
File: apps/todox/src/actions/ai.ts

Add streaming variant using RSC:

import { createStreamableValue } from "@ai-sdk/rsc";
import * as Stream from "effect/Stream";

export async function improveTextStreaming(selectedText: string, instruction: string) {
  // Convert Effect stream to async iterable
  // Then wrap in createStreamableValue
  // Return { success: true, stream: stream.value }
}

Note: This depends on Effect.Stream -> AsyncIterable conversion working with RSC.
```

**Task 2.4: Remove Unused Dependencies**

**Agent**: `effect-code-writer`

```
Clean up Vercel AI SDK dependencies:

File: apps/todox/package.json

Remove these lines (after streaming works without them):
- "@ai-sdk/openai": "catalog:",
- "@ai-sdk/react": "catalog:",
- "@ai-sdk/rsc": "catalog:",  // Keep if using RSC approach
- "ai": "catalog:",

After editing:
bun install

Verify no imports remain:
grep -r "@ai-sdk" apps/todox/src/
grep -r "from \"ai\"" apps/todox/src/

Note: Only remove after streaming implementation is complete and tested.
Do NOT remove if using RSC approach and @ai-sdk/rsc is still needed.
```

**Task 2.5: Add AbortController Ref**

**Agent**: `effect-code-writer`

```
Update hook to use AbortController:

File: apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts

Add ref for AbortController (replacing boolean abortRef):

const abortControllerRef = useRef<AbortController | null>(null);

Update abort function:
const abort = useCallback(() => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setOperationState("idle");
}, []);

Update reset function:
const reset = useCallback(() => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStreamedContent("");
  setOperationState("idle");
  setError(null);
}, []);
```

### Step 3: Check

Run verification commands:

```bash
# Type check (MUST pass)
bun run check --filter @beep/todox

# Lint check
bun run lint --filter @beep/todox

# Verify no Vercel AI SDK imports (after dependency removal)
grep -r "@ai-sdk/openai" apps/todox/src/
grep -r "@ai-sdk/react" apps/todox/src/
grep -r "from \"ai\"" apps/todox/src/
# All should return empty

# Check for @ai-sdk/rsc only if removed
grep -r "@ai-sdk/rsc" apps/todox/src/

# Verify bun.lock updated
bun install
```

### Step 4: Verify (Manual Testing)

**Test 1: Streaming UX**
```
Prerequisites:
1. OPENAI_API_KEY set in root .env
2. Dev server running: cd apps/todox && bun run dev
3. Signed in via browser

Manual test:
1. Navigate to editor
2. Select text in editor
3. Open AI panel, select prompt
4. Verify:
   - Loading/streaming state appears
   - Tokens appear PROGRESSIVELY (not all at once)
   - First token appears within ~2 seconds
   - Result can be inserted into document
   - No console errors

Compare with P4 behavior:
- P4: Wait several seconds, then entire text appears at once
- P5: Text appears token by token during generation
```

**Test 2: Abort During Stream**
```
1. Start AI operation
2. Click cancel/abort mid-stream
3. Verify:
   - Stream stops immediately
   - No more tokens appear
   - State returns to idle
   - No console errors
   - Partial content NOT auto-inserted
```

**Test 3: Error Handling**
```
Test 3a: Network interruption
1. Start AI operation
2. Disconnect network mid-stream (DevTools > Network > Offline)
3. Verify error state and message

Test 3b: Invalid API key
1. Set invalid OPENAI_API_KEY
2. Restart dev server
3. Attempt AI operation
4. Verify user-friendly error message
```

**Test 4: Dependency Cleanup Verification**
```
1. After removing deps, verify:
   - bun install completes without errors
   - bun run check passes
   - bun run dev starts without import errors
   - AI feature works in browser
```

---

## Key Files

### Primary (Must Modify/Create)

| File | Change Type |
|------|-------------|
| `apps/todox/src/services/ai/TextImprovementService.ts` | **MODIFY** - Add `improveTextStream` method |
| `apps/todox/src/app/api/ai/stream/route.ts` | **CREATE** - SSE streaming endpoint |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | **MODIFY** - SSE consumption |
| `apps/todox/package.json` | **MODIFY** - Remove unused deps |

### Reference (Read Only)

| File | Purpose |
|------|---------|
| `.claude/skills/effect-ai-streaming/SKILL.md` | StreamPart protocol, accumulation patterns |
| `.claude/skills/effect-ai-language-model/SKILL.md` | streamText API reference |
| `apps/todox/src/services/ai/LlmLive.ts` | Existing layer (no changes) |
| `apps/todox/src/services/ai/errors.ts` | Existing errors (no changes) |
| `apps/todox/src/actions/ai.ts` | Existing action (may deprecate or keep as fallback) |

---

## Constraints

### Effect Patterns (REQUIRED)

```typescript
// Namespace imports
import * as Stream from "effect/Stream";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as O from "effect/Option";

// StreamPart handling with Match.tag
stream.pipe(
  Stream.mapEffect((part) =>
    Match.value(part).pipe(
      Match.tag("text-delta", ({ delta }) => Effect.succeed(delta)),
      Match.tag("error", ({ error }) => Effect.fail(mapAiError(error))),
      Match.orElse(() => Effect.succeed(""))
    )
  )
);

// Stream consumption
Stream.runForEach(stream, (delta) =>
  Effect.sync(() => writer.write(data))
);

// Resource cleanup
Effect.ensuring(
  Effect.sync(() => writer.close())
);

// FORBIDDEN
stream.forEach(...)  // Use Stream.runForEach
if (part.type === "text-delta")  // Use Match.tag
```

### SSE Protocol

```
// Server writes:
data: {"delta":"Hello"}\n\n
data: {"delta":" world"}\n\n
data: {"done":true}\n\n

// Or on error:
data: {"error":{"code":"RATE_LIMIT","message":"..."}}\n\n

// Headers required:
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

---

## Agent Assignments

| Step | Agent Type | Task | Output |
|------|------------|------|--------|
| 1.1 | `mcp-researcher` | Effect.Stream to AsyncIterable | Conversion pattern |
| 1.2 | `codebase-researcher` | RSC vs SSE decision | Recommended approach |
| 1.3 | `mcp-researcher` | StreamPart protocol | Match.tag pattern |
| 2.1 | `effect-code-writer` | Add `improveTextStream` | Updated service |
| 2.2 | `effect-code-writer` | Create SSE endpoint | New API route |
| 2.3 | `effect-code-writer` | Update client hook | SSE consumption |
| 2.4 | `effect-code-writer` | Remove deps | Updated package.json |
| 3 | Orchestrator | Run checks | Verification results |
| 4 | Manual | Browser testing | Streaming verified |

---

## Success Criteria

Phase 5 is COMPLETE when ALL boxes checked:

### Streaming Implementation

- [ ] `TextImprovementService.improveTextStream` method exists
- [ ] SSE endpoint at `/api/ai/stream` delivers progressive tokens
- [ ] Client hook consumes SSE and updates state progressively
- [ ] First token latency < 2 seconds
- [ ] Tokens appear one-by-one (not batched)

### State Management

- [ ] State transitions: idle -> streaming -> complete/error
- [ ] `streamedContent` updates incrementally during streaming
- [ ] Abort stops stream cleanly
- [ ] Error payloads display user-friendly messages

### Dependency Cleanup

- [ ] `@ai-sdk/openai` removed (no imports found)
- [ ] `@ai-sdk/react` removed (no imports found)
- [ ] `ai` package removed (no imports found)
- [ ] `@ai-sdk/rsc` removed OR kept if RSC approach used
- [ ] `bun install` succeeds after removal

### Code Quality

- [ ] Type check passes: `bun run check --filter @beep/todox`
- [ ] Lint passes: `bun run lint --filter @beep/todox`
- [ ] Effect namespace imports used correctly
- [ ] Match.tag for StreamPart handling
- [ ] Proper resource cleanup (writer.close())

---

## Verification Commands

```bash
# Type check (MUST pass)
bun run check --filter @beep/todox

# Lint check
bun run lint --filter @beep/todox

# Verify dependencies removed (after step 2.4)
grep -r "@ai-sdk/openai" apps/todox/src/  # Should be empty
grep -r "@ai-sdk/react" apps/todox/src/   # Should be empty
grep -r "from \"ai\"" apps/todox/src/      # Should be empty

# Start dev server for manual testing
cd apps/todox && bun run dev

# Test SSE endpoint directly
curl -X POST http://localhost:3000/api/ai/stream \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","instruction":"Improve clarity"}'
# Should stream: data: {"delta":"..."}\n\n
```

---

## Post-Phase Actions

After completing Phase 5:

1. **Update Reflection Log**
   - Add learnings to `specs/liveblocks-lexical-ai-integration/REFLECTION_LOG.md`
   - Document streaming latency measurements
   - Note any SSE-specific challenges

2. **Mark Spec Complete**
   - Update `specs/liveblocks-lexical-ai-integration/README.md`
   - Set status to COMPLETE
   - Document all phases completed

3. **Future Considerations**
   - Consider adding Effect.withSpan for observability
   - Consider integration tests for streaming
   - Document streaming architecture for future reference

---

## Fallback Plan

If streaming proves too complex within time constraints:

1. **Keep P4 non-streaming as stable baseline**
2. **Create separate feature flag**: `ENABLE_AI_STREAMING`
3. **Document streaming as future enhancement**
4. **Still remove unused deps** (except @ai-sdk/rsc if needed for fallback)

---

## Quick Reference Checklist

```
[ ] Phase Setup
    [ ] Read HANDOFF_P5.md for context
    [ ] Review .claude/skills/effect-ai-streaming/SKILL.md
    [ ] Dev server starts successfully
    [ ] OPENAI_API_KEY configured

[ ] Discovery
    [ ] Effect.Stream -> AsyncIterable pattern found
    [ ] Streaming approach decided (SSE vs RSC)
    [ ] StreamPart handling pattern documented

[ ] Implementation
    [ ] improveTextStream method added to service
    [ ] SSE endpoint created at /api/ai/stream
    [ ] useAiStreaming hook updated for SSE
    [ ] AbortController integration working
    [ ] Unused dependencies removed

[ ] Quality Gates
    [ ] bun run check passes
    [ ] bun run lint passes
    [ ] No @ai-sdk imports remain (except rsc if needed)
    [ ] Manual test: streaming tokens appear progressively
    [ ] Manual test: abort stops stream
    [ ] Manual test: errors display correctly
```

---

## Handoff Document

Read full context in: `specs/liveblocks-lexical-ai-integration/handoffs/HANDOFF_P5.md`

For Effect AI streaming: `.claude/skills/effect-ai-streaming/SKILL.md`

For LanguageModel API: `.claude/skills/effect-ai-language-model/SKILL.md`
