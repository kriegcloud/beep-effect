# V13: Native Array.sort Audit Report

## Summary

| Metric | Value |
|--------|-------|
| Files Scanned | `packages/knowledge/**/src/**/*.ts` |
| Total Occurrences | 9 |
| Violations | 3 |
| Compliant | 6 |

## Rule Reference

**Source**: `.claude/rules/effect-patterns.md`

**Rule**: NEVER use native JavaScript array/string methods. Route ALL operations through Effect utilities.

**Violation Pattern**:
```typescript
// VIOLATIONS
results.sort((a, b) => b.similarity - a.similarity)
array.sort()
items.sort(compareFn)
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";

// Sort by numeric field descending
A.sort(results, Order.reverse(Order.mapInput(Order.number, (r) => r.similarity)))

// Or with negation (equivalent)
A.sort(results, Order.mapInput(Order.number, (r) => -r.similarity))
```

---

## Violations Found

### Violation 1: MentionExtractor.ts:225

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/MentionExtractor.ts`

**Line**: 225

**Current Code**:
```typescript
// Sort by start position, then by confidence (descending)
const sorted = [...allMentions].sort((a, b) => {
  if (a.startChar !== b.startChar) {
    return a.startChar - b.startChar;
  }
  return b.confidence - a.confidence;
});
```

**Issues**:
1. Uses native `.sort()` method with spread copy
2. Multi-criteria sorting implemented as inline comparator function
3. Mutates a copied array instead of using pure transformation

**Correct Pattern**:
```typescript
import * as Order from "effect/Order";

// Multi-criteria sort: by startChar ascending, then confidence descending
const mentionOrder = Order.combine(
  Order.mapInput(Order.number, (m: ExtractedMention) => m.startChar),
  Order.mapInput(Order.number, (m: ExtractedMention) => -m.confidence)
);
const sorted = A.sort(allMentions, mentionOrder);
```

---

### Violation 2: EntityClusterer.ts:308

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`

**Line**: 308

**Current Code**:
```typescript
// Sort similarities by descending similarity
const sortedSimilarities = [...similarities].sort((a, b) => b.similarity - a.similarity);
```

**Issues**:
1. Uses native `.sort()` method with spread copy
2. Descending sort implemented via subtraction comparator
3. Mutates a copied array instead of using pure transformation

**Correct Pattern**:
```typescript
import * as Order from "effect/Order";

// Sort similarities descending
const sortedSimilarities = A.sort(
  similarities,
  Order.mapInput(Num.Order, (s) => -s.similarity)
);
```

---

### Violation 3: EntityClusterer.ts:528

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`

**Line**: 528

**Current Code**:
```typescript
// Sort by similarity descending
return results.sort((a, b) => b.similarity - a.similarity);
```

**Issues**:
1. Uses native `.sort()` method (in-place mutation)
2. Descending sort implemented via subtraction comparator
3. Mutates the results array directly

**Correct Pattern**:
```typescript
import * as Order from "effect/Order";

// Sort by similarity descending
return A.sort(
  results,
  Order.mapInput(Num.Order, (r) => -r.similarity)
);
```

---

## Compliant Code (Reference)

The following files correctly use Effect Array sorting patterns:

### RrfScorer.ts:116-119
```typescript
return A.sort(
  items,
  Order.mapInput(Num.Order, (item: RankedItem<T>) => -item.score)
);
```

### RrfScorer.ts:145
```typescript
const hopLevels = A.sort(Array.from(hopGroups.keys()), Num.Order);
```

### GraphRAGService.ts:294-297
```typescript
const sortedEntities = A.sort(
  entities,
  Order.mapInput(Num.Order, (e: Entities.Entity.Model) => -(scores[e.id] ?? 0))
);
```

### GraphRAGService.ts:381-384
```typescript
const sortedEntities = A.sort(
  entities,
  Order.mapInput(Num.Order, (e: Entities.Entity.Model) => -(scores[e.id] ?? 0))
);
```

### ConfidenceFilter.ts:290
```typescript
const sorted = A.sort(values, Order.number);
```

### OpenAiProvider.ts:262-263
```typescript
const indexOrder = Order.mapInput(Order.number, (item: (typeof response.data)[number]) => item.index);
const sortedData = A.sort(response.data, indexOrder);
```

---

## Remediation Priority

| Priority | File | Line | Complexity |
|----------|------|------|------------|
| Medium | MentionExtractor.ts | 225 | Higher (multi-criteria sort) |
| Low | EntityClusterer.ts | 308 | Simple (single field descending) |
| Low | EntityClusterer.ts | 528 | Simple (single field descending) |

**Note**: MentionExtractor has slightly higher complexity due to multi-criteria sorting (startChar ascending, then confidence descending), requiring `Order.combine`.

---

## Required Imports

For all fixes, ensure these imports are present:

```typescript
import * as A from "effect/Array";
import * as Num from "effect/Number";
import * as Order from "effect/Order";
```
