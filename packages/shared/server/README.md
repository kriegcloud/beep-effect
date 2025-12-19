# @beep/shared-server

Foundational infrastructure services for the beep-effect monorepo, providing Effect-first abstractions for database access, configuration management, email delivery, file uploads, Redis, and rate limiting.

## Installation

```bash
bun add @beep/shared-server
```

This package is part of the `beep-effect` monorepo and is typically consumed by vertical slices and applications within the workspace.

## Overview

`@beep/shared-server` consolidates cross-cutting infrastructure concerns into a unified service layer. It replaces fragmented primitives previously scattered across `@beep/core-db`, `@beep/core-env`, and `@beep/core-email` with a cohesive, Effect-based API.

### Key Capabilities

- **Configuration Management**: Schema-validated environment variable parsing via Effect Config
- **Database Layer**: PostgreSQL client with Drizzle ORM, transaction support, and telemetry
- **Repository Factory**: Auto-generated CRUD operations with error mapping and observability
- **Email Service**: Resend integration with React Email template rendering
- **Upload Service**: S3-backed file operations with pre-signed URL generation
- **Shared Runtime**: Ready-to-merge `Live` Layer for application composition

## Quick Reference

| Export | Type | Description |
|--------|------|-------------|
| `serverEnv` | Runtime Config | Server-side environment variables (DB, auth, cloud, OAuth, OTLP, etc.) |
| `clientEnv` | Runtime Config | Browser-safe `NEXT_PUBLIC_*` environment variables |
| `Db` | Namespace | Database client utilities (`make`, `layer`, `ConnectionContext`, `TransactionContext`, etc.) |
| `SharedDb` | Service | Shared database service with file/folder schema |
| `Repo` | Namespace | Repository factory (`make`) with base CRUD operations |
| `FileRepo` | Service | Pre-built file repository with pagination, move, delete, key lookup |
| `SharedRepos` | Namespace | Combined shared repositories layer |
| `Email` | Namespace | Email service (`ResendService`, `renderEmail`, `components`) |
| `UploadService` | Service | S3 file upload service with pre-signed URLs |
| `Live` | Layer | Unified layer combining all shared infrastructure services |

## Key Exports

### Configuration

#### `serverEnv`

Runtime singleton providing typed access to server-side environment variables. Parsed via Effect Config with automatic validation and detailed error reporting.

```typescript
import { serverEnv } from "@beep/shared-server/ServerEnv";

// Database configuration
const dbConfig = serverEnv.db.pg;
console.log(dbConfig.host, dbConfig.port, dbConfig.database);

// Cloud credentials
const s3Bucket = serverEnv.cloud.aws.s3.bucketName;
const awsRegion = serverEnv.cloud.aws.region;

// Auth secrets (Redacted)
const authSecret = serverEnv.auth.secret; // Redacted<string>

// OAuth providers
const googleClientId = serverEnv.oauth.provider.google.clientId;

// Email configuration
const resendKey = serverEnv.email.resend.apiKey; // Redacted<string>
const fromEmail = serverEnv.email.from;

// Observability endpoints
const traceUrl = serverEnv.otlp.traceExporterUrl;
```

**Configuration Sections**:
- `app` — Application metadata (name, domain, URLs, admin user IDs, log format/level)
- `auth` — Better Auth secret
- `cloud` — AWS (S3, region, credentials), Google (reCAPTCHA)
- `db` — PostgreSQL connection (host, port, user, password, SSL)
- `email` — Resend API key, default from/test addresses
- `kv` — Redis connection (URL, port, password)
- `oauth` — Provider credentials (Google, Microsoft, GitHub, Discord, LinkedIn, Twitter)
- `otlp` — OpenTelemetry endpoints (traces, logs, metrics)
- `payment` — Stripe API key and webhook secret
- `marketing` — Dub.co token
- `ai` — OpenAI and Anthropic API keys
- `security` — Trusted origins, CSP headers

#### `clientEnv`

Browser-safe environment variables for Next.js client bundles. Validates `NEXT_PUBLIC_*` vars with schema-backed parsing.

```typescript
"use client";
import { clientEnv } from "@beep/shared-server/ClientEnv";

const appUrl = clientEnv.appUrl;
const authUrl = clientEnv.authUrl;
const captchaSiteKey = clientEnv.captchaSiteKey; // Redacted<string>
const logLevel = clientEnv.logLevel;
```

### Database

#### `Db`

Core database service factory and utilities for PostgreSQL with Drizzle ORM.

