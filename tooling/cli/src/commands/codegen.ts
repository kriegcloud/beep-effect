/**
 * Code generation command - generate barrel file exports for packages.
 *
 * Scans a package's `src/` directory for TypeScript modules and generates
 * an `index.ts` barrel file with `export *` re-exports, each annotated
 * with `@since 0.0.0` JSDoc tags as required by `@effect/docgen`.
 *
 * @since 0.0.0
 * @module
 */

import { FsUtils } from "@beep/repo-utils";
import { Console, Effect, FileSystem, Order, Path, pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import { Command, Flag } from "effect/unstable/cli";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * File extensions recognised as TypeScript source modules during barrel generation.
 *
 * @since 0.0.0
 * @category constants
 */
const TS_EXTENSIONS = [".ts", ".tsx"] as const;

/**
 * Check whether a filename ends with a recognised TypeScript extension (`.ts` or `.tsx`).
 *
 * @param name - The filename or relative path to inspect.
 * @returns `true` when the name ends with `.ts` or `.tsx`.
 * @since 0.0.0
 * @category functions
 */
const isTsFile = (name: string): boolean => A.some(TS_EXTENSIONS, (ext) => Str.endsWith(ext)(name));

/**
 * Determine whether a filename represents a test file (`.test.ts`, `.spec.ts`, etc.).
 *
 * Test files are excluded from barrel re-exports because they are not part of
 * the public API surface.
 *
 * @param name - The filename or relative path to inspect.
 * @returns `true` when the name matches a test file naming convention.
 * @since 0.0.0
 * @category functions
 */
const isTestFile = (name: string): boolean =>
  Str.endsWith(".test.ts")(name) ||
  Str.endsWith(".test.tsx")(name) ||
  Str.endsWith(".spec.ts")(name) ||
  Str.endsWith(".spec.tsx")(name);

/**
 * Convert a TypeScript filename to its corresponding `.js` import specifier.
 *
 * Strips the `.ts` or `.tsx` extension and prepends `./` so the result is a
 * valid ESM relative import path (e.g. `"FsUtils.ts"` becomes `"./FsUtils.js"`).
 *
 * @param name - The TypeScript filename (may include a sub-path prefix).
 * @returns A relative import specifier with a `.js` extension.
 * @since 0.0.0
 * @category functions
 */
const toImportPath = (name: string): string => {
  for (const ext of TS_EXTENSIONS) {
    if (Str.endsWith(ext)(name)) {
      return `./${Str.slice(0, -ext.length)(name)}.js`;
    }
  }
  return `./${name}`;
};

/**
 * Alphabetical `Order` instance used to sort discovered module paths deterministically
 * before emitting barrel re-exports.
 *
 * @since 0.0.0
 * @category constants
 */
const alphabetical: Order.Order<string> = Order.String;

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

/**
 * Recursively discover exportable TypeScript modules under `srcDir`.
 *
 * Returns relative paths from `srcDir` (e.g. `"FsUtils.ts"`, `"errors/index.ts"`).
 * Skips `index.ts` at the root level, `internal/` directories, and test files.
 *
 * @param srcDir - Absolute path to the `src/` directory to scan.
 * @returns An unsorted array of relative file paths suitable for barrel re-export.
 * @depends FileSystem, Path
 * @since 0.0.0
 * @category functions
 */
const discoverModules = Effect.fn(function* (srcDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const walk: (dir: string, prefix: string) => Effect.Effect<Array<string>, never, FileSystem.FileSystem | Path.Path> =
    Effect.fn(function* (dir, prefix) {
      const entries = yield* fs.readDirectory(dir).pipe(Effect.orElseSucceed(A.empty<string>));

      const results = A.empty<string>();

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);

        // Check if this entry is a directory
        const info = yield* fs.stat(fullPath).pipe(Effect.orElseSucceed(() => undefined));
        if (info === undefined) continue;

        if (info.type === "Directory") {
          // Skip internal directories
          if (entry === "internal") continue;

          // Recurse into subdirectories
          const nested = yield* walk(fullPath, `${prefix}${entry}/`);
          for (const n of nested) {
            results.push(n);
          }
        } else if (info.type === "File" && isTsFile(entry)) {
          // Skip test files
          if (isTestFile(entry)) continue;

          // Skip root-level index.ts (that's what we're generating)
          if (Str.isEmpty(prefix) && entry === "index.ts") continue;

          results.push(`${prefix}${entry}`);
        }
      }

      return results;
    });

  return yield* walk(srcDir, Str.empty);
});

