# `@beep/shared-infra` Agent Guide

## Purpose & Fit
- Provides foundational infrastructure services consumed by all vertical slices: database clients, configuration management, email delivery, file uploads, Redis, and rate limiting.
- Consolidates primitives previously scattered across `@beep/core-db`, `@beep/core-env`, and `@beep/core-email` into a unified, Effect-first service layer.
- Exposes ready-to-merge Layers (`Live`, `Db.layer`, `Email.ResendService.layer`, `UploadService.layer`) that applications compose into runtime environments without touching raw clients.
- Centralizes Effect Config-based environment variable parsing (`serverEnv`, `clientEnv`) so downstream packages reference a single source of truth for secrets, URLs, and cloud credentials.
- Establishes repository contracts via `Repo.make` that auto-generate CRUD operations with telemetry, error mapping, and transaction support.

## Surface Map

### Configuration
- **`ServerEnv.ts`** (`src/ServerEnv.ts`) — Parses server-side env vars into typed `serverEnv` singleton using Effect Config, covering DB, auth, cloud (AWS S3), OAuth providers, OTLP, payments, email, Redis, marketing, and AI credentials.
- **`ClientEnv.ts`** (`src/ClientEnv.ts`) — Validates `NEXT_PUBLIC_*` env vars for browser bundles; schema-backed with detailed parse errors.

### Database
- **`Db.make`** (`src/internal/db/pg/PgClient.ts`) — Core factory producing a `DatabaseService<TFullSchema>` with typed Drizzle client, transaction support, and query builders (`makeQuery`, `makeQueryWithSchema`).
- **`Db.layer`** (`src/internal/db/pg/PgClient.ts`) — Layer providing `PgClient`, `SqlClient`, `PoolService`, `ConnectionContext`, `Logger`, and `Reactivity`, with exponential retry logic for connection failures.
- **`ConnectionContext`** (`src/internal/db/pg/PgClient.ts`) — Service sourcing Postgres connection config from `DB_PG_*` env vars (host, port, user, password, SSL, transformations).
- **`PoolService`** (`src/internal/db/pg/PgClient.ts`) — Scoped pg.Pool manager with health checks, error listeners, and graceful shutdown.
- **`Logger`** (`src/internal/db/pg/PgClient.ts`) — Drizzle-compatible query logger with SQL syntax highlighting, parameter formatting, and box-drawing table output.
- **`TransactionContext`** (`src/internal/db/pg/PgClient.ts`) — Context tag for transaction-aware queries, letting `makeQuery` detect tx scope and delegate execution accordingly.

### Repositories
- **`Repo.make`** (`src/internal/db/pg/repo.ts`) — Factory accepting `(idSchema, model, maker?)` and returning Effect with base CRUD methods: `insert`, `insertVoid`, `insertManyVoid`, `update`, `updateVoid`, `findById`, `delete`. Auto-wires telemetry spans, DatabaseError mapping, and optional custom queries via `maker` block.
- **`DatabaseError`** (`src/internal/db/pg/errors.ts`) — Tagged error with Postgres-specific constraint/enum handling, formatted stack traces, and `$match` helper for safe error coercion.

### Email
- **`Email.ResendService`** (`src/internal/email/adapters/resend/service.ts`) — Effect.Service wrapping Resend SDK; exposes `send(payload, options?)` with tagged ResendError and structured logging.
- **`Email.renderEmail`** (`src/internal/email/renderEmail.ts`) — Helper for rendering React Email templates to HTML/text for send operations.
- **`Email.components`** (`src/internal/email/components/`) — Reusable auth email templates (verification, reset, OTP, invitations).

### Upload
- **`UploadService`** (`src/internal/upload/upload.service.ts`) — S3-backed file service providing `initiateUpload(uploadParams)` for client uploads and `deleteObject(uploadParams)` for cleanup. Depends on `S3Service` from `@effect-aws/client-s3`.

### Shared Infrastructure Layer
- **`Live`** (`src/Live.ts`) — Top-level Layer merging `Email.ResendService.layer`, `Db.layer`, `EncryptionService.layer`, and `UploadService.layer` for slice consumption.

### Redis & Rate Limiting
- **`Redis.ts`** (`src/Redis.ts`) — (Currently stub export; implementation in `src/internal/redis/index.ts`).
- **`RateLimit.ts`** (`src/RateLimit.ts`) — (Currently stub export; implementation in `src/internal/ratelimit/index.ts`).

### YJS (Collaborative Editing)
- **`YJS.ts`** (`src/YJS.ts`) — (Currently stub export; implementation in `src/internal/yjs/index.ts`).

## Usage Snapshots
- `packages/runtime/server/src/CoreServices.ts:11` — Composes `Live` with `IamConfig.Live` to build the core server runtime Layer.
- `packages/iam/infra/src/adapters/repositories.ts:1` — Imports `Db.PgClientServices` type to constrain IAM repo layer dependencies.
- `packages/iam/infra/src/adapters/repos/WalletAddress.repo.ts` — Uses `Repo.make(IamEntityIds.WalletAddressId, Entities.WalletAddress.Model, ...)` to auto-generate repo with custom query extensions.
- `packages/documents/infra/AGENTS.md:29` — Documents FilesConfig sourcing from `serverEnv` for S3 bucket configuration.
- `apps/web/src/proxy.ts` — References `serverEnv` for runtime URL/domain resolution in Next.js middleware.
- `packages/_internal/db-admin/src/Db/AdminDb.ts` — Constructs testcontainer-backed DB layers using `Db.make` with admin schema for migration validation.
- `packages/iam/sdk/src/adapters/better-auth/client.ts` — Consumes `clientEnv` for auth URL/provider configuration in browser bundle.

