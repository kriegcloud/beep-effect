# Quick Start: Knowledge Graph POC Demo

> 5-minute triage guide for implementing the knowledge graph demonstration.

---

## 5-Minute Triage

### Current State

The POC demo is **NOT STARTED**. This spec creates a visual demonstration of knowledge graph capabilities at `/knowledge-demo` in the todox app.

### What Exists

- Knowledge slice services: ExtractionPipeline, EmbeddingService, GroundingService, EntityResolutionService, GraphRAGService, OntologyService
- Domain models: Entity, Relation, Extraction, Ontology, Embedding, EntityCluster, SameAsLink, Mention
- Sample data: 5 interconnected emails in `sample-data/`

### What Needs Building

- Demo route at `apps/todox/src/app/knowledge-demo/`
- Entity extraction UI with dummy email input
- Graph visualization component (D3.js or similar)
- Integration with existing knowledge services

---

## Critical Context

| Attribute | Value |
|-----------|-------|
| **Complexity** | Medium (~30 points) |
| **Phases** | 5 |
| **Sessions** | 5-7 estimated |
| **Success Metric** | User can extract entities from sample emails and see graph visualization |
| **Route** | `/knowledge-demo` in todox app |
| **Cross-Package** | Knowledge + Documents + UI |

---

## Phase Overview

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| **P1** | Basic Extraction UI | Email input, extraction trigger, raw entity display | Pending |
| **P2** | Relations & Evidence | Relation extraction, evidence linking, enhanced display | Pending |
| **P3** | GraphRAG Query | Query interface, context retrieval, response display | Pending |
| **P4** | Entity Resolution | Duplicate detection, cluster display, merge UI | Pending |
| **P5** | Polish & Demo Flow | Guided demo, sample presets, export capabilities | Pending |

---

## Quick Decision Tree

```
START
  |
  +-- Does `/knowledge-demo` route exist?
  |     +-- NO -> Start Phase 1 (Basic Extraction UI)
  |     +-- YES -> Does extraction work with sample emails?
  |           +-- NO -> Continue Phase 1
  |           +-- YES -> Does relation extraction work?
  |                 +-- NO -> Start Phase 2 (Relations)
  |                 +-- YES -> Check handoffs/HANDOFF_P[N].md
```

---

## Quick Commands

```bash
# Type check todox app
bun run check --filter @beep/todox

# Type check knowledge packages
bun run check --filter @beep/knowledge-*

# Run development server
bun run dev --filter @beep/todox

# Run tests
bun run test --filter @beep/knowledge-server

# Lint and fix
bun run lint:fix
```

---

## Key Services

| Service | Package | Purpose |
|---------|---------|---------|
| `ExtractionPipeline` | `@beep/knowledge-server` | 6-phase streaming entity extraction |
| `EmbeddingService` | `@beep/knowledge-server` | pgvector embedding generation |
| `GroundingService` | `@beep/knowledge-server` | Entity grounding and similarity |
| `EntityResolutionService` | `@beep/knowledge-server` | Cluster and deduplicate entities |
| `GraphRAGService` | `@beep/knowledge-server` | Subgraph retrieval for context |
| `OntologyService` | `@beep/knowledge-server` | OWL parsing and class hierarchy |

---

## Sample Data

Located in `sample-data/dummy-emails.json`:

- 5 interconnected emails
- Overlapping entities: John Smith, Sarah Chen, Mike Wilson, TechCorp, Acme Inc
- Topics: project meetings, budget discussions, partnerships
- Designed to demonstrate entity resolution across messages

---

## Critical Patterns

### Effect Service Usage

```typescript
import * as Effect from "effect/Effect";
import { ExtractionPipeline } from "@beep/knowledge-server";

const program = Effect.gen(function* () {
  const pipeline = yield* ExtractionPipeline;
  const result = yield* pipeline.extract(emailContent);
  return result;
});
```

### React Integration

```typescript
import { useCallback } from "react";
import * as Effect from "effect/Effect";

const handleExtract = useCallback(() => {
  Effect.gen(function* () {
    // extraction logic
  }).pipe(
    Effect.provide(KnowledgeLayer),
    Effect.runPromise
  );
}, []);
```

---

## Context Documents

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Full spec with detailed phase breakdown |
| [REFLECTION_LOG.md](REFLECTION_LOG.md) | Cumulative learnings |
| [handoffs/HANDOFF_P1.md](handoffs/HANDOFF_P1.md) | Phase 1 context (when created) |
| [sample-data/](./sample-data/) | Dummy emails for demo |

---

## Starting Phase 1

1. Read the orchestrator prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
2. Read full context: `handoffs/HANDOFF_P1.md`
3. Create route: `apps/todox/src/app/knowledge-demo/page.tsx`
4. Add basic email input textarea
5. Wire up ExtractionPipeline service
6. Display raw extracted entities
7. Verify with `bun run check --filter @beep/todox`
8. Update `REFLECTION_LOG.md`
9. Create handoffs for P2

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Forgetting Effect patterns | Use `Effect.gen` + `yield*`, never async/await |
| Missing Layer provision | Always provide KnowledgeLayer to Effect programs |
| Native JS methods | Use `A.map`, `A.filter` from `effect/Array` |
| Plain string IDs | Use branded EntityIds from `@beep/shared-domain` |
| Skipping handoffs | Create BOTH `HANDOFF_P[N+1].md` AND `P[N+1]_ORCHESTRATOR_PROMPT.md` |

---

## Need Help?

- Full spec: [README.md](README.md)
- Knowledge integration spec: [../knowledge-graph-integration/](../knowledge-graph-integration/)
- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`
