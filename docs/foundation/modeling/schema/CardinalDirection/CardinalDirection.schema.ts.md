---
title: CardinalDirection.schema.ts
nav_order: 8
parent: "@beep/schema"
---

## CardinalDirection.schema.ts overview

Cardinal direction literal schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [Abbrev](#abbrev)
  - [Schema](#schema)
- [validation](#validation)
  - [CardinalDirection](#cardinaldirection)
  - [CardinalDirection (type alias)](#cardinaldirection-type-alias)
  - [CardinalDirectionAbbrev](#cardinaldirectionabbrev)
  - [CardinalDirectionAbbrev (type alias)](#cardinaldirectionabbrev-type-alias)
---

# schemas

## Abbrev

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Abbrev: AnnotatedSchema<LiteralKit<readonly ["N", "S", "E", "W"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CardinalDirection/CardinalDirection.schema.ts#L73)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<LiteralKit<readonly ["north", "south", "east", "west"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CardinalDirection/CardinalDirection.schema.ts#L73)

Since v0.0.0

# validation

## CardinalDirection

Cardinal direction literal schema.

**Example**

```ts
import { CardinalDirection } from "@beep/schema/CardinalDirection"

console.log(CardinalDirection.Options)
```

CardinalDirection - The cardinal directions

**Signature**

```ts
declare const CardinalDirection: AnnotatedSchema<LiteralKit<readonly ["north", "south", "east", "west"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CardinalDirection/CardinalDirection.schema.ts#L27)

Since v0.0.0

## CardinalDirection (type alias)

{@inheritDoc CardinalDirection}

**Signature**

```ts
type CardinalDirection = typeof CardinalDirection.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CardinalDirection/CardinalDirection.schema.ts#L38)

Since v0.0.0

## CardinalDirectionAbbrev

CardinalDirectionAbbrev - The abbreviated version of the `CardinalDirection`

**Example**

```ts
import { CardinalDirectionAbbrev } from "@beep/schema/CardinalDirection"

console.log(CardinalDirectionAbbrev.Options)
```

**Signature**

```ts
declare const CardinalDirectionAbbrev: AnnotatedSchema<LiteralKit<readonly ["N", "S", "E", "W"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CardinalDirection/CardinalDirection.schema.ts#L53)

Since v0.0.0

## CardinalDirectionAbbrev (type alias)

{@inheritDoc CardinalDirectionAbbrev}

**Signature**

```ts
type CardinalDirectionAbbrev = typeof CardinalDirectionAbbrev.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CardinalDirection/CardinalDirection.schema.ts#L65)

Since v0.0.0