**Key Exports**:
- `Db.make<TSchema>({ schema })` — Factory producing `DatabaseService<TSchema>` with typed Drizzle client, transaction support, and query builders
- `Db.layer` — Layer providing `PgClient`, `SqlClient`, `PoolService`, `ConnectionContext`, `Logger`, and `Reactivity`
- `Db.ConnectionContext` — Service tag for Postgres connection config
- `Db.PoolService` — Scoped pg.Pool manager with health checks
- `Db.Logger` — Drizzle-compatible query logger with SQL syntax highlighting
- `Db.TransactionContext` — Context tag for transaction-aware queries
- `Db.DatabaseError` — Tagged error with Postgres-specific constraint/enum handling

**Example: Slice-Specific Database Layer**

```typescript
import { Db } from "@beep/shared-server";
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

**Query Builders**:
- `makeQuery(fn)` — Execute queries with automatic transaction detection
- `makeQueryWithSchema(schema, fn)` — Execute queries with schema validation

**Transaction Support**:

```typescript
import { Db } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const updateWithTx = Effect.gen(function* () {
  const tx = yield* Effect.serviceOption(Db.TransactionContext);
  if (O.isSome(tx)) {
    yield* Effect.logInfo("Running inside transaction");
  }
});
```

#### `SharedDb`

Shared database service implementing `DatabaseService` with the shared domain schema (files, folders, etc.).

**Usage**:
```typescript
import { SharedDb } from "@beep/shared-server";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const db = yield* SharedDb.SharedDb;
  const result = yield* db.makeQuery((execute) =>
    execute((client) => client.query.file.findMany())
  );
});
```

#### `Repo`

Repository factory auto-generating CRUD operations with telemetry, error mapping, and transaction support.

**Signature**:
```typescript
Repo.make<Model, Id>(
  idSchema: EntityIdSchemaInstance,
  model: Model,
  maker?: Effect<CustomMethods, never, DatabaseService>
)
```

**Base CRUD Methods**:
- `insert(data)` — Insert single record, return entity
- `insertVoid(data)` — Insert single record, return void
- `insertManyVoid(data[])` — Bulk insert, return void
- `update(data)` — Update record, return entity
- `updateVoid(data)` — Update record, return void
- `findById(id)` — Find by ID, return `Option<Entity>`
- `delete(id)` — Delete by ID, return void

**Example: Repository with Custom Queries**

```typescript
import { Repo } from "@beep/shared-server";
import { SharedEntityIds } from "@beep/shared-domain";
import { MyEntity } from "./entities";
import { MyDb } from "./db";
import * as Effect from "effect/Effect";

export class MyEntityRepo extends Effect.Service<MyEntityRepo>()("@my-slice/server/repos/MyEntityRepo", {
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

      const findActive = makeQuery((execute) =>
        execute((client) =>
          client.query.myEntity.findMany({
            where: (table, { eq }) => eq(table.status, "active"),
          })
        )
      );

      return { findByOwner, findActive };
    })
  ),
}) {}
```

#### `FileRepo` & `SharedRepos`

Pre-built repositories for shared domain entities (files, folders).

**FileRepo** provides:
- `listPaginated({ userId, offset, limit })` — List files and folders with pagination
- `moveFiles({ fileIds, folderId, userId })` — Move files to a folder (or root)
- `deleteFiles({ fileIds, userId })` — Delete files and return S3 keys
- `getFilesByKeys({ keys, userId })` — Retrieve files by upload keys
- All base CRUD methods from `Repo.make`

**SharedRepos** exports:
- `FileRepo` — File repository service
- `layer` — Combined layer for all shared repos

**Example**:
```typescript
import { FileRepo, SharedRepos } from "@beep/shared-server";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const fileRepo = yield* FileRepo;

  const result = yield* fileRepo.listPaginated({
    userId: SharedEntityIds.UserId.make(),
    offset: 0,
    limit: 20
  });

  yield* Effect.logInfo(`Found ${result.folders.length} folders`);
}).pipe(Effect.provide(SharedRepos.layer));
```

### Email

#### `Email.ResendService`

Effect service wrapping the Resend SDK for transactional email delivery.

**Methods**:
- `send(payload, options?)` — Send email via Resend API

**Example: Send Verification Email**

```typescript
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

#### `Email.renderEmail`

Helper for rendering React Email templates to HTML/text for send operations.

```typescript
import { Email } from "@beep/shared-server/Email";
import { VerificationEmail } from "./templates/verification";

const html = await Email.renderEmail(VerificationEmail, {
  userName: "John Doe",
  verificationUrl: "https://example.com/verify",
});
```

#### `Email.components`

Pre-built React Email templates for common auth flows (exported via `Email` namespace):
- `InvitationEmail` — Organization invitations
- `ResetPasswordEmail` — Password reset requests

**Usage**:
```typescript
import { Email } from "@beep/shared-server";

// Access components through Email namespace
const { InvitationEmail, ResetPasswordEmail } = Email.components;
```

### Upload

#### `UploadService`

