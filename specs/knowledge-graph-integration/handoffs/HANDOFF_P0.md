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

## Current State (Bootstrapped)

The `packages/knowledge/*` slice has been bootstrapped with the following structure:

```
packages/knowledge/
├── domain/           # Scaffolded with Embedding starter entity
├── tables/           # Scaffolded with embedding table
├── server/           # Scaffolded with Db service structure
├── client/           # Scaffolded (index.ts only)
└── ui/               # Scaffolded (index.ts only)
```

**Already implemented:**
- All 5 package directories with package.json, tsconfig.json
- `@beep/knowledge-*` path aliases
- Embedding entity model (starter pattern)
- Embedding table (starter pattern)
- Basic Db service structure
- Embedding.repo.ts (starter pattern)

---

## Phase 0 Tasks

### Task 0.1: Update Entity IDs

**Location**: `packages/shared/domain/src/entity-ids/knowledge/ids.ts`

Add missing entity IDs (EmbeddingId already exists):

```typescript
import { EntityId } from "@beep/schema/identity";

const make = EntityId.builder("knowledge");

export const EntityId = make("entity", { brand: "EntityId" });
export const RelationId = make("relation", { brand: "RelationId" });
export const KnowledgeRelationId = make("knowledge_relation", { brand: "KnowledgeRelationId" });
export const ExtractionId = make("extraction", { brand: "ExtractionId" });
export const OntologyId = make("ontology", { brand: "OntologyId" });
export const EmbeddingId = make("embedding", { brand: "EmbeddingId" });  // Already exists
```

Export namespaces in `packages/shared/domain/src/entity-ids/knowledge/index.ts`:

```typescript
export * as KnowledgeEntityIds from "./ids.js";
```

### Task 0.2: Package Structure (ALREADY COMPLETE)

**Status**: ✅ Bootstrapped

All 5 packages exist with proper configuration. No action required.

### Task 0.3: Domain Models

**Target**: `packages/knowledge/domain/src/entities/`

**Already exists**: Embedding model at `Embedding/Embedding.model.ts` (use as pattern reference)

Add these entities following the Embedding pattern:

| Directory | File | Schema | Reference |
|-----------|------|--------|-----------|
| `Entity/` | `Entity.model.ts` | Entity Model | Use Embedding pattern |
| `Entity/schemas/` | `EntityType.ts` | Type enums | IAM MemberRole pattern |
| `Relation/` | `Relation.model.ts` | Relation Model, ObjectReference | Use Embedding pattern |
| `Extraction/` | `Extraction.model.ts` | Extraction Model | Use Embedding pattern |
| `Extraction/schemas/` | `ExtractionStatus.ts` | Status enum | IAM MemberStatus pattern |
| `Ontology/` | `Ontology.model.ts` | ClassDefinition, PropertyDefinition | Use Embedding pattern |
| `Embedding/` | `Embedding.model.ts` | Embedding Model | ✅ Already exists |

**Supporting files (already exist, update as needed)**:
- `entities/index.ts` - Exports all entity modules (update to include new entities)
- `entities.ts` - Re-exports as `Entities` namespace
- `value-objects/index.ts` - Value objects if needed

### Task 0.4: Table Schemas

**Target**: `packages/knowledge/tables/src/tables/`

**Already exists**: Embedding table at `embedding.table.ts` (use as pattern reference)

Add these tables following the embedding table pattern:

| Table File | Table Name | Key Columns | Status |
|------------|------------|-------------|--------|
| `entity.table.ts` | `entity` | types[], mention, attributes{}, mentions[], groundingConfidence | Add |
| `knowledgeRelation.table.ts` | `knowledgeRelation` | subjectId, predicate, objectId, objectLiteral, evidence[], confidence | Add |
| `extraction.table.ts` | `extraction` | sourceUri, status, knowledgeGraphId, ontologyId | Add |
| `ontology.table.ts` | `ontology` | name, turtleContent, version, namespace | Add |
| `embedding.table.ts` | `embedding` | entityType, entityId, ontologyId, embedding, contentText, model | ✅ Exists |

**Note**: Domain "Relation" uses `knowledgeRelation` prefix to avoid conflict with Drizzle's `relations.ts` file.

**Supporting files (already exist, update as needed)**:
- `tables/index.ts` - Exports all tables (update to include new tables)
- `schema.ts` - Aggregates tables and relations
- `_check.ts` - Compile-time type assertions
- `relations.ts` - Drizzle relations definitions (update for new tables)

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

**Target**: `packages/knowledge/server/src/db/`

**Already exists**: Basic structure with Db service and Embedding.repo.ts

Existing structure:
```
db/
├── index.ts           # ✅ Exists
├── repositories.ts    # ✅ Exists
├── Db/
│   ├── index.ts       # ✅ Exists
│   └── Db.ts          # ✅ Exists
└── repos/
    ├── index.ts       # ✅ Exists
    ├── _common.ts     # ✅ Exists
    └── Embedding.repo.ts  # ✅ Exists (use as pattern)
```

Add these repositories following Embedding.repo.ts pattern:

