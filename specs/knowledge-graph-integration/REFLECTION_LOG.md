# Reflection Log: Knowledge Graph Integration

> Cumulative learnings from each phase of the knowledge graph integration.

---

## How to Use This Log

After completing each phase:

1. Add a new entry under the appropriate phase section
2. Document what worked, what didn't, and what was learned
3. Include specific examples (file paths, code patterns)
4. Note any changes to the spec based on learnings
5. Update prompts in AGENT_PROMPTS.md if needed

---

## Spec Creation (Pre-Phase 0)

### Session: 2026-01-18

**Duration**: Spec review and enhancement

#### What Worked

- **Pre-research approach**: Creating `outputs/codebase-context.md` and `outputs/effect-ontology-analysis.md` before Phase 0 provides valuable context for the orchestrator
- **Template files**: Creating concrete `templates/*.template.ts` files gives implementers copy-paste-ready patterns instead of abstract descriptions
- **HANDOFF_P0.md creation**: Having a full context document alongside the orchestrator prompt ensures no information is lost between sessions
- **Existing entity ID discovery**: Found that `packages/shared/domain/src/entity-ids/knowledge/ids.ts` already exists with placeholder content - avoiding duplicate file creation

#### What Didn't Work

- **Initial spec review score (4.2/5)**: Missing template files and outputs directory content reduced completeness
- **Empty directories**: Creating directories without content is insufficient - templates and outputs need actual files

#### Learnings

1. **Discovery before creation**: Always run codebase-researcher BEFORE defining domain models to find existing patterns and partial implementations

2. **Two-file handoff pattern**: Both `HANDOFF_P[N].md` (full context) and `P[N]_ORCHESTRATOR_PROMPT.md` (copy-paste ready) are essential for multi-session specs

3. **Template specificity**: Abstract code examples in markdown are less useful than concrete `.ts` template files with `{{Placeholder}}` markers

4. **Effect-ontology alignment**: The reference implementation at `tmp/effect-ontology/` uses compatible Effect.Service patterns - direct adaptation is feasible with multi-tenant extensions

5. **Entity ID namespace**: Knowledge entity IDs should use the `"knowledge"` namespace prefix to align with existing `EntityId.builder("knowledge")` pattern

6. **Partial implementation exists**: `packages/shared/domain/src/entity-ids/knowledge/ids.ts` already has `EmbeddingId` defined with proper annotations - Phase 0 only needs to ADD the remaining IDs (EntityId, RelationId, ExtractionId, OntologyId), not replace the file

#### Spec Updates Made

- Added `templates/entity.template.ts` - Entity schema pattern
- Added `templates/service.template.ts` - Effect.Service pattern
- Added `templates/extraction-stage.template.ts` - Pipeline stage pattern
- Added `outputs/codebase-context.md` - Beep-effect patterns analysis
- Added `outputs/effect-ontology-analysis.md` - Reference implementation mapping
- Created `handoffs/HANDOFF_P0.md` - Full Phase 0 context document
- Updated this REFLECTION_LOG.md with spec creation learnings

#### Key Design Decisions Documented

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-tenancy | `organizationId` on all tables + RLS | Aligns with existing beep-effect patterns |
| Embedding storage | pgvector with HNSW index | Production-ready similarity search |
| Entity ID prefix | `knowledge_{entity}__uuid` | Follows existing namespace convention |
| Table factory | OrgTable.make | Auto-wires organization FK + cascade |

---

## Phase 0: Foundation

### Session 1

**Date**: [YYYY-MM-DD]
**Duration**: [X hours]

#### What Worked

- [Pattern or approach that was successful]

#### What Didn't Work

- [Issue encountered and why]

#### Learnings

- [Key insight or discovery]

#### Spec Updates Made

- [Changes to README, MASTER_ORCHESTRATION, etc.]

---

## Phase 1: Ontology Service

*(To be completed after Phase 1)*

---

## Phase 2: Extraction Pipeline

*(To be completed after Phase 2)*

---

## Phase 3: Embedding & Grounding

*(To be completed after Phase 3)*

---

## Phase 4: Entity Resolution

*(To be completed after Phase 4)*

---

## Phase 5: GraphRAG

*(To be completed after Phase 5)*

---

## Phase 6: Todox Integration

*(To be completed after Phase 6)*

---

## Phase 7: UI Components

*(To be completed after Phase 7)*

---

## Cross-Phase Patterns

### Patterns to Reuse

| Pattern | Description | Example Location |
|---------|-------------|------------------|
| Entity ID builder | `EntityId.builder("namespace")` creates branded IDs | `packages/shared/domain/src/entity-ids/knowledge/ids.ts` |
| OrgTable factory | Multi-tenant table with auto organization FK | `packages/shared/tables/src/org-table/OrgTable.ts` |
| Db service | Scoped database client per slice | `packages/iam/server/src/db/Db/Db.ts` |
| Effect.Service | Service with dependencies, accessors: true | `packages/iam/server/src/adapters/` |

### Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Better Approach |
|--------------|--------------|-----------------|
| Creating new entity ID file when one exists | Duplicate definitions, import confusion | Update existing placeholder file |
| Empty template directories | Provides no implementation guidance | Create concrete template files |
| Single handoff file | Orchestrator prompt too long, context diluted | Two files: HANDOFF + ORCHESTRATOR_PROMPT |
| Abstract code examples only | Hard to copy-paste, easy to misremember | Concrete `.template.ts` files |

---

## Prompt Improvements

Track improvements made to AGENT_PROMPTS.md based on learnings:

| Date | Prompt Changed | Issue | Fix Applied |
|------|----------------|-------|-------------|
| 2026-01-18 | Phase 4 agent prompts | Missing entirely | Added complete P4 agent prompts |
| 2026-01-18 | Phase 7 agent prompts | Missing entirely | Added complete P7 agent prompts |

---

## Open Questions

Questions that arose during implementation, to be addressed in future phases:

- [ ] How should entity resolution handle type conflicts across sources?
- [ ] What's the optimal grounding threshold for different ontology domains?
- [ ] Should embeddings be cached per-organization or globally?
- [ ] How to handle ontology version upgrades with existing extracted data?

---

## References

Files frequently referenced during implementation:

| Purpose | Path |
|---------|------|
| Effect patterns | `.claude/rules/effect-patterns.md` |
| Database patterns | `documentation/patterns/database-patterns.md` |
| Effect-ontology reference | `tmp/effect-ontology/packages/@core-v2/src/` |
| Beep-effect IAM slice | `packages/iam/` |
| Codebase context | `specs/knowledge-graph-integration/outputs/codebase-context.md` |
| Effect-ontology analysis | `specs/knowledge-graph-integration/outputs/effect-ontology-analysis.md` |
