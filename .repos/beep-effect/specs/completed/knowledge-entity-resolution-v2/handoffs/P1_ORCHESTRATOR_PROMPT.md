# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the `knowledge-entity-resolution-v2` spec: MentionRecord Foundations.

### Context

The knowledge slice currently has `Mention` and `Entity` models with within-batch entity resolution via `EntityClusterer`. This phase adds an immutable `MentionRecord` evidence layer following the effect-ontology two-tier architecture pattern.

**Key Decision**: MentionRecords are immutable (except for `resolvedEntityId` link) to preserve raw extraction evidence for auditing and provenance.

**Migration Strategy**: Forward-only - do NOT backfill existing Mentions.

### Your Mission

Create the foundational `MentionRecord` entity with:

1. **Domain Model** (`packages/knowledge/domain/src/entities/MentionRecord/MentionRecord.model.ts`)
   - Use `M.Class` for SQL model
   - Include extraction provenance fields (extractionId, documentId, chunkIndex)
   - Preserve LLM response hash for audit trails
   - Mutable `resolvedEntityId` field (initially null)

2. **Table Definition** (`packages/knowledge/tables/src/tables/mention-record.table.ts`)
   - Use `Table.make(KnowledgeEntityIds.MentionRecordId)`
   - Add `.$type<EntityId.Type>()` to ALL foreign key columns
   - Create indexes on organizationId, extractionId, resolvedEntityId
   - Add text search index on rawText (requires pg_trgm)

3. **EntityId Definitions** (if missing)
   - Add `MentionRecordId` to `packages/knowledge/domain/src/value-objects/EntityIds.ts`
   - Add `ExtractionId` if not present

4. **Index File** (`packages/knowledge/domain/src/entities/MentionRecord/index.ts`)
   - Export `Model` from MentionRecord.model.ts

### Critical Patterns

**EntityId Usage (MANDATORY)**:
```typescript
// REQUIRED - Branded EntityId
import { KnowledgeEntityIds } from "../../value-objects/EntityIds.js";

export class Model extends M.Class<Model>("MentionRecord")(
  makeFields(KnowledgeEntityIds.MentionRecordId, {
    organizationId: SharedEntityIds.OrganizationId,
    extractionId: KnowledgeEntityIds.ExtractionId,  // NOT S.String!
    documentId: DocumentsEntityIds.DocumentId,
  }),
) {}
```

**Table Column Types**:
```typescript
// REQUIRED - Use .$type<>() for foreign keys
extractionId: pg.text("extraction_id").notNull()
  .$type<KnowledgeEntityIds.ExtractionId.Type>(),

// FORBIDDEN - Missing .$type<>()
extractionId: pg.text("extraction_id").notNull(),  // WRONG!
```

**Optional Fields**:
```typescript
// REQUIRED - Use BS.FieldOptionOmittable for nullable domain fields
import { BS } from "@beep/schema";

resolvedEntityId: BS.FieldOptionOmittable(KnowledgeEntityIds.EntityId),

// FORBIDDEN - Don't use S.optional() or S.NullOr() directly
resolvedEntityId: S.optional(KnowledgeEntityIds.EntityId),  // WRONG!
```

**Text Search Index**:
```typescript
// REQUIRED - Use gin_trgm_ops for text search
export const mentionRecordRawTextIndex = pg.index("mention_record_raw_text_idx")
  .using("gin", mentionRecordTable.rawText.op("gin_trgm_ops"));

// NOTE: Requires pg_trgm extension enabled in database
```

### Reference Files

- Entity model pattern: `packages/knowledge/domain/src/entities/Entity/Entity.model.ts`
- Table pattern: `packages/knowledge/tables/src/tables/entity.table.ts`
- EntityId definitions: `packages/shared/domain/src/value-objects/EntityId.ts`
- Effect patterns: `.claude/rules/effect-patterns.md`

### Verification

After each file:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run lint:fix --filter @beep/knowledge-*
```

Final verification:

```bash
bun run check --filter @beep/knowledge-*
```

### Success Criteria

- [ ] `MentionRecord.model.ts` created with all provenance fields
- [ ] `mention-record.table.ts` created with indexes
- [ ] `MentionRecordId` and `ExtractionId` defined in EntityIds.ts
- [ ] All foreign keys use `.$type<EntityId.Type>()`
- [ ] Index file exports Model
- [ ] Type checks pass for knowledge-domain and knowledge-tables
- [ ] Lint passes

### Handoff Document

Read full context in: `specs/knowledge-entity-resolution-v2/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings (what worked, what didn't, gotchas)
2. Create `HANDOFF_P2.md` (full context for EntityRegistry & MergeHistory)
3. Create `P2_ORCHESTRATOR_PROMPT.md` (copy-paste ready prompt)

**Do NOT proceed to Phase 2 until BOTH handoff files exist.**
