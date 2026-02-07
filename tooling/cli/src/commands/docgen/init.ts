/**
 * @file Docgen Init Command
 *
 * Bootstraps docgen configuration for a package by:
 * 1. Validating the target path exists and has package.json
 * 2. Locating existing tsconfig files (tsconfig.src.json > tsconfig.build.json > tsconfig.json)
 * 3. Extracting compiler options and path mappings
 * 4. Resolving beep workspace dependencies
 * 5. Generating docgen.json with correct configuration
 * 6. Validating against effect/docgen schema
 * 7. Writing file (respecting --dry-run and --force)
 *
 * Options:
 * - --package, -p path: Target package path (required)
 * - --dry-run, -d: Preview changes without writing
 * - --force, -f: Overwrite existing docgen.json
 *
 * Exit Codes:
 * - 0: Success
 * - 1: Invalid input (missing package.json)
 * - 2: Configuration error (malformed tsconfig, config exists)
 *
 * @module docgen/init
 * @since 0.1.0
 * @see DOCGEN_CLI_IMPLEMENTATION.md
 */

import type * as FsUtils from "@beep/tooling-utils/FsUtils";
import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { DocgenConfigError } from "./errors.js";
import {
  DOCGEN_CONFIG_FILENAME,
  findTsConfig,
  hasDocgenConfig,
  loadTsConfig,
  writeDocgenConfig,
} from "./shared/config.js";
import { resolvePackageByPathOrName } from "./shared/discovery.js";
import { DocgenLogger, DocgenLoggerLive } from "./shared/logger.js";
import { dryRunTag, error, formatPath, info, success, warning } from "./shared/output.js";
import type { CompilerOptions, DocgenConfig } from "./types.js";
import { ExitCode } from "./types.js";

// Options
const packageOption = CliOptions.text("package").pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Target package (path or @beep/* name)")
);

const dryRunOption = CliOptions.boolean("dry-run").pipe(
  CliOptions.withAlias("d"),
  CliOptions.withDefault(false),
  CliOptions.withDescription("Preview changes without writing files")
);

const forceOption = CliOptions.boolean("force").pipe(
  CliOptions.withAlias("f"),
  CliOptions.withDefault(false),
  CliOptions.withDescription("Overwrite existing docgen.json")
);

/**
 * Extract paths from tsconfig that match @beep/* pattern
 */
const extractBeepPaths = (
  paths: Record<string, ReadonlyArray<string>> | undefined
): Record<string, ReadonlyArray<string>> => {
  if (!paths) return {};

  return F.pipe(
    R.toEntries(paths),
    A.filter(([key]) => F.pipe(key, Str.startsWith("@beep/"))),
    R.fromEntries
  );
};

/**
 * Extract @beep/* dependencies from package.json
 */
const extractBeepDependencies = (
  packagePath: string
): Effect.Effect<ReadonlyArray<string>, DocgenConfigError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const pkgJsonPath = path.join(packagePath, "package.json");

    const content = yield* fs.readFileString(pkgJsonPath).pipe(
      Effect.mapError(
        () =>
          new DocgenConfigError({
            path: pkgJsonPath,
            reason: "Failed to read package.json",
          })
      )
    );

    const parsed = yield* Effect.try({
      try: () =>
        JSON.parse(content) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
          peerDependencies?: Record<string, string>;
        },
      catch: (e) =>
        new DocgenConfigError({
          path: pkgJsonPath,
          reason: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
        }),
    });

    const allDeps = {
      ...parsed.dependencies,
      ...parsed.devDependencies,
      ...parsed.peerDependencies,
    };

    return F.pipe(
      R.keys(allDeps),
      A.filter((key) => F.pipe(key, Str.startsWith("@beep/")))
    );
  });

/**
 * Result from loading root tsconfig paths, including both bare paths
 * and sub-path exports for packages that use conditional exports.
 */
interface RootTsConfigPaths {
  /** Bare package paths: @beep/types → packages/common/types/src */
  readonly bare: Record<string, string>;
  /** Sub-path exports: @beep/errors/client → packages/common/errors/src/client */
  readonly subPaths: Record<string, string>;
}

/**
 * Load @beep/* path mappings from the root tsconfig.base.jsonc.
 * These are the canonical source of truth for package locations.
 *
 * Returns both bare paths (e.g., @beep/types) and sub-path exports
 * (e.g., @beep/errors/client) to handle packages with conditional exports.
 *
 * @returns Record mapping @beep/* aliases to their repo-root-relative paths (without /index suffix)
 */