## Authoring Guardrails
- **Effect Config precedence**: Always prefer Effect Config combinators (`Config.all`, `Config.nested`, `Config.redacted`) over manual `process.env` parsing. Use `withDefault`, `option`, or `withPlaceholderRedacted` for optional secrets.
- **Database service hygiene**: Never construct raw `pg.Pool` or Drizzle clients outside `Db.make`. Slice-specific DB tags (like `IamDb.IamDb`) should call `Db.make` with their schema and return a scoped Layer.
- **Repo.make contracts**: When extending repos, place custom queries in the `maker` Effect block, yielding `DatabaseService` to access `makeQuery` or `execute`. Always return an object merging extra methods with base CRUD. Update type exports in barrel files (`src/index.ts`, `src/Repo.ts`).
- **Layer composition**: Keep `Live` free of side effects; use `Layer.mergeAll` / `Layer.provideMerge`. When adding new services, export a Layer and append it to `Live` after ensuring dependencies are satisfied.
- **Secret handling**: Wrap sensitive config in `Config.redacted`. Use `Redacted.make` / `Redacted.value` at boundaries. Never log or serialize redacted values unwrapped.
- **Telemetry**: Attach `Effect.withSpan`, `Effect.annotateLogs` to service methods. Use span attributes for request payloads; keep PII out of logs.
- **Collections & strings**: Follow repo-wide rule—use `A.*`, `Str.*`, `F.pipe` instead of native array/string methods. Legacy native usages exist in early code; do not replicate them.
- **Error mapping**: Use `DatabaseError.$match` for Postgres errors, `ResendError.new` for email errors. Always `catchTag("ParseError", Effect.die)` for schema decode failures in infra code.
- **Config validation**: Schema-backed configs (`ServerConfig`, `ClientEnvSchema`) must die on `ConfigError` to prevent runtime with invalid env. Use `Effect.catchTag("ConfigError", Effect.die)` in service effects.

## Quick Recipes

### Access serverEnv in a slice
```ts
import { serverEnv } from "@beep/shared-infra";

// serverEnv is a runtime singleton; access directly
const dbConfig = serverEnv.db.pg;
const s3Bucket = serverEnv.cloud.aws.s3.bucketName;
const authSecret = serverEnv.auth.secret; // Redacted<string>
```

### Build a slice-specific DB Layer
```ts
import { Db } from "@beep/shared-infra/Db";
import type { DbSchema } from "@beep/shared-infra/Db";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as mySchema from "./schema"; // Drizzle tables

type MySchema = typeof mySchema;
type MyDb = Db.DatabaseService<MySchema>;

export class MyDb extends Context.Tag("MyDb")<MyDb, MyDb>() {
  static readonly Live: Layer.Layer<MyDb, never, Db.PgClientServices> = Layer.scoped(
    MyDb,
    Db.make({ schema: mySchema })
  );
}
```

### Create a repository with custom queries
```ts
import { Repo } from "@beep/shared-infra/Repo";
import { SharedEntityIds } from "@beep/shared-domain";
import { MyEntity } from "./entities";
import { MyDb } from "./db";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class MyEntityRepo extends Effect.Service<MyEntityRepo>()("@my-slice/infra/repos/MyEntityRepo", {
  dependencies: [MyDb.Live],
  accessors: true,
  effect: Repo.make(
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
  ),
}) {}
```

### Use email service to send verification
```ts
import { Email } from "@beep/shared-infra/Email";
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
import { UploadService } from "@beep/shared-infra/Upload";
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
import { ConnectionContext } from "@beep/shared-infra/Db";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";

const testConnectionLayer = Layer.succeed(ConnectionContext, {
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

const testDbLayer = Db.layer.pipe(Layer.provide(testConnectionLayer));
```

### Access transaction context in a repo
```ts
import { TransactionContext } from "@beep/shared-infra/Db";
import * as Effect from "effect/Effect";

const updateWithTx = Effect.gen(function* () {
  const tx = yield* Effect.serviceOption(TransactionContext);
  if (Option.isSome(tx)) {
    yield* Effect.logInfo("Running inside transaction");
  } else {
    yield* Effect.logInfo("Running outside transaction");
  }
});
```

## Verifications
- `bun run check --filter @beep/shared-infra`
- `bun run lint --filter @beep/shared-infra`
- `bun run test --filter @beep/shared-infra`
- For testcontainer-backed integration: `bun run test --filter @beep/db-admin -- --grep "PgClient"` (requires Docker).

## Contributor Checklist
- [ ] New services: extend `Effect.Service`, define typed `effect` block, export Layer, and append to `Live` exports.
- [ ] Config changes: add to `ServerConfig` or `ClientEnvSchema`, document env var naming convention (`DB_PG_*`, `CLOUD_AWS_S3_*`, etc.), update `.env.example`.
- [ ] Database utilities: add helpers to `Db` namespace or `Repo` module; ensure transaction-awareness via `TransactionContext`.
- [ ] Email templates: place in `src/internal/email/components/`, export via barrel, document schema in template props.
- [ ] Upload/storage: extend `UploadService` with new S3 operations (list, copy, etc.), keep all S3 concerns inside this service.
- [ ] Redis/YJS/RateLimit: populate stub exports when implementing; create `src/internal/*/index.ts` with service class and Layer.
- [ ] Migration from `@beep/core-*`: ensure all references in slice packages updated to `@beep/shared-infra`, remove old package imports from `package.json`.
- [ ] Layer graphs: verify wiring with `bun run check --filter @beep/shared-infra` and inspect for missing service requirements or circular deps.
- [ ] Tests: add or extend `test/` suites when touching core logic; prefer testcontainers for Postgres/Redis integration tests.
- [ ] Observability: instrument new methods with `Effect.withSpan`, structured `Effect.log*`, and redact secrets in attributes.
