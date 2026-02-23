/**
 * @fileoverview Unused workspace dependency pruning command
 *
 * Scans packages for @beep/* workspace dependencies that are declared in
 * package.json but never imported in source files. Removes unused dependencies
 * from both package.json and tsconfig references. Supports dry-run mode,
 * package filtering, and test directory exclusion.
 *
 * @module @beep/tooling-cli/commands/prune-unused-deps
 * @since 1.0.0
 * @category Commands
 *
 * @example
 * ```typescript
 * import { pruneUnusedDepsCommand } from "@beep/tooling-cli/commands/prune-unused-deps"
 * import * as CliCommand from "@effect/cli/Command"
 *
 * // Run dry-run scan (default)
 * // beep prune-unused-deps --dry-run
 *
 * // Remove unused deps from specific package
 * // beep prune-unused-deps --filter @beep/iam-server
 *
 * // Exclude test directories from scan
 * // beep prune-unused-deps --exclude-tests
 * ```
 */

import * as FsUtils from "@beep/tooling-utils";
import {
  buildRepoDependencyIndex,
  collectTsConfigPaths,
  mapWorkspaceToPackageJsonPath,
  resolveWorkspaceDirs,
} from "@beep/tooling-utils/repo";
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import color from "picocolors";

// -----------------------------------------------------------------------------
// CLI Options
// -----------------------------------------------------------------------------

const dryRunOption = CliOptions.boolean("dry-run").pipe(
  CliOptions.withAlias("d"),
  CliOptions.withDescription("Report unused dependencies without modifying files"),
  CliOptions.withDefault(true) // Safe default: dry-run
);

const filterOption = CliOptions.optional(CliOptions.text("filter")).pipe(
  CliOptions.withAlias("f"),
  CliOptions.withDescription("Filter to specific workspace (e.g. @beep/iam-server)")
);

const excludeTestsOption = CliOptions.boolean("exclude-tests").pipe(
  CliOptions.withDescription("Exclude test/ directories from import scanning")
);

// -----------------------------------------------------------------------------
// JSONC Parser (for tsconfig files with comments)
// -----------------------------------------------------------------------------

/**
 * NOTE: This function uses imperative style (while loop, mutable variables)
 * as an intentional exception. It is a pure, low-level parser with no side
 * effects, and there is no Effect-native regex/character iterator.
 */
const stripJsonComments = (content: string): string => {
  let result = "";
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i]!;
    const nextChar = content[i + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        result += char;
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (inString) {
      result += char;
      if (char === '"' && content[i - 1] !== "\\") {
        inString = false;
      }
      i++;
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      i++;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (char === "/" && nextChar === "*") {
      inBlockComment = true;
      i += 2;
      continue;
    }

    result += char;
    i++;
  }

  return result;
};

const readJsonc = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFileString(path);
    const stripped = stripJsonComments(content);
    return JSON.parse(stripped) as Record<string, unknown>;
  });

// -----------------------------------------------------------------------------
// Import Scanner
// -----------------------------------------------------------------------------

/**
 * Comprehensive patterns for @beep/* imports.
 * Matches: import, import type, export from, dynamic import, require
 */
