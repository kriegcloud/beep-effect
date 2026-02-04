# Phase 4 Orchestrator Prompt: Effect AI Migration

> **Spec**: Liveblocks Lexical AI Integration
> **Phase**: 4 of 4
> **Focus**: Replace Vercel AI SDK with Effect AI patterns for codebase consistency

Copy-paste this entire prompt to start Phase 4 implementation.

---

## Mission Statement

Migrate the AI server action and streaming infrastructure from Vercel AI SDK (`@ai-sdk/openai`, `@ai-sdk/rsc`) to Effect AI patterns (`@effect/ai-openai`). This ensures the AI integration follows the same functional, typed patterns used throughout the codebase, providing consistent error handling via `S.TaggedError`, structured logging via `Effect.log*`, and dependency injection via Layers.

---

## Context

### Phase 1-3 Completion Summary

| Phase | Focus | Key Outcomes |
|-------|-------|--------------|
| P1 | Infrastructure Verification | Fixed room pattern (`liveblocks:playground:*`), typed env via `Redacted.value(serverEnv.liveblocks.secretKey)` |
| P2 | Real Session Integration | Replaced mock sessions with better-auth, 401 for unauthenticated, UserMeta from real session |
| P3 | AI Streaming Verification | Verified OpenAI API works, error handling implemented for API failures, presence broadcasting confirmed |

**Files Modified in P1-P3**:
- `apps/todox/src/app/api/liveblocks-auth/route.ts` - Real better-auth session integration
- `apps/todox/src/actions/ai.ts` - Error handling added (Vercel AI SDK)

### Current State

The AI server action uses Vercel AI SDK:

```typescript
// apps/todox/src/actions/ai.ts - CURRENT
"use server";
import { openai } from "@ai-sdk/openai";
import { APICallError, LoadAPIKeyError, NoSuchModelError } from "@ai-sdk/provider";
import { createStreamableValue } from "@ai-sdk/rsc";
import { streamText } from "ai";

// Uses:
// - async/await + try/catch for error handling
// - instanceof checks for error categorization
// - createStreamableValue for RSC streaming
// - Manual error code mapping to AiError interface
```

The client hook consumes Vercel AI SDK streams:

```typescript
// apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts
import { readStreamableValue } from "@ai-sdk/rsc";
import { improveText } from "@beep/todox/actions/ai";

// Uses:
// - for await...of readStreamableValue() pattern
// - React useState for streaming state
```

### Target State

After Phase 4:

```typescript
// apps/todox/src/services/ai/TextImprovementService.ts - NEW
import * as LanguageModel from "@effect/ai/LanguageModel";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export class TextImprovementError extends S.TaggedError<TextImprovementError>()(
  "TextImprovementError",
  { code: S.Literal("API_KEY_MISSING", "RATE_LIMIT", "MODEL_UNAVAILABLE", "NETWORK_ERROR", "UNKNOWN"), message: S.String }
) {}

export class TextImprovementService extends Effect.Service<TextImprovementService>()(...) {
  improveText: (text: string, instruction: string) => Effect.Effect<string, TextImprovementError>
}
```

```typescript
// apps/todox/src/services/ai/LlmLive.ts - NEW
import { OpenAiLanguageModel } from "@effect/ai-openai";
// Layer providing LanguageModel.LanguageModel service for todox
```

```typescript
// apps/todox/src/actions/ai.ts - MIGRATED
"use server";
import { runServerPromise } from "@beep/runtime-server";
// Uses Effect.gen, Effect.catchTag, structured Effect.logError
```

---

## Workflow: Discovery -> Execute -> Check -> Verify

### Step 1: Discovery (3 Parallel Agents)

Deploy `codebase-researcher` agents to gather context:

