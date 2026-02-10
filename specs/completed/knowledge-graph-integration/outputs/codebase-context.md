# Codebase Context: Knowledge Graph Integration

> Pre-research findings for Phase 0 implementation.

**Generated**: 2026-01-18
**Source**: Analysis of existing beep-effect vertical slice patterns

---

## Executive Summary

The beep-effect monorepo provides established patterns for vertical slices that the knowledge graph integration must follow. This document captures critical patterns, file locations, and implementation requirements discovered during pre-Phase 0 research.

---

## Vertical Slice Structure

### Existing Slices

| Slice | Packages | Pattern Notes |
|-------|----------|---------------|
| **IAM** | domain, tables, server, client, ui | Reference implementation |
| **Documents** | domain, tables, server, client, ui | Multi-tenant file handling |
| **Shared** | domain, tables, server, env, testkit | Cross-slice utilities |

### Knowledge Slice (Canonical Structure)

```
packages/knowledge/
├── domain/                          # @beep/knowledge-domain
│   └── src/
│       ├── index.ts
│       ├── entities.ts              # Re-exports Entities namespace
│       ├── entities/
│       │   ├── index.ts
│       │   ├── Entity/
│       │   │   ├── index.ts
│       │   │   ├── Entity.model.ts
│       │   │   └── schemas/
│       │   │       └── EntityType.ts
│       │   ├── Relation/
│       │   │   └── Relation.model.ts
│       │   ├── Extraction/
│       │   │   └── Extraction.model.ts
│       │   ├── Ontology/
│       │   │   └── Ontology.model.ts
│       │   └── Embedding/
│       │       └── Embedding.model.ts
│       └── value-objects/
│           └── index.ts
├── tables/                          # @beep/knowledge-tables
│   └── src/
│       ├── index.ts
│       ├── schema.ts
│       ├── _check.ts                # Type assertions
│       ├── relations.ts             # Drizzle relations
│       └── tables/
│           ├── index.ts
│           ├── entity.table.ts
│           ├── knowledgeRelation.table.ts
│           ├── extraction.table.ts
│           ├── ontology.table.ts
│           └── embedding.table.ts
├── server/                          # @beep/knowledge-server
│   └── src/
│       ├── index.ts
│       ├── db.ts
│       └── db/
│           ├── index.ts
│           ├── repositories.ts
│           ├── Db/
│           │   ├── index.ts
│           │   └── Db.ts
│           └── repos/
│               ├── index.ts
│               ├── _common.ts
│               └── {Entity}.repo.ts
├── client/                          # @beep/knowledge-client
└── ui/                              # @beep/knowledge-ui
```

---

## Table Factory Patterns

### Source: `packages/shared/tables/src/common.ts`

All tables inherit `globalColumns`:

```typescript
export const globalColumns = {
  ...auditColumns,        // createdAt, updatedAt, deletedAt
  ...userTrackingColumns, // createdBy, updatedBy, deletedBy
  version: pg.integer("version").notNull().default(1).$onUpdateFn(() => sql`version + 1`),
  source: pg.text("source"), // 'api', 'import', 'migration'
} as const;
```

### OrgTable Factory

For multi-tenant tables, use `OrgTable.make` which:
1. Auto-adds `organizationId` foreign key
2. Configures cascade delete behavior
3. Inherits `globalColumns`

```typescript
// packages/knowledge/tables/src/tables/entity.table.ts
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const entity = OrgTable.make(KnowledgeEntityIds.EntityId)(
  {
    types: pg.text("types").array().notNull(),
    mention: pg.text("mention").notNull(),
    attributes: pg.jsonb("attributes").default({}).notNull(),
    mentions: pg.jsonb("mentions"),
    groundingConfidence: pg.real("grounding_confidence"),
  },
  (t) => [
    pg.index("entity_org_idx").on(t.organizationId),
    pg.index("entity_types_idx").on(t.types),
  ]
);
```

---

## Database Client Pattern

