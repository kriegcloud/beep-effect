---
title: tables.ts
nav_order: 7
parent: "@beep/architecture-lab-tables"
---

## tables.ts overview

Architecture lab Drizzle schema.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [DbSchema](#dbschema)
  - [DbSchema (type alias)](#dbschema-type-alias)
---

# tables

## DbSchema

Architecture lab drizzle schema.

**Example**

```ts
import { DbSchema } from "@beep/architecture-lab-tables/tables"

console.log(DbSchema)
```

**Signature**

```ts
declare const DbSchema: DbSchemaShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/tables.ts#L30)

Since v0.0.0

## DbSchema (type alias)

Architecture lab drizzle schema type.

**Example**

```ts
import type { DbSchema } from "@beep/architecture-lab-tables/tables"

const value = {} as DbSchema
console.log(value)
```

**Signature**

```ts
type DbSchema = DbSchemaShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/tables/src/tables.ts#L49)

Since v0.0.0