const BEEP_IMPORT_PATTERNS = [
  /from\s+["'](@beep\/[^"'/\s]+)/g, // import/export from
  /import\s+["'](@beep\/[^"'/\s]+)["']/g, // side-effect import
  /import\s*\(\s*["'](@beep\/[^"'/\s]+)/g, // dynamic import
  /require\s*\(\s*["'](@beep\/[^"'/\s]+)/g, // require
] as const;

/**
 * NOTE: This function uses a while loop for regex iteration as an
 * intentional exception. There is no Effect-native regex iterator.
 */
const extractMatchesFromPattern = (content: string, pattern: RegExp): ReadonlyArray<string> => {
  const regex = new RegExp(pattern.source, pattern.flags);
  const matches: Array<string> = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const pkg = match[1];
    if (pkg) {
      matches.push(pkg);
    }
  }

  return matches;
};

const extractImportsFromContent = (content: string): HashSet.HashSet<string> =>
  pipe(
    BEEP_IMPORT_PATTERNS,
    A.flatMap((pattern) => extractMatchesFromPattern(content, pattern)),
    A.map((pkg) =>
      // Normalize subpath imports: @beep/pkg/subpath -> @beep/pkg
      pipe(pkg, Str.split("/"), A.take(2), A.join("/"))
    ),
    HashSet.fromIterable
  );

const scanWorkspaceImports = (
  workspaceName: string,
  sourceFiles: HashSet.HashSet<string>
): Effect.Effect<HashSet.HashSet<string>, Error, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const fileList = A.fromIterable(HashSet.values(sourceFiles));
    const importSets = yield* Effect.forEach(fileList, (filePath) =>
      pipe(fs.readFileString(filePath), Effect.map(extractImportsFromContent))
    );

    const allImports = A.reduce(importSets, HashSet.empty<string>(), (acc, set) => HashSet.union(acc, set));

    // Remove self-references
    return HashSet.remove(allImports, workspaceName);
  });

// -----------------------------------------------------------------------------
// Dependency Comparison
// -----------------------------------------------------------------------------

interface UnusedDeps {
  readonly workspaceName: string;
  readonly packageJsonPath: string;
  readonly unusedInDependencies: ReadonlyArray<string>;
  readonly unusedInDevDependencies: ReadonlyArray<string>;
  readonly unusedInPeerDependencies: ReadonlyArray<string>;
}

const extractPeerWorkspaceDeps = (json: Record<string, unknown>): HashSet.HashSet<string> => {
  const peerDeps = (json.peerDependencies ?? {}) as Record<string, string>;
  return pipe(
    R.toEntries(peerDeps),
    A.filter(([k, v]) => Str.startsWith("@beep/")(k) && Str.startsWith("workspace:")(v)),
    A.map(([k]) => k),
    HashSet.fromIterable
  );
};

const findUnusedDeps = (
  workspaceName: string,
  packageJsonPath: string,
  actualImports: HashSet.HashSet<string>,
  declaredDeps: {
    dependencies: HashSet.HashSet<string>;
    devDependencies: HashSet.HashSet<string>;
    peerDependencies: HashSet.HashSet<string>;
  }
): UnusedDeps => ({
  workspaceName,
  packageJsonPath,
  unusedInDependencies: A.fromIterable(HashSet.difference(declaredDeps.dependencies, actualImports)),
  unusedInDevDependencies: A.fromIterable(HashSet.difference(declaredDeps.devDependencies, actualImports)),
  unusedInPeerDependencies: A.fromIterable(HashSet.difference(declaredDeps.peerDependencies, actualImports)),
});

// -----------------------------------------------------------------------------
// File Modification Functions
// -----------------------------------------------------------------------------

/**
 * Helper to remove keys from a record immutably.
 */
const removeDeps = (
  deps: Record<string, unknown> | undefined,
  toRemove: ReadonlyArray<string>
): Record<string, unknown> | undefined => {
  if (!deps) return deps;
  const toRemoveSet = HashSet.fromIterable(toRemove);
  return pipe(
    R.toEntries(deps),
    A.filter(([k]) => !HashSet.has(toRemoveSet, k)),
    R.fromEntries
  );
};

const removeUnusedFromPackageJson = (unused: UnusedDeps, dryRun: boolean) =>
  Effect.gen(function* () {
    const utils = yield* FsUtils.FsUtils;

    const allUnused = pipe(
      unused.unusedInDependencies,
      A.appendAll(unused.unusedInDevDependencies),
      A.appendAll(unused.unusedInPeerDependencies)
    );

    if (A.isEmptyArray(allUnused)) return false;

    // Report
    yield* Console.log(color.cyan(`\n${unused.workspaceName}:`));

    if (A.isNonEmptyReadonlyArray(unused.unusedInDependencies)) {
      yield* Console.log(color.yellow("  Unused in dependencies:"));
      yield* Effect.forEach(A.fromIterable(unused.unusedInDependencies), (dep) => Console.log(`    - ${dep}`), {
        discard: true,
      });
    }

    if (A.isNonEmptyReadonlyArray(unused.unusedInDevDependencies)) {
      yield* Console.log(color.yellow("  Unused in devDependencies:"));
      yield* Effect.forEach(A.fromIterable(unused.unusedInDevDependencies), (dep) => Console.log(`    - ${dep}`), {
        discard: true,
      });
    }

    if (A.isNonEmptyReadonlyArray(unused.unusedInPeerDependencies)) {
      yield* Console.log(color.yellow("  Unused in peerDependencies:"));
      yield* Effect.forEach(A.fromIterable(unused.unusedInPeerDependencies), (dep) => Console.log(`    - ${dep}`), {
        discard: true,
      });
    }

    if (dryRun) return true;

    // Apply changes - reconstruct objects immutably
    const json = yield* utils.readJson(unused.packageJsonPath);

    json.dependencies = removeDeps(
      json.dependencies as Record<string, unknown> | undefined,
      unused.unusedInDependencies
    );
    json.devDependencies = removeDeps(
      json.devDependencies as Record<string, unknown> | undefined,
      unused.unusedInDevDependencies
    );
    json.peerDependencies = removeDeps(
      json.peerDependencies as Record<string, unknown> | undefined,
      unused.unusedInPeerDependencies
    );

    yield* utils.writeJson(unused.packageJsonPath, json);
    yield* Console.log(color.green(`  Updated ${unused.packageJsonPath}`));

    return true;
  });

const removeUnusedFromTsConfigs = (
  tsconfigPaths: ReadonlyArray<string>,
  unusedWorkspaces: ReadonlyArray<string>,
  workspaceDirs: HashMap.HashMap<string, string>,
  dryRun: boolean
) =>
  Effect.gen(function* () {
    const path_ = yield* Path.Path;
    const utils = yield* FsUtils.FsUtils;

    // Build set of directories for unused workspaces
    const unusedDirs = pipe(
      unusedWorkspaces,
      A.filterMap((ws) => HashMap.get(workspaceDirs, ws)),
      HashSet.fromIterable
    );

    yield* Effect.forEach(
      A.fromIterable(tsconfigPaths),
      (tsconfigPath) =>
        Effect.gen(function* () {
          const json = yield* readJsonc(tsconfigPath);

          if (!json.references || !A.isArray(json.references)) return;

          const tsconfigDir = path_.dirname(tsconfigPath);
          const refs = json.references as Array<{ path: string }>;
          const originalLength = A.length(refs);

          const filteredRefs = pipe(
            refs,
            A.filter((ref) => {
              const refPath = path_.resolve(tsconfigDir, ref.path);
              const targetDir = Str.endsWith(".json")(refPath) ? path_.dirname(refPath) : refPath;
              return !HashSet.has(unusedDirs, targetDir);
            })
          );

          // Log removals in dry-run mode
          if (dryRun) {
            const removedRefs = pipe(
              refs,
              A.filter((ref) => {
                const refPath = path_.resolve(tsconfigDir, ref.path);
                const targetDir = Str.endsWith(".json")(refPath) ? path_.dirname(refPath) : refPath;
                return HashSet.has(unusedDirs, targetDir);
              })
            );
            yield* Effect.forEach(
              removedRefs,
              (ref) => Console.log(`  Would remove reference: ${ref.path} from ${tsconfigPath}`),
              { discard: true }
            );
          }

          json.references = filteredRefs;

          if (!dryRun && A.length(filteredRefs) !== originalLength) {
            yield* utils.writeJson(tsconfigPath, json);
            yield* Console.log(color.green(`  Updated ${tsconfigPath}`));
          }
        }),
      { discard: true }
    );
  });

// -----------------------------------------------------------------------------
// Main Handler
// -----------------------------------------------------------------------------

const handlePruneCommand = ({
  dryRun,
  filter,
  excludeTests,
}: {
  dryRun: boolean;
  filter: O.Option<string>;
  excludeTests: boolean;
}) =>
  Effect.gen(function* () {
    const utils = yield* FsUtils.FsUtils;
    const path_ = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;

    yield* Console.log(color.cyan("Scanning for unused workspace dependencies..."));

    // Gather all data
    const workspaceDirs = yield* resolveWorkspaceDirs;
    const packageJsonMap = yield* mapWorkspaceToPackageJsonPath;
    const depIndex = yield* buildRepoDependencyIndex;
    const tsconfigMap = yield* collectTsConfigPaths;

    // Determine workspaces to process
    const workspacesToProcess = O.match(filter, {
      onNone: () => A.fromIterable(HashMap.keys(workspaceDirs)),
      onSome: (f) => A.make(f),
    });

    // Warn if filtered workspace doesn't exist
    if (O.isSome(filter) && !HashMap.has(workspaceDirs, filter.value)) {
      yield* Console.log(color.yellow(`Warning: Workspace "${filter.value}" not found in monorepo.`));
      return;
    }

    // Process all workspaces and collect unused counts
    const results = yield* Effect.forEach(workspacesToProcess, (workspace) =>
      Effect.gen(function* () {
        if (workspace === "@beep/root") return 0;

        const wsDir = HashMap.get(workspaceDirs, workspace);
        const declaredDeps = HashMap.get(depIndex, workspace as `@beep/${string}`);
        const packageJsonPath = HashMap.get(packageJsonMap, workspace);
        const tsconfigPaths = HashMap.get(tsconfigMap, workspace);

        if (O.isNone(wsDir) || O.isNone(declaredDeps) || O.isNone(packageJsonPath)) {
          return 0;
        }

        // Scan source files from directories (include tests by default)
        const scanDirs = excludeTests ? ["src"] : ["src", "test"];

        const sourceFileSets = yield* Effect.forEach(scanDirs, (dir) =>
          Effect.gen(function* () {
            const dirPath = path_.join(wsDir.value, dir);
            const exists = yield* fs.exists(dirPath);
            if (!exists) return HashSet.empty<string>();

            const files = yield* utils.globFiles(["**/*.ts", "**/*.tsx"], {
              cwd: dirPath,
              absolute: true,
              ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
            });
            return HashSet.fromIterable(files);
          })
        );

        // Scan root-level config files (next.config.ts, drizzle.config.ts, etc.)
        const configFilePatterns = ["*.config.ts", "*.config.mts", "*.config.cts", "*.config.js", "*.config.mjs"];

        const configFiles = yield* utils.globFiles(configFilePatterns, {
          cwd: wsDir.value,
          absolute: true,
          ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
        });

        const configFileSet = HashSet.fromIterable(configFiles);

        const allSourceFiles = pipe(
          sourceFileSets,
          A.reduce(HashSet.empty<string>(), (acc, set) => HashSet.union(acc, set)),
          (set) => HashSet.union(set, configFileSet)
        );

        if (HashSet.size(allSourceFiles) === 0) return 0;

        // Scan actual imports
        const actualImports = yield* scanWorkspaceImports(workspace, allSourceFiles);

        // Get peer dependencies from raw package.json
        const rawPkgJson = yield* utils.readJson(packageJsonPath.value);
        const peerWorkspaceDeps = extractPeerWorkspaceDeps(rawPkgJson);

        // Find unused - map branded HashSet to regular string HashSet for comparison
        const workspaceDepsAsStrings: HashSet.HashSet<string> = pipe(
          declaredDeps.value.dependencies.workspace,
          HashSet.map((s): string => s)
        );
        const devDepsAsStrings: HashSet.HashSet<string> = pipe(
          declaredDeps.value.devDependencies.workspace,
          HashSet.map((s): string => s)
        );

        const unused = findUnusedDeps(workspace, packageJsonPath.value, actualImports, {
          dependencies: workspaceDepsAsStrings,
          devDependencies: devDepsAsStrings,
          peerDependencies: peerWorkspaceDeps,
        });

        const unusedCount =
          A.length(unused.unusedInDependencies) +
          A.length(unused.unusedInDevDependencies) +
          A.length(unused.unusedInPeerDependencies);

        if (unusedCount === 0) return 0;

        // Update package.json
        yield* removeUnusedFromPackageJson(unused, dryRun);

        // Update tsconfig files
        if (O.isSome(tsconfigPaths)) {
          const allUnused = pipe(
            unused.unusedInDependencies,
            A.appendAll(unused.unusedInDevDependencies),
            A.appendAll(unused.unusedInPeerDependencies)
          );

          yield* removeUnusedFromTsConfigs(tsconfigPaths.value, allUnused, workspaceDirs, dryRun);
        }

        return unusedCount;
      })
    );

    const totalUnused = pipe(
      results,
      A.reduce(0, (acc, n) => acc + n)
    );

    // Summary
    yield* Console.log("");

    if (totalUnused === 0) {
      yield* Console.log(color.green("No unused workspace dependencies found!"));
    } else if (dryRun) {
      yield* Console.log(color.yellow(`Found ${totalUnused} unused workspace dependencies.`));
      yield* Console.log(color.cyan("Run without --dry-run to remove them."));
    } else {
      yield* Console.log(color.green(`Removed ${totalUnused} unused workspace dependencies.`));
      yield* Console.log(color.cyan("Run 'bun install' to update lockfile."));
    }
  });

// -----------------------------------------------------------------------------
// Export Command
// -----------------------------------------------------------------------------

/**
 * Command to find and remove unused workspace dependencies.
 *
 * Scans packages for @beep/* dependencies that are declared in package.json
 * but never imported in source files. Supports dry-run mode, package filtering,
 * and test file exclusion.
 *
 * @example
 * ```ts
 * import { pruneUnusedDepsCommand } from "@beep/repo-cli/commands/prune-unused-deps"
 * import * as CliCommand from "@effect/cli/Command"
 *
 * // Compose into CLI
 * const cli = CliCommand.make("beep").pipe(
 *   CliCommand.withSubcommands([pruneUnusedDepsCommand])
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const pruneUnusedDepsCommand = CliCommand.make(
  "prune-unused-deps",
  { dryRun: dryRunOption, filter: filterOption, excludeTests: excludeTestsOption },
  (args) => handlePruneCommand(args)
).pipe(CliCommand.withDescription("Find and remove unused @beep/* workspace dependencies."));
