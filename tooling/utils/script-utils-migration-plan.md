---
description: Migrate tooling/repo-scripts/src/utils into tooling/utils/src with clearer naming, FsUtils usage, and a fix for update-deps when root package.json lacks dependencies
---

# Script Utils Migration Plan

Goal
- Consolidate all utilities from tooling/repo-scripts/src/utils into the shared utils package at tooling/utils/src.
- Improve naming, structure, and reuse across repo tooling.
- Leverage tooling/utils/src/FsUtils.ts for all filesystem/glob operations.
- Keep tooling/repo-scripts/src/update-deps.ts working without functional regressions.
- Fix bug: update-deps should not require the root package.json to have a dependencies property; still collect all devDependencies.

References and guidance
- Effect Platform FileSystem/Path and Layer usage (FsUtilsLive shows the recommended pattern of Context + Layer + Effect.cachedFunction).
- npm package.json docs clarify dependencies/devDependencies are optional fields. See: https://docs.npmjs.com/files/package.json/

Non-goals
- No functional scope expansion beyond reliability, naming, and reuse.
- No changes to pnpm/turbo workflows other than updating import paths where needed.

Constraints
- update-deps.ts continues to execute with the same CLI and Effect runtime setup.
- getUniqueDeps must remain available under a stable import (see Compatibility section).

---

Inventory (source)
- tooling/repo-scripts/src/utils/PackageJson.ts
  - Defines PackageJson, RootPackageJson schemas (duplicate of utils schemas with minor differences).
- tooling/repo-scripts/src/utils/TsConfigJson.ts
  - Minimal TypeScript config schema (duplicate/overlap with utils schemas/TsConfigJson.ts).
- tooling/repo-scripts/src/utils/RepoSchemas.ts
  - Workspace dependency-related schemas: WorkspacePkgKey, WorkspaceDepTuple, Npm dep tuple, RepoDepMap types.
- tooling/repo-scripts/src/utils/errors.ts
  - NoSuchFileError, DomainError, PackageJsonNotFound tagged errors.
- tooling/repo-scripts/src/utils/RepoRootPath.ts
  - Finds repo root by walking up and checking .git or pnpm-workspace.yaml.
- tooling/repo-scripts/src/utils/RepoPackageMap.ts
  - Reads root package.json workspaces, expands to concrete package.json paths via glob, maps workspace name -> dir.
- tooling/repo-scripts/src/utils/RepoPackageJsonMap.ts
  - Maps workspace name -> package.json path (uses RepoPackageMap output).
- tooling/repo-scripts/src/utils/RepoDependencyMap.ts
  - Parses each package.json’s devDependencies and dependencies into structured sets; currently FAILS when either key is missing.
- tooling/repo-scripts/src/utils/repoUniqueDeps.ts
  - Aggregates unique npm dependency names across repo (dev + prod), used by update-deps.ts.
- tooling/repo-scripts/src/utils/RepoTsConfigMap.ts
  - Index of tsconfig files per workspace; ensures root tsconfig files exist; collects optional per-package tsconfig.*.json
- tooling/repo-scripts/src/utils/writeFile.ts
  - Primitive writeFile wrapper that fails if target path doesn’t exist.

---

Target structure (destination)
Place new modules under tooling/utils/src with descriptive names and a cohesive repo namespace. Also consolidate schemas under tooling/utils/src/schemas.

Proposed file tree additions
- tooling/utils/src/repo/index.ts
- tooling/utils/src/repo/Root.ts                // findRepoRoot
- tooling/utils/src/repo/Workspaces.ts          // resolveWorkspaceDirs (workspace name -> dir)
- tooling/utils/src/repo/PackageJsonMap.ts      // mapWorkspaceToPackageJsonPath
- tooling/utils/src/repo/Dependencies.ts        // extractWorkspaceDependencies (from a package.json path)
- tooling/utils/src/repo/DependencyIndex.ts     // buildRepoDependencyIndex (workspace -> {dev, deps} sets)
- tooling/utils/src/repo/UniqueDependencies.ts  // collectUniqueNpmDependencies (export getUniqueDeps alias)
- tooling/utils/src/repo/TsConfigIndex.ts       // collectTsConfigPaths (workspace -> tsconfig files)
- tooling/utils/src/repo/Errors.ts              // DomainError, NoSuchFileError, PackageJsonNotFound
- tooling/utils/src/schemas/RootPackageJson.ts  // new (root package.json schema with required workspaces)
- tooling/utils/src/schemas/WorkspaceDependencies.ts // new (moved from RepoSchemas)

