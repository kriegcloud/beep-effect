# Reflection Log - Knowledge GraphRAG Plus

## Purpose

Capture learnings, decision rationale, and pattern discoveries across all phases of GraphRAG enhancement implementation.

## Format

Each reflection entry should include:
- **Phase**: Which phase the learning occurred in
- **Date**: When the insight was discovered
- **Category**: [Pattern Discovery | Technical Decision | Blocker Resolution | Anti-Pattern]
- **Context**: What triggered the reflection
- **Learning**: The key insight or decision
- **Impact**: How this affects future work or other specs

---

## Phase 0: Planning

### Entry 1: Complexity Mismatch Detection

**Date**: 2026-02-03
**Category**: Technical Decision

**Context**: Initial spec declared Medium complexity (2 weeks) but calculation yielded 44 points (High threshold).

**Learning**:
- Complexity calculator revealed cross-package dependencies underestimated
- 3 cross-package dependencies (knowledge-domain, knowledge-server, shared-openai) = 12 points
- Sequential blocking on Phase 1.1 (SPARQL) and Phase 1.2 (Reasoner) increases uncertainty
- Updated classification to High (44 points)

**What Worked**:
- Clear sequential dependency identification (Phase 1.1 SPARQL + 1.2 Reasoner MUST complete first)
- Separation of concerns: Schema → Generation → Validation
- Upfront risk assessment (citation parsing ambiguity, SPARQL latency)

**What Failed**:
- Initial complexity estimate underestimated cross-package dependencies
- Declared as Medium but calculates to High (44 points)

**Impact**:
- Added QUICK_START.md, MASTER_ORCHESTRATION.md, AGENT_PROMPTS.md per High complexity requirements
- Set per-task checkpoints instead of per-phase
- Documented blocking dependency verification command

### Entry 2: Sequential Dependency Pattern

**Date**: 2026-02-03
**Category**: Pattern Discovery

**Context**: GraphRAG Plus cannot start until both Phase 1.1 (SPARQL) AND Phase 1.2 (Reasoner) complete.

**Pattern Candidate**:
- **Name**: sequential-dependency-blocking
- **Description**: When spec depends on infrastructure from multiple other planned specs, explicitly document with "MUST COMPLETE FIRST" and provide verification commands
- **Applicability**: Specs with cross-package dependencies on in-flight work
- **Confidence**: high

**Implementation**:
```markdown
## Critical Dependencies

**BLOCKING**: This spec CANNOT start until BOTH prerequisite specs are complete:

| Prerequisite Spec | Status | Why Required |
|-------------------|--------|--------------|
| `specs/other-spec/` | MUST BE COMPLETE | Reason |

**Verification Command**:
\`\`\`bash
cat specs/other-spec/README.md | grep "Status:"
\`\`\`
```

**Impact**:
- Added to QUICK_START.md decision tree (blocking gate)
- Added to MASTER_ORCHESTRATION.md overview
- Prevents wasted effort starting before dependencies ready

### Entry 3: Citation Validation Cannot Be Mocked

**Date**: 2026-02-03
**Category**: Technical Decision

**Context**: Phase 3 citation validation requires actual SPARQL endpoint, not mocks.

**Learning**:
- Citation validation verifies graph structure (entities, relations exist)
- Mock SPARQL would defeat the purpose (validate against real graph)
- Phase 3 tests MUST use real SPARQL client with test database
- This dependency reinforces Phase 1.1 (SPARQL) as hard blocker

**Impact**:
- Test strategy for Phase 3: Use real SPARQL client with test data
- Layer composition: Include actual SparqlClient.Default, not mock
- Phase 1.1 completion verification is critical gate

### Entry 4: Confidence Scoring Design Decision

**Date**: 2026-02-03
**Category**: Technical Decision

**Context**: Confidence scoring formula balances citation validity and inference depth.

**Decision**:
```
confidence = avg(citation_confidences) - (0.1 * inference_depth)
confidence = Math.max(0, confidence)  // Floor at 0.0
```

