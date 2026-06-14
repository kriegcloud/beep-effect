---
title: Duration.input.ts
nav_order: 61
parent: "@beep/schema"
---

## Duration.input.ts overview

Reusable schemas for decoding duration values from Effect-compatible inputs.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [DurationFromInput](#durationfrominput)
  - [DurationInput](#durationinput)
  - [DurationObject (class)](#durationobject-class)
  - [DurationUnit](#durationunit)
- [models](#models)
  - [DurationFromInput (type alias)](#durationfrominput-type-alias)
  - [DurationInput (type alias)](#durationinput-type-alias)
  - [DurationUnit (type alias)](#durationunit-type-alias)
  - [Unit (type alias)](#unit-type-alias)
- [schemas](#schemas)
  - [Input](#input)
  - [Object](#object)
---

# constructors

## DurationFromInput

One-way schema that decodes `DurationInput` into an Effect `Duration`.

Encoding back to the original input is intentionally forbidden because the
additive object form and normalized duration values are not invertible.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { DurationFromInput } from "@beep/schema/Duration"

const program = S.decodeUnknownEffect(DurationFromInput)("2 hours")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const DurationFromInput: AnnotatedSchema<S.decodeTo<S.Duration, S.Union<readonly [S.Duration, S.Int, S.BigInt, S.Tuple<readonly [S.brand<S.Finite, "seconds">, S.brand<S.Finite, "nanos">]>, S.TemplateLiteral<readonly [S.Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, S.decodeTo<S.declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [S.Struct<{ readonly weeks: S.optionalKey<S.Int>; readonly days: S.optionalKey<S.Int>; readonly hours: S.optionalKey<S.Int>; readonly minutes: S.optionalKey<S.Int>; readonly seconds: S.optionalKey<S.Int>; readonly milliseconds: S.optionalKey<S.Int>; readonly microseconds: S.optionalKey<S.Int>; readonly nanoseconds: S.optionalKey<S.Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, S.Struct<{ readonly weeks: S.optionalKey<S.Int>; readonly days: S.optionalKey<S.Int>; readonly hours: S.optionalKey<S.Int>; readonly minutes: S.optionalKey<S.Int>; readonly seconds: S.optionalKey<S.Int>; readonly milliseconds: S.optionalKey<S.Int>; readonly microseconds: S.optionalKey<S.Int>; readonly nanoseconds: S.optionalKey<S.Int>; }>, never, never>]> & SchemaStatics<S.Union<readonly [S.Duration, S.Int, S.BigInt, S.Tuple<readonly [S.brand<S.Finite, "seconds">, S.brand<S.Finite, "nanos">]>, S.TemplateLiteral<readonly [S.Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, S.decodeTo<S.declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [S.Struct<{ readonly weeks: S.optionalKey<S.Int>; readonly days: S.optionalKey<S.Int>; readonly hours: S.optionalKey<S.Int>; readonly minutes: S.optionalKey<S.Int>; readonly seconds: S.optionalKey<S.Int>; readonly milliseconds: S.optionalKey<S.Int>; readonly microseconds: S.optionalKey<S.Int>; readonly nanoseconds: S.optionalKey<S.Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, S.Struct<{ readonly weeks: S.optionalKey<S.Int>; readonly days: S.optionalKey<S.Int>; readonly hours: S.optionalKey<S.Int>; readonly minutes: S.optionalKey<S.Int>; readonly seconds: S.optionalKey<S.Int>; readonly milliseconds: S.optionalKey<S.Int>; readonly microseconds: S.optionalKey<S.Int>; readonly nanoseconds: S.optionalKey<S.Int>; }>, never, never>]>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L232)

Since v0.0.0

## DurationInput

Union schema for all duration input shapes accepted by `DurationFromInput`.

Accepts an existing `Duration`, a non-negative integer, a non-negative bigint,
a `[seconds, nanos]` tuple, a template literal like `"5 hours"`, or a
`DurationObject` with additive unit fields.

**Example**

```ts
import * as S from "effect/Schema"
import { DurationInput } from "@beep/schema/Duration"

const decode = S.decodeUnknownSync(DurationInput)

const fromString = decode("5 hours")
const fromNumber = decode(1000)
const fromObject = decode({ minutes: 30 })
```

**Signature**

```ts
declare const DurationInput: AnnotatedSchema<S.Union<readonly [S.Duration, S.Int, S.BigInt, S.Tuple<readonly [S.brand<S.Finite, "seconds">, S.brand<S.Finite, "nanos">]>, S.TemplateLiteral<readonly [S.Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, S.decodeTo<S.declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [S.Struct<{ readonly weeks: S.optionalKey<S.Int>; readonly days: S.optionalKey<S.Int>; readonly hours: S.optionalKey<S.Int>; readonly minutes: S.optionalKey<S.Int>; readonly seconds: S.optionalKey<S.Int>; readonly milliseconds: S.optionalKey<S.Int>; readonly microseconds: S.optionalKey<S.Int>; readonly nanoseconds: S.optionalKey<S.Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, S.Struct<{ readonly weeks: S.optionalKey<S.Int>; readonly days: S.optionalKey<S.Int>; readonly hours: S.optionalKey<S.Int>; readonly minutes: S.optionalKey<S.Int>; readonly seconds: S.optionalKey<S.Int>; readonly milliseconds: S.optionalKey<S.Int>; readonly microseconds: S.optionalKey<S.Int>; readonly nanoseconds: S.optionalKey<S.Int>; }>, never, never>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L173)

Since v0.0.0

## DurationObject (class)

Structured duration input with additive unit fields.

Each populated field contributes to the total duration.
At least one field must be set for validation to pass.

**Example**

```ts
import * as S from "effect/Schema"
import { DurationObject } from "@beep/schema/Duration"

const decode = S.decodeUnknownSync(DurationObject)

const d = decode({ hours: 1, minutes: 30 })
console.log(d.hours) // 1
console.log(d.minutes) // 30
```

**Signature**

```ts
declare class DurationObject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L133)

Since v0.0.0

## DurationUnit

Literal union of duration unit labels accepted by `DurationInput`.

**Example**

```ts
import * as S from "effect/Schema"
import { DurationUnit } from "@beep/schema/Duration"

const decode = S.decodeUnknownSync(DurationUnit)

const unit = decode("hours")
console.log(unit) // "hours"
```

**Signature**

```ts
declare const DurationUnit: AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L65)

Since v0.0.0

# models

## DurationFromInput (type alias)

Decoded duration type extracted from `DurationFromInput`.

**Signature**

```ts
type DurationFromInput = typeof DurationFromInput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L250)

Since v0.0.0

## DurationInput (type alias)

Duration input type extracted from `DurationInput`.

**Signature**

```ts
type DurationInput = typeof DurationInput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L193)

Since v0.0.0

## DurationUnit (type alias)

Duration unit string type extracted from `DurationUnit`.

**Signature**

```ts
type DurationUnit = typeof DurationUnit.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L94)

Since v0.0.0

## Unit (type alias)

Backwards-compatible alias for `DurationUnit`.

**Example**

```ts
import type { Unit } from "@beep/schema/Duration"

const unit: Unit = "seconds"
console.log(unit)
```

**Signature**

```ts
type Unit = DurationUnit
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L110)

Since v0.0.0

# schemas

## Input

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Input: AnnotatedSchema<S.Union<readonly [S.Duration, S.Int, S.BigInt, S.Tuple<readonly [S.brand<S.Finite, "seconds">, S.brand<S.Finite, "nanos">]>, S.TemplateLiteral<readonly [S.Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, S.decodeTo<S.declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [S.Struct<{ readonly weeks: S.optionalKey<S.Int>; readonly days: S.optionalKey<S.Int>; readonly hours: S.optionalKey<S.Int>; readonly minutes: S.optionalKey<S.Int>; readonly seconds: S.optionalKey<S.Int>; readonly milliseconds: S.optionalKey<S.Int>; readonly microseconds: S.optionalKey<S.Int>; readonly nanoseconds: S.optionalKey<S.Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, S.Struct<{ readonly weeks: S.optionalKey<S.Int>; readonly days: S.optionalKey<S.Int>; readonly hours: S.optionalKey<S.Int>; readonly minutes: S.optionalKey<S.Int>; readonly seconds: S.optionalKey<S.Int>; readonly milliseconds: S.optionalKey<S.Int>; readonly microseconds: S.optionalKey<S.Int>; readonly nanoseconds: S.optionalKey<S.Int>; }>, never, never>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L258)

Since v0.0.0

## Object

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Object: typeof DurationObject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.input.ts#L258)

Since v0.0.0