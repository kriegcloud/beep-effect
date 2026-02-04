# Phase 1 Handoff: MentionRecord Foundations

**Date**: 2026-02-03
**From**: Spec Creation
**To**: Phase 1 (MentionRecord Foundations)
**Status**: Ready for implementation

---

## Context for Phase 1

### Working Context (≤2K tokens)

**Current Task**: Establish the immutable MentionRecord evidence layer for entity resolution.

**Success Criteria**:
- [ ] `MentionRecord` domain model created in `@beep/knowledge-domain`
- [ ] `mention_record` table definition in `@beep/knowledge-tables`
- [ ] `MentionRecord.rpc.ts` contracts defined
- [ ] Type checks pass: `bun run check --filter @beep/knowledge-*`
- [ ] All fields use branded EntityIds (no plain `S.String`)

**Immediate Dependencies**:
- `@beep/shared-domain` - SharedEntityIds, KnowledgeEntityIds
- `@beep/documents-domain` - DocumentsEntityIds
- `@beep/schema` - BS helpers (FieldOptionOmittable, etc.)
- `packages/knowledge/domain/src/value-objects/Confidence.ts` - Existing Confidence schema

**Blocking Issues**: None - Phase -1 (Architecture Foundation) is complete.

---

### Episodic Context (≤1K tokens)

**Previous Phase**: Spec was created based on IMPLEMENTATION_ROADMAP.md Phase 2 requirements.

**Key Decisions Made**:
1. **Forward-only migration** - Do NOT backfill existing `Mention` data
2. **Immutability pattern** - Only `resolvedEntityId` is mutable
3. **Provenance preservation** - Store `llmResponseHash` for audit trails

**Patterns Discovered**:
- effect-ontology uses two-tier architecture: immutable evidence → mutable resolution
- Cross-batch coordination requires organization-wide entity registry
- Merge history enables auditing and conflict resolution

---

### Semantic Context (≤500 tokens)

**Tech Stack**:
- Effect 3 with namespace imports (`import * as Effect from "effect/Effect"`)
- Effect Schema for domain models (`S.Class`, `M.Class`)
- Drizzle ORM for table definitions
- @effect/rpc for RPC contracts

**Architectural Constraints**:
- Domain models in `@beep/knowledge-domain`
- Table definitions in `@beep/knowledge-tables`
- Server implementations in `@beep/knowledge-server`
- NEVER use direct cross-slice imports
- ALWAYS use `@beep/*` path aliases

**Naming Conventions**:
- EntityIds: `KnowledgeEntityIds.MentionRecordId`
- Models: `MentionRecord.Model`
- Tables: `mentionRecordTable` (camelCase)
- RPC contracts: `MentionRecord.Rpcs`

---

### Procedural Context (links only)

**Required Reading**:
- Effect patterns: `.claude/rules/effect-patterns.md`
- Database patterns: `documentation/patterns/database-patterns.md`
- EntityId usage: `.claude/rules/effect-patterns.md#entityid-usage-mandatory`
- Schema helpers: `.claude/rules/effect-patterns.md#bs-helper-reference-beepschema`

**Pattern References**:
- Entity model: `packages/knowledge/domain/src/entities/Entity/Entity.model.ts`
- Table definition: `packages/knowledge/tables/src/tables/entity.table.ts`
- RPC contracts: `packages/documents/domain/src/entities/Document/Document.rpc.ts`

---

## Token Budget Verification

**Budget Allocation**: 4,000 tokens per handoff (Medium complexity spec)

**Breakdown**:
- Working Context: ~400 tokens (task definition, success criteria, dependencies)
- Episodic Context: ~200 tokens (previous phase, key decisions, patterns)
- Semantic Context: ~250 tokens (tech stack, constraints, naming conventions)
- Procedural Context: ~100 tokens (links to pattern docs)
- Implementation sections: ~750 tokens (file templates, schemas, verification)
- **Total: ~1,700 tokens** (42.5% of budget)

**Method**: Estimated using 297 lines × ~5.5 tokens/line average

**Status**: ✅ Well under 4,000 token limit

---

## Files to Create

### 1. MentionRecord Domain Model

**Location**: `packages/knowledge/domain/src/entities/MentionRecord/MentionRecord.model.ts`

**Key Requirements**:
- Use `M.Class` for SQL model
- Include `makeFields` helper for id/timestamps
- Use `KnowledgeEntityIds.MentionRecordId` (NEVER plain `S.String`)
- Mark extraction fields as immutable via schema design
- Use `BS.FieldOptionOmittable` for `resolvedEntityId`

**Schema Shape**:
```typescript
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { KnowledgeEntityIds } from "../../value-objects/EntityIds.js";
import { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { Confidence } from "../../value-objects/Confidence.js";
import { BS } from "@beep/schema";
import { makeFields } from "../../helpers/makeFields.js";

export class Model extends M.Class<Model>($I`MentionRecordModel`)(
  makeFields(KnowledgeEntityIds.MentionRecordId, {
    organizationId: SharedEntityIds.OrganizationId,

    // Extraction provenance (immutable)
    extractionId: KnowledgeEntityIds.ExtractionId,
    documentId: DocumentsEntityIds.DocumentId,
    chunkIndex: S.NonNegativeInt,

    // Raw extraction output (immutable)
    rawText: S.String,
    startChar: S.NonNegativeInt,
    endChar: S.NonNegativeInt,
    extractorConfidence: Confidence,

    // LLM response preservation
    llmResponseHash: S.String,

    // Link to resolved entity (mutable via resolution)
    resolvedEntityId: BS.FieldOptionOmittable(KnowledgeEntityIds.EntityId),
  }),
) {}
```