S3-backed file service for pre-signed URL generation and object management.

**Methods**:
- `initiateUpload(uploadParams)` — Generate pre-signed PUT URL for client uploads
- `deleteObject(uploadParams)` — Delete object from S3

**Example: Generate Upload URL**

```typescript
import { UploadService } from "@beep/shared-server";
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
  yield* Effect.logInfo("Pre-signed URL generated");
  return url; // Redacted<string>
});
```

**Dependencies**: Requires `S3Service` from `@effect-aws/client-s3` and `CLOUD_AWS_S3_BUCKET_NAME` env var.

### Shared Layer

#### `Live`

Top-level Layer merging all shared infrastructure services for consumption by slice runtimes.

```typescript
import { Live } from "@beep/shared-server/Live";
import * as Layer from "effect/Layer";

// Compose with slice-specific layers
const AppRuntime = Layer.mergeAll(
  Live,
  MySliceDb.Live,
  MySliceRepos.Live
);
```

**Provided Services**:
- `Email.ResendService`
- `Db.PgClient` + `Db.SqlClient` + `Db.PoolService` + `Db.ConnectionContext` + `Db.Logger` + `Db.Reactivity`
- `EncryptionService` (from `@beep/shared-domain/services`)
- `UploadService`

### Redis & Rate Limiting

**Status**: Stub exports awaiting implementation.

- `Redis` — Redis client service (placeholder)
- `RateLimit` — Rate limiting service (placeholder)
- `YJS` — Collaborative editing service (placeholder)

## Effect Patterns

### Import Conventions

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Config from "effect/Config";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
```

### Configuration Best Practices

```typescript
// ✅ Use Effect Config combinators
const dbConfig = Config.nested("DB")(
  Config.all({
    host: Config.nonEmptyString("HOST"),
    port: Config.port("PORT"),
    password: Config.redacted(Config.nonEmptyString("PASSWORD")),
  })
);

// ❌ Never parse env vars manually
const dbHost = process.env.DB_HOST; // WRONG
```

### Secret Handling

```typescript
import * as Redacted from "effect/Redacted";

// Wrap secrets in Config.redacted
const apiKey = Config.redacted(Config.nonEmptyString("API_KEY"));

// Use at boundaries
const revealedKey = Redacted.value(serverEnv.email.resend.apiKey);

// ❌ Never log unwrapped secrets
console.log(Redacted.value(secret)); // DANGEROUS
```

### Error Mapping

```typescript
import { Db } from "@beep/shared-server";

const safeInsert = repo.insert(data).pipe(
  Effect.catchTag("DatabaseError", (error) => {
    if (error.constraint === "unique_email") {
      return Effect.fail(new DuplicateEmailError());
    }
    return Effect.fail(error);
  })
);
```

## Testing

### Override Config for Tests

```typescript
import { Db } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";

