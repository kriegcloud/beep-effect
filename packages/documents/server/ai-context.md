---
path: packages/documents/server
summary: Infrastructure layer for documents slice - repositories, S3 storage, file processing, RPC handlers
tags: [documents, server, effect, repository, s3, rpc, handlers]
---

# @beep/documents-server

Infrastructure layer wiring `@beep/documents-domain` models to database services via repositories. Provides composable Effect Layers (`DocumentsDb.layer`, `DocumentsRepos.layer`) for runtime integration, S3-based file storage via `SignedUrlService`, and file metadata extraction services.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
|   DocumentsDb     | --> |   Repositories    | --> |   RPC Handlers    |
|-------------------|     |-------------------|     |-------------------|
| Db.layer          |     | DocumentRepo      |     | DocumentHandlers  |
| makeQuery helper  |     | DocumentVersionRepo|    | DiscussionHandlers|
|-------------------|     | DocumentFileRepo  |     | CommentHandlers   |
                          | DiscussionRepo    |     |-------------------|
                          | CommentRepo       |
                          |-------------------|
                                   |
                                   v
|-------------------|     |-------------------|
| SignedUrlService  |     |  File Services    |
|-------------------|     |-------------------|
| S3 upload/download|     | ExifToolService   |
| presigned URLs    |     | PdfMetadataService|
|-------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/db/Db/Db.ts` | DocumentsDb context tag and layer |
| `src/db/repos/Document.repo.ts` | Document CRUD and queries |
| `src/db/repos/DocumentVersion.repo.ts` | Version history operations |
| `src/db/repos/DocumentFile.repo.ts` | File attachment management |
| `src/db/repos/Discussion.repo.ts` | Discussion thread operations |
| `src/db/repos/Comment.repo.ts` | Comment persistence |
| `src/db/repositories.ts` | Aggregated DocumentsRepos.layer |
| `src/SignedUrlService.ts` | S3 presigned URL generation |
| `src/files/ExifToolService.ts` | Image EXIF metadata extraction |
| `src/files/PdfMetadataService.ts` | PDF metadata extraction |
| `src/handlers/` | Effect RPC request handlers |

## Usage Patterns

### Repository Layer Composition

```typescript
import * as Layer from "effect/Layer";
import { DocumentsDb } from "@beep/documents-server/db";
import { DocumentRepo } from "@beep/documents-server";
import * as PgClient from "@effect/sql-pg/PgClient";

const makeTestLayer = (config: PgClient.Config) =>
  Layer.mergeAll(
    PgClient.layer(config),
    DocumentsDb.layer,
    DocumentRepo.Default
  );
```

### Custom Repository Queries

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { DocumentsDb } from "@beep/documents-server/db";
import { DbClient } from "@beep/shared-server";

const listByOrganization = (organizationId: string, limit = 50) =>
  Effect.gen(function* () {
    const { makeQuery } = yield* DocumentsDb.Db;
    return yield* makeQuery((execute) =>
      execute((client) =>
        client.query.document.findMany({
          where: (table, { eq, isNull, and }) =>
            and(eq(table.organizationId, organizationId), isNull(table.deletedAt)),
          orderBy: (table, { desc }) => [desc(table.updatedAt)],
          limit,
        })
      ).pipe(Effect.mapError(DbClient.DatabaseError.$match))
    );
  });
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| DbRepo.make factory | Inherits telemetry and error mapping from shared patterns |
| SignedUrlService abstraction | Encapsulates S3 operations for testability |
| Memoizable layers | Layer.mergeAll ensures runtime caching works correctly |
| Separate file services export | Isolates optional dependencies (exiftool, pdf-lib) |

## Dependencies

**Internal**: `@beep/identity`, `@beep/schema`, `@beep/shared-domain`, `@beep/documents-domain`, `@beep/shared-env`, `@beep/shared-server`, `@beep/documents-tables`

**External**: `effect`, `@effect/platform`, `@effect/platform-bun`, `@effect/sql`, `@effect/sql-drizzle`, `@effect/sql-pg`, `@effect-aws/client-s3`, `@effect-aws/s3`, `drizzle-orm`, `@uswriting/exiftool`, `pdf-lib`

## Related

- **AGENTS.md** - Detailed contributor guidance and repository patterns
- **@beep/documents-domain** - Domain models these repositories persist
- **@beep/documents-tables** - Drizzle schemas used by repositories
- **packages/runtime/server** - Runtime layer composition consuming these exports
