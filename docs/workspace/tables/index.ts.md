---
title: index.ts
nav_order: 6
parent: "@beep/workspace-tables"
---

## index.ts overview

Workspace entity table metadata namespaces.

**Example**

```ts
import { Entities } from "@beep/workspace-tables"

console.log(Entities.CandidateDraft.Table.definition.tableName)
```

Since v0.0.0

---
## Exports Grouped by Category
- [tables](#tables)
  - [DbSchema](#dbschema)
  - [Entities (namespace export)](#entities-namespace-export)
---

# tables

## DbSchema

Workspace Drizzle schema aggregate exports.

**Signature**

```ts
declare const DbSchema: DbSchemaShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/tables/src/index.ts#L28)

Since v0.0.0

## Entities (namespace export)

Re-exports all named exports from the "./entities/index.ts" module as `Entities`.

**Example**

```ts
import { Entities } from "@beep/workspace-tables"

console.log(Entities.CandidateDraft.Table.definition.tableName)
```

**Signature**

```ts
export * as Entities from "./entities/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/workspace/tables/src/index.ts#L21)

Since v0.0.0