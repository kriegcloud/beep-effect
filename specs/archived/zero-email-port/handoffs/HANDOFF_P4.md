# Phase 4 Handoff: AI Features RPC

**Date**: 2026-01-29
**From**: Phase 3 (User Features RPC)
**To**: Phase 4 (AI Features RPC)
**Status**: Ready for implementation

---

## Context for Phase 4

### Working Context (Current Objectives)

**Current Task**: Implement AI-powered email features using `@effect/ai` native patterns including compose assist, subject generation, smart search, summaries, and Brain auto-labeling.

**Success Criteria**:
- LLM provider Layer configured (Anthropic/OpenAI)
- EmailAiService implemented with LanguageModel integration
- AI RPC contracts (compose, generateSubject, generateSearchQuery) operational
- Brain RPC contracts (generateSummary, suggestLabels, enable/disable, label management) operational
- Streaming support for compose assist
- All handlers pass type check

**Blocking Issues**: None expected - requires familiarity with `@effect/ai` patterns.

**Immediate Dependencies**:
- `@effect/ai` and `@effect/ai-anthropic`/`@effect/ai-openai` packages
- `LanguageModel.LanguageModel` service from `@effect/ai`
- P2 `MailDriver` for fetching thread context
- P3 patterns for RPC contracts and handlers
- `ThreadSummaryRepo` for caching summaries

### Episodic Context (Previous Phase Summary)

**Phase 3 Outcome**: User customization RPC contracts and handlers were implemented:
- Templates, Notes, Shortcuts, Settings RPC groups
- Repository pattern for database CRUD operations
- Handler pattern with user-scoped queries via `Policy.AuthContext`

**Key Decisions Made**:
1. Database-focused handlers are simpler than provider-integrated handlers
2. Repository interface pattern with `Layer.effect()` implementation
3. All handlers return typed success schemas
4. RPC groups use `.prefix()` for namespacing

**Patterns Discovered**:
- Use `Effect.catchTags()` for graceful error handling
- Repository methods return `Option` for single-item lookups
- Effect services should be fine-grained capabilities

### Semantic Context (Tech Stack Constants)

**Tech Stack**:
- `@effect/ai` for LanguageModel abstraction
- `@effect/ai-anthropic` for Claude integration
- `@effect/ai-openai` for OpenAI fallback
- Effect 3, `effect/Schema`, `@effect/rpc`

**Package Structure**:
```
packages/comms/
  server/src/ai/
    LlmLayers.ts           # Provider configuration
    EmailAiService.ts      # AI service implementation
    tools/email-tools.ts   # Tool definitions (optional)
  domain/src/rpc/v1/ai/    # AI RPC contracts
  domain/src/rpc/v1/brain/ # Brain RPC contracts
  server/src/rpc/v1/ai/    # AI handlers
  server/src/rpc/v1/brain/ # Brain handlers
```

**Standards**:
- Use `LanguageModel.LanguageModel` service from `@effect/ai`
- Use `Prompt.make()` for building prompts
- Use `model.generateObject()` for structured output
- Use `model.streamText()` for streaming responses

### Procedural Context (Reference Links)

- Effect AI patterns: Use `mcp-researcher` to query @effect/ai documentation
- Effect patterns: `.claude/rules/effect-patterns.md`
- Phase planning: `specs/zero-email-port/phases/P4-ai-features-rpc.md`
- Existing knowledge AI: `packages/knowledge/server/src/ai/` (if exists)

---

## AI Service Architecture

```
                    ┌─────────────────────────────────────┐
                    │     @effect/ai/LanguageModel        │
                    │  (Abstract interface - provider-    │
                    │   agnostic LLM abstraction)         │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            ┌───────▼───────┐             ┌───────▼───────┐
            │ @effect/      │             │ @effect/      │
            │ ai-anthropic  │             │ ai-openai     │
            └───────────────┘             └───────────────┘
```

---

## Methods to Implement

### AI Router (P4-1)

| Method | RPC Name | Parameters | Returns |
|--------|----------|------------|---------|
| Compose email | `ai_compose` | `{ prompt, context?, threadId?, tone?, stream? }` | `{ subject?, body?, streaming? }` |
| Generate subject | `ai_generateSubject` | `{ body }` | `{ subject }` |
| Generate search query | `ai_generateSearchQuery` | `{ query }` | `{ searchQuery }` |

### Brain Router (P4-2)

| Method | RPC Name | Parameters | Returns |
|--------|----------|------------|---------|
| Generate summary | `brain_generateSummary` | `{ threadId }` | `{ summary: ThreadSummary \| null }` |
| Suggest labels | `brain_suggestLabels` | `{ threadId }` | `{ suggestedLabels, confidence }` |
| Enable Brain | `brain_enableBrain` | `{}` | `{ success }` |
| Disable Brain | `brain_disableBrain` | `{}` | `{ success }` |
| Get Brain state | `brain_getBrainState` | `{}` | `{ enabled }` |
| Get Brain labels | `brain_getBrainLabels` | `{}` | `{ labels: BrainLabel[] }` |
| Update Brain labels | `brain_updateBrainLabels` | `{ labels }` | `{ success }` |

---

## Schema Patterns

### Compose Success Schema

```typescript
export class Success extends S.Class<Success>($I`Success`)({
  subject: S.optional(S.String),
  body: S.optional(S.String),
  streaming: S.optional(S.Boolean),
}) {}
```

### ThreadSummary Schema

