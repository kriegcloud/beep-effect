---
title: Duration.schema.ts
nav_order: 62
parent: "@beep/schema"
---

## Duration.schema.ts overview

Primary Effect Duration schema for the `Duration` concept module.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Duration (type alias)](#duration-type-alias)
  - [Schema (type alias)](#schema-type-alias)
- [schemas](#schemas)
  - [Duration](#duration)
  - [Schema](#schema)
---

# models

## Duration (type alias)

Runtime type extracted from `Duration`.

**Example**

```ts
import type { Duration as DurationValue } from "@beep/schema/Duration"
import { Duration } from "effect"

const duration = Duration.millis(250) satisfies DurationValue
console.log(duration)
```

**Signature**

```ts
type Duration = Schema
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.schema.ts#L74)

Since v0.0.0

## Schema (type alias)

Runtime type extracted from `Schema`.

**Example**

```ts
import type { Schema as DurationValue } from "@beep/schema/Duration"
import { Duration } from "effect"

const duration = Duration.seconds(5) satisfies DurationValue
console.log(duration)
```

**Signature**

```ts
type Schema = typeof Schema.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.schema.ts#L42)

Since v0.0.0

# schemas

## Duration

Compatibility alias for the primary Effect Duration schema.

**Example**

```ts
import { Duration } from "@beep/schema/Duration"

console.log(Duration.ast._tag)
```

**Signature**

```ts
declare const Duration: S.Duration
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.schema.ts#L57)

Since v0.0.0

## Schema

Schema for Effect `Duration` values.

**Example**

```ts
import * as Duration from "@beep/schema/Duration"
import * as S from "effect/Schema"

const decode = S.decodeUnknownOption(Duration.Schema)
console.log(decode)
```

**Signature**

```ts
declare const Schema: S.Duration
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Duration/Duration.schema.ts#L25)

Since v0.0.0