```
repos/
├── Entity.repo.ts           # Add
├── KnowledgeRelation.repo.ts  # Add
├── Extraction.repo.ts       # Add
└── Ontology.repo.ts         # Add
```

**Repository pattern** (`db/repos/Entity.repo.ts`):
```typescript
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { dependencies } from "@beep/knowledge-server/db/repos/_common";
import { $KnowledgeServerId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import * as Effect from "effect/Effect";

const $I = $KnowledgeServerId.create("db/repos/EntityRepo");

export class EntityRepo extends Effect.Service<EntityRepo>()($I`EntityRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(
    KnowledgeEntityIds.EntityId,
    Entities.Entity.Model,
    Effect.gen(function* () {
      yield* KnowledgeDb.Db;
      return {};
    })
  ),
}) {}
```

### Task 0.8: Scaffold Client/UI (ALREADY COMPLETE)

**Status**: ✅ Bootstrapped

Both client and ui packages are scaffolded with index.ts exports.

---

## Schema Shapes

Schema shapes follow canonical pattern using `M.Class` and `makeFields`.

### Entity Schema

```typescript
// packages/knowledge/domain/src/entities/Entity/Entity.model.ts
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Entity");

// Supporting schema for evidence spans
export class EvidenceSpan extends S.Class<EvidenceSpan>($I`EvidenceSpan`)({
  text: S.String,
  startOffset: S.Number,
  endOffset: S.Number,
  sourceUri: S.String,
  confidence: S.Number,
}) {}

export class Model extends M.Class<Model>($I`EntityModel`)(
  makeFields(KnowledgeEntityIds.EntityId, {
    types: S.Array(S.String),
    mention: S.String,
    attributes: BS.JsonFromStringOption(S.Record({ key: S.String, value: S.Unknown })),
    mentions: BS.JsonFromStringOption(S.Array(EvidenceSpan)),
    groundingConfidence: BS.FieldOptionOmittable(S.Number),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  $I.annotations("EntityModel", {
    description: "Knowledge graph entity model",
  })
) {
  static readonly utils = modelKit(Model);
}
```

### Relation Schema

```typescript
// packages/knowledge/domain/src/entities/Relation/Relation.model.ts
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Relation");

export class ObjectReference extends S.Class<ObjectReference>($I`ObjectReference`)({
  "@id": KnowledgeEntityIds.EntityId,
}) {}

// Note: Uses KnowledgeRelationId to avoid conflict with Drizzle relations
export class Model extends M.Class<Model>($I`RelationModel`)(
  makeFields(KnowledgeEntityIds.KnowledgeRelationId, {
    subjectId: KnowledgeEntityIds.EntityId,
    predicate: S.String,
    object: S.Union(S.String, ObjectReference),
    evidence: BS.JsonFromStringOption(S.Array(EvidenceSpan)),
    confidence: S.Number,
    organizationId: SharedEntityIds.OrganizationId,
  }),
  $I.annotations("RelationModel", {
    description: "Knowledge graph relation (subject-predicate-object triple)",
  })
) {
  static readonly utils = modelKit(Model);
}
```

### Consuming Entities

```typescript
// Usage via namespace import
import { Entities } from "@beep/knowledge-domain";

// Access models
const entityModel = Entities.Entity.Model;
const relationModel = Entities.Relation.Model;

// Create inserts
const entity = Entities.Entity.Model.insert.make({
  id: KnowledgeEntityIds.EntityId.make("knowledge_entity__uuid"),
  types: ["ex:Person"],
  mention: "John Doe",
  // ... audit fields handled by makeFields
});
```

---

## Implementation Order

**Note**: Package structure (Task 0.2) and scaffolds (Task 0.8) are already complete.

1. **Entity IDs** (Task 0.1) - Add missing IDs to shared-domain
2. **Domain schemas** (Task 0.3) - Add Entity, Relation, Extraction, Ontology models
3. **Table schemas** (Task 0.4) - Add entity, knowledgeRelation, extraction, ontology tables
4. **Migrations** (Task 0.5, 0.6) - RLS + pgvector
5. **Server Db** (Task 0.7) - Add repositories for new entities
6. **Verification** - Type check all packages

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

### Bootstrapped State

1. **Packages already exist**: Don't create new package.json or tsconfig.json files - update existing ones if needed

2. **Embedding patterns**: Use existing `Embedding.model.ts` and `embedding.table.ts` as reference patterns for new entities/tables

3. **Export files exist**: Update `index.ts` files to export new modules rather than creating new export files

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

**Already Complete (Bootstrapped):**
- [x] All 5 packages created (domain, tables, server, client, ui)
- [x] Client/UI scaffolds created
- [x] Server Db service structure created

**Phase 0 Deliverables:**
- [ ] Knowledge entity IDs updated in shared-domain (EntityId, RelationId, KnowledgeRelationId, ExtractionId, OntologyId)
- [ ] Domain schemas added (Entity, Relation, Extraction, Ontology) alongside existing Embedding
- [ ] Table schemas added (entity, knowledgeRelation, extraction, ontology) alongside existing embedding
- [ ] RLS policies migration created
- [ ] pgvector extension migration created
- [ ] Server repositories added for new entities
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