**Agent A: Effect AI Layer Patterns**
```
Research how Effect AI layers are structured in this codebase:

1. Read packages/knowledge/server/src/Runtime/LlmLayers.ts
2. Understand the config-driven provider selection pattern
3. Note how makeOpenAiLayer composes HttpClient layer
4. Document the LlmConfig pattern for environment variables

Output: Layer composition pattern for todox LlmLive
Files to examine:
- packages/knowledge/server/src/Runtime/LlmLayers.ts (reference implementation)
- packages/shared/ai/src/providers.ts (existing provider layers)
- .claude/skills/effect-ai-provider/SKILL.md (API reference)
```

**Agent B: Effect AI Service Patterns**
```
Research how Effect AI services are implemented in this codebase:

1. Read packages/knowledge/server/src/Extraction/EntityExtractor.ts
2. Note the Effect.Service pattern with Effect.gen
3. Understand how LanguageModel.LanguageModel is yielded
4. Document the generateObject/generateText usage patterns

Output: Service implementation pattern for TextImprovementService
Files to examine:
- packages/knowledge/server/src/Extraction/EntityExtractor.ts (service pattern)
- packages/knowledge/server/src/Extraction/MentionExtractor.ts (another service)
- .claude/skills/effect-ai-language-model/SKILL.md (API reference)
```

**Agent C: Server Action Patterns**
```
Research how server actions use Effect in this codebase:

1. Find other server actions using runServerPromise
2. Understand how Effect errors map to client responses
3. Note any RSC streaming patterns with Effect (may not exist yet)
4. Document the error handling approach for server actions

Output: Server action migration approach
Files to examine:
- apps/todox/src/app/api/liveblocks-auth/route.ts (Effect in route handlers)
- packages/runtime/server/src/*.ts (runServerPromise implementation)
- apps/todox/src/actions/*.ts (existing action patterns)
```

### Step 2: Execute (Sequential)

**Task 2.1: Create Tagged Errors for AI Operations**

**Agent**: `effect-code-writer`

```
Create typed errors for AI operations:

File: apps/todox/src/services/ai/errors.ts

Requirements:
1. Create TextImprovementError with S.TaggedError
2. Map existing AiErrorCode values to error schema
3. Include code and message fields
4. Export error type for client consumption

Reference patterns:
- packages/knowledge/server/src/Extraction/schemas/*.ts (error schema examples)
- .claude/rules/effect-patterns.md (TaggedError requirements)

Target output:
export class TextImprovementError extends S.TaggedError<TextImprovementError>()(
  "TextImprovementError",
  {
    code: S.Literal(
      "API_KEY_MISSING",
      "API_KEY_INVALID",
      "RATE_LIMIT",
      "MODEL_UNAVAILABLE",
      "NETWORK_ERROR",
      "UNKNOWN"
    ),
    message: S.String,
  }
) {}
```

**Task 2.2: Create LLM Layer for todox**

**Agent**: `effect-code-writer`

```
Create config-driven LLM Layer:

File: apps/todox/src/services/ai/LlmLive.ts

Requirements:
1. Use OpenAiLanguageModel from @effect/ai-openai
2. Read OPENAI_API_KEY via Config.redacted
3. Make model configurable (default: gpt-4-turbo)
4. Compose with FetchHttpClient.layer (browser-compatible)
5. Export LlmLive layer

Reference:
- packages/knowledge/server/src/Runtime/LlmLayers.ts (pattern)
- packages/shared/ai/src/providers.ts (simpler example)

Target structure:
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const OpenAiConfig = Config.all({
  apiKey: Config.redacted("OPENAI_API_KEY"),
  model: Config.string("OPENAI_MODEL").pipe(Config.withDefault("gpt-4-turbo")),
});

export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* OpenAiConfig;
    return OpenAiLanguageModel.layer({ model: config.model }).pipe(
      Layer.provide(
        OpenAiClient.layer({ apiKey: config.apiKey }).pipe(
          Layer.provide(FetchHttpClient.layer)
        )
      )
    );
  })
);
```

**Task 2.3: Create TextImprovementService**

**Agent**: `effect-code-writer`