Barrel updates
- tooling/utils/src/index.ts should re-export FsUtils, schemas, and the repo namespace:
  - export * as Repo from "./repo";
  - Ensure schemas barrel already includes PackageJson and TsConfigJson; add RootPackageJson + WorkspaceDependencies.

Mapping: source -> destination (with naming changes)
- utils/PackageJson.ts -> utils/src/schemas/PackageJson.ts (already exists). Remove duplicate; adopt the version in utils, and add RootPackageJson.ts.
- utils/TsConfigJson.ts -> utils/src/schemas/TsConfigJson.ts (already exists). Remove duplicate; import from utils.
- utils/RepoSchemas.ts -> utils/src/schemas/WorkspaceDependencies.ts
- utils/errors.ts -> utils/src/repo/Errors.ts
- utils/RepoRootPath.ts -> utils/src/repo/Root.ts (export findRepoRoot)
- utils/RepoPackageMap.ts -> utils/src/repo/Workspaces.ts (export resolveWorkspaceDirs, getWorkspaceDir)
- utils/RepoPackageJsonMap.ts -> utils/src/repo/PackageJsonMap.ts (export mapWorkspaceToPackageJsonPath)
- utils/RepoDependencyMap.ts -> utils/src/repo/Dependencies.ts (export extractWorkspaceDependencies) and utils/src/repo/DependencyIndex.ts (export buildRepoDependencyIndex)
- utils/repoUniqueDeps.ts -> utils/src/repo/UniqueDependencies.ts (export collectUniqueNpmDependencies and alias export const getUniqueDeps = collectUniqueNpmDependencies)
- utils/RepoTsConfigMap.ts -> utils/src/repo/TsConfigIndex.ts (export collectTsConfigPaths)
- utils/writeFile.ts -> Remove; prefer FsUtils.writeJson / fs.writeFileString or add a safe helper if needed.

Naming conventions
- Prefix repo-oriented utilities with Repo or use a repo namespace folder.
- Function names are verbs that describe the outcome, e.g., findRepoRoot, resolveWorkspaceDirs, mapWorkspaceToPackageJsonPath, extractWorkspaceDependencies, buildRepoDependencyIndex, collectUniqueNpmDependencies, collectTsConfigPaths.
- Types/schemas in schemas/ should be nouns: RootPackageJson, PackageJson, WorkspaceDependencies.
- Prefer consistent, explicit names over abbreviations (dependencies, devDependencies instead of deps/devDeps at API boundaries).

Leverage FsUtils consistently
- Use FsUtils.glob / globFiles instead of direct glob calls; pass ignore patterns as options.
- Use FsUtils.readJson and FsUtils.writeJson for JSON IO. For typed decoding, add a tiny helper:
  - readAndDecode(path, schema) => Effect.flatMap(FsUtils.readJson(path), S.decode(schema))
- Use FsUtils.mkdirCached, rmAndCopy, rmAndMkdir as needed for setup/cleanup in future script utils.
- Preserve attribute spans (Effect.withSpan) as shown in FsUtils where helpful for observability.

