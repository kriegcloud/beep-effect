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

This is the initial phase - no previous phases completed. The `packages/knowledge/*` vertical slice has been **bootstrapped with boilerplate** but needs the actual domain models and tables for knowledge graph integration.

The goal is to enable structured knowledge graphs from unstructured text (emails, documents) using patterns from the effect-ontology reference implementation.

### Current State (Already Exists)

The following structure is already in place:

- **5 packages**: domain, tables, server, client, ui (scaffolded with package.json, tsconfig.json)
- **Starter entity**: `Embedding` model in domain as a pattern reference
- **Starter table**: `embedding.table.ts` in tables
- **Db service**: Basic structure in server/src/db/
- **Repository pattern**: `Embedding.repo.ts` as reference

### Your Mission

Extend the existing `packages/knowledge/*` slice with the actual knowledge graph models:

1. **Domain models**: Entity, Relation, Mention, KnowledgeGraph, EvidenceSpan (add alongside existing Embedding)
2. **Table schemas**: entities, relations, extractions, ontologies (add alongside existing embeddings table)
3. **RLS policies**: Tenant isolation on all tables
4. **pgvector setup**: Extension and HNSW index for embeddings

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

**Already Complete (from bootstrapping):**
- [x] `packages/knowledge/domain/` package scaffolded with Embedding starter entity
- [x] `packages/knowledge/tables/` package scaffolded with embedding table
- [x] `packages/knowledge/server/` package scaffolded with Db service structure
- [x] `packages/knowledge/client/` package scaffolded
- [x] `packages/knowledge/ui/` package scaffolded
- [x] All packages use `@beep/knowledge-*` path aliases

**Phase 0 Deliverables:**
- [ ] Entity, Relation, Mention, KnowledgeGraph, EvidenceSpan domain models added
- [ ] entities, relations, extractions, ontologies table schemas added
- [ ] Error types created (ExtractionError, OntologyError, GroundingError)
- [ ] RLS policies defined for all tables with org_id
- [ ] pgvector extension migration created
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings
- [ ] HANDOFF_P1.md created
- [ ] P1_ORCHESTRATOR_PROMPT.md created

### Implementation Order

**Note:** Package structure already exists. Focus on adding domain models and tables.

1. Review existing Embedding model pattern in `domain/src/entities/Embedding/`
2. Create domain schemas (Entity, Relation, EvidenceSpan, Mention, KnowledgeGraph) following Embedding pattern
3. Create error types (ExtractionError, OntologyError, GroundingError)
4. Review existing embedding table pattern in `tables/src/tables/`
5. Create table schemas (entities, relations, extractions, ontologies) following embedding table pattern
6. Create migration for pgvector extension
7. Create RLS policy migration for all tables
8. Update Db service to include new repositories
9. Verify with `bun run check`

### Handoff Document

Read full phase details in: `specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md` (Phase 0 section)

### Next Phase

After completing Phase 0:

1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P1.md` (full context document)
3. Create `handoffs/P1_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase 1 covers **Ontology Service**: N3.js parsing, class hierarchy, property scoping, KnowledgeIndex monoid.
