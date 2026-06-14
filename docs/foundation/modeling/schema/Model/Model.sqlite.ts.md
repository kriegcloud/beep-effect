---
title: Model.sqlite.ts
nav_order: 154
parent: "@beep/schema"
---

## Model.sqlite.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [BooleanSqlite (interface)](#booleansqlite-interface)
- [schemas](#schemas)
  - [BooleanSqlite](#booleansqlite)
---

# models

## BooleanSqlite (interface)

Interface for an SQLite boolean field using `0 | 1` in the database and `boolean` in JSON.

**Example**

```ts
import * as Model from "@beep/schema/Model"

const field: Model.BooleanSqlite = Model.BooleanSqlite
console.log(field)
```

**Signature**

```ts
export interface BooleanSqlite
  extends VariantSchema.Field<{
    readonly select: S.BooleanFromBit;
    readonly insert: S.BooleanFromBit;
    readonly update: S.BooleanFromBit;
    readonly json: S.Boolean;
    readonly jsonCreate: S.Boolean;
    readonly jsonUpdate: S.Boolean;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.sqlite.ts#L24)

Since v0.0.0

# schemas

## BooleanSqlite

A schema for sqlite booleans that are represented as `0 | 1` in database
variants and `boolean` in JSON variants.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Task extends Model.Class<Task>("Task")({}) {}

console.log(Task)
```

**Signature**

```ts
declare const BooleanSqlite: BooleanSqlite
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.sqlite.ts#L51)

Since v0.0.0