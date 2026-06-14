---
title: LocalDate.model.ts
nav_order: 35
parent: "@beep/shared-domain"
---

## LocalDate.model.ts overview

LocalDate value object model.

Defines the schema-backed class used by the LocalDate behavior module. A
LocalDate stores only UTC calendar fields and deliberately carries no time
zone or clock-time component.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Model (class)](#model-class)
    - [toISOString (method)](#toisostring-method)
    - [[Eq.symbol] (method)](#eqsymbol-method)
    - [[Hash.symbol] (method)](#hashsymbol-method)
    - [toDateTime (method)](#todatetime-method)
    - [toString (property)](#tostring-property)
    - [toDate (property)](#todate-property)
---

# models

## Model (class)

Schema class representing a calendar date without time or timezone.

Stores year, month, and day as integer fields and validates that the
selected day exists in the selected month and year.

**Example**

```ts
import { Model } from "@beep/shared-domain/values/LocalDate"

const date = Model.make({ year: 2024, month: 6, day: 15 })

console.log(date.toISOString()) // "2024-06-15"
```

**Signature**

```ts
declare class Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.model.ts#L67)

Since v0.0.0

### toISOString (method)

Format the date as an ISO 8601 local-date string.

**Example**

```ts
import { Model } from "@beep/shared-domain/values/LocalDate"

const date = Model.make({ year: 99, month: 2, day: 5 })

console.log(date.toISOString()) // "0099-02-05"
```

**Signature**

```ts
declare const toISOString: () => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.model.ts#L91)

Since v0.0.0

### [Eq.symbol] (method)

Compare two LocalDate values by calendar fields.

**Example**

```ts
import { Equal } from "effect"
import { Model } from "@beep/shared-domain/values/LocalDate"

const left = Model.make({ year: 2024, month: 6, day: 15 })
const right = Model.make({ year: 2024, month: 6, day: 15 })

console.log(Equal.equals(left, right)) // true
```

**Signature**

```ts
declare const [Eq.symbol]: (that: Eq.Equal) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.model.ts#L135)

Since v0.0.0

### [Hash.symbol] (method)

Compute a stable hash from the canonical ISO date string.

**Example**

```ts
import { Hash } from "effect"
import { Model } from "@beep/shared-domain/values/LocalDate"

const date = Model.make({ year: 2024, month: 6, day: 15 })

console.log(Hash.hash(date) === Hash.string("2024-06-15")) // true
```

**Signature**

```ts
declare const [Hash.symbol]: () => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.model.ts#L156)

Since v0.0.0

### toDateTime (method)

Convert the date to an Effect `DateTime.Utc` at midnight UTC.

**Example**

```ts
import * as DateTime from "effect/DateTime"
import { Model } from "@beep/shared-domain/values/LocalDate"

const date = Model.make({ year: 2024, month: 6, day: 15 })
const parts = DateTime.toPartsUtc(date.toDateTime())

console.log(parts.hour) // 0
```

**Signature**

```ts
declare const toDateTime: () => DateTime.Utc
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.model.ts#L178)

Since v0.0.0

### toString (property)

Convert the date to its canonical string representation.

**Example**

```ts
import { Model } from "@beep/shared-domain/values/LocalDate"

const date = Model.make({ year: 2024, month: 6, day: 15 })

console.log(date.toString()) // "2024-06-15"
```

**Signature**

```ts
readonly toString: () => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.model.ts#L114)

Since v0.0.0

### toDate (property)

Convert the date to a JavaScript `Date` at midnight UTC.

**Example**

```ts
import { Model } from "@beep/shared-domain/values/LocalDate"

const date = Model.make({ year: 2024, month: 6, day: 15 })

console.log(date.toDate().toISOString()) // "2024-06-15T00:00:00.000Z"
```

**Signature**

```ts
readonly toDate: () => Date
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.model.ts#L202)

Since v0.0.0