const loadRootTsConfigPaths: Effect.Effect<RootTsConfigPaths, never, FileSystem.FileSystem | Path.Path> = Effect.gen(
  function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const repoRoot = yield* findRepoRoot.pipe(Effect.catchAll(() => Effect.succeed(process.cwd())));

    const tsconfigPath = path.join(repoRoot, "tsconfig.base.jsonc");
    const content = yield* fs.readFileString(tsconfigPath).pipe(Effect.catchAll(() => Effect.succeed("{}")));

    // Strip JSONC comments for parsing (use Str.replace with global regex, NOT Str.replaceAll)
    const jsonContent = F.pipe(
      content,
      Str.replace(/\/\/.*$/gm, Str.empty), // Remove single-line comments
      Str.replace(/\/\*[\s\S]*?\*\//g, Str.empty) // Remove multi-line comments
    );

    const parsed = yield* Effect.try(
      () =>
        JSON.parse(jsonContent) as {
          compilerOptions?: { paths?: Record<string, string[]> };
        }
    ).pipe(Effect.orElseSucceed(() => ({ compilerOptions: { paths: {} as Record<string, string[]> } })));

    const paths = parsed.compilerOptions?.paths ?? {};

    // Filter to only @beep/* entries (excluding wildcards and test paths)
    const beepEntries = F.pipe(
      R.toEntries(paths),
      A.filter(
        ([key]) =>
          F.pipe(key, Str.startsWith("@beep/")) &&
          !F.pipe(key, Str.includes("/test/")) &&
          !F.pipe(key, Str.endsWith("/*"))
      )
    );

    // Separate bare paths from sub-path exports
    // Bare: @beep/types (has exactly one slash after @beep/)
    // Sub-path: @beep/errors/client (has more than one slash after @beep/)
    const isBareExport = (key: string): boolean => {
      const afterPrefix = F.pipe(key, Str.replace("@beep/", Str.empty));
      return !F.pipe(afterPrefix, Str.includes("/"));
    };

    const normalizePath = (values: ReadonlyArray<string>): string => {
      const rawPath = F.pipe(
        values,
        A.head,
        O.getOrElse(() => "")
      );
      return F.pipe(
        rawPath,
        Str.replace(/^\.\//, Str.empty), // Remove leading ./
        Str.replace(/\/index$/, Str.empty) // Remove trailing /index
      );
    };

    const bare = F.pipe(
      beepEntries,
      A.filter(([key]) => isBareExport(key)),
      A.map(([key, values]) => [key, normalizePath(values)] as const),
      R.fromEntries
    );

    const subPaths = F.pipe(
      beepEntries,
      A.filter(([key]) => !isBareExport(key)),
      A.map(([key, values]) => [key, normalizePath(values)] as const),
      R.fromEntries
    );

    return { bare, subPaths };
  }
);

/**
 * Find sub-path exports for a package that doesn't have a bare export.
 * E.g., for @beep/errors, find @beep/errors/client, @beep/errors/shared, etc.
 *
 * @param dep - The bare dependency name (e.g., "@beep/errors")
 * @param subPaths - All sub-path exports from tsconfig
 * @returns Array of sub-path keys that belong to this package
 */
const findSubPathExports = (dep: string, subPaths: Record<string, string>): ReadonlyArray<string> =>
  F.pipe(
    R.keys(subPaths),
    A.filter((key) => F.pipe(key, Str.startsWith(`${dep}/`)))
  );

/**
 * Generate path mappings for docgen examplesCompilerOptions.
 *
 * Computes relative paths from the source package to each @beep/* dependency
 * using the canonical paths from tsconfig.base.jsonc.
 *
 * For packages with sub-path exports (no bare export), generates mappings
 * for each sub-path (e.g., @beep/errors/client, @beep/errors/shared).
 *
 * @param sourcePackageRelativePath - Relative path of package being configured (e.g., "tooling/utils")
 * @param beepDeps - Array of @beep/* dependencies from package.json
 * @param rootPaths - Canonical @beep/* paths from tsconfig.base.jsonc (bare and sub-paths)
 * @param existingPaths - Existing @beep/* paths from package's own tsconfig (take precedence)
 * @returns Path mappings for examplesCompilerOptions
 */
const generatePathMappings = (
  sourcePackageRelativePath: string,
  beepDeps: ReadonlyArray<string>,
  rootPaths: RootTsConfigPaths,
  existingPaths: Record<string, ReadonlyArray<string>>
): Effect.Effect<Record<string, ReadonlyArray<string>>, never, Path.Path> =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const mappings: Record<string, string[]> = {};

    yield* Effect.forEach(beepDeps, (dep) =>
      Effect.gen(function* () {
        // Skip if already defined in package's own tsconfig
        if (dep in existingPaths) return;

        const depPath = rootPaths.bare[dep];

        if (depPath) {
          // Standard case: bare export exists
          const relativePath = path.relative(sourcePackageRelativePath, depPath);
          mappings[dep] = [`${relativePath}/index.js`];
          mappings[`${dep}/*`] = [`${relativePath}/*.js`];
        } else {
          // Check for sub-path exports (e.g., @beep/errors/client, @beep/errors/shared)
          const subPathKeys = findSubPathExports(dep, rootPaths.subPaths);

          if (F.pipe(subPathKeys, A.isNonEmptyReadonlyArray)) {
            // Add each sub-path export
            yield* Effect.forEach(subPathKeys, (subPathKey) =>
              Effect.gen(function* () {
                // Skip if already defined
                if (subPathKey in existingPaths) return;

                const subPathDepPath = rootPaths.subPaths[subPathKey];
                if (subPathDepPath) {
                  const relativePath = path.relative(sourcePackageRelativePath, subPathDepPath);
                  // Sub-paths typically point directly to a file, not a directory with index
                  // e.g., @beep/errors/client → packages/common/errors/src/client
                  mappings[subPathKey] = [`${relativePath}.js`];
                }
              })
            );
          } else {
            // No bare export and no sub-path exports found
            yield* Effect.logWarning(
              `Dependency ${dep} not found in tsconfig.base.jsonc paths. ` +
                `Add it to the root tsconfig or manually configure the path.`
            );
          }
        }
      })
    );

    // Merge: existing paths from package tsconfig take precedence
    return { ...mappings, ...(existingPaths as Record<string, string[]>) };
  });

