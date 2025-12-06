# @beep/documents-infra

Infrastructure layer for the documents slice. Provides Effect Layers, repositories, storage services, and HTTP API routers that bind documents domain models to PostgreSQL and S3 without leaking raw clients to application code.

## Contents
- **Database**: `DocumentsDb.DocumentsDb` tag and `DocumentsDb.DocumentsDb.Live` layer for Drizzle-backed PostgreSQL access with documents tables schema.
- **Repositories**: Nine domain-aligned repositories built on `@beep/shared-infra/Repo` conventions:
  - `CommentRepo` — Comment persistence and queries
  - `DiscussionRepo` — Discussion thread operations
  - `DocumentFileRepo` — File attachment management
  - `DocumentRepo` — Core document CRUD, full-text search, archive/restore, publish/unpublish, lock/unlock
  - `DocumentVersionRepo` — Version history tracking
  - `KnowledgeBlockRepo` — Content block persistence
  - `KnowledgePageRepo` — Knowledge page operations
  - `KnowledgeSpaceRepo` — Knowledge space management
  - `PageLinkRepo` — Page link relationship management
- **Repository Layer**: `DocumentsRepos.layer` — Aggregated layer merging all nine repositories for runtime composition.
- **Configuration**: `FilesConfig` tag with helpers to project `@beep/shared-infra/ServerEnv` into storage-ready settings (S3 bucket name).
- **Storage**: `StorageService` — Effect service for S3-based file storage operations with pre-signed URL generation.
- **HTTP API**: `DocumentsApi.Api` — Effect Platform HTTP API definition built on `@beep/documents-domain/DomainApi`.
- **Routers**: HTTP API router implementations with handler logic (e.g., `KnowledgePageRouterLive`).
- **Handlers**: RPC handler layers (`DocumentHandlersLive`, `DiscussionHandlersLive`, `CommentHandlersLive`, `DocumentsHandlersLive`).

## Usage
- Compose layers in runtimes: `Layer.mergeAll(DocumentsDb.DocumentsDb.Live, DocumentsRepos.layer, FilesConfig.Live)`.
- Import via workspace alias: `import { DocumentsDb, DocumentsRepos } from "@beep/documents-infra"`.
- See `packages/documents/infra/AGENTS.md` for surface map, guardrails, and usage snapshots.

## Architecture
Follows the vertical slice layering pattern:
- **Database Layer**: `DocumentsDb.DocumentsDb.Live` provides scoped database access via `Db.make` from `@beep/shared-infra`.
- **Repository Layer**: Each repository extends base CRUD operations from `Repo.make` with domain-specific queries (full-text search, pagination, filtering).
- **Service Layer**: `StorageService` and `FilesConfig` encapsulate external dependencies (S3, environment configuration).
- **API Layer**: HTTP routers and RPC handlers wire domain contracts to repository implementations.

## Development
- `bun run check --filter=@beep/documents-infra`
- `bun run lint --filter=@beep/documents-infra`
- `bun run test --filter=@beep/documents-infra`

## Notes
- All repositories include OpenTelemetry spans for observability (via `Effect.withSpan`).
- Errors are mapped to tagged schemas using `Db.DatabaseError.$match` pattern.
- Never read `process.env` directly; consume configuration through `FilesConfig` tag.
- Keep new API surface aligned with Effect namespace import rules (`import * as Effect from "effect/Effect"`).
- Use `FilesConfig.layerFrom(env)` when tests or CLIs need custom configuration.
