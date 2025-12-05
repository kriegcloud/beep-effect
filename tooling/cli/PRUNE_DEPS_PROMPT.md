# Implementation Prompt: Prune Unused Dependencies CLI

> **Objective**: Create the `beep prune-unused-deps` CLI command that scans workspace packages for `@beep/*` imports, compares them against declared dependencies, and reports/removes unused workspace dependencies from `package.json` and `tsconfig*.json` files.

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `beep prune-unused-deps --dry-run` | Report unused deps without modifying files |
| `beep prune-unused-deps` | Remove unused deps and update files |
| `beep prune-unused-deps --filter @beep/iam-infra` | Process single workspace |
| `beep prune-unused-deps --include-tests` | Also scan `test/` directories |

---

## Part 1: Essential Context

### Files to Read First

Read these files in order to understand patterns and available utilities:

```
tooling/cli/src/index.ts              # CLI entry point, layer composition
tooling/cli/src/commands/sync.ts      # Example command with Effect patterns
tooling/utils/src/FsUtils.ts          # Filesystem utilities (glob, readJson, writeJson)
tooling/utils/src/repo/index.ts       # All repo utilities exported here
tooling/utils/src/repo/Dependencies.ts        # extractWorkspaceDependencies
tooling/utils/src/repo/DependencyIndex.ts     # buildRepoDependencyIndex
tooling/utils/src/repo/PackageFileMap.ts      # mapWorkspaceToSourceFiles
tooling/utils/src/repo/TsConfigIndex.ts       # collectTsConfigPaths
tooling/utils/src/repo/Workspaces.ts          # resolveWorkspaceDirs
tooling/utils/src/schemas/PackageJson.ts      # PackageJson schema
tooling/utils/src/schemas/TsConfigJson.ts     # TsConfigJson schema
```

### Available Utilities (use these, don't reinvent)

```typescript
// From @beep/tooling-utils/repo
import {
  findRepoRoot,              // Effect<string> - absolute repo root path
  resolveWorkspaceDirs,      // Effect<HashMap<name, dir>> - all workspaces
  buildRepoDependencyIndex,  // Effect<HashMap<WorkspacePkgKeyT, RepoDepMapValueT>>
  mapWorkspaceToSourceFiles, // Effect<HashMap<name, HashSet<filePaths>>>
  mapWorkspaceToPackageJsonPath, // Effect<HashMap<name, packageJsonPath>>
  collectTsConfigPaths,      // Effect<HashMap<name, A.NonEmptyReadonlyArray<string>>>
} from "@beep/tooling-utils/repo";

// From @beep/tooling-utils
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils";
```

---

## Part 2: Implementation

### File Structure

Create: `tooling/cli/src/commands/prune-unused-deps.ts`

### Step 1: Imports

```typescript
import {
  buildRepoDependencyIndex,
  collectTsConfigPaths,
  findRepoRoot,
  mapWorkspaceToPackageJsonPath,
  mapWorkspaceToSourceFiles,
  resolveWorkspaceDirs,
} from "@beep/tooling-utils/repo";
import { FsUtils } from "@beep/tooling-utils";
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
```

### Step 2: CLI Options

```typescript
const dryRunOption = CliOptions.boolean("dry-run").pipe(
  CliOptions.withAlias("d"),
  CliOptions.withDescription("Report unused dependencies without modifying files"),
  CliOptions.withDefault(true)  // Safe default: dry-run
);

const filterOption = CliOptions.optional(CliOptions.text("filter")).pipe(
  CliOptions.withAlias("f"),
  CliOptions.withDescription("Filter to specific workspace (e.g. @beep/iam-infra)")
);

const includeTestsOption = CliOptions.boolean("include-tests").pipe(
  CliOptions.withAlias("t"),
  CliOptions.withDescription("Also scan test/ directories for imports"),
  CliOptions.withDefault(false)
);
```

