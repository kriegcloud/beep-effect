# Phase 2: EntityRegistry & MergeHistory - Orchestrator Prompt

> **Session Type**: Implementation
> **Orchestrator Role**: Coordinate Phase 2 implementation with delegation to specialized agents
> **Phase Goal**: Build candidate search infrastructure and merge audit trail

---

## Context from Phase 1

**Completed**: MentionRecord foundations (domain model, table, EntityId definitions)

**Phase 1 Artifacts**:
- `packages/shared/domain/src/entity-ids/knowledge/ids.ts` - Added `MentionRecordId`
- `packages/knowledge/domain/src/entities/mention-record/mention-record.model.ts` - Complete domain model with immutable provenance
- `packages/knowledge/tables/src/tables/mention-record.table.ts` - Table with comprehensive indexing
- All exports updated (domain/entities/index.ts, tables/index.ts, AnyId, TableName)

**Key Design Decisions**:
- Only `resolvedEntityId` field is mutable (for entity resolution linking)
- Forward-only migration strategy (no backfill of existing Mention data)
- All foreign keys use `.$type<EntityId.Type>()` for type safety
- GIN index on `rawText` field for fast text similarity searches
- Zero-based chunk indexing with `S.NonNegativeInt`

**Verification Status**: All type checks passing, lint passing

---

## Phase 2 Objectives

Implement the candidate search and merge audit infrastructure:

1. **EntityRegistry Service** - Candidate search with bloom filter + embedding similarity
2. **MergeHistory Service** - Audit trail for entity resolution decisions
3. **Supporting Infrastructure** - Repositories, schemas, test layers

---

## Phase 2 Scope

### 1. EntityRegistry Service

**Purpose**: Find candidate entities for incoming MentionRecords using multi-stage search strategy.

**Search Flow** (from lessons learned):
```
New MentionRecord
  |
  v
Normalize text (lowercase, trim, remove punctuation)
  |
  v
Check bloom filter (quick negative test)
  |
  +-- Not in filter -> No candidates (create new entity)
  |
  +-- In filter -> Fetch candidates (text match from database)
                     |
                     v
                   Rank by embedding similarity
                     |
                     v
                   Threshold check (>0.85 similarity)
                     |
                     +-- Above threshold -> Return as candidates
                     |
                     +-- Below threshold -> No candidates
```

**Performance Target**: <100ms for organizations with <10K entities

**Key Methods**:
- `findCandidates(mention: MentionRecord): Effect<ReadonlyArray<EntityCandidate>, RegistryError>`
- `bloomFilterCheck(normalizedText: string): Effect<boolean, never>`
- `fetchTextMatches(normalizedText: string): Effect<ReadonlyArray<Entity>, DatabaseError>`
- `rankBySimilarity(mention: MentionRecord, candidates: ReadonlyArray<Entity>): Effect<ReadonlyArray<EntityCandidate>, SimilarityError>`

**Dependencies**: EntityRepo, BloomFilterService (or helper), EmbeddingService

**Files to Create**:
- `packages/knowledge/domain/src/services/entity-registry.service.ts`
- `packages/knowledge/domain/src/services/entity-registry.test.ts`

### 2. MergeHistory Service

**Purpose**: Record and query entity merge decisions for audit trail.

**Key Methods** (from lessons learned pattern):
```typescript
export class MergeHistory extends Effect.Service<MergeHistory>()(
  "MergeHistory",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* Sql.Sql;
      return {
        recordMerge: (params: MergeParams) =>
          Effect.gen(function* () {
            yield* sql`INSERT INTO entity_merge_history ${sql.insert(params)}`;
          }).pipe(Effect.withSpan("MergeHistory.recordMerge")),

        getMergeHistory: (entityId: EntityId) =>
          Effect.gen(function* () {
            return yield* sql`
              SELECT * FROM entity_merge_history
              WHERE target_entity_id = ${entityId}
            `;
          }).pipe(Effect.withSpan("MergeHistory.getMergeHistory"))
      };
    })
  }
) {}
```

**Database Schema**:
```sql
CREATE TABLE entity_merge_history (
  _row_id SERIAL PRIMARY KEY,
  id TEXT NOT NULL UNIQUE,  -- MergeHistoryId (prefixed UUID)
  organization_id TEXT NOT NULL,
  source_entity_id TEXT NOT NULL,  -- Entity being merged
  target_entity_id TEXT NOT NULL,  -- Canonical entity
  merge_reason TEXT NOT NULL,  -- "embedding_similarity" | "manual_override" | "text_exact_match"
  confidence REAL NOT NULL,  -- 0-1 similarity score
  merged_by TEXT,  -- UserId (null for automatic merges)
  merged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX entity_merge_history_target_entity_id_idx ON entity_merge_history(target_entity_id);
CREATE INDEX entity_merge_history_source_entity_id_idx ON entity_merge_history(source_entity_id);
CREATE INDEX entity_merge_history_org_idx ON entity_merge_history(organization_id);
```

**Files to Create**:
- `packages/shared/domain/src/entity-ids/knowledge/ids.ts` - Add `MergeHistoryId`
- `packages/knowledge/domain/src/entities/merge-history/merge-history.model.ts`
- `packages/knowledge/tables/src/tables/merge-history.table.ts`
- `packages/knowledge/domain/src/services/MergeHistory.service.ts`
- `packages/knowledge/domain/src/services/merge-history.test.ts`