```typescript
export class ThreadSummary extends S.Class<ThreadSummary>($I`ThreadSummary`)({
  short: S.String,
  detailed: S.optional(S.String),
  keyPoints: S.optional(S.Array(S.String)),
  actionItems: S.optional(S.Array(S.String)),
}) {}
```

### BrainLabel Schema

```typescript
export class BrainLabel extends S.Class<BrainLabel>($I`BrainLabel`)({
  name: S.String,
  usecase: S.String,
}) {}
```

---

## LLM Provider Layer Pattern

```typescript
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const LlmConfig = Config.all({
  provider: Config.string("LLM_PROVIDER").pipe(Config.withDefault("anthropic")),
  apiKey: Config.redacted("LLM_API_KEY"),
  model: Config.string("LLM_MODEL").pipe(Config.withDefault("claude-sonnet-4-20250514")),
});

export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* LlmConfig;
    return config.provider === "openai"
      ? makeOpenAiLayer(config.apiKey, config.model)
      : makeAnthropicLayer(config.apiKey, config.model);
  })
);
```

---

## EmailAiService Pattern

```typescript
import { LanguageModel, Prompt } from "@effect/ai";
import * as Effect from "effect/Effect";

export class EmailAiService extends Effect.Service<EmailAiService>()("EmailAiService", {
  accessors: true,
  effect: Effect.gen(function* () {
    const model = yield* LanguageModel.LanguageModel;

    return {
      composeEmail: Effect.fnUntraced(function* (prompt, options) {
        const result = yield* model.generateObject({
          prompt: Prompt.make([
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ]),
          schema: ComposedEmailSchema,
          objectName: "ComposedEmail",
        });
        return result.value;
      }),

      generateSubject: Effect.fnUntraced(function* (body) {
        const result = yield* model.generateText({
          prompt: Prompt.make([
            { role: "system", content: "Generate a concise email subject." },
            { role: "user", content: body },
          ]),
        });
        return result.text.trim();
      }),
    };
  }),
}) {}
```

---

## Implementation Order

1. **LlmLayers.ts** - Provider configuration
2. **EmailAiService.ts** - AI service with LanguageModel
3. **AI RPC contracts** - compose, generateSubject, generateSearchQuery
4. **Brain RPC contracts** - summary, labels, state management
5. **ThreadSummaryRepo** - Cache for summaries
6. **AI handlers** - compose, generateSubject, generateSearchQuery
7. **Brain handlers** - All 7 Brain RPCs
8. **Extend CommsRpcsLive** - Add AI and Brain RPC groups
9. **Wire LlmLive into Runtime** - Server layer composition

---

## Error Handling Pattern

```typescript
const robustAiCall = emailAi.composeEmail(prompt, options).pipe(
  // Retry transient errors
  Effect.retry({
    times: 2,
    schedule: Schedule.exponential("100 millis"),
  }),

  // Catch specific AI errors
  Effect.catchTag("AiServiceError", (error) =>
    Effect.succeed({
      subject: "Draft Email",
      body: `[AI unavailable - compose manually]\n\nPrompt: ${prompt}`,
    })
  ),

  // Add observability
  Effect.withSpan("EmailAiService.composeEmail", {
    attributes: { promptLength: prompt.length },
  })
);
```

---

## Verification Steps

After implementing each component:

```bash
# Check domain contracts
bun run check --filter @beep/comms-domain

# Check server handlers
bun run check --filter @beep/comms-server

# Run AI service tests
bun run test --filter @beep/comms-server -- --grep "EmailAiService"

# Lint
bun run lint --filter @beep/comms-*
```

---

## Known Issues & Gotchas

1. **LanguageModel import**: Import from `@effect/ai`, not `@effect/ai-anthropic`
2. **Prompt.make()**: Takes array of message objects with `role` and `content`
3. **generateObject**: Requires `schema` and `objectName` parameters
4. **Streaming**: Use `model.streamText()` returning `Stream.Stream`
5. **Config.redacted**: Use for API keys to prevent logging
6. **Graceful degradation**: Always catch AI errors and return fallback content

---

## Success Criteria

Phase 4 is complete when:

- [ ] `packages/comms/server/src/ai/LlmLayers.ts` - Provider configuration
- [ ] `packages/comms/server/src/ai/EmailAiService.ts` - AI service
- [ ] `packages/comms/domain/src/rpc/v1/ai/` - 3 contracts + `_rpcs.ts`
- [ ] `packages/comms/domain/src/rpc/v1/brain/` - 7 contracts + `_rpcs.ts`
- [ ] `packages/comms/server/src/repos/ThreadSummaryRepo.ts` - Cache
- [ ] Handlers for all 10 RPCs implemented
- [ ] `CommsRpcsLive` extended with AI and Brain RPC groups
- [ ] `LlmLive` wired into server runtime
- [ ] Type check passes: `bun run check --filter @beep/comms-*`
- [ ] Lint passes: `bun run lint --filter @beep/comms-*`
- [ ] `REFLECTION_LOG.md` updated with P4 learnings
- [ ] `HANDOFF_P5.md` created
- [ ] `P5_ORCHESTRATOR_PROMPT.md` created

---

## Agent Recommendations

| Agent | Task |
|-------|------|
| `mcp-researcher` | Research @effect/ai API patterns |
| `web-researcher` | Research Anthropic/OpenAI model capabilities |
| `test-writer` | Create EmailAiService tests with mocked LanguageModel |
| `code-observability-writer` | Add tracing spans for AI calls |
