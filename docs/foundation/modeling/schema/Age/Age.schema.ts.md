---
title: Age.schema.ts
nav_order: 2
parent: "@beep/schema"
---

## Age.schema.ts overview

Person age schema.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [Schema](#schema)
- [validation](#validation)
  - [Age](#age)
  - [Age (type alias)](#age-type-alias)
---

# schemas

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.brand<S.Int, "Age">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Age/Age.schema.ts#L53)

Since v0.0.0

# validation

## Age

The age of a person in years.

**Example**

```ts
import { Age } from "@beep/schema/Age"
import * as S from "effect/Schema"

const age = S.decodeUnknownSync(Age)(42)
console.log(age)
```

**Signature**

```ts
declare const Age: AnnotatedSchema<S.brand<S.Int, "Age">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Age/Age.schema.ts#L27)

Since v0.0.0

## Age (type alias)

{@inheritDoc Age}

**Signature**

```ts
type Age = typeof Age.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Age/Age.schema.ts#L45)

Since v0.0.0