# Spec Alignment Orchestrator Prompt

Copy this prompt to start a spec alignment session.

---

## Prompt

```
You are updating the knowledge-graph-integration spec to align with the canonical beep-effect file structure patterns.

## Context

The knowledge slice has been bootstrapped at `packages/knowledge/` following canonical patterns from `packages/iam/*`. However, the spec documentation contains outdated file structure diagrams that don't match the actual repository patterns.

## Your Task

Update all file structure diagrams and file path references in the spec to match the canonical patterns.

## Reference Documents

1. **SPEC_ALIGNMENT_HANDOFF.md** - Read this FIRST:
   `specs/knowledge-graph-integration/handoffs/SPEC_ALIGNMENT_HANDOFF.md`
   Contains detailed analysis of canonical vs spec patterns.

2. **Canonical Pattern Reference** (examine these):
   - `packages/iam/domain/src/entities/Member/Member.model.ts` - Domain model
   - `packages/iam/tables/src/tables/member.table.ts` - Table file
   - `packages/iam/server/src/db/repos/Member.repo.ts` - Repository

3. **Bootstrapped Knowledge Slice** (ground truth):
   - `packages/knowledge/domain/src/entities/Embedding/Embedding.model.ts`
   - `packages/knowledge/tables/src/tables/embedding.table.ts`
   - `packages/knowledge/server/src/db/repos/Embedding.repo.ts`

## Files to Update

Primary (must update):
1. `specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md`
   - Lines 29-68: File tree diagram
   - Task 0.2, 0.3, 0.4: File path references

2. `specs/knowledge-graph-integration/handoffs/HANDOFF_P0.md`
   - Task sections with file paths
   - Schema shape examples

Secondary (check and update if needed):
3. `specs/knowledge-graph-integration/templates/*.template.ts` - Header paths
4. `specs/knowledge-graph-integration/AGENT_PROMPTS.md` - Target file paths
5. `specs/knowledge-graph-integration/outputs/codebase-context.md` - If has file refs

## Key Canonical Patterns

### Domain Structure
```
domain/src/
├── index.ts
├── entities.ts                    # Re-exports namespace
├── entities/
│   ├── index.ts
│   └── {Entity}/
│       ├── index.ts
│       ├── {Entity}.model.ts      # M.Class model
│       └── schemas/               # Optional
│           └── {Schema}.ts
└── value-objects/
    └── index.ts
```

### Tables Structure
```
tables/src/
├── index.ts
├── schema.ts
├── _check.ts                      # Type assertions
├── relations.ts                   # Drizzle relations
└── tables/
    ├── index.ts
    └── {entity}.table.ts          # lowercase.table.ts
```

### Server Structure
```
server/src/
├── index.ts
├── db.ts
└── db/
    ├── index.ts
    ├── repositories.ts
    ├── Db/
    │   ├── index.ts
    │   └── Db.ts
    └── repos/
        ├── index.ts
        ├── _common.ts
        └── {Entity}.repo.ts       # PascalCase.repo.ts
```

## Naming Conflict Resolution

The knowledge graph "Relation" concept conflicts with Drizzle's `relations.ts`.

Use:
- Domain: `Relation` (fine)
- Table: `knowledgeRelation.table.ts`
- Entity ID: `KnowledgeRelationId`

## Verification

After updates, check:
- [ ] All file trees match canonical structure
- [ ] All import paths are correct
- [ ] `_check.ts` is mentioned in tables structure
- [ ] `repos/` and `repositories.ts` are in server structure
- [ ] "Relation" naming is consistently resolved

## Do NOT

- Change actual implementation code
- Modify entity-ids (already implemented)
- Add new features or phases
- Remove any content unrelated to file structure

Focus ONLY on aligning file structure documentation with canonical patterns.
```

---

## Expected Outcomes

1. MASTER_ORCHESTRATION.md file tree matches canonical pattern
2. HANDOFF_P0.md file paths match canonical pattern
3. All template file headers reference correct paths
4. Spec achieves 100% file structure accuracy vs actual codebase
