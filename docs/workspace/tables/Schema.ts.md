---
title: Schema.ts
nav_order: 7
parent: "@beep/workspace-tables"
---

## Schema.ts overview

Workspace Drizzle schema aggregate.

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [DbSchema](#dbschema)
  - [DbSchema (type alias)](#dbschema-type-alias)
---

# tables

## DbSchema

Metadata-only workspace Drizzle schema aggregate.

**Example**

```ts
import { DbSchema } from "@beep/workspace-tables"

console.log(DbSchema.candidateDraft.definition.tableName)
```

**Signature**

```ts
declare const DbSchema: DbSchemaShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/tables/src/Schema.ts#L28)

Since v0.0.0

## DbSchema (type alias)

Type for `DbSchema`.

**Example**

```ts
import type { DbSchema } from "@beep/workspace-tables"

const value = {} as DbSchema
console.log(value)
```

**Signature**

```ts
type DbSchema = DbSchemaShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/tables/src/Schema.ts#L47)

Since v0.0.0