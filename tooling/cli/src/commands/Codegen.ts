/**
 * Code generation command - generate barrel file exports for packages.
 *
 * Scans a package's `src/` directory for TypeScript modules and generates
 * an `index.ts` barrel file with `export *` re-exports, each annotated
 * with `@since 0.0.0` JSDoc tags as required by `@beep/docgen`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { FsUtils } from "@beep/repo-utils";
import { Text, thunkFalse, thunkUndefined } from "@beep/utils";
import { Console, Effect, FileSystem, Order, Path, pipe, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/Codegen");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * File extensions recognised as TypeScript source modules during barrel generation.
 *
 * @example
 * ```ts
 * console.log("TS_EXTENSIONS")
 * ```
 * @category utilities
 * @since 0.0.0
 */
const TS_EXTENSIONS = [".ts", ".tsx"] as const;

const TYPE_SCRIPT_SOURCE_FILE_PATTERN = /^.+\.(ts|tsx)$/;
const TYPE_SCRIPT_TEST_FILE_PATTERN = /^.+\.(test|spec)\.(ts|tsx)$/;
const JS_IMPORT_PATH_PATTERN = /^\.\/.+\.js$/;

const TypeScriptSourceFileName = S.String.check(S.isPattern(TYPE_SCRIPT_SOURCE_FILE_PATTERN)).pipe(
  S.brand("TypeScriptSourceFileName"),
  S.annotate(
    $I.annote("TypeScriptSourceFileName", {
      description: "TypeScript source filename ending with .ts or .tsx.",
    })
  )
);
const decodeTypeScriptSourceFileName = S.decodeUnknownSync(TypeScriptSourceFileName);

const TypeScriptTestFileName = S.String.check(S.isPattern(TYPE_SCRIPT_TEST_FILE_PATTERN)).pipe(
  S.brand("TypeScriptTestFileName"),
  S.annotate(
    $I.annote("TypeScriptTestFileName", {
      description: "TypeScript test filename ending with .test.ts[x] or .spec.ts[x].",
    })
  )
);

const JSImportPath = S.String.check(S.isPattern(JS_IMPORT_PATH_PATTERN)).pipe(
  S.annotate(
    $I.annote("JSImportPath", {
      description: "Relative ESM import path with .js extension.",
    })
  )
);

const TypeScriptSourceToJSImportPath = TypeScriptSourceFileName.pipe(
  S.decodeTo(
    JSImportPath,
    SchemaTransformation.transform({
      decode: (fileName) =>
        pipe(
          TS_EXTENSIONS,
          A.findFirst((ext) => Str.endsWith(ext)(fileName)),
          O.match({
            onNone: () => `./${fileName}`,
            onSome: (ext) => `./${Str.slice(0, -ext.length)(fileName)}.js`,
          })
        ),
      encode: (importPath) => decodeTypeScriptSourceFileName(pipe(importPath, Str.replace(/^\.\/(.*)\.js$/, "$1.ts"))),
    })
  ),
  S.annotate(
    $I.annote("TypeScriptSourceToJSImportPath", {
      description: "Schema transformation from a TypeScript module filename to its .js import path.",
    })
  )
);

const InternalDirectoryName = S.Literal("internal").annotate(
  $I.annote("InternalDirectoryName", {
    description: "Directory name excluded from barrel generation.",
  })
);

const RootIndexFileName = S.Literal("index.ts").annotate(
  $I.annote("RootIndexFileName", {
    description: "Root index module excluded from generated barrel inputs.",
  })
);

const isTypeScriptSourceFileName = S.is(TypeScriptSourceFileName);
const isTypeScriptTestFileName = S.is(TypeScriptTestFileName);
const isInternalDirectoryName = S.is(InternalDirectoryName);
const isRootIndexFileName = S.is(RootIndexFileName);
const stringEquivalence = S.toEquivalence(S.String);
const decodeJSImportPath = S.decodeUnknownSync(TypeScriptSourceToJSImportPath);