**Rationale**:
- Citation confidence: 1.0 (exact match) or 0.0 (not found)
- Future: fuzzy matching for 0.5-0.9 scores (deferred)
- Inference depth penalty: 0.1 per hop (assumes 5-hop max from Phase 1.2)
- Answer confidence: weighted average (all citations contribute equally)

**Alternatives Considered**:
1. Exponential penalty for depth: Too aggressive, penalizes valid inferences
2. Fixed threshold (< 3 hops = 1.0, >= 3 hops = 0.5): Too coarse, loses granularity
3. No depth penalty: Overconfident on deep inferences

**Impact**:
- Documented in MASTER_ORCHESTRATION.md Task 3.5
- A/B testing in production may refine weights (post-launch)

---

## Phase 1: Schema Foundation

### Entry 1: Confidence Schema Reuse

**Date**: 2026-02-04
**Category**: Pattern Discovery

**Context**: Needed confidence score validation (0.0-1.0 range) for Citation and GroundedAnswer schemas.

**Learning**:
- `@beep/knowledge-domain/value-objects` already exports a `Confidence` schema with proper range validation
- Reusing existing schema prevents duplication and ensures consistency across knowledge domain
- Pattern: `S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1))`

**What Worked**:
- Importing `Confidence` from existing value-objects module
- Schemas compose cleanly with `S.Class<T>("ClassName")` pattern
- Tests validate boundary conditions (0.0, 1.0) and rejection of out-of-range values

**Impact**:
- Phase 2 and Phase 3 can reuse the same `Confidence` import pattern
- No need to create new validation logic for confidence scores

### Entry 2: EntityId Type Resolution

**Date**: 2026-02-04
**Category**: Technical Decision

**Context**: Citation schema needs to reference knowledge graph entity and relation IDs.

**Decision**:
- Use `KnowledgeEntityIds.KnowledgeEntityId` for entity references (not generic `EntityId`)
- Use `KnowledgeEntityIds.RelationId` for relation references
- Import from `@beep/shared-domain` which re-exports the knowledge entity IDs

**Rationale**:
- Existing domain models (Entity.Model, Relation.Model) use these specific branded IDs
- Ensures type compatibility when joining citations to actual graph entities
- Prevents accidental mixing of entity ID types from different slices

**Alternatives Considered**:
1. Plain `S.String`: Loses type safety, allows invalid IDs
2. Generic `EntityId`: Doesn't distinguish knowledge entities from other slices
3. Custom branded ID: Duplicates existing infrastructure

**Impact**:
- Phase 2 citation parsing must produce correctly branded IDs
- Phase 3 validation queries can type-safely join on entity/relation IDs

### Entry 3: Schema Class vs Struct Pattern

**Date**: 2026-02-04
**Category**: Pattern Discovery

**Context**: Handoff document specified `S.Class<T>("ClassName")` pattern for all schemas.

**Learning**:
- `S.Class` provides:
  - Named class for better error messages
  - `.make()` constructor for type-safe instantiation
  - Better integration with Effect's decoding
- `S.Struct` is simpler but loses class identity
- Codebase convention strongly favors `S.Class` for domain models

**What Worked**:
- All 4 schemas (InferenceStep, ReasoningTrace, Citation, GroundedAnswer) use `S.Class`
- Tests use `S.decode(SchemaClass)` for validation
- Type inference works correctly for nested schemas (Citation within GroundedAnswer)

**Impact**:
- Phase 2 generators should construct instances via `SchemaClass.make(...)` when possible
- Phase 3 validation can decode LLM responses directly into these schema classes

### Entry 4: NonEmptyString Source

**Date**: 2026-02-04
**Category**: Technical Decision

**Context**: Handoff document suggested `BS.NonEmptyString` but codebase patterns use `S.NonEmptyString`.

**Decision**:
- Use `S.NonEmptyString` directly from `effect/Schema`
- `BS` (from `@beep/schema`) provides helpers but doesn't re-export `NonEmptyString`

**Verification**:
- Existing domain models like `SnakeTag extends S.NonEmptyString.pipe(...)` confirm this pattern
- `BS.FieldOptionOmittable` and `BS.BoolWithDefault` are the typical BS helper usages

