# Phase 3 Handoff: Remediation

**Date**: 2026-01-22
**From**: Phase 2 (Synthesis)
**To**: Phase 3 (Remediation Execution)
**Status**: Ready for execution

---

## Context for Phase 3

### Working Context (Critical)

**Mission**: Execute remediation of 240 violations across 6 sub-phases.

**Success Criteria**:
- [ ] All verification commands pass (no violations detected)
- [ ] `bun run build --filter @beep/knowledge-*` passes
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] `bun run test --filter @beep/knowledge-*` passes
- [ ] `bun run lint --filter @beep/knowledge-*` passes

**Blocking Issues**: None - all synthesis complete, master document ready.

### Episodic Context

**Phase 2 Results**:
- MASTER_VIOLATIONS.md created with complete inventory
- 6 remediation sub-phases defined (3a-3f)
- Dependency graph established
- Effort estimated at ~38.5 hours total

**Key Decision**: Execute in dependency order, not severity order. Phase 3a (Foundation) unlocks subsequent phases.

### Semantic Context

**Remediation Sub-Phases**:

| Phase | Categories | Violations | Est. Hours | Dependencies |
|-------|------------|------------|------------|--------------|
| 3a | V02, V06 | 12 | 5 | None |
| 3b | V01, V04, V14 | 29 | 3.5 | 3a |
| 3c | V09, V12 | 61 | 10 | 3a |
| 3d | V03, V05, V10, V11, V13, V15 | 108 | 13 | 3a, 3c |
| 3e | V07, V08, V16, V18 | 22 | 3 | 3a |
| 3f | V17 | 8 | 4 | All (optional) |

**Hotspot Files** (fix these for maximum impact):
1. `EntityClusterer.ts` - 27 violations
2. `SameAsLinker.ts` - 30 violations
3. `CanonicalSelector.ts` - 15 violations
4. `EmbeddingService.ts` - 18 violations

### Procedural Context (Links)

- Master document: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
- Violation reports: `specs/knowledge-code-quality-audit/outputs/violations/V*.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Reflection log: `specs/knowledge-code-quality-audit/REFLECTION_LOG.md`

---

## Phase 3a: Foundation

### Goal
Fix critical errors and extract duplicated code to shared utilities.

### Tasks

#### Task 3a.1: Create CanonicalSelectionError (V06)

**Location**: Create `packages/knowledge/domain/src/errors/entity-resolution.errors.ts`

**Actions**:
1. Create new error class extending `S.TaggedError`
2. Define `reason: S.Literal("empty_cluster", "selection_failed")`
3. Export from `packages/knowledge/domain/src/errors/index.ts`
4. Update `CanonicalSelector.ts`:
   - Import new error
   - Replace `Effect.die(new Error(...))` with `Effect.fail(new CanonicalSelectionError(...))`
   - Update return type signature if needed

**Files**: 2 (1 new, 1 modified)
**Violations Fixed**: 3

#### Task 3a.2: Extract extractLocalName (V02)

**Currently duplicated in**:
- `EmbeddingService.ts:58`
- `EntityClusterer.ts:108`
- `GroundingService.ts:83`
- `ContextFormatter.ts:22`
- `constants.ts:86` (already exported)

**Actions**:
1. Use existing export from `packages/knowledge/server/src/Ontology/constants.ts`
2. Remove duplicate definitions from 4 files
3. Add import to each file: `import { extractLocalName } from "../Ontology/constants"`

**Files**: 4 modified
**Violations Fixed**: 4 (duplicates)

#### Task 3a.3: Extract cosineSimilarity (V02)

**Location**: Create `packages/knowledge/server/src/utils/vector.ts`

**Actions**:
1. Create new file with safer implementation (empty array check + nullish coalescing)
2. Export function
3. Remove duplicates from:
   - `GroundingService.ts:118`
   - `EntityClusterer.ts:158`
4. Add imports to both files

**Files**: 3 (1 new, 2 modified)
**Violations Fixed**: 2

#### Task 3a.4: Extract formatEntityForEmbedding (V02)

**Location**: Create `packages/knowledge/server/src/utils/formatting.ts`

**Actions**:
1. Create new file with canonical name
2. Import `extractLocalName` from `../Ontology/constants`
3. Remove duplicates from:
   - `EmbeddingService.ts:49`
   - `EntityClusterer.ts:99`
4. Add imports to both files

**Files**: 3 (1 new, 2 modified)
**Violations Fixed**: 2

### Phase 3a Verification

```bash
# Verify no duplicate extractLocalName
grep -rn "const extractLocalName" packages/knowledge/server/src/ | wc -l
# Expected: 0 (all should import from constants.ts)

# Verify no native Error in CanonicalSelector
grep -rn "new Error\(" packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts
# Expected: 0

# Type check
bun run check --filter @beep/knowledge-server

# Tests
bun run test --filter @beep/knowledge-server
```

---

## Phase 3b: Type Safety

### Goal
Establish proper EntityId typing across tables and creation points.

### Tasks

#### Task 3b.1: Add EntityId Types to Tables (V01)

**Files**: 8 table files in `packages/knowledge/tables/src/tables/`

**Actions per file**:
1. Add import: `import { KnowledgeEntityIds, DocumentsEntityIds } from "@beep/shared-domain";`
2. Add `.$type<>()` to each ID column (19 total)

**Violations Fixed**: 19

#### Task 3b.2: Fix Error Construction (V04)

**File**: `packages/knowledge/server/src/Embedding/EmbeddingService.ts:315-320`

**Action**: Replace cast with constructor:
```typescript
// Before
({ _tag: "EmbeddingError", ... }) as EmbeddingError