```
Create the AI service using Effect patterns:

File: apps/todox/src/services/ai/TextImprovementService.ts

Requirements:
1. Use Effect.Service pattern
2. Yield LanguageModel.LanguageModel from context
3. Implement improveText method with LanguageModel.generateText
4. Map LanguageModel errors to TextImprovementError
5. Add Effect.logDebug for telemetry
6. Return plain text result (not stream for MVP)

System prompt:
"You are a professional writing assistant. Your task is to improve or transform the given text according to the user's instruction.

IMPORTANT:
- Return ONLY the improved/transformed text
- Do NOT include explanations, comments, or meta-text
- Do NOT wrap the text in quotes or code blocks
- Preserve the original formatting style unless the instruction specifically asks to change it"

Reference:
- packages/knowledge/server/src/Extraction/EntityExtractor.ts (service pattern)
- .claude/skills/effect-ai-language-model/SKILL.md (generateText usage)
```

**Task 2.4: Migrate Server Action to Effect**

**Agent**: `effect-code-writer`

```
Migrate the server action from Vercel AI SDK to Effect:

File: apps/todox/src/actions/ai.ts

Requirements:
1. Use "use server" directive
2. Import TextImprovementService
3. Use runServerPromise from @beep/runtime-server
4. Use Effect.gen for the main flow
5. Use Effect.catchTag for error handling
6. Map TextImprovementError to AiResult type
7. Add Effect.logError for failures
8. Preserve existing AiResult interface for backward compatibility

CRITICAL - Response Format:
Keep the existing AiResult discriminated union for client compatibility:
export type AiResult =
  | { readonly success: true; readonly text: string }
  | { readonly success: false; readonly error: AiError }

Note: Streaming will be addressed in a follow-up. Initial migration uses
non-streaming LanguageModel.generateText for simplicity.

Pattern:
export async function improveText(selectedText: string, instruction: string): Promise<AiResult> {
  return runServerPromise(
    Effect.gen(function* () {
      const service = yield* TextImprovementService;
      const text = yield* service.improveText(selectedText, instruction);
      return { success: true, text } as const;
    }).pipe(
      Effect.catchTag("TextImprovementError", (error) =>
        Effect.succeed({ success: false, error: { code: error.code, message: error.message } } as const)
      ),
      Effect.provide(/* layers */)
    ),
    "actions.ai.improveText"
  );
}
```

**Task 2.5: Update Client Hook**

**Agent**: `effect-code-writer`

```
Update client hook to consume non-streaming response:

File: apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts

Requirements:
1. Remove @ai-sdk/rsc import (readStreamableValue)
2. Handle non-streaming response from server action
3. Preserve streaming state machine (idle -> streaming -> complete/error)
4. Simulate progressive display if desired (optional)
5. Keep abort/reset functionality

Note: True streaming will be addressed in future work.
For now, set content atomically after receiving response.

Changes:
- Remove: for await (const chunk of readStreamableValue(result.stream))
- Add: setStreamedContent(result.text);
```

**Task 2.6: Add Structured Logging**

**Agent**: `effect-code-writer`

```
Add Effect.log instrumentation to AI operations:

File: apps/todox/src/services/ai/TextImprovementService.ts

Requirements:
1. Add Effect.logDebug at operation start
2. Add Effect.logDebug at operation success
3. Add Effect.logError on failure (before mapping)
4. Include structured metadata (text length, instruction, duration)

Pattern:
yield* Effect.logDebug("TextImprovementService.improveText starting", {
  textLength: text.length,
  instructionPreview: instruction.slice(0, 50),
});

// After success:
yield* Effect.logDebug("TextImprovementService.improveText complete", {
  resultLength: result.text.length,
});
```

**Task 2.7: Create Service Index**

**Agent**: `effect-code-writer`

```
Create barrel export for AI services:

File: apps/todox/src/services/ai/index.ts

Contents:
export * from "./errors";
export * from "./LlmLive";
export * from "./TextImprovementService";
```

### Step 3: Check

Run verification commands:

```bash
# Type check (MUST pass)
bun run check --filter @beep/todox

# Lint check
bun run lint --filter @beep/todox

# Verify Effect AI packages are available
bun ls @effect/ai @effect/ai-openai --filter @beep/todox
```