**Impact**:
- Minor correction to handoff document (update for Phase 2)
- No functional impact; schema validation works identically

### Entry 5: Handoff Document Creation as Phase Gate

**Date**: 2026-02-04
**Category**: Pattern Discovery

**Context**: Completing Phase 1 requires creating handoff documents for Phase 2 before the phase is considered done.

**Learning**:
- Handoff documents (`HANDOFF_P{N+1}.md` and `P{N+1}_ORCHESTRATOR_PROMPT.md`) are mandatory for phase completion
- This ensures knowledge transfer between sessions and prevents context loss
- The 4-tier memory structure (Critical Context, Execution Checklist, Technical Details, Historical Context) provides structured handoff

**What Worked**:
- Creating handoff documents while context is fresh captures details that would be lost
- Including "Phase 1 Learnings to Apply" in Phase 2 handoff prevents repeating mistakes
- Orchestrator prompts provide copy-paste starting points for subsequent phases

**Pattern Candidate**:
- **Name**: mandatory-handoff-gate
- **Description**: Every phase completion requires creating handoff documents for the next phase
- **Implementation**: Add "Handoff Creation (REQUIRED)" section to every phase's Tier 2 checklist
- **Applicability**: All multi-phase specs

**Impact**:
- Added to all HANDOFF documents as required checklist item
- Reinforced in spec README.md Phase Completion Requirements section
- Future phases will include this as explicit gate criteria

---

## Phase 2: Answer Generation

### Entry 1: LanguageModel Mock for Text vs Structured Output

**Date**: 2026-02-04
**Category**: Technical Decision

**Context**: GroundedAnswerGenerator uses `generateText` (plain text) but existing test helper `withLanguageModel` was designed for `generateObject` (structured output with JSON decoding).

**Learning**:
- `@effect/ai` LanguageModel has two distinct methods: `generateText` and `generateObject`
- The existing `withLanguageModel` mock in TestLayers returns empty text for non-JSON responses
- For text-based generators, need custom mock that returns `Part.text` response format

**What Worked**:
- Created `withTextLanguageModel` helper specifically for text generation tests
- Response format: `[{ type: "text", text }, { type: "finish", reason: "stop", usage }]`
- Uses `dual(2, ...)` pattern for data-last/data-first compatibility

**What Failed**:
- Initial attempt to use existing `withLanguageModel` produced empty strings
- Tests passed but assertions were trivially true (empty text has no citations)

**Impact**:
- Created reusable test pattern for text-based LLM mocks
- Phase 3 tests may need similar mocks if using text generation
- Document mock selection criteria based on LLM method used

### Entry 2: Effect.fn with Composition Pattern

**Date**: 2026-02-04
**Category**: Pattern Discovery

**Context**: Testkit `effect()` runner requires `Effect.fn` pattern, but initial implementation used incorrect `.pipe()` composition.

**Learning**:
- WRONG: `Effect.fn(function* () {...}).pipe(Effect.provide(...), withMock(...))`
- CORRECT: `Effect.fn(function* () {...}, Effect.provide(...), withMock(...))`
- `Effect.fn` accepts composition arguments directly, not via `.pipe()`
- This is documented in Effect but easy to miss when copying patterns

**What Worked**:
- Passing Layer providers as additional arguments to `Effect.fn`
- Test pattern: `effect("name", Effect.fn(function* () {...}, Effect.provide(Layer), withMock(value)))`

**What Failed**:
- Using `.pipe()` resulted in TypeScript error "Property 'pipe' does not exist on type"
- The error message was misleading (suggested `pipe` method missing rather than wrong usage)

**Impact**:
- Update test patterns in documentation
- Future tests should use the variadic form of `Effect.fn`

### Entry 3: Citation Parser Design - Sentence-Level vs Raw Extraction

**Date**: 2026-02-04
**Category**: Technical Decision

**Context**: LLM responses may have multiple citations per sentence. Need to decide parsing granularity.

