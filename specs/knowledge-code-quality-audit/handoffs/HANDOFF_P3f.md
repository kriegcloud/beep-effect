# Phase 3f Handoff - Array Emptiness Checks

**Previous Phase**: 3e (Native Map Part 2) ✅ Complete
**Current Phase**: 3f (Array Emptiness Checks)
**Status**: Ready to Start

---

## Context

Phase 3e successfully migrated all remaining native `Map` to `MutableHashMap` (15 fixes across 7 files + 2 test files). Phase 3f replaces array length checks with Effect utilities.

### Completed Phases

| Phase | Description | Fixes |
|-------|-------------|-------|
| 3a | Foundation (errors, duplicates) | 12 |
| 3b | Type Safety (EntityIds) | 29 |
| 3c | Native Set → MutableHashSet | 22 |
| 3d | Native Map Part 1 | 24 |
| 3e | Native Map Part 2 | 15 |
| **Total** | | **102/240 (43%)** |

---

## Phase 3f Scope

**Goal**: Replace `array.length === 0`, `array.length > 0`, and `array.length !== 0` with Effect Array utilities.

| File | Violations | Lines |
|------|------------|-------|
| `ContextFormatter.ts` | 7 | 27, 31, 103, 109, 142, 152, 211 |
| `EntityClusterer.ts` | 5 | 114, 324, 392, 413, 485 |
| `NlpService.ts` | 5 | 44, 64, 92, 101, 157 |
| `GraphRAGService.ts` | 3 | 231, 351, 452 |
| `PromptTemplates.ts` | 3 | 70, 136, 137 |
| `EntityResolutionService.ts` | 2 | 284, 316 |
| `CanonicalSelector.ts` | 2 | 121, 223 |
| `GroundingService.ts` | 2 | 171, 253 |
| `EntityExtractor.ts` | 2 | 115, 146 |
| `GraphAssembler.ts` | 1 | 355 |
| `SameAsLinker.ts` | 1 | 352 |
| `ConfidenceFilter.ts` | 1 | 287 |
| `vector.ts` | 1 | 24 |
| **Total** | **35** | |

---

## Lessons Learned from Phase 3e (CRITICAL)

### 1. Test Files Need Updates Too

When changing function signatures or behavior, check test files that call those functions:
- `ContextFormatter.test.ts` needed MutableHashMap updates
- `RrfScorer.test.ts` needed MutableHashMap updates

**Always grep for function usage in `test/` directories!**

### 2. Function Signature Changes Cascade

When changing a parameter type (e.g., `ReadonlyMap` → `MutableHashMap`):
1. Find ALL callers with grep
2. Update callers BEFORE updating the function signature
3. Or update both in the same edit to avoid type errors

### 3. MutableHashMap forEach Callback Order

```typescript
// Callback is (value, key) NOT (key, value)!
MutableHashMap.forEach(map, (value, key) => { ... });
```

### 4. Option Handling Patterns

```typescript
// Use O.isSome/O.isNone for conditionals
if (O.isNone(opt)) continue;
const value = opt.value;

// Use O.getOrElse for defaults
const value = O.getOrElse(opt, () => defaultValue);

// Use O.getOrThrow after has() check
if (MutableHashMap.has(map, key)) {
  const value = O.getOrThrow(MutableHashMap.get(map, key));
}
```

### 5. fromIterable for Map Construction

```typescript
// From Object.entries
MutableHashMap.fromIterable(Object.entries(obj));

// From array of tuples
MutableHashMap.fromIterable([["key1", 1], ["key2", 2]]);
```

---

## Replacement Patterns

### Basic Emptiness Checks

```typescript
// BEFORE - Native JavaScript
if (array.length === 0) { ... }
if (array.length > 0) { ... }
if (array.length !== 0) { ... }

// AFTER - Effect Array utilities
import * as A from "effect/Array";

if (A.isEmptyReadonlyArray(array)) { ... }
if (A.isNonEmptyReadonlyArray(array)) { ... }  // or !A.isEmptyReadonlyArray
if (A.isNonEmptyReadonlyArray(array)) { ... }
```

### Pattern: Conditional Return

```typescript
// BEFORE
if (entities.length === 0) {
  return [];
}

// AFTER
if (A.isEmptyReadonlyArray(entities)) {
  return [];
}
```

### Pattern: Ternary with Emptiness

```typescript
// BEFORE
const typeStr = types.length > 0 ? A.join(types, ", ") : "Unknown";

// AFTER
const typeStr = A.isNonEmptyReadonlyArray(types) ? A.join(types, ", ") : "Unknown";
```

### Pattern: While Loop Condition

```typescript
// BEFORE
while (tokens > maxTokens && includedRelations.length > 0) {
  ...
}

// AFTER
while (tokens > maxTokens && A.isNonEmptyReadonlyArray(includedRelations)) {
  ...
}
```

### Pattern: For Loop Condition

```typescript
// BEFORE
for (let hop = 1; hop <= maxHops && frontier.length > 0; hop++) {
  ...
}

// AFTER
for (let hop = 1; hop <= maxHops && A.isNonEmptyReadonlyArray(frontier); hop++) {
  ...
}
```

