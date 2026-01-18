# Spec Alignment Handoff: Canonical File Structure

**Date**: 2026-01-18
**From**: Implementation Bootstrap Session
**To**: Spec Maintenance Agent
**Purpose**: Update spec documentation to reflect canonical beep-effect file structure patterns

---

## Background

The knowledge slice has been bootstrapped following the canonical patterns from `packages/iam/*`. However, the spec documentation (particularly `MASTER_ORCHESTRATION.md`, `HANDOFF_P0.md`, and templates) contains file structure diagrams that don't match the actual repository patterns.

This handoff provides the canonical patterns discovered during bootstrap so the spec can be updated to serve as accurate documentation for future phases.

---

## Canonical Patterns (Source: `packages/iam/*`)

### Domain Package (`packages/{slice}/domain/src/`)

```
src/
├── index.ts                    # Root export
├── entities.ts                 # Re-exports all entities as namespace
├── entities/
│   ├── index.ts                # Exports all entity modules
│   └── {Entity}/               # One directory per entity
│       ├── index.ts            # Exports entity module
│       ├── {Entity}.model.ts   # M.Class model definition
│       └── schemas/            # Optional sub-schemas
│           ├── index.ts
│           └── {Schema}.ts     # Literal enums, status types, etc.
└── value-objects/              # Optional value objects
    ├── index.ts
    └── paths.ts                # Route paths if needed
```

**Key Pattern**: Models use `M.Class` with `makeFields()` from `@beep/shared-domain/common` and include `static readonly utils = modelKit(Model);`

### Tables Package (`packages/{slice}/tables/src/`)

```
src/
├── index.ts                    # Root export (exports schema namespace)
├── schema.ts                   # Aggregates tables/* and relations
├── schema-object.ts            # Optional schema object helper
├── _check.ts                   # Compile-time type assertions
├── relations.ts                # Drizzle relations definitions
└── tables/
    ├── index.ts                # Exports all tables
    └── {entity}.table.ts       # One file per table (lowercase.table.ts)
```

**Key Pattern**: Tables use `OrgTable.make(EntityId)({columns}, (t) => [indexes])` for org-scoped entities.

**Naming**: Table files are `{entityName}.table.ts` (lowercase, singular).

### Server Package (`packages/{slice}/server/src/`)

```
src/
├── index.ts                    # Root export
├── db.ts                       # Simplified db re-export
└── db/
    ├── index.ts                # Exports Db and repos
    ├── repositories.ts         # Aggregates all repos as namespace
    ├── Db/
    │   ├── index.ts            # Re-exports Db
    │   └── Db.ts               # Context.Tag Db service
    └── repos/
        ├── index.ts            # Exports all repos
        ├── _common.ts          # Shared repo utilities
        └── {Entity}.repo.ts    # One file per repository (PascalCase.repo.ts)
```

**Key Pattern**: Db uses `Context.Tag` pattern with `Layer.scoped`.

### Client Package (`packages/{slice}/client/src/`)

```
src/
├── index.ts                    # Root export
├── _internal/                  # Internal utilities
│   ├── index.ts
│   ├── common.types.ts
│   ├── common.schemas.ts
│   ├── runtime.ts
│   └── errors.ts
└── {feature}/                  # Feature directories
    ├── index.ts
    ├── layer.ts                # Feature layer
    ├── service.ts              # Feature service
    ├── atoms.ts                # Jotai atoms if needed
    ├── form.ts                 # Form schemas if needed
    ├── mod.ts                  # Module aggregation
    └── {action}/               # Action subdirectories
        ├── index.ts
        ├── handler.ts
        ├── contract.ts
        └── mod.ts
```

### UI Package (`packages/{slice}/ui/src/`)

```
src/
├── index.ts                    # Root export
└── components/                 # Optional component directories
```

---

## Current Spec vs Canonical Structure

### MASTER_ORCHESTRATION.md Lines 29-68

**Spec Shows (INCORRECT)**:
```
packages/knowledge/
├── domain/
│   └── src/
│       ├── Entity.ts
│       ├── Relation.ts
│       ├── Mention.ts
│       ├── KnowledgeGraph.ts
│       ├── OntologyContext.ts
│       └── Errors.ts
├── tables/
│   └── src/
│       ├── entities.ts
│       ├── relations.ts
│       ├── extractions.ts
│       ├── ontologies.ts
│       └── embeddings.ts
├── server/
│   └── src/
│       └── db/
│           └── Db/Db.ts
```

