# V01: EntityId Table Typing

> Effect Pattern Enforcement Report

**Generated**: 2026-01-22
**Scope**: `packages/knowledge/tables/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | 19 |
| **Files Affected** | 8 |
| **Severity** | High |

---

## Rule Definition

All Drizzle table columns that reference entity IDs MUST use `.$type<EntityId.Type>()` for type safety. This ensures:
1. Compile-time verification of ID types across joins and queries
2. Prevention of accidental mixing of different entity ID types
3. Consistent typing between domain layer and persistence layer

---

## Available EntityId Types

From `@beep/shared-domain` (KnowledgeEntityIds namespace):

| ID Type | Import Path | Usage |
|---------|-------------|-------|
| `KnowledgeEntityIds.KnowledgeEntityId.Type` | `@beep/shared-domain` | Entity references (`entityId`, `subjectId`, `objectId`, `canonicalEntityId`) |
| `KnowledgeEntityIds.OntologyId.Type` | `@beep/shared-domain` | Ontology scoping (`ontologyId`) |
| `KnowledgeEntityIds.ExtractionId.Type` | `@beep/shared-domain` | Extraction run references (`extractionId`) |
| `KnowledgeEntityIds.EmbeddingId.Type` | `@beep/shared-domain` | Embedding references |
| `KnowledgeEntityIds.MentionId.Type` | `@beep/shared-domain` | Mention references |
| `KnowledgeEntityIds.RelationId.Type` | `@beep/shared-domain` | Relation references |
| `KnowledgeEntityIds.ClassDefinitionId.Type` | `@beep/shared-domain` | Class definition references |
| `KnowledgeEntityIds.PropertyDefinitionId.Type` | `@beep/shared-domain` | Property definition references |
| `KnowledgeEntityIds.EntityClusterId.Type` | `@beep/shared-domain` | Entity cluster references |
| `KnowledgeEntityIds.SameAsLinkId.Type` | `@beep/shared-domain` | Same-as link references |

From `@beep/shared-domain` (DocumentsEntityIds namespace):

| ID Type | Import Path | Usage |
|---------|-------------|-------|
| `DocumentsEntityIds.DocumentId.Type` | `@beep/shared-domain` | Document references (`documentId`) |

---

## Violations

### File 1: `mention.table.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/tables/src/tables/mention.table.ts`

#### Violation 1.1 (Line 27)
**Column**: `entityId`

```typescript
// CURRENT (VIOLATION)
entityId: pg.text("entity_id").notNull(),