// After
new EmbeddingError({ ... })
```

**Violations Fixed**: 1

#### Task 3b.3: Fix EntityId Creation (V14)

**Files**: 5 files with `crypto.randomUUID()` patterns

**Actions**:
1. Remove manual UUID generation from `.make()` calls (4 fixes)
2. Add `KnowledgeEntityIds` import and use proper factory (5 fixes)

**Violations Fixed**: 9

### Phase 3b Verification

```bash
# Verify table typing
grep -rn "text(\".*_id\")" packages/knowledge/tables/src/ | grep -v "\$type<" | wc -l
# Expected: 0

# Verify no manual UUID patterns
grep -rn "crypto\.randomUUID()" packages/knowledge/server/src/
# Expected: 0

# Type check
bun run check --filter @beep/knowledge-*
```

---

## Phase 3c: Data Structures

### Goal
Migrate from native Set/Map to Effect MutableHashSet/MutableHashMap.

### Tasks

#### Task 3c.1: Migrate Native Set (V09)

**Files**: 8 files, 22 violations

**Pattern**:
```typescript
// Before
const visited = new Set<string>();
visited.add(x);
if (visited.has(x)) { ... }

// After
import * as MutableHashSet from "effect/MutableHashSet";
const visited = MutableHashSet.empty<string>();
MutableHashSet.add(visited, x);
if (MutableHashSet.has(visited, x)) { ... }
```

**Priority Order**:
1. SameAsLinker.ts (18 uses)
2. OntologyParser.ts (9 uses)
3. OntologyService.ts (7 uses)
4. ConfidenceFilter.ts (7 uses)
5. GraphRAGService.ts (6 uses)
6. EntityClusterer.ts (6 uses)
7. EntityResolutionService.ts (3 uses)
8. GraphAssembler.ts (3 uses)
9. EntityExtractor.ts (2 uses)
10. CanonicalSelector.ts (3 uses)

**Violations Fixed**: 22

#### Task 3c.2: Migrate Native Map (V12)

**Files**: 11 files, 39 violations

**Pattern**:
```typescript
// Before
const cache = new Map<string, Entity>();
cache.set(key, value);
const result = cache.get(key);

// After
import * as MutableHashMap from "effect/MutableHashMap";
const cache = MutableHashMap.empty<string, Entity>();
MutableHashMap.set(cache, key, value);
const result = MutableHashMap.get(cache, key); // Returns Option<V>
```

**Note**: Map.get() returns `Option<V>` - many non-null assertions (V11) will become O.getOrElse patterns after this phase.

**Violations Fixed**: 39

### Phase 3c Verification

```bash
# Verify no native Set
grep -rn "new Set\(" packages/knowledge/server/src/ | wc -l
# Expected: 0

# Verify no native Map
grep -rn "new Map\(" packages/knowledge/server/src/ | wc -l
# Expected: 0

# Type check
bun run check --filter @beep/knowledge-server
```

---

## Phase 3d: Method Patterns

### Goal
Replace native JS methods with Effect utilities.

### Tasks

(6 categories, 108 fixes - see MASTER_VIOLATIONS.md for full details)

- V03: Native string methods → Str.* (21 fixes)
- V05: Array emptiness → A.isEmptyReadonlyArray (35 fixes)
- V10: Native .map() → A.map (9 fixes)
- V11: Non-null assertions → Option patterns (26 fixes)
- V13: Native .sort() → A.sort + Order (3 fixes)
- V15: .toLowerCase() → Str.toLowerCase (14 fixes)

### Phase 3d Verification

```bash
# Verify no native string methods
grep -rn "\.lastIndexOf\|\.slice(" packages/knowledge/server/src/ | wc -l
# Expected: Minimal (some may be valid)

# Verify no .toLowerCase() violations
grep -rn "\.toLowerCase()" packages/knowledge/server/src/ | wc -l
# Expected: 0
```

---

## Phase 3e: Modernization

### Goal
Apply modern Effect patterns for remaining violations.

### Tasks

- V07: Switch → Match.value (1 fix)
- V08: Object.entries → R.toEntries (4 fixes)
- V16: Date.now → DateTime (6 fixes)
- V18: Empty [] → A.empty<T>() (11 fixes)

### Phase 3e Verification

```bash
# Verify no switch statements
grep -rn "switch\s*(" packages/knowledge/server/src/ | wc -l
# Expected: 0

# Verify no Date.now
grep -rn "Date\.now\(\)" packages/knowledge/server/src/ | wc -l
# Expected: 0
```

---

## Phase 3f: Optimization (Optional)

### Goal
Performance optimization for large collections.

### Tasks

V17: Evaluate Chunk migration for 8 candidates

**Requires profiling** - only proceed if benchmarks show benefit.

---

## Quality Gates

### After Each Sub-Phase

1. `bun run check --filter @beep/knowledge-*` passes
2. `bun run test --filter @beep/knowledge-*` passes
3. Verification grep commands show expected results

### After All Phases

1. `bun run build` (full repo)
2. `bun run lint:fix`
3. Git commit with summary of changes

---

## Next Steps

After Phase 3 completes:
1. Update `REFLECTION_LOG.md` with remediation learnings
2. Create `HANDOFF_P4.md` (verification/cleanup phase)
3. Consider promoting patterns to `CLAUDE.md` or spec guide
