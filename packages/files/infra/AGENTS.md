# AGENTS.md — `@beep/files-infra`

## Purpose & Fit
- Provides the infrastructure layer for the files slice, wiring shared domain models from `@beep/shared-domain` to database and object storage services so application code never touches raw clients.
- Exposes ready-to-merge Layers (`FilesDb.FilesDb.Live`, `FilesRepos.layer`, `FilesConfig.Live`) that slot into app runtimes such as `packages/runtime/server` without bespoke bootstrap logic.
- Bridges configuration from `@beep/core-env/server` to AWS S3 primitives via Effect AWS clients, keeping all bucket and credential concerns centralized.
- Establishes repo contracts backed by `@beep/core-db/Repo`, safeguarding tagged error handling and telemetry conventions for persistence operations.

## Surface Map
- **`FilesDb.FilesDb.Live`** — Scoped database layer built on `Db.make` with shared tables schema (`packages/files/infra/src/db/Db.ts`).
- **`FilesDb.FilesDb`** — Context tag to access the shared database connection and migrations (`packages/files/infra/src/db/Db.ts`).
- **`FilesRepos.layer`** — Aggregated layer exporting all files repositories for vertical slices (`packages/files/infra/src/adapters/repositories.ts`).
- **`FileRepo` service** — Repo constructed via `Repo.make`, ready for custom queries inside the `effect` block (`packages/files/infra/src/adapters/repos/File.repo.ts`).
- **`FilesConfig` tag + helpers** — Projects `serverEnv` into an S3-focused config, with `Live` and `layerFrom` entry points (`packages/files/infra/src/config.ts`).
- **`StorageService`** — Effect service that wraps `S3Service.putObject` to mint pre-signed upload URLs (`packages/files/infra/src/SignedUrlService.ts`).
- **Root barrel exports** — `src/index.ts` / `src/db.ts` forward all public pieces for `@beep/files-infra` consumers.

## Usage Snapshots
- `packages/runtime/server/src/server-runtime.ts:69` — Merges `FilesRepos.layer` with IAM repos to hydrate server-side persistence.
- `packages/runtime/server/src/server-runtime.ts:72` — Adds `FilesDb.FilesDb.Live` to the runtime DB set, letting `Db.Live` receive slice connections.
- `packages/_internal/db-admin/test/pg-container.ts:249` — Supplies `FilesDb.FilesDb.Live` when spinning Postgres Testcontainers for migration validation.
- `packages/_internal/db-admin/test/pg-container.ts:251` — Composes `FilesRepos.layer` with IAM repos to seed fake data during container bootstrap.
- (Currently unused) `StorageService` has no downstream references yet; flag new adopters to document the first integration.

## Tooling & Docs Shortcuts
- `effect_docs__effect_docs_search`
  ```json
  {"query":"Effect.Service"}
  ```
- `effect_docs__effect_docs_search`
  ```json
  {"query":"Layer.provideMerge"}
  ```
- `effect_docs__get_effect_doc`
  ```json
  {"documentId":6115}
  ```
- `effect_docs__get_effect_doc`
  ```json
  {"documentId":6116}
  ```
- `effect_docs__get_effect_doc`
  ```json
  {"documentId":7107}
  ```
- `context7__get-library-docs`
  ```json
  {"context7CompatibleLibraryID":"/llmstxt/effect_website_llms-full_txt","topic":"Effect.Service Layer.provideMerge"}
  ```

## Authoring Guardrails
- Always import Effect namespaces (`Effect`, `Layer`, `Context`, `A`, `Str`, etc.) and honor the no-native array/string guardrail; match patterns already present in `Repo.make`.
- Build new repositories by extending the `Effect.gen` block inside `FileRepo` rather than constructing ad-hoc SQL clients; reuse `Repo.make` to inherit telemetry + error mapping.
- Prefer `FilesConfig.layerFrom` when tests or CLIs need custom bucket names; never inspect `process.env` within this package.
- Treat `StorageService` as the only abstraction over S3 writes—add new helpers there and expose functions through the generated accessors; ensure any list/read operations share the same configuration tag.
- When new tables land in `@beep/shared-tables/schema`, update `FilesDb` consumers and refresh migrations via `packages/_internal/db-admin` before trusting runtime layers.
- Ensure layers remain memoizable (`Layer.mergeAll`, `Layer.provideMerge`); avoid manual `Layer.build` that would break runtime caching.

