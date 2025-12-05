# Implementation Prompt: Dead Dependency Pruner CLI Command

This document provides a detailed implementation guide for building the `prune-unused-deps` CLI command in the beep-effect monorepo.

---

## Objective

Create a CLI command (`beep prune-unused-deps`) that:

1. Scans each workspace package's `src/` folder for imports from internal `@beep/*` packages
2. Compares actual imports against declared dependencies
3. Reports and optionally removes unused workspace dependencies from:
   - `package.json` (`dependencies`, `peerDependencies`, `devDependencies`)
   - `tsconfig*.json` files (`references` array)

---

## Prerequisites: Read These Files First

Before implementing, you MUST read these files to understand patterns:

### Existing CLI Commands (patterns to follow)
```
<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/sync.ts
</tool_call>

<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/env.ts
</tool_call>

<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/index.ts
</tool_call>
```

### Utility Functions (use these heavily)
```
<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/repo/DependencyIndex.ts
</tool_call>

<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/repo/Dependencies.ts
</tool_call>

<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/repo/TsConfigIndex.ts
</tool_call>

<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/repo/PackageFileMap.ts
</tool_call>

<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/FsUtils.ts
</tool_call>
```

### Schema Definitions
```
<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/schemas/WorkspaceDependencies.ts
</tool_call>

<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/schemas/TsConfigJson.ts
</tool_call>

<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/tooling/utils/src/schemas/PackageJson.ts
</tool_call>
```

### Example Target Files (to understand structure)
```
<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/packages/iam/infra/package.json
</tool_call>

<tool_call>
Read file: /home/elpresidank/YeeBois/projects/beep-effect/packages/iam/infra/tsconfig.build.json
</tool_call>
```

---

## Available Utilities Reference

### From `@beep/tooling-utils/repo`

| Utility | Import Path | Purpose |
|---------|-------------|---------|
| `findRepoRoot` | `@beep/tooling-utils/repo` | Locates repo root directory |
| `resolveWorkspaceDirs` | `@beep/tooling-utils/repo` | Returns `HashMap<packageName, absoluteDir>` |
| `buildRepoDependencyIndex` | `@beep/tooling-utils/repo` | Returns `HashMap<WorkspacePkgKey, RepoDepMapValue>` with all declared deps |
| `extractWorkspaceDependencies` | `@beep/tooling-utils/repo` | Parses single package.json into typed dep sets |
| `mapWorkspaceToSourceFiles` | `@beep/tooling-utils/repo` | Returns `HashMap<packageName, HashSet<absoluteFilePaths>>` |
| `mapWorkspaceToPackageJsonPath` | `@beep/tooling-utils/repo` | Returns `HashMap<packageName, absolutePackageJsonPath>` |
| `collectTsConfigPaths` | `@beep/tooling-utils/repo` | Returns `HashMap<packageName, Array<tsconfigPaths>>` |

### From `@beep/tooling-utils`

| Utility | Import | Purpose |
|---------|--------|---------|
| `FsUtils` | `@beep/tooling-utils` | Context tag for file operations |
| `FsUtilsLive` | `@beep/tooling-utils` | Layer providing FsUtils implementation |

### Key `FsUtils` Methods

```typescript
const utils = yield* FsUtils;

// Read and parse JSON
const json = yield* utils.readJson(path);

// Write JSON with formatting
yield* utils.writeJson(path, jsonObject);

// Glob for files
const files = yield* utils.globFiles(["**/*.ts"], { cwd: srcDir, absolute: true });

// Modify file in-place (only writes if changed)
yield* utils.modifyFile(path, (content, path) => transformedContent);
```

---

## Effect Documentation References

Use these MCP tool calls to look up Effect APIs:

### FileSystem Operations
```
<tool_call>
mcp__effect_docs__effect_docs_search with query: "FileSystem readFileString"
</tool_call>
```

### HashMap Operations
```
<tool_call>
mcp__effect_docs__effect_docs_search with query: "HashMap get entries filter"
</tool_call>
```

