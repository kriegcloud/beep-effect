# Handoff: Phase 3 - @effect/ai Design

> Context document for Phase 3 of the knowledge completion spec.

---

## Prerequisites

Phase 2 (Architecture Review) must be complete with:
- [ ] `outputs/architecture-review.md` populated
- [ ] `outputs/slice-structure-review.md` populated
- [ ] P0 violations documented and plan to fix
- [ ] Quality gate: ≥3.5 average score

---

## Phase 3 Objective

**Design the @effect/ai migration** including:
1. Provider Layer architecture
2. Prompt migration strategy
3. Service templates for implementation
4. System prompt solution (for `generateObjectWithSystem`)

---

## Context Budget Estimate

| Item | Tokens |
|------|--------|
| HANDOFF_P3.md | ~1,000 |
| P1-P2 outputs (summaries) | ~3,000 |
| Reference patterns | ~2,000 |
| Design documents | ~3,000 |
| **Total** | ~9,000 |

---

## Critical Design Decisions

### 1. System Prompt Migration

The current `generateObjectWithSystem` method must be migrated. Based on P1 research, determine:

- **Option A**: @effect/ai has native system prompt support
- **Option B**: Use `Prompt.make()` with system content embedded
- **Option C**: Custom wrapper that adds system prompt to provider calls

Document the chosen approach in `outputs/design-migration.md`.

### 2. Provider Layer Composition

Design the Layer structure for provider selection:

```typescript
// Expected structure
export const AnthropicLive = Layer.mergeAll(
  AnthropicProvider.layer({ apiKey: Config.string("ANTHROPIC_API_KEY") }),
  // ... other dependencies
)

export const OpenAiLive = Layer.mergeAll(
  OpenAiProvider.layer({ apiKey: Config.string("OPENAI_API_KEY") }),
  // ... other dependencies
)

// Selection based on config
export const LlmLive = Config.string("LLM_PROVIDER").pipe(
  Config.withDefault("anthropic"),
  Config.map(provider =>
    provider === "openai" ? OpenAiLive : AnthropicLive
  )
)
```

### 3. Mock Layer for Testing

Design the test mock pattern:

```typescript
// Expected test pattern
export const MockLlmLive = Layer.succeed(
  LanguageModel.LanguageModel,
  {
    generateObject: ({ schema, objectName }) =>
      Effect.succeed({
        value: mockDataForSchema(schema),
        usage: { tokens: 100 }
      })
  }
)
```

---

## Agent Assignments

| Agent | Task | Output |
|-------|------|--------|
| `reflector` | Extract patterns from reference | Inform design |
| `doc-writer` | Document Layer design | `outputs/design-llm-layers.md` |
| `doc-writer` | Document migration plan | `outputs/design-migration.md` |
| `effect-code-writer` | Create service template | `templates/llm-service.template.ts` |

---

## Expected Outputs

### 1. `outputs/design-llm-layers.md`

- Provider Layer architecture diagram
- Configuration approach (env vars, Config service)
- Selection logic (runtime vs compile-time)
- Error handling strategy

### 2. `outputs/design-migration.md`

- Step-by-step migration order
- File modification checklist
- Verification steps between changes
- Rollback strategy

### 3. `templates/llm-service.template.ts`

Copy-paste ready template showing:
- How to inject `LanguageModel.LanguageModel`
- How to call `generateObject` with Prompt.make()
- How to handle system prompts (per chosen strategy)
- Error handling patterns

### 4. `templates/test-layer.template.ts`

Copy-paste ready template showing:
- Mock LanguageModel creation
- Layer composition for tests
- Common test patterns

---

## Exit Criteria

Phase 3 is complete when:

- [ ] `outputs/design-llm-layers.md` created
- [ ] `outputs/design-migration.md` created
- [ ] `templates/llm-service.template.ts` created
- [ ] `templates/test-layer.template.ts` created
- [ ] System prompt migration strategy documented
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P4.md` created
- [ ] Quality gate: ≥4.0 average score (design phases need higher bar)

---

## Reference Materials

From Phase 1 research:
- `outputs/effect-ai-research.md` - @effect/ai API details
- `outputs/reference-patterns.md` - effect-ontology patterns
- `outputs/gap-analysis.md` - migration requirements

---

## Notes

- Design documents should be detailed enough to implement without additional research
- Templates must compile (verify with `bun tsc --noEmit`)
- Consider prompt caching features if available in @effect/ai
- System prompt solution is a critical path item - must be resolved
