# V03: Native String Methods

> Effect Pattern Enforcement Report

**Generated**: 2026-01-22
**Scope**: `packages/knowledge/**/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | 21 |
| **Files Affected** | 7 |
| **Severity** | Medium |
| **Priority Score** | 2 |

---

## Rule Reference

**Pattern Violated**:
> NEVER use native JavaScript string methods. Route ALL operations through Effect utilities.

**Violation Patterns Found**:
```typescript
// VIOLATIONS
str.lastIndexOf("#")           // Native lastIndexOf
name.slice(hashIndex + 1)      // Native slice on string
text.slice(0, 1000)            // Native slice on string
```

**Correct Pattern**:
```typescript
import * as Str from "effect/String";
import * as O from "effect/Option";

// CORRECT - Note: Str.lastIndexOf returns Option<number>
const hashIndex = Str.lastIndexOf("#")(iri);
O.match(hashIndex, {
  onNone: () => /* fallback logic */,
  onSome: (idx) => Str.slice(idx + 1)(iri)
});

// CORRECT - slice with positions
Str.slice(0, 1000)(text)
```

---

## Violations

### EmbeddingService.ts

**Path**: `packages/knowledge/server/src/Embedding/EmbeddingService.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 59 | Native lastIndexOf | `iri.lastIndexOf("#")` | `Str.lastIndexOf("#")(iri)` |
| 61 | Native slice | `iri.slice(hashIndex + 1)` | `Str.slice(hashIndex + 1)(iri)` |
| 63 | Native lastIndexOf | `iri.lastIndexOf("/")` | `Str.lastIndexOf("/")(iri)` |
| 65 | Native slice | `iri.slice(slashIndex + 1)` | `Str.slice(slashIndex + 1)(iri)` |
| 157 | Native slice | `text.slice(0, 1000)` | `Str.slice(0, 1000)(text)` |
| 259 | Native slice | `text.slice(0, 1000)` | `Str.slice(0, 1000)(text)` |

<details>
<summary>Full Context (Lines 58-68)</summary>

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

</details>

---

### ContextFormatter.ts

**Path**: `packages/knowledge/server/src/GraphRAG/ContextFormatter.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 23 | Native lastIndexOf | `iri.lastIndexOf("#")` | `Str.lastIndexOf("#")(iri)` |
| 25 | Native slice | `iri.slice(hashIndex + 1)` | `Str.slice(hashIndex + 1)(iri)` |
| 27 | Native lastIndexOf | `iri.lastIndexOf("/")` | `Str.lastIndexOf("/")(iri)` |
| 29 | Native slice | `iri.slice(slashIndex + 1)` | `Str.slice(slashIndex + 1)(iri)` |

<details>
<summary>Full Context (Lines 22-32)</summary>

```typescript
export const extractLocalName = (iri: string): string => {
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

</details>

---

### GroundingService.ts

**Path**: `packages/knowledge/server/src/Grounding/GroundingService.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 84 | Native lastIndexOf | `iri.lastIndexOf("#")` | `Str.lastIndexOf("#")(iri)` |
| 86 | Native slice | `iri.slice(hashIndex + 1)` | `Str.slice(hashIndex + 1)(iri)` |
| 88 | Native lastIndexOf | `iri.lastIndexOf("/")` | `Str.lastIndexOf("/")(iri)` |
| 90 | Native slice | `iri.slice(slashIndex + 1)` | `Str.slice(slashIndex + 1)(iri)` |

**Note**: This file already imports `Str` from "effect/String" at line 14.

<details>
<summary>Full Context (Lines 83-93)</summary>

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

</details>

---

### constants.ts

**Path**: `packages/knowledge/server/src/Ontology/constants.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 87 | Native lastIndexOf | `iri.lastIndexOf("#")` | `Str.lastIndexOf("#")(iri)` |
| 89 | Native slice | `iri.slice(hashIndex + 1)` | `Str.slice(hashIndex + 1)(iri)` |
| 91 | Native lastIndexOf | `iri.lastIndexOf("/")` | `Str.lastIndexOf("/")(iri)` |
| 93 | Native slice | `iri.slice(slashIndex + 1)` | `Str.slice(slashIndex + 1)(iri)` |

<details>
<summary>Full Context (Lines 86-96)</summary>

```typescript
export const extractLocalName = (iri: string): string => {
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

</details>

---

### EntityClusterer.ts

**Path**: `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 109 | Native lastIndexOf | `iri.lastIndexOf("#")` | `Str.lastIndexOf("#")(iri)` |
| 111 | Native slice | `iri.slice(hashIndex + 1)` | `Str.slice(hashIndex + 1)(iri)` |
| 113 | Native lastIndexOf | `iri.lastIndexOf("/")` | `Str.lastIndexOf("/")(iri)` |
| 115 | Native slice | `iri.slice(slashIndex + 1)` | `Str.slice(slashIndex + 1)(iri)` |

<details>
<summary>Full Context (Lines 108-118)</summary>

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

</details>

---

### NlpService.ts

**Path**: `packages/knowledge/server/src/Nlp/NlpService.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 34 | Native slice | `text.slice(lastEnd, match.index)` | `Str.slice(lastEnd, match.index)(text)` |
| 41 | Native slice | `text.slice(lastEnd)` | `Str.slice(lastEnd)(text)` |
| 133 | Native slice | `text.slice(offset, endOffset)` | `Str.slice(offset, endOffset)(text)` |

<details>
<summary>Full Context - splitIntoSentences (Lines 26-45)</summary>

```typescript
const splitIntoSentences = (text: string): readonly string[] => {
  // Simple sentence splitting - preserves original text exactly
  const parts = A.empty<string>();
  let lastEnd = 0;
  const matches = text.matchAll(SENTENCE_END_PATTERN);

  for (const match of matches) {
    if (match.index !== undefined) {
      parts.push(text.slice(lastEnd, match.index));
      lastEnd = match.index;
    }
  }

  // Add remaining text
  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd));
  }

  return parts.length > 0 ? parts : [text];
};
```

</details>

<details>
<summary>Full Context - createRawChunks (Lines 126-149)</summary>

```typescript
const createRawChunks = (text: string, config: ChunkingConfig): readonly TextChunk[] => {
  const chunks = A.empty<TextChunk>();
  let offset = 0;
  let index = 0;

  while (offset < text.length) {
    const endOffset = Math.min(offset + config.maxChunkSize, text.length);
    const chunkText = text.slice(offset, endOffset);

    chunks.push(
      new TextChunk({
        index,
        text: chunkText,
        startOffset: offset,
        endOffset,
      })
    );

    index++;
    offset = endOffset;
  }

  return chunks;
};
```

</details>

---

### NlpService.test.ts

**Path**: `packages/knowledge/server/test/Nlp/NlpService.test.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 67 | Native slice | `chunk.text.trim().slice(-1)` | `Str.slice(-1)(Str.trim(chunk.text))` |

