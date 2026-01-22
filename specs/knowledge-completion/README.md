# Knowledge Completion Spec

> Complete the knowledge graph integration by refactoring to @effect/ai, adding test coverage, and implementing remaining phases.

---

## Overview

This spec orchestrates the completion of the `packages/knowledge/*` vertical slice, which is currently 57% complete (Phases P0-P4 from `specs/knowledge-graph-integration/`).

### Primary Objectives

1. **Refactor LLM Integration** - Replace custom `AiService` with `@effect/ai`
2. **Add Test Coverage** - Comprehensive tests for all services
3. **Complete GraphRAG (P5)** - Subgraph retrieval for agent context
4. **Complete Todox Integration (P6)** - Email extraction pipeline
5. **Align with Repository Standards** - Effect patterns, observability, documentation

---

## Current State (Bootstrapped)

### Already Complete (from knowledge-graph-integration spec)

| Phase | Component | Status |
|-------|-----------|--------|
| P0 | Domain models, tables, RLS | Complete |
| P1 | Ontology Service (N3.js OWL parsing) | Complete |
| P2 | Extraction Pipeline (6-stage streaming) | Complete |
| P3 | Embedding & Grounding (pgvector) | Complete |
| P4 | Entity Resolution (clustering, deduplication) | Complete |

### Critical Gap: Custom AiService

The current implementation uses a custom `AiService` interface instead of `@effect/ai`.

**The interface has 3 methods that ALL need migration:**

```typescript
// CURRENT (packages/knowledge/server/src/Ai/AiService.ts)
export interface AiService {
  readonly generateObject: <A, I>(schema, prompt, config?) => Effect<...>
  readonly generateObjectWithSystem: <A, I>(schema, systemPrompt, userPrompt, config?) => Effect<...>
  readonly generateText: (prompt, config?) => Effect<...>
}

// SHOULD BE (following tmp/effect-ontology patterns)
import { LanguageModel } from "@effect/ai"
const llm = yield* LanguageModel.LanguageModel
yield* llm.generateObject({ prompt: Prompt.make(...), schema, objectName })
```

**Note**: EntityExtractor uses `generateObjectWithSystem` - verify @effect/ai supports system prompts.

### Pending Work

| Phase | Component | Status |
|-------|-----------|--------|
| - | @effect/ai refactoring | **This spec** |
| - | Test coverage | **This spec** |
| P5 | GraphRAG implementation | **This spec** |
| P6 | Todox integration | **This spec** |
| P7 | UI components | Deferred |

---

## Phase Overview

| Phase | Description | Agents | Output |
|-------|-------------|--------|--------|
| **P1** | Discovery & Research | codebase-researcher, mcp-researcher | outputs/*.md |
| **P2** | Architecture Review | code-reviewer, architecture-pattern-enforcer | outputs/architecture-review.md |
| **P3** | @effect/ai Design | reflector, doc-writer | Design docs |
| **P4** | LLM Refactoring | effect-code-writer, package-error-fixer | Refactored services |
| **P5** | Test Coverage | test-writer | test/*.test.ts |
| **P6** | GraphRAG Implementation | effect-code-writer | GraphRAG services |
| **P7** | Todox Integration | effect-code-writer | Integration code |
| **P8** | Finalization | doc-writer, readme-updater | Documentation |

---

## Success Criteria

### Refactoring Complete When
- [ ] Custom `AiService` deleted (0 references to `AiService` in codebase)
- [ ] All 3 extractors use `LanguageModel.LanguageModel` from `@effect/ai`
- [ ] Provider Layers created (Anthropic, OpenAI)
- [ ] `bun run check --filter @beep/knowledge-server` passes with 0 errors

### Testing Complete When
- [ ] ≥6 test files created (target: 9)
- [ ] Line coverage ≥60% (target: 80%)
- [ ] `bun run test --filter @beep/knowledge-server` passes with 100% pass rate
- [ ] Layer composition tested with mock LanguageModel

### GraphRAG Complete When
- [ ] k-NN search returns results in <100ms (P50)
- [ ] N-hop traversal supports up to 3 hops
- [ ] Query latency <500ms (P99)
- [ ] Context formatting produces valid LLM prompts

### Spec Complete When
- [ ] All 8 phases completed (100%)
- [ ] 0 type errors in knowledge packages
- [ ] 0 P0/P1 architecture violations
- [ ] REFLECTION_LOG has entries for all 8 phases
- [ ] README and AGENTS.md updated for both domain and server packages

### Quantitative Targets Summary

| Metric | Minimum | Target |
|--------|---------|--------|
| Test file count | 6 | 9 |
| Line coverage | 60% | 80% |
| Test pass rate | 90% | 100% |
| Type errors | 0 | 0 |
| GraphRAG P50 latency | <200ms | <100ms |
| GraphRAG P99 latency | <1000ms | <500ms |
| AiService references | 0 | 0 |

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute triage guide |
| [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) | Complete phase workflow |
| [AGENT_PROMPTS.md](AGENT_PROMPTS.md) | Specialized agent prompts |
| [handoffs/](handoffs/) | Phase transition documents |
| [outputs/](outputs/) | Research artifacts |

---

## Reference Repositories

| Repository | Purpose |
|------------|---------|
| `tmp/effect-ontology` | Reference @effect/ai integration patterns |
| `specs/knowledge-graph-integration` | Original spec (P0-P4 complete) |

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| LLM Integration | `@effect/ai`, `@effect/ai-anthropic`, `@effect/ai-openai` |
| Embeddings | pgvector, custom `EmbeddingProvider` |
| Ontology | N3.js (OWL/Turtle parsing) |
| Testing | `@beep/testkit` |
| Database | PostgreSQL with RLS |
