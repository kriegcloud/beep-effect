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

import { $RepoCliId } from "@beep/identity/packages";
import { DomainError } from "@beep/repo-utils";
import { thunkFalse, thunkNegative1, thunkSomeEmptyArray, thunkSomeFalse } from "@beep/utils";
import { Effect, FileSystem, HashMap, Order, Path, pipe, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as jsonc from "jsonc-parser";
import { decodeJsoncTextAsLive } from "../Shared/SchemaCodecs/index.js";
import { buildCanonicalAliasTargets } from "../Shared/TsconfigAliasTargets.js";

const $I = $RepoCliId.create("commands/CreatePackage/ConfigUpdater");

// ── Types ────────────────────────────────────────────────────────────────────

/**
 * Summary of which root configuration files were modified during a config update pass.
 *
 * Each boolean field is `true` when the corresponding file was actually written
 * (or, in the case of {@link checkConfigNeedsUpdate}, would need updating).
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ConfigUpdateResult extends S.Class<ConfigUpdateResult>($I`ConfigUpdateResult`)(
  {
    tsconfigPackages: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefault(thunkFalse)),
    tsconfigPaths: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefault(thunkFalse)),
    tstycheConfig: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefault(thunkFalse)),
  },
  $I.annote("ConfigUpdateResult", {
    description: "Summary of root configuration files modified during a config update pass.",
  })
) {}

/**
 * Config update target for a package that should be registered in root tsconfig files.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ConfigUpdateTarget extends S.Class<ConfigUpdateTarget>($I`ConfigUpdateTarget`)(
  {
    packageName: S.String,
    packagePath: S.String,
    rootAliasTarget: S.String.pipe(S.UndefinedOr, S.optionalKey),
    wildcardAliasTarget: S.String.pipe(S.UndefinedOr, S.optionalKey),
  },
  $I.annote("ConfigUpdateTarget", {
    description: "Config update target for a package registered in root tsconfig files.",
  })
) {}

/**
 * Per-target config update summary.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ConfigUpdateTargetResult extends S.Class<ConfigUpdateTargetResult>($I`ConfigUpdateTargetResult`)(
  {
    target: ConfigUpdateTarget,
    result: ConfigUpdateResult,
  },
  $I.annote("ConfigUpdateTargetResult", {
    description: "Per-target config update summary.",
  })
) {}

const DefaultedBoolean = S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefault(thunkFalse));

const DefaultedConfigUpdateTargetResults = S.Array(ConfigUpdateTargetResult).pipe(
  S.withConstructorDefault(thunkSomeEmptyArray<ConfigUpdateTargetResult>),
  S.withDecodingDefault(A.empty<ConfigUpdateTargetResult>)
);

/**
 * Batch config orchestration result for one or more package targets.
 *
 * `tsconfigPackages` and `tsconfigPaths` are aggregate booleans indicating whether
 * at least one target changed (or needs a change, in check mode) for the file.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ConfigUpdateBatchResult extends S.Class<ConfigUpdateBatchResult>($I`ConfigUpdateBatchResult`)(
  {
    targets: DefaultedConfigUpdateTargetResults,
    tsconfigPackages: DefaultedBoolean,
    tsconfigPaths: DefaultedBoolean,
    tstycheConfig: DefaultedBoolean,
  },
  $I.annote("ConfigUpdateBatchResult", {
    description: "Batch config orchestration result for one or more package targets.",
  })
) {}

// ── Internal helpers ─────────────────────────────────────────────────────────

const FORMATTING_OPTIONS: jsonc.FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
};

const PACKAGE_PATH_PATTERN = /^[a-z0-9][a-z0-9/_-]*$/;
const TSTYCHE_TEST_FILE_MATCH_PATTERN = /\/dtslint\/\*\*\/\*\.tst\.\*$/;

const PackagePath = S.String.check(S.isPattern(PACKAGE_PATH_PATTERN)).pipe(
  S.brand("PackagePath"),
  S.annotate(
    $I.annote("PackagePath", {
      description: "Repo-relative package path segment used by root config updaters.",
    })
  )
);

const TstycheTestFileMatchPattern = S.String.check(S.isPattern(TSTYCHE_TEST_FILE_MATCH_PATTERN)).pipe(
  S.brand("TstycheTestFileMatchPattern"),
  S.annotate(
    $I.annote("TstycheTestFileMatchPattern", {
      description: "tstyche testFileMatch glob pattern for dtslint test files.",
    })
  )
);

const PackagePathToTstychePattern = PackagePath.pipe(
  S.decodeTo(
    TstycheTestFileMatchPattern,
    SchemaTransformation.transform({
      decode: (packagePath) => `${packagePath}/dtslint/**/*.tst.*`,
      encode: (pattern) => PackagePath.makeUnsafe(Str.replace(TSTYCHE_TEST_FILE_MATCH_PATTERN, "")(pattern)),
    })
  ),
  S.annotate(
    $I.annote("PackagePathToTstychePattern", {
      description: "Schema transformation from package path to tstyche testFileMatch glob.",
    })
  )
);

const decodeTstychePattern = S.decodeUnknownSync(PackagePathToTstychePattern);
const isPackagePath = S.is(PackagePath);
const stringEquivalence = S.toEquivalence(S.String);
const stringArrayEquivalence = S.toEquivalence(S.Array(S.String));
const JsoncUnknownObject = S.Record(S.String, S.Unknown).annotate(
  $I.annote("JsoncUnknownObject", {
    description: "Generic decoded JSONC object document map.",
  })
);

const parseJsoncObject: (content: string, filePath: string) => Effect.Effect<Record<string, unknown>, DomainError> =
  Effect.fn(function* (content, filePath) {
    return yield* decodeJsoncTextAsLive(JsoncUnknownObject)(content).pipe(
      Effect.mapError((cause) => new DomainError({ message: `Invalid JSONC in ${filePath}: ${cause.message}`, cause }))
    );
  });

const readReferences = (parsed: Record<string, unknown>): Array<unknown> =>
  A.isArray(parsed.references) ? [...parsed.references] : [];

const hasReferencePath = (entry: unknown, target: string): boolean =>
  P.isObject(entry) && P.isString(entry.path) && stringEquivalence(entry.path, target);

const readPathsRecord = (parsed: Record<string, unknown>): Record<string, unknown> => {
  if (!P.isObject(parsed.compilerOptions)) return {};
  if (!P.isObject(parsed.compilerOptions.paths)) return {};
  return parsed.compilerOptions.paths;
};

const pathValuesEqual = (currentValue: unknown, expectedValue: ReadonlyArray<string>): boolean => {
  if (!A.isArray(currentValue) || !A.every(currentValue, P.isString)) {
    return false;
  }

  return stringArrayEquivalence(currentValue, expectedValue);
};

const readTestFileMatch = (parsed: Record<string, unknown>): Array<unknown> =>
  A.isArray(parsed.testFileMatch) ? [...parsed.testFileMatch] : [];

const isTstycheEntryCovered = (testFileMatch: Array<unknown>, packagePath: string): boolean => {
  if (!isPackagePath(packagePath)) return false;
  const candidatePattern = decodeTstychePattern(packagePath);
  if (A.some(testFileMatch, (entry) => P.isString(entry) && stringEquivalence(entry, candidatePattern))) return true;
  const lastSlash = pipe(packagePath, Str.lastIndexOf("/"), O.getOrElse(thunkNegative1));
  if (lastSlash < 0) return false;
  const parentDir = Str.substring(0, lastSlash)(packagePath);
  const parentWildcard = `${parentDir}/*/dtslint/**/*.tst.*`;
  return A.some(testFileMatch, (entry) => P.isString(entry) && stringEquivalence(entry, parentWildcard));
};

const byPackagePathAscending: Order.Order<ConfigUpdateTarget> = Order.mapInput(
  Order.String,
  (target: ConfigUpdateTarget) => target.packagePath
);

const normalizeTargets = (targets: ReadonlyArray<ConfigUpdateTarget>): ReadonlyArray<ConfigUpdateTarget> => {
  let deduped = HashMap.empty<string, ConfigUpdateTarget>();
  for (const target of targets) {
    deduped = HashMap.set(deduped, target.packagePath, target);
  }

  return A.sort([...HashMap.values(deduped)], byPackagePathAscending);
};

const defaultAliasTargetsForPackage = (packagePath: string) =>
  buildCanonicalAliasTargets(packagePath, "./src/index.ts");

const aliasTargetsForTarget = (target: ConfigUpdateTarget) => ({
  rootAliasTarget: target.rootAliasTarget ?? defaultAliasTargetsForPackage(target.packagePath).rootAliasTarget,
  wildcardAliasTarget:
    target.wildcardAliasTarget ?? defaultAliasTargetsForPackage(target.packagePath).wildcardAliasTarget,
});

/**
 * Read → transform → write-if-changed. Returns `true` when the file was
 * actually modified.
 */
const modifyFileString: (
  filePath: string,
  transform: (content: string) => Effect.Effect<string, DomainError>
) => Effect.Effect<boolean, DomainError, FileSystem.FileSystem> = Effect.fn(function* (filePath, transform) {
  const fs = yield* FileSystem.FileSystem;
  const original = yield* fs
    .readFileString(filePath)
    .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to read ${filePath}: ${e}` })));
  const transformed = yield* transform(original);
  if (stringEquivalence(transformed, original)) return false;
  yield* fs
    .writeFileString(filePath, transformed)
    .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to write ${filePath}: ${e}` })));
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
 * @category Utility
 */
export const updateTsconfigPackages: (
  repoRoot: string,
  packagePath: string
) => Effect.Effect<boolean, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, packagePath) {
    const path = yield* Path.Path;
    const filePath = path.join(repoRoot, "tsconfig.packages.json");

    return yield* modifyFileString(
      filePath,
      Effect.fn(function* (content: string) {
        const parsed = yield* parseJsoncObject(content, filePath);
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
      })
    );
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
 * @category Utility
 */
export const updateTsconfigPaths: (
  repoRoot: string,
  target: ConfigUpdateTarget
) => Effect.Effect<boolean, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(function* (repoRoot, target) {
  const path = yield* Path.Path;
  const filePath = path.join(repoRoot, "tsconfig.json");
  const alias = `@beep/${target.packageName}`;
  const { rootAliasTarget, wildcardAliasTarget } = aliasTargetsForTarget(target);

  return yield* modifyFileString(
    filePath,
    Effect.fn(function* (content: string) {
      const parsed = yield* parseJsoncObject(content, filePath);
      const paths = readPathsRecord(parsed);
      const hasBaseAlias = pathValuesEqual(paths[alias], [rootAliasTarget]);
      const hasWildcardAlias = pathValuesEqual(paths[`${alias}/*`], [wildcardAliasTarget]);

      // Idempotency: skip if both aliases already present
      if (hasBaseAlias && hasWildcardAlias) {
        return content;
      }

      let result = content;

      if (!hasBaseAlias) {
        const edits1 = jsonc.modify(result, ["compilerOptions", "paths", alias], [rootAliasTarget], {
          formattingOptions: FORMATTING_OPTIONS,
        });
        result = jsonc.applyEdits(result, edits1);
      }

      if (!hasWildcardAlias) {
        const edits2 = jsonc.modify(result, ["compilerOptions", "paths", `${alias}/*`], [wildcardAliasTarget], {
          formattingOptions: FORMATTING_OPTIONS,
        });
        result = jsonc.applyEdits(result, edits2);
      }

      return result;
    })
  );
});

/**
 * Add a test file match entry to `tstyche.config.json`.
 *
 * Idempotent: if the entry already exists or is covered by a parent wildcard
 * glob, the file is left untouched.
 *
 * @param repoRoot - Absolute path to the repository root directory.
 * @param packagePath - Relative path from the repo root to the new package (e.g. `"packages/common/data"`).
 * @returns `true` when the file was modified, `false` when the entry already existed or was covered.
 * @depends FileSystem, Path
 * @since 0.0.0
 * @category Utility
 */