### Source: `packages/iam/server/src/db/Db/Db.ts`

Each slice creates a scoped Db tag using `DbClient.make`:

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

### Key Requirements

1. Import schema from `@beep/knowledge-tables/schema`
2. Use `DbClient.make` factory from `@beep/shared-server`
3. Export `Shape` type for consumers
4. Export scoped `layer` for composition

---

## Entity ID Pattern

### Source: `packages/shared/domain/src/entity-ids/knowledge/ids.ts`

**IMPORTANT**: Knowledge entity IDs already exist as placeholder:

```typescript
import { EntityId } from "@beep/schema/identity";

const make = EntityId.builder("knowledge");

export const PlaceholderId = make("placeholder", {
  brand: "PlaceholderId",
});
```

### Required Entity IDs for Knowledge Slice

Replace placeholder with:

| Entity ID | Brand | Table |
|-----------|-------|-------|
| `EntityId` | `"EntityId"` | `entities` |
| `RelationId` | `"RelationId"` | `relations` |
| `ExtractionId` | `"ExtractionId"` | `extractions` |
| `OntologyId` | `"OntologyId"` | `ontologies` |
| `EmbeddingId` | `"EmbeddingId"` | `embeddings` |

### Integration Steps

1. Update `packages/shared/domain/src/entity-ids/knowledge/ids.ts`
2. Export from `packages/shared/domain/src/entity-ids/knowledge/index.ts`
3. Add to `KnowledgeEntityIds` namespace in main entity-ids barrel

---

## Effect Service Pattern

### Source: IAM server services

All services follow `Effect.Service` pattern:

```typescript
export class MyService extends Effect.Service<MyService>()(
  "@beep/knowledge-server/MyService",
  {
    dependencies: [DependencyService.Default],
    accessors: true,  // CRITICAL: Always enable
    effect: Effect.gen(function* () {
      const dep = yield* DependencyService;
      return {
        methodName: (input) => Effect.gen(function* () {
          // Implementation using yield*
        }),
      };
    }),
  }
) {}
```

### Service Layer Composition

```typescript
// repositories.ts
export const KnowledgeRepos = {
  layer: Layer.mergeAll(
    EntityRepo.Default,
    RelationRepo.Default,
    ExtractionRepo.Default,
    OntologyRepo.Default,
    EmbeddingRepo.Default,
  ),
};
```

---

## Repository Pattern

### Source: `packages/iam/server/src/db/repos/Member.repo.ts`

Repositories use `DbRepo.make` factory:

```typescript
// packages/knowledge/server/src/db/repos/Entity.repo.ts
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { dependencies } from "@beep/knowledge-server/db/repos/_common";
import { $KnowledgeServerId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server/factories";
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

### Common Dependencies (`_common.ts`)

```typescript
// packages/knowledge/server/src/db/repos/_common.ts
import { KnowledgeDb } from "@beep/knowledge-server/db/Db";

export const dependencies = [KnowledgeDb.layer];
```

---

## RLS Policy Pattern

### Source: Existing migrations

All org-scoped tables require RLS:

```sql
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_entities ON entities
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### Required Policies

| Table | Policy Name |
|-------|-------------|
| `entities` | `tenant_isolation_entities` |
| `relations` | `tenant_isolation_relations` |
| `extractions` | `tenant_isolation_extractions` |
| `ontologies` | `tenant_isolation_ontologies` |
| `embeddings` | `tenant_isolation_embeddings` |

---

## Package.json Template

```json
{
  "name": "@beep/knowledge-domain",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc -b",
    "check": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check . --write"
  },
  "dependencies": {
    "@beep/schema": "workspace:*",
    "@beep/shared-domain": "workspace:*",
    "effect": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "typescript": "catalog:"
  }
}
```

---

## tsconfig.json Template

```json
{
  "extends": "../../../tsconfig.base.jsonc",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../../shared/domain" },
    { "path": "../../common/schema" }
  ]
}
```

---

## Key Reference Files

