---
title: Postgres.errors.ts
nav_order: 2
parent: "@beep/postgres"
---

## Postgres.errors.ts overview

Technical Postgres driver errors and diagnostics.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [extractPostgresDiagnostics](#extractpostgresdiagnostics)
- [errors](#errors)
  - [PostgresError (class)](#postgreserror-class)
  - [PostgresErrorContext (class)](#postgreserrorcontext-class)
---

# error-handling

## extractPostgresDiagnostics

Normalize unknown Postgres-adjacent failures into structured diagnostics.

**Example**

```ts
import { extractPostgresDiagnostics } from "@beep/postgres"

const diagnostics = extractPostgresDiagnostics(new Error("failed"))
console.log(diagnostics)
```

**Signature**

```ts
declare const extractPostgresDiagnostics: (cause: unknown) => PostgresError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/Postgres.errors.ts#L392)

Since v0.0.0

# errors

## PostgresError (class)

Technical failure raised by the `@beep/postgres` driver boundary.

**Example**

```ts
import { PostgresError } from "@beep/postgres"

const error = PostgresError.fromUnknown("connect", new Error("boom"))
console.log(error)
```

**Signature**

```ts
declare class PostgresError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/Postgres.errors.ts#L298)

Since v0.0.0

## PostgresErrorContext (class)

Optional diagnostic context captured while normalizing Postgres-adjacent failures.

**Example**

```ts
import { PostgresErrorContext } from "@beep/postgres"

const context = PostgresErrorContext.make({
  query: "select 1",
  sqlStateName: "UNIQUE_VIOLATION"
})

console.log(context)
```

**Signature**

```ts
declare class PostgresErrorContext
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/Postgres.errors.ts#L36)

Since v0.0.0