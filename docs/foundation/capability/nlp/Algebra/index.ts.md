---
title: index.ts
nav_order: 1
parent: "@beep/nlp"
---

## index.ts overview

Monoid type class plus concrete instances and law checkers.

**Example**

```ts
```typescript
import { Monoid } from "@beep/nlp/Algebra"

console.log(Monoid.fold(Monoid.NumberSum)([1, 2, 3])) // 6
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [NLPMonoid (namespace export)](#nlpmonoid-namespace-export)
---

# combinators

## Monoid (namespace export)

Re-exports all named exports from the "./Monoid.ts" module as `Monoid`.

**Example**

```ts
```typescript
import { Monoid } from "@beep/nlp/Algebra"

console.log(Monoid.fold(Monoid.NumberSum)([1, 2, 3])) // 6
```
```

**Signature**

```ts
export * as Monoid from "./Monoid.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/index.ts#L21)

Since v0.0.0

## NLPMonoid (namespace export)

Re-exports all named exports from the "./NLPMonoid.ts" module as `NLPMonoid`.

**Example**

```ts
```typescript
import { NLPMonoid } from "@beep/nlp/Algebra"

console.log(NLPMonoid.TokenConcat.combine("hello", "world")) // "hello world"
```
```

**Signature**

```ts
export * as NLPMonoid from "./NLPMonoid.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/index.ts#L35)

Since v0.0.0