**Should Be (CANONICAL)**:
```
packages/knowledge/
├── domain/
│   └── src/
│       ├── index.ts
│       ├── entities.ts                           # Re-export namespace
│       ├── entities/
│       │   ├── index.ts
│       │   ├── Entity/
│       │   │   ├── index.ts
│       │   │   ├── Entity.model.ts
│       │   │   └── schemas/
│       │   │       ├── index.ts
│       │   │       └── EntityType.ts
│       │   ├── Relation/
│       │   │   ├── index.ts
│       │   │   └── Relation.model.ts
│       │   ├── Extraction/
│       │   │   ├── index.ts
│       │   │   ├── Extraction.model.ts
│       │   │   └── schemas/
│       │   │       ├── index.ts
│       │   │       └── ExtractionStatus.ts
│       │   ├── Ontology/
│       │   │   ├── index.ts
│       │   │   └── Ontology.model.ts
│       │   └── Embedding/
│       │       ├── index.ts
│       │       └── Embedding.model.ts
│       └── value-objects/
│           └── index.ts
├── tables/
│   └── src/
│       ├── index.ts
│       ├── schema.ts
│       ├── _check.ts                             # Type assertions
│       ├── relations.ts                          # Drizzle relations
│       └── tables/
│           ├── index.ts
│           ├── entity.table.ts                   # entity table (singular)
│           ├── knowledgeRelation.table.ts        # Avoid "relation" to not conflict with Drizzle
│           ├── extraction.table.ts
│           ├── ontology.table.ts
│           └── embedding.table.ts
├── server/
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
│               ├── Entity.repo.ts
│               ├── KnowledgeRelation.repo.ts
│               ├── Extraction.repo.ts
│               ├── Ontology.repo.ts
│               └── Embedding.repo.ts
```

---

## Naming Conflict: "Relation"

The knowledge graph domain has a concept called "Relation" (subject-predicate-object triples). However, Drizzle ORM also uses "relations" for its relation definitions.

**Resolution Pattern**:
- Domain model: `Relation` (fine as-is)
- Table file: `knowledgeRelation.table.ts`
- Table variable: `knowledgeRelation`
- Entity ID: `KnowledgeRelationId`

This avoids conflicts with:
- `relations.ts` (Drizzle relations file)
- Drizzle's `relations()` function

---

## Files to Update

### Primary Updates

1. **`specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md`**
   - Lines 29-68: Replace file tree with canonical structure
   - Task 0.2 (Domain Models): Update file paths
   - Task 0.3 (Table Schemas): Update file paths

2. **`specs/knowledge-graph-integration/handoffs/HANDOFF_P0.md`**
   - Task 0.3: Update domain model file locations
   - Task 0.4: Update table schema file locations
   - Schema Shapes section: Update import paths

3. **`specs/knowledge-graph-integration/templates/entity.template.ts`**
   - Update file path in header comment
   - Ensure pattern matches `{Entity}.model.ts` naming

4. **`specs/knowledge-graph-integration/outputs/codebase-context.md`**
   - If it contains file structure, update to match canonical

### Secondary Updates

5. **`specs/knowledge-graph-integration/AGENT_PROMPTS.md`**
   - Phase 0 agent prompts: Update target file paths
   - Phase 1+ prompts: Update expected file locations

6. **`specs/knowledge-graph-integration/QUICK_START.md`**
   - Update any file structure references

---

## Specific Corrections

### Domain Model Pattern

**Template Header**:
```typescript
// packages/knowledge/domain/src/entities/{Entity}/{Entity}.model.ts
```

**Import Path**:
```typescript
import { Entities } from "@beep/knowledge-domain";
// Access via: Entities.Entity.Model, Entities.Relation.Model, etc.
```

### Table Pattern

**File Location**: `packages/knowledge/tables/src/tables/{entity}.table.ts`

**Export Pattern**:
```typescript
// src/tables/index.ts
export * from "./entity.table";
export * from "./knowledgeRelation.table";
export * from "./extraction.table";
export * from "./ontology.table";
export * from "./embedding.table";
```

### Repository Pattern

**File Location**: `packages/knowledge/server/src/db/repos/{Entity}.repo.ts`

**Export Pattern**:
```typescript
// src/db/repos/index.ts
export * from "./Entity.repo";
export * from "./KnowledgeRelation.repo";
export * from "./Extraction.repo";
export * from "./Ontology.repo";
export * from "./Embedding.repo";
```

---

## Verification Checklist

After updating the spec, verify:

- [ ] All file trees in MASTER_ORCHESTRATION.md match canonical structure
- [ ] All file paths in HANDOFF_P0.md match canonical structure
- [ ] Template files reflect correct path patterns
- [ ] Import examples use correct `@beep/knowledge-*` paths
- [ ] "Relation" naming conflict is addressed consistently
- [ ] `_check.ts` file is mentioned in tables package structure
- [ ] `repositories.ts` and `repos/` directory are shown in server structure
- [ ] Domain `entities/` directory structure matches IAM pattern

---

## Reference Files

For canonical examples, examine:

| Pattern | Reference File |
|---------|----------------|
| Domain model | `packages/iam/domain/src/entities/Member/Member.model.ts` |
| Domain schemas | `packages/iam/domain/src/entities/Member/schemas/MemberRole.ts` |
| Table file | `packages/iam/tables/src/tables/member.table.ts` |
| Table _check | `packages/iam/tables/src/_check.ts` |
| Repository | `packages/iam/server/src/db/repos/Member.repo.ts` |
| Db service | `packages/iam/server/src/db/Db/Db.ts` |

---

## Bootstrapped Knowledge Slice

The actual bootstrapped structure can be examined at:
- `packages/knowledge/domain/src/entities/Embedding/Embedding.model.ts`
- `packages/knowledge/tables/src/tables/embedding.table.ts`
- `packages/knowledge/server/src/db/repos/Embedding.repo.ts`

This serves as the ground truth for how the canonical patterns were applied.
