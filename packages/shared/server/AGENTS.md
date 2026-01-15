# `@beep/shared-server` Agent Guide

## Purpose & Fit
- Provides foundational infrastructure services consumed by all vertical slices: database clients, configuration management, email delivery, file uploads, Redis, and rate limiting.
- Consolidates primitives previously scattered across `@beep/core-db`, `@beep/core-env`, and `@beep/core-email` into a unified, Effect-first service layer.
- Exposes ready-to-merge Layers (`Live`, `Db.layer`, `Email.ResendService.layer`, `UploadService.layer`) that applications compose into runtime environments without touching raw clients.
- Centralizes Effect Config-based environment variable parsing (`serverEnv`, `clientEnv`) so downstream packages reference a single source of truth for secrets, URLs, and cloud credentials.
- Establishes repository contracts via `Repo.make` that auto-generate CRUD operations with telemetry, error mapping, and transaction support.

## Surface Map

### Configuration
- **Environment Management** — Configuration has moved to `@beep/shared-env` package. This package consumes configuration via Effect Config at service boundaries.

### Database
- **`DbClient.make`** (`src/factories/db-client/pg/PgClient.ts`) — Core factory producing a `DatabaseService<TFullSchema>` with typed Drizzle client, transaction support, and query builders (`makeQuery`, `makeQueryWithSchema`).
- **`DbClient.layer`** (`src/factories/db-client/pg/PgClient.ts`) — Layer providing `PgClient`, `SqlClient`, `ConnectionPool`, `ConnectionConfig`, `QueryLogger`, and `Reactivity`, with exponential retry logic for connection failures.
- **`ConnectionConfig`** (`src/factories/db-client/pg/services/ConnectionConfig.service.ts`) — Service sourcing Postgres connection config from `DB_PG_*` env vars (host, port, user, password, SSL, transformations).
- **`ConnectionPool`** (`src/factories/db-client/pg/services/ConnectionPool.service.ts`) — Scoped pg.Pool manager with health checks, error listeners, and graceful shutdown.
- **`QueryLogger`** (`src/factories/db-client/pg/services/QueryLogger.service.ts`) — Drizzle-compatible query logger with SQL syntax highlighting, parameter formatting, and box-drawing table output.
- **`TransactionContext`** (`src/factories/db-client/pg/PgClient.ts`) — Context tag for transaction-aware queries, letting `makeQuery` detect tx scope and delegate execution accordingly.

### Repositories
- **Repository Pattern** (`src/db/repos/*.repo.ts`) — Individual repositories use a base repo factory pattern with `DbRepo.make(idSchema, model, maker?)` returning Effect with base CRUD methods: `insert`, `insertVoid`, `insertManyVoid`, `update`, `updateVoid`, `findById`, `delete`. Auto-wires telemetry spans, DatabaseError mapping, and optional custom queries via `maker` block.
- **Shared Repositories** (`src/db/repositories.ts`) — Pre-built repositories for File, Folder, and UploadSession entities exposed via `SharedRepos` namespace.
- **`DatabaseError`** (`@beep/shared-domain/errors`) — Tagged error with Postgres-specific constraint/enum handling, formatted stack traces, and `$match` helper for safe error coercion.

### Email
- **`Email.ResendService`** (`src/internal/email/adapters/resend/service.ts`) — Effect.Service wrapping Resend SDK; exposes `send(payload, options?)` with tagged ResendError and structured logging.
- **`Email.components`** (`src/internal/email/components/`) — Reusable auth email templates (verification, reset, OTP, invitations).

### Upload
- **`UploadService`** (`src/services/Upload.service.ts`) — S3-backed file service providing `initiateUpload(uploadParams)` for client uploads and `deleteObject(uploadParams)` for cleanup. Depends on `S3Service` from `@effect-aws/client-s3`.

### RPC Handlers
- **File Management RPC** (`src/rpc/v1/files/`) — Server-side RPC handlers for file operations, including upload session management.

## Usage Snapshots
- `packages/runtime/server/src/DataAccess.layer.ts` — Composes database and repository layers for the core server runtime.
- `packages/iam/server/src/adapters/repositories.ts` — Imports `DbClient.SliceDbRequirements` type to constrain IAM repo layer dependencies.
- `packages/iam/server/src/adapters/repos/WalletAddress.repo.ts` — Uses repo factory pattern to auto-generate repos with custom query extensions.
- `packages/shared/server/src/db/repos/File.repo.ts` — Example repository implementation using `DbRepo.make` pattern.
- `packages/shared/server/src/services/Upload.service.ts` — S3 upload service consuming Effect Config for bucket configuration.

