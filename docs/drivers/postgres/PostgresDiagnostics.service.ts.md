---
title: PostgresDiagnostics.service.ts
nav_order: 4
parent: "@beep/postgres"
---

## PostgresDiagnostics.service.ts overview

SQL formatting and Postgres error rendering helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [formatPostgresError](#formatpostgreserror)
  - [formatSql](#formatsql)
  - [logPostgresError](#logpostgreserror)
---

# utilities

## formatPostgresError

Render a Postgres failure with diagnostics and formatted SQL.

**Example**

```ts
import { formatPostgresError, PostgresError } from "@beep/postgres"

const text = formatPostgresError(PostgresError.fromUnknown("query", new Error("failed")))
console.log(text)
```

**Signature**

```ts
declare const formatPostgresError: (error: unknown, palette?: Colors) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresDiagnostics.service.ts#L343)

Since v0.0.0

## formatSql

Format and highlight PostgreSQL SQL for terminal output.

**Example**

```ts
import { formatSql } from "@beep/postgres"

const sql = formatSql("select * from users where id = $1", [1])
console.log(sql)
```

**Signature**

```ts
declare const formatSql: (statement: string, parameters?: ReadonlyArray<unknown>, palette?: Colors) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresDiagnostics.service.ts#L312)

Since v0.0.0

## logPostgresError

Log a formatted Postgres failure to stderr.

**Example**

```ts
import { logPostgresError } from "@beep/postgres"

const effect = logPostgresError(new Error("failed"))
console.log(effect)
```

**Signature**

```ts
declare const logPostgresError: (error: unknown) => Effect.Effect<void>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresDiagnostics.service.ts#L394)

Since v0.0.0