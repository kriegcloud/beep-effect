---
title: Predicate.ts
nav_order: 16
parent: "@beep/utils"
---

## Predicate.ts overview

Predicate helpers and re-exports for structural runtime checks.

Since v0.0.0

---
## Exports Grouped by Category
- [refinements](#refinements)
  - [chainRefinements](#chainrefinements)
- [utilities](#utilities)
  - ["effect/Predicate" (namespace export)](#effectpredicate-namespace-export)
  - [hasInspectableObjectShape](#hasinspectableobjectshape)
  - [hasProperties](#hasproperties)
---

# refinements

## chainRefinements

Chains refinements so each step receives the type narrowed by the previous
step.

**Example**

```ts
import { P } from "@beep/utils";

const hasMessage = P.chainRefinements([
  P.isNotNullish,
  P.isObject,
  P.hasProperty("message"),
  P.Struct({ message: P.isString })
]);

const candidate: unknown = { message: "hello" };

if (hasMessage(candidate)) {
  const message: string = candidate.message;
  console.log(message);
}
```

**Signature**

```ts
declare const chainRefinements: { <Start, A extends Start>(refinements: readonly [P.Refinement<Start, A>]): P.Refinement<Start, A>; <Start, A extends Start, B extends A>(refinements: readonly [P.Refinement<Start, A>, P.Refinement<A, B>]): P.Refinement<Start, B>; <Start, A extends Start, B extends A, C extends B>(refinements: readonly [P.Refinement<Start, A>, P.Refinement<A, B>, P.Refinement<B, C>]): P.Refinement<Start, C>; <Start, A extends Start, B extends A, C extends B, D extends C>(refinements: readonly [P.Refinement<Start, A>, P.Refinement<A, B>, P.Refinement<B, C>, P.Refinement<C, D>]): P.Refinement<Start, D>; <Start, A extends Start, B extends A, C extends B, D extends C, E extends D>(refinements: readonly [P.Refinement<Start, A>, P.Refinement<A, B>, P.Refinement<B, C>, P.Refinement<C, D>, P.Refinement<D, E>]): P.Refinement<Start, E>; <Start, A extends Start, B extends A, C extends B, D extends C, E extends D, F extends E>(refinements: readonly [P.Refinement<Start, A>, P.Refinement<A, B>, P.Refinement<B, C>, P.Refinement<C, D>, P.Refinement<D, E>, P.Refinement<E, F>]): P.Refinement<Start, F>; <Start, A extends Start, B extends A, C extends B, D extends C, E extends D, F extends E, G extends F>(refinements: readonly [P.Refinement<Start, A>, P.Refinement<A, B>, P.Refinement<B, C>, P.Refinement<C, D>, P.Refinement<D, E>, P.Refinement<E, F>, P.Refinement<F, G>]): P.Refinement<Start, G>; <Start, A extends Start, B extends A, C extends B, D extends C, E extends D, F extends E, G extends F, H extends G>(refinements: readonly [P.Refinement<Start, A>, P.Refinement<A, B>, P.Refinement<B, C>, P.Refinement<C, D>, P.Refinement<D, E>, P.Refinement<E, F>, P.Refinement<F, G>, P.Refinement<G, H>]): P.Refinement<Start, H>; <Start, A extends Start, B extends A, C extends B, D extends C, E extends D, F extends E, G extends F, H extends G, I extends H>(refinements: readonly [P.Refinement<Start, A>, P.Refinement<A, B>, P.Refinement<B, C>, P.Refinement<C, D>, P.Refinement<D, E>, P.Refinement<E, F>, P.Refinement<F, G>, P.Refinement<G, H>, P.Refinement<H, I>]): P.Refinement<Start, I>; <Start, A extends Start, B extends A, C extends B, D extends C, E extends D, F extends E, G extends F, H extends G, I extends H, J extends I>(refinements: readonly [P.Refinement<Start, A>, P.Refinement<A, B>, P.Refinement<B, C>, P.Refinement<C, D>, P.Refinement<D, E>, P.Refinement<E, F>, P.Refinement<F, G>, P.Refinement<G, H>, P.Refinement<H, I>, P.Refinement<I, J>]): P.Refinement<Start, J>; <Start>(): ChainRefinementBuilder<Start>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Predicate.ts#L335)

Since v0.0.0

# utilities

## "effect/Predicate" (namespace export)

Re-exports all named exports from the "effect/Predicate" module.

**Example**

```ts
import * as P from "@beep/utils/Predicate"

const isObject = P.isObject({ ok: true })
console.log(isObject)
```

**Signature**

```ts
export * from "effect/Predicate"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Predicate.ts#L137)

Since v0.0.0

## hasInspectableObjectShape

Returns whether an unknown value can be inspected with reflection without
triggering a throwing Proxy trap.

**Example**

```ts
import { P } from "@beep/utils"

const value = new Proxy({}, { ownKeys: () => { throw new Error("blocked") } })
console.log(P.hasInspectableObjectShape(value))
```

**Signature**

```ts
declare const hasInspectableObjectShape: (value: unknown) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Predicate.ts#L154)

Since v0.0.0

## hasProperties

Returns a predicate that succeeds when an unknown value is an object with all
the requested own or inherited properties.

Supports both data-last and data-first invocation styles.

**Example**

```ts
import { hasProperties } from "@beep/utils/Predicate"

// Data-last style
const hasFooBar = hasProperties("foo", "bar")
const result1 = hasFooBar({ foo: 1, bar: 2 })
// true

// Data-first style
const required: readonly ["foo", "bar"] = ["foo", "bar"]
const result2 = hasProperties({ foo: 1, bar: 2 }, required)
// true

console.log(result1)
console.log(result2)
```

**Signature**

```ts
declare const hasProperties: { <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(...properties: Properties): (self: unknown) => self is { [K in Properties[number]]: unknown; }; <Properties extends A.NonEmptyReadonlyArray<PropertyKey>>(self: unknown, properties: Properties): self is { [K in Properties[number]]: unknown; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Predicate.ts#L365)

Since v0.0.0