# Quick Start: Knowledge Graph Integration

> 5-minute triage guide for new Claude instances.

---

## What is This Spec?

This spec integrates **effect-ontology** patterns into **beep-effect** to enable:
- Structured knowledge extraction from unstructured text (emails, documents)
- Ontology-guided entity and relation extraction via LLM
- GraphRAG context assembly for intelligent agents
- Multi-tenant knowledge graph storage with pgvector

---

## Current Status

| Phase | Description | Status |
|-------|-------------|--------|
| **P0** | Foundation: Domain models, table schemas | **Pending** |
| P1 | Ontology Service: OWL parsing, class hierarchy | Pending |
| P2 | Extraction Pipeline: 6-phase streaming | Pending |
| P3 | Embedding & Grounding: pgvector, similarity | Pending |
| P4 | Entity Resolution: Clustering, deduplication | Pending |
| P5 | GraphRAG: Subgraph retrieval, agent context | Pending |
| P6 | Todox Integration: Email extraction | Pending |
| P7 | UI Components: Graph viewer | Pending |

---

## Quick Decision Tree

### "Which phase should I work on?"

```
START
  │
  ├─ Is @beep/knowledge-domain package created?
  │   ├─ NO → Start Phase 0 (Foundation)
  │   └─ YES → Does OntologyService exist?
  │       ├─ NO → Start Phase 1 (Ontology)
  │       └─ YES → Does ExtractionPipeline exist?
  │           ├─ NO → Start Phase 2 (Extraction)
  │           └─ YES → Continue from HANDOFF_P[N].md
```

### "What files do I read first?"

1. **Current phase prompt**: `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`
2. **Full context**: `handoffs/HANDOFF_P[N].md`
3. **Phase workflow**: `MASTER_ORCHESTRATION.md` (find Phase N section)
4. **Agent prompts**: `AGENT_PROMPTS.md` (copy-paste prompts for sub-agents)

---

## Key Patterns to Follow

### Effect Service Definition

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export class MyService extends Effect.Service<MyService>()(
  "@beep/knowledge-server/MyService",
  {
    dependencies: [DependencyService.Default],
    accessors: true,  // ALWAYS enable
    effect: Effect.gen(function* () {
      const dep = yield* DependencyService;
      return {
        myMethod: (input: Input) =>
          Effect.gen(function* () {
            // Implementation
          }),
      };
    }),
  }
) {}
```

### Table Definition (Multi-Tenant)

```typescript
import { OrgTable } from "@beep/shared-tables";

export const entities = OrgTable.make("entities", {
  types: text("types").array().notNull(),
  mention: text("mention").notNull(),
  attributes: jsonb("attributes").default({}).notNull(),
});
// RLS: organization_id = current_setting('app.current_org_id')
```

### Domain Schema

```typescript
import * as S from "effect/Schema";

export const EntityId = S.String.pipe(S.brand("EntityId"));

export class Entity extends S.Class<Entity>("Entity")({
  id: EntityId,
  organizationId: OrganizationId,
  types: S.Array(S.String),
  mention: S.String,
  createdAt: S.Date,
}) {}
```

---

## Critical Rules

1. **Namespace imports**: Always use `import * as Effect from "effect/Effect"`
2. **No async/await**: Use `Effect.gen` with `yield*`
3. **Multi-tenant**: Every table needs `org_id` + RLS policy
4. **Path aliases**: Use `@beep/*`, never relative `../../../`
5. **Type safety**: Never use `any`, `S.Any`, or `@ts-ignore`

---

## Reference Implementation

The effect-ontology codebase is available at `tmp/effect-ontology/` within the beep-effect repo:

| Pattern | Reference File |
|---------|----------------|
| Domain models | `tmp/effect-ontology/packages/@core-v2/src/Domain/Model/Entity.ts` |
| Ontology service | `tmp/effect-ontology/packages/@core-v2/src/Service/Ontology.ts` |
| Extraction pipeline | `tmp/effect-ontology/packages/@core-v2/src/Workflow/StreamingExtraction.ts` |
| Monoid merge | `tmp/effect-ontology/packages/@core-v2/src/Workflow/Merge.ts` |
| Embedding service | `tmp/effect-ontology/packages/@core-v2/src/Service/Embedding.ts` |

---

## Verification Commands

```bash
# Type check knowledge packages
bun run check --filter @beep/knowledge-*

# Run tests
bun run test --filter @beep/knowledge-*

# Lint
bun run lint:fix --filter @beep/knowledge-*

# Generate migrations
bun run db:generate
```

---

## Getting Started

### For Phase 0 (Foundation)

1. Read `handoffs/P0_ORCHESTRATOR_PROMPT.md`
2. Create package structure in `packages/knowledge/*`
3. Define domain models in `@beep/knowledge-domain`
4. Create table schemas in `@beep/knowledge-tables`
5. Run verification commands
6. Update `REFLECTION_LOG.md`
7. Create `handoffs/HANDOFF_P1.md` and `P1_ORCHESTRATOR_PROMPT.md`

### For Subsequent Phases

1. Read `handoffs/P[N]_ORCHESTRATOR_PROMPT.md` for current phase
2. Read `handoffs/HANDOFF_P[N].md` for full context
3. Follow MASTER_ORCHESTRATION.md Phase N tasks
4. Use AGENT_PROMPTS.md for sub-agent prompts
5. Verify with `bun run check`
6. Update `REFLECTION_LOG.md`
7. Create next phase handoffs

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Using `bun test` | Use `bun run test` (vitest, not Bun's runner) |
| Missing RLS policy | Every table with `org_id` needs tenant isolation policy |
| Assuming response shapes | Always verify from source code |
| Using `S.Any` | Fully type nested structures |
| Forgetting handoff files | Create BOTH `HANDOFF_P[N+1].md` AND `P[N+1]_ORCHESTRATOR_PROMPT.md` |

---

## Next Steps

1. Open `handoffs/P0_ORCHESTRATOR_PROMPT.md`
2. Copy the prompt into your session
3. Begin Phase 0 implementation