const testConnectionLayer = Layer.succeed(Db.ConnectionContext, {
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

### Integration Tests with Testcontainers

```bash
# Requires Docker running
bun run test --filter @beep/db-admin -- --grep "PgClient"
```

## Development Commands

```bash
# Type check
bun run --filter @beep/shared-server check

# Lint
bun run --filter @beep/shared-server lint
bun run --filter @beep/shared-server lint:fix

# Test
bun run --filter @beep/shared-server test

# Circular dependency check
bun run --filter @beep/shared-server lint:circular
```

## Architecture

### Package Structure

```
packages/shared/server/
├── src/
│   ├── index.ts              # Main barrel export
│   ├── ClientEnv.ts          # Browser env validation
│   ├── ServerEnv.ts          # Server env parsing
│   ├── Db.ts                 # Database namespace re-export
│   ├── Email.ts              # Email namespace re-export
│   ├── Repo.ts               # Repository factory re-export
│   ├── Upload.ts             # Upload service re-export
│   ├── Live.ts               # Shared runtime layer
│   ├── db/
│   │   ├── index.ts          # SharedDb barrel
│   │   └── Db/
│   │       ├── index.ts      # SharedDb service barrel
│   │       └── Db.ts         # SharedDb service implementation
│   ├── repos/
│   │   ├── index.ts          # Shared repos barrel
│   │   ├── File.repo.ts      # FileRepo service
│   │   ├── _common.ts        # Shared repo dependencies
│   │   └── repositories.ts   # Combined SharedRepos layer
│   ├── api/                  # API route utilities
│   │   └── callback/
│   │       └── upload-callback.ts
│   └── internal/
│       ├── db/
│       │   ├── index.ts      # Db namespace barrel
│       │   └── pg/
│       │       ├── index.ts          # Pg exports
│       │       ├── PgClient.ts       # Database service factory
│       │       ├── repo.ts           # Repository factory
│       │       ├── errors.ts         # DatabaseError
│       │       ├── formatter.ts      # SQL logger
│       │       ├── types.ts          # Type definitions
│       │       ├── pg-error-enum.ts  # Postgres error codes
│       │       └── services/
│       │           ├── index.ts              # Service exports
│       │           ├── ConnectionConfig.service.ts
│       │           ├── ConnectionPool.service.ts
│       │           └── QueryLogger.service.ts
│       ├── email/
│       │   ├── index.ts              # Email barrel
│       │   ├── Email.ts              # Email namespace
│       │   ├── renderEmail.ts        # Template renderer
│       │   ├── errors.ts             # Email errors
│       │   ├── adapters/
│       │   │   └── resend/
│       │   │       └── service.ts    # Resend integration
│       │   └── components/
│       │       └── auth-emails/
│       │           ├── invitation.tsx
│       │           └── reset-password.tsx
│       ├── upload/
│       │   ├── index.ts              # Upload barrel
│       │   ├── upload.service.ts     # S3 upload service
│       │   ├── upload-callback-route.ts
│       │   ├── error.ts              # Upload errors
│       │   └── utils.ts              # Upload utilities
│       ├── redis/
│       │   └── index.ts              # Redis stub (TBD)
│       ├── ratelimit/
│       │   └── index.ts              # Rate limit stub (TBD)
│       └── yjs/
│           └── index.ts              # YJS stub (TBD)
└── test/
    ├── Dummy.test.ts
    └── upload/
        └── crypto.test.ts
```

### Dependencies

**Peer Dependencies**:
- `effect` — Effect runtime
- `@effect/platform` — Platform abstractions
- `@effect/sql` + `@effect/sql-pg` + `@effect/sql-drizzle` — SQL client
- `drizzle-orm` — ORM toolkit
- `postgres` — PostgreSQL driver
- `@effect-aws/s3` + `@effect-aws/client-s3` — AWS S3 integration
- `resend` — Email delivery
- `@react-email/components` + `@react-email/render` — Email templating
- Workspace packages: `@beep/constants`, `@beep/errors`, `@beep/schema`, `@beep/invariant`, `@beep/utils`, `@beep/identity`, `@beep/shared-domain`

## Usage in Monorepo

### Applications

**`apps/server`**: Composes `Live` with IAM-specific layers in the server runtime to build the core services Layer.

**`apps/web`**: Imports `clientEnv` for runtime URL/domain resolution in Next.js middleware (`src/proxy.ts`) and `serverEnv` for server-side config.

**`apps/notes`**: Uses `SharedDb` and `FileRepo` for file management in the collaborative notes application.

### Feature Slices

**IAM** (`packages/iam/server`):
- Uses `Db.make` to create `IamDb` with IAM-specific Drizzle schema
- Leverages `Repo.make` for `WalletAddressRepo`, `UserRepo`, etc.
- Consumes `serverEnv` for Better Auth configuration

**Documents** (`packages/documents/server`):
- Creates `DocumentsDb` via `Db.make`
- Uses `UploadService` for S3 file operations
- Sources S3 bucket config from `serverEnv.cloud.aws.s3.bucketName`

### Testing

**`@beep/db-admin`**: Constructs testcontainer-backed DB layers using `Db.make` with admin schema for migration validation.

## Contributing

### Adding a New Service

1. Create service implementation in `src/internal/<service>/`
2. Define `Effect.Service` with typed `effect` block
3. Export Layer and types via barrel (`src/<Service>.ts`)
4. Append to `Live` exports in `src/Live.ts`
5. Update `SharedServices` type union in `Live.ts`

### Extending Configuration

1. Add to `ServerConfig` or `ClientEnvSchema`
2. Follow naming convention: `DB_PG_*`, `CLOUD_AWS_S3_*`, etc.
3. Use `Config.redacted` for secrets
4. Document in `AGENTS.md` and update `.env.example`

### Database Utilities

- Add helpers to `Db` namespace or `Repo` module
- Ensure transaction-awareness via `TransactionContext`
- Auto-wire telemetry with `Effect.withSpan`

### Email Templates

- Place in `src/internal/email/components/`
- Export via barrel (`components/index.ts`)
- Document schema in template props

### Upload/Storage

- Extend `UploadService` with new S3 operations (list, copy, etc.)
- Keep all S3 concerns inside this service
- Use `Redacted` for pre-signed URLs

## Related Packages

- `@beep/shared-domain` — Entity models, value objects, and domain services
- `@beep/shared-tables` — Drizzle table factories and multi-tenant schemas
- `@beep/shared-ui` — Shared UI components
- `@beep/constants` — Schema-backed enums and asset paths
- `@beep/schema` — Effect Schema utilities and EntityId factories
- `@beep/errors` — Logging and telemetry infrastructure

## License

MIT