// CORRECT
entityId: pg.text("entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
```

#### Violation 1.2 (Line 39)
**Column**: `documentId`

```typescript
// CURRENT (VIOLATION)
documentId: pg.text("document_id").notNull(),

// CORRECT
documentId: pg.text("document_id").notNull().$type<DocumentsEntityIds.DocumentId.Type>(),
```

#### Violation 1.3 (Line 45)
**Column**: `extractionId`

```typescript
// CURRENT (VIOLATION)
extractionId: pg.text("extraction_id"),

// CORRECT
extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
```

---

### File 2: `entity.table.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/tables/src/tables/entity.table.ts`

#### Violation 2.1 (Line 36)
**Column**: `ontologyId`

```typescript
// CURRENT (VIOLATION)
ontologyId: pg.text("ontology_id").notNull().default("default"),

// CORRECT
ontologyId: pg.text("ontology_id").notNull().default("default").$type<KnowledgeEntityIds.OntologyId.Type>(),
```

#### Violation 2.2 (Line 39)
**Column**: `documentId`

```typescript
// CURRENT (VIOLATION)
documentId: pg.text("document_id"),

// CORRECT
documentId: pg.text("document_id").$type<DocumentsEntityIds.DocumentId.Type>(),
```

#### Violation 2.3 (Line 45)
**Column**: `extractionId`

```typescript
// CURRENT (VIOLATION)
extractionId: pg.text("extraction_id"),

// CORRECT
extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
```

---

### File 3: `entity-cluster.table.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/tables/src/tables/entity-cluster.table.ts`

#### Violation 3.1 (Line 30)
**Column**: `canonicalEntityId`

```typescript
// CURRENT (VIOLATION)
canonicalEntityId: pg.text("canonical_entity_id").notNull(),

// CORRECT
canonicalEntityId: pg.text("canonical_entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
```

#### Violation 3.2 (Line 42)
**Column**: `ontologyId`

```typescript
// CURRENT (VIOLATION)
ontologyId: pg.text("ontology_id").notNull(),

// CORRECT
ontologyId: pg.text("ontology_id").notNull().$type<KnowledgeEntityIds.OntologyId.Type>(),
```

---

### File 4: `embedding.table.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/tables/src/tables/embedding.table.ts`

#### Violation 4.1 (Line 29)
**Column**: `entityId`

```typescript
// CURRENT (VIOLATION)
entityId: pg.text("entity_id").notNull(),

// CORRECT
entityId: pg.text("entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
```

#### Violation 4.2 (Line 32)
**Column**: `ontologyId`

```typescript
// CURRENT (VIOLATION)
ontologyId: pg.text("ontology_id").notNull().default("default"),

// CORRECT
ontologyId: pg.text("ontology_id").notNull().default("default").$type<KnowledgeEntityIds.OntologyId.Type>(),
```

---

### File 5: `relation.table.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/tables/src/tables/relation.table.ts`

#### Violation 5.1 (Line 26)
**Column**: `subjectId`

```typescript
// CURRENT (VIOLATION)
subjectId: pg.text("subject_id").notNull(),

// CORRECT
subjectId: pg.text("subject_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
```

#### Violation 5.2 (Line 32)
**Column**: `objectId`

```typescript
// CURRENT (VIOLATION)
objectId: pg.text("object_id"),

// CORRECT
objectId: pg.text("object_id").$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
```

#### Violation 5.3 (Line 41)
**Column**: `ontologyId`

```typescript
// CURRENT (VIOLATION)
ontologyId: pg.text("ontology_id").notNull().default("default"),

// CORRECT
ontologyId: pg.text("ontology_id").notNull().default("default").$type<KnowledgeEntityIds.OntologyId.Type>(),
```

#### Violation 5.4 (Line 44)
**Column**: `extractionId`

```typescript
// CURRENT (VIOLATION)
extractionId: pg.text("extraction_id"),

// CORRECT
extractionId: pg.text("extraction_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
```

---

### File 6: `extraction.table.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/tables/src/tables/extraction.table.ts`

#### Violation 6.1 (Line 27)
**Column**: `documentId`

```typescript
// CURRENT (VIOLATION)
documentId: pg.text("document_id").notNull(),

// CORRECT
documentId: pg.text("document_id").notNull().$type<DocumentsEntityIds.DocumentId.Type>(),
```

#### Violation 6.2 (Line 33)
**Column**: `ontologyId`

```typescript
// CURRENT (VIOLATION)
ontologyId: pg.text("ontology_id").notNull(),

// CORRECT
ontologyId: pg.text("ontology_id").notNull().$type<KnowledgeEntityIds.OntologyId.Type>(),
```

---

### File 7: `class-definition.table.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/tables/src/tables/class-definition.table.ts`

#### Violation 7.1 (Line 28)
**Column**: `ontologyId`

```typescript
// CURRENT (VIOLATION)
ontologyId: pg.text("ontology_id").notNull(),

// CORRECT
ontologyId: pg.text("ontology_id").notNull().$type<KnowledgeEntityIds.OntologyId.Type>(),
```

---

### File 8: `property-definition.table.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/tables/src/tables/property-definition.table.ts`

#### Violation 8.1 (Line 28)
**Column**: `ontologyId`

```typescript
// CURRENT (VIOLATION)
ontologyId: pg.text("ontology_id").notNull(),

// CORRECT
ontologyId: pg.text("ontology_id").notNull().$type<KnowledgeEntityIds.OntologyId.Type>(),
```

---

## Additional Note: `same-as-link.table.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/tables/src/tables/same-as-link.table.ts`

This file uses `.references()` pattern which provides foreign key constraint but NOT compile-time type safety:

```typescript
// CURRENT (Line 28-31) - Has FK constraint but no .$type<>()
canonicalId: pg
  .text("canonical_id")
  .notNull()
  .references(() => entity.id),

// CURRENT (Line 34-37) - Has FK constraint but no .$type<>()
memberId: pg
  .text("member_id")
  .notNull()
  .references(() => entity.id),

// CURRENT (Line 43) - No typing at all
sourceId: pg.text("source_id"),
```

**Recommendation**: While the `.references()` pattern provides runtime FK constraints, the columns should also have `.$type<>()` for compile-time type safety:

```typescript
// RECOMMENDED
canonicalId: pg
  .text("canonical_id")
  .notNull()
  .references(() => entity.id)
  .$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),

memberId: pg
  .text("member_id")
  .notNull()
  .references(() => entity.id)
  .$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),

// sourceId is ambiguous - could be ExtractionId or DocumentId
// Requires domain clarification before typing
sourceId: pg.text("source_id").$type<KnowledgeEntityIds.ExtractionId.Type>(),
```

---

## Violation Breakdown by ID Type

| ID Type | Occurrences | Files |
|---------|-------------|-------|
| `OntologyId` | 7 | entity.table.ts, entity-cluster.table.ts, embedding.table.ts, relation.table.ts, extraction.table.ts, class-definition.table.ts, property-definition.table.ts |
| `KnowledgeEntityId` | 5 | mention.table.ts, entity-cluster.table.ts, embedding.table.ts, relation.table.ts (x2) |
| `DocumentId` | 3 | mention.table.ts, entity.table.ts, extraction.table.ts |
| `ExtractionId` | 4 | mention.table.ts, entity.table.ts, relation.table.ts |

---

## Required Import Changes

Each affected file needs to add `DocumentsEntityIds` to its imports if referencing `documentId`:

```typescript
// Current
import { KnowledgeEntityIds } from "@beep/shared-domain";

// Required for files with documentId
import { KnowledgeEntityIds, DocumentsEntityIds } from "@beep/shared-domain";
```

---

## Remediation Priority

1. **High Priority** - Foreign key columns without type safety:
   - `entityId`, `subjectId`, `objectId`, `canonicalEntityId` - these are used in joins
   - `ontologyId` - used extensively for filtering and joins

2. **Medium Priority** - Cross-slice references:
   - `documentId` - references Documents slice
   - `extractionId` - provenance tracking

3. **Lower Priority** (but still required):
   - `sourceId` in same-as-link.table.ts - needs domain clarification

---

## Verification Command

After remediation, verify type safety with:

```bash
bun run check --filter @beep/knowledge-tables
```