## Authoring Guardrails
- **Effect Config precedence**: ALWAYS prefer Effect Config combinators (`Config.all`, `Config.nested`, `Config.redacted`) over manual `process.env` parsing. Use `Config.withDefault`, `Config.option`, or custom config providers for optional values.
- **Database service hygiene**: NEVER construct raw `pg.Pool` or Drizzle clients outside `DbClient.make`. Slice-specific DB tags (like `IamDb.IamDb`) should call `DbClient.make` with their schema and return a scoped Layer.
- **Repository contracts**: When extending repos, place custom queries in the `maker` Effect block, yielding the database service to access `makeQuery` or `execute`. ALWAYS return an object merging extra methods with base CRUD. Update type exports in barrel files.
- **Layer composition**: Use `Layer.mergeAll` / `Layer.provideMerge` for service composition. When adding new services, export a Layer with proper dependency declarations.
- **Secret handling**: Wrap sensitive config in `Config.redacted` and `Redacted` from Effect. Use `Redacted.value` only at trust boundaries. NEVER log or serialize redacted values unwrapped.
- **Telemetry**: Attach `Effect.withSpan`, `Effect.annotateLogs` to service methods. Use span attributes for request payloads; keep PII out of logs.
- **Collections & strings**: Follow repo-wide rule—ALWAYS use `A.*`, `Str.*`, `F.pipe` instead of native array/string methods. Legacy native usages exist in early code; NEVER replicate them.
- **Error mapping**: Use `DatabaseError.$match` for Postgres errors, `ResendError` for email errors. ALWAYS `catchTag("ParseError", Effect.die)` for schema decode failures in infra code.
- **Config validation**: Effect Config failures surface as `ConfigError`. Handle appropriately or allow to propagate if invalid configuration should prevent application startup.

## Quick Recipes

### Access configuration in services
```ts
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const bucketName = yield* Config.nonEmptyString("CLOUD_AWS_S3_BUCKET_NAME");
  const dbHost = yield* Config.string("DB_PG_HOST");
  yield* Effect.logInfo("Config loaded", { bucketName, dbHost });
});
```

### Build a slice-specific DB Layer
```ts
import { DbClient } from "@beep/shared-server/factories";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as mySchema from "./schema"; // Drizzle tables

type MySchema = typeof mySchema;
type MyDb = DbClient.Shape<MySchema>;

export class MyDb extends Context.Tag("MyDb")<MyDb, MyDb>() {
  static readonly Live: Layer.Layer<MyDb, never, DbClient.SliceDbRequirements> = Layer.scoped(
    MyDb,
    DbClient.make({ schema: mySchema })
  );
}
```

### Create a repository with custom queries
```ts
import { DbRepo } from "@beep/shared-server";
import { SharedEntityIds } from "@beep/shared-domain";
import { MyEntity } from "./entities";
import { MyDb } from "./db";
import * as Effect from "effect/Effect";

export class MyEntityRepo extends Effect.Service<MyEntityRepo>()("@my-slice/server/repos/MyEntityRepo", {
  dependencies: [MyDb.Default],
  accessors: true,
  effect: Effect.gen(function* () {
    const baseRepo = yield* DbRepo.make(
      SharedEntityIds.MyEntityId,
      MyEntity.Model,
      Effect.gen(function* () {
        const { makeQuery } = yield* MyDb;

        const findByOwner = makeQuery((execute, ownerId: string) =>
          execute((client) =>
            client.query.myEntity.findMany({
              where: (table, { eq }) => eq(table.ownerId, ownerId),
            })
          )
        );

        return { findByOwner };
      })
    );
    return baseRepo;
  }),
}) {}
```

### Use email service to send verification
```ts
import { Email } from "@beep/shared-server/Email";
import * as Effect from "effect/Effect";

const sendVerification = Effect.gen(function* () {
  const { send } = yield* Email.ResendService;
  const result = yield* send({
    from: "noreply@example.com",
    to: "user@example.com",
    subject: "Verify your email",
    html: "<p>Click here to verify</p>",
  });
  yield* Effect.logInfo("Verification email sent", { id: result.data?.id });
});
```

### Generate pre-signed upload URL
```ts
import { UploadService } from "@beep/shared-server/Upload";
import { File } from "@beep/shared-domain/entities";
import * as Effect from "effect/Effect";

const getUploadUrl = Effect.gen(function* () {
  const upload = yield* UploadService;
  const uploadPath: File.UploadKey.Encoded = {
    orgId: "org_123",
    userId: "user_456",
    fileItemId: "file_789",
    extension: "png",
  };
  const url = yield* upload.initiateUpload(uploadPath);
  yield* Effect.logInfo("Pre-signed URL generated", { url });
  return url;
});
```

### Override config for tests
```ts
import { DbClient } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";

const testConnectionLayer = Layer.succeed(DbClient.ConnectionConfig, {
  config: {
    host: "localhost",
    port: 54320,
    database: "test_db",
    username: "test_user",
    password: Redacted.make("test_pass"),
    ssl: false,
    transformQueryNames: Str.camelToSnake,
    transformResultNames: Str.snakeToCamel,
  },
});

const testDbLayer = DbClient.layer.pipe(Layer.provide(testConnectionLayer));
```