/**
 * Convert a TypeScript filename to its corresponding `.js` import specifier.
 *
 * Strips the `.ts` or `.tsx` extension and prepends `./` so the result is a
 * valid ESM relative import path (e.g. `"FsUtils.ts"` becomes `"./FsUtils.js"`).
 *
 * @param name - The TypeScript filename (may include a sub-path prefix).
 * @returns A relative import specifier with a `.js` extension.
 * @example
 * ```ts
 * console.log("toImportPath")
 * ```
 * @category utilities
 * @since 0.0.0
 */
const toImportPath = (name: string): string => {
  if (!isTypeScriptSourceFileName(name)) {
    return `./${name}`;
  }
  return decodeJSImportPath(name);
};

/**
 * Alphabetical `Order` instance used to sort discovered module paths deterministically
 * before emitting barrel re-exports.
 *
 * @example
 * ```ts
 * console.log("alphabetical")
 * ```
 * @category utilities
 * @since 0.0.0
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
 * @example
 * ```ts
 * console.log("discoverModules")
 * ```
 * @category utilities
 * @since 0.0.0
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
        const info = yield* fs.stat(fullPath).pipe(Effect.orElseSucceed(thunkUndefined));
        if (info === undefined) continue;

        if (stringEquivalence(info.type, "Directory")) {
          // Skip internal directories
          if (isInternalDirectoryName(entry)) continue;

          // Recurse into subdirectories
          const nested = yield* walk(fullPath, `${prefix}${entry}/`);
          for (const n of nested) {
            results.push(n);
          }
        } else if (stringEquivalence(info.type, "File") && isTypeScriptSourceFileName(entry)) {
          // Skip test files
          if (isTypeScriptTestFileName(entry)) continue;

          // Skip root-level index.ts (that's what we're generating)
          if (Str.isEmpty(prefix) && isRootIndexFileName(entry)) continue;

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
 * per module, each annotated with `@since 0.0.0` as required by `@beep/docgen`.
 *
 * @param packageName - Used in the module description header comment.
 * @param modules - Sorted list of relative file paths (e.g. `"FsUtils.ts"`).
 * @returns The full content of the generated `index.ts` barrel file.
 * @example
 * ```ts
 * console.log("buildBarrelContent")
 * ```
 * @category utilities
 * @since 0.0.0
 */
const buildBarrelContent = (packageName: string, modules: ReadonlyArray<string>): string => {
  const header = pipe(
    A.make("/**", ` * Re-exports for ${packageName}.`, " *", " * @since 0.0.0", " */", ""),
    Text.joinLines
  );

  const exportLines = A.map(modules, (mod) => {
    const importPath = toImportPath(mod);
    return pipe(A.make("/**", " * @since 0.0.0", " */", `export * from "${importPath}";`), Text.joinLines);
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
 * @example
 * ```ts
 * console.log("codegenCommand")
 * ```
 * @category utilities
 * @since 0.0.0
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
    const srcExists = yield* fs.exists(srcDir).pipe(Effect.orElseSucceed(thunkFalse));
    if (!srcExists) {
      yield* Console.error(`Error: No src/ directory found at ${srcDir}`);
      return;
    }

    // Read package.json to extract the package name for the header
    const packageJsonPath = pathSvc.join(packageDir, "package.json");
    const packageName = yield* Effect.gen(function* () {
      const json = yield* fsUtils.readJson(packageJsonPath).pipe(Effect.orElseSucceed(O.none));
      if (
        O.isSome(json) &&
        P.isObject(json.value) &&
        P.isNotNull(json.value) &&
        P.hasProperty(json.value, "name") &&
        P.Struct({
          name: P.isString,
        })(json.value)
      ) {
        return json.value.name;
      }
      return pathSvc.basename(packageDir);
    });

    yield* Console.log(`Scanning ${srcDir} for modules...`);

    // Discover modules
    const rawModules = yield* discoverModules(srcDir);

    // Sort alphabetically for determinism
    const modules = A.sort(rawModules, alphabetical);

    const hasModules = yield* A.match(modules, {
      onEmpty: () => Console.log("No modules found to export.").pipe(Effect.as(false)),
      onNonEmpty: () => Effect.succeed(true),
    });
    if (!hasModules) {
      return;
    }

    yield* Console.log(`Found ${A.length(modules)} module(s):`);
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