Bug fix: missing dependencies on root package.json
- Current behavior: RepoDependencyMap fails if dependencies or devDependencies is nullish, causing update-deps to break unless root has a dependencies object (hence tsx added).
- Desired: Treat missing dependencies/devDependencies as empty objects. Continue to parse devDependencies when present. Root package.json should not require dependencies.
- Implementation details (in repo/Dependencies.ts):
  - When reading a package.json:
    - const dev = decoded.devDependencies ?? {};
    - const prod = decoded.dependencies ?? {};
  - Remove DomainError fails that enforce presence of these keys.
  - Continue to classify entries as workspace or npm using schemas from WorkspaceDependencies.ts.
  - Return structured sets for both dev and prod categories.
- Add tests that cover missing dependencies and/or devDependencies at root and package levels.

Compatibility: keep update-deps.ts working
- update-deps.ts currently imports getUniqueDeps from "./utils/repoUniqueDeps".
- Preferred approach: update import to consume from the utils package and new path:
  - import { getUniqueDeps } from "@beep/tooling-utils/repo/UniqueDependencies";
  - or import { Repo } from "@beep/tooling-utils"; const { getUniqueDeps } = Repo;
- For a smooth transition, optionally keep a short shim file tooling/repo-scripts/src/utils/repoUniqueDeps.ts that re-exports from the new location until all scripts are updated. Then remove it.
- Ensure the output structure is identical: { dependencies: string[]; devDependencies: string[] } and that BREAKING_DEPS filtering in update-deps.ts still functions unchanged.

Module-by-module migration notes
1) RepoRootPath -> repo/Root.ts
   - Export findRepoRoot(): Effect<string>.
   - Keep logic to walk up from import.meta.url using Path.Path; consider small enhancement to also honor a BEEP_REPO_ROOT env override if needed later (not required now).