/**
 * Handle the init command.
 */
const handleInit = (args: {
  readonly package: string;
  readonly dryRun: boolean;
  readonly force: boolean;
}): Effect.Effect<void, never, FileSystem.FileSystem | Path.Path | FsUtils.FsUtils | DocgenLogger> =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const logger = yield* DocgenLogger;

    yield* logger.info("Starting init", {
      package: args.package,
      dryRun: args.dryRun,
      force: args.force,
    });

    // Step 1: Resolve and validate package path
    const pkgInfo = yield* resolvePackageByPathOrName(args.package).pipe(
      Effect.tapError((e) =>
        logger.error("Invalid package", {
          path: e.path,
          error: e._tag,
          reason: e._tag === "InvalidPackagePathError" ? e.reason : (e.message ?? "not found"),
        })
      ),
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* error(
            `Invalid package: ${e.path} - ${e._tag === "InvalidPackagePathError" ? e.reason : (e.message ?? "not found")}`
          );
          return yield* Effect.fail(ExitCode.InvalidInput);
        })
      )
    );

    yield* info(`Initializing docgen for ${pkgInfo.name} (${pkgInfo.relativePath})`);
    yield* logger.debug("Resolved package path", {
      name: pkgInfo.name,
      absolutePath: pkgInfo.absolutePath,
      relativePath: pkgInfo.relativePath,
    });

    // Step 2: Check if docgen.json already exists
    const configExists = yield* hasDocgenConfig(pkgInfo.absolutePath);

    if (configExists && !args.force) {
      yield* logger.warn("Config already exists", {
        package: pkgInfo.name,
        path: pkgInfo.relativePath,
      });
      yield* error(`${DOCGEN_CONFIG_FILENAME} already exists at ${pkgInfo.relativePath}. Use --force to overwrite.`);
      return yield* Effect.fail(ExitCode.ConfigurationError);
    }

    if (configExists && args.force) {
      yield* logger.info("Overwriting existing config", { package: pkgInfo.name });
      yield* warning(`Overwriting existing ${DOCGEN_CONFIG_FILENAME}`);
    }

    // Step 3: Find and parse tsconfig
    const tsconfigPath = yield* findTsConfig(pkgInfo.absolutePath).pipe(
      Effect.tapError((e) =>
        logger.error("No tsconfig found", {
          package: pkgInfo.name,
          searchedFiles: [...e.searchedFiles],
        })
      ),
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* error(
            `No tsconfig found in ${pkgInfo.relativePath}. Searched: ${F.pipe(e.searchedFiles, A.join(", "))}`
          );
          return yield* Effect.fail(ExitCode.ConfigurationError);
        })
      )
    );

    const tsconfigFilename = path.basename(tsconfigPath);
    yield* logger.debug("Found tsconfig", { file: tsconfigFilename, path: tsconfigPath });

    const tsconfigContent = yield* loadTsConfig(tsconfigPath).pipe(
      Effect.tapError((e) =>
        logger.error("Failed to load tsconfig", {
          path: tsconfigPath,
          reason: e.reason,
        })
      ),
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* error(`Failed to load tsconfig: ${e.reason}`);
          return yield* Effect.fail(ExitCode.ConfigurationError);
        })
      )
    );

    const tsconfig = tsconfigContent as {
      compilerOptions?: {
        paths?: Record<string, string[]>;
        [key: string]: unknown;
      };
    };

    const existingPaths = extractBeepPaths(tsconfig.compilerOptions?.paths);
    const pathCount = F.pipe(R.keys(existingPaths), A.length);

    yield* success(`Found ${tsconfigFilename} with ${pathCount} path mappings`);

    // Step 4: Load canonical paths from root tsconfig.base.jsonc
    const rootPaths = yield* loadRootTsConfigPaths;

    // Step 5: Extract @beep/* dependencies
    const beepDeps = yield* extractBeepDependencies(pkgInfo.absolutePath).pipe(
      Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<string>))
    );

    yield* success(`Detected ${A.length(beepDeps)} @beep/* workspace dependencies`);

    // Step 6: Generate path mappings for examples compiler options
    const examplesPaths = yield* generatePathMappings(pkgInfo.relativePath, beepDeps, rootPaths, existingPaths);

    // Add self-referential path alias if not already present
    // Uses .ts extension for index (matches existing docgen.json patterns)
    const examplesPathsWithSelf = F.pipe(
      pkgInfo.name,
      O.liftPredicate((name) => F.pipe(name, Str.startsWith("@beep/")) && !(name in examplesPaths)),
      O.match({
        onNone: () => examplesPaths,
        onSome: (name) => ({
          [name]: ["./src/index.ts"],
          [`${name}/*`]: ["./src/*"],
          ...examplesPaths,
        }),
      })
    );

    // Step 7: Build the config
    const examplesCompilerOptions: CompilerOptions = {
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      moduleResolution: "Bundler",
      module: "ES2024",
      target: "ES2024",
      lib: ["ES2024", "DOM", "DOM.Iterable"],
      paths: F.pipe(R.keys(examplesPathsWithSelf), A.length) > 0 ? examplesPathsWithSelf : undefined,
    };

    // Compute $schema path relative to package location
    const schemaPath = `${path.relative(pkgInfo.relativePath, ".")}/node_modules/@effect/docgen/schema.json`;

    const config: DocgenConfig = {
      $schema: schemaPath,
      srcDir: "src",
      outDir: "docs",
      srcLink: `https://github.com/kriegcloud/beep-effect/tree/main/${pkgInfo.relativePath}/src/`,
      exclude: ["src/internal/**/*.ts"],
      examplesCompilerOptions,
    };

    // Step 8: Handle dry-run
    if (args.dryRun) {
      yield* Console.log(Str.empty);
      yield* Console.log(`${dryRunTag()} Would create ${DOCGEN_CONFIG_FILENAME}:`);
      yield* Console.log(Str.empty);
      yield* Console.log(JSON.stringify(config, null, 2));
      yield* Console.log(Str.empty);
      yield* info("No files were written (dry-run mode)");
      return;
    }

    // Step 9: Write config
    yield* writeDocgenConfig(pkgInfo.absolutePath, config).pipe(
      Effect.tapError((e) =>
        logger.error("Failed to write config", {
          package: pkgInfo.name,
          path: pkgInfo.absolutePath,
          reason: e.reason,
        })
      ),
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* error(`Failed to write config: ${e.reason}`);
          return yield* Effect.fail(ExitCode.ConfigurationError);
        })
      )
    );

    const outputPath = path.join(pkgInfo.relativePath, DOCGEN_CONFIG_FILENAME);
    yield* success(`Generated ${formatPath(outputPath)}`);
    yield* logger.info("Init complete", {
      package: pkgInfo.name,
      outputPath,
      pathMappings: F.pipe(R.keys(examplesPathsWithSelf), A.length),
    });
  }).pipe(
    Effect.catchAll((exitCode) =>
      Effect.gen(function* () {
        if (typeof exitCode === "number") {
          yield* Effect.sync(() => {
            process.exitCode = exitCode;
          });
        }
      })
    )
  );

/**
 * CLI command to bootstrap docgen configuration for a package.
 *
 * @example
 * ```ts
 * import { initCommand } from "@beep/repo-cli/commands/docgen/init"
 * import * as CliCommand from "@effect/cli/Command"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* CliCommand.run(initCommand, {
 *     name: "docgen",
 *     version: "1.0.0"
 *   })
 *   return result
 * })
 * ```
 *
 * @category constructors
 * @since 0.1.0
 */
export const initCommand = CliCommand.make(
  "init",
  { package: packageOption, dryRun: dryRunOption, force: forceOption },
  (args) => handleInit(args).pipe(Effect.provide(DocgenLoggerLive()))
).pipe(CliCommand.withDescription("Bootstrap docgen configuration for a package"));
