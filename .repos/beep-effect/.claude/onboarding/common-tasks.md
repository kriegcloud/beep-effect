# Common Tasks Reference

Quick patterns for frequent development tasks in beep-effect. All examples follow codebase conventions and use Effect-idiomatic approaches.

## Table of Contents

- [Add a Domain Field](#add-a-domain-field)
- [Create a Service](#create-a-service)
- [Create a Repository](#create-a-repository)
- [Write Tests with @beep/testkit](#write-tests-with-beeptestkit)
- [Create a Tagged Error](#create-a-tagged-error)
- [Add Package Dependency](#add-package-dependency)
- [Fix Common Type Errors](#fix-common-type-errors)
- [Run Verification](#run-verification)

---

## Add a Domain Field

When adding a field to an existing entity, update domain model first, then table.

### Step 1: Update Domain Model

```typescript
// packages/[slice]/domain/src/entities/Entity/Entity.model.ts
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain";
import { SliceEntityIds } from "../../entity-ids";

export class Entity extends M.Class<Entity>("Entity")({
  ...makeFields(SliceEntityIds.EntityId, {
    // Existing fields
    name: S.String,

    // NEW: Add your field here
    newField: S.String,                              // Required string
    optionalField: BS.FieldOptionOmittable(S.String), // Optional string
    boolField: BS.BoolWithDefault(false),            // Boolean with default
    emailField: BS.EmailBase,                        // Validated email
  }),
}) {}
```

### Step 2: Update Table Definition

```typescript
// packages/[slice]/tables/src/tables/entity.table.ts
import * as pg from "drizzle-orm/pg-core";
import { Table } from "@beep/shared-tables/table";
import { SliceEntityIds } from "@beep/[slice]-domain";

export const entityTable = Table.make(SliceEntityIds.EntityId)({
  // Existing columns
  name: pg.text("name").notNull(),

  // NEW: Add matching column
  newField: pg.text("new_field").notNull(),
  optionalField: pg.text("optional_field"),
  boolField: pg.boolean("bool_field").default(false).notNull(),
  emailField: pg.text("email_field").notNull(),
});
```

### Step 3: Update Type Check File

```typescript
// packages/[slice]/tables/src/_check.ts
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { Entity } from "@beep/[slice]-domain/entities";
import type { entityTable } from "./tables/entity.table";

({}) as InferSelectModel<typeof entityTable> satisfies Entity.Encoded;
({}) as InferInsertModel<typeof entityTable> satisfies Entity.Encoded;
```

### Step 4: Verify and Generate Migration

```bash
# Verify domain compiles
bun run check --filter @beep/[slice]-domain

# Verify tables compile
bun run check --filter @beep/[slice]-tables

# Generate migration (requires services running)
bun run db:generate

# Apply migration
bun run db:migrate
```

### Field Type Reference

| Use Case | Domain Schema | Table Column |
|----------|---------------|--------------|
| Required string | `S.String` | `pg.text("col").notNull()` |
| Optional string | `BS.FieldOptionOmittable(S.String)` | `pg.text("col")` |
| Boolean with default | `BS.BoolWithDefault(false)` | `pg.boolean("col").default(false).notNull()` |
| Email | `BS.EmailBase` | `pg.text("col").notNull()` |
| DateTime | `BS.DateTimeUtcFromAllAcceptable` | `pg.timestamp("col", { withTimezone: true })` |
| EntityId reference | `SharedEntityIds.UserId` | `pg.text("col").notNull().$type<SharedEntityIds.UserId.Type>()` |
| Array of numbers | `S.Array(S.Number)` | `vector768("col").notNull()` |

---

## Create a Service

Services use `Effect.Service` with dependency injection via Layers.

### Basic Service Pattern

```typescript
// packages/[slice]/server/src/MyService.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

// 1. Define error type
export class MyServiceError extends S.TaggedError<MyServiceError>()("MyServiceError", {
  message: S.String,
  cause: S.optional(S.Unknown),
}) {}

// 2. Define service with Effect.Service
export class MyService extends Effect.Service<MyService>()("@beep/[slice]-server/MyService", {
  accessors: true,
  effect: Effect.gen(function* () {
    // Inject dependencies
    const dependency = yield* SomeDependency;

    // Define service methods
    const doSomething = (input: string): Effect.Effect<Result, MyServiceError> =>
      Effect.gen(function* () {
        yield* Effect.logDebug("MyService.doSomething", { input });

        const result = yield* dependency.process(input).pipe(
          Effect.mapError((e) => new MyServiceError({
            message: `Processing failed: ${e.message}`,
            cause: e,
          }))
        );

        return result;
      }).pipe(
        Effect.withSpan("MyService.doSomething", {
          captureStackTrace: false,
          attributes: { input },
        })
      );

    return {
      doSomething,
    };
  }),
}) {}

// 3. Export layer with dependencies
export const MyServiceLive = MyService.Default.pipe(
  Layer.provide(SomeDependency.Default)
);
```

### Service with Repository Dependency

```typescript
// packages/[slice]/server/src/EntityService.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { EntityRepo } from "@beep/[slice]-server/db";
import type { Entities } from "@beep/[slice]-domain";

export class EntityNotFoundError extends S.TaggedError<EntityNotFoundError>()(
  "EntityNotFoundError",
  { id: S.String }
) {}

export class EntityService extends Effect.Service<EntityService>()(
  "@beep/[slice]-server/EntityService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const repo = yield* EntityRepo;

      const findById = (
        id: string
      ): Effect.Effect<Entities.Entity.Model, EntityNotFoundError> =>
        Effect.gen(function* () {
          const maybeEntity = yield* repo.findById(id);
          return yield* O.match(maybeEntity, {
            onNone: () => Effect.fail(new EntityNotFoundError({ id })),
            onSome: Effect.succeed,
          });
        });

      const create = (
        data: typeof Entities.Entity.insert.Type
      ): Effect.Effect<Entities.Entity.Model> =>
        repo.insert(data);

      return {
        findById,
        create,
      };
    }),
  }
) {}

export const EntityServiceLive = EntityService.Default.pipe(
  Layer.provide(EntityRepo.Default)
);
```

### Using a Service

```typescript
import * as Effect from "effect/Effect";
import { MyService } from "@beep/[slice]-server";

const program = Effect.gen(function* () {
  const service = yield* MyService;
  const result = yield* service.doSomething("input");
  return result;
});

// Provide layer when running
const result = await program.pipe(
  Effect.provide(MyServiceLive),
  Effect.runPromise
);
```

---

## Create a Repository

Repositories extend `Effect.Service` using the `DbRepo.make` factory.

### Repository Pattern

```typescript
// packages/[slice]/server/src/db/repos/Entity.repo.ts
import * as Effect from "effect/Effect";
import { DbRepo } from "@beep/shared-domain/factories";
import { Entities } from "@beep/[slice]-domain";
import { SliceEntityIds } from "@beep/shared-domain";
import { SliceDb } from "@beep/[slice]-server/db";
import { dependencies } from "./_common";
import { $SliceServerId } from "@beep/identity/packages";

const $I = $SliceServerId.create("db/repos/EntityRepo");

export class EntityRepo extends Effect.Service<EntityRepo>()($I`EntityRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(
    SliceEntityIds.EntityId,
    Entities.Entity.Model,
    Effect.gen(function* () {
      yield* SliceDb.Db;

      // Custom queries beyond CRUD
      // const findByName = makeQuery((execute, name: string) =>
      //   execute((client) => client.query.entity.findMany({
      //     where: eq(entityTable.name, name)
      //   }))
      // );

      return {
        // findByName,
      };
    })
  ),
}) {}
```

### Register in Repository Index

```typescript
// packages/[slice]/server/src/db/repos/index.ts
export { EntityRepo } from "./Entity.repo";
```

### Add to Slice Repos Layer

```typescript
// packages/[slice]/server/src/db/repositories.ts
import * as Layer from "effect/Layer";
import { EntityRepo } from "./repos/Entity.repo";

export const SliceRepos = {
  layer: Layer.mergeAll(
    EntityRepo.Default,
    // ... other repos
  ),
};
```

---

## Write Tests with @beep/testkit

ALWAYS use `@beep/testkit` for Effect-based tests. NEVER use raw `bun:test` with `Effect.runPromise`.

### Unit Test (effect runner)

```typescript
// packages/[slice]/server/test/MyService.test.ts
import * as Effect from "effect/Effect";
import { effect, strictEqual, assertTrue } from "@beep/testkit";
import { MyService } from "@beep/[slice]-server";

effect("MyService.doSomething returns expected result", () =>
  Effect.gen(function* () {
    const service = yield* MyService;
    const result = yield* service.doSomething("test-input");

    strictEqual(result.status, "success");
    assertTrue(result.data.length > 0);
  }).pipe(Effect.provide(MyService.Default))
);
```

### Integration Test with Layer (layer runner)

```typescript
// packages/[slice]/server/test/EntityService.test.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Duration from "effect/Duration";
import { layer, strictEqual, assertSome, assertNone } from "@beep/testkit";
import { EntityService } from "@beep/[slice]-server";
import { TestDbLayer } from "./fixtures/TestDb";

const TestLayer = Layer.mergeAll(
  TestDbLayer,
  EntityService.Default
);

layer(TestLayer, { timeout: Duration.seconds(30) })("EntityService", (it) => {
  it.effect("creates entity", () =>
    Effect.gen(function* () {
      const service = yield* EntityService;
      const entity = yield* service.create({
        name: "Test Entity",
      });

      strictEqual(entity.name, "Test Entity");
    })
  );

  it.effect("finds entity by id", () =>
    Effect.gen(function* () {
      const service = yield* EntityService;

      // Create first
      const created = yield* service.create({ name: "Findable" });

      // Then find
      const found = yield* service.findById(created.id);
      strictEqual(found.id, created.id);
    })
  );
});
```

### Scoped Test (resource cleanup)

```typescript
import * as Effect from "effect/Effect";
import { scoped, strictEqual } from "@beep/testkit";

scoped("cleans up resources after test", () =>
  Effect.gen(function* () {
    // Acquire resource
    const resource = yield* Effect.acquireRelease(
      Effect.sync(() => createResource()),
      (r) => Effect.sync(() => r.cleanup())
    );

    // Use resource
    const result = yield* Effect.sync(() => resource.doWork());
    strictEqual(result, "expected");

    // Resource automatically cleaned up via finalizer
  })
);
```

### Test Runner Selection Guide

| Runner | Use Case | TestContext |
|--------|----------|-------------|
| `effect()` | Unit tests, time-dependent tests | Yes (TestClock, TestRandom) |
| `scoped()` | Tests with resource cleanup | Yes |
| `live()` | Pure logic, real Clock/Random | No |
| `scopedLive()` | Resource cleanup + live services | No |
| `layer()` | Integration tests, shared Layer | Configurable |

### Assertion Reference

| Assertion | Purpose |
|-----------|---------|
| `strictEqual(a, b)` | Reference equality (`===`) |
| `deepStrictEqual(a, b)` | Deep structural equality |
| `assertEquals(a, b)` | Effect `Equal.equals` equality |
| `assertTrue(cond)` | Assert `true` |
| `assertFalse(cond)` | Assert `false` |
| `assertNone(opt)` | Assert `Option.None` |
| `assertSome(opt, val)` | Assert `Option.Some` with value |
| `assertLeft(either, err)` | Assert `Either.Left` |
| `assertRight(either, val)` | Assert `Either.Right` |
| `assertSuccess(exit, val)` | Assert `Exit.Success` |
| `assertFailure(exit, cause)` | Assert `Exit.Failure` |

---

## Create a Tagged Error

ALWAYS use tagged errors instead of native `Error` class.

### Domain Error Pattern

```typescript
// packages/[slice]/domain/src/errors.ts
import * as S from "effect/Schema";

export class EntityNotFoundError extends S.TaggedError<EntityNotFoundError>()(
  "EntityNotFoundError",
  {
    entityId: S.String,
    entityType: S.String,
  }
) {}

export class ValidationError extends S.TaggedError<ValidationError>()(
  "ValidationError",
  {
    message: S.String,
    field: S.optional(S.String),
  }
) {}

export class PermissionDeniedError extends S.TaggedError<PermissionDeniedError>()(
  "PermissionDeniedError",
  {
    userId: S.String,
    resource: S.String,
    action: S.String,
  }
) {}
```

### Using Tagged Errors

```typescript
import * as Effect from "effect/Effect";
import { EntityNotFoundError, ValidationError } from "@beep/[slice]-domain/errors";

const findEntity = (id: string) =>
  Effect.gen(function* () {
    if (!id) {
      return yield* Effect.fail(new ValidationError({
        message: "Entity ID is required",
        field: "id",
      }));
    }

    const entity = yield* repo.findById(id);

    return yield* O.match(entity, {
      onNone: () => Effect.fail(new EntityNotFoundError({
        entityId: id,
        entityType: "Entity",
      })),
      onSome: Effect.succeed,
    });
  });

// Handle specific errors with catchTag
const program = findEntity("abc").pipe(
  Effect.catchTag("EntityNotFoundError", (e) =>
    Effect.logWarning(`Entity not found: ${e.entityId}`).pipe(
      Effect.zipRight(Effect.succeed(null))
    )
  ),
  Effect.catchTag("ValidationError", (e) =>
    Effect.fail(new UserFacingError({ message: e.message }))
  )
);
```

---

## Add Package Dependency

### Step 1: Update package.json

```json
// packages/[slice]/[package]/package.json
{
  "dependencies": {
    "@beep/new-package": "workspace:*"
  }
}
```

### Step 2: Sync TypeScript References

```bash
bun run repo-cli tsconfig-sync
```

### Step 3: Verify

```bash
bun run check --filter @beep/[package-name]
```

### Common Dependency Patterns

| Need | Package | Import |
|------|---------|--------|
| Schema validation | `@beep/schema` | `import { BS } from "@beep/schema"` |
| Entity IDs | `@beep/shared-domain` | `import { SharedEntityIds } from "@beep/shared-domain"` |
| Database utilities | `@beep/shared-tables` | `import { Table } from "@beep/shared-tables/table"` |
| Testing | `@beep/testkit` | `import { effect, strictEqual } from "@beep/testkit"` |
| Environment config | `@beep/shared-env` | `import { serverEnv } from "@beep/shared-env/ServerEnv"` |

---

## Fix Common Type Errors

### "Property 'string' does not exist on type"

**Cause**: Using lowercase schema constructors.

```typescript
// WRONG
S.struct({ name: S.string })

// CORRECT
S.Struct({ name: S.String })
```

### "Type 'string' is not assignable to type '...Id.Type'"

**Cause**: Using `S.String` instead of branded EntityId.

```typescript
// WRONG
id: S.String

// CORRECT
import { SharedEntityIds } from "@beep/shared-domain";
id: SharedEntityIds.UserId
```

### "Service 'X' is not provided in the context"

**Cause**: Missing Layer in provider chain.

```typescript
// WRONG - Service not provided
const result = await program.pipe(Effect.runPromise);

// CORRECT - Provide required Layer
const result = await program.pipe(
  Effect.provide(MyServiceLive),
  Effect.runPromise
);
```

### "Type 'Effect<never, never, Service>' requires Service"

**Cause**: Forgot to `yield*` the service tag.

```typescript
// WRONG - Returns Effect, doesn't access service
const service = MyService;

// CORRECT - Accesses service from context
const service = yield* MyService;
```

### "Cannot find module '@beep/...'"

**Cause**: Missing tsconfig path reference or package dependency.

```bash
# Fix 1: Sync tsconfig references
bun run repo-cli tsconfig-sync

# Fix 2: Add missing dependency to package.json
# Then run bun install
```

### Table column type mismatch with domain model

**Cause**: Missing `.$type<>()` on EntityId columns.

```typescript
// WRONG - Loses type safety
userId: pg.text("user_id").notNull()

// CORRECT - Preserves branded type
userId: pg.text("user_id").notNull().$type<SharedEntityIds.UserId.Type>()
```

---

## Run Verification

### Package-Specific Verification

```bash
# Type check specific package
bun run check --filter @beep/[package-name]

# Run tests for specific package
bun run test --filter @beep/[package-name]

# Lint specific package
bun run lint --filter @beep/[package-name]
```

### Full Verification

```bash
# Type check all packages
bun run check

# Run all tests
bun run test

# Lint and auto-fix
bun run lint:fix

# Verify lint is clean
bun run lint
```

### Isolated File Check

When cascading check fails due to upstream errors unrelated to your changes:

```bash
# Syntax-only check (no dependency resolution)
bun tsc --noEmit --isolatedModules path/to/your/file.ts
```

### Database Operations

```bash
# Start services (required for DB operations)
bun run services:up

# Generate migration from schema changes
bun run db:generate

# Apply migrations
bun run db:migrate

# Push schema changes directly (dev only)
bun run db:push
```

### Verification Checklist

Before submitting changes:

- [ ] `bun run check --filter @beep/[package]` passes
- [ ] `bun run test --filter @beep/[package]` passes
- [ ] `bun run lint` shows no new errors
- [ ] Used PascalCase Schema constructors (`S.Struct`, `S.String`)
- [ ] Used EntityIds for ID fields (not `S.String`)
- [ ] Used namespace imports (`import * as X from`)
- [ ] Used `@beep/testkit` for tests (not raw `bun:test`)
- [ ] Used Effect array utilities (`A.map`, not `array.map`)
- [ ] No native methods (`array.filter`, `string.split`)
- [ ] No `switch` statements (use `Match`)
- [ ] No `typeof`/`instanceof` (use `P.isString`, `P.isDate`)

---

## Quick Reference Card

### Import Aliases

| Module | Alias | Usage |
|--------|-------|-------|
| `effect/Array` | `A` | `A.map(arr, fn)` |
| `effect/Option` | `O` | `O.some(val)` |
| `effect/Schema` | `S` | `S.Struct({})` |
| `effect/String` | `Str` | `Str.split(s, ",")` |
| `effect/Predicate` | `P` | `P.isString(val)` |
| `effect/Match` | `Match` | `Match.value(x).pipe(...)` |
| `@effect/sql/Model` | `M` | `M.Class<T>()(...)` |

### Entity ID Imports

| Slice | Import |
|-------|--------|
| Shared | `SharedEntityIds` from `@beep/shared-domain` |
| IAM | `IamEntityIds` from `@beep/shared-domain` |
| Documents | `DocumentsEntityIds` from `@beep/shared-domain` |
| Knowledge | `KnowledgeEntityIds` from `@beep/knowledge-domain` |
| Calendar | `CalendarEntityIds` from `@beep/shared-domain` |

### Commands

| Action | Command |
|--------|---------|
| Install deps | `bun install` |
| Start services | `bun run services:up` |
| Type check all | `bun run check` |
| Type check package | `bun run check --filter @beep/pkg` |
| Test all | `bun run test` |
| Test package | `bun run test --filter @beep/pkg` |
| Lint fix | `bun run lint:fix` |
| Generate migration | `bun run db:generate` |
| Apply migration | `bun run db:migrate` |
| Sync tsconfig | `bun run repo-cli tsconfig-sync` |