| Pattern | File Path |
|---------|-----------|
| Domain model | `packages/iam/domain/src/entities/Member/Member.model.ts` |
| Domain schemas | `packages/iam/domain/src/entities/Member/schemas/MemberRole.ts` |
| Table file | `packages/iam/tables/src/tables/member.table.ts` |
| Table _check | `packages/iam/tables/src/_check.ts` |
| Table relations | `packages/iam/tables/src/relations.ts` |
| Db pattern | `packages/iam/server/src/db/Db/Db.ts` |
| Repository pattern | `packages/iam/server/src/db/repos/Member.repo.ts` |
| Repo _common | `packages/iam/server/src/db/repos/_common.ts` |
| Entity IDs | `packages/shared/domain/src/entity-ids/` |
| OrgTable factory | `packages/shared/tables/src/org-table/OrgTable.ts` |
| Effect patterns | `.claude/rules/effect-patterns.md` |
| Database patterns | `documentation/patterns/database-patterns.md` |

---

## Integration Checklist for Phase 0

### Entity IDs
- [ ] Update `packages/shared/domain/src/entity-ids/knowledge/ids.ts` with real entity IDs
- [ ] Register knowledge entity IDs in `entity-ids/index.ts` export

### Domain Package (`@beep/knowledge-domain`)
- [ ] Create `package.json` and `tsconfig.json`
- [ ] Create `entities/` directory structure with `{Entity}/{Entity}.model.ts` files
- [ ] Create `entities/index.ts` exporting all entity modules
- [ ] Create `entities.ts` re-exporting as `Entities` namespace
- [ ] Create `value-objects/index.ts`
- [ ] Include `static readonly utils = modelKit(Model)` in each model

### Tables Package (`@beep/knowledge-tables`)
- [ ] Create `package.json` and `tsconfig.json`
- [ ] Create `tables/` directory with `{entity}.table.ts` files
- [ ] Create `tables/index.ts` exporting all tables
- [ ] Create `schema.ts` aggregating tables and relations
- [ ] Create `_check.ts` with type assertions
- [ ] Create `relations.ts` with Drizzle relations

### Server Package (`@beep/knowledge-server`)
- [ ] Create `package.json` and `tsconfig.json`
- [ ] Create `db/Db/Db.ts` with Context.Tag pattern
- [ ] Create `db/repos/_common.ts` with shared dependencies
- [ ] Create `db/repos/{Entity}.repo.ts` for each entity
- [ ] Create `db/repositories.ts` aggregating repos

### Scaffolds
- [ ] Scaffold `packages/knowledge/client/` (index.ts only)
- [ ] Scaffold `packages/knowledge/ui/` (index.ts only)

### Workspace Integration
- [ ] Register packages in root `turbo.json` (if not auto-detected)
- [ ] Add path aliases to `tsconfig.base.jsonc`
- [ ] Run `bun install` to wire workspace dependencies
- [ ] Run `bun run check --filter @beep/knowledge-*` to verify compilation

---

## Gotchas from Existing Slices

### 1. Import Order Matters
`_check.ts` files enforce type parity between Drizzle tables and domain schemas. Create domain schemas first, then tables.

### 2. Index Naming
Index names must be globally unique across the database. Use table-prefixed names: `entities_org_idx`, not `org_idx`.

### 3. `OrgTable.make` Cascade Behavior
Default is `onDelete: 'cascade'`. Deleting an organization removes all knowledge graph data. Document this behavior.

### 4. Entity ID Format
Knowledge entity IDs follow pattern: `knowledge_{entity}__uuid`
Example: `knowledge_entity__550e8400-e29b-41d4-a716-446655440000`

### 5. Optimistic Locking
`globalColumns` includes `version` for optimistic locking. Repositories must implement increment logic.

---

## Next Steps

1. Examine effect-ontology reference implementation at `tmp/effect-ontology/`
2. Map effect-ontology domain models to beep-effect patterns
3. Begin Phase 0 implementation following this context
