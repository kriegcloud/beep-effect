# @beep/shared-server

Foundational infrastructure services for the beep-effect monorepo, providing Effect-first abstractions for database access, repository factories, email delivery, file uploads, and RPC handlers.

## Purpose

`@beep/shared-server` consolidates cross-cutting server infrastructure concerns into a unified service layer. It provides:
- **Database Client Factory**: PostgreSQL client with Drizzle ORM, transaction support, and telemetry
- **Repository Factory**: Auto-generated CRUD operations with error mapping and observability
- **Email Service**: Resend integration with React Email template rendering
- **Upload Service**: S3-backed file operations with pre-signed URL generation
- **RPC Handlers**: Shared server-side RPC implementations for file management
- **Job Utilities**: Scheduled cleanup tasks for upload sessions
- **Shared Repositories**: Pre-built repositories for File, Folder, and UploadSession entities

This package sits in the infrastructure layer and is consumed by vertical slices (IAM, Documents) and applications (apps/server, apps/web). Configuration management has been moved to `@beep/shared-env`.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/shared-server": "workspace:*"
```

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| `Db` | Namespace | Database client utilities (`make`, `layer`, `PgClient`, `TransactionContext`, etc.) |
| `SharedDb` | Service | Shared database service with file/folder/upload session schema |
| `Repo` | Namespace | Repository factory (`make`) with base CRUD operations |
| `FileRepo` | Service | File repository with pagination, move, delete, key lookup |
| `UploadSessionRepo` | Service | Upload session repository with expiration cleanup |
| `SharedRepos` | Namespace | Combined shared repositories (includes `FileRepo`, `FolderRepo`, `UploadSessionRepo`) |
| `Email` | Namespace | Email service (`ResendService`, `components`) |
| `Upload` | Namespace | Upload service with S3 pre-signed URLs |
| `SharedServerRpcs` | Namespace | RPC handlers layer for file operations |

**Note**: `FolderRepo` is available through the `SharedRepos` namespace export, not as a top-level export.

## Usage

### Database

#### Creating a Slice-Specific Database Layer

```typescript
import { Db } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as mySchema from "./schema"; // Drizzle tables

type MySchema = typeof mySchema;
type MyDb = Db.Shape<MySchema>;

export class MyDb extends Context.Tag("MyDb")<MyDb, MyDb>() {
  static readonly Live: Layer.Layer<MyDb, never, Db.PgClientServices> = Layer.scoped(
    MyDb,
    Db.make({ schema: mySchema })
  );
}
```

#### Using SharedDb

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

#### Transaction Support

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

### Repositories

#### Creating a Repository with Custom Queries

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

**Base CRUD Methods** provided by `Repo.make`:
- `insert(data)` — Insert single record, return entity
- `insertVoid(data)` — Insert single record, return void
- `insertManyVoid(data[])` — Bulk insert, return void
- `update(data)` — Update record, return entity
- `updateVoid(data)` — Update record, return void
- `findById(id)` — Find by ID, return `Option<Entity>`
- `delete(id)` — Delete by ID, return void

#### Using Shared Repositories

```typescript
import { FileRepo, UploadSessionRepo, SharedRepos } from "@beep/shared-server";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const fileRepo = yield* FileRepo;
  // FolderRepo is available via SharedRepos namespace
  const folderRepo = yield* SharedRepos.FolderRepo;

  const files = yield* fileRepo.listPaginated({
    userId: SharedEntityIds.UserId.make(),
    offset: 0,
    limit: 20
  });

  yield* Effect.logInfo(`Found ${files.folders.length} folders`);
}).pipe(Effect.provide(SharedRepos.layer));
```

**FileRepo** provides:
- `listPaginated({ userId, offset, limit })` — List files and folders with pagination
- `moveFiles({ fileIds, folderId, userId })` — Move files to a folder (or root)
- `deleteFiles({ fileIds, userId })` — Delete files and return S3 keys
- `getFilesByKeys({ keys, userId })` — Retrieve files by upload keys
- All base CRUD methods from `Repo.make`

**SharedRepos.FolderRepo** provides:
- All base CRUD methods from `Repo.make`

**UploadSessionRepo** provides:
- `deleteExpired()` — Delete expired upload sessions
- All base CRUD methods from `Repo.make`

### Email

#### Sending Transactional Email

```typescript
import { Email } from "@beep/shared-server";
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