### 3. Supporting Infrastructure

**Entity Model & Table** (if not already exists):
- `packages/knowledge/domain/src/entities/entity/entity.model.ts`
- `packages/knowledge/tables/src/tables/entity.table.ts`

**Schemas**:
- `packages/knowledge/domain/src/schemas/entity-candidate.schema.ts` - EntityCandidate type
- `packages/knowledge/domain/src/schemas/merge-params.schema.ts` - MergeParams type
- `packages/knowledge/domain/src/schemas/merge-reason.schema.ts` - MergeReason union

**Errors**:
- `packages/knowledge/domain/src/errors/registry.errors.ts` - RegistryError types
- `packages/knowledge/domain/src/errors/merge.errors.ts` - MergeError types

---

## Critical Lessons from Prior Specs

### Lesson 1: Layer.provideMerge for Shared Dependencies (CRITICAL)

**Problem**: EntityRegistry and IncrementalClusterer (Phase 3) will both depend on EntityRepo. Without `Layer.provideMerge`, tests break because each service gets a separate repo instance.

**Correct Pattern**:
```typescript
// Test layer for Phase 2
const EntityRegistryLayer = Layer.effect(EntityRegistry, Effect.gen(function* () {
  const repo = yield* EntityRepo;
  return { /* registry implementation using repo */ };
}));

const TestLayer = Layer.provideMerge(
  EntityRegistryLayer,
  EntityRepo.Default
);

// Phase 3 will extend this:
const IncrementalClustererLayer = Layer.effect(IncrementalClusterer, Effect.gen(function* () {
  const repo = yield* EntityRepo;
  return { /* clusterer implementation using repo */ };
}));

const Phase3TestLayer = Layer.provideMerge(
  Layer.merge(EntityRegistryLayer, IncrementalClustererLayer),
  EntityRepo.Default  // Same repo instance shared by both services
);
```

**Evidence**: RDF foundation, SPARQL integration, GraphRAG all use this pattern successfully.

**Impact**: Without this, Phase 2 tests will populate EntityRepo via one service, query via another service, and see "no data found" errors.

---

### Lesson 2: MergeHistory is Service (NOT Helper Module)

**Decision Criteria**:

| Use Effect.Service When | Use Helper Module When |
|-------------------------|------------------------|
| Stateful (holds mutable data) | Pure functions |
| Lifecycle management (acquire/release) | Algorithmic transformations |
| External I/O (database, LLM, HTTP) | Internal computations |
| Needs testability via Layer swapping | Already testable via pure functions |

**MergeHistory Analysis**:
- ✅ Writes to database (`INSERT INTO entity_merge_history`)
- ✅ Needs transaction context
- ✅ Benefits from observability (`Effect.withSpan`)
- **Conclusion**: Effect.Service (NOT helper module)

**Evidence**: All database-dependent services in completed specs use Effect.Service.

---

### Lesson 3: Performance Benchmarking with live()

**Target**: <100ms for EntityRegistry candidate search (organizations with <10K entities)

**Pattern** (from RDF foundation):
```typescript
import { live } from "@beep/testkit";

live()("candidate search performance", () =>
  Effect.gen(function* () {
    // Setup: 10K existing entities
    yield* EntityRepo.bulkCreate(generateTestEntities(10000));

    const start = yield* Effect.clockWith(c => c.currentTimeMillis);
    const mention = generateTestMention();
    const candidates = yield* EntityRegistry.findCandidates(mention);
    const end = yield* Effect.clockWith(c => c.currentTimeMillis);
    const elapsed = end - start;

    console.log(`Candidate search: ${elapsed}ms for ${candidates.length} candidates`);
    assert(elapsed < 100, `Search took ${elapsed}ms, target <100ms`);
  }).pipe(Effect.provide(TestLayer))
);
```

**Why live() Not effect()**:
- `effect()` uses TestClock (controllable time, not real time)
- `live()` uses real Clock service for accurate benchmarking
- Still benefits from @beep/testkit's Effect runner

**Evidence**: RDF foundation used `live()` for 10 performance tests, established baselines that caught regressions.

---

### Lesson 4: EntityId Branding Verification (MANDATORY)

**Commands to Run Before Completion**:
```bash
# Check domain models for plain S.String
grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"

# Check table columns for missing .$type<>()
grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"
```

**Schema Requirements**:
```typescript
// Domain model - REQUIRED
export class MergeHistory extends M.Class<MergeHistory>("MergeHistory")({
  id: KnowledgeEntityIds.MergeHistoryId,    // ✅ Branded EntityId
  sourceEntityId: KnowledgeEntityIds.EntityId,  // ✅ Branded EntityId
  targetEntityId: KnowledgeEntityIds.EntityId,  // ✅ Branded EntityId
  mergedBy: BS.FieldOptionOmittable(SharedEntityIds.UserId),  // ✅ Branded EntityId (optional)
  // NOT: id: S.String  ❌
}) {}

// Table column - REQUIRED
export const mergeHistoryTable = Table.make(KnowledgeEntityIds.MergeHistoryId)({
  sourceEntityId: pg.text("source_entity_id").notNull()
    .$type<KnowledgeEntityIds.EntityId.Type>(),  // ✅ Type annotation
  targetEntityId: pg.text("target_entity_id").notNull()
    .$type<KnowledgeEntityIds.EntityId.Type>(),  // ✅ Type annotation
  mergedBy: pg.text("merged_by")
    .$type<SharedEntityIds.UserId.Type>(),  // ✅ Type annotation
  // NOT: pg.text("source_entity_id").notNull()  ❌
});
```