/**
 * Build the barrel file content from a sorted list of module relative paths.
 *
 * Produces a string containing a JSDoc header and one `export * from ...` statement
 * per module, each annotated with `@since 0.0.0` as required by `@effect/docgen`.
 *
 * @param packageName - Used in the module description header comment.
 * @param modules - Sorted list of relative file paths (e.g. `"FsUtils.ts"`).
 * @returns The full content of the generated `index.ts` barrel file.
 * @since 0.0.0
 * @category functions
 */
const buildBarrelContent = (packageName: string, modules: ReadonlyArray<string>): string => {
  const header = pipe(
    A.make("/**", ` * Re-exports for ${packageName}.`, " *", " * @since 0.0.0", " */", ""),
    A.join("\n")
  );

  const exportLines = A.map(modules, (mod) => {
    const importPath = toImportPath(mod);
    return pipe(A.make("/**", " * @since 0.0.0", " */", `export * from "${importPath}";`), A.join("\n"));
  });

  return `${header + A.join(exportLines, "\n\n")}\n`;
};

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

/**
 * CLI command that scans a package's `src/` directory and generates (or previews)
 * an `index.ts` barrel file with `export *` re-exports for every discovered module.
 *
 * @since 0.0.0
 * @category commands
 */
export const codegenCommand = Command.make(
  "codegen",
  {
    packageDir: Flag.string("package").pipe(
      Flag.withAlias("p"),
      Flag.withDescription("Package directory to generate barrel exports for"),
      Flag.withDefault(".")
    ),
    dryRun: Flag.boolean("dry-run").pipe(Flag.withDescription("Preview changes without writing files")),
  },
  Effect.fn(function* (config) {
    const fs = yield* FileSystem.FileSystem;
    const pathSvc = yield* Path.Path;
    const fsUtils = yield* FsUtils;

    // Resolve absolute path to the package
    const packageDir = pathSvc.isAbsolute(config.packageDir) ? config.packageDir : pathSvc.resolve(config.packageDir);

    const srcDir = pathSvc.join(packageDir, "src");

    // Verify src/ exists
    const srcExists = yield* fs.exists(srcDir).pipe(Effect.orElseSucceed(() => false));
    if (!srcExists) {
      yield* Console.error(`Error: No src/ directory found at ${srcDir}`);
      return;
    }

    // Read package.json to extract the package name for the header
    const packageJsonPath = pathSvc.join(packageDir, "package.json");
    const packageName = yield* Effect.gen(function* () {
      const json = yield* fsUtils.readJson(packageJsonPath).pipe(Effect.orElseSucceed(() => undefined as unknown));
      if (
        P.isNotUndefined(json) &&
        P.isObject(json) &&
        P.isNotNull(json) &&
        P.hasProperty(json, "name") &&
        P.Struct({
          name: P.isString,
        })(json)
      ) {
        return json.name;
      }
      return pathSvc.basename(packageDir);
    });

    yield* Console.log(`Scanning ${srcDir} for modules...`);

    // Discover modules
    const rawModules = yield* discoverModules(srcDir);

    // Sort alphabetically for determinism
    const modules = A.sort(rawModules, alphabetical);

    if (A.isArrayEmpty(modules)) {
      yield* Console.log("No modules found to export.");
      return;
    }

    yield* Console.log(`Found ${String(A.length(modules))} module(s):`);
    for (const mod of modules) {
      yield* Console.log(`  - ${mod}`);
    }

    // Generate barrel content
    const content = buildBarrelContent(packageName, modules);

    const indexPath = pathSvc.join(srcDir, "index.ts");

    if (config.dryRun) {
      yield* Console.log("");
      yield* Console.log("--- Dry run: would generate the following ---");
      yield* Console.log(`File: ${indexPath}`);
      yield* Console.log("---");
      yield* Console.log(content);
      yield* Console.log("--- End dry run ---");
    } else {
      yield* fs.writeFileString(indexPath, content);
      yield* Console.log("");
      yield* Console.log(`Wrote ${indexPath}`);
    }
  })
).pipe(Command.withDescription("Generate barrel file exports for a package"));