2) RepoPackageMap -> repo/Workspaces.ts
   - Replace direct glob with FsUtils.glob. Use ignore patterns: **/node_modules/**, **/dist/**, **/build/**, **/.turbo/**, **/.tsbuildinfo/**.
   - Decode root with schemas/RootPackageJson.
   - For each matched package.json, use readAndDecode with schemas/PackageJson and map name -> dir.
   - Export resolveWorkspaceDirs(): Effect<HashMap<string, string>> and getWorkspaceDir(name): Effect<string> (preserve behavior of getRepoWorkspace).

3) RepoPackageJsonMap -> repo/PackageJsonMap.ts
   - Build from resolveWorkspaceDirs, then join dir + "package.json" per workspace.
   - Ensure file existence with fs.exists; reuse NoSuchFileError.

4) RepoSchemas -> schemas/WorkspaceDependencies.ts
   - Move WorkspacePkgKeyPrefix, WorkspacePkgKey, WorkspaceDepTuple, NpmDepTuple, Dependencies struct, RepoDepMap types.
   - Export these for reuse in Dependencies.ts and DependencyIndex.ts.

5) RepoDependencyMap -> repo/Dependencies.ts and repo/DependencyIndex.ts
   - Dependencies.ts: export extractWorkspaceDependencies(pkgJsonPath) that decodes, defaults missing dev/prod maps to {}, classifies (workspace vs npm), and returns { devDependencies, dependencies } with HashSets.
   - DependencyIndex.ts: export buildRepoDependencyIndex() that composes mapWorkspaceToPackageJsonPath + extractWorkspaceDependencies and returns HashMap<WorkspacePkgKey, RepoDepMapValue>.

6) repoUniqueDeps.ts -> repo/UniqueDependencies.ts
   - Export collectUniqueNpmDependencies() that reduces HashMap values and unions dev and prod npm sets.
   - Also export const getUniqueDeps = collectUniqueNpmDependencies for compatibility with update-deps.ts.

7) RepoTsConfigMap -> repo/TsConfigIndex.ts
   - Keep enforcement that root tsconfig.json, tsconfig.build.json, tsconfig.base.json exist.
   - For each package, include optional tsconfig.build.json, tsconfig.test.json, tsconfig.src.json, tsconfig.drizzle.json, tsconfig.tsx.json if present.

8) writeFile.ts -> remove or replace usages
   - Prefer FsUtils.writeJson or fs.writeFileString. If existence checks are wanted, add a helper writeFileIfExists(path, content): Effect<void> using fs.exists + fs.writeFileString.

Barrel and exports
- tooling/utils/src/index.ts should export everything needed by repo scripts:
  - export * as FsUtils from "./FsUtils";
  - export * from "./schemas";
  - export * as Repo from "./repo"; // inside repo/index.ts, re-export the modules above including getUniqueDeps

Testing plan
- Use @effect/vitest and the mkTestDirScoped helper pattern (see tooling/utils/test/FsUtils.test.ts) to keep filesystem clean.
- Add tests under tooling/utils/test for:
  1) repo/Dependencies: missing dependencies and/or devDependencies gracefully handled (defaults to empty), correct workspace/npm classification.
  2) repo/DependencyIndex: builds index including @beep/root from the repo root.
  3) repo/UniqueDependencies: unions npm-only sets across all entries.
  4) repo/Workspaces: expands globs, ignores the standard ignored directories, maps names to dirs correctly.
  5) repo/TsConfigIndex: validates presence of root tsconfigs and optional package configs when present.
- Ensure tests do not mutate the real repo; use temp directories and FsUtils where appropriate.

Migration steps (order of work)
1) Schemas consolidation
   - Add tooling/utils/src/schemas/RootPackageJson.ts.
   - Add tooling/utils/src/schemas/WorkspaceDependencies.ts (moved from RepoSchemas.ts).
   - Ensure tooling/utils/src/schemas/index.ts re-exports RootPackageJson and WorkspaceDependencies.

2) Repo namespace implementation (new files)
   - repo/Errors.ts (move current errors)
   - repo/Root.ts
   - repo/Workspaces.ts
   - repo/PackageJsonMap.ts
   - repo/Dependencies.ts
   - repo/DependencyIndex.ts
   - repo/UniqueDependencies.ts (include getUniqueDeps alias)
   - repo/TsConfigIndex.ts
   - repo/index.ts (barrel re-exports)

3) Replace internal uses and adopt FsUtils
   - Swap direct glob usage for FsUtils.glob with ignore patterns.
   - Use readAndDecode helper (FsUtils.readJson + S.decode) for JSON.

4) update-deps.ts compatibility
   - Preferred: change import to import { getUniqueDeps } from "@beep/tooling-utils/repo/UniqueDependencies".
   - Alternative: add temporary shim tooling/repo-scripts/src/utils/repoUniqueDeps.ts that re-exports from the new path, then later remove the shim and update the import.

5) Remove duplicates in repo-scripts
   - Delete PackageJson.ts and TsConfigJson.ts in repo-scripts; switching to schemas in utils.
   - Delete other moved files once update-deps.ts is updated and tests are green.

6) Tests
   - Add new unit tests described above. Ensure all pass in CI.

7) Cleanup
   - Update tooling/utils/src/index.ts with the Repo export.
   - Audit imports across repo-scripts for old paths; update to new utils where appropriate.

Acceptance criteria
- update-deps.ts runs successfully without requiring a dependencies key in the root package.json and still collects devDependencies.
- getUniqueDeps import path is stable and function output unchanged.
- No regressions in current scripts; all new tests pass.
- Duplicate schemas removed; all consumers use utils schemas.
- All file IO/glob usage routes through FsUtils.

Optimizations and future improvements (optional)
- Add a tiny JsonFs.readAndDecode(path, schema) utility to reduce decode boilerplate in repo modules.
- Cache-heavy operations (workspace discovery, dependency index) can expose Effect.cachedFunction-backed APIs for repeated use in long-running processes.
- Consider exporting a single Layer that wires FsUtilsLive + Repo module services for scripts that want DI instead of ad-hoc provides.

Rollback
- If issues arise, restore the shim in repo-scripts/src/utils and point it back to the old modules temporarily while iterating on the utils versions.

Notes
- Tests for FsUtils already use mkTestDirScoped with Effect.addFinalizer, which we should mirror in new repo tests to keep the workspace clean.

