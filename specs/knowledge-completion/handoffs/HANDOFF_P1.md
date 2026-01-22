# Handoff: Phase 1 - Discovery & Research

> Context document for Phase 1 of the knowledge completion spec.

---

## Context Budget Estimate

| Item | Tokens |
|------|--------|
| HANDOFF_P1.md | ~1,500 |
| Files to analyze | ~4,000 |
| Agent context | ~2,000 |
| Output generation | ~2,000 |
| **Total** | ~9,500 |

---

## Current State Summary

### What Exists

The `packages/knowledge/*` vertical slice is **57% complete** with the following implemented:

| Component | Location | Status |
|-----------|----------|--------|
| Domain Models | `packages/knowledge/domain/src/entities/` | Complete |
| Database Tables + RLS | `packages/knowledge/tables/src/` | Complete |
| Ontology Parser (N3.js) | `server/src/Ontology/OntologyParser.ts` | Complete |
| Ontology Service | `server/src/Ontology/OntologyService.ts` | Complete |
| NLP Service | `server/src/Nlp/NlpService.ts` | Complete |
| Extraction Pipeline | `server/src/Extraction/ExtractionPipeline.ts` | Complete |
| Entity Extractor | `server/src/Extraction/EntityExtractor.ts` | Complete |
| Mention Extractor | `server/src/Extraction/MentionExtractor.ts` | Complete |
| Relation Extractor | `server/src/Extraction/RelationExtractor.ts` | Complete |
| Graph Assembler | `server/src/Extraction/GraphAssembler.ts` | Complete |
| Embedding Service | `server/src/Embedding/EmbeddingService.ts` | Complete |
| Grounding Service | `server/src/Grounding/GroundingService.ts` | Complete |
| Entity Resolution | `server/src/EntityResolution/` | Complete |
| AI Service Interface | `server/src/Ai/AiService.ts` | **Needs Refactoring** |
| Prompt Templates | `server/src/Ai/PromptTemplates.ts` | **Needs Refactoring** |

### Critical Gap: Custom AiService

The current implementation uses a **custom `AiService` interface** instead of `@effect/ai`.

**IMPORTANT**: The interface has **three methods** that all need migration:

```typescript
// packages/knowledge/server/src/Ai/AiService.ts (CURRENT - TO BE DELETED)
export interface AiService {
  // Method 1: Used by extractors for structured output
  readonly generateObject: <A, I>(
    schema: S.Schema<A, I>,
    prompt: string,
    config?: AiGenerationConfig
  ) => Effect.Effect<AiGenerationResult<A>, AiExtractionError>;

  // Method 2: Used by EntityExtractor with system prompts
  readonly generateObjectWithSystem: <A, I>(
    schema: S.Schema<A, I>,
    systemPrompt: string,
    userPrompt: string,
    config?: AiGenerationConfig
  ) => Effect.Effect<AiGenerationResult<A>, AiExtractionError>;

  // Method 3: Raw text generation
  readonly generateText: (
    prompt: string,
    config?: AiGenerationConfig
  ) => Effect.Effect<AiGenerationResult<string>, AiExtractionError>;
}
```

**Additional Pattern Issue**: The service uses legacy `Context.GenericTag`:
```typescript
// OLD PATTERN (AiService.ts:124) - DO NOT REPLICATE
export const AiService = Context.GenericTag<AiService>("@beep/knowledge-server/AiService");
```

This should be replaced with `@effect/ai` pattern:

```typescript
// SHOULD USE (from @effect/ai)
import { LanguageModel } from "@effect/ai"
import { Prompt } from "@effect/ai"

const llm = yield* LanguageModel.LanguageModel
yield* llm.generateObject({
  prompt: Prompt.make(promptString),
  schema,
  objectName
})
```

### Reference Implementation

The `tmp/effect-ontology/packages/@core-v2/` repository demonstrates the correct pattern:

- `src/Service/Extraction.ts` - Uses `LanguageModel.LanguageModel`
- `src/Service/LlmWithRetry.ts` - Retry wrapper pattern
- `src/Runtime/ProductionRuntime.ts` - Provider Layer composition

---

## Phase 1 Objective

**Deep research** on:
1. Current AiService implementation and all its usages
2. @effect/ai package API and patterns
3. Effect-ontology reference implementation patterns
4. Gap analysis between current and target state

---

## Key Files to Analyze

### Current Implementation (packages/knowledge/server/src/)

```
Ai/
├── AiService.ts           # Custom interface (TO BE DELETED)
└── PromptTemplates.ts     # Prompt construction (NEEDS MIGRATION)

Extraction/
├── EntityExtractor.ts     # Uses AiService.generateObject
├── MentionExtractor.ts    # Uses AiService.generateObject
├── RelationExtractor.ts   # Uses AiService.generateObject
├── ExtractionPipeline.ts  # Composes extraction services
└── GraphAssembler.ts      # Assembles knowledge graph
```

