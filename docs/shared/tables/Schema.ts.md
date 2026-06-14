---
title: Schema.ts
nav_order: 9
parent: "@beep/shared-tables"
---

## Schema.ts overview

Shared-kernel Drizzle schema aggregate exports.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [DbSchema](#dbschema)
  - [DbSchema (type alias)](#dbschema-type-alias)
---

# tables

## DbSchema

Shared-kernel Drizzle schema aggregate.

**Example**

```ts
import { DbSchema } from "@beep/shared-tables/Schema"

console.log(DbSchema)
```

**Signature**

```ts
declare const DbSchema: DbSchemaShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/tables/src/Schema.ts#L29)

Since v0.0.0

## DbSchema (type alias)

Type for `DbSchema`.

**Example**

```ts
import type { DbSchema } from "@beep/shared-tables/Schema"

const value = {} as DbSchema
console.log(value)
```

**Signature**

```ts
type DbSchema = DbSchemaShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/tables/src/Schema.ts#L49)

Since v0.0.0