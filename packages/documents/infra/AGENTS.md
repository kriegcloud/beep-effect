# AGENTS.md — `@beep/documents-infra`

## Purpose & Fit
- Provides the infrastructure layer for the documents slice, wiring domain models from `@beep/documents-domain` to database services via repositories.
- Exposes ready-to-merge Layers (`DocumentsDb.DocumentsDb.Live`, `DocumentsRepos.layer`) that slot into app runtimes such as `packages/runtime/server`.
- Bridges configuration from `@beep/shared-infra` to document-specific services.
- Establishes repo contracts backed by `@beep/shared-infra/Repo`, safeguarding tagged error handling and telemetry conventions for persistence operations.

## Surface Map
- **`DocumentsDb.DocumentsDb.Live`** — Scoped database layer built on `Db.make` with documents tables schema (`packages/documents/infra/src/db/Db.ts`).
- **`DocumentsDb.DocumentsDb`** — Context tag to access the shared database connection and migrations.
- **`DocumentsRepos.layer`** — Aggregated layer exporting all document repositories (`packages/documents/infra/src/adapters/repositories.ts`).
- **Repository Services** — Built via `Repo.make`, providing type-safe database operations:
  - `CommentRepo` — Comment persistence and queries.
  - `DiscussionRepo` — Discussion thread operations.
  - `DocumentFileRepo` — File attachment management.
  - `DocumentRepo` — Core document CRUD and queries.
  - `DocumentVersionRepo` — Version history tracking.
  - `KnowledgeBlockRepo` — Content block persistence.
  - `KnowledgePageRepo` — Knowledge page operations.
  - `KnowledgeSpaceRepo` — Knowledge space management.
  - `PageLinkRepo` — Page link relationship management.
- **`FilesConfig` tag + helpers** — Projects `serverEnv` into document-specific configuration, with `Live` and `layerFrom` entry points (`packages/documents/infra/src/config.ts`).
- **`StorageService`** — Effect service for S3-based file storage operations (`packages/documents/infra/src/SignedUrlService.ts`).
- **`ExifToolService`** — Effect service for extracting and processing EXIF metadata from image files, available via `@beep/documents-infra/files` export (`packages/documents/infra/src/files/ExifToolService.ts`).
- **HTTP Routes (`src/routes/`)** — Effect HTTP router definitions:
  - `KnowledgePage.router` — Knowledge page HTTP endpoints.
  - `root` — Root router composition.
- **HTTP Handlers (`src/handlers/`)** — Effect HTTP request handlers:
  - `Comment.handlers` — Comment request handlers.
  - `Discussion.handlers` — Discussion request handlers.
  - `Document.handlers` — Document request handlers.
- **Root barrel exports** — `src/index.ts` / `src/db.ts` forward all public pieces for `@beep/documents-infra` consumers. Additional export path `files` provides file processing utilities.

## Usage Snapshots
- `packages/runtime/server/src/server-runtime.ts:69` — Merges `DocumentsRepos.layer` with IAM repos to hydrate server-side persistence.
- `packages/runtime/server/src/server-runtime.ts:72` — Adds `DocumentsDb.DocumentsDb.Live` to the runtime DB set, letting `Db.Live` receive slice connections.
- `packages/_internal/db-admin/test/pg-container.ts:249` — Supplies `DocumentsDb.DocumentsDb.Live` when spinning Postgres Testcontainers for migration validation.
- `packages/_internal/db-admin/test/pg-container.ts:251` — Composes `DocumentsRepos.layer` with IAM repos to seed fake data during container bootstrap.

## Authoring Guardrails
- Always import Effect namespaces (`Effect`, `Layer`, `Context`, `A`, `Str`, etc.) and honor the no-native array/string guardrail; match patterns already present in `Repo.make`.
- Build new repositories by extending existing repo implementations; reuse `Repo.make` to inherit telemetry + error mapping.
- Prefer `FilesConfig.layerFrom` when tests or CLIs need custom configuration; never inspect `process.env` within this package.
- Treat `StorageService` as the abstraction over S3 operations—add new helpers there and expose functions through generated accessors.
- When new tables land in `@beep/documents-tables`, update `DocumentsDb` consumers and refresh migrations via `packages/_internal/db-admin` before trusting runtime layers.
- Ensure layers remain memoizable (`Layer.mergeAll`, `Layer.provideMerge`); avoid manual `Layer.build` that would break runtime caching.

## Quick Recipes
- **Hydrate DocumentRepo with a temporary Postgres client (integration tests)**
  ```ts
  import { DocumentRepo } from "@beep/documents-infra/adapters/repos";
  import { DocumentsDb } from "@beep/documents-infra/db";
  import * as PgClient from "@effect/sql-pg/PgClient";
  import * as Effect from "effect/Effect";
  import * as Layer from "effect/Layer";

  const makeTestLayer = (config: PgClient.Config) =>
    Layer.mergeAll(
      PgClient.layer(config),
      DocumentsDb.DocumentsDb.Live,
      DocumentRepo.DefaultWithoutDependencies
    );

  export const runWithRepo = <A, E>(
    config: PgClient.Config,
    effect: Effect.Effect<A, E, DocumentRepo>
  ) => Effect.scoped(Effect.provide(effect, makeTestLayer(config)));
  ```
- **Extend DocumentRepo inside its service effect**
  ```ts
  import { Repo } from "@beep/shared-infra/Repo";
  import { DocumentsDb } from "@beep/documents-infra/db";
  import { SharedEntityIds } from "@beep/shared-domain";
  import { Document } from "@beep/documents-domain/entities";
  import * as Effect from "effect/Effect";

  export class DocumentRepo extends Effect.Service<DocumentRepo>()("@beep/documents-infra/adapters/repos/DocumentRepo", {
    dependencies,
    accessors: true,
    effect: Repo.make(
      SharedEntityIds.DocumentId,
      Document.Model,
      Effect.gen(function* () {
        const { makeQuery } = yield* DocumentsDb.DocumentsDb;

        const listBySpace = makeQuery((execute, spaceId: SharedEntityIds.KnowledgeSpaceId.Type) =>
          execute((client) =>
            client.query.document.findMany({
              where: (table, { eq }) => eq(table.spaceId, spaceId),
            })
          )
        );

        return { listBySpace };
      })
    ),
  }) {}
  ```

## Verifications
- `bun run check --filter=@beep/documents-infra`
- `bun run lint --filter=@beep/documents-infra`
- `bun run test --filter=@beep/documents-infra`

## Contributor Checklist
- Document every new repository method in **Surface Map** and add at least one **Usage Snapshot** proving adoption.
- Keep storage/S3 configuration changes mirrored in `@beep/shared-infra` docs; mention defaults and overrides here.
- After altering database schema, run the verification commands above and sync `packages/_internal/db-admin` migrations.
- Note first-party consumers (apps, CLIs, tests) in this file so other agents can trace impact quickly.