**Evidence**: GraphRAG legal review caught EntityId branding issues. Verification commands added to completion checklist.

---

### Lesson 5: Forward-Only Migration Strategy

**Decision**: Do NOT backfill existing `Mention` data to `MentionRecord`.

**Rationale**:
- Existing `Mention` records lack provenance fields (`extractionId`, `llmResponseHash`)
- Synthetic provenance violates data integrity principles
- Forward-only approach preserves audit trail for new extractions

**Implementation Strategy**:
```typescript
// New extractions: Create MentionRecord
if (isNewExtraction) {
  yield* MentionRecordRepo.create({
    rawText: mention.text,
    extractionId: extraction.id,
    llmResponseHash: hashResponse(llmOutput),
    // ... other fields
  });
}

// Legacy extractions: Continue using Mention (no backfill)
else {
  yield* MentionRepo.create(mention);
}
```

**Evidence**: Architecture Foundation explicitly documented forward-only approach. Ontology comparison roadmap emphasizes this.

---

### Lesson 6: Type Guards for Union Types

**Use Case**: MergeReason schema is union type: `"embedding_similarity" | "manual_override" | "text_exact_match"`

**Pattern**:
```typescript
// Schema with union
export const MergeReason = S.Literal(
  "embedding_similarity",
  "manual_override",
  "text_exact_match"
);

// Type guard for safe narrowing
const isManualOverride = (reason: S.Schema.Type<typeof MergeReason>): reason is "manual_override" =>
  reason === "manual_override";

// Usage in service logic
if (isManualOverride(mergeRecord.mergeReason)) {
  // TypeScript knows mergeReason is "manual_override"
  yield* auditManualMerge(mergeRecord);
}
```

**Benefits**: Compile-time type safety, no runtime type assertions.

**Evidence**: SPARQL integration used type guards for sparqljs union types, prevented runtime errors.

---

### Lesson 7: Effect.async Pattern for Callback-Based Libraries

**Context**: If bloom filter library uses callbacks, wrap with `Effect.async`.

**Correct Pattern** (from N3.js Parser wrapping):
```typescript
const checkBloomFilter = (text: string): Effect.Effect<boolean, BloomFilterError> =>
  Effect.async<boolean, BloomFilterError>((resume) => {
    let hasError = false;

    bloomFilter.contains(text, (error, exists) => {
      if (hasError) return; // Prevent multiple resume calls

      if (error) {
        hasError = true;
        resume(Effect.fail(new BloomFilterError({ message: error.message })));
        return;
      }

      resume(Effect.succeed(exists));
    });
  });
```

**Critical Details**:
1. **One resume call**: Use `hasError` flag to prevent multiple resume attempts
2. **Error first**: Check error parameter before processing result
3. **Accumulation**: If callback fires multiple times, accumulate results

**Evidence**: RDF Serializer successfully wrapped N3.js Parser/Writer callbacks (~75 lines, 38 tests).

---

## Implementation Plan

### Step 1: MergeHistoryId Definition

**File**: `packages/shared/domain/src/entity-ids/knowledge/ids.ts`

```typescript
export const MergeHistoryId = make("merge_history", {
  brand: "MergeHistoryId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("MergeHistoryId", {
    description: "A unique identifier for an entity merge audit record",
  })
);

export declare namespace MergeHistoryId {
  export type Type = S.Schema.Type<typeof MergeHistoryId>;
  export type Encoded = S.Schema.Encoded<typeof MergeHistoryId>;

  export namespace RowId {
    export type Type = typeof MergeHistoryId.privateSchema.Type;
    export type Encoded = typeof MergeHistoryId.privateSchema.Encoded;
  }
}

// Update Ids export
export const Ids = {
  // ... existing ids
  MergeHistoryId,
  // ... rest
} as const;
```

**Also Update**:
- `packages/shared/domain/src/entity-ids/knowledge/any-id.ts` - Add `Ids.MergeHistoryId` to union
- `packages/shared/domain/src/entity-ids/knowledge/table-name.ts` - Add `Ids.MergeHistoryId.tableName` to union

### Step 2: MergeHistory Domain Model

**File**: `packages/knowledge/domain/src/entities/merge-history/merge-history.model.ts`

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MergeHistory");

/**
 * MergeReason - Why entities were merged
 */
export const MergeReason = S.Literal(
  "embedding_similarity",
  "manual_override",
  "text_exact_match"
);