### Step 3: JSONC Parser (for tsconfig files with comments)

```typescript
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
```

### Step 4: Import Scanner

```typescript
/**
 * Comprehensive patterns for @beep/* imports.
 * Matches: import, import type, export from, dynamic import, require
 */
const BEEP_IMPORT_PATTERNS = [
  /from\s+["'](@beep\/[^"'/\s]+)/g,           // import/export from
  /import\s+["'](@beep\/[^"'/\s]+)["']/g,     // side-effect import
  /import\s*\(\s*["'](@beep\/[^"'/\s]+)/g,    // dynamic import
  /require\s*\(\s*["'](@beep\/[^"'/\s]+)/g,   // require
] as const;

/**
 * NOTE: This function uses a while loop for regex iteration as an
 * intentional exception. There is no Effect-native regex iterator.
 */
const extractMatchesFromPattern = (
  content: string,
  pattern: RegExp
): ReadonlyArray<string> => {
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
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const allImports = yield* pipe(
      A.fromIterable(HashSet.values(sourceFiles)),
      Effect.forEach((filePath) =>
        pipe(
          fs.readFileString(filePath),
          Effect.map(extractImportsFromContent)
        )
      ),
      Effect.map((sets) =>
        pipe(
          sets,
          A.reduce(HashSet.empty<string>(), HashSet.union)
        )
      )
    );

    // Remove self-references
    return HashSet.remove(allImports, workspaceName);
  });
```

### Step 5: Dependency Comparison

```typescript
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
    A.filter(([k, v]) =>
      Str.startsWith(k, "@beep/") && Str.startsWith(v, "workspace:")
    ),
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
  unusedInDependencies: A.fromIterable(
    HashSet.difference(declaredDeps.dependencies, actualImports)
  ),
  unusedInDevDependencies: A.fromIterable(
    HashSet.difference(declaredDeps.devDependencies, actualImports)
  ),
  unusedInPeerDependencies: A.fromIterable(
    HashSet.difference(declaredDeps.peerDependencies, actualImports)
  ),
});
```

### Step 6: File Modification Functions

```typescript
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
    const utils = yield* FsUtils;

    const allUnused = pipe(
      unused.unusedInDependencies,
      A.appendAll(unused.unusedInDevDependencies),
      A.appendAll(unused.unusedInPeerDependencies)
    );

    if (A.isEmpty(allUnused)) return false;

    // Report
    yield* Console.log(color.cyan(`\n${unused.workspaceName}:`));

    if (A.isNonEmptyArray(unused.unusedInDependencies)) {
      yield* Console.log(color.yellow("  Unused in dependencies:"));
      yield* Effect.forEach(
        unused.unusedInDependencies,
        (dep) => Console.log(`    - ${dep}`),
        { discard: true }
      );
    }

    if (A.isNonEmptyArray(unused.unusedInDevDependencies)) {
      yield* Console.log(color.yellow("  Unused in devDependencies:"));
      yield* Effect.forEach(
        unused.unusedInDevDependencies,
        (dep) => Console.log(`    - ${dep}`),
        { discard: true }
      );
    }

    if (A.isNonEmptyArray(unused.unusedInPeerDependencies)) {
      yield* Console.log(color.yellow("  Unused in peerDependencies:"));
      yield* Effect.forEach(
        unused.unusedInPeerDependencies,
        (dep) => Console.log(`    - ${dep}`),
        { discard: true }
      );
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
    const utils = yield* FsUtils;

    // Build set of directories for unused workspaces
    const unusedDirs = pipe(
      unusedWorkspaces,
      A.filterMap((ws) => HashMap.get(workspaceDirs, ws)),
      HashSet.fromIterable
    );

    yield* Effect.forEach(
      tsconfigPaths,
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
              const targetDir = Str.endsWith(refPath, ".json")
                ? path_.dirname(refPath)
                : refPath;
              return !HashSet.has(unusedDirs, targetDir);
            })
          );

          // Log removals in dry-run mode
          if (dryRun) {
            const removedRefs = pipe(
              refs,
              A.filter((ref) => {
                const refPath = path_.resolve(tsconfigDir, ref.path);
                const targetDir = Str.endsWith(refPath, ".json")
                  ? path_.dirname(refPath)
                  : refPath;
                return HashSet.has(unusedDirs, targetDir);
              })
            );
            yield* Effect.forEach(
              removedRefs,
              (ref) =>
                Console.log(
                  `  Would remove reference: ${ref.path} from ${tsconfigPath}`
                ),
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
```

### Step 7: Main Handler

```typescript
const handlePruneCommand = ({
  dryRun,
  filter,
  includeTests,
}: {
  dryRun: boolean;
  filter: O.Option<string>;
  includeTests: boolean;
}) =>
  Effect.gen(function* () {
    const utils = yield* FsUtils;
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
      yield* Console.log(
        color.yellow(`Warning: Workspace "${filter.value}" not found in monorepo.`)
      );
      return;
    }

    // Process all workspaces and collect unused counts
    const results = yield* Effect.forEach(
      workspacesToProcess,
      (workspace) =>
        Effect.gen(function* () {
          if (workspace === "@beep/root") return 0;

          const wsDir = HashMap.get(workspaceDirs, workspace);
          const declaredDeps = HashMap.get(depIndex, workspace);
          const packageJsonPath = HashMap.get(packageJsonMap, workspace);
          const tsconfigPaths = HashMap.get(tsconfigMap, workspace);

          if (
            O.isNone(wsDir) ||
            O.isNone(declaredDeps) ||
            O.isNone(packageJsonPath)
          ) {
            return 0;
          }

          // Scan source files
          const scanDirs = includeTests ? ["src", "test"] : ["src"];

          const allSourceFiles = yield* pipe(
            scanDirs,
            Effect.forEach((dir) =>
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
            ),
            Effect.map((sets) =>
              pipe(sets, A.reduce(HashSet.empty<string>(), HashSet.union))
            )
          );

          if (HashSet.size(allSourceFiles) === 0) return 0;

          // Scan actual imports
          const actualImports = yield* scanWorkspaceImports(
            workspace,
            allSourceFiles
          );

          // Get peer dependencies from raw package.json
          const rawPkgJson = yield* utils.readJson(packageJsonPath.value);
          const peerWorkspaceDeps = extractPeerWorkspaceDeps(rawPkgJson);

          // Find unused
          const unused = findUnusedDeps(
            workspace,
            packageJsonPath.value,
            actualImports,
            {
              dependencies: declaredDeps.value.dependencies.workspace,
              devDependencies: declaredDeps.value.devDependencies.workspace,
              peerDependencies: peerWorkspaceDeps,
            }
          );

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

            yield* removeUnusedFromTsConfigs(
              tsconfigPaths.value,
              allUnused,
              workspaceDirs,
              dryRun
            );
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
      yield* Console.log(
        color.yellow(`Found ${totalUnused} unused workspace dependencies.`)
      );
      yield* Console.log(color.cyan("Run without --dry-run to remove them."));
    } else {
      yield* Console.log(
        color.green(`Removed ${totalUnused} unused workspace dependencies.`)
      );
      yield* Console.log(color.cyan("Run 'bun install' to update lockfile."));
    }
  });
```

### Step 8: Export Command

```typescript
export const pruneUnusedDepsCommand = CliCommand.make(
  "prune-unused-deps",
  { dryRun: dryRunOption, filter: filterOption, includeTests: includeTestsOption },
  () => handlePruneCommand
).pipe(
  CliCommand.withDescription("Find and remove unused @beep/* workspace dependencies.")
);
```

### Step 9: Register in CLI Index

Edit `tooling/cli/src/index.ts`:

```typescript
import { pruneUnusedDepsCommand } from "./commands/prune-unused-deps.js";

const repoCommand = CliCommand.make("beep").pipe(
  CliCommand.withDescription("Beep repository maintenance CLI."),
  CliCommand.withSubcommands([envCommand, syncCommand, pruneUnusedDepsCommand])
);
```

---

## Part 3: Testing

### Type Check

```bash
bunx turbo run check --filter=@beep/tooling-cli
```

### Dry Run (Safe)

```bash
cd /path/to/beep-effect
bun run tooling/cli/src/index.ts prune-unused-deps --dry-run
```

### Test Single Package

```bash
bun run tooling/cli/src/index.ts prune-unused-deps --dry-run --filter @beep/iam-infra
```

### Apply Changes

```bash
bun run tooling/cli/src/index.ts prune-unused-deps
bun install  # Update lockfile after removal
```

---

## Part 4: Edge Cases to Handle

| Case | Handling |
|------|----------|
| Re-exports without direct imports | Import scanner catches `export * from` |
| Type-only imports | `import type` is matched by the regex |
| Dynamic imports | `import("@beep/...")` is matched |
| Side-effect imports | `import "@beep/..."` is matched |
| Subpath imports | `@beep/pkg/subpath` normalized to `@beep/pkg` |
| Self-references | Filtered out in `scanWorkspaceImports` |
| Test-only deps | Use `--include-tests` flag |
| JSONC tsconfig | `stripJsonComments` handles comments |
| Empty src directory | Skipped gracefully |
| Filtered workspace not found | Warning displayed |

---

## Part 5: API Reference

### Effect Patterns Used

```typescript
// Effect generator for async/effectful code
Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;  // Access service
  const result = yield* someEffect;          // Await effect
});

// Concurrent iteration with Effect.forEach
yield* Effect.forEach(items, (item) => processItem(item), { discard: true });

// Collecting results from iteration
const results = yield* Effect.forEach(items, (item) => processItem(item));
const total = pipe(results, A.reduce(0, (acc, n) => acc + n));

// Option handling
O.match(optionalValue, {
  onNone: () => defaultValue,
  onSome: (value) => processValue(value),
});

// HashSet operations
const union = HashSet.union(setA, setB);
const difference = HashSet.difference(setA, setB);  // A - B
const fromArray = HashSet.fromIterable(array);

// Array operations (instead of native methods)
const combined = pipe(arr1, A.appendAll(arr2), A.appendAll(arr3));
const isEmpty = A.isEmpty(arr);
const isNonEmpty = A.isNonEmptyArray(arr);
const length = A.length(arr);
const filtered = pipe(arr, A.filter(predicate));
const mapped = pipe(arr, A.map(fn));

// Record operations (instead of Object methods)
const entries = R.toEntries(record);
const fromEntries = R.fromEntries(entries);

// String operations (instead of native methods)
const startsWith = Str.startsWith(str, prefix);
const endsWith = Str.endsWith(str, suffix);
const parts = Str.split(str, delimiter);
```

### Layer Composition

```typescript
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunTerminal from "@effect/platform-bun/BunTerminal";
import { FsUtilsLive } from "@beep/tooling-utils";

const runtimeLayers = Layer.mergeAll(
  BunContext.layer,
  BunTerminal.layer,
  FsUtilsLive  // Includes BunFileSystem and BunPath
);
```

---

## Checklist Before PR

- [ ] Command runs without errors in dry-run mode
- [ ] All type checks pass (`bunx turbo run check --filter=@beep/tooling-cli`)
- [ ] Tested on multiple packages
- [ ] JSONC parsing works for tsconfig files
- [ ] Import patterns catch all variations
- [ ] Summary output is clear and actionable
- [ ] No native Array/Object/String/Set methods used (Effect equivalents only)
- [ ] No for...of or while loops (except documented parser exception)
- [ ] All mutations use immutable patterns