### Access transaction context in a repo
```ts
import { DbClient } from "@beep/shared-server/factories";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const updateWithTx = Effect.gen(function* () {
  const tx = yield* Effect.serviceOption(DbClient.TransactionContext);
  if (O.isSome(tx)) {
    yield* Effect.logInfo("Running inside transaction");
  } else {
    yield* Effect.logInfo("Running outside transaction");
  }
});
```

## Verifications
- `bun run check --filter @beep/shared-server`
- `bun run lint --filter @beep/shared-server`
- `bun run test --filter @beep/shared-server`
- For testcontainer-backed integration: `bun run test --filter @beep/db-admin -- --grep "PgClient"` (requires Docker).

## Gotchas

### Database Connection Pool Exhaustion
- `Db.layer` creates a `pg.Pool` with a default connection limit. Under high concurrency, pool exhaustion causes queries to hang indefinitely waiting for a connection. ALWAYS set `DB_PG_POOL_MAX` appropriate to your workload and monitor pool metrics.
- Transactions hold a connection for their entire duration. Long-running transactions inside `Effect.gen` blocks can exhaust the pool if many requests hit transaction-heavy code paths simultaneously.

### Transaction Context Propagation
- `TransactionContext` is an optional service; calling `Effect.serviceOption(TransactionContext)` outside a transaction returns `Option.none()`. Code that assumes transaction context exists will silently run outside the transaction if not properly guarded.
- NEVER start a new transaction inside an existing transaction unless you explicitly want nested savepoints. Effect-SQL's transaction semantics may differ from raw Drizzle; verify behavior with integration tests.

### Repo.make Error Mapping
- `Repo.make` wraps database errors in `DatabaseError`, but schema decode failures (e.g., invalid enum values in the database) surface as `ParseError`. ALWAYS handle both error types in calling code, or use `catchTag("ParseError", Effect.die)` if schema violations are invariant failures.
- Unique constraint violations throw Postgres error code `23505`. Use `DatabaseError.$match` to distinguish constraint errors from other database failures; raw error messages vary by Postgres version.

### Layer Initialization Side Effects
- `Db.layer` performs health checks and establishes connections during layer construction. If the database is unreachable at startup, layer construction fails and the entire runtime fails to initialize. Use retry policies (`Schedule.exponential`) around layer provision for resilience.
- `PoolService` registers error listeners on the pool. If you create multiple pool layers (e.g., for different databases), ensure each has distinct error handling to avoid cross-contamination of error logs.

### Effect Config vs Runtime Environment
- `serverEnv` uses Effect Config and is parsed at module load time. Environment variables set after import (e.g., via late dotenv loading) are not reflected. ALWAYS load environment files before importing `@beep/shared-server`.
- `Config.redacted` values are `Redacted<string>`, not plain strings. Calling `.toString()` on a redacted value returns `"<redacted>"`. Use `Redacted.value(secret)` explicitly at trust boundaries; forgetting this causes auth failures with opaque error messages.

### Email Service Rate Limits
- `Email.ResendService` does not implement client-side rate limiting. Resend's API has per-second and daily limits; exceeding them returns `429` errors. ALWAYS implement application-level throttling for bulk email operations.
- Email sending is fire-and-forget by default. If `send` fails, the error is returned but no retry occurs. For critical emails (password reset, verification), implement retry logic with exponential backoff.

### Upload Service Presigned URL Expiry
- `UploadService.initiateUpload` generates presigned URLs with a default expiry. If the client delays uploading, the URL expires and the upload fails with a cryptic S3 signature error. Document expected upload windows and consider longer expiries for large files.

## Contributor Checklist
- [ ] New services: extend `Effect.Service`, define typed `effect` block, export Layer, and append to `Live` exports.
- [ ] Config changes: add to `ServerConfig` or `ClientEnvSchema`, document env var naming convention (`DB_PG_*`, `CLOUD_AWS_S3_*`, etc.), update `.env.example`.
- [ ] Database utilities: add helpers to `Db` namespace or `Repo` module; ensure transaction-awareness via `TransactionContext`.
- [ ] Email templates: place in `src/internal/email/components/`, export via barrel, document schema in template props.
- [ ] Upload/storage: extend `UploadService` with new S3 operations (list, copy, etc.), keep all S3 concerns inside this service.
- [ ] Redis/YJS/RateLimit: populate stub exports when implementing; create `src/internal/*/index.ts` with service class and Layer.
- [ ] Migration from `@beep/core-*`: ensure all references in slice packages updated to `@beep/shared-server`, remove old package imports from `package.json`.
- [ ] Layer graphs: verify wiring with `bun run check --filter @beep/shared-server` and inspect for missing service requirements or circular deps.
- [ ] Tests: add or extend `test/` suites when touching core logic; prefer testcontainers for Postgres/Redis integration tests.
- [ ] Observability: instrument new methods with `Effect.withSpan`, structured `Effect.log*`, and redact secrets in attributes.
