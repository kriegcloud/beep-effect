# AGENTS.md — `@beep/documents-server`

## Purpose & Fit
- Provides the infrastructure layer for the documents slice, wiring domain models from `@beep/documents-domain` to database services via repositories.
- Exposes ready-to-merge Layers (`DocumentsDb.Db.layer`, `DocumentsRepos.layer`) that slot into app runtime layers in `packages/runtime/server`.
- Implements repository pattern using `DbRepo.make` from `@beep/shared-domain/factories`, safeguarding tagged error handling and telemetry conventions for persistence operations.

## Surface Map
- **`DocumentsDb.Db`** — Context tag to access the scoped database client with documents tables schema (`packages/documents/server/src/db/Db/Db.ts`).
- **`DocumentsDb.Db.layer`** — Layer providing the scoped database connection built on `DbClient.make` with documents tables schema.
- **`DocumentsRepos.layer`** — Aggregated layer exporting all document repositories (`packages/documents/server/src/db/repositories.ts`).
- **Repository Services** — Built via `DbRepo.make` from `@beep/shared-domain/factories`, providing type-safe database operations:
  - `CommentRepo` — Comment persistence and queries.
  - `DiscussionRepo` — Discussion thread operations.
  - `DocumentFileRepo` — File attachment management.
  - `DocumentRepo` — Core document CRUD and queries.
  - `DocumentVersionRepo` — Version history tracking.
- **`SignedUrlService`** — Effect service for S3-based file storage operations (`packages/documents/server/src/SignedUrlService.ts`).
- **`ExifToolService`** — Effect service for extracting and processing EXIF metadata from image files, available via `@beep/documents-server/files` export (`packages/documents/server/src/files/ExifToolService.ts`).
- **`PdfMetadataService`** — Effect service for extracting metadata from PDF files, available via `@beep/documents-server/files` export (`packages/documents/server/src/files/PdfMetadataService.ts`).
- **RPC Handlers (`src/handlers/`)** — Effect RPC request handlers for client-server communication:
  - `CommentHandlersLive` — Comment RPC handlers.
  - `DiscussionHandlersLive` — Discussion RPC handlers.
  - `DocumentHandlersLive` — Document RPC handlers.
  - `DocumentsHandlersLive` — Combined layer merging all document handlers.
- **Root barrel exports** — `src/index.ts` and `src/db.ts` forward all public pieces for `@beep/documents-server` consumers. Additional export path `files` provides file processing utilities.

## Usage Snapshots
- `packages/runtime/server/src/Persistence.layer.ts` — Composes database layers including `DocumentsDb.layer` for slice-specific database access.
- `packages/runtime/server/src/DataAccess.layer.ts` — Merges `DocumentsRepos.layer` with other slice repos to hydrate server-side persistence.

## Authoring Guardrails
- ALWAYS import Effect namespaces (`Effect`, `Layer`, `Context`, `A`, `Str`, etc.) and honor the no-native array/string guardrail; match patterns already present in `DbRepo.make`.
- Build new repositories by extending existing repo implementations; reuse `DbRepo.make` from `@beep/shared-domain/factories` to inherit telemetry + error mapping.
- NEVER inspect `process.env` within this package; use `@beep/shared-env` for typed environment access.
- Treat `SignedUrlService` as the abstraction over S3 operations—add new helpers there and expose functions through generated accessors.
- When new tables land in `@beep/documents-tables`, update `DocumentsDb.Db` consumers and refresh migrations via `packages/_internal/db-admin` before trusting runtime layers.
- Ensure layers remain memoizable (`Layer.mergeAll`, `Layer.provideMerge`); NEVER use manual `Layer.build` that would break runtime caching.

## Quick Recipes
- **Hydrate DocumentRepo with a temporary Postgres client (integration tests)**
  ```ts
  import { DocumentRepo } from "@beep/documents-server";
  import { DocumentsDb } from "@beep/documents-server/db";
  import * as PgClient from "@effect/sql-pg/PgClient";
  import * as Effect from "effect/Effect";
  import * as Layer from "effect/Layer";

  const makeTestLayer = (config: PgClient.Config) =>
    Layer.mergeAll(
      PgClient.layer(config),
      DocumentsDb.layer,
      DocumentRepo.Default
    );

  export const runWithRepo = <A, E>(
    config: PgClient.Config,
    effect: Effect.Effect<A, E, DocumentRepo>
  ) => Effect.scoped(Effect.provide(effect, makeTestLayer(config)));
  ```
- **Extend DocumentRepo with custom query methods**

  When adding new query methods to an existing repository, follow this pattern from `packages/documents/server/src/db/repos/Document.repo.ts`:

  ```ts
  import { DbRepo } from "@beep/shared-domain/factories";
  import { DocumentsDb } from "@beep/documents-server/db";
  import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
  import { Document, Entities } from "@beep/documents-domain";
  import { DbClient } from "@beep/shared-server";
  import * as Effect from "effect/Effect";
  import * as S from "effect/Schema";

  // Internal to repos directory - define dependencies inline
  const dependencies = [DocumentsDb.layer] as const;

  export class DocumentRepo extends Effect.Service<DocumentRepo>()("@beep/documents-server/db/repos/DocumentRepo", {
    dependencies,
    accessors: true,
    effect: Effect.gen(function* () {
      const { makeQuery } = yield* DocumentsDb.Db;

      const baseRepo = yield* DbRepo.make(
        DocumentsEntityIds.DocumentId,
        Document.Model,
        Effect.succeed({})
      );

      // Add custom query using makeQuery helper
      const listByOrganization = makeQuery(
        (
          execute,
          params: {
            readonly organizationId: SharedEntityIds.OrganizationId.Type;
            readonly limit?: number;
          }
        ) =>
          execute((client) =>
            client.query.document.findMany({
              where: (table, { eq, isNull, and }) =>
                and(
                  eq(table.organizationId, params.organizationId),
                  isNull(table.deletedAt)
                ),
              orderBy: (table, { desc }) => [desc(table.updatedAt)],
              limit: params.limit ?? 50,
            })
          ).pipe(
            Effect.flatMap(S.decode(S.Array(Entities.Document.Model))),
            Effect.mapError(DbClient.DatabaseError.$match),
            Effect.withSpan("DocumentRepo.listByOrganization")
          )
      );

      return { ...baseRepo, listByOrganization };
    })
  }) {}
  ```

## Verifications
- `bun run check --filter=@beep/documents-server`
- `bun run lint --filter=@beep/documents-server`
- `bun run test --filter=@beep/documents-server`

## Contributor Checklist
- Document every new repository method in **Surface Map** and add at least one **Usage Snapshot** proving adoption.
- Keep storage/S3 configuration changes mirrored in `@beep/shared-server` docs; mention defaults and overrides here.
- After altering database schema, run the verification commands above and sync `packages/_internal/db-admin` migrations.
- Note first-party consumers (apps, CLIs, tests) in this file so other agents can trace impact quickly.
