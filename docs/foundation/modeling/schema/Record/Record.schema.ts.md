---
title: Record.schema.ts
nav_order: 178
parent: "@beep/schema"
---

## Record.schema.ts overview

Shared string-keyed record schema exports.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [UnknownRecord (type alias)](#unknownrecord-type-alias)
- [schemas](#schemas)
  - [UnknownRecord](#unknownrecord)
---

# models

## UnknownRecord (type alias)

Runtime type extracted from the `UnknownRecord` schema.

**Example**

```ts
import type { UnknownRecord } from "@beep/schema"

const value: UnknownRecord = { enabled: true, count: 1 }
console.log(value)
```

**Signature**

```ts
type UnknownRecord = typeof UnknownRecord.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Record/Record.schema.ts#L49)

Since v0.0.0

# schemas

## UnknownRecord

Schema for object records with string keys and unknown values.

**Example**

```ts
import { UnknownRecord } from "@beep/schema"
import * as S from "effect/Schema"

const decode = S.decodeUnknownSync(UnknownRecord)

const value = decode({ enabled: true, count: 1 })
console.log(value)
```

**Signature**

```ts
declare const UnknownRecord: AnnotatedSchema<S.$Record<S.String, S.Unknown>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Record/Record.schema.ts#L29)

Since v0.0.0