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

// ── Internal helpers ─────────────────────────────────────────────────────────

interface TsconfigReferences {
  readonly references?: ReadonlyArray<{ readonly path: string }>;
}

interface TsconfigWithPaths {
  readonly compilerOptions?: {
    readonly paths?: Readonly<Record<string, ReadonlyArray<string>>>;
  };
}

const FORMATTING_OPTIONS: jsonc.FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
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
  const transformed = transform(original);
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
      const parsed: TsconfigReferences = jsonc.parse(content);
      const references = parsed.references ?? [];

      // Idempotency: skip if reference already present
      if (A.some(references, (ref) => ref.path === packagePath)) {
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
      const parsed: TsconfigWithPaths = jsonc.parse(content);
      const paths = parsed.compilerOptions?.paths ?? {};

      // Idempotency: skip if alias already present
      if (alias in paths) {
        return content;
      }

      let result = content;

      const edits1 = jsonc.modify(result, ["compilerOptions", "paths", alias], [`./${packagePath}/src/index.ts`], {
        formattingOptions: FORMATTING_OPTIONS,
      });
      result = jsonc.applyEdits(result, edits1);

      const edits2 = jsonc.modify(result, ["compilerOptions", "paths", `${alias}/*`], [`./${packagePath}/src/*.ts`], {
        formattingOptions: FORMATTING_OPTIONS,
      });
      result = jsonc.applyEdits(result, edits2);

      return result;
    });
  }
);

/**
 * Orchestrate all root config updates for a newly created package.
 *
 * Delegates to {@link updateTsconfigPackages} and {@link updateTsconfigPaths}
 * in sequence, returning a summary of which files were actually written.
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
    const tsconfigPackages = yield* updateTsconfigPackages(repoRoot, packagePath);
    const tsconfigPaths = yield* updateTsconfigPaths(repoRoot, packageName, packagePath);
    return { tsconfigPackages, tsconfigPaths };
  }
);

/**
 * Check whether config entries already exist (for dry-run output).
 *
 * Returns `true` for each config file that **would need** an update.
 * Unlike {@link updateRootConfigs}, this function is read-only and never
 * modifies files on disk.
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
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const pkgsContent = yield* fs
      .readFileString(path.join(repoRoot, "tsconfig.packages.json"))
      .pipe(
        Effect.mapError((e) => new DomainError({ message: `Failed to read tsconfig.packages.json: ${String(e)}` }))
      );
    const pkgsParsed: TsconfigReferences = jsonc.parse(pkgsContent);
    const references = pkgsParsed.references ?? [];
    const tsconfigPackages = !A.some(references, (ref) => ref.path === packagePath);

    const rootContent = yield* fs
      .readFileString(path.join(repoRoot, "tsconfig.json"))
      .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to read tsconfig.json: ${String(e)}` })));
    const rootParsed: TsconfigWithPaths = jsonc.parse(rootContent);
    const paths = rootParsed.compilerOptions?.paths ?? {};
    const alias = `@beep/${packageName}`;
    const tsconfigPaths = !(alias in paths);

    return { tsconfigPackages, tsconfigPaths };
  }
);