### Pattern: Combined Conditions

```typescript
// BEFORE
if (a.length !== b.length || a.length === 0) {
  return 0;
}

// AFTER
if (a.length !== b.length || A.isEmptyReadonlyArray(a)) {
  return 0;
}
```

### Pattern: Conditional Assignment

```typescript
// BEFORE
additionalTypes: validAdditional.length > 0 ? validAdditional : undefined,

// AFTER
additionalTypes: A.isNonEmptyReadonlyArray(validAdditional) ? validAdditional : undefined,
```

### Pattern: Average Calculation Guard

```typescript
// BEFORE
const average = values.length > 0 ? sum / values.length : 0;

// AFTER
const average = A.isNonEmptyReadonlyArray(values) ? sum / values.length : 0;
```

---

## Required Imports

Add to each file (if not present):

```typescript
import * as A from "effect/Array";
```

Most files already have this import - verify before adding.

---

## File-Specific Notes

### ContextFormatter.ts (7 fixes)
- Already has `import * as A from "effect/Array"`
- All simple conditional checks
- Lines 27, 31: Entity formatting
- Lines 103, 109, 142, 152: Section guards
- Line 211: While loop condition

### EntityClusterer.ts (5 fixes)
- Verify A import exists
- Lines 114, 392: Early returns
- Lines 324, 485: Continue conditions
- Line 413: Conditional embedding check

### NlpService.ts (5 fixes)
- Lines 44, 101: Return conditions
- Lines 64, 92: Early returns in chunking
- Line 157: String emptiness (special case - see note below)

**Note**: Line 157 checks `text.length === 0` for a string. Use `Str.isEmpty(text)` instead:
```typescript
import * as Str from "effect/String";
if (Str.isEmpty(text)) { ... }
```

### GraphRAGService.ts (3 fixes)
- Already has A import
- Lines 231, 351: Early returns
- Line 452: For loop condition

### PromptTemplates.ts (3 fixes)
- Lines 70, 136, 137: Ternary conditions
- Simple replacements

### EntityResolutionService.ts (2 fixes)
- Line 284: Continue condition
- Line 316: Ternary guard

### CanonicalSelector.ts (2 fixes)
- Lines 121, 223: Validation checks

### GroundingService.ts (2 fixes)
- Line 171: Early return
- Line 253: Average calculation guard

### EntityExtractor.ts (2 fixes)
- Line 115: Conditional assignment
- Line 146: Early return

### GraphAssembler.ts (1 fix)
- Line 355: Early return in merge()

### SameAsLinker.ts (1 fix)
- Line 352: Validation result

### ConfidenceFilter.ts (1 fix)
- Line 287: Early return

### vector.ts (1 fix)
- Line 24: Combined condition

---

## Verification Commands

```bash
# Type check
bun run check --filter @beep/knowledge-server

# Tests (55 should pass)
bun run test --filter @beep/knowledge-server

# Verify no .length === 0 patterns in target files
grep -rn "\.length === 0\|\.length > 0\|\.length !== 0" \
  packages/knowledge/server/src/GraphRAG/ContextFormatter.ts \
  packages/knowledge/server/src/EntityResolution/EntityClusterer.ts \
  packages/knowledge/server/src/Nlp/NlpService.ts \
  packages/knowledge/server/src/GraphRAG/GraphRAGService.ts \
  packages/knowledge/server/src/Ai/PromptTemplates.ts \
  packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts \
  packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts \
  packages/knowledge/server/src/Grounding/GroundingService.ts \
  packages/knowledge/server/src/Extraction/EntityExtractor.ts \
  packages/knowledge/server/src/Extraction/GraphAssembler.ts \
  packages/knowledge/server/src/EntityResolution/SameAsLinker.ts \
  packages/knowledge/server/src/Grounding/ConfidenceFilter.ts \
  packages/knowledge/server/src/utils/vector.ts
# Should return empty (exit code 1)
```

---

## Success Criteria

| Check | Expected |
|-------|----------|
| `bun run check --filter @beep/knowledge-server` | Exit 0 |
| `bun run test --filter @beep/knowledge-server` | 55 pass |
| `grep ".length === 0" (13 target files)` | 0 matches |
| `grep ".length > 0" (13 target files)` | 0 matches |

---

## Common Pitfalls

1. **String vs Array**: Use `Str.isEmpty()` for strings, `A.isEmptyReadonlyArray()` for arrays
2. **Import conflicts**: Verify A alias isn't already used for something else
3. **Mutable arrays**: `A.isEmptyReadonlyArray` works on both mutable and readonly arrays
4. **Nested conditions**: Some files have complex conditions - test thoroughly

---

## After Completion

1. Update `MASTER_VIOLATIONS.md`:
   - Mark Phase 3f as ✅ COMPLETE
   - Update progress to ~137/240 (57%)
   - Update dependency diagram

2. Proceed to Phase 3g (Native Array Methods Part 1 - ~40 fixes)

---

## Reference

- Master violations: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
- Phase 3e handoff: `specs/knowledge-code-quality-audit/handoffs/HANDOFF_P3e.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
