---
name: effect-fast-check-v4
description: Property-based testing with fast-check in Effect v4. Use when writing property tests, generating arbitrary values from schemas, using it.prop or it.effect.prop, or verifying schema roundtrips. Triggers on fast-check, FastCheck, Arbitrary, toArbitrary, it.prop, it.effect.prop, property-based testing, Schema.toArbitrary, TestSchema.
---

# Effect Fast-Check (v4 / effect-smol)

Property-based testing in v4 spans three layers: `FastCheck` re-export, `Schema.toArbitrary`, and `@effect/vitest` integration.

## Imports

```ts
import { it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { FastCheck } from "effect/testing";
```

Deep import also works:

```ts
import * as FastCheck from "effect/testing/FastCheck";
```

This re-exports the entire `fast-check` (v4.5.3+) API surface.

## Schema.toArbitrary

Generate a fast-check `Arbitrary<T>` from many built in schemas and from custom declarations that provide `toArbitrary`:

```ts
const UserArb = Schema.toArbitrary(
  Schema.Struct({
    name: Schema.String,
    age: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 150 })),
    email: Schema.String,
  }),
);
// => FastCheck.Arbitrary<{ name: string; age: number; email: string }>

FastCheck.assert(
  FastCheck.property(UserArb, (user) => user.age >= 0 && user.age <= 150),
);
```

`Schema.toArbitraryLazy` returns a lazy arbitrary factory:

```ts
const lazyArb = Schema.toArbitraryLazy(Schema.String);
// => (fc: typeof FastCheck) => FastCheck.Arbitrary<string>

const arb = lazyArb(FastCheck);
```

### Supported schema types

Arbitraries are generated for many built in schema types. Unsupported declarations and `Schema.Never` throw unless the schema provides a `toArbitrary` annotation.

## `it.prop` (non-effectful)

Property tests with raw `FastCheck.Arbitrary` values. Runs `fc.assert(fc.property(...))` under the hood.

### Array form

```ts
it.prop(
  "addition is commutative",
  [FastCheck.integer(), FastCheck.integer()],
  ([a, b]) => a + b === b + a,
);
```

### Object form

```ts
it.prop(
  "addition is commutative",
  { a: FastCheck.integer(), b: FastCheck.integer() },
  ({ a, b }) => a + b === b + a,
);
```

### With fast-check parameters

```ts
it.prop("holds for many runs", [FastCheck.integer()], ([n]) => n === n, {
  fastCheck: { numRuns: 1000 },
});
```

### IMPORTANT: `it.prop` does NOT accept Schemas

The non-effectful `it.prop` only accepts `FastCheck.Arbitrary` values. Passing a Schema throws `"Schemas are not supported yet"`. Use `Schema.toArbitrary()` to convert first, or use `it.effect.prop` which handles Schemas automatically.

```ts
// WRONG - throws at runtime
it.prop("bad", [Schema.String], ([s]) => s.length >= 0);

// CORRECT - convert manually
it.prop("good", [Schema.toArbitrary(Schema.String)], ([s]) => s.length >= 0);

// CORRECT - use it.effect.prop (auto-converts)
it.effect.prop("good", [Schema.String], ([s]) => Effect.succeed(s.length >= 0));
```

## `it.effect.prop` (effectful)

Property tests that run inside `Effect.gen`. Accepts `FastCheck.Arbitrary` values, and array form reliably auto converts `Schema.Schema` values via `Schema.toArbitrary()`.

### Array form with Schema

```ts
it.effect.prop("string roundtrip", [Schema.String], ([s]) =>
  Effect.gen(function*() {
    const encoded = yield* Schema.encode(Schema.String)(s);
    return encoded === s;
  }));
```

### Object form mixing Arbitraries

```ts
it.effect.prop(
  "user age is valid",
  { name: Schema.toArbitrary(Schema.String), age: FastCheck.integer({ min: 0, max: 150 }) },
  ({ name, age }) =>
    Effect.gen(function*() {
      yield* Effect.void;
      return age >= 0 && age <= 150;
    }),
);
```

### With service dependencies

```ts
it.effect.prop(
  "uses context",
  [FastCheck.integer()],
  ([num]) =>
    Effect.gen(function*() {
      const config = yield* AppConfig;
      return num * config.multiplier === num * config.multiplier;
    }),
  { fastCheck: { numRuns: 200 } },
);
```

### With layer

