---
title: TokenSimilarity.ts
nav_order: 44
parent: "@beep/repo-utils"
---

## TokenSimilarity.ts overview

Deterministic token-sequence similarity primitives (k-shingling, MinHash,
LSH banding, exact Jaccard) for near-miss (Type-3) clone detection over the
normalized declaration token sequences produced by
`normalizedDeclarationSignature`.

The pipeline is: shingle a token sequence into a k-gram set, summarize each set
as a fixed-length MinHash signature, bucket signatures into LSH bands to cheaply
generate candidate pairs, then confirm each candidate with an *exact* Jaccard
score. LSH only prunes the candidate space; the final decision is always exact,
so results are reproducible across runs (no randomness, fixed FNV-1a seeds).

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [fnv1a32](#fnv1a32)
  - [jaccardSimilarity](#jaccardsimilarity)
  - [lshBandKeys](#lshbandkeys)
  - [minhashSignature](#minhashsignature)
  - [tokenShingles](#tokenshingles)
---

# utilities

## fnv1a32

32-bit FNV-1a hash of a string (unsigned). The narrow-width sibling of the
64-bit digest used for candidate ids; 32 bits keep MinHash permutations in fast
integer arithmetic, and final clustering is confirmed with exact Jaccard so the
occasional 32-bit collision cannot create a false near-miss.

**Example**

```ts
import { fnv1a32 } from "@beep/repo-utils"
const digest = fnv1a32("I0,K1,L")
```

**Signature**

```ts
declare const fnv1a32: (input: string) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/TokenSimilarity.ts#L39)

Since v0.0.0

## jaccardSimilarity

Exact Jaccard similarity between two shingle sets: `|A ∩ B| / |A ∪ B|`. Two
empty sets score `0` (no evidence of similarity).

**Example**

```ts
import { jaccardSimilarity } from "@beep/repo-utils"
const score = jaccardSimilarity({ self: new Set(["a", "b", "c"]), that: new Set(["a", "b", "d"]) })
```

**Signature**

```ts
declare const jaccardSimilarity: (input: { readonly self: ReadonlySet<string>; readonly that: ReadonlySet<string>; }) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/TokenSimilarity.ts#L193)

Since v0.0.0

## lshBandKeys

Project a MinHash signature into `bands` LSH band keys. The signature is split
into `bands` contiguous bands of equal width; two declarations are candidate
near-misses when they share at least one band key. Fewer bands (wider rows)
means a higher similarity threshold for becoming a candidate.

**Example**

```ts
import { lshBandKeys, minhashSignature, tokenShingles } from "@beep/repo-utils"
const shingles = tokenShingles({ tokens: ["I0", "K1", "L", "I1", "K2"], k: 3 })
const keys = lshBandKeys({ signature: minhashSignature({ shingles, permutations: 128 }), bands: 16 })
```

**Signature**

```ts
declare const lshBandKeys: (input: { readonly signature: ReadonlyArray<number>; readonly bands: number; }) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/TokenSimilarity.ts#L160)

Since v0.0.0

## minhashSignature

Compute an `permutations`-length MinHash signature of a shingle set. Each slot
is the minimum, over all shingles, of a distinct deterministic permutation of
the shingle's 32-bit hash. The fraction of equal slots between two signatures
is an unbiased estimate of their Jaccard similarity.

**Example**

```ts
import { minhashSignature, tokenShingles } from "@beep/repo-utils"
const shingles = tokenShingles({ tokens: ["I0", "K1", "L", "I1", "K2", "I0"], k: 3 })
const signature = minhashSignature({ shingles, permutations: 128 })
```

**Signature**

```ts
declare const minhashSignature: (input: { readonly shingles: ReadonlySet<string>; readonly permutations: number; }) => ReadonlyArray<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/TokenSimilarity.ts#L122)

Since v0.0.0

## tokenShingles

Split a normalized token sequence into the set of contiguous k-grams
("shingles"). Sequences shorter than `k` collapse to a single shingle of the
whole sequence. Duplicate k-grams collapse (set semantics), which is what
Jaccard / MinHash operate over.

**Example**

```ts
import { tokenShingles } from "@beep/repo-utils"
const set = tokenShingles({ tokens: ["I0", "K1", "L", "I1", "K2"], k: 3 })
```

**Signature**

```ts
declare const tokenShingles: (input: { readonly tokens: ReadonlyArray<string>; readonly k: number; }) => ReadonlySet<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Reuse/TokenSimilarity.ts#L64)

Since v0.0.0