export const updateTstycheConfig: (
  repoRoot: string,
  packagePath: string
) => Effect.Effect<boolean, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, packagePath) {
    const path = yield* Path.Path;
    const filePath = path.join(repoRoot, "tstyche.config.json");

    return yield* modifyFileString(
      filePath,
      Effect.fn(function* (content: string) {
        const parsed = yield* parseJsoncObject(content, filePath);
        const testFileMatch = readTestFileMatch(parsed);

        if (isTstycheEntryCovered(testFileMatch, packagePath)) {
          return content;
        }

        const candidatePattern = pipe(
          packagePath,
          O.liftPredicate(isPackagePath),
          O.match({
            onNone: () => `${packagePath}/dtslint/**/*.tst.*`,
            onSome: decodeTstychePattern,
          })
        );
        const updated = A.append(testFileMatch, candidatePattern);
        const edits = jsonc.modify(content, ["testFileMatch"], updated, {
          formattingOptions: FORMATTING_OPTIONS,
        });
        return jsonc.applyEdits(content, edits);
      })
    );
  }
);

const updateRootConfigsForTarget: (
  repoRoot: string,
  target: ConfigUpdateTarget
) => Effect.Effect<ConfigUpdateResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, target) {
    const tsconfigPackages = yield* updateTsconfigPackages(repoRoot, target.packagePath);
    const tsconfigPaths = yield* updateTsconfigPaths(repoRoot, target);
    const tstycheConfig = yield* updateTstycheConfig(repoRoot, target.packagePath);
    return new ConfigUpdateResult({ tsconfigPackages, tsconfigPaths, tstycheConfig });
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
      .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to read tsconfig.packages.json: ${e}` })));
    const pkgsParsed = yield* parseJsoncObject(pkgsContent, "tsconfig.packages.json");
    const references = readReferences(pkgsParsed);
    const tsconfigPackages = !A.some(references, (ref) => hasReferencePath(ref, target.packagePath));

    const rootContent = yield* fs
      .readFileString(path.join(repoRoot, "tsconfig.json"))
      .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to read tsconfig.json: ${e}` })));
    const rootParsed = yield* parseJsoncObject(rootContent, "tsconfig.json");
    const paths = readPathsRecord(rootParsed);
    const alias = `@beep/${target.packageName}`;
    const { rootAliasTarget, wildcardAliasTarget } = aliasTargetsForTarget(target);
    const tsconfigPaths = !(
      pathValuesEqual(paths[alias], [rootAliasTarget]) && pathValuesEqual(paths[`${alias}/*`], [wildcardAliasTarget])
    );

    const tstycheContent = yield* fs
      .readFileString(path.join(repoRoot, "tstyche.config.json"))
      .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to read tstyche.config.json: ${e}` })));
    const tstycheParsed = yield* parseJsoncObject(tstycheContent, "tstyche.config.json");
    const testFileMatch = readTestFileMatch(tstycheParsed);
    const tstycheConfig = !isTstycheEntryCovered(testFileMatch, target.packagePath);

    return new ConfigUpdateResult({ tsconfigPackages, tsconfigPaths, tstycheConfig });
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
 * @category Utility
 */
export const updateRootConfigsForTargets: (
  repoRoot: string,
  targets: ReadonlyArray<ConfigUpdateTarget>
) => Effect.Effect<ConfigUpdateBatchResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, targets) {
    const normalizedTargets = normalizeTargets(targets);
    const targetResults = yield* Effect.forEach(normalizedTargets, (target) =>
      Effect.map(
        updateRootConfigsForTarget(repoRoot, target),
        (result) => new ConfigUpdateTargetResult({ target, result })
      )
    );

    return new ConfigUpdateBatchResult({
      targets: targetResults,
      tsconfigPackages: A.some(targetResults, ({ result }) => result.tsconfigPackages),
      tsconfigPaths: A.some(targetResults, ({ result }) => result.tsconfigPaths),
      tstycheConfig: A.some(targetResults, ({ result }) => result.tstycheConfig),
    });
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
 * @category Utility
 */
export const checkConfigNeedsUpdateForTargets: (
  repoRoot: string,
  targets: ReadonlyArray<ConfigUpdateTarget>
) => Effect.Effect<ConfigUpdateBatchResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, targets) {
    const normalizedTargets = normalizeTargets(targets);
    const targetResults = yield* Effect.forEach(normalizedTargets, (target) =>
      Effect.map(
        checkConfigNeedsUpdateForTarget(repoRoot, target),
        (result) => new ConfigUpdateTargetResult({ target, result })
      )
    );

    return new ConfigUpdateBatchResult({
      targets: targetResults,
      tsconfigPackages: A.some(targetResults, ({ result }) => result.tsconfigPackages),
      tsconfigPaths: A.some(targetResults, ({ result }) => result.tsconfigPaths),
      tstycheConfig: A.some(targetResults, ({ result }) => result.tstycheConfig),
    });
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
 * @category Utility
 */
export const updateRootConfigs: (
  repoRoot: string,
  packageName: string,
  packagePath: string
) => Effect.Effect<ConfigUpdateResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, packageName, packagePath) {
    const target = new ConfigUpdateTarget({
      packageName,
      packagePath,
      ...defaultAliasTargetsForPackage(packagePath),
    });
    const batchResult = yield* updateRootConfigsForTargets(repoRoot, [target]);
    return batchResult.targets[0]?.result ?? new ConfigUpdateResult({});
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
 * @category Utility
 */
export const checkConfigNeedsUpdate: (
  repoRoot: string,
  packageName: string,
  packagePath: string
) => Effect.Effect<ConfigUpdateResult, DomainError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, packageName, packagePath) {
    const target = new ConfigUpdateTarget({
      packageName,
      packagePath,
      ...defaultAliasTargetsForPackage(packagePath),
    });
    const batchResult = yield* checkConfigNeedsUpdateForTargets(repoRoot, [target]);
    return batchResult.targets[0]?.result ?? new ConfigUpdateResult({});
  }
);
