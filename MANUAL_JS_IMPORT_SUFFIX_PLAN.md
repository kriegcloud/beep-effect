# Manual JS Import Suffix Remediation Plan

## Dependency Inventory
- `@beep/utils` — shared utilities leveraged by repo scripts; review for relative specifiers that require `.js` suffixes.
- `@beep/constants` — provides path helpers consumed by image tooling; verify exports/imports align with `.js` suffix convention.
- `@beep/invariant` — runtime invariant helpers; ensure any relative references comply with ESM suffix rules.
- `@beep/schema` — schema builders used across tooling flows; check for nested relative exports.
- `@beep/tooling-utils` — primary dependency of repo scripts; will need broad manual updates (see checklist below).
- `@beep/types` — core type surface used by downstream packages; requires coordinated manual suffix adjustments.
- `@effect/*`, `effect` — library namespaces; confirm we swap to namespace imports and avoid native array/string helpers when updating code.
- `ts-morph` — AST tooling; confirm API usage matches current version when refactoring.
- `glob`, `picocolors`, `@jsquash/*` — auxiliary libs; verify any local wrapper modules expose `.js` suffixed entrypoints.
- Node built-ins (`node:fs`, `node:path`, `node:url`, `crypto`) — revisit manual specifiers that our automation cannot rewrite.

## Manual Fix Checklist

### tooling/repo-scripts
- [ ] `tooling/repo-scripts/src/enforce-js-import-suffix.ts`
  - Replace native `forEach`/`flatMap`/`Set` usage with Effect collections (`A.forEach`, `HashSet`, etc.).
  - Swap native string helpers (`startsWith`, `endsWith`, `slice`, `replace`) for `Str.*` utilities inside `computeReplacement` and related helpers.
  - Ensure `Array.from`/`Set` conversions rely on `A.fromIterable` and Effect collection APIs.
  - Fix ts-morph typings: confirm `getImportEqualsDeclarations` availability or gate with feature detection.
  - Rework `BunRuntime.runMain` invocation to pipe via `Effect.provide`/`Effect.catchAll` without using object `.pipe`.
  - Add `.js` suffixes to all relative imports/exports within this module when rewiring helper extraction.
  - Document fallback handling and produce Option-aware logging via Effect utilities.
- [ ] `tooling/repo-scripts/src/bootstrap.ts`
  - Append `.js` suffix to `./generate-env-secrets`.
  - Audit command execution flow for native array usage; migrate to Effect pipelines where present.
- [ ] `tooling/repo-scripts/src/generate-asset-paths.ts`
  - Append `.js` suffixes to `./utils` and `./utils/convert-to-nextgen`.
  - Review schema parsing helpers for any native collection usage and convert to Effect primitives.
- [ ] `tooling/repo-scripts/src/execute.ts`
  - Append `.js` suffix to `./utils/convert-to-nextgen`.
  - Align Effect pipeline usage (avoid `.pipe` on Effect values, prefer `pipe(...)`).
- [ ] `tooling/repo-scripts/src/utils/convert-to-nextgen.ts`
  - Append `.js` suffix to `./asset-path.schema`.
  - Replace `flatMap`, native recursion, and `Set`/`ArrayBuffer` manipulations with Effect collection equivalents where feasible.
  - Ensure string parsing uses `Str.split`, `Str.endsWith`, etc.
- [ ] `tooling/repo-scripts/src/utils/asset-path.schema.ts`
  - Verify exports/imports consume `.js` suffixed specifiers from `@beep/constants`.
  - Replace any lingering native function helpers with Effect alternatives.
- [ ] `tooling/repo-scripts/src/utils/index.ts`
  - Update re-export to `./asset-path.schema.js`.
- [ ] `tooling/repo-scripts/src/generate-env-secrets.ts`
  - Confirm no hidden relative imports; document manual steps if secrets generation references unsuffixed modules.
- [ ] `tooling/repo-scripts/src/generate-env.ts`
  - Audit for relative imports (none today) and document if new `.js` paths become necessary post-refactor.
- [ ] `tooling/repo-scripts/src/sync-ts-references.ts`
  - Inspect for native array usage; migrate to Effect utilities while validating `.js` suffix requirements.

### @beep/tooling-utils (`tooling/utils`)
- [ ] `tooling/utils/src/index.ts`
  - Append `.js` to `./FsUtils`, `./repo`, `./schemas`, and ensure barrel exports stay type-safe.
