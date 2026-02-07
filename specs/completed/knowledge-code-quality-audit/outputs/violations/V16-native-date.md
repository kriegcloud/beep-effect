# V16: Native Date Usage Violations

## Summary

| Metric | Count |
|--------|-------|
| **Total Violations** | 6 |
| **Source Files Affected** | 2 |
| **Test Files Affected** | 1 |
| **Severity** | Medium |

## Violation Definition

**Rule**: Use Effect DateTime instead of native JavaScript Date for time operations.

**Source of Truth**: `.claude/rules/effect-patterns.md`

**Rationale**: Effect DateTime provides:
- Testability via TestClock in Effect test context
- Consistent timezone handling
- Integration with Effect's effect system
- Proper ISO format handling

## Violations by File

### Source Files (6 violations)

#### 1. ExtractionPipeline.ts (2 violations)

**File**: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`

**Violation #1** - Line 165:
```typescript
// CURRENT (VIOLATION)
const startTime = Date.now();
```

**Correct Pattern**:
```typescript
import * as DateTime from "effect/DateTime";

// In Effect.gen context
const startTime = DateTime.unsafeNow();
// OR for testable code:
const startTime = yield* DateTime.now;
```

**Violation #2** - Line 250:
```typescript
// CURRENT (VIOLATION)
const durationMs = Date.now() - startTime;
```

**Correct Pattern**:
```typescript
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";

// If using DateTime.now:
const endTime = yield* DateTime.now;
const durationMs = DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime);

// OR with Duration module for cleaner semantics:
const elapsed = DateTime.distanceDurationEither(startTime, endTime);
```

**Context**: These violations are in the pipeline timing logic. The `startTime` is captured at pipeline start and duration is calculated at end.

---

#### 2. OntologyCache.ts (4 violations)

**File**: `packages/knowledge/server/src/Ontology/OntologyCache.ts`

**Violation #3** - Line 75:
```typescript
// CURRENT (VIOLATION)
const now = Date.now();
if (now - entry.value.loadedAt > ttlMs) {
```

**Violation #4** - Line 102:
```typescript
// CURRENT (VIOLATION)
const now = Date.now();
```

**Violation #5** - Line 126:
```typescript
// CURRENT (VIOLATION)
loadedAt: Date.now(),
```

**Violation #6** - Line 151:
```typescript
// CURRENT (VIOLATION)
const now = Date.now();
```

**Correct Pattern for OntologyCache**:
```typescript
import * as DateTime from "effect/DateTime";

// In Effect.gen context:
const now = DateTime.toEpochMillis(DateTime.unsafeNow());

// Or for testable code:
const now = yield* DateTime.now.pipe(Effect.map(DateTime.toEpochMillis));

// For storing loadedAt:
loadedAt: DateTime.toEpochMillis(DateTime.unsafeNow()),
```

**Context**: The OntologyCache uses timestamps for TTL-based cache invalidation. The `CachedOntology` interface stores `loadedAt: number` which represents epoch milliseconds.

---

### Test Files (4 occurrences - lower priority)

**File**: `packages/knowledge/server/test/GraphRAG/ContextFormatter.test.ts`

**Lines 30-31 and 51-52**:
```typescript
// Test fixture creation
const createMockEntity = (...) => ({
  // ...
  createdAt: new Date(),
  updatedAt: new Date(),
}) as any;

const createMockRelation = (...) => ({
  // ...
  createdAt: new Date(),
  updatedAt: new Date(),
}) as any;
```

**Assessment**: These are test fixtures with `as any` type assertions. While not strictly following Effect patterns, they are acceptable in test code because:
1. The fixtures are cast to `any` and don't require type correctness
2. Test fixtures often need simplified construction
3. The actual code under test doesn't use these date values

**Recommended Fix** (optional):
```typescript
import * as DateTime from "effect/DateTime";

const createMockEntity = (...) => ({
  // ...
  createdAt: DateTime.unsafeNow(),
  updatedAt: DateTime.unsafeNow(),
}) as any;
```

## Remediation Priority

| Priority | Files | Reason |
|----------|-------|--------|
| **High** | ExtractionPipeline.ts | Pipeline timing should be testable |
| **High** | OntologyCache.ts | Cache TTL logic should be testable |
| **Low** | ContextFormatter.test.ts | Test fixtures, already type-cast |

## Recommended Fix Strategy

1. **ExtractionPipeline.ts**: Use `DateTime.now` in the Effect context for testability with `TestClock`
2. **OntologyCache.ts**: Either use `DateTime.unsafeNow()` for immediate conversion, or inject a Clock service for full testability
3. **Test files**: Optional fix, can use `DateTime.unsafeNow()` for consistency

## Impact Analysis

| Aspect | Current State | After Fix |
|--------|---------------|-----------|
| Testability | Cannot mock time | Full TestClock support |
| Consistency | Mixed patterns | Unified DateTime usage |
| Type Safety | Number (milliseconds) | DateTime.Utc type |

## Related Patterns

- `.claude/rules/effect-patterns.md` - Native Method Ban section
- Effect DateTime documentation for timezone handling
- TestClock usage for time-dependent test assertions