## Quick Recipes
- **Hydrate FileRepo with a temporary Postgres client (integration tests)**
  ```ts
  import { FileRepo } from "@beep/files-infra/adapters/repos";
  import { FilesDb } from "@beep/files-infra/db";
  import * as PgClient from "@effect/sql-pg/PgClient";
  import * as Effect from "effect/Effect";
  import * as Layer from "effect/Layer";

  const makeTestLayer = (config: PgClient.Config) =>
    Layer.mergeAll(
      PgClient.layer(config),
      FilesDb.FilesDb.Live,
      FileRepo.DefaultWithoutDependencies
    );

  export const runWithRepo = <A, E>(
    config: PgClient.Config,
    effect: Effect.Effect<A, E, FileRepo>
  ) => Effect.scoped(Effect.provide(effect, makeTestLayer(config)));
  ```
- **Extend FileRepo inside its service effect**
  ```ts
  import { Repo } from "@beep/core-db/Repo";
  import { FilesDb } from "@beep/files-infra/db";
  import { SharedEntityIds } from "@beep/shared-domain";
  import { File } from "@beep/shared-domain/entities";
  import * as Effect from "effect/Effect";

  export class FileRepo extends Effect.Service<FileRepo>()("@beep/files-infra/adapters/repos/FileRepo", {
    dependencies,
    accessors: true,
    effect: Repo.make(
      SharedEntityIds.FileId,
      File.Model,
      Effect.gen(function* () {
        const { makeQuery } = yield* FilesDb.FilesDb;

        const listByOwner = makeQuery((execute, ownerId: SharedEntityIds.UserId.Type) =>
          execute((client) =>
            client.query.file.findMany({
              where: (table, { eq }) => eq(table.ownerId, ownerId),
            })
          )
        );

        return { listByOwner };
      })
    ),
  }) {}
  ```
- **Issue a pre-signed upload URL via StorageService**
  ```ts
  import { serverEnv } from "@beep/core-env/server";
  import { FilesConfig } from "@beep/files-infra/config";
  import { StorageService } from "@beep/files-infra/SignedUrlService";
  import { S3Service } from "@effect-aws/client-s3";
  import * as Effect from "effect/Effect";
  import * as Layer from "effect/Layer";

  const bucketOverride = FilesConfig.layerFrom({
    ...serverEnv,
    cloud: {
      ...serverEnv.cloud,
      aws: {
        ...serverEnv.cloud.aws,
        s3: { bucketName: "local-test-bucket" as typeof serverEnv.cloud.aws.s3.bucketName },
      },
    },
  });

  const storageLayer = Layer.provideMerge(
    StorageService.DefaultWithoutDependencies,
    Layer.mergeAll(S3Service.defaultLayer, bucketOverride)
  );

  export const getPresignedUrl = Effect.provide(
    Effect.gen(function* () {
      const storage = yield* StorageService;
      const url = yield* storage.getPreSignedUrl();
      yield* Effect.logDebug("files.presign.created", { url });
      return url;
    }),
    storageLayer
  );
  ```

## Verifications
- `bun run check --filter=@beep/files-infra`
- `bun run lint --filter=@beep/files-infra`
- `bun run test --filter=@beep/files-infra`

## Contributor Checklist
- Update `packages/files/infra/AGENTS_MD_PLAN.md` whenever exports or dependencies change.
- Document every new repository method in **Surface Map** and add at least one **Usage Snapshot** proving adoption.
- Keep S3 configuration changes mirrored in `@beep/core-env` docs; mention defaults and overrides here.
- After altering database schema, run the verification commands above and sync `packages/_internal/db-admin` migrations.
- Note first-party consumers (apps, CLIs, tests) in this file so other agents can trace impact quickly.
