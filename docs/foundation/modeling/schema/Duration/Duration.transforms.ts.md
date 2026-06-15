---
title: Duration.transforms.ts
nav_order: 63
parent: "@beep/schema"
---

## Duration.transforms.ts overview

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [DurationFromInput](#durationfrominput)
  - [FromInput](#frominput)
---

# schemas

## DurationFromInput

**Signature**

```ts
declare const DurationFromInput: AnnotatedSchema<decodeTo<Duration, Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]> & SchemaStatics<Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.transforms.ts#L12)

Since v0.0.0

## FromInput

**Signature**

```ts
declare const FromInput: AnnotatedSchema<decodeTo<Duration, Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]> & SchemaStatics<Union<readonly [Duration, Int, BigInt, Tuple<readonly [brand<Finite, "seconds">, brand<Finite, "nanos">]>, TemplateLiteral<readonly [Finite, " ", AnnotatedSchema<LiteralKit<readonly ["nano", "nanos", "micro", "micros", "milli", "millis", "second", "seconds", "minute", "minutes", "hour", "hours", "day", "days", "week", "weeks"], undefined>>]>, decodeTo<declareConstructor<DurationObject, { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }, readonly [Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>], { readonly weeks?: number | undefined; readonly days?: number | undefined; readonly hours?: number | undefined; readonly minutes?: number | undefined; readonly seconds?: number | undefined; readonly milliseconds?: number | undefined; readonly microseconds?: number | undefined; readonly nanoseconds?: number | undefined; }>, Struct<{ readonly weeks: optionalKey<Int>; readonly days: optionalKey<Int>; readonly hours: optionalKey<Int>; readonly minutes: optionalKey<Int>; readonly seconds: optionalKey<Int>; readonly milliseconds: optionalKey<Int>; readonly microseconds: optionalKey<Int>; readonly nanoseconds: optionalKey<Int>; }>, never, never>]>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.transforms.ts#L12)

Since v0.0.0