- [ ] `tooling/utils/src/FsUtils.ts`
  - Append `.js` to relative imports (`./repo/Errors`).
  - Replace native file iteration helpers with Effect `Stream`/`Array` utilities where possible.
- [ ] `tooling/utils/src/repo/index.ts`
  - Append `.js` suffix to every re-export path.
- [ ] `tooling/utils/src/repo/Dependencies.ts`
  - Append `.js` to `../FsUtils` and `../schemas`.
  - Replace native array and promise utilities with Effect equivalents.
- [ ] `tooling/utils/src/repo/DependencyIndex.ts`
  - Append `.js` to `../schemas`, `./Dependencies`, `./PackageJsonMap`, `./Root`.
  - Migrate to Effect collections for aggregation logic.
- [ ] `tooling/utils/src/repo/PackageJsonMap.ts`
  - Append `.js` to `./Errors` and `./Workspaces`.
- [ ] `tooling/utils/src/repo/Root.ts`
  - Append `.js` to `./Errors`.
- [ ] `tooling/utils/src/repo/TsConfigIndex.ts`
  - Append `.js` to `./Errors`, `./Root`, `./Workspaces`.
  - Replace native loops with Effect pipelines.
- [ ] `tooling/utils/src/repo/UniqueDependencies.ts`
  - Append `.js` to `./DependencyIndex`.
- [ ] `tooling/utils/src/repo/Workspaces.ts`
  - Append `.js` to `../FsUtils`, `../schemas`, `./Errors`, `./Root`.
- [ ] `tooling/utils/src/schemas/Json.ts`
  - Append `.js` to `./JsonLiteral`.
- [ ] `tooling/utils/src/schemas/PackageJson.ts`
  - Append `.js` to `./Json`.
- [ ] `tooling/utils/src/schemas/index.ts`
  - Append `.js` to local schema exports.
- [ ] `tooling/utils/src/schemas/RootPackageJson.ts`, `TsConfigJson.ts`, `WorkspaceDependencies.ts`
  - Double-check for implicit relative imports; append `.js` suffixes if/when they appear.

### @beep/schema (`packages/common/schema`)
- [ ] `packages/common/schema/src/index.ts`
  - Append `.js` to every local export surface (e.g. `./types`, `./schemas`) and ensure re-export structure remains compatible with Effect namespace usage.
- [ ] `packages/common/schema/src/**/*.ts`
  - Inspect for relative specifiers lacking `.js` (particularly internal helpers under `src/base`, `src/transformers`, etc.) and update using Effect string utilities when deriving paths.
- [ ] `packages/common/schema/tsconfig.*`
  - If barrel rewrites introduce new file paths, ensure tsconfig references remain synchronized (update `sync-ts-references` output if necessary).

### @beep/types (`packages/common/types`)
- [ ] `packages/common/types/src/index.ts`
  - Append `.js` suffix to every local re-export.
  - Ensure type-only exports remain `export type` with `.js` suffix for ESM compat.
- [ ] `packages/common/types/src/struct.types.ts`
  - Append `.js` suffixes to `./record.types`, `./string.types`, `./unsafe.types`.
  - Verify Effect namespace imports (`effect/Array`, `effect/Schema`) remain type-only friendly.
- [ ] `packages/common/types/src/record.types.ts`
  - Append `.js` suffixes to `./string.types`, `./unsafe.types`.
- [ ] `packages/common/types/src/prop.type.ts`
  - Append `.js` suffix to `./string.types`.
- [ ] `packages/common/types/src/tag.types.ts`
  - Append `.js` suffix to `./literal.types`.
- [ ] `packages/common/types/src/schema.types.ts`
  - Confirm absolute import to `@beep/types/unsafe.types.js` resolves once index updates are complete.
- [ ] `packages/common/types/src/util.types.ts`, `fn.types.ts`, `unsafe.types.ts`
  - Audit for internal relative imports; add `.js` suffix where necessary.
- [ ] `packages/common/types/test/Dummy.test.ts`
  - Run tests after type export renames to ensure suite continues to compile under Bun.

### Validation & Follow-up
- [ ] After manual edits, run `bun run check` and `bun run lint` to catch residual type violations.
- [ ] Execute `tooling/repo-scripts/src/enforce-js-import-suffix.ts --check` once refactored to verify no remaining relative imports without `.js`.
- [ ] Document any residual false positives or files that must remain without `.js` suffix for interop, and log follow-up issues.