### Step 4: Verify (Manual Testing)

**Test 1: Non-Streaming AI Operation**
```
Prerequisites:
1. OPENAI_API_KEY set in apps/todox/.env.local
2. Dev server running: cd apps/todox && bun run dev
3. Signed in via browser

Manual test:
1. Navigate to editor with collaborative features
2. Select some text in the editor
3. Open AI assistant panel
4. Select "Improve Writing" prompt
5. Verify:
   - Loading state appears
   - Result appears (may be atomic instead of streaming)
   - Result can be inserted into document
   - No console errors

Success criteria:
- AI response received successfully
- Response quality same as before migration
- Error states display correctly
```

**Test 2: Error Handling**
```
Test 2a: Missing API key
1. Remove/rename OPENAI_API_KEY from .env.local
2. Restart dev server
3. Attempt AI operation
4. Verify: User-friendly error message displayed (API_KEY_MISSING)

Test 2b: Invalid API key
1. Set OPENAI_API_KEY to invalid value
2. Attempt AI operation
3. Verify: User-friendly error message displayed (API_KEY_INVALID)
```

**Test 3: Logging Verification**
```
1. Run dev server with DEBUG=* or check Effect logs
2. Perform AI operation
3. Verify structured logs appear:
   - "TextImprovementService.improveText starting"
   - "TextImprovementService.improveText complete"
4. On error, verify Effect.logError output
```

---

## Key Files

### Primary (Must Modify/Create)

| File | Change Type |
|------|-------------|
| `apps/todox/src/services/ai/errors.ts` | **CREATE** - Tagged error definitions |
| `apps/todox/src/services/ai/LlmLive.ts` | **CREATE** - LLM Layer |
| `apps/todox/src/services/ai/TextImprovementService.ts` | **CREATE** - AI service |
| `apps/todox/src/services/ai/index.ts` | **CREATE** - Barrel export |
| `apps/todox/src/actions/ai.ts` | **MIGRATE** - Server action |
| `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | **UPDATE** - Client hook |
| `apps/todox/package.json` | **UPDATE** - Add @effect/ai-openai if missing |

### Reference (Read Only)

| File | Purpose |
|------|---------|
| `packages/knowledge/server/src/Runtime/LlmLayers.ts` | Layer factory pattern |
| `packages/knowledge/server/src/Extraction/EntityExtractor.ts` | Service + generateObject pattern |
| `packages/shared/ai/src/providers.ts` | Existing provider layers |
| `.claude/skills/effect-ai-language-model/SKILL.md` | API reference |
| `.claude/skills/effect-ai-streaming/SKILL.md` | Streaming patterns (future reference) |
| `.claude/skills/effect-ai-provider/SKILL.md` | Provider configuration |

---

## Constraints

### Effect Patterns (REQUIRED)

From `.claude/rules/effect-patterns.md`:

```typescript
// Namespace imports (REQUIRED)
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Config from "effect/Config";
import * as S from "effect/Schema";
import * as LanguageModel from "@effect/ai/LanguageModel";

// Tagged errors (REQUIRED)
export class MyError extends S.TaggedError<MyError>()("MyError", { ... }) {}

// Service pattern (REQUIRED)
export class MyService extends Effect.Service<MyService>()("MyService", {
  effect: Effect.gen(function* () {
    const dep = yield* SomeDependency;
    return { ... };
  }),
}) {}

// FORBIDDEN patterns
throw new Error("...")           // Use Effect.fail(new TaggedError(...))
async/await with try/catch       // Use Effect.gen + Effect.catchTag
instanceof checks                // Use tagged error matching
```

### Layer Composition

```typescript
// Provider Layer pattern
const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* MyConfig;
    return OpenAiLanguageModel.layer({ model: config.model }).pipe(
      Layer.provide(OpenAiClient.layer({ apiKey: config.apiKey })),
      Layer.provide(FetchHttpClient.layer)
    );
  })
);

