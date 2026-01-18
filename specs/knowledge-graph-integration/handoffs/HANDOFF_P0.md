# Phase 0 Handoff: Foundation

**Date**: 2026-01-18
**From**: Spec Creation
**To**: Phase 0 (Foundation)
**Status**: Ready for implementation

---

## Spec Creation Summary

The knowledge-graph-integration specification has been created with complete documentation:

- README.md with architecture overview
- MASTER_ORCHESTRATION.md with 8-phase workflow
- RUBRICS.md with evaluation criteria
- AGENT_PROMPTS.md with specialized agent prompts
- QUICK_START.md for fast onboarding
- Pre-research outputs in `outputs/`
- Templates in `templates/`

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | PostgreSQL + pgvector | Aligns with existing infra, RLS for multi-tenancy |
| Embedding dimensions | 1024 | Voyage AI default, optimal for similarity |
| OWL parser | N3.js | Effect-ontology proven, TypeScript native |
| LLM integration | @effect/ai | Native Effect, schema validation |
| Table factory | OrgTable.make | Multi-tenant by default |

---

## Source Verification (MANDATORY)

### Reference Implementation Files

| Pattern | Source File | Verified |
|---------|-------------|----------|
| Entity model | `tmp/effect-ontology/packages/@core-v2/src/Domain/Model/Entity.ts` | Y |
| EvidenceSpan | `tmp/effect-ontology/packages/@core-v2/src/Domain/Model/Entity.ts:38-86` | Y |
| ClassDefinition | `tmp/effect-ontology/packages/@core-v2/src/Domain/Model/Ontology.ts:82-150` | Y |
| Monoid merge | `tmp/effect-ontology/packages/@core-v2/src/Workflow/Merge.ts` | Y |
| Service pattern | `packages/iam/server/src/db/Db/Db.ts` | Y |
| Table pattern | `packages/shared/tables/src/common.ts` | Y |

### Existing Knowledge Entity IDs

**IMPORTANT**: Knowledge entity IDs already exist at:
`packages/shared/domain/src/entity-ids/knowledge/ids.ts`

Current content (EmbeddingId already defined):
```typescript
export const EmbeddingId = make("embedding", {
  brand: "EmbeddingId",
}).annotations(
  $I.annotations("EmbeddingId", {
    description: "A unique identifier for a Embedding entity",
  })
);
```

**Still needed**: EntityId, RelationId, ExtractionId, OntologyId

---

## Phase 0 Tasks

### Task 0.1: Update Entity IDs

**Location**: `packages/shared/domain/src/entity-ids/knowledge/ids.ts`

Replace placeholder with:

```typescript
import { EntityId } from "@beep/schema/identity";

const make = EntityId.builder("knowledge");

export const EntityId = make("entity", { brand: "EntityId" });
export const RelationId = make("relation", { brand: "RelationId" });
export const ExtractionId = make("extraction", { brand: "ExtractionId" });
export const OntologyId = make("ontology", { brand: "OntologyId" });
export const EmbeddingId = make("embedding", { brand: "EmbeddingId" });
```

Export namespaces in `packages/shared/domain/src/entity-ids/knowledge/index.ts`:

```typescript
export * as KnowledgeEntityIds from "./ids.js";
```

### Task 0.2: Create Package Structure

```bash
# Create directories
mkdir -p packages/knowledge/{domain,tables,server,client,ui}/src

# Create package.json files (use IAM as template)
# Create tsconfig.json files (use IAM as template)
```

### Task 0.3: Domain Models

**Target**: `packages/knowledge/domain/src/`

| File | Schema | Reference |
|------|--------|-----------|
| `Entity.ts` | Entity, EntityModel | `tmp/effect-ontology/.../Entity.ts` |
| `Relation.ts` | Relation, ObjectReference | `tmp/effect-ontology/.../Entity.ts` |
| `EvidenceSpan.ts` | EvidenceSpan | `tmp/effect-ontology/.../Entity.ts` |
| `KnowledgeGraph.ts` | KnowledgeGraph, mergeGraphs | `tmp/effect-ontology/.../Merge.ts` |
| `Ontology.ts` | ClassDefinition, PropertyDefinition | `tmp/effect-ontology/.../Ontology.ts` |
| `Errors.ts` | ExtractionError, OntologyError, GroundingError | Tagged errors |

### Task 0.4: Table Schemas

**Target**: `packages/knowledge/tables/src/`

| Table | Key Columns | Reference |
|-------|-------------|-----------|
| `entities` | types[], mention, attributes{}, mentions[], groundingConfidence | OrgTable.make |
| `relations` | subjectId, predicate, object, evidence[], confidence | OrgTable.make |
| `extractions` | sourceUri, status, knowledgeGraphId, ontologyId | OrgTable.make |
| `ontologies` | name, turtleContent, version, namespace | OrgTable.make |
| `embeddings` | entityId, vector(1024), provider, model, taskType | OrgTable.make |

### Task 0.5: RLS Policies

**Target**: Migration file

```sql
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ontologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_entities ON entities
  FOR ALL USING (organization_id = current_setting('app.current_org_id')::uuid);
-- Repeat for other tables
```

### Task 0.6: pgvector Setup

**Target**: Migration file

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW index for fast similarity search
CREATE INDEX embeddings_vector_hnsw_idx ON embeddings
USING hnsw (vector vector_cosine_ops);
```

### Task 0.7: Server Db Service

**Target**: `packages/knowledge/server/src/db/Db/Db.ts`

```typescript
import * as DbSchema from "@beep/knowledge-tables/schema";
import { DbClient } from "@beep/shared-server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const serviceEffect = DbClient.make({ schema: DbSchema });

export type Shape = DbClient.Shape<typeof DbSchema>;

