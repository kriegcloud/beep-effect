# V02: Duplicate Code Audit Report

**Rule**: Shared utility functions should be extracted to a common location, not duplicated across files.

**Audit Date**: 2026-01-22

**Scope**: `packages/knowledge/server/src/**/*.ts`

---

## Summary

| Metric | Count |
|--------|-------|
| Duplicate Function Groups | 3 |
| Total Duplicate Definitions | 9 |
| Files Affected | 5 |

---

## Violations

### 1. `extractLocalName` - 5 Occurrences

**Purpose**: Extracts the local name portion from an IRI (e.g., `"Person"` from `"http://schema.org/Person"`).

**Canonical Location** (already exported):
- `packages/knowledge/server/src/Ontology/constants.ts:86` - **EXPORTED**
- `packages/knowledge/server/src/GraphRAG/ContextFormatter.ts:22` - **EXPORTED**

**Duplicate Definitions** (private, should import from canonical):

| File | Line | Export Status |
|------|------|---------------|
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | 58 | `const` (private) |
| `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts` | 108 | `const` (private) |
| `packages/knowledge/server/src/Grounding/GroundingService.ts` | 83 | `const` (private) |

**Function Signature** (identical across all occurrences):
```typescript
const extractLocalName = (iri: string): string => {
  const hashIndex = iri.lastIndexOf("#");
  if (hashIndex !== -1) {
    return iri.slice(hashIndex + 1);
  }
  const slashIndex = iri.lastIndexOf("/");
  if (slashIndex !== -1) {
    return iri.slice(slashIndex + 1);
  }
  return iri;
};
```

**Recommendation**: The function is already exported from `packages/knowledge/server/src/Ontology/constants.ts`. Remove duplicates and import from there.

---

### 2. `cosineSimilarity` - 2 Occurrences

**Purpose**: Computes cosine similarity between two vectors (used for embedding comparison).

**Duplicate Definitions**:

| File | Line | Type Signature |
|------|------|----------------|
| `packages/knowledge/server/src/Grounding/GroundingService.ts` | 118 | `(a: ReadonlyArray<number>, b: ReadonlyArray<number>): number` |
| `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts` | 158 | `(a: readonly number[], b: readonly number[]): number` |

**Implementation Comparison**:

**GroundingService.ts (lines 118-140)**:
```typescript
const cosineSimilarity = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const aVal = a[i]!;
    const bVal = b[i]!;
    dotProduct += aVal * bVal;
    normA += aVal * aVal;
    normB += bVal * bVal;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
};
```

**EntityClusterer.ts (lines 158-175)**:
```typescript
const cosineSimilarity = (a: readonly number[], b: readonly number[]): number => {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
};
```

**Differences**:
1. Type annotation: `ReadonlyArray<number>` vs `readonly number[]` (equivalent)
2. Empty array check: GroundingService checks `a.length === 0`, EntityClusterer does not
3. Null handling: EntityClusterer uses `?? 0`, GroundingService uses `!` assertion
4. Variable naming: `aVal/bVal` vs `valA/valB`

**Recommendation**: Extract to `packages/knowledge/server/src/utils/vector.ts` with the safer implementation (including empty array check and nullish coalescing).

---

### 3. `formatEntityText` / `formatEntityForEmbedding` - 2 Occurrences

**Purpose**: Formats an entity for text embedding by creating a natural language description.

**Duplicate Definitions**:

| File | Line | Function Name |
|------|------|---------------|
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | 49 | `formatEntityForEmbedding` |
| `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts` | 99 | `formatEntityText` |

**Implementation** (identical logic, different names):
```typescript
const formatEntityText = (entity: AssembledEntity): string => {
  const name = entity.canonicalName ?? entity.mention;
  const typeLabel = extractLocalName(entity.primaryType);
  return `${name} is a ${typeLabel}`;
};
```

**Recommendation**: Extract to `packages/knowledge/server/src/utils/formatting.ts` with a single name (suggest `formatEntityForEmbedding` as more descriptive).

---

## Recommended Extraction Structure

Create utility modules in `packages/knowledge/server/src/utils/`:

```
packages/knowledge/server/src/utils/
├── index.ts              # Re-exports all utilities
├── iri.ts                # IRI manipulation (extractLocalName already in Ontology/constants.ts)
├── vector.ts             # Vector math (cosineSimilarity)
└── formatting.ts         # Text formatting (formatEntityForEmbedding)
```

### Alternative: Use Existing Location

Since `extractLocalName` is already exported from `packages/knowledge/server/src/Ontology/constants.ts`, consider:

1. **Option A**: Add `cosineSimilarity` and `formatEntityForEmbedding` to existing modules:
   - `cosineSimilarity` → `packages/knowledge/server/src/Embedding/utils.ts` (new file)
   - `formatEntityForEmbedding` → `packages/knowledge/server/src/Embedding/utils.ts` (new file)

2. **Option B**: Create centralized `utils/` directory as proposed above

**Recommended**: Option B for better organization as the codebase grows.

---

## Remediation Steps

1. **Create** `packages/knowledge/server/src/utils/vector.ts`:
   ```typescript
   /**
    * Compute cosine similarity between two vectors
    * @param a - First vector
    * @param b - Second vector
    * @returns Similarity score between 0 and 1
    */
   export const cosineSimilarity = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => {
     if (a.length !== b.length || a.length === 0) {
       return 0;
     }
     // ... implementation
   };
   ```

2. **Create** `packages/knowledge/server/src/utils/formatting.ts`:
   ```typescript
   import { extractLocalName } from "../Ontology/constants";
   import type { AssembledEntity } from "@beep/knowledge-domain";

   export const formatEntityForEmbedding = (entity: AssembledEntity): string => {
     const name = entity.canonicalName ?? entity.mention;
     const typeLabel = extractLocalName(entity.primaryType);
     return `${name} is a ${typeLabel}`;
   };
   ```

3. **Update imports** in affected files:
   - `EmbeddingService.ts` - import `extractLocalName` from `../Ontology/constants`
   - `EntityClusterer.ts` - import both utilities
   - `GroundingService.ts` - import both utilities

4. **Remove** duplicate function definitions from each file

---

## Impact Assessment

| Severity | Impact |
|----------|--------|
| **Code Maintainability** | Medium - Duplicate code increases maintenance burden |
| **Bug Risk** | Low-Medium - Subtle differences in `cosineSimilarity` could cause inconsistent behavior |
| **Performance** | None - No runtime impact |

**Priority**: Medium - Should be addressed to prevent divergent implementations and simplify future updates.
