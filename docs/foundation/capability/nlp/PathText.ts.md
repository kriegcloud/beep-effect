---
title: PathText.ts
nav_order: 42
parent: "@beep/nlp"
---

## PathText.ts overview

Deterministic path and module-specifier normalization helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [normalization](#normalization)
  - [filePathVariants](#filepathvariants)
  - [moduleSpecifierVariants](#modulespecifiervariants)
  - [normalizePathPhrase](#normalizepathphrase)
- [predicates](#predicates)
  - [isPathLike](#ispathlike)
---

# normalization

## filePathVariants

Generate source-file lookup variants from a path fragment.

**Example**

```ts
```typescript
import * as PathText from "@beep/nlp/PathText"

const variants = PathText.filePathVariants("./src/utils/index.ts")
console.log(variants.includes("src/utils/index")) // true
console.log(variants.includes("index")) // true
```
```

**Signature**

```ts
declare const filePathVariants: (input: string) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/PathText.ts#L91)

Since v0.0.0

## moduleSpecifierVariants

Generate import-specifier lookup variants from a module fragment.

**Example**

```ts
```typescript
import * as PathText from "@beep/nlp/PathText"

const variants = PathText.moduleSpecifierVariants("@beep/utils/Str.ts")
console.log(variants.includes("@beep/utils/Str")) // true
console.log(variants.includes("Str")) // true
```
```

**Signature**

```ts
declare const moduleSpecifierVariants: (input: string) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/PathText.ts#L112)

Since v0.0.0

## normalizePathPhrase

Canonicalize a path-like phrase for file and module lookup.

**Example**

```ts
```typescript
import * as PathText from "@beep/nlp/PathText"

const normalized = PathText.normalizePathPhrase("src\\\\utils\\\\index.ts")
console.log(normalized) // "src/utils/index.ts"
```
```

**Signature**

```ts
declare const normalizePathPhrase: (input: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/PathText.ts#L47)

Since v0.0.0

# predicates

## isPathLike

Check whether normalized text is shaped like a single path or module token.

**Example**

```ts
```typescript
import * as PathText from "@beep/nlp/PathText"

console.log(PathText.isPathLike("src/index.ts")) // true
console.log(PathText.isPathLike("@beep/utils")) // true
console.log(PathText.isPathLike("hello world")) // false
```
```

**Signature**

```ts
declare const isPathLike: (input: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/PathText.ts#L69)

Since v0.0.0