export class Db extends Context.Tag("@beep/knowledge-server/Db")<Db, Shape>() {}

export const layer: Layer.Layer<Db, never, DbClient.SliceDbRequirements> =
  Layer.scoped(Db, serviceEffect);
```

### Task 0.8: Scaffold Client/UI

**Target**: `packages/knowledge/{client,ui}/src/index.ts`

Minimal scaffolds with placeholder exports:

```typescript
// packages/knowledge/client/src/index.ts
export const placeholder = "TODO: Implement client";

// packages/knowledge/ui/src/index.ts
export const placeholder = "TODO: Implement UI";
```

---

## Schema Shapes

### Entity Schema

```typescript
import * as S from "effect/Schema";
import { SharedEntityIds, KnowledgeEntityIds } from "@beep/shared-domain";

export const EntityId = KnowledgeEntityIds.EntityId;
export type EntityId = typeof EntityId.Type;

export class EvidenceSpan extends S.Class<EvidenceSpan>("EvidenceSpan")({
  text: S.String,
  startOffset: S.Number,
  endOffset: S.Number,
  sourceUri: S.String,
  confidence: S.Number,
}) {}

export class Entity extends S.Class<Entity>("Entity")({
  id: EntityId,
  organizationId: SharedEntityIds.OrganizationId,
  types: S.Array(S.String),
  mention: S.String,
  attributes: S.Record({ key: S.String, value: S.Unknown }),
  mentions: S.optional(S.Array(EvidenceSpan)),
  groundingConfidence: S.optional(S.Number),
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}
```

### Relation Schema

```typescript
export const RelationId = KnowledgeEntityIds.RelationId;

export class ObjectReference extends S.Class<ObjectReference>("ObjectReference")({
  "@id": EntityId,
}) {}

export class Relation extends S.Class<Relation>("Relation")({
  id: RelationId,
  organizationId: SharedEntityIds.OrganizationId,
  subjectId: EntityId,
  predicate: S.String,
  object: S.Union(S.String, ObjectReference),
  evidence: S.Array(EvidenceSpan),
  confidence: S.Number,
  createdAt: S.Date,
}) {}
```

### KnowledgeGraph Schema

```typescript
export class KnowledgeGraph extends S.Class<KnowledgeGraph>("KnowledgeGraph")({
  entities: S.Array(Entity),
  relations: S.Array(Relation),
}) {}

// Monoid identity
export const emptyGraph: KnowledgeGraph = { entities: [], relations: [] };

// Monoid combine (associative)
export const mergeGraphs = (a: KnowledgeGraph, b: KnowledgeGraph): KnowledgeGraph => {
  // Implementation per tmp/effect-ontology/packages/@core-v2/src/Workflow/Merge.ts
};
```

---

## Implementation Order

1. **Entity IDs** (Task 0.1) - Foundation for all other schemas
2. **Package structure** (Task 0.2) - Directories and configs
3. **Domain schemas** (Task 0.3) - Types for tables
4. **Table schemas** (Task 0.4) - Drizzle definitions
5. **Migrations** (Task 0.5, 0.6) - RLS + pgvector
6. **Server Db** (Task 0.7) - Database service
7. **Scaffolds** (Task 0.8) - Client/UI placeholders
8. **Verification** - Type check all packages

---

## Verification Steps

After each task:

```bash
# Type check
bun run check --filter @beep/knowledge-*

# After updating shared-domain
bun run check --filter @beep/shared-domain

# Lint fix
bun run lint:fix --filter @beep/knowledge-*

# After tables defined
bun run db:generate
```

---

## Known Issues & Gotchas

### From Pre-Research

1. **Entity ID already exists**: Don't create new file, UPDATE `packages/shared/domain/src/entity-ids/knowledge/ids.ts`

2. **Import paths**: Use `@beep/knowledge-*` aliases, never relative paths

3. **OrgTable cascade**: Default `onDelete: 'cascade'` deletes all data when org deleted

4. **pgvector extension**: Requires PostgreSQL with pgvector installed (docker image: `pgvector/pgvector`)

5. **Index naming**: Use table-prefixed names: `entities_org_idx`, not generic `org_idx`

### Effect Patterns

1. **Namespace imports**: ALWAYS use `import * as S from "effect/Schema"`
2. **No async/await**: Use `Effect.gen` with `yield*`
3. **accessors: true**: ALWAYS enable in Effect.Service

---

## Success Criteria

Phase 0 is complete when:

- [ ] Knowledge entity IDs updated in shared-domain
- [ ] All 5 packages created (domain, tables, server, client, ui)
- [ ] Domain schemas compile without errors
- [ ] Table schemas defined with OrgTable.make
- [ ] RLS policies migration created
- [ ] pgvector extension migration created
- [ ] Server Db service created
- [ ] Client/UI scaffolds created
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] `bun run db:generate` succeeds
- [ ] REFLECTION_LOG.md updated with Phase 0 learnings
- [ ] HANDOFF_P1.md created
- [ ] P1_ORCHESTRATOR_PROMPT.md created

---

## Templates Available

Use templates from `specs/knowledge-graph-integration/templates/`:

| Template | Purpose |
|----------|---------|
| `entity.template.ts` | Domain entity schema pattern |
| `service.template.ts` | Effect.Service pattern |
| `extraction-stage.template.ts` | Pipeline stage pattern |

---

## References

| Resource | Path |
|----------|------|
| Codebase context | `outputs/codebase-context.md` |
| Effect-ontology analysis | `outputs/effect-ontology-analysis.md` |
| Effect patterns | `.claude/rules/effect-patterns.md` |
| Database patterns | `documentation/patterns/database-patterns.md` |
| IAM slice (reference) | `packages/iam/` |
| Effect-ontology (reference) | `tmp/effect-ontology/packages/@core-v2/src/` |
