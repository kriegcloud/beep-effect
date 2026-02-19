/**
 * Code generation command - generate barrel file exports for packages.
 *
 * Scans a package's `src/` directory for TypeScript modules and generates
 * an `index.ts` barrel file with `export *` re-exports, each annotated
 * with `@since 0.0.0` JSDoc tags as required by `@effect/docgen`.
 *
 * @since 0.0.0
 * @category commands
 */

import { FsUtils } from "@beep/repo-utils";
import { FileSystem, Path } from "effect";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** File extensions to consider as modules. */
const TS_EXTENSIONS = [".ts", ".tsx"] as const;

/** Check if a filename ends with a TypeScript extension. */
const isTsFile = (name: string): boolean => A.some(TS_EXTENSIONS, (ext) => Str.endsWith(ext)(name));

/** Check if a filename is a test file. */
const isTestFile = (name: string): boolean =>
  Str.endsWith(".test.ts")(name) ||
  Str.endsWith(".test.tsx")(name) ||
  Str.endsWith(".spec.ts")(name) ||
  Str.endsWith(".spec.tsx")(name);

/** Strip the `.ts` / `.tsx` extension and append `.js` for the import path. */
const toImportPath = (name: string): string => {
  for (const ext of TS_EXTENSIONS) {
    if (Str.endsWith(ext)(name)) {
      return `./${name.slice(0, -ext.length)}.js`;
    }
  }
  return `./${name}`;
};

/**
 * Alphabetical order for strings used to sort module paths deterministically.
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
 */
const discoverModules = (srcDir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const walk = (
      dir: string,
      prefix: string
    ): Effect.Effect<Array<string>, never, FileSystem.FileSystem | Path.Path> =>
      Effect.gen(function* () {
        const entries = yield* fs.readDirectory(dir).pipe(Effect.orElseSucceed(() => [] as ReadonlyArray<string>));

        const results: Array<string> = [];

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
            if (prefix === "" && entry === "index.ts") continue;

            results.push(`${prefix}${entry}`);
          }
        }

        return results;
      });

    return yield* walk(srcDir, "");
  });

/**
 * Build the barrel file content from a sorted list of module relative paths.
 *
 * @param packageName - Used in the module description header comment.
 * @param modules - Sorted list of relative file paths (e.g. `"FsUtils.ts"`).
 */
const buildBarrelContent = (packageName: string, modules: ReadonlyArray<string>): string => {
  const header = ["/**", ` * Re-exports for ${packageName}.`, " *", " * @since 0.0.0", " */", ""].join("\n");

  const exportLines = A.map(modules, (mod) => {
    const importPath = toImportPath(mod);
    return ["/**", " * @since 0.0.0", " */", `export * from "${importPath}";`].join("\n");
  });

  return `${header + A.join(exportLines, "\n\n")}\n`;
};

// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------

/**
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
  (config) =>
    Effect.gen(function* () {
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
          json !== undefined &&
          typeof json === "object" &&
          json !== null &&
          "name" in json &&
          typeof (json as Record<string, unknown>).name === "string"
        ) {
          return (json as Record<string, unknown>).name as string;
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