// Service usage in Effect.gen
Effect.gen(function* () {
  const service = yield* TextImprovementService;
  return yield* service.improveText(text, instruction);
}).pipe(
  Effect.provide(TextImprovementServiceLive),
  Effect.provide(LlmLive)
);
```

### Server Action Pattern

```typescript
// Using runServerPromise
import { runServerPromise } from "@beep/runtime-server";

export async function myAction(input: Input): Promise<Output> {
  return runServerPromise(
    Effect.gen(function* () {
      // Effect operations
    }).pipe(
      Effect.catchTag("MyError", (error) => Effect.succeed(errorResult)),
      Effect.provide(layers)
    ),
    "actions.myAction"  // Span name for tracing
  );
}
```

### Effect Documentation Resource

The `effect-docs` MCP tool is available for looking up Effect ecosystem documentation. Use this when implementing Effect AI patterns to ensure API usage is correct and up-to-date.

**Available MCP Functions**:
- `mcp__effect_docs__effect_docs_search(query)` - Search for topics like "LanguageModel", "generateText", "streamText", "TaggedError", "Effect.gen", "catchTag"
- `mcp__effect_docs__get_effect_doc(documentId)` - Retrieve full documentation for a specific document ID (returned from search results)

**Common Search Queries**:
- `"LanguageModel"` - Core API for text generation
- `"generateText"` - Non-streaming text completion
- `"streamText"` - Streaming response patterns
- `"Effect.gen"` - Generator-based Effect composition
- `"Effect.catchTag"` - Tagged error handling
- `"Layer"` - Dependency injection and service composition
- `"@effect/ai-openai"` - OpenAI provider setup

### Effect Source Code Reference

The official Effect repository is cloned at `tmp/effect/` for direct source code reference when the MCP docs are insufficient:

| Package | Location | Use Case |
|---------|----------|----------|
| `@effect/ai` | `tmp/effect/packages/ai/` | LanguageModel, Prompt, StreamPart types |
| `@effect/ai-openai` | `tmp/effect/packages/ai-openai/` | OpenAiClient, OpenAiLanguageModel |
| `effect` | `tmp/effect/packages/effect/` | Core Effect, Stream, Layer APIs |

Use Glob/Grep to search the source when you need implementation details or type definitions not covered by documentation.

---

## Agent Assignments

| Step | Agent Type | Task | Output |
|------|------------|------|--------|
| 1a | `codebase-researcher` | Effect AI Layer patterns | Layer composition approach |
| 1b | `codebase-researcher` | Effect AI Service patterns | Service implementation approach |
| 1c | `codebase-researcher` | Server action patterns | Migration approach |
| 2.1 | `effect-code-writer` | Create tagged errors | `errors.ts` |
| 2.2 | `effect-code-writer` | Create LLM Layer | `LlmLive.ts` |
| 2.3 | `effect-code-writer` | Create AI Service | `TextImprovementService.ts` |
| 2.4 | `effect-code-writer` | Migrate server action | Updated `ai.ts` |
| 2.5 | `effect-code-writer` | Update client hook | Updated `useAiStreaming.ts` |
| 2.6 | `effect-code-writer` | Add structured logging | Enhanced service |
| 2.7 | `effect-code-writer` | Create barrel export | `index.ts` |
| 3 | Orchestrator | Run type/lint checks | Verification results |
| 4 | Manual | Browser testing | Validation checklist |

---

## Success Criteria

Phase 4 is COMPLETE when ALL boxes checked:

### Effect AI Migration

- [ ] `@effect/ai-openai` installed and imported (replaces `@ai-sdk/openai`)
- [ ] Server action uses `Effect.gen`, not `async/await`
- [ ] Error handling uses `S.TaggedError` + `Effect.catchTag`
- [ ] LLM Layer follows pattern from `@beep/knowledge-server`
- [ ] Service uses `Effect.Service` pattern
- [ ] `runServerPromise` used for Effect -> Promise bridge

### Structured Logging

- [ ] `Effect.logDebug` at operation start
- [ ] `Effect.logDebug` at operation success
- [ ] `Effect.logError` on failures
- [ ] Logs include structured metadata (text length, timing)

### Code Quality

- [ ] Type check passes: `bun run check --filter @beep/todox`
- [ ] Lint check passes: `bun run lint --filter @beep/todox`
- [ ] No new TypeScript errors introduced
- [ ] All Effect namespace imports used correctly

### Functional Parity

- [ ] AI text improvement works end-to-end
- [ ] Error messages display correctly for API failures
- [ ] Abort/reset functionality preserved
- [ ] No regression in user experience

---

## Verification Commands

```bash
# Type check (MUST pass)
bun run check --filter @beep/todox

