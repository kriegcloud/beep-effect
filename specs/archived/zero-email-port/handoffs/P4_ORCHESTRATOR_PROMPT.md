# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Pre-Flight Checklist

Before executing this phase, verify Phase 3 context is preserved:

- [ ] P3 RPC contracts exist in `packages/comms/domain/src/rpc/v1/{templates,notes,shortcuts,settings}/`
- [ ] P3 handlers exist in `packages/comms/server/src/rpc/v1/{templates,notes,shortcuts,settings}/`
- [ ] P3 repositories exist in `packages/comms/server/src/repos/`
- [ ] `CommsRpcsLive` includes P3 RPC groups
- [ ] `REFLECTION_LOG.md` contains Phase 3 learnings

If Phase 3 artifacts are missing, complete P3 before proceeding.

---

## Prompt

You are implementing Phase 4 of the Zero Email Port spec.

### Context

Phases 1-3 completed email drivers, core email RPC, and user features RPC. Now we implement AI-powered features using `@effect/ai` native patterns.

This phase requires understanding of:
- `@effect/ai` LanguageModel abstraction
- Structured output with `generateObject`
- Streaming with `streamText`
- Provider Layer composition

### Your Mission

Implement AI-powered email features including compose assist, summaries, and Brain auto-labeling.

**Work Items**:
1. LLM provider Layer configuration (Anthropic/OpenAI)
2. EmailAiService with LanguageModel integration
3. AI RPC contracts (compose, generateSubject, generateSearchQuery)
4. Brain RPC contracts (summary, labels, state management)
5. ThreadSummaryRepo for caching
6. Handlers for all AI and Brain RPCs
7. Wire LlmLive into server runtime

### Critical Patterns

**LLM Provider Layer**:
```typescript
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import * as Layer from "effect/Layer";

const makeAnthropicLayer = (apiKey: Redacted.Redacted<string>, model: string) =>
  AnthropicLanguageModel.layer({ model }).pipe(
    Layer.provide(
      AnthropicClient.layer({ apiKey }).pipe(Layer.provide(FetchHttpClient.layer))
    )
  );

export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* LlmConfig;
    return makeAnthropicLayer(config.apiKey, config.model);
  })
);
```

**EmailAiService Pattern**:
```typescript
import { LanguageModel, Prompt } from "@effect/ai";

export class EmailAiService extends Effect.Service<EmailAiService>()("EmailAiService", {
  accessors: true,
  effect: Effect.gen(function* () {
    const model = yield* LanguageModel.LanguageModel;

    return {
      composeEmail: Effect.fnUntraced(function* (prompt, options) {
        const result = yield* model.generateObject({
          prompt: Prompt.make([
            { role: "system", content: "You are an email assistant." },
            { role: "user", content: prompt },
          ]),
          schema: ComposedEmailSchema,
          objectName: "ComposedEmail",
        });
        return result.value;
      }),
    };
  }),
}) {}
```

**Prompt Building**:
```typescript
import { Prompt } from "@effect/ai";

const prompt = Prompt.make([
  { role: "system", content: systemContent },
  { role: "user", content: userContent },
]);
```

**Structured Output**:
```typescript
const result = yield* model.generateObject({
  prompt,
  schema: S.Struct({ subject: S.String, body: S.String }),
  objectName: "ComposedEmail",
});
return result.value; // Typed as { subject: string, body: string }
```

**Streaming**:
```typescript
return model.streamText({ prompt }).pipe(
  Stream.map((part) => {
    if (part.type === "text-delta") {
      return { type: "text-delta", delta: part.delta };
    }
    return { type: "done" };
  })
);
```

### Reference Files

- Phase plan: `specs/zero-email-port/phases/P4-ai-features-rpc.md`
- @effect/ai docs: Use `/mcp-researcher` to query Effect AI documentation
- P3 handler patterns: `packages/comms/server/src/rpc/v1/templates/*.handler.ts`
- Effect patterns: `.claude/rules/effect-patterns.md`

### Implementation Order

1. `LlmLayers.ts` - Provider config with env vars
2. `EmailAiService.ts` - Service using LanguageModel
3. AI contracts - `ai/compose.ts`, `ai/generate-subject.ts`, `ai/generate-search-query.ts`
4. Brain contracts - 7 contracts for summary, labels, state
5. `ThreadSummaryRepo.ts` - Cache for summaries
6. AI handlers - Connect service to RPC
7. Brain handlers - Summary caching, label suggestions
8. Extend `CommsRpcsLive` and wire `LlmLive`

### Verification

After implementing:

```bash
# Check domain
bun run check --filter @beep/comms-domain

# Check server
bun run check --filter @beep/comms-server

# Test AI service (with mocked LanguageModel)
bun run test --filter @beep/comms-server -- --grep "EmailAiService"

# Lint
bun run lint --filter @beep/comms-*
```

### Success Criteria

- [ ] `LlmLayers.ts` with provider config
- [ ] `EmailAiService.ts` with composeEmail, generateSubject, summarizeThread, suggestLabels
- [ ] AI RPC: 3 contracts + handlers
- [ ] Brain RPC: 7 contracts + handlers
- [ ] `ThreadSummaryRepo` for caching
- [ ] `CommsRpcsLive` extended with AI and Brain groups
- [ ] Type check passes
- [ ] Lint passes

### Handoff Document

Full context: `specs/zero-email-port/handoffs/HANDOFF_P4.md`

### Next Phase

After completing Phase 4:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P5.md` (UI Components context)
3. Create `P5_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase 5 implements React components with the VM pattern using Effect-Atom for state management.
