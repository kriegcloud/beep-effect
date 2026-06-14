---
title: DateTime.ts
nav_order: 3
parent: "@beep/utils"
---

## DateTime.ts overview

DateTime helpers and Effect DateTime re-exports.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [DateTimes (class)](#datetimes-class)
- [utilities](#utilities)
  - ["effect/DateTime" (namespace export)](#effectdatetime-namespace-export)
  - [makeUnsafeUtc](#makeunsafeutc)
---

# constructors

## DateTimes (class)

Time service with live and fixed clock-backed helpers.

**Example**

```ts
import { DateTimes } from "@beep/utils/DateTime"

console.log(DateTimes.Default)
```

**Signature**

```ts
declare class DateTimes
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/DateTime.ts#L57)

Since v0.0.0

# utilities

## "effect/DateTime" (namespace export)

Re-exports all named exports from the "effect/DateTime" module.

**Example**

```ts
import * as DateTime from "@beep/utils/DateTime"

console.log(DateTime)
```

**Signature**

```ts
export * from "effect/DateTime"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/DateTime.ts#L42)

Since v0.0.0

## makeUnsafeUtc

Constructs a `DateTime.Utc` from any supported `DateTime` input.

This helper normalizes zoned inputs to UTC while preserving the instant.

**Example**

```ts
```typescript
import { makeUnsafeUtc } from "@beep/utils/DateTime"

const value = makeUnsafeUtc("2026-01-01T00:00:00.000Z")
console.log(value)
```
```

**Signature**

```ts
declare const makeUnsafeUtc: <A extends Parameters<typeof DateTime.make>[0]>(input: A) => DateTime.Utc
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/DateTime.ts#L26)

Since v0.0.0