**Decision**:
- `extractEntityIds` / `extractRelationIds`: Simple extraction, returns deduplicated IDs
- `parseCitations`: Groups citations by sentence, creating Citation objects with multiple entity IDs
- Strip functions: Remove markers for clean user display

**Rationale**:
- Raw extraction useful for validation (check all referenced IDs exist)
- Sentence grouping enables confidence scoring per claim
- Clean text display avoids exposing internal markers to users

**Alternatives Considered**:
1. Single Citation per marker: Would create excessive Citation objects
2. Document-level grouping: Loses sentence-level granularity for confidence
3. Regex-only approach: Wouldn't group related citations

**Impact**:
- Phase 3 validation can use `extractEntityIds` for quick existence checks
- Confidence scoring can operate on sentence-level Citation objects
- UI layer receives clean text without markers

### Entry 4: GraphContext Type Alignment

**Date**: 2026-02-04
**Category**: Technical Decision

**Context**: Both PromptTemplates and GroundedAnswerGenerator need graph context type.

**Decision**:
- Defined `GraphContext` interface in PromptTemplates.ts (single source of truth)
- Re-exported from GroundedAnswerGenerator.ts for convenience
- Matches structure expected from GraphRAG retrieval phase

**Structure**:
```typescript
interface GraphContext {
  entities: ReadonlyArray<{
    id: string;
    mention: string;
    types: ReadonlyArray<string>;
    attributes?: Record<string, string>;
  }>;
  relations: ReadonlyArray<{
    id: string;
    subjectId: string;
    predicate: string;
    objectId: string;
  }>;
}
```

**Impact**:
- Phase 3 should import `GraphContext` from existing module
- Context Formatter (existing) already produces compatible format
- No breaking changes to existing retrieval pipeline

### Entry 5: Optional Attributes with exactOptionalPropertyTypes

**Date**: 2026-02-04
**Category**: Pattern Discovery

**Context**: TypeScript's `exactOptionalPropertyTypes` flag caused error when including undefined `attributes` in entity objects.

**Learning**:
- With `exactOptionalPropertyTypes`, `{ ...entity, attributes: undefined }` is invalid
- Must conditionally construct objects to omit undefined properties entirely

**What Worked**:
```typescript
// Conditionally include attributes only when defined
const entity: GraphContextEntity = { id, mention, types };
if (attributes !== undefined) {
  return { ...entity, attributes };
}
return entity;
```

**What Failed**:
- Simple spread: `return { id, mention, types, attributes }` - includes undefined
- Ternary spread: Causes "not assignable" errors with strict optional handling

**Impact**:
- All schema/domain type construction must account for this flag
- Utility patterns for conditional property inclusion may be needed

---

## Phase 3: Citation Validation

_Reflections will be added during Phase 3 execution_

---

## Cross-Cutting Reflections

### Pattern: Citation Marker Format

**Context**: LLM must cite entities/relations in a machine-parsable format.

**Pattern**:
- Entity: `{{entity:entity_id}}`
- Relation: `{{relation:relation_id}}`

**Why This Format**:
- Double braces reduce collision with natural language
- Prefix (entity/relation) disambiguates types
- Colon separator cleanly splits type from ID
- Regex extraction: `/\{\{(entity|relation):([^}]+)\}\}/g`

**Risk**: LLM may not follow format perfectly. Mitigation: Graceful parsing with fallback.

---

## Pattern Candidates for Promotion

### Candidate 1: sequential-dependency-blocking

**Score Estimate**: 80/102 (Validated)

| Category | Score | Rationale |
|----------|-------|-----------|
| Clarity | 10/12 | Clear blocking declaration |
| Completeness | 8/12 | Verification command provided |
| Correctness | 12/12 | Prevents invalid execution order |
| Reusability | 10/12 | Applies to any cross-spec dependency |
| Evidence | 8/12 | Prevents wasted effort (documented, not measured) |
| Efficiency | 10/12 | Saves time by front-loading verification |
| Maintainability | 10/12 | Easy to update as specs progress |
| Alignment | 12/12 | Follows spec creation guide principles |

**Promotion**: Add to `specs/_guide/PATTERN_REGISTRY.md` under "Dependency Management"