#### Using Email Templates

```typescript
import { Email } from "@beep/shared-server";

// Access pre-built templates
const { InvitationEmail, ResetPasswordEmail } = Email.components;
```

### Upload

#### Generating Pre-Signed Upload URLs

```typescript
import * as Upload from "@beep/shared-server/services/Upload.service";
import { File } from "@beep/shared-domain/entities";
import * as Effect from "effect/Effect";

const getUploadUrl = Effect.gen(function* () {
  const uploadService = yield* Upload.Service;
  const uploadPath: File.UploadKey.Encoded = {
    env: "development",
    fileId: "file_123",
    organizationType: "team",
    organizationId: "org_456",
    entityKind: "document",
  };
  const url = yield* uploadService.initiateUpload({
    ...uploadPath,
    organization: { id: "org_456", type: "team" }
  });
  yield* Effect.logInfo("Pre-signed URL generated");
  return url; // Redacted<string>
});
```

**Dependencies**: Requires `S3Service` from `@effect-aws/client-s3` and configuration from `@beep/shared-env`.

### RPC Handlers

```typescript
import { SharedServerRpcs } from "@beep/shared-server";
import * as Layer from "effect/Layer";

// Compose with slice-specific RPC layers
const AppRpcLayer = Layer.mergeAll(
  SharedServerRpcs.layer,
  MySliceRpcs.layer
);
```

**Provided RPC handlers**:
- `files_listFiles` — List files and folders with pagination
- `files_createFolder` — Create a new folder
- `files_moveFiles` — Move files to a folder
- `files_deleteFiles` — Delete files
- `files_deleteFolders` — Delete folders
- `files_getFilesByKeys` — Retrieve files by upload keys
- `files_initiateUpload` — Generate pre-signed upload URL
- `health` — Health check endpoint
- `eventStream` — Server-sent events hub

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

### Override Database Connection for Tests

```typescript
import { Db } from "@beep/shared-server/Db";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";

const testConnectionLayer = Layer.succeed(Db.ConnectionConfig, {
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
bun run test --filter @beep/shared-server test
bun run test --filter @beep/db-admin -- --grep "PgClient"
```

## Development

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
│   ├── Db.ts                 # Database namespace re-export
│   ├── Email.ts              # Email namespace re-export
│   ├── Repo.ts               # Repository factory re-export
│   ├── db/
│   │   ├── index.ts          # SharedDb barrel
│   │   └── Db/
│   │       ├── index.ts      # SharedDb service barrel
│   │       └── Db.ts         # SharedDb service implementation
│   ├── repos/
│   │   ├── index.ts          # Shared repos barrel (FileRepo, UploadSessionRepo)
│   │   ├── File.repo.ts      # FileRepo service
│   │   ├── Folder.repo.ts    # FolderRepo service (via SharedRepos)
│   │   ├── UploadSession.repo.ts  # UploadSessionRepo service
│   │   ├── _common.ts        # Shared repo dependencies
│   │   └── repositories.ts   # Combined SharedRepos namespace
│   ├── services/
│   │   ├── index.ts          # Services barrel
│   │   └── Upload.service.ts # Upload service
│   ├── rpc/
│   │   ├── index.ts          # RPC barrel (SharedServerRpcs)
│   │   ├── _rpcs.ts          # Combined RPC layer
│   │   └── v1/               # Version 1 RPC handlers
│   │       ├── _rpcs.ts      # V1 RPC layer composition
│   │       ├── health.ts     # Health check handler
│   │       ├── event-stream-hub.ts  # SSE hub
│   │       └── files/        # File management RPCs
│   ├── jobs/
│   │   └── cleanup-upload-sessions.ts  # Scheduled cleanup
│   └── internal/
│       ├── db/
│       │   ├── index.ts      # Db and Repo namespace exports
│       │   └── pg/
│       │       ├── index.ts          # Pg exports
│       │       ├── PgClient.ts       # Database service factory
│       │       ├── repo.ts           # Repository factory
│       │       ├── errors.ts         # DatabaseError
│       │       ├── formatter.ts      # SQL logger
│       │       ├── types.ts          # Type definitions
│       │       ├── pg-error-enum.ts  # Postgres error codes
│       │       └── services/
│       │           ├── ConnectionConfig.service.ts
│       │           ├── ConnectionPool.service.ts
│       │           └── QueryLogger.service.ts
│       └── email/
│           ├── index.ts              # Email namespace export
│           ├── Email.ts              # Email barrel
│           ├── adapters/
│           │   ├── index.ts
│           │   └── resend/
│           │       ├── index.ts
│           │       ├── service.ts    # Resend integration
│           │       └── errors.ts     # Email errors
│           └── components/
│               ├── index.ts
│               └── auth-emails/
│                   ├── index.ts
│                   ├── invitation.tsx
│                   └── reset-password.tsx
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
- Workspace packages: `@beep/constants`, `@beep/errors`, `@beep/schema`, `@beep/invariant`, `@beep/utils`, `@beep/identity`, `@beep/shared-domain`, `@beep/shared-env`