/**
 * MergeHistory model for audit trail of entity resolution decisions.
 *
 * Records when entities are merged, why they were merged, and who approved the merge.
 * Enables temporal tracking and re-resolution if merge decisions need reversal.
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`MergeHistoryModel`)(
  makeFields(KnowledgeEntityIds.MergeHistoryId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Entity being merged (source)
     */
    sourceEntityId: KnowledgeEntityIds.EntityId.annotations({
      description: "ID of the entity being merged into another",
    }),

    /**
     * Canonical entity (target)
     */
    targetEntityId: KnowledgeEntityIds.EntityId.annotations({
      description: "ID of the canonical entity (merge target)",
    }),

    /**
     * Why the merge occurred
     */
    mergeReason: MergeReason.annotations({
      description: "Reason for the merge decision",
    }),

    /**
     * Similarity confidence score (0-1)
     */
    confidence: S.Number.pipe(S.between(0, 1)).annotations({
      description: "Confidence score for the merge decision",
    }),

    /**
     * User who approved the merge (null for automatic merges)
     */
    mergedBy: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "User ID who approved the merge (null for automatic)",
      })
    ),

    /**
     * When the merge occurred
     */
    mergedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when the merge was executed",
    }),
  }),
  $I.annotations("MergeHistoryModel", {
    description: "Audit record of entity merge decisions for provenance tracking.",
  })
) {
  static readonly utils = modelKit(Model);

  /**
   * Check if merge was manual (user-approved)
   */
  get isManualMerge(): boolean {
    return this.mergedBy !== undefined;
  }

  /**
   * Check if merge was automatic (algorithm-driven)
   */
  get isAutomaticMerge(): boolean {
    return this.mergedBy === undefined;
  }
}
```

**Also Create**:
- `packages/knowledge/domain/src/entities/merge-history/index.ts` - Export barrel
- Update `packages/knowledge/domain/src/entities/index.ts` - Add `export * as MergeHistory from "./merge-history";`

### Step 3: MergeHistory Table Definition

**File**: `packages/knowledge/tables/src/tables/merge-history.table.ts`

```typescript
import { type KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";

/**
 * MergeHistory table for the knowledge slice.
 *
 * Tracks entity merge decisions with full audit trail metadata.
 * Records source entity, target entity, merge reason, confidence, and approver.
 *
 * @since 0.1.0
 * @category tables
 */
export const mergeHistory = OrgTable.make(KnowledgeEntityIds.MergeHistoryId)(
  {
    // Source entity being merged
    sourceEntityId: pg.text("source_entity_id").notNull().$type<KnowledgeEntityIds.EntityId.Type>(),

    // Target canonical entity
    targetEntityId: pg.text("target_entity_id").notNull().$type<KnowledgeEntityIds.EntityId.Type>(),

    // Merge reason: "embedding_similarity" | "manual_override" | "text_exact_match"
    mergeReason: pg.text("merge_reason").notNull(),

    // Similarity confidence (0-1)
    confidence: pg.real("confidence").notNull(),

    // User who approved merge (null for automatic)
    mergedBy: pg.text("merged_by").$type<SharedEntityIds.UserId.Type>(),

    // When merge occurred
    mergedAt: datetime("merged_at").notNull().default(sql`now()`),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg.index("merge_history_organization_id_idx").on(t.organizationId),

    // Target entity index for finding merge history
    pg.index("merge_history_target_entity_id_idx").on(t.targetEntityId),

    // Source entity index for reverse lookups
    pg.index("merge_history_source_entity_id_idx").on(t.sourceEntityId),

    // Compound index for finding all merges in an organization
    pg.index("merge_history_org_target_idx").on(t.organizationId, t.targetEntityId),
  ]
);
```

**Also Update**:
- `packages/knowledge/tables/src/tables/index.ts` - Add `export * from "./merge-history.table";`

### Step 4: Supporting Schemas

**File**: `packages/knowledge/domain/src/schemas/entity-candidate.schema.ts`

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Model as Entity } from "../entities/entity/entity.model";

const $I = $KnowledgeDomainId.create("schemas/EntityCandidate");

/**
 * EntityCandidate - Entity with similarity score for resolution
 *
 * @since 0.1.0
 * @category schemas
 */
export class EntityCandidate extends S.Class<EntityCandidate>($I`EntityCandidate`)(
  {
    entity: Entity,
    similarityScore: S.Number.pipe(S.between(0, 1)),
  },
  $I.annotations("EntityCandidate", {
    description: "Entity candidate with similarity score for resolution",
  })
) {}
```

**File**: `packages/knowledge/domain/src/schemas/merge-params.schema.ts`

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
import { MergeReason } from "../entities/merge-history/merge-history.model";

const $I = $KnowledgeDomainId.create("schemas/MergeParams");

/**
 * MergeParams - Parameters for recording an entity merge
 *
 * @since 0.1.0
 * @category schemas
 */
export class MergeParams extends S.Class<MergeParams>($I`MergeParams`)(
  {
    sourceEntityId: KnowledgeEntityIds.EntityId,
    targetEntityId: KnowledgeEntityIds.EntityId,
    mergeReason: MergeReason,
    confidence: S.Number.pipe(S.between(0, 1)),
    mergedBy: BS.FieldOptionOmittable(SharedEntityIds.UserId),
  },
  $I.annotations("MergeParams", {
    description: "Parameters for recording an entity merge",
  })
) {}
```

**Also Create**:
- `packages/knowledge/domain/src/schemas/index.ts` - Export barrel

### Step 5: Error Definitions

**File**: `packages/knowledge/domain/src/errors/registry.errors.ts`

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/Registry");

/**
 * RegistryError - EntityRegistry operation failed
 */
export class RegistryError extends S.TaggedError<RegistryError>()(
  $I`RegistryError`,
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("RegistryError", {
    description: "EntityRegistry operation failed",
  })
) {}

/**
 * SimilarityError - Embedding similarity computation failed
 */
export class SimilarityError extends S.TaggedError<SimilarityError>()(
  $I`SimilarityError`,
  {
    message: S.String,
    mentionId: S.String,
    candidateCount: S.Number,
  },
  $I.annotations("SimilarityError", {
    description: "Embedding similarity computation failed",
  })
) {}
```

**File**: `packages/knowledge/domain/src/errors/merge.errors.ts`

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/Merge");

/**
 * MergeError - Entity merge operation failed
 */
export class MergeError extends S.TaggedError<MergeError>()(
  $I`MergeError`,
  {
    message: S.String,
    sourceEntityId: S.optional(KnowledgeEntityIds.EntityId),
    targetEntityId: S.optional(KnowledgeEntityIds.EntityId),
  },
  $I.annotations("MergeError", {
    description: "Entity merge operation failed",
  })
) {}
```

**Also Create**:
- `packages/knowledge/domain/src/errors/index.ts` - Export barrel

### Step 6: MergeHistory Service

**File**: `packages/knowledge/domain/src/services/MergeHistory.service.ts`

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Sql from "@effect/sql";
import * as Effect from "effect/Effect";
import { MergeError } from "../errors/merge.errors";
import { Model as MergeHistoryModel } from "../entities/merge-history/merge-history.model";
import { MergeParams } from "../schemas/merge-params.schema";

const $I = $KnowledgeDomainId.create("services/MergeHistory");

/**
 * MergeHistory service for audit trail of entity resolution decisions.
 *
 * Records and queries entity merge history for provenance tracking.
 * Enables temporal analysis and re-resolution if merge decisions need reversal.
 *
 * @since 0.1.0
 * @category services
 */
export class MergeHistory extends Effect.Service<MergeHistory>()(
  "MergeHistory",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* Sql.Sql;

      return {
        /**
         * Record an entity merge decision
         */
        recordMerge: (params: MergeParams) =>
          Effect.gen(function* () {
            const mergeHistory = MergeHistoryModel.insert.make({
              id: KnowledgeEntityIds.MergeHistoryId.make(),
              organizationId: params.organizationId,
              sourceEntityId: params.sourceEntityId,
              targetEntityId: params.targetEntityId,
              mergeReason: params.mergeReason,
              confidence: params.confidence,
              mergedBy: params.mergedBy,
              mergedAt: DateTime.unsafeNow(),
              createdAt: DateTime.unsafeNow(),
              updatedAt: DateTime.unsafeNow(),
            });

            yield* sql`
              INSERT INTO merge_history ${sql.insert(mergeHistory)}
            `;
          }).pipe(
            Effect.withSpan("MergeHistory.recordMerge", { attributes: { sourceEntityId: params.sourceEntityId, targetEntityId: params.targetEntityId } }),
            Effect.mapError((error) =>
              new MergeError({
                message: `Failed to record merge: ${error}`,
                sourceEntityId: params.sourceEntityId,
                targetEntityId: params.targetEntityId,
              })
            )
          ),

        /**
         * Get merge history for a target entity
         */
        getMergeHistory: (entityId: KnowledgeEntityIds.EntityId.Type) =>
          Effect.gen(function* () {
            const rows = yield* sql`
              SELECT * FROM merge_history
              WHERE target_entity_id = ${entityId}
              ORDER BY merged_at DESC
            `;

            return rows.map((row) => MergeHistoryModel.make(row));
          }).pipe(
            Effect.withSpan("MergeHistory.getMergeHistory", { attributes: { entityId } }),
            Effect.mapError((error) =>
              new MergeError({
                message: `Failed to get merge history: ${error}`,
                targetEntityId: entityId,
              })
            )
          ),

        /**
         * Get all merges by a specific user
         */
        getMergesByUser: (userId: SharedEntityIds.UserId.Type) =>
          Effect.gen(function* () {
            const rows = yield* sql`
              SELECT * FROM merge_history
              WHERE merged_by = ${userId}
              ORDER BY merged_at DESC
            `;

            return rows.map((row) => MergeHistoryModel.make(row));
          }).pipe(
            Effect.withSpan("MergeHistory.getMergesByUser", { attributes: { userId } }),
            Effect.mapError((error) =>
              new MergeError({
                message: `Failed to get merges by user: ${error}`,
              })
            )
          ),
      };
    }),
  }
) {}
```

### Step 7: EntityRegistry Service (Stub Implementation)

**File**: `packages/knowledge/domain/src/services/entity-registry.service.ts`

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { RegistryError, SimilarityError } from "../errors/registry.errors";
import { Model as MentionRecordModel } from "../entities/mention-record/mention-record.model";
import { EntityCandidate } from "../schemas/entity-candidate.schema";

const $I = $KnowledgeDomainId.create("services/EntityRegistry");

/**
 * EntityRegistry service for candidate search and entity resolution.
 *
 * Finds candidate entities for incoming MentionRecords using:
 * 1. Text normalization
 * 2. Bloom filter negative test
 * 3. Database text match
 * 4. Embedding similarity ranking
 *
 * Performance target: <100ms for organizations with <10K entities.
 *
 * @since 0.1.0
 * @category services
 */
export class EntityRegistry extends Effect.Service<EntityRegistry>()(
  "EntityRegistry",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      // Dependencies will be added in implementation
      // const entityRepo = yield* EntityRepo;
      // const bloomFilter = yield* BloomFilterService;
      // const embedding = yield* EmbeddingService;

      return {
        /**
         * Find candidate entities for a mention
         *
         * @param mention MentionRecord to resolve
         * @returns Array of EntityCandidates ranked by similarity
         */
        findCandidates: (mention: MentionRecordModel) =>
          Effect.gen(function* () {
            // Step 1: Normalize text
            const normalizedText = normalizeText(mention.rawText);

            // Step 2: Bloom filter check
            const mayExist = yield* bloomFilterCheck(normalizedText);
            if (!mayExist) {
              return A.empty<EntityCandidate>();
            }

            // Step 3: Fetch text matches from database
            const textMatches = yield* fetchTextMatches(normalizedText);
            if (A.isEmptyReadonlyArray(textMatches)) {
              return A.empty<EntityCandidate>();
            }

            // Step 4: Rank by embedding similarity
            const rankedCandidates = yield* rankBySimilarity(mention, textMatches);

            // Step 5: Filter by threshold (>0.85)
            return A.filter(rankedCandidates, (candidate) => candidate.similarityScore > 0.85);
          }).pipe(
            Effect.withSpan("EntityRegistry.findCandidates", {
              attributes: { mentionId: mention.id, rawText: mention.rawText },
            }),
            Effect.mapError((error) =>
              new RegistryError({
                message: `Failed to find candidates: ${error}`,
                cause: error,
              })
            )
          ),

        /**
         * Bloom filter check (quick negative test)
         */
        bloomFilterCheck: (normalizedText: string) =>
          Effect.gen(function* () {
            // TODO: Implement bloom filter check
            // For now, return true (assume may exist)
            return true;
          }).pipe(Effect.withSpan("EntityRegistry.bloomFilterCheck")),

        /**
         * Fetch text matches from database
         */
        fetchTextMatches: (normalizedText: string) =>
          Effect.gen(function* () {
            // TODO: Implement database text match query
            // Use GIN index on normalized_text field
            return A.empty<Entity>();
          }).pipe(Effect.withSpan("EntityRegistry.fetchTextMatches")),

        /**
         * Rank candidates by embedding similarity
         */
        rankBySimilarity: (mention: MentionRecordModel, candidates: ReadonlyArray<Entity>) =>
          Effect.gen(function* () {
            // TODO: Implement embedding similarity ranking
            // Compute cosine similarity between mention embedding and candidate embeddings
            return A.empty<EntityCandidate>();
          }).pipe(
            Effect.withSpan("EntityRegistry.rankBySimilarity"),
            Effect.mapError((error) =>
              new SimilarityError({
                message: `Failed to rank by similarity: ${error}`,
                mentionId: mention.id,
                candidateCount: candidates.length,
              })
            )
          ),
      };
    }),
  }
) {}

