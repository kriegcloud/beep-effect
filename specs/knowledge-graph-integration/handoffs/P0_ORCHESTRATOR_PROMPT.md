# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 (Foundation) implementation.

---

## Prompt

You are implementing Phase 0 (Foundation) of the Knowledge Graph Integration spec.

### Important: Directory Context

This spec was authored in the effect-ontology repo's tmp folder but you are executing it in the **beep-effect** repository. The reference implementation (effect-ontology) is available at:

```
beep-effect/
├── packages/          # Your work goes here
├── specs/             # This spec lives here
└── tmp/
    └── effect-ontology/   # Reference implementation
        └── packages/@core-v2/src/  # Patterns to adapt
```

All paths in this spec referencing `tmp/effect-ontology/...` are relative to your beep-effect repo root.

### Context

This is the initial phase - no previous phases completed. You are creating the foundational packages and schemas for integrating ontology-guided knowledge extraction into beep-effect.

The goal is to enable structured knowledge graphs from unstructured text (emails, documents) using patterns from the effect-ontology reference implementation.

### Your Mission

Create the `packages/knowledge/*` vertical slice with:

1. **5 packages**: domain, tables, server, client, ui
2. **Domain models**: Entity, Relation, Mention, KnowledgeGraph, EvidenceSpan
3. **Table schemas**: entities, relations, extractions, ontologies, embeddings
4. **RLS policies**: Tenant isolation on all tables
5. **pgvector setup**: Extension and HNSW index for embeddings

### Critical Patterns

**Service Definition**:
```typescript
import * as Effect from "effect/Effect";

export class MyService extends Effect.Service<MyService>()(
  "@beep/knowledge-server/MyService",
  {
    dependencies: [DependencyService.Default],
    accessors: true,  // ALWAYS enable
    effect: Effect.gen(function* () {
      const dep = yield* DependencyService;
      return {
        myMethod: (input: Input) => Effect.gen(function* () {
          // Implementation
        }),
      };
    }),
  }
) {}
```

**Domain Schema with Branded ID**:
```typescript
import * as S from "effect/Schema";

export const EntityId = S.String.pipe(S.brand("EntityId"));
export type EntityId = S.Schema.Type<typeof EntityId>;

export class Entity extends S.Class<Entity>("Entity")({
  id: EntityId,
  organizationId: OrganizationId,
  types: S.Array(S.String),
  mention: S.String,
  attributes: S.Record({ key: S.String, value: S.Unknown }),
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}
```

**Multi-Tenant Table**:
```typescript
import { OrgTable } from "@beep/shared-tables";
import { text, jsonb, real } from "drizzle-orm/pg-core";

export const entities = OrgTable.make("entities", {
  types: text("types").array().notNull(),
  mention: text("mention").notNull(),
  attributes: jsonb("attributes").default({}).notNull(),
  groundingConfidence: real("grounding_confidence"),
});
```

**RLS Policy**:
```sql
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_entities ON entities
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### Reference Files

| Purpose | Path |
|---------|------|
| IAM slice structure | `packages/iam/` |
| Domain patterns | `packages/iam/domain/src/` |
| Table patterns | `packages/iam/tables/src/schema.ts` |
| Db pattern | `packages/iam/server/src/db/Db/Db.ts` |
| Effect patterns | `.claude/rules/effect-patterns.md` |
| Database patterns | `documentation/patterns/database-patterns.md` |
| Effect-ontology models | `tmp/effect-ontology/packages/@core-v2/src/Domain/Model/` |

### Verification

After each step:

```bash
# Type check
bun run check --filter @beep/knowledge-*

# Lint
bun run lint:fix --filter @beep/knowledge-*

# Generate migrations (after tables defined)
bun run db:generate
```

### Success Criteria

- [ ] `packages/knowledge/domain/` package created with Entity, Relation, KnowledgeGraph schemas
- [ ] `packages/knowledge/tables/` package created with all 5 table schemas
- [ ] `packages/knowledge/server/` package created with Db service
- [ ] `packages/knowledge/client/` package scaffolded
- [ ] `packages/knowledge/ui/` package scaffolded
- [ ] All packages use `@beep/knowledge-*` path aliases
- [ ] RLS policies defined for all tables with org_id
- [ ] pgvector extension migration created
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings
- [ ] HANDOFF_P1.md created
- [ ] P1_ORCHESTRATOR_PROMPT.md created

### Implementation Order

1. Create directory structure for all 5 packages
2. Set up package.json and tsconfig.json for each
3. Create domain schemas (Entity, Relation, EvidenceSpan, KnowledgeGraph)
4. Create error types (ExtractionError, OntologyError, GroundingError)
5. Create table schemas (entities, relations, extractions, ontologies, embeddings)
6. Create migration for pgvector extension
7. Create RLS policy migration
8. Create server Db service
9. Scaffold client and ui packages (index.ts only)
10. Verify with `bun run check`

### Handoff Document

Read full phase details in: `specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md` (Phase 0 section)

### Next Phase

After completing Phase 0:

1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P1.md` (full context document)
3. Create `handoffs/P1_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase 1 covers **Ontology Service**: N3.js parsing, class hierarchy, property scoping, KnowledgeIndex monoid.