### Reference Implementation (tmp/effect-ontology/packages/@core-v2/src/)

```
Service/
├── Extraction.ts          # Shows @effect/ai usage
├── LlmWithRetry.ts        # Retry/timeout wrapper
└── EmbeddingProvider.ts   # Custom embedding interface (CORRECT)

Runtime/
├── ProductionRuntime.ts   # Provider Layer composition
└── EmbeddingLayers.ts     # Dynamic Layer selection
```

---

## Research Questions

### About Current Implementation

1. How many services depend on `AiService`?
2. What `generateObject` calls exist and with what parameters?
3. What `generateObjectWithSystem` calls exist? (EntityExtractor uses this)
4. What `generateText` calls exist?
5. Are there any provider implementations?
6. How is error handling done?
7. What configuration options exist?
8. Does any code use the legacy `Context.GenericTag` pattern?

### About @effect/ai

1. What is the `LanguageModel.LanguageModel` service interface?
2. How does `Prompt.make()` work?
3. What is the `generateObject` API signature?
4. How do provider Layers compose (Anthropic, OpenAI)?
5. What prompt caching features exist?
6. How is token usage tracked?

### About Reference Implementation

1. How does effect-ontology structure its LLM services?
2. What retry/timeout patterns are used?
3. How is telemetry integrated?
4. How is provider selection handled at runtime?

---

## Expected Outputs

| File | Purpose |
|------|---------|
| `outputs/current-impl-analysis.md` | Analysis of current AiService usage |
| `outputs/effect-ai-research.md` | @effect/ai API documentation |
| `outputs/reference-patterns.md` | Patterns from effect-ontology |
| `outputs/gap-analysis.md` | Migration requirements and complexity |

---

## Success Criteria

Phase 1 is complete when:

- [ ] All AiService usages documented with code snippets
- [ ] @effect/ai API understood and documented
- [ ] Effect-ontology patterns extracted and documented
- [ ] Gap analysis complete with migration complexity assessment
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] `handoffs/HANDOFF_P2.md` created with findings

---

## Agent Assignments

| Agent | Task |
|-------|------|
| `codebase-researcher` | Analyze `packages/knowledge/server/src/` |
| `mcp-researcher` | Research @effect/ai via Effect MCP |
| `codebase-researcher` | Analyze `tmp/effect-ontology/packages/@core-v2/` |

### Parallelization Guide

**Run these THREE agents in PARALLEL** (they have no dependencies):

```
Agent 1: codebase-researcher → current-impl-analysis.md
Agent 2: mcp-researcher      → effect-ai-research.md
Agent 3: codebase-researcher → reference-patterns.md
```

**Then run SEQUENTIALLY** (depends on all three outputs):

```
Orchestrator: Create gap-analysis.md from outputs 1-3
```

---

## Pre-Flight Verification

**Run these checks BEFORE starting research:**

```bash
# 1. Verify reference repo exists and has expected structure
ls -la tmp/effect-ontology/packages/@core-v2/src/Service/
ls -la tmp/effect-ontology/packages/@core-v2/src/Runtime/

# 2. Verify current implementation files exist
ls packages/knowledge/server/src/Ai/
ls packages/knowledge/server/src/Extraction/

# 3. Check current AiService has all 3 methods
grep -n "readonly generate" packages/knowledge/server/src/Ai/AiService.ts
```

**If reference repo paths differ**, update the file paths in this document and `AGENT_PROMPTS.md` before proceeding.

---

## Getting Started

1. **Run pre-flight verification** (above)
2. Read `MASTER_ORCHESTRATION.md` Phase 1 section
3. Read `AGENT_PROMPTS.md` Phase 1 prompts
4. Launch research agents in parallel
5. Collate findings into output documents
6. Create gap analysis
7. Update REFLECTION_LOG
8. Create HANDOFF_P2.md

---

## Context for Next Session

If this phase spans multiple sessions, preserve:

1. **Progress Made**: Which research tasks are complete
2. **Partial Findings**: Any partial output documents
3. **Open Questions**: Unresolved research questions
4. **Blockers**: Any issues encountered

---

## Notes

- The embedding provider pattern in current implementation is **correct** (no @effect/ai embedding API exists)
- Focus on LLM integration only (LanguageModel, Prompt, generateObject)
- The extraction pipeline structure can remain; only LLM calls change
- **All 3 AiService methods** must be researched for migration (not just generateObject)
- The `EntityExtractor` uses `generateObjectWithSystem` - verify @effect/ai has equivalent
- Legacy `Context.GenericTag` pattern should NOT be replicated in new code