---

### 2. MentionRecord Table Definition

**Location**: `packages/knowledge/tables/src/tables/mention-record.table.ts`

**Key Requirements**:
- Use `Table.make(KnowledgeEntityIds.MentionRecordId)` pattern
- Add `.$type<EntityId.Type>()` to ALL foreign key columns
- Create indexes on `organizationId`, `extractionId`, `resolvedEntityId`
- Create text search index on `rawText` for candidate lookups
- Foreign keys to `extraction`, `document`, `entity` tables

**Table Schema**:
```typescript
import * as pg from "drizzle-orm/pg-core";
import { Table } from "@beep/tables";
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
import { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";

export const mentionRecordTable = Table.make(KnowledgeEntityIds.MentionRecordId)({
  organizationId: pg.text("organization_id").notNull()
    .$type<SharedEntityIds.OrganizationId.Type>(),

  // Provenance
  extractionId: pg.text("extraction_id").notNull()
    .$type<KnowledgeEntityIds.ExtractionId.Type>(),
  documentId: pg.text("document_id").notNull()
    .$type<DocumentsEntityIds.DocumentId.Type>(),
  chunkIndex: pg.integer("chunk_index").notNull(),

  // Raw extraction
  rawText: pg.text("raw_text").notNull(),
  startChar: pg.integer("start_char").notNull(),
  endChar: pg.integer("end_char").notNull(),
  extractorConfidence: pg.real("extractor_confidence").notNull(),

  // Audit
  llmResponseHash: pg.text("llm_response_hash").notNull(),

  // Resolution link (nullable)
  resolvedEntityId: pg.text("resolved_entity_id")
    .$type<KnowledgeEntityIds.EntityId.Type>(),
});

// Indexes
export const mentionRecordOrganizationIdIndex = pg.index("mention_record_organization_id_idx")
  .on(mentionRecordTable.organizationId);

export const mentionRecordExtractionIdIndex = pg.index("mention_record_extraction_id_idx")
  .on(mentionRecordTable.extractionId);

export const mentionRecordResolvedEntityIdIndex = pg.index("mention_record_resolved_entity_id_idx")
  .on(mentionRecordTable.resolvedEntityId);

// Text search index for candidate lookups
export const mentionRecordRawTextIndex = pg.index("mention_record_raw_text_idx")
  .using("gin", mentionRecordTable.rawText.op("gin_trgm_ops"));
```

---

### 3. MentionRecord Index File

**Location**: `packages/knowledge/domain/src/entities/MentionRecord/index.ts`

**Contents**:
```typescript
export * as Model from "./MentionRecord.model.js";
// RPC exports will be added in future phase
```

---

### 4. EntityId Definition (if not already present)

**Location**: `packages/knowledge/domain/src/value-objects/EntityIds.ts`

**Add MentionRecordId**:
```typescript
export const MentionRecordId = EntityId.makeNamed("knowledge_mention_record");
export type MentionRecordId = typeof MentionRecordId.Type;
```

**Also add ExtractionId** (if not present):
```typescript
export const ExtractionId = EntityId.makeNamed("knowledge_extraction");
export type ExtractionId = typeof ExtractionId.Type;
```

---

## Implementation Order

1. **EntityIds** (if missing) - Add `MentionRecordId` and `ExtractionId` to `EntityIds.ts`
2. **Domain Model** - Create `MentionRecord.model.ts` with all fields
3. **Table Definition** - Create `mention-record.table.ts` with indexes
4. **Index File** - Create `MentionRecord/index.ts` barrel file
5. **Verification** - Run `bun run check --filter @beep/knowledge-*`

**Rationale**: EntityIds first (dependencies), then model (references EntityIds), then table (references model), then exports.

---

## Verification Steps

After each file:

```bash
# Type check
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables

# Lint
bun run lint:fix --filter @beep/knowledge-domain
bun run lint:fix --filter @beep/knowledge-tables
```

After all files:

```bash
# Full verification
bun run check --filter @beep/knowledge-*
bun run lint --filter @beep/knowledge-*
```

---

## Known Issues & Gotchas

1. **EntityId Type Assertions**: ALWAYS use `.$type<EntityId.Type>()` on table columns, NEVER plain `pg.text()`
2. **Nullable vs Optional**: Use `BS.FieldOptionOmittable()` for optional domain fields, NOT `S.optional()`
3. **Text Search**: Requires `pg_trgm` extension - ensure it's enabled in migrations
4. **makeFields Import**: Check if `makeFields` helper exists in `@beep/knowledge-domain`, create if missing

---

## Success Criteria

Phase 1 is complete when:
- [ ] All files created and exported correctly
- [ ] Type check passes for `@beep/knowledge-domain` and `@beep/knowledge-tables`
- [ ] Lint passes for both packages
- [ ] MentionRecord model uses all branded EntityIds
- [ ] Table definition has all required indexes
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] HANDOFF_P2.md created (context document)
- [ ] P2_ORCHESTRATOR_PROMPT.md created (copy-paste prompt)

---

## Next Phase Preview

**Phase 2**: EntityRegistry and MergeHistory services

**Focus**:
- EntityRegistry service for cross-batch entity lookups
- MergeHistory table and service for tracking merge operations
- Integration with existing EntityClusterer

**Dependencies**: Phase 1 MUST be complete (MentionRecord model exists).
