/**
 * Root config file updater for `create-package`.
 *
 * Adds project references to `tsconfig.packages.json` and path aliases
 * to `tsconfig.json` (JSONC-safe via `jsonc-parser`). All operations are
 * idempotent — existing entries are silently skipped.
 *
 * @since 0.0.0
 * @module
 */

import { DomainError } from "@beep/repo-utils";
import { FileSystem, Path } from "effect";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as jsonc from "jsonc-parser";

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * Summary of which root configuration files were modified during a config update pass.
 *
 * Each boolean field is `true` when the corresponding file was actually written
 * (or, in the case of {@link checkConfigNeedsUpdate}, would need updating).
 *
 * @since 0.0.0
 * @category types
 */
export interface ConfigUpdateResult {
  readonly tsconfigPackages: boolean;
  readonly tsconfigPaths: boolean;
}

/**
 * Config update target for a package that should be registered in root tsconfig files.
 *
 * @since 0.0.0
 * @category types
 */
export interface ConfigUpdateTarget {
  readonly packageName: string;
  readonly packagePath: string;
}

/**
 * Per-target config update summary.
 *
 * @since 0.0.0
 * @category types
 */
export interface ConfigUpdateTargetResult {
  readonly target: ConfigUpdateTarget;
  readonly result: ConfigUpdateResult;
}

/**
 * Batch config orchestration result for one or more package targets.
 *
 * `tsconfigPackages` and `tsconfigPaths` are aggregate booleans indicating whether
 * at least one target changed (or needs a change, in check mode) for the file.
 *
 * @since 0.0.0
 * @category types
 */
export interface ConfigUpdateBatchResult {
  readonly targets: ReadonlyArray<ConfigUpdateTargetResult>;
  readonly tsconfigPackages: boolean;
  readonly tsconfigPaths: boolean;
}

// ── Internal helpers ─────────────────────────────────────────────────────────

const FORMATTING_OPTIONS: jsonc.FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseJsoncObject = (content: string, filePath: string): Record<string, unknown> => {
  const errors: Array<jsonc.ParseError> = [];
  const parsed = jsonc.parse(content, errors);
  if (errors.length > 0 || !isRecord(parsed)) {
    const code = errors.at(0)?.error ?? "unknown";
    throw new DomainError({
      message: `Invalid JSONC in ${filePath} (parse error: ${String(code)})`,
    });
  }
  return parsed;
};

const readReferences = (parsed: Record<string, unknown>): Array<unknown> =>
  Array.isArray(parsed.references) ? [...parsed.references] : [];

const hasReferencePath = (entry: unknown, target: string): boolean =>
  isRecord(entry) && typeof entry.path === "string" && entry.path === target;

const readPathsRecord = (parsed: Record<string, unknown>): Record<string, unknown> => {
  if (!isRecord(parsed.compilerOptions)) return {};
  if (!isRecord(parsed.compilerOptions.paths)) return {};
  return parsed.compilerOptions.paths;
};

const normalizeTargets = (targets: ReadonlyArray<ConfigUpdateTarget>): ReadonlyArray<ConfigUpdateTarget> => {
  const deduped = new Map<string, ConfigUpdateTarget>();
  for (const target of targets) {
    deduped.set(target.packagePath, target);
  }

  return [...deduped.values()].sort((left, right) => left.packagePath.localeCompare(right.packagePath));
};

/**
 * Read → transform → write-if-changed. Returns `true` when the file was
 * actually modified.
 */
const modifyFileString: (
  filePath: string,
  transform: (content: string) => string
) => Effect.Effect<boolean, DomainError, FileSystem.FileSystem> = Effect.fn(function* (filePath, transform) {
  const fs = yield* FileSystem.FileSystem;
  const original = yield* fs
    .readFileString(filePath)
    .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to read ${filePath}: ${String(e)}` })));
  let transformed: string;
  try {
    transformed = transform(original);
  } catch (error) {
    if (error instanceof DomainError) {
      return yield* error;
    }
    return yield* new DomainError({
      message: `Failed to update ${filePath}: ${String(error)}`,
    });
  }
  if (transformed === original) return false;
  yield* fs
    .writeFileString(filePath, transformed)
    .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to write ${filePath}: ${String(e)}` })));
  return true;
});

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Add a project reference to `tsconfig.packages.json`.
 *
 * Idempotent: if the reference already exists, the file is left untouched.
 *
 * @param repoRoot - Absolute path to the repository root directory.
 * @param packagePath - Relative path from the repo root to the new package (e.g. `"tooling/my-utils"`).
 * @returns `true` when the file was modified, `false` when the entry already existed.
 * @depends FileSystem, Path
 * @since 0.0.0
 * @category functions
 */
