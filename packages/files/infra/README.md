# @beep/files-infra

Infrastructure layer for the files slice. Provides Effect Layers, repositories, and storage services that bind shared domain models to Postgres and S3 without leaking raw clients to application code.

## Contents
- Database: `FilesDb.FilesDb` tag and `FilesDb.FilesDb.Live` layer for Drizzle-backed Postgres access.
- Repositories: `FilesRepos.layer` and `FileRepo` built on `@beep/core-db/Repo` conventions.
- Configuration: `FilesConfig` tag plus helpers to project `@beep/core-env` into storage-ready settings.
- Storage: `StorageService` / `SignedUrlService` for pre-signed upload URLs.

## Usage
- Compose layers in runtimes, e.g. `Layer.mergeAll(FilesDb.FilesDb.Live, FilesRepos.layer, FilesConfig.Live)`.
- See `packages/files/infra/AGENTS.md` for surface map, guardrails, and usage snapshots.

## Development
- `bun run check --filter=@beep/files-infra`
- `bun run lint --filter=@beep/files-infra`
- `bun run test --filter=@beep/files-infra`

## Notes
- Avoid direct `process.env` reads; consume config through `FilesConfig`.
- Keep new API surface aligned with tagged errors and Effect namespace import rules.