/**
 * Normalize text for candidate search
 */
const normalizeText = (text: string): string => {
  // TODO: Implement normalization (lowercase, trim, remove punctuation)
  return text.toLowerCase().trim();
};
```

### Step 8: Test Layer Setup

**File**: `packages/knowledge/domain/test/_shared/TestLayers.ts`

```typescript
import * as Layer from "effect/Layer";
import { EntityRegistry } from "../../src/services/entity-registry.service";
import { MergeHistory } from "../../src/services/merge-history.service";
// Import EntityRepo when implemented

/**
 * Test layer for EntityRegistry and MergeHistory
 *
 * CRITICAL: Uses Layer.provideMerge to share EntityRepo between services
 */
export const EntityResolutionTestLayer = Layer.provideMerge(
  Layer.merge(
    EntityRegistry.Default,
    MergeHistory.Default
  ),
  // EntityRepo.Default  // Add when EntityRepo is implemented
);
```

### Step 9: Tests

**File**: `packages/knowledge/domain/test/services/MergeHistory.test.ts`

```typescript
import { effect, strictEqual, layer } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { MergeHistory } from "../../src/services/merge-history.service";
import { MergeParams } from "../../src/schemas/merge-params.schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { EntityResolutionTestLayer } from "../_shared/TestLayers";