### HashSet Operations
```
<tool_call>
mcp__effect_docs__effect_docs_search with query: "HashSet difference intersection fromIterable"
</tool_call>
```

### Effect.forEach for Iteration
```
<tool_call>
mcp__effect_docs__effect_docs_search with query: "Effect forEach concurrency"
</tool_call>
```

### CLI Command Creation
```
<tool_call>
mcp__effect_docs__effect_docs_search with query: "@effect/cli Command make withDescription"
</tool_call>
```

---

## Implementation Steps

### Step 1: Create the Command File

Create file at: `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/prune-unused-deps.ts`

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
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Str from "effect/String";
import color from "picocolors";
```

### Step 2: Define Command Options

```typescript
const dryRunOption = CliOptions.boolean("dry-run").pipe(
  CliOptions.withAlias("d"),
  CliOptions.withDescription("Report unused dependencies without modifying files"),
  CliOptions.withDefault(false)
);

const filterOption = CliOptions.optional(CliOptions.text("filter")).pipe(
  CliOptions.withAlias("f"),
  CliOptions.withDescription("Filter to specific workspace (e.g. @beep/iam-infra)")
);
```

### Step 3: Implement Import Scanner

The import scanner needs to:
1. Read all `.ts`/`.tsx` files in a package's `src/` directory
2. Extract import statements matching `@beep/*` packages
3. Return a `HashSet<string>` of actually-used workspace dependencies

```typescript
/**
 * Extract @beep/* imports from a TypeScript/JavaScript file.
 *
 * Regex patterns to match:
 * - import ... from "@beep/package-name"
 * - import ... from "@beep/package-name/subpath"
 * - import("@beep/package-name")
 * - require("@beep/package-name")
 */
