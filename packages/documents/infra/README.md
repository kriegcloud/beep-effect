# @beep/documents-infra

Infrastructure layer for the documents slice. Provides Effect Layers, repositories, and storage services that bind shared domain models to Postgres and S3 without leaking raw clients to application code.

## Contents
- Database: `DocumentsDb.DocumentsDb` tag and `DocumentsDb.DocumentsDb.Live` layer for Drizzle-backed Postgres access.
- Repositories: `DocumentsRepos.layer` and `FileRepo` built on `@beep/core-db/Repo` conventions.
- Configuration: `FilesConfig` tag plus helpers to project `@beep/core-env` into storage-ready settings.
- Storage: `StorageService` / `SignedUrlService` for pre-signed upload URLs.

## Usage
- Compose layers in runtimes, e.g. `Layer.mergeAll(DocumentsDb.DocumentsDb.Live, DocumentsRepos.layer, FilesConfig.Live)`.
- See `packages/documents/infra/AGENTS.md` for surface map, guardrails, and usage snapshots.

## Development
- `bun run check --filter=@beep/documents-infra`
- `bun run lint --filter=@beep/documents-infra`
- `bun run test --filter=@beep/documents-infra`

## Notes
- Avoid direct `process.env` reads; consume config through `FilesConfig`.
- Keep new API surface aligned with tagged errors and Effect namespace import rules.