```ts
it.layer(AppConfigLive)("property tests", (it) => {
  it.effect.prop("with layer", [Schema.Int], ([n]) =>
    Effect.gen(function*() {
      const config = yield* AppConfig;
      return n + config.offset >= n;
    }));
});
```

## Custom Arbitrary Annotations

Override how a schema generates values by annotating with `toArbitrary`:

```ts
const URL = Schema.instanceOf(globalThis.URL, {
  title: "URL",
  toArbitrary: () => (fc) => fc.webUrl().map((s) => new globalThis.URL(s)),
});

const PositiveEven = Schema.Number.annotate({
  toArbitrary: () => (fc) => fc.integer({ min: 2, max: 1000 }).filter((n) => n % 2 === 0),
});
```

The annotation signature:

```ts
((
  typeParameters: { readonly [K in keyof TypeParams]: FastCheck.Arbitrary<TypeParams[K]["Type"]>; },
) =>
(fc: typeof FastCheck, context: Context) => FastCheck.Arbitrary<T>);
```

For schemas without type parameters, `typeParameters` is empty.

## TestSchema.Asserts

For schema authors verifying that a schema generates valid values and round-trips correctly:

```ts
import { TestSchema } from "effect/testing";

const asserts = new TestSchema.Asserts(MySchema);

asserts.arbitrary().verifyGeneration();
await asserts.verifyLosslessTransformation();
```

### `verifyGeneration(options?)`

Generates values from the schema's arbitrary and verifies each passes `Schema.is`:

```ts
asserts.arbitrary().verifyGeneration({ params: { numRuns: 100 } });
```

Internally runs:

```ts
const is = Schema.is(schema);
const arb = Schema.toArbitrary(schema);
FastCheck.assert(FastCheck.property(arb, (a) => is(a)));
```

### `verifyLosslessTransformation(options?)`

Verifies encode then decode round-trips to the original value:

```ts
asserts.verifyLosslessTransformation({ params: { numRuns: 50 } });
```

Internally runs `encode(value) |> decode |> assert.deepStrictEqual(original)` for each generated value.

## Common Patterns

### Schema roundtrip testing

```ts
const MyCodec = Schema.Struct({
  id: Schema.String.check(Schema.isUUID()),
  createdAt: Schema.DateTimeUtcFromString,
  tags: Schema.Array(Schema.NonEmptyString),
});

it.effect.prop("encode/decode roundtrip", [MyCodec], ([value]) =>
  Effect.gen(function*() {
    const encoded = yield* Schema.encode(MyCodec)(value);
    const decoded = yield* Schema.decode(MyCodec)(encoded);
    assert.deepStrictEqual(decoded, value);
    return true;
  }));
```

### Invariant testing with services

```ts
it.effect.prop(
  "balance never goes negative",
  [Schema.toArbitrary(Schema.Int.check(Schema.isGreaterThan(0)))],
  ([amount]) =>
    Effect.gen(function*() {
      const account = yield* AccountService;
      const before = yield* account.getBalance();
      yield* account.deposit(amount);
      const after = yield* account.getBalance();
      return after >= before;
    }),
);
```

### Combining multiple arbitraries

```ts
const UserArb = Schema.toArbitrary(User);
const ActionArb = FastCheck.oneof(
  FastCheck.constant("create" as const),
  FastCheck.constant("update" as const),
  FastCheck.constant("delete" as const),
);

it.prop(
  "all actions are valid",
  [UserArb, ActionArb],
  ([user, action]) => isValidAction(user, action),
);
```

## fast-check API (most used)

Since `FastCheck` re-exports all of fast-check, the full API is available:

```ts
FastCheck.integer({ min, max })
FastCheck.nat()
FastCheck.float({ min, max, noNaN })
FastCheck.string({ minLength, maxLength })
FastCheck.boolean()
FastCheck.constant(value)
FastCheck.oneof(...arbitraries)
FastCheck.tuple(...arbitraries)
FastCheck.record({ a: arbA, b: arbB })
FastCheck.array(arb, { minLength, maxLength })
FastCheck.option(arb)
FastCheck.uniqueArray(arb)
FastCheck.json()
FastCheck.webUrl()
FastCheck.uuid()
FastCheck.date()

FastCheck.assert(property, params?)
FastCheck.property(...arbs, predicate)
FastCheck.asyncProperty(...arbs, asyncPredicate)
```
