# @beep/documents-infra

Infrastructure layer for the documents slice, providing database access, repositories, file processing services, and HTTP API handlers that connect documents domain models to PostgreSQL and S3.

## Purpose

This package implements the infrastructure layer for the documents vertical slice, bridging domain models from `@beep/documents-domain` with concrete persistence (PostgreSQL via Drizzle), storage (S3), and file processing capabilities. It provides Effect Layers that can be composed into application runtimes without leaking raw database clients or external service details to domain or application code.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/documents-infra": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `DocumentsDb.DocumentsDb` | Context tag for documents database access |
| `DocumentsDb.DocumentsDb.Live` | Database layer with documents tables schema |
| `DocumentsRepos.layer` | Aggregated layer providing all nine repositories |
| `CommentRepo` | Comment persistence and queries |
| `DiscussionRepo` | Discussion thread operations |
| `DocumentFileRepo` | File attachment management |
| `DocumentRepo` | Document CRUD with full-text search |
| `DocumentVersionRepo` | Version history tracking |
| `KnowledgeBlockRepo` | Content block persistence |
| `KnowledgePageRepo` | Knowledge page operations |
| `KnowledgeSpaceRepo` | Knowledge space management |
| `PageLinkRepo` | Page link relationship management |
| `FilesConfig` | Configuration tag for S3 storage settings |
| `StorageService` | S3 file upload with pre-signed URLs |
| `ExifToolService` | EXIF metadata extraction from images |
| `PdfMetadataService` | PDF metadata extraction and processing |
| `Api` | HTTP API definition for documents endpoints |
| `DocumentsHandlersLive` | Combined RPC handler layer |

## Usage

### Basic Repository Access

```typescript
import { DocumentRepo, DocumentsDb, DocumentsRepos } from "@beep/documents-infra";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const program = Effect.gen(function* () {
  const repo = yield* DocumentRepo;
  const documentId = DocumentsEntityIds.DocumentId.make();

  const doc = yield* repo.findByIdOrFail(documentId);
  return doc;
}).pipe(
  Effect.provide(DocumentsRepos.layer),
  Effect.provide(DocumentsDb.DocumentsDb.Live)
);
```

### Full-Text Search

```typescript
import { DocumentRepo } from "@beep/documents-infra";
import { SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

const searchDocuments = Effect.gen(function* () {
  const repo = yield* DocumentRepo;
  const orgId = SharedEntityIds.OrganizationId.make();

  const results = yield* repo.search({
    query: "effect patterns",
    organizationId: orgId,
    limit: 10,
    offset: 0
  });

  return results;
});
```

### File Processing with EXIF Extraction

```typescript
import { ExifToolService } from "@beep/documents-infra/files";
import * as Effect from "effect/Effect";
import * as FileSystem from "@effect/platform/FileSystem";

const extractMetadata = Effect.gen(function* () {
  const exifTool = yield* ExifToolService;
  const fs = yield* FileSystem.FileSystem;

  const imageBuffer = yield* fs.readFile("/path/to/image.jpg");
  const metadata = yield* exifTool.extractMetadata(imageBuffer);

  return metadata;
});
```

### Storage Service for S3 Uploads

```typescript
import { StorageService, FilesConfig } from "@beep/documents-infra";
import * as Effect from "effect/Effect";

const initiateFileUpload = Effect.gen(function* () {
  const storage = yield* StorageService;

  // Get pre-signed upload URL
  const uploadUrl = yield* storage.initiateUpload();

  return uploadUrl;
}).pipe(Effect.provide(FilesConfig.Live));
```

### Composing All Layers for Runtime

```typescript
import { DocumentsDb, DocumentsRepos, FilesConfig } from "@beep/documents-infra";
import * as Layer from "effect/Layer";

const documentsInfraLayer = Layer.mergeAll(
  DocumentsDb.DocumentsDb.Live,
  DocumentsRepos.layer,
  FilesConfig.Live
);
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/documents-domain` | Domain entities and business logic |
| `@beep/documents-tables` | Drizzle table schemas |
| `@beep/shared-infra` | Shared infrastructure (Db, Repo factories) |
| `@beep/shared-domain` | Shared entity IDs and models |
| `@beep/schema` | EntityId factories and utilities |
| `@effect/sql` | SQL client abstractions |
| `@effect/sql-drizzle` | Drizzle ORM integration |
| `@effect-aws/s3` | AWS S3 client services |
| `@uswriting/exiftool` | EXIF metadata extraction |
| `pdf-lib` | PDF document processing |

## Integration

This package integrates with:
- **Server Runtime** (`packages/runtime/server`) — Provides database and repository layers to the server-side ManagedRuntime
- **Documents Domain** (`packages/documents/domain`) — Implements persistence for domain entities
- **Documents Tables** (`packages/documents/tables`) — Uses Drizzle schemas for database operations
- **Shared Infra** (`packages/shared/infra`) — Built on `Db.make` and `Repo.make` patterns
- **DB Admin** (`packages/_internal/db-admin`) — Migration validation and test container setup

## Architecture

Follows the vertical slice layering pattern:

### Database Layer
`DocumentsDb.DocumentsDb.Live` provides scoped database access via `Db.make` from `@beep/shared-infra`, automatically registering the documents tables schema.

### Repository Layer
Each repository extends base CRUD operations from `Repo.make` with domain-specific queries:
- Full-text search with weighted ranking (title > content)
- Pagination and filtering
- Archive/restore operations
- Publish/unpublish workflows
- Lock/unlock mechanisms

All repositories include OpenTelemetry spans for observability via `Effect.withSpan`.

### Service Layer
- **FilesConfig** — Projects `serverEnv` into S3 bucket configuration
- **StorageService** — Wraps S3 operations with pre-signed URL generation
- **ExifToolService** — Extracts and processes image metadata
- **PdfMetadataService** — Handles PDF document metadata

### API Layer
HTTP routers and RPC handlers connect domain contracts to repository implementations, providing endpoint definitions and request handling logic.

## Development

```bash
# Type check
bun run --filter @beep/documents-infra check

# Lint
bun run --filter @beep/documents-infra lint

# Fix lint issues
bun run --filter @beep/documents-infra lint:fix

# Run tests
bun run --filter @beep/documents-infra test

# Build
bun run --filter @beep/documents-infra build
```

## Notes

- All repositories use `Effect.withSpan` for OpenTelemetry tracing
- Database errors are mapped to tagged schemas using the `Db.DatabaseError.$match` pattern
- Never read `process.env` directly; consume configuration through the `FilesConfig` tag
- Use `FilesConfig.layerFrom(env)` when tests or CLIs need custom configuration
- Follow Effect namespace import conventions: `import * as Effect from "effect/Effect"`
- The `DocumentRepo` provides PostgreSQL full-text search using `websearch_to_tsquery` with weighted ranking
- File processing services (`ExifToolService`, `PdfMetadataService`) are available via the `/files` export path
- The combined `DocumentsHandlersLive` layer merges all RPC handlers for easy runtime composition
