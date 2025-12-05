# @beep/tooling-utils Agent Guide

## Purpose & Fit
- Provides Effect-first filesystem and repository helpers used by automation scripts (`tooling/repo-scripts/*`) and other build-time tooling.
- Wraps Bun platform services so automation can stay portable between Bun runtime and test harnesses.
- Ships schema definitions for `package.json`, `tsconfig.json`, and JSON literals to keep repo automation type-safe.
- Complements `@beep/testkit` (for assertions) and `@beep/types` (UnsafeTypes bridge for glob) without duplicating their responsibilities.

## Surface Map
- **`FsUtils` service (`tooling/utils/src/FsUtils.ts`)**
  - Span-instrumented helpers: `glob`, `globFiles`, `modifyFile`, `modifyGlob`, `copyGlobCached`, `rmAndCopy`, `rmAndMkdir`.
  - JSON helpers: `readJson`, `writeJson`, `existsOrThrow`.
  - Uses `Effect.cachedFunction` to memoise `mkdirCached`.
  - Live layer `FsUtilsLive` pre-wires Bun filesystem/path layers; prefer to provide this at the edge.
- **`RepoUtils` service (`tooling/utils/src/RepoUtils.ts`)**
  - Exposes `REPOSITORY_ROOT`, cached workspace map, and `getWorkspaceDir`.
  - Layer `RepoUtilsLive` composes `FsUtils` + Bun layers so downstream scripts only depend on a single provider.
- **Repo module barrels (`tooling/utils/src/repo/*.ts`)**
  - `Workspaces` discovers workspace directories via globbing root `workspaces`.
  - `Root` walks up the directory tree to locate `.git` or `bun.lock`.
  - `PackageJsonMap` builds `workspace -> package.json` map with `NoSuchFileError` failures.
  - `Dependencies` and `DependencyIndex` model `HashSet`-backed dependency inventories.
  - `TsConfigIndex` validates root configs and collects optional variants per workspace.
  - `UniqueDependencies` exposes `collectUniqueNpmDependencies` and compatibility alias `getUniqueDeps`.
- **Schemas (`tooling/utils/src/schemas/*.ts`)**
  - JSON primitives (`Json`, `JsonLiteral`).
  - Package manifests (`PackageJson`, `RootPackageJson`), workspace dependency structures, and `TsConfigJson`.
  - All schemas favour `S.Struct` and `S.TemplateLiteral` to stay aligned with Effect schema expectations.

## Usage Snapshots
- `tooling/repo-scripts/src/generate-asset-paths.ts:36` pulls `getWorkspaceDir("@beep/web")` and `FsUtilsLive` to regenerate `publicPaths` while checking for missing directories with `DomainError`.
- `tooling/repo-scripts/src/i18n/cldr.ts:86` uses `RepoUtils` and `FsUtils.mkdirCached` to materialise generated locale files after decoding remote JSON with the provided schemas.
- `tooling/repo-scripts/src/utils/convert-to-nextgen.ts:98` relies on `FsUtils.existsOrThrow` before running WASM encoders, demonstrating error surfacing for asset pipelines.
- `tooling/repo-scripts/src/sync-ts-references.ts:45` streams the `collectTsConfigPaths` map to decide which `update-ts-references` passes to run.
- `tooling/utils/test/repo/TsConfigIndex.test.ts:21` shows the happy-path expectation for workspace config discovery and optional variants under the real repo layout.

## Authoring Guardrails
- Always inject `FsUtils`/`RepoUtils` via their tags; do not instantiate Bun services directly in consumers. Side effects belong at `Layer` boundaries and must keep `DomainError.mapError` in place.
- Preserve spans and error translations when adding new Fs helpers. Use `Effect.fn` with explicit names so traces stay meaningful.
- `resolveWorkspaceDirs` intentionally ignores `node_modules`, `dist`, `build`, `.turbo`, `.tsbuildinfo`. Extend the `IGNORE` set instead of loosening glob options if new artifacts appear.
- The workspace schemas only recognise `workspace:^` specifiers today. If you need other flavours (e.g. `workspace:*`), update `WorkspacePkgValue` and the decoding logic together.
- `collectTsConfigPaths` enforces root `tsconfig.json`, `tsconfig.build.json`, and `tsconfig.base.json`. Keep these checks aligned with repo conventions before shipping new optional variants.
- Use the schema exports (`PackageJson`, `TsConfigJson`, etc.) when decoding automation payloads. Avoid ad-hoc `JSON.parse` without validation to keep error messaging uniform (`TreeFormatter` integration).
- `FsUtils.writeJson` produces stable two-space formatting without trailing newline. Keep formatting decisions consistent to avoid noisy diffs in generated files.
- When extending Layer composition, prefer `Layer.provideMerge` / `Layer.mergeAll`. Memoise expensive lookups with `Effect.cachedFunction` or `Layer.memoize` rather than caching outside the Effect runtime.

## Quick Recipes
```ts
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";

export const normalizeHeadings = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;
  yield* fsUtils.modifyGlob("docs/**/*.md", (content) =>
    F.pipe(content, Str.replace(/^# /gm, "## "))
  );
}).pipe(Effect.provide(FsUtilsLive));
```

```ts
import { collectUniqueNpmDependencies } from "@beep/tooling-utils/repo/UniqueDependencies";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";

export const listSortedDeps = Effect.gen(function* () {
  const result = yield* collectUniqueNpmDependencies;
  return F.pipe(result.dependencies, A.sort(Str.Order));
});
```

```ts
import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils/RepoUtils";
import * as Effect from "effect/Effect";
import * as Path from "@effect/platform/Path";

export const ensureGeneratedFolder = Effect.gen(function* () {
  const repo = yield* RepoUtils;
  const path_ = yield* Path.Path;
  return path_.join(repo.REPOSITORY_ROOT, "packages", "common", "constants", "_generated");
}).pipe(Effect.provide(RepoUtilsLive));
```

## Verifications
- `bun run lint --filter=@beep/tooling-utils`
- `bun run test --filter=@beep/tooling-utils`
- `bun run build --filter=@beep/tooling-utils`
- For standalone execution inside this workspace: `bun run --cwd tooling/utils test`

## Contributor Checklist
- [ ] Effect modules imported as namespaces (`import * as A from "effect/Array"`) and no native array/string helpers.
- [ ] New Fs helpers wrap side effects with spans and map errors through `DomainError`.
- [ ] Repo utilities keep `HashMap` / `HashSet` usage immutable and leverage existing schemas for decoding.
- [ ] Layer plumbing updated when adding new dependencies (e.g. extend `RepoUtilsLive` rather than re-exporting bare services).
- [ ] Added or updated tests under `tooling/utils/test` to cover new behaviour.
- [ ] Ran `bun run lint --filter=@beep/tooling-utils` and `bun run test --filter=@beep/tooling-utils` before handing off changes.
- [ ] Updated generated docs (`AGENTS.md`, related references) and noted any downstream impacts in `AGENTS_MD_PLAN.md` if scope changes.

