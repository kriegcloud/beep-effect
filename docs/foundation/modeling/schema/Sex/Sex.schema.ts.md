---
title: Sex.schema.ts
nav_order: 200
parent: "@beep/schema"
---

## Sex.schema.ts overview

Person sex literal schema.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [Schema](#schema)
- [validation](#validation)
  - [Sex](#sex)
  - [Sex (type alias)](#sex-type-alias)
---

# schemas

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<LiteralKit<readonly ["male", "female"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Sex/Sex.schema.ts#L44)

Since v0.0.0

# validation

## Sex

The sex of a person ("male" or "female").

**Example**

```ts
import { Sex } from "@beep/schema/Sex"

console.log(Sex.Options)
```

**Signature**

```ts
declare const Sex: AnnotatedSchema<LiteralKit<readonly ["male", "female"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Sex/Sex.schema.ts#L25)

Since v0.0.0

## Sex (type alias)

{@inheritDoc Sex}

**Signature**

```ts
type Sex = typeof Sex.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Sex/Sex.schema.ts#L36)

Since v0.0.0