const BEEP_IMPORT_REGEX_LINE = /(?:from\s+["']|import\s*\(\s*["']|require\s*\(\s*["'])(@beep\/[^"'/]+)/;

const extractImportsFromFile = (content: string): HashSet.HashSet<string> =>
  F.pipe(
    Str.split(content, "\n"),
    A.filterMap((line) =>
      F.pipe(
        Str.match(line, BEEP_IMPORT_REGEX_LINE),
        O.flatMap((groups) => A.get(groups, 1))
      )
    ),
    HashSet.fromIterable
  );

const scanWorkspaceImports = (
  workspaceName: string,
  sourceFiles: HashSet.HashSet<string>
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    const importSets = yield* Effect.forEach(
      A.fromIterable(sourceFiles),
      (filePath) =>
        F.pipe(
          fs.readFileString(filePath),
          Effect.map(extractImportsFromFile)
        )
    );

    const allImports = F.pipe(
      importSets,
      A.reduce(HashSet.empty<string>(), HashSet.union),
      // Remove self-references
      HashSet.remove(workspaceName)
    );

    return allImports;
  });
```

### Step 4: Implement Dependency Comparison

```typescript
interface UnusedDeps {
  readonly workspaceName: string;
  readonly unusedInDependencies: ReadonlyArray<string>;
  readonly unusedInDevDependencies: ReadonlyArray<string>;
  readonly unusedInPeerDependencies: ReadonlyArray<string>;
}

const findUnusedDeps = (
  workspaceName: string,
  actualImports: HashSet.HashSet<string>,
  declaredDeps: {
    dependencies: HashSet.HashSet<string>;
    devDependencies: HashSet.HashSet<string>;
    peerDependencies: HashSet.HashSet<string>;
  }
): UnusedDeps => {
  // A dependency is unused if it's declared but not in actualImports
  const unusedInDeps = HashSet.difference(declaredDeps.dependencies, actualImports);
  const unusedInDevDeps = HashSet.difference(declaredDeps.devDependencies, actualImports);
  const unusedInPeerDeps = HashSet.difference(declaredDeps.peerDependencies, actualImports);

  return {
    workspaceName,
    unusedInDependencies: A.fromIterable(unusedInDeps),
    unusedInDevDependencies: A.fromIterable(unusedInDevDeps),
    unusedInPeerDependencies: A.fromIterable(unusedInPeerDeps),
  };
};
```

### Step 5: Implement File Modification Functions

#### package.json Modification

```typescript
const logUnusedDepsSection = (
  label: string,
  deps: ReadonlyArray<string>
): Effect.Effect<void> =>
  A.isNonEmptyArray(deps)
    ? Effect.gen(function* () {
        yield* Console.log(color.yellow(`  ${label}:`));
        yield* Effect.forEach(
          deps,
          (dep) => Console.log(`    - ${dep}`),
          { discard: true }
        );
      })
    : Effect.void;

const removeUnusedFromPackageJson = (
  packageJsonPath: string,
  unusedDeps: UnusedDeps,
  dryRun: boolean
) =>
  Effect.gen(function* () {
    const utils = yield* FsUtils;

    if (dryRun) {
      // Just report
      yield* Console.log(color.cyan(`\n${unusedDeps.workspaceName}:`));
      yield* logUnusedDepsSection("Unused in dependencies", unusedDeps.unusedInDependencies);
      yield* logUnusedDepsSection("Unused in devDependencies", unusedDeps.unusedInDevDependencies);
      yield* logUnusedDepsSection("Unused in peerDependencies", unusedDeps.unusedInPeerDependencies);
      return;
    }

    // Actually modify
    const json = yield* utils.readJson(packageJsonPath);

    const removeDeps = (
      depsObj: Record<string, string> | undefined,
      toRemove: ReadonlyArray<string>
    ): boolean => {
      if (!depsObj) return false;
      let modified = false;
      for (const dep of toRemove) {
        if (depsObj[dep]) {
          delete depsObj[dep];
          modified = true;
        }
      }
      return modified;
    };

    const modified =
      removeDeps(json.dependencies, unusedDeps.unusedInDependencies) ||
      removeDeps(json.devDependencies, unusedDeps.unusedInDevDependencies) ||
      removeDeps(json.peerDependencies, unusedDeps.unusedInPeerDependencies);

    if (modified) {
      yield* utils.writeJson(packageJsonPath, json);
      yield* Console.log(color.green(`Updated ${packageJsonPath}`));
    }
  });
```

#### tsconfig.json Modification

The tsconfig files use `references` array with relative paths. Need to:
1. Map workspace names to their relative tsconfig paths
2. Remove references that correspond to unused deps

```typescript
const removeUnusedFromTsConfigs = (
  tsconfigPaths: ReadonlyArray<string>,
  unusedWorkspaces: ReadonlyArray<string>,
  workspaceDirs: HashMap.HashMap<string, string>,
  dryRun: boolean
) =>
  Effect.gen(function* () {
    const utils = yield* FsUtils;
    const path_ = yield* Path.Path;

    // Build set of directories for unused workspaces
    const unusedDirs = F.pipe(
      unusedWorkspaces,
      A.filterMap((ws) => HashMap.get(workspaceDirs, ws)),
      HashSet.fromIterable
    );

    yield* Effect.forEach(
      tsconfigPaths,
      (tsconfigPath) =>
        Effect.gen(function* () {
          const json = yield* utils.readJson(tsconfigPath);

          if (!json.references || !A.isArray(json.references)) {
            return;
          }

          const tsconfigDir = path_.dirname(tsconfigPath);
          const originalRefs = json.references as Array<{ path: string }>;

          // Partition refs into kept and removed
          const [removed, kept] = F.pipe(
            originalRefs,
            A.partition((ref) => {
              const refAbsPath = path_.resolve(tsconfigDir, ref.path);
              const targetDir = Str.endsWith(refAbsPath, ".json")
                ? path_.dirname(refAbsPath)
                : refAbsPath;
              return HashSet.has(unusedDirs, targetDir);
            })
          );

          const removedPaths = A.map(removed, (ref) => ref.path);

          // Report removed refs in dry-run mode
          if (dryRun && A.isNonEmptyArray(removedPaths)) {
            yield* Effect.forEach(
              removedPaths,
              (refPath) => Console.log(`  Would remove reference: ${refPath} from ${tsconfigPath}`),
              { discard: true }
            );
          }

          if (!dryRun && A.length(kept) !== A.length(originalRefs)) {
            json.references = kept;
            yield* utils.writeJson(tsconfigPath, json);
            yield* Console.log(color.green(`Updated ${tsconfigPath}`));
          }
        }),
      { discard: true }
    );
  });
```

### Step 6: Main Handler Function

```typescript
const handlePruneCommand = ({ dryRun, filter }: { dryRun: boolean; filter: O.Option<string> }) =>
  Effect.gen(function* () {
    // Clear dry-run messaging so users understand why no changes are applied
    if (dryRun) {
      yield* Console.log(color.gray("(Dry-run mode - no files will be modified)"));
    }

    yield* Console.log(color.cyan("Scanning for unused workspace dependencies..."));

    // Gather all data
    const workspaceDirs = yield* resolveWorkspaceDirs;
    const packageJsonMap = yield* mapWorkspaceToPackageJsonPath;
    const sourceFilesMap = yield* mapWorkspaceToSourceFiles;
    const depIndex = yield* buildRepoDependencyIndex;
    const tsconfigMap = yield* collectTsConfigPaths;

    // Validate filter option - fail early if workspace doesn't exist
    if (O.isSome(filter) && !HashMap.has(workspaceDirs, filter.value)) {
      yield* Console.log(color.red(`Workspace "${filter.value}" not found.`));
      yield* Console.log(color.gray("Available workspaces:"));
      yield* Effect.forEach(
        A.fromIterable(HashMap.keys(workspaceDirs)),
        (ws) => Console.log(color.gray(`  - ${ws}`)),
        { discard: true }
      );
      return;
    }

    // Filter workspaces if requested
    const workspacesToProcess = O.match(filter, {
      onNone: () => A.fromIterable(HashMap.keys(workspaceDirs)),
      onSome: (f) => [f],
    });

    // Process workspaces and collect unused counts
    const unusedCounts = yield* Effect.forEach(
      workspacesToProcess,
      (workspace) =>
        Effect.gen(function* () {
          // Skip @beep/root
          if (workspace === "@beep/root") return 0;

          const sourceFiles = HashMap.get(sourceFilesMap, workspace);
          const declaredDeps = HashMap.get(depIndex, workspace);
          const packageJsonPath = HashMap.get(packageJsonMap, workspace);
          const tsconfigPaths = HashMap.get(tsconfigMap, workspace);

          if (O.isNone(sourceFiles) || O.isNone(declaredDeps) || O.isNone(packageJsonPath)) {
            return 0;
          }

          // Scan actual imports
          const actualImports = yield* scanWorkspaceImports(workspace, sourceFiles.value);

          // Extract workspace deps from declared deps
          const declaredWorkspaceDeps = {
            dependencies: declaredDeps.value.dependencies.workspace,
            devDependencies: declaredDeps.value.devDependencies.workspace,
            // Note: peerDependencies needs separate extraction - see PackageJson schema
            peerDependencies: HashSet.empty<string>(), // TODO: Add peerDependencies support
          };

          // Find unused
          const unused = findUnusedDeps(workspace, actualImports, declaredWorkspaceDeps);

          const unusedCount =
            A.length(unused.unusedInDependencies) +
            A.length(unused.unusedInDevDependencies) +
            A.length(unused.unusedInPeerDependencies);

          if (unusedCount === 0) return 0;

          // Update package.json
          yield* removeUnusedFromPackageJson(packageJsonPath.value, unused, dryRun);

          // Update tsconfig files
          if (O.isSome(tsconfigPaths)) {
            const allUnusedWorkspaces = F.pipe(
              unused.unusedInDependencies,
              A.appendAll(unused.unusedInDevDependencies),
              A.appendAll(unused.unusedInPeerDependencies)
            );

            yield* removeUnusedFromTsConfigs(
              tsconfigPaths.value,
              allUnusedWorkspaces,
              workspaceDirs,
              dryRun
            );
          }

          return unusedCount;
        })
    );

    const totalUnused = A.reduce(unusedCounts, 0, (acc, count) => acc + count);

    if (totalUnused === 0) {
      yield* Console.log(color.green("\nNo unused workspace dependencies found!"));
    } else if (dryRun) {
      yield* Console.log(color.yellow(`\nFound ${totalUnused} unused workspace dependencies.`));
      yield* Console.log(color.cyan("Run without --dry-run to remove them."));
    } else {
      yield* Console.log(color.green(`\nRemoved ${totalUnused} unused workspace dependencies.`));
      yield* Console.log(color.cyan("Run 'bun install' to update lockfile."));
    }
  });
```

### Step 7: Export the Command

```typescript
export const pruneUnusedDepsCommand = CliCommand.make(
  "prune-unused-deps",
  { dryRun: dryRunOption, filter: filterOption },
  handlePruneCommand
).pipe(
  CliCommand.withDescription("Find and remove unused @beep/* workspace dependencies.")
);
```

### Step 8: Register in CLI Index

Edit `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/index.ts`:

```typescript
import { pruneUnusedDepsCommand } from "./commands/prune-unused-deps.js";

const repoCommand = CliCommand.make("beep").pipe(
  CliCommand.withDescription("Beep repository maintenance CLI."),
  CliCommand.withSubcommands([envCommand, syncCommand, pruneUnusedDepsCommand])
);
```

---

## Testing the Implementation

### Run in Dry-Run Mode First

```bash
<tool_call>
Bash command: cd /home/elpresidank/YeeBois/projects/beep-effect && bun run tooling/cli/src/index.ts prune-unused-deps --dry-run
</tool_call>
```

### Test on Single Package

```bash
<tool_call>
Bash command: cd /home/elpresidank/YeeBois/projects/beep-effect && bun run tooling/cli/src/index.ts prune-unused-deps --dry-run --filter @beep/iam-infra
</tool_call>
```

### Type Check the Implementation

```bash
<tool_call>
Bash command: cd /home/elpresidank/YeeBois/projects/beep-effect && bunx turbo run check --filter=@beep/tooling-cli
</tool_call>
```

---

## Edge Cases to Handle

1. **Re-exports**: A package might re-export from a dependency without directly importing it in `src/`. Consider scanning `index.ts` barrel files carefully.

2. **Type-only imports**: `import type { Foo } from "@beep/bar"` should still count as a used dependency since types need to resolve.

3. **Dynamic imports**: `import("@beep/foo")` should be caught by the regex.

4. **Test dependencies**: `devDependencies` used only in `test/` folder should NOT be flagged as unused. Consider adding a `--include-tests` flag.

5. **Workspace self-reference**: Packages shouldn't import themselves - filter these out.

6. **Circular references in tsconfig**: Some tsconfig files may have circular references that are intentional.

---

## Glob and Grep Patterns for Verification

### Find all @beep imports in a package
```
<tool_call>
Grep with pattern: "from [\"']@beep/" in path: /home/elpresidank/YeeBois/projects/beep-effect/packages/iam/infra/src
</tool_call>
```

### Find all tsconfig files
```
<tool_call>
Glob with pattern: **/tsconfig*.json in path: /home/elpresidank/YeeBois/projects/beep-effect/packages
</tool_call>
```

### Verify workspace dependencies in package.json
```
<tool_call>
Grep with pattern: "\"@beep/.*\": \"workspace:" in path: /home/elpresidank/YeeBois/projects/beep-effect/packages
</tool_call>
```

---

## Summary of Key Points

1. **Use existing utilities** - Don't reinvent workspace discovery or dependency parsing
2. **Effect-first** - All operations should be `Effect<Success, Error, Requirements>`
3. **Dry-run by default safety** - Always report before modifying
4. **Preserve JSON formatting** - Use `utils.writeJson` which handles formatting
5. **Handle missing data gracefully** - Use `O.Option` for HashMap lookups
6. **Follow existing command patterns** - See `sync.ts` and `env.ts` for structure

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `tooling/cli/src/commands/prune-unused-deps.ts` | **CREATE** - Main command implementation |
| `tooling/cli/src/index.ts` | **MODIFY** - Add import and register command |