layer(EntityResolutionTestLayer)("MergeHistory", (it) => {
  it.effect("records merge decision", () =>
    Effect.gen(function* () {
      const mergeHistory = yield* MergeHistory;

      const params = new MergeParams({
        sourceEntityId: KnowledgeEntityIds.EntityId.make("knowledge_entity__source"),
        targetEntityId: KnowledgeEntityIds.EntityId.make("knowledge_entity__target"),
        mergeReason: "embedding_similarity",
        confidence: 0.92,
        mergedBy: undefined, // Automatic merge
      });

      yield* mergeHistory.recordMerge(params);

      const history = yield* mergeHistory.getMergeHistory(params.targetEntityId);
      strictEqual(A.length(history), 1);
      strictEqual(history[0].mergeReason, "embedding_similarity");
      strictEqual(history[0].confidence, 0.92);
      strictEqual(history[0].isAutomaticMerge, true);
    })
  );

  it.effect("retrieves merges by user", () =>
    Effect.gen(function* () {
      const mergeHistory = yield* MergeHistory;
      const userId = SharedEntityIds.UserId.make("shared_user__test");

      const params = new MergeParams({
        sourceEntityId: KnowledgeEntityIds.EntityId.make("knowledge_entity__source"),
        targetEntityId: KnowledgeEntityIds.EntityId.make("knowledge_entity__target"),
        mergeReason: "manual_override",
        confidence: 1.0,
        mergedBy: userId,
      });

      yield* mergeHistory.recordMerge(params);

      const userMerges = yield* mergeHistory.getMergesByUser(userId);
      strictEqual(A.length(userMerges), 1);
      strictEqual(userMerges[0].isManualMerge, true);
    })
  );
});
```

**File**: `packages/knowledge/domain/test/services/EntityRegistry.test.ts`

```typescript
import { effect, live, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { EntityRegistry } from "../../src/services/entity-registry.service";
import { Model as MentionRecord } from "../../src/entities/mention-record/mention-record.model";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { EntityResolutionTestLayer } from "../_shared/TestLayers";

effect("finds candidates for mention", () =>
  Effect.gen(function* () {
    const registry = yield* EntityRegistry;

    const mention = MentionRecord.insert.make({
      id: KnowledgeEntityIds.MentionRecordId.make(),
      organizationId: SharedEntityIds.OrganizationId.make("shared_organization__test"),
      extractionId: KnowledgeEntityIds.ExtractionId.make("knowledge_extraction__test"),
      documentId: "documents_document__test",
      chunkIndex: 0,
      rawText: "Cristiano Ronaldo",
      mentionType: "http://schema.org/Person",
      confidence: 0.95,
      responseHash: "sha256:abc123",
      extractedAt: DateTime.unsafeNow(),
      createdAt: DateTime.unsafeNow(),
      updatedAt: DateTime.unsafeNow(),
    });

    const candidates = yield* registry.findCandidates(mention);

    // Initial implementation returns empty (no database setup yet)
    strictEqual(A.length(candidates), 0);
  }).pipe(Effect.provide(EntityResolutionTestLayer))
);

live()("candidate search performance", () =>
  Effect.gen(function* () {
    const registry = yield* EntityRegistry;

    // TODO: Setup 10K test entities in database
    // const testEntities = generateTestEntities(10000);
    // yield* EntityRepo.bulkCreate(testEntities);

    const mention = MentionRecord.insert.make({
      id: KnowledgeEntityIds.MentionRecordId.make(),
      organizationId: SharedEntityIds.OrganizationId.make("shared_organization__test"),
      extractionId: KnowledgeEntityIds.ExtractionId.make("knowledge_extraction__test"),
      documentId: "documents_document__test",
      chunkIndex: 0,
      rawText: "Cristiano Ronaldo",
      mentionType: "http://schema.org/Person",
      confidence: 0.95,
      responseHash: "sha256:abc123",
      extractedAt: DateTime.unsafeNow(),
      createdAt: DateTime.unsafeNow(),
      updatedAt: DateTime.unsafeNow(),
    });

    const start = yield* Effect.clockWith((c) => c.currentTimeMillis);
    const candidates = yield* registry.findCandidates(mention);
    const end = yield* Effect.clockWith((c) => c.currentTimeMillis);
    const elapsed = end - start;

    console.log(`Candidate search: ${elapsed}ms for ${candidates.length} candidates`);

    // Performance target: <100ms
    // assert(elapsed < 100, `Search took ${elapsed}ms, target <100ms`);
  }).pipe(Effect.provide(EntityResolutionTestLayer))
);
```

---

## Success Criteria

Phase 2 is complete when:

### Functional Requirements
- [ ] MergeHistoryId defined and exported in all required locations
- [ ] MergeHistory domain model created with proper EntityId branding
- [ ] MergeHistory table created with all required indexes
- [ ] MergeHistory service implemented with Effect.Service pattern
- [ ] EntityRegistry service stubbed with all method signatures
- [ ] Supporting schemas created (EntityCandidate, MergeParams, MergeReason)
- [ ] Error types defined (RegistryError, SimilarityError, MergeError)
- [ ] Test layer uses Layer.provideMerge for shared EntityRepo
- [ ] Tests for MergeHistory service (recordMerge, getMergeHistory, getMergesByUser)
- [ ] Performance benchmark test stubbed for EntityRegistry

### Quality Gates
- [ ] `bun run check --filter '@beep/knowledge-*'` passes (no type errors)
- [ ] `bun run lint --filter '@beep/knowledge-*'` passes (no lint errors)
- [ ] `bun run test --filter '@beep/knowledge-domain'` passes (all tests green)
- [ ] EntityId branding verification commands pass:
  ```bash
  grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"
  # Should only find S.String in schema definitions, not entity IDs

  grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"
  # Should return no results (all foreign keys have .$type<>())
  ```

### Documentation Requirements
- [ ] Phase 2 learnings added to REFLECTION_LOG.md
- [ ] Handoff documents created:
  - [ ] `handoffs/HANDOFF_P3.md` (full context for Phase 3)
  - [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` (copy-paste starting prompt)
- [ ] Performance baseline documented (even if stub)
- [ ] Known limitations documented (EntityRegistry stubs, missing Entity model)

---

## Questions for Orchestrator

Before starting implementation, clarify:

1. **Entity Model**: Does `packages/knowledge/domain/src/entities/entity/entity.model.ts` already exist? If not, should Phase 2 create it?

2. **EntityRepo**: Does `packages/knowledge/domain/src/repositories/entity.repo.ts` already exist? If not, should Phase 2 create a stub?

3. **BloomFilterService**: Should Phase 2 implement bloom filter, or stub it for Phase 3?

4. **EmbeddingService**: Should Phase 2 integrate embedding similarity, or stub it for Phase 3?

5. **Performance Benchmarks**: Should Phase 2 establish baselines with real data, or use synthetic stubs?

6. **Database Migrations**: Should Phase 2 generate Drizzle migrations, or defer to Phase 3?

---

## Delegation Strategy

**Orchestrator Responsibilities**:
- Coordinate file creation sequence (EntityIds → Models → Tables → Services)
- Verify type safety at each step (`bun run check`)
- Run verification commands (EntityId branding, test layer pattern)
- Create handoff documents

**Specialized Agents**:
- **domain-modeling** - For MergeHistory domain model creation
- **effect-expert** - For MergeHistory service Effect.Service implementation
- **test-writer** - For MergeHistory test suite
- **doc-writer** - For handoff documents

**Key Delegation Points**:
1. After MergeHistoryId definition → Verify with `bun run check`
2. After MergeHistory model → Verify EntityId branding
3. After MergeHistory table → Verify `.$type<>()` on foreign keys
4. After MergeHistory service → Verify test layer uses `Layer.provideMerge`
5. After all implementation → Run full verification checklist

---

## References

- **Phase 1 Completion Summary**: See conversation transcript (all files created, verification passed)
- **Lessons Learned**: `specs/KNOWLEDGE_LESSONS_LEARNED.md` (comprehensive patterns)
- **Spec-Specific Lessons**: `specs/knowledge-entity-resolution-v2/LESSONS_FROM_PRIOR_SPECS.md`
- **Effect Patterns Guide**: `packages/@core-v2/docs/architecture/effect-patterns-guide.md` (effect-ontology)
- **System Architecture**: `packages/@core-v2/docs/architecture/system-architecture.md` (effect-ontology)

---

## Next Steps

1. **Orchestrator Clarification**: Answer questions above (Entity model existence, repo stubs, service dependencies)
2. **Phase 2 Implementation**: Follow implementation plan with delegation to specialized agents
3. **Verification**: Run quality gates checklist
4. **Handoff Creation**: Create Phase 3 handoff documents
5. **Phase 3 Prep**: EntityRegistry full implementation with bloom filter and embeddings

**Estimated Effort**: Phase 2 should take 2-4 hours (mainly MergeHistory service + tests, EntityRegistry stubs)

**Phase 3 Scope**: EntityRegistry full implementation, IncrementalClusterer service, performance optimization

**Critical Path**: MergeHistoryId → MergeHistory model → MergeHistory table → MergeHistory service → Tests

**Risk Mitigation**: If EntityRepo doesn't exist, create minimal stub to unblock test layer. Phase 3 will flesh out full repository.

---

## Appendix: File Checklist

### Files to Create (MergeHistory)
- [ ] `packages/shared/domain/src/entity-ids/knowledge/ids.ts` (update)
- [ ] `packages/shared/domain/src/entity-ids/knowledge/any-id.ts` (update)
- [ ] `packages/shared/domain/src/entity-ids/knowledge/table-name.ts` (update)
- [ ] `packages/knowledge/domain/src/entities/merge-history/merge-history.model.ts`
- [ ] `packages/knowledge/domain/src/entities/merge-history/index.ts`
- [ ] `packages/knowledge/domain/src/entities/index.ts` (update)
- [ ] `packages/knowledge/tables/src/tables/merge-history.table.ts`
- [ ] `packages/knowledge/tables/src/tables/index.ts` (update)
- [ ] `packages/knowledge/domain/src/services/MergeHistory.service.ts`
- [ ] `packages/knowledge/domain/test/services/MergeHistory.test.ts`

### Files to Create (EntityRegistry Stub)
- [ ] `packages/knowledge/domain/src/schemas/entity-candidate.schema.ts`
- [ ] `packages/knowledge/domain/src/schemas/merge-params.schema.ts`
- [ ] `packages/knowledge/domain/src/schemas/index.ts`
- [ ] `packages/knowledge/domain/src/errors/registry.errors.ts`
- [ ] `packages/knowledge/domain/src/errors/merge.errors.ts`
- [ ] `packages/knowledge/domain/src/errors/index.ts`
- [ ] `packages/knowledge/domain/src/services/entity-registry.service.ts`
- [ ] `packages/knowledge/domain/test/services/EntityRegistry.test.ts`

### Files to Create (Test Infrastructure)
- [ ] `packages/knowledge/domain/test/_shared/TestLayers.ts`

### Files to Create (Handoff)
- [ ] `specs/knowledge-entity-resolution-v2/handoffs/HANDOFF_P3.md`
- [ ] `specs/knowledge-entity-resolution-v2/handoffs/P3_ORCHESTRATOR_PROMPT.md`

### Total: 24 files (10 new, 14 updates)

---

**Ready to proceed with Phase 2 implementation.**