export const updateTsconfigPackages: (
  repoRoot: string,
  packagePath: string
) => Effect.Effect<boolean, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, packagePath) {
    const path = yield* Path.Path;
    const filePath = path.join(repoRoot, "tsconfig.packages.json");

    return yield* modifyFileString(filePath, (content) => {
      const parsed = parseJsoncObject(content, filePath);
      const references = readReferences(parsed);

      // Idempotency: skip if reference already present
      if (A.some(references, (ref) => hasReferencePath(ref, packagePath))) {
        return content;
      }

      const updated = A.append(references, { path: packagePath });
      const edits = jsonc.modify(content, ["references"], updated, {
        formattingOptions: FORMATTING_OPTIONS,
      });
      return jsonc.applyEdits(content, edits);
    });
  }
);

/**
 * Add path aliases to `tsconfig.json` (JSONC-safe, preserves comments).
 *
 * Creates both a root alias (`@beep/<name>`) and a wildcard alias
 * (`@beep/<name>/*`) pointing at the package's `src/` directory.
 * Idempotent: if the alias already exists, the file is left untouched.
 *
 * @param repoRoot - Absolute path to the repository root directory.
 * @param packageName - Unscoped package name (e.g. `"my-utils"`).
 * @param packagePath - Relative path from the repo root to the new package (e.g. `"tooling/my-utils"`).
 * @returns `true` when the file was modified, `false` when the aliases already existed.
 * @depends FileSystem, Path
 * @since 0.0.0
 * @category functions
 */
export const updateTsconfigPaths: (
  repoRoot: string,
  packageName: string,
  packagePath: string
) => Effect.Effect<boolean, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, packageName, packagePath) {
    const path = yield* Path.Path;
    const filePath = path.join(repoRoot, "tsconfig.json");
    const alias = `@beep/${packageName}`;

    return yield* modifyFileString(filePath, (content) => {
      const parsed = parseJsoncObject(content, filePath);
      const paths = readPathsRecord(parsed);
      const hasBaseAlias = alias in paths;
      const hasWildcardAlias = `${alias}/*` in paths;

      // Idempotency: skip if both aliases already present
      if (hasBaseAlias && hasWildcardAlias) {
        return content;
      }

      let result = content;

      if (!hasBaseAlias) {
        const edits1 = jsonc.modify(result, ["compilerOptions", "paths", alias], [`./${packagePath}/src/index.ts`], {
          formattingOptions: FORMATTING_OPTIONS,
        });
        result = jsonc.applyEdits(result, edits1);
      }

      if (!hasWildcardAlias) {
        const edits2 = jsonc.modify(result, ["compilerOptions", "paths", `${alias}/*`], [`./${packagePath}/src/*.ts`], {
          formattingOptions: FORMATTING_OPTIONS,
        });
        result = jsonc.applyEdits(result, edits2);
      }

      return result;
    });
  }
);

const updateRootConfigsForTarget: (
  repoRoot: string,
  target: ConfigUpdateTarget
) => Effect.Effect<ConfigUpdateResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, target) {
    const tsconfigPackages = yield* updateTsconfigPackages(repoRoot, target.packagePath);
    const tsconfigPaths = yield* updateTsconfigPaths(repoRoot, target.packageName, target.packagePath);
    return { tsconfigPackages, tsconfigPaths };
  }
);

const checkConfigNeedsUpdateForTarget: (
  repoRoot: string,
  target: ConfigUpdateTarget
) => Effect.Effect<ConfigUpdateResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, target) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const pkgsContent = yield* fs
      .readFileString(path.join(repoRoot, "tsconfig.packages.json"))
      .pipe(
        Effect.mapError((e) => new DomainError({ message: `Failed to read tsconfig.packages.json: ${String(e)}` }))
      );
    const pkgsParsed = parseJsoncObject(pkgsContent, "tsconfig.packages.json");
    const references = readReferences(pkgsParsed);
    const tsconfigPackages = !A.some(references, (ref) => hasReferencePath(ref, target.packagePath));

    const rootContent = yield* fs
      .readFileString(path.join(repoRoot, "tsconfig.json"))
      .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to read tsconfig.json: ${String(e)}` })));
    const rootParsed = parseJsoncObject(rootContent, "tsconfig.json");
    const paths = readPathsRecord(rootParsed);
    const alias = `@beep/${target.packageName}`;
    const tsconfigPaths = !(alias in paths && `${alias}/*` in paths);

    return { tsconfigPackages, tsconfigPaths };
  }
);

/**
 * Batch root config updater for slice flows creating multiple packages.
 *
 * @param repoRoot - Absolute path to repository root.
 * @param targets - Package targets to register in root tsconfig files.
 * @returns Per-target results and aggregate booleans indicating whether each file changed for at least one target.
 * @depends FileSystem, Path
 * @since 0.0.0
 * @category functions
 */
