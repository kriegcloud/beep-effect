# Phase 1 Orchestrator Prompt

> Copy-paste this prompt to start Phase 1 of the knowledge completion spec.

---

## Prompt

```markdown
# Knowledge Completion Spec - Phase 1: Discovery & Research

You are orchestrating Phase 1 of the knowledge completion spec located at `specs/knowledge-completion/`.

## Your Objective

Perform deep research on:
1. The current `AiService` implementation in `packages/knowledge/server/src/`
2. The `@effect/ai` package API and patterns
3. The reference implementation in `tmp/effect-ontology/packages/@core-v2/`
4. Gap analysis between current and target state

## Context

The `packages/knowledge/*` slice is 57% complete. The main issue is that it uses a **custom `AiService` interface** instead of `@effect/ai`. This needs to be refactored to align with Effect ecosystem standards.

Current pattern (WRONG - has 3 methods to migrate):
```typescript
// packages/knowledge/server/src/Ai/AiService.ts
export interface AiService {
  readonly generateObject: <A, I>(schema, prompt, config?) => Effect<...>
  readonly generateObjectWithSystem: <A, I>(schema, systemPrompt, userPrompt, config?) => Effect<...>
  readonly generateText: (prompt, config?) => Effect<...>
}
```

**NOTE**: EntityExtractor uses `generateObjectWithSystem`, not `generateObject`.

Target pattern (CORRECT):
```typescript
import { LanguageModel } from "@effect/ai"
const llm = yield* LanguageModel.LanguageModel
yield* llm.generateObject({ prompt: Prompt.make(...), schema, objectName })
```

## Required Reading

Before starting, read these files:
1. `specs/knowledge-completion/README.md` - Spec overview
2. `specs/knowledge-completion/MASTER_ORCHESTRATION.md` - Phase 1 section
3. `specs/knowledge-completion/handoffs/HANDOFF_P1.md` - Detailed context
4. `specs/knowledge-completion/AGENT_PROMPTS.md` - Agent prompts

## Pre-Flight Verification

**Run these checks FIRST to verify paths are correct:**

```bash
# Verify reference repo exists
ls -la tmp/effect-ontology/packages/@core-v2/src/Service/
ls -la tmp/effect-ontology/packages/@core-v2/src/Runtime/

# Verify current implementation
ls packages/knowledge/server/src/Ai/
grep -n "readonly generate" packages/knowledge/server/src/Ai/AiService.ts
```

**If paths differ from spec**, update file paths before running research agents.

## Tasks

### Task 1: Analyze Current Implementation

Use `codebase-researcher` agent to analyze:
- `packages/knowledge/server/src/Ai/AiService.ts`
- `packages/knowledge/server/src/Ai/PromptTemplates.ts`
- `packages/knowledge/server/src/Extraction/EntityExtractor.ts`
- `packages/knowledge/server/src/Extraction/MentionExtractor.ts`
- `packages/knowledge/server/src/Extraction/RelationExtractor.ts`
- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`

Output: `specs/knowledge-completion/outputs/current-impl-analysis.md`

### Task 2: Research @effect/ai

Use `mcp-researcher` agent to research:
- `LanguageModel.LanguageModel` service
- `Prompt.make()` and `Prompt.Prompt` type
- `generateObject` API signature and options
- **System prompt support** (EntityExtractor needs `generateObjectWithSystem` equivalent)
- **Mock Layer pattern** - How to create `Layer.succeed(LanguageModel.LanguageModel, ...)` for tests
- Provider integration (@effect/ai-anthropic, @effect/ai-openai)
- Prompt caching features

Output: `specs/knowledge-completion/outputs/effect-ai-research.md`

**CRITICAL**: The research output MUST answer:
1. Does @effect/ai support system prompts? If not, what's the alternative?
2. What is the exact API to create a mock LanguageModel Layer?

### Task 3: Analyze Reference Implementation

Use `codebase-researcher` agent to analyze:
- `tmp/effect-ontology/packages/@core-v2/src/Service/Extraction.ts`
- `tmp/effect-ontology/packages/@core-v2/src/Service/LlmWithRetry.ts`
- `tmp/effect-ontology/packages/@core-v2/src/Runtime/ProductionRuntime.ts`
- `tmp/effect-ontology/packages/@core-v2/src/Runtime/EmbeddingLayers.ts`

Output: `specs/knowledge-completion/outputs/reference-patterns.md`

### Task 4: Create Gap Analysis

Based on Tasks 1-3, create a gap analysis document:
- What needs to change
- Files to modify
- Files to delete
- Files to create
- Migration complexity assessment

Output: `specs/knowledge-completion/outputs/gap-analysis.md`

## Exit Criteria

Phase 1 is complete when:
- [ ] `outputs/current-impl-analysis.md` created
- [ ] `outputs/effect-ai-research.md` created
- [ ] `outputs/reference-patterns.md` created
- [ ] `outputs/gap-analysis.md` created
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created with findings summary

## Verification

After completing research:
```bash
# Verify output files exist
ls specs/knowledge-completion/outputs/
```

## Next Phase

After Phase 1 completion, proceed to Phase 2 (Architecture Review) using:
`specs/knowledge-completion/handoffs/HANDOFF_P2.md`
```

---

## Usage Instructions

1. Copy the prompt above
2. Paste into a new Claude session
3. Let Claude orchestrate the research agents
4. Review outputs in `specs/knowledge-completion/outputs/`
5. Verify REFLECTION_LOG updated
6. Proceed to Phase 2

---

## Notes for Orchestrator

### Parallelization Strategy

**Run Tasks 1-3 in PARALLEL** (no dependencies):
```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│      Task 1         │       Task 2        │       Task 3        │
│ codebase-researcher │   mcp-researcher    │ codebase-researcher │
│ (current impl)      │   (@effect/ai)      │ (reference impl)    │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Run Task 4 AFTER Tasks 1-3 complete** (depends on their outputs):
```
                    ┌─────────────────────┐
                    │      Task 4         │
                    │   Gap Analysis      │
                    │ (requires 1,2,3)    │
                    └─────────────────────┘
```

### Other Notes

- The `mcp-researcher` agent uses Effect documentation MCP
- The `codebase-researcher` agent explores local files
- Output files should be comprehensive but concise
- Update REFLECTION_LOG with any surprises or learnings
- If any agent fails, document in REFLECTION_LOG and proceed with available data
