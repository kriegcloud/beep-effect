# @beep/workspaces-server

Infrastructure layer for the documents slice, providing database access, repositories, file processing services, and HTTP handlers that connect documents domain models to PostgreSQL and S3.

## Purpose

This package implements the infrastructure layer for the documents vertical slice, bridging domain models from `@beep/workspaces-domain` with concrete persistence (PostgreSQL via Drizzle), storage (S3), and file processing capabilities. It provides Effect Layers that can be composed into application runtimes without leaking raw database clients or external service details to domain or application code.

The package follows vertical slice architecture, implementing the server layer that adapts domain models to external systems while maintaining Effect's functional patterns for error handling, dependency injection, and observability.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/workspaces-server": "workspace:*"
```

## Key Exports

### Database Layer
| Export | Description |
|--------|-------------|
| `DocumentsDb.Db` | Context tag for documents database access |
| `DocumentsDb.Db.layer` | Database layer with documents tables schema (requires `DbClient.SliceDbRequirements`) |

### Repositories
| Export | Description |
|--------|-------------|
| `DocumentsRepos.layer` | Aggregated layer providing all five repositories |
| `CommentRepo` | Comment persistence and queries |
| `DiscussionRepo` | Discussion thread operations |
| `DocumentFileRepo` | File attachment management |
| `DocumentRepo` | Document CRUD and organization-scoped queries |
| `DocumentVersionRepo` | Version history tracking |

### File Processing Services
Available via main export and `@beep/workspaces-server/files`:

| Export | Description |
|--------|-------------|
| `ExifToolService` | EXIF metadata extraction from images |
| `PdfMetadataService` | PDF metadata extraction and processing |
| `pdfMetadataServiceEffect` | Effect for PDF metadata service |

### RPC Handlers
Available via wildcard export `@beep/workspaces-server/handlers`:

| Export | Description |
|--------|-------------|
| `DocumentsHandlersLive` | Combined handler layer for all documents RPC endpoints |
| `DocumentHandlersLive` | Document RPC handlers |
| `DiscussionHandlersLive` | Discussion RPC handlers |
| `CommentHandlersLive` | Comment RPC handlers |

Note: The handlers export works via the package.json wildcard export `./*` mapping to `./src/*.ts`.

### Internal Services
Available via wildcard export (e.g., `@beep/workspaces-server/SignedUrlService`):

| Export | Description |
|--------|-------------|
| `StorageService` | S3 file upload with pre-signed URLs (`@beep/workspaces-server/SignedUrlService`) |

## Usage

### Basic Repository Access

```typescript
import { DocumentsDb, DocumentsRepos, DocumentRepo } from "@beep/workspaces-server";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const program = Effect.gen(function* () {
  const repo = yield* DocumentRepo;
  const documentId = DocumentsEntityIds.DocumentId.make();

  const doc = yield* repo.findByIdOrFail(documentId);
  return doc;
});

// Provide layers from shared-server infrastructure
const runtime = Layer.mergeAll(
  DocumentsDb.Db.layer,
  DocumentsRepos.layer
);
```

### Document Queries

```typescript
import { DocumentRepo } from "@beep/workspaces-server";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const queryDocuments = Effect.gen(function* () {
  const repo = yield* DocumentRepo;
  const documentId = DocumentsEntityIds.DocumentId.make();

  // DocumentRepo provides domain-specific query methods
  const doc = yield* repo.findByIdOrFail(documentId);

  return doc;
});
```

### File Processing with EXIF Extraction

```typescript
import { ExifToolService } from "@beep/workspaces-server/files";
import { FileSystem } from "@effect/platform";
import * as Effect from "effect/Effect";

const extractMetadata = Effect.gen(function* () {
  const exifTool = yield* ExifToolService;
  const fs = yield* FileSystem.FileSystem;

  const imageData = yield* fs.readFile("/path/to/image.jpg");
  const metadata = yield* exifTool.extractMetadata(imageData);

  return metadata;
});
```

### Using RPC Handlers

```typescript
import { DocumentsHandlersLive } from "@beep/workspaces-server/handlers";
import { DocumentsRepos, DocumentsDb } from "@beep/workspaces-server";
import * as Layer from "effect/Layer";

// Compose handlers with their dependencies
const handlerLayer = DocumentsHandlersLive.pipe(
  Layer.provide(Layer.mergeAll(DocumentsRepos.layer, DocumentsDb.Db.layer))
);
```

### Composing All Layers for Runtime

```typescript
import { DocumentsDb, DocumentsRepos } from "@beep/workspaces-server";
import { DocumentsHandlersLive } from "@beep/workspaces-server/handlers";
import * as Layer from "effect/Layer";

// Complete documents infrastructure layer
const documentsInfraLayer = Layer.mergeAll(
  DocumentsDb.Db.layer,
  DocumentsRepos.layer,
  DocumentsHandlersLive
);
```

## Dependencies

### Core Dependencies
| Package | Purpose |
|---------|---------|
| `effect` | Effect runtime and core abstractions |
| `@effect/platform` | Platform abstractions for file system, HTTP |
| `@effect/sql` | SQL client abstractions |
| `@effect/sql-drizzle` | Drizzle ORM integration |
| `@effect/sql-pg` | PostgreSQL client |
| `drizzle-orm` | Type-safe SQL query builder |

### Internal Dependencies
| Package | Purpose |
|---------|---------|
| `@beep/workspaces-domain` | Domain entities and business logic |
| `@beep/workspaces-tables` | Drizzle table schemas |
| `@beep/shared-server` | Shared infrastructure (DbClient) |
| `@beep/shared-domain` | Shared entity IDs, models, and DbRepo factory |
| `@beep/shared-env` | Server environment configuration (serverEnv) |
| `@beep/shared-tables` | Shared table utilities and factories |
| `@beep/schema` | EntityId factories and utilities |
| `@beep/errors` | Error handling and logging |
| `@beep/invariant` | Assertion contracts |
| `@beep/utils` | Utility functions |
| `@beep/constants` | Shared constants |
| `@beep/identity` | Package identity utilities |

### External Service Dependencies
| Package | Purpose |
|---------|---------|
| `@effect-aws/s3` | Effect-wrapped AWS S3 operations |
| `@effect-aws/client-s3` | AWS SDK S3 client for Effect |
| `@uswriting/exiftool` | EXIF metadata extraction from images |
| `pdf-lib` | PDF document parsing and metadata extraction |
| `@effect/cluster` | Distributed workflow support |
| `@effect/workflow` | Workflow orchestration |

## Integration

This package integrates with:
- **Server Runtime** (`@beep/runtime-server`) — Provides database and repository layers to the server-side ManagedRuntime
- **Documents Domain** (`@beep/workspaces-domain`) — Implements persistence for domain entities
- **Documents Tables** (`@beep/workspaces-tables`) — Uses Drizzle schemas for database operations
- **Shared Server** (`@beep/shared-server`) — Shared server infrastructure (`DbClient.make`, `DbRepo.make`, Email, Upload)
- **Shared Domain** (`@beep/shared-domain`) — Shared entity IDs, errors, and type contracts (including `DbRepo` types)
- **DB Admin** (`@beep/db-admin`) — Migration validation and test container setup

## Architecture

Follows the vertical slice layering pattern with clear separation of concerns:

### Database Layer
`DocumentsDb.Db.layer` provides scoped database access via `DbClient.make` from `@beep/shared-server`, automatically registering the documents tables schema from `@beep/workspaces-tables`. This layer handles:
- Database connection management
- Query execution with proper scoping
- Transaction support
- Schema registration

### Repository Layer
Each repository extends base CRUD operations from `DbRepo.make` (`@beep/shared-server/factories`) with domain-specific queries:
- **CommentRepo** — Comment CRUD and queries
- **DiscussionRepo** — Discussion thread management
- **DocumentFileRepo** — File attachment relationships
- **DocumentRepo** — Document CRUD and organization-scoped queries
- **DocumentVersionRepo** — Version history tracking

All repositories include:
- OpenTelemetry spans for observability via `Effect.withSpan`
- Tagged error handling through Effect's error system
- Type-safe SQL queries through Drizzle ORM
- Multi-tenant organization scoping where applicable

### File Processing Layer
Specialized services for document metadata extraction:
- **ExifToolService** — EXIF metadata extraction from images (JPEG, PNG, etc.)
- **PdfMetadataService** — PDF document metadata and structure analysis

### RPC Handler Layer
RPC handlers implement Effect RPC endpoints for documents operations:
- **DocumentHandlersLive** — Document RPC request handlers
- **DiscussionHandlersLive** — Discussion RPC request handlers
- **CommentHandlersLive** — Comment RPC request handlers
- **DocumentsHandlersLive** — Combined layer merging all handlers

Handlers provide request validation, business logic coordination, and error mapping.

## Development

```bash
# Type check
bun run --filter @beep/workspaces-server check

# Lint
bun run --filter @beep/workspaces-server lint

# Fix lint issues
bun run --filter @beep/workspaces-server lint:fix

# Run tests
bun run --filter @beep/workspaces-server test

# Build
bun run --filter @beep/workspaces-server build
```

## Notes

### Observability
- All repositories use `Effect.withSpan` for OpenTelemetry tracing
- Database operations are instrumented with telemetry spans
- Structured logging via `Effect.log*` methods

### Error Handling
- All errors follow Effect's tagged error pattern from `effect/Schema`
- Repositories propagate errors through the Effect type system
- Database errors are handled via `DbError` from `@beep/shared-domain`

### Configuration
- S3 configuration is accessed via `serverEnv` from `@beep/shared-env/ServerEnv`
- Storage service reads `serverEnv.cloud.aws.s3.bucketName` for S3 operations
- Never read `process.env` directly; always use typed environment access from `@beep/shared-env`

### Import Conventions
- Follow Effect namespace import conventions: `import * as Effect from "effect/Effect"`
- Use single-letter aliases for frequently used modules: `import * as A from "effect/Array"`
- Import from package exports: `@beep/workspaces-server`, `@beep/workspaces-server/files`, `@beep/workspaces-server/handlers`

### Testing
- Use `DocumentsDb.Db.layer` in test environments with proper database setup
- Repositories can be tested in isolation with mock dependencies
- File processing services can be provided via their respective layers

### Package Exports
The package provides multiple export paths defined in `package.json`:
- **Main** (`@beep/workspaces-server`) — DocumentsDb, DocumentsRepos, file services (ExifToolService, PdfMetadataService)
- **Files** (`@beep/workspaces-server/files`) — Explicit export for file processing services
- **Handlers** (`@beep/workspaces-server/handlers`) — RPC handler layers (via wildcard `.*` export)
- **SignedUrlService** (`@beep/workspaces-server/SignedUrlService`) — StorageService (via wildcard `.*` export)
- **Database** (`@beep/workspaces-server/db`) — Re-export of DocumentsDb (same as main export)