<details>
<summary>Full Context (Lines 64-69)</summary>

```typescript
// Each chunk should contain complete sentences
for (const chunk of chunks) {
  // Should not end mid-word (rough check)
  const lastChar = chunk.text.trim().slice(-1);
  assertTrue(lastChar === "." || lastChar === "!" || lastChar === "?" || chunk.text.trim().length === 0);
}
```

</details>

---

## Cross-File Impact

| File | Violation Count | Modules Affected |
|------|-----------------|------------------|
| EmbeddingService.ts | 6 | Embedding |
| ContextFormatter.ts | 4 | GraphRAG |
| GroundingService.ts | 4 | Grounding |
| constants.ts | 4 | Ontology |
| EntityClusterer.ts | 4 | EntityResolution |
| NlpService.ts | 3 | Nlp |
| NlpService.test.ts | 1 | Nlp (test) |

**Impact Score**: 2 (Multiple files with similar pattern - DRY opportunity)

---

## Dependency Analysis

### Depends On (Fix These First)
- None

### Depended By (Fix These After)
- None

### Can Fix Independently
- [x] No dependencies

---

## Remediation Notes

### Special Considerations

1. **`extractLocalName` function is duplicated in 5 files**: This is a clear DRY violation. Consider extracting to a shared utility module (e.g., `packages/knowledge/server/src/_shared/iri-utils.ts` or `packages/knowledge/domain/src/utils/iri.ts`).

2. **`Str.lastIndexOf` returns `Option<number>`, not `-1`**: The Effect version returns `O.Option<number>` instead of `-1` for "not found". This requires structural changes to the `extractLocalName` function:
   ```typescript
   // Current pattern
   const hashIndex = iri.lastIndexOf("#");
   if (hashIndex !== -1) { ... }

   // Must become
   const hashIndex = Str.lastIndexOf("#")(iri);
   if (O.isSome(hashIndex)) { ... hashIndex.value ... }
   ```

3. **`Str.slice` uses pipe-compatible signature**: `Str.slice(start, end)(string)` - arguments are reversed from native.

4. **Test file violation**: The test file at line 67 also uses native `.slice(-1)`. Consider using `Str.takeRight(1)` as an alternative.

### Recommended Approach

1. **First**: Create a shared `extractLocalName` utility function using Effect idioms
2. **Second**: Update all 5 files to import and use the shared utility
3. **Third**: Fix remaining `.slice()` calls in NlpService.ts and EmbeddingService.ts
4. **Fourth**: Update test file

### Shared Utility Implementation

```typescript
// packages/knowledge/server/src/_shared/iri-utils.ts
import * as O from "effect/Option";
import * as Str from "effect/String";
import { pipe } from "effect/Function";

/**
 * Extract local name from IRI (e.g., "http://schema.org/Person" -> "Person")
 */
export const extractLocalName = (iri: string): string =>
  pipe(
    Str.lastIndexOf("#")(iri),
    O.orElse(() => Str.lastIndexOf("/")(iri)),
    O.map((idx) => Str.slice(idx + 1)(iri)),
    O.getOrElse(() => iri)
  );
```

### Imports to Add

```typescript
// Files currently lacking Str import:
// - EmbeddingService.ts
// - ContextFormatter.ts
// - constants.ts
// - EntityClusterer.ts
// - NlpService.ts
// - NlpService.test.ts

import * as Str from "effect/String";

// If using Option-based approach:
import * as O from "effect/Option";
```

### Alternative for `takeRight`

```typescript
// Instead of .slice(-1), use takeRight for last character:
import * as Str from "effect/String";

Str.takeRight(1)(chunk.text.trim())  // Cleaner for last N characters
```

---

## Verification Commands

```bash
# Verify no native lastIndexOf violations remain
grep -rn "\.lastIndexOf(" packages/knowledge/server/src/

# Verify no native slice violations on strings remain (be careful to exclude array.slice)
grep -rn "\.slice(" packages/knowledge/server/src/

# Type check
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-*
```

---

## Audit Metadata

| Field | Value |
|-------|-------|
| **Agent** | V03 Effect Pattern Enforcer |
| **Duration** | ~5 minutes |
| **Files Scanned** | 46 (packages/knowledge/**/*.ts) |
| **False Positives Excluded** | 0 |
| **Duplicated Code Pattern Found** | Yes - `extractLocalName` in 5 files |