## Integration

### Applications

**`apps/server`**: Composes shared infrastructure layers with IAM-specific layers in the server runtime.

**`apps/web`**: Uses shared RPC handlers for file management operations.

### Feature Slices

**IAM** (`packages/iam/server`):
- Uses `Db.make` to create `IamDb` with IAM-specific Drizzle schema
- Leverages `Repo.make` for `WalletAddressRepo`, `UserRepo`, etc.

**Documents** (`packages/documents/server`):
- Creates `DocumentsDb` via `Db.make`
- Uses `Upload.Service` for S3 file operations

### Testing

**`@beep/db-admin`**: Constructs testcontainer-backed DB layers using `Db.make` with admin schema for migration validation.

## Contributing

### Adding a New Service

1. Create service implementation in `src/internal/<service>/` or `src/services/`
2. Define `Effect.Service` with typed `effect` block
3. Export service via barrel file
4. Update main index exports in `src/index.ts`
5. Document service in this README with usage examples

### Configuration

**Configuration is managed in `@beep/shared-env`**, not this package.

- Server configuration: See `packages/shared/env/README.md`
- To add new config: Update `@beep/shared-env` schemas
- Services consume config via dependency injection

### Database Utilities

- Add helpers to `Db` namespace (`src/internal/db/pg/`) or `Repo` module
- Ensure transaction-awareness via `TransactionContext`
- Auto-wire telemetry with `Effect.withSpan`
- Follow Effect patterns: use `Effect.gen`, avoid `async/await`

### Repository Factories

- Create new repos in `src/repos/<Entity>.repo.ts`
- Use `Repo.make(idSchema, model, maker)` pattern
- Export via `src/repos/index.ts` if top-level, or via namespace
- Add custom queries in the `maker` Effect block
- Update `SharedRepos` if adding shared entity repos

### Email Templates

- Place in `src/internal/email/components/`
- Export via barrel (`components/index.ts`)
- Document schema in template props
- Use React Email components for consistency

### Upload/Storage

- Extend `Upload.Service` in `src/services/Upload.service.ts`
- Add new S3 operations (list, copy, etc.) as needed
- Keep all S3 concerns inside this service
- Use `Redacted<string>` for pre-signed URLs and sensitive data

## Related Packages

- `@beep/shared-env` — Environment configuration (serverEnv, clientEnv)
- `@beep/shared-domain` — Entity models, value objects, and domain services
- `@beep/shared-tables` — Drizzle table factories and multi-tenant schemas
- `@beep/shared-client` — Client-side services and utilities
- `@beep/shared-ui` — Shared UI components
- `@beep/constants` — Schema-backed enums and asset paths
- `@beep/schema` — Effect Schema utilities and EntityId factories
- `@beep/errors` — Logging and telemetry infrastructure

## Notes

- **Configuration Migration**: `serverEnv` and `clientEnv` have been moved to `@beep/shared-env`. This package consumes configuration via dependency injection.
- **Effect-First**: All database operations, repository methods, and service calls use Effect for error handling and observability.
- **Telemetry**: Repository factories auto-generate telemetry spans and structured logging via `Effect.withSpan`.
- **Email Rendering**: Email templates use React Email components for consistent HTML rendering.
- **S3 Uploads**: Upload service generates time-limited pre-signed URLs for secure client-side uploads.
- **RPC Handlers**: Shared RPC handlers follow Effect RPC patterns with middleware support for authentication and authorization.
- **Repository Access**: `FolderRepo` is exported via `SharedRepos` namespace, not as a top-level export. Use `SharedRepos.FolderRepo` to access it.

## License

MIT