export const updateRootConfigsForTargets: (
  repoRoot: string,
  targets: ReadonlyArray<ConfigUpdateTarget>
) => Effect.Effect<ConfigUpdateBatchResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, targets) {
    const normalizedTargets = normalizeTargets(targets);
    const targetResults = yield* Effect.forEach(normalizedTargets, (target) =>
      Effect.map(updateRootConfigsForTarget(repoRoot, target), (result) => ({
        target,
        result,
      }))
    );

    return {
      targets: targetResults,
      tsconfigPackages: targetResults.some(({ result }) => result.tsconfigPackages),
      tsconfigPaths: targetResults.some(({ result }) => result.tsconfigPaths),
    } satisfies ConfigUpdateBatchResult;
  }
);

/**
 * Batch read-only drift checker for root config updates.
 *
 * @param repoRoot - Absolute path to repository root.
 * @param targets - Package targets to check in root tsconfig files.
 * @returns Per-target results and aggregate booleans indicating whether each file needs updates for at least one target.
 * @depends FileSystem, Path
 * @since 0.0.0
 * @category functions
 */
export const checkConfigNeedsUpdateForTargets: (
  repoRoot: string,
  targets: ReadonlyArray<ConfigUpdateTarget>
) => Effect.Effect<ConfigUpdateBatchResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, targets) {
    const normalizedTargets = normalizeTargets(targets);
    const targetResults = yield* Effect.forEach(normalizedTargets, (target) =>
      Effect.map(checkConfigNeedsUpdateForTarget(repoRoot, target), (result) => ({
        target,
        result,
      }))
    );

    return {
      targets: targetResults,
      tsconfigPackages: targetResults.some(({ result }) => result.tsconfigPackages),
      tsconfigPaths: targetResults.some(({ result }) => result.tsconfigPaths),
    } satisfies ConfigUpdateBatchResult;
  }
);

/**
 * Orchestrate all root config updates for a newly created package.
 *
 * Backward-compatible single-target wrapper around {@link updateRootConfigsForTargets}.
 *
 * @param repoRoot - Absolute path to the repository root directory.
 * @param packageName - Unscoped package name (e.g. `"my-utils"`).
 * @param packagePath - Relative path from the repo root to the new package (e.g. `"tooling/my-utils"`).
 * @returns A {@link ConfigUpdateResult} indicating which config files were modified.
 * @depends FileSystem, Path
 * @since 0.0.0
 * @category functions
 */
export const updateRootConfigs: (
  repoRoot: string,
  packageName: string,
  packagePath: string
) => Effect.Effect<ConfigUpdateResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, packageName, packagePath) {
    const batchResult = yield* updateRootConfigsForTargets(repoRoot, [{ packageName, packagePath }]);
    return batchResult.targets[0]?.result ?? { tsconfigPackages: false, tsconfigPaths: false };
  }
);

/**
 * Check whether config entries already exist (for dry-run output).
 *
 * Backward-compatible single-target wrapper around {@link checkConfigNeedsUpdateForTargets}.
 *
 * @param repoRoot - Absolute path to the repository root directory.
 * @param packageName - Unscoped package name (e.g. `"my-utils"`).
 * @param packagePath - Relative path from the repo root to the new package (e.g. `"tooling/my-utils"`).
 * @returns A {@link ConfigUpdateResult} where `true` means the file still needs updating.
 * @depends FileSystem, Path
 * @since 0.0.0
 * @category functions
 */
export const checkConfigNeedsUpdate: (
  repoRoot: string,
  packageName: string,
  packagePath: string
) => Effect.Effect<ConfigUpdateResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, packageName, packagePath) {
    const batchResult = yield* checkConfigNeedsUpdateForTargets(repoRoot, [{ packageName, packagePath }]);
    return batchResult.targets[0]?.result ?? { tsconfigPackages: false, tsconfigPaths: false };
  }
);
