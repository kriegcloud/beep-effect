# Effect API Research for Dead Dependency Pruner CLI

This document provides Effect-idiomatic solutions, API references, and code patterns for implementing the `prune-unused-deps` CLI command.

---

## Table of Contents

1. [Validation of Existing Prompt](#1-validation-of-existing-prompt)
2. [Recommended Effect APIs](#2-recommended-effect-apis)
3. [Code Snippets](#3-code-snippets)
4. [Updated Prompt Addendum](#4-updated-prompt-addendum)

---

## 1. Validation of Existing Prompt

### Strengths

The existing prompt in `PRUNE_UNUSED_DEPS_PROMPT.md` is well-structured and covers:
- ✅ Clear objective and requirements
- ✅ Links to existing utility functions
- ✅ Step-by-step implementation guide
- ✅ Good use of Effect patterns (`Effect.gen`, `HashMap`, `HashSet`)
- ✅ Proper layer composition with Bun runtime

### Issues and Gaps

#### 1. **Missing `peerDependencies` extraction from existing utilities**

The existing `extractWorkspaceDependencies` function in `Dependencies.ts` only extracts `dependencies` and `devDependencies`. The prompt acknowledges this with a TODO but doesn't provide a solution.

**Fix**: The `PackageJson` schema already includes `peerDependencies`. Modify `extractWorkspaceDependencies` or create a new function to extract peer deps.

#### 2. **JSONC (JSON with Comments) handling missing**

The tsconfig files use JSONC format (JSON with comments). The prompt uses `utils.readJson()` which calls `JSON.parse()` and will fail on files with comments.

**Fix**: Use a JSONC parser like `jsonc-parser` or strip comments before parsing. The existing codebase already has `TsConfigJson` schema but the `FsUtils.readJson` doesn't handle comments.

#### 3. **Regex pattern for imports is incomplete**

The regex `BEEP_IMPORT_REGEX` in the prompt doesn't handle:
- Type-only imports: `import type { Foo } from "@beep/bar"`
- Export re-exports: `export { Bar } from "@beep/baz"`
- Side-effect imports: `import "@beep/polyfill"`

**Better regex:**
```typescript
const BEEP_IMPORT_REGEX = /(?:from\s+["']|import\s*(?:type\s*)?\(\s*["']|require\s*\(\s*["']|import\s+["']|export\s+(?:[\s\S]*?\s+)?from\s+["'])(@beep\/[^"'/\s]+)/g;
```

#### 4. **Test file handling is incomplete**

The prompt mentions `devDependencies` used only in `test/` should not be flagged, but:
- Doesn't provide implementation for this
- Doesn't scan `test/` folder separately
- Missing `--include-tests` flag implementation

#### 5. **Missing Layer composition for `FsUtils`**

The implementation should provide `FsUtilsLive` layer but it's not shown in the layer composition in the index file.

#### 6. **TsConfig reference path matching is fragile**

The tsconfig reference matching logic compares directory paths, but tsconfig references can point to tsconfig files directly (e.g., `"../foo/tsconfig.build.json"`), not just directories.

#### 7. **No handling for `@beep/*` subpath imports**

The regex captures `@beep/package-name` from `@beep/package-name/subpath`, but the prompt doesn't clarify that subpath imports (like `@beep/tooling-utils/repo`) still count as using `@beep/tooling-utils`.

---

## 2. Recommended Effect APIs

### FileSystem Operations

```typescript
import * as FileSystem from "@effect/platform/FileSystem";

// Service access
const fs = yield* FileSystem.FileSystem;

// Read file as string
const content: string = yield* fs.readFileString(filePath);

// Write string to file
yield* fs.writeFileString(filePath, content);

// Check if path exists
const exists: boolean = yield* fs.exists(path);

// Read directory contents
const entries: string[] = yield* fs.readDirectory(dirPath);

// Recursive directory reading
const allFiles: string[] = yield* fs.readDirectory(dirPath, { recursive: true });

// Get file info (for checking file type)
const info: FileSystem.File.Info = yield* fs.stat(path);
// info.type === "File" | "Directory" | "SymbolicLink"

// Copy files
yield* fs.copy(from, to);
yield* fs.copyFile(fromFile, toFile);

// Create directories
yield* fs.makeDirectory(path, { recursive: true });

// Remove files/directories
yield* fs.remove(path, { recursive: true });
```

### Path Manipulation

```typescript
import * as Path from "@effect/platform/Path";

const path = yield* Path.Path;

// Join path segments
const fullPath = path.join(baseDir, "src", "index.ts");

// Get directory name
const dir = path.dirname("/foo/bar/baz.ts"); // "/foo/bar"

// Get base name
const base = path.basename("/foo/bar/baz.ts"); // "baz.ts"
const name = path.basename("/foo/bar/baz.ts", ".ts"); // "baz"

// Get extension
const ext = path.extname("/foo/bar/baz.ts"); // ".ts"

// Resolve to absolute path
const abs = path.resolve("./relative/path");

// Get relative path
const rel = path.relative("/base", "/base/nested/file.ts"); // "nested/file.ts"

// Check if absolute
const isAbs = path.isAbsolute("/foo/bar"); // true

// Parse path into components
const parsed = path.parse("/foo/bar/baz.ts");
// { root: "/", dir: "/foo/bar", base: "baz.ts", ext: ".ts", name: "baz" }
```

### HashMap Operations

```typescript
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";

// Create empty map
let map = HashMap.empty<string, number>();

// Set value
map = HashMap.set(map, "key", 42);

// Get value (returns Option)
const value: O.Option<number> = HashMap.get(map, "key");

// Get with default
const valueOrDefault = O.getOrElse(HashMap.get(map, "key"), () => 0);

// Check if key exists
const has: boolean = HashMap.has(map, "key");

// Iterate entries
for (const [key, value] of HashMap.entries(map)) {
  console.log(key, value);
}

// Get all keys
const keys = Array.from(HashMap.keys(map));

// Get all values
const values = Array.from(HashMap.values(map));

// Map over values
const doubled = HashMap.map(map, (v) => v * 2);

// Filter entries
const filtered = HashMap.filter(map, (v) => v > 10);

// Reduce
const sum = HashMap.reduce(map, 0, (acc, v) => acc + v);

// Size
const size = HashMap.size(map);
```

### HashSet Operations

```typescript
import * as HashSet from "effect/HashSet";

// Create from iterable
const set = HashSet.fromIterable(["a", "b", "c"]);

// Create empty
let empty = HashSet.empty<string>();

// Add element
empty = HashSet.add(empty, "x");

// Remove element
const removed = HashSet.remove(set, "a");

// Check membership
const has = HashSet.has(set, "a"); // true

// Set operations
const union = HashSet.union(setA, setB);
const intersection = HashSet.intersection(setA, setB);
const difference = HashSet.difference(setA, setB); // A - B

// Iterate values
for (const value of HashSet.values(set)) {
  console.log(value);
}

// Convert to array
const arr = Array.from(HashSet.values(set));

// Map over elements
const mapped = HashSet.map(set, (s) => s.toUpperCase());

// Filter
const filtered = HashSet.filter(set, (s) => s.length > 1);

// Size
const size = HashSet.size(set);
```

### Effect.forEach with Concurrency

```typescript
import * as Effect from "effect/Effect";

// Sequential iteration (default)
const results = yield* Effect.forEach(items, (item, index) =>
  processItem(item)
);

// Concurrent iteration (unbounded)
const results = yield* Effect.forEach(
  items,
  (item) => processItem(item),
  { concurrency: "unbounded" }
);

// Limited concurrency
const results = yield* Effect.forEach(
  items,
  (item) => processItem(item),
  { concurrency: 4 }
);

// Discard results (for side effects only)
yield* Effect.forEach(
  items,
  (item) => processItem(item),
  { discard: true }
);

// Concurrent with discarded results
yield* Effect.forEach(
  items,
  (item) => processItem(item),
  { concurrency: "unbounded", discard: true }
);
```

### Effect.all for Parallel Operations

```typescript
import * as Effect from "effect/Effect";

// Run effects in parallel, collect results as tuple
const [result1, result2, result3] = yield* Effect.all([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3)
]);

// Run effects in parallel with options
const results = yield* Effect.all(
  [effect1, effect2, effect3],
  { concurrency: "unbounded" }
);

// Run record of effects in parallel
const { user, posts, comments } = yield* Effect.all({
  user: fetchUser(userId),
  posts: fetchPosts(userId),
  comments: fetchComments(userId)
});
```

### CLI Command and Options

```typescript
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";

// Boolean option with alias
const dryRun = CliOptions.boolean("dry-run").pipe(
  CliOptions.withAlias("d"),
  CliOptions.withDescription("Report without modifying files"),
  CliOptions.withDefault(false)
);

// Optional text option
const filter = CliOptions.optional(CliOptions.text("filter")).pipe(
  CliOptions.withAlias("f"),
  CliOptions.withDescription("Filter to specific workspace")
);

// Choice option
const mode = CliOptions.choice("mode", ["fast", "thorough"]).pipe(
  CliOptions.withDefault("fast")
);

// Create command with options
const command = CliCommand.make(
  "command-name",
  { dryRun, filter, mode },
  ({ dryRun, filter, mode }) =>
    Effect.gen(function* () {
      // Handler implementation
    })
).pipe(
  CliCommand.withDescription("Command description here")
);

// Create parent command with subcommands
const parentCommand = CliCommand.make("parent").pipe(
  CliCommand.withDescription("Parent command"),
  CliCommand.withSubcommands([subCommand1, subCommand2])
);

// Run CLI
const runCli = CliCommand.run(command, {
  name: "cli-name",
  version: "1.0.0"
});
```

### Schema for JSON Parsing

```typescript
import * as S from "effect/Schema";

// Parse JSON string to typed object
const PackageJsonFromString = S.parseJson(PackageJson);
const parsed = yield* S.decode(PackageJsonFromString)(jsonString);

// Decode unknown value against schema
const decoded = yield* S.decode(PackageJson)(unknownValue);

// Sync decoding (throws on failure)
const syncDecoded = S.decodeUnknownSync(PackageJson)(unknownValue);

// Encode typed object back to JSON-compatible form
const encoded = yield* S.encode(PackageJson)(typedValue);
```

### Error Handling Patterns

```typescript
import * as Effect from "effect/Effect";

// Map errors to a common type
const program = someEffect.pipe(
  Effect.mapError((e) => new DomainError({ message: e.message, cause: e }))
);

// Catch specific error tags
const handled = program.pipe(
  Effect.catchTag("NotFound", (e) => Effect.succeed(defaultValue))
);

// Catch all errors and recover
const recovered = program.pipe(
  Effect.catchAll((e) => Effect.succeed(fallbackValue))
);

// Provide fallback on failure
const withFallback = program.pipe(
  Effect.orElse(() => fallbackEffect)
);

// Ignore errors (returns void on failure)
const ignored = program.pipe(Effect.ignore);

// Try with explicit error handling
yield* Effect.tryPromise({
  try: () => someAsyncOperation(),
  catch: (e) => new DomainError({ message: String(e), cause: e })
});
```

---

## 3. Code Snippets

### Recursively Finding All TypeScript Files

Using the existing `FsUtils` from the codebase:

```typescript
import { FsUtils } from "@beep/tooling-utils";
import * as Path from "@effect/platform/Path";
import * as HashSet from "effect/HashSet";

const findTypeScriptFiles = (srcDir: string) =>
  Effect.gen(function* () {
    const utils = yield* FsUtils;

    const files = yield* utils.globFiles(["**/*.ts", "**/*.tsx"], {
      cwd: srcDir,
      absolute: true,
      ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
    });

    return HashSet.fromIterable(files);
  });
```

### Improved Import Statement Extraction

This version handles all import patterns:

```typescript
import * as HashSet from "effect/HashSet";

/**
 * Comprehensive regex for extracting @beep/* package imports.
 *
 * Matches:
 * - `import { Foo } from "@beep/pkg"`
 * - `import type { Foo } from "@beep/pkg"`
 * - `import Foo from "@beep/pkg"`
 * - `import "@beep/pkg"` (side-effect)
 * - `import("@beep/pkg")` (dynamic)
 * - `require("@beep/pkg")`
 * - `export { Foo } from "@beep/pkg"`
 * - `export * from "@beep/pkg"`
 */
const BEEP_IMPORT_PATTERNS = [
  // Static imports: import ... from "@beep/..."
  /from\s+["'](@beep\/[^"'/\s]+)/g,
  // Side-effect imports: import "@beep/..."
  /import\s+["'](@beep\/[^"'/\s]+)["']/g,
  // Dynamic imports: import("@beep/...")
  /import\s*\(\s*["'](@beep\/[^"'/\s]+)["']\s*\)/g,
  // Require: require("@beep/...")
  /require\s*\(\s*["'](@beep\/[^"'/\s]+)["']\s*\)/g,
] as const;

const extractImportsFromContent = (content: string): HashSet.HashSet<string> => {
  const imports = new Set<string>();

  for (const pattern of BEEP_IMPORT_PATTERNS) {
    // Create new regex instance to reset lastIndex
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const pkg = match[1];
      if (pkg) {
        // Normalize: @beep/pkg/subpath -> @beep/pkg
        const basePkg = pkg.split("/").slice(0, 2).join("/");
        imports.add(basePkg);
      }
    }
  }

  return HashSet.fromIterable(imports);
};
```

### Reading and Modifying package.json While Preserving Formatting

The existing `FsUtils` writes JSON with `JSON.stringify(json, null, 2)`. For better formatting preservation, consider using the content-aware modification:

```typescript
import { FsUtils } from "@beep/tooling-utils";
import * as FileSystem from "@effect/platform/FileSystem";

/**
 * Remove specified dependencies from a package.json file.
 * Preserves file formatting by doing minimal string replacements.
 */
const removeDepsFromPackageJson = (
  packageJsonPath: string,
  depsToRemove: ReadonlyArray<string>,
  depType: "dependencies" | "devDependencies" | "peerDependencies"
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const utils = yield* FsUtils;

    // Read current content
    const json = yield* utils.readJson(packageJsonPath);

    // Track if we made changes
    let modified = false;
    const deps = json[depType];

    if (deps && typeof deps === "object") {
      for (const dep of depsToRemove) {
        if (dep in deps) {
          delete deps[dep];
          modified = true;
        }
      }

      // Remove empty dependency objects
      if (Object.keys(deps).length === 0) {
        delete json[depType];
      }
    }

    if (modified) {
      yield* utils.writeJson(packageJsonPath, json);
    }

    return modified;
  });
```

### Parsing JSONC (tsconfig.json with comments)

Add a JSONC parsing utility:

```typescript
import * as Effect from "effect/Effect";

/**
 * Strip JSON comments for parsing.
 * Handles // line comments and /* block comments */
 */
const stripJsonComments = (content: string): string => {
  let result = "";
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];
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

    return yield* Effect.try({
      try: () => JSON.parse(stripped),
      catch: (e) => new DomainError({
        message: `Failed to parse JSONC at ${path}: ${e}`,
        cause: e
      })
    });
  });
```

### Topological Sorting by Dependency Count

Sort packages so those with fewer dependencies are processed first:

```typescript
import * as HashMap from "effect/HashMap";
import * as A from "effect/Array";

interface PackageInfo {
  name: string;
  dir: string;
  depCount: number;
}

const sortByDependencyCount = (
  workspaces: HashMap.HashMap<string, string>,
  depIndex: HashMap.HashMap<string, { dependencies: { workspace: Set<string> } }>
): ReadonlyArray<PackageInfo> => {
  const packages: PackageInfo[] = [];

  for (const [name, dir] of HashMap.entries(workspaces)) {
    const deps = HashMap.get(depIndex, name);
    const depCount = deps._tag === "Some"
      ? deps.value.dependencies.workspace.size
      : 0;

    packages.push({ name, dir, depCount });
  }

  // Sort by dependency count (ascending) - packages with fewer deps first
  return A.sort(packages, (a, b) => a.depCount - b.depCount);
};
```

### Dry-Run vs Apply Mode Pattern

```typescript
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import color from "picocolors";

interface ChangeReport {
  packageName: string;
  unusedDeps: ReadonlyArray<string>;
  affectedFiles: ReadonlyArray<string>;
}

const applyOrReport = (
  changes: ReadonlyArray<ChangeReport>,
  dryRun: boolean
) =>
  Effect.gen(function* () {
    if (changes.length === 0) {
      yield* Console.log(color.green("✓ No unused dependencies found!"));
      return;
    }

    for (const change of changes) {
      yield* Console.log(color.cyan(`\n${change.packageName}:`));

      if (change.unusedDeps.length > 0) {
        yield* Console.log(color.yellow("  Unused dependencies:"));
        for (const dep of change.unusedDeps) {
          yield* Console.log(`    - ${dep}`);
        }
      }

      if (!dryRun) {
        // Apply the changes
        for (const file of change.affectedFiles) {
          yield* Console.log(color.gray(`    Updating ${file}...`));
          // ... actual modification logic
        }
      }
    }

    const totalUnused = changes.reduce(
      (sum, c) => sum + c.unusedDeps.length,
      0
    );

    yield* Console.log("");

    if (dryRun) {
      yield* Console.log(
        color.yellow(`Found ${totalUnused} unused dependencies.`)
      );
      yield* Console.log(
        color.cyan("Run without --dry-run to remove them.")
      );
    } else {
      yield* Console.log(
        color.green(`✓ Removed ${totalUnused} unused dependencies.`)
      );
      yield* Console.log(
        color.cyan("Run 'bun install' to update lockfile.")
      );
    }
  });
```

### Full Layer Composition for CLI

```typescript
import * as CliCommand from "@effect/cli/Command";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunTerminal from "@effect/platform-bun/BunTerminal";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { FsUtilsLive } from "@beep/tooling-utils";

// Runtime layers - note FsUtilsLive is already composed with BunFileSystem/BunPath
const runtimeLayers = Layer.mergeAll(
  BunContext.layer,
  BunTerminal.layer,
  FsUtilsLive
);

export const runCli = (argv: ReadonlyArray<string>) =>
  CliCommand.run(command, {
    name: "beep",
    version: "0.1.0",
  })(argv).pipe(
    Effect.provide(runtimeLayers),
    BunRuntime.runMain
  );
```

---

## 4. Updated Prompt Addendum

The following additions/corrections should be applied to the existing `PRUNE_UNUSED_DEPS_PROMPT.md`:

### Add JSONC Support

Replace `utils.readJson` calls for tsconfig files with:

```typescript
// In the implementation, create a readJsonc helper or use this inline:
const readTsConfig = (tsconfigPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFileString(tsconfigPath);
    const stripped = stripJsonComments(content);
    return JSON.parse(stripped);
  });
```

### Fix Import Regex

Replace the `BEEP_IMPORT_REGEX` with the improved version from section 3 that handles:
- Type-only imports
- Re-exports
- Side-effect imports
- Subpath imports

### Add `peerDependencies` Support

Modify the declared dependencies extraction:

```typescript
// In the main handler, after getting declaredDeps:
const declaredWorkspaceDeps = {
  dependencies: declaredDeps.value.dependencies.workspace,
  devDependencies: declaredDeps.value.devDependencies.workspace,
  // Extract peerDependencies from the raw package.json
  peerDependencies: extractPeerDeps(packageJsonPath),
};

// Add helper function:
const extractPeerDeps = (packageJsonPath: string) =>
  Effect.gen(function* () {
    const utils = yield* FsUtils;
    const json = yield* utils.readJson(packageJsonPath);
    const peerDeps = json.peerDependencies ?? {};
    const workspacePeers = Object.entries(peerDeps)
      .filter(([k, v]) =>
        k.startsWith("@beep/") &&
        (v === "workspace:^" || v === "workspace:*")
      )
      .map(([k]) => k);
    return HashSet.fromIterable(workspacePeers);
  });
```

### Add Test File Handling Flag

Add a new CLI option:

```typescript
const includeTests = CliOptions.boolean("include-tests").pipe(
  CliOptions.withAlias("t"),
  CliOptions.withDescription("Also scan test/ directories for imports"),
  CliOptions.withDefault(false)
);

// In the source file scanning:
const scanDirs = includeTests
  ? ["src", "test"]
  : ["src"];

for (const dir of scanDirs) {
  const dirPath = path_.join(workspaceDir, dir);
  // ... scan logic
}
```

### Fix TsConfig Reference Matching

The reference matching should compare resolved paths, not just directory containment:

```typescript
const removeUnusedFromTsConfigs = (
  tsconfigPaths: ReadonlyArray<string>,
  unusedWorkspaces: ReadonlyArray<string>,
  workspaceDirs: HashMap.HashMap<string, string>,
  dryRun: boolean
) =>
  Effect.gen(function* () {
    const path_ = yield* Path.Path;

    // Build set of tsconfig paths that belong to unused workspaces
    const unusedTsConfigDirs = new Set<string>();
    for (const unusedWorkspace of unusedWorkspaces) {
      const dir = HashMap.get(workspaceDirs, unusedWorkspace);
      if (O.isSome(dir)) {
        unusedTsConfigDirs.add(dir.value);
      }
    }

    for (const tsconfigPath of tsconfigPaths) {
      const json = yield* readJsonc(tsconfigPath);

      if (!json.references || !Array.isArray(json.references)) {
        continue;
      }

      const tsconfigDir = path_.dirname(tsconfigPath);
      const originalRefs = [...json.references];

      json.references = json.references.filter((ref: { path: string }) => {
        // Resolve the reference to get the target directory
        const refPath = path_.resolve(tsconfigDir, ref.path);
        // Handle both directory references and file references
        const targetDir = refPath.endsWith(".json")
          ? path_.dirname(refPath)
          : refPath;

        // Check if this reference points to an unused workspace
        const isUnused = unusedTsConfigDirs.has(targetDir);

        if (isUnused && dryRun) {
          Console.log(`  Would remove reference: ${ref.path}`);
        }

        return !isUnused;
      });

      if (!dryRun && json.references.length !== originalRefs.length) {
        yield* writeJsonPreserveFormatting(tsconfigPath, json);
        yield* Console.log(color.green(`Updated ${tsconfigPath}`));
      }
    }
  });
```

### Add Layer to CLI Index

In `tooling/cli/src/index.ts`, ensure `FsUtilsLive` is included:

```typescript
import { FsUtilsLive } from "@beep/tooling-utils";

const runtimeLayers = Layer.mergeAll(
  BunContext.layer,
  BunTerminal.layer,
  BunFileSystem.layer,
  BunPath.layerPosix,
  FsUtilsLive  // <-- Add this
);
```

Note: Actually, `FsUtilsLive` already includes `BunFileSystem.layer` and `BunPath.layerPosix`, so the composition should be:

```typescript
const runtimeLayers = Layer.mergeAll(
  BunContext.layer,
  BunTerminal.layer,
  FsUtilsLive
);
```

---

## Summary of Key Patterns Used in This Codebase

| Pattern | Location | Description |
|---------|----------|-------------|
| Effect.gen | Everywhere | Generator-based Effect composition |
| HashMap/HashSet | `repo/*.ts` | Immutable collections for workspace data |
| FsUtils service | `FsUtils.ts` | Centralized filesystem utilities |
| DomainError | `Errors.ts` | Typed error handling |
| S.decode | `Dependencies.ts` | Runtime schema validation |
| Effect.forEach | `sync.ts` | Concurrent iteration |
| CliCommand.make | `sync.ts`, `env.ts` | CLI command definition |
| Layer composition | `index.ts` | Dependency injection |

---

## References

- [Effect Documentation](https://effect.website/docs)
- [@effect/cli README](https://github.com/Effect-TS/effect/tree/main/packages/cli)
- [@effect/platform FileSystem](https://github.com/Effect-TS/effect/tree/main/packages/platform)