# Lint check
bun run lint --filter @beep/todox

# Start dev server for manual testing
cd apps/todox && bun run dev

# Verify Effect AI package installed
bun ls @effect/ai @effect/ai-openai --filter @beep/todox

# If missing, install:
bun add @effect/ai @effect/ai-openai --filter @beep/todox

# Check for console errors during runtime
# Open DevTools > Console > Filter for errors
```

---

## Post-Phase Actions

After completing Phase 4:

1. **Update Reflection Log**
   - Add learnings to `specs/liveblocks-lexical-ai-integration/REFLECTION_LOG.md`
   - Document any issues discovered during migration
   - Note performance observations (response time comparison)

2. **Create Final Summary**
   - Update `specs/liveblocks-lexical-ai-integration/outputs/README.md`
   - Document all phases completed
   - Mark spec as COMPLETE

3. **Future Work Documentation**
   - Document Effect AI streaming migration (future enhancement)
   - Note RSC streaming patterns with Effect if discovered
   - Capture any additional error cases to handle

4. **Cleanup**
   - Remove `@ai-sdk/openai`, `@ai-sdk/provider`, `@ai-sdk/rsc` if no longer used
   - Remove any dead code paths from previous implementation

---

## Future Enhancement: Streaming Migration

**Note**: This phase migrates to non-streaming Effect AI for simplicity. True streaming with Effect AI can be added in a future iteration:

```typescript
// Future streaming pattern with Effect AI
import * as LanguageModel from "@effect/ai/LanguageModel";
import * as Stream from "effect/Stream";

const streamResponse = LanguageModel.streamText({
  prompt: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
});

// Process stream parts
streamResponse.pipe(
  Stream.runForEach((part) =>
    Match.value(part).pipe(
      Match.tag("text-delta", ({ delta }) => updateUI(delta)),
      Match.tag("finish", ({ usage }) => recordMetrics(usage)),
      Match.orElse(() => Effect.void)
    )
  )
);
```

This would require:
- Custom RSC streaming adapter for Effect.Stream
- Server action returning serializable stream
- Client hook consuming Effect-based stream

---

## Handoff Document

Read full context in: `specs/liveblocks-lexical-ai-integration/handoffs/HANDOFF_P3.md`

For Effect AI patterns: `.claude/skills/effect-ai-language-model/SKILL.md`

For Layer patterns: `packages/knowledge/server/src/Runtime/LlmLayers.ts`

---

## Quick Reference: Migration Checklist

```
[ ] Phase Setup
    [ ] Read HANDOFF_P3.md for context
    [ ] Verify OPENAI_API_KEY in .env.local
    [ ] Dev server starts successfully

[ ] Discovery
    [ ] Agent A: Layer patterns researched
    [ ] Agent B: Service patterns researched
    [ ] Agent C: Server action patterns researched

[ ] Implementation
    [ ] errors.ts created with S.TaggedError
    [ ] LlmLive.ts created with config-driven layer
    [ ] TextImprovementService.ts created with Effect.Service
    [ ] ai.ts migrated to Effect.gen
    [ ] useAiStreaming.ts updated for non-streaming
    [ ] index.ts barrel export created

[ ] Quality Gates
    [ ] bun run check passes
    [ ] bun run lint passes
    [ ] Manual test: AI operation works
    [ ] Manual test: Error handling works
    [ ] Structured logs visible
```
