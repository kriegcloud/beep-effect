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
 * @see DOCGEN_CLI_IMPLEMENTATION.md
 */

import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
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
import { resolvePackagePath } from "./shared/discovery.js";
import { dryRunTag, error, formatPath, info, success, warning } from "./shared/output.js";
import type { CompilerOptions, DocgenConfig } from "./types.js";
import { ExitCode } from "./types.js";

// Options
const packageOption = CliOptions.text("package").pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Target package path (relative to repo root)")
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
 * Generate path mappings for @beep/* dependencies
 */
const generatePathMappings = (
  beepDeps: ReadonlyArray<string>,
  existingPaths: Record<string, ReadonlyArray<string>>
): Record<string, ReadonlyArray<string>> => {
  // Start with existing @beep/* paths from tsconfig
  const mappings: Record<string, string[]> = { ...existingPaths } as Record<string, string[]>;

  // Add mappings for dependencies not already present
  F.pipe(
    beepDeps,
    A.forEach((dep) => {
      if (!(dep in mappings)) {
        // Generate relative path - this is a heuristic
        // In monorepo, @beep/schema -> packages/common/schema/src/index.js
        const suffix = F.pipe(dep, Str.replace("@beep/", Str.empty));
        mappings[dep] = [`../../../${suffix}/src/index.js`];
        mappings[`${dep}/*`] = [`../../../${suffix}/src/*.js`];
      }
    })
  );

  return mappings;
};

/**
 * Handle the init command.
 */
const handleInit = (args: {
  readonly package: string;
  readonly dryRun: boolean;
  readonly force: boolean;
}): Effect.Effect<void, never, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const path = yield* Path.Path;

    // Step 1: Resolve and validate package path
    const pkgInfo = yield* resolvePackagePath(args.package).pipe(
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* error(
            `Invalid package path: ${e.path} - ${e._tag === "InvalidPackagePathError" ? e.reason : (e.message ?? "not found")}`
          );
          return yield* Effect.fail(ExitCode.InvalidInput);
        })
      )
    );

    yield* info(`Initializing docgen for ${pkgInfo.name} (${pkgInfo.relativePath})`);

    // Step 2: Check if docgen.json already exists
    const configExists = yield* hasDocgenConfig(pkgInfo.absolutePath);

    if (configExists && !args.force) {
      yield* error(`${DOCGEN_CONFIG_FILENAME} already exists at ${pkgInfo.relativePath}. Use --force to overwrite.`);
      return yield* Effect.fail(ExitCode.ConfigurationError);
    }

    if (configExists && args.force) {
      yield* warning(`Overwriting existing ${DOCGEN_CONFIG_FILENAME}`);
    }

    // Step 3: Find and parse tsconfig
    const tsconfigPath = yield* findTsConfig(pkgInfo.absolutePath).pipe(
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
    const tsconfigContent = yield* loadTsConfig(tsconfigPath).pipe(
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

    // Step 4: Extract @beep/* dependencies
    const beepDeps = yield* extractBeepDependencies(pkgInfo.absolutePath).pipe(
      Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<string>))
    );

    yield* success(`Detected ${A.length(beepDeps)} @beep/* workspace dependencies`);

    // Step 5: Generate path mappings for examples compiler options
    const examplesPaths = generatePathMappings(beepDeps, existingPaths);

    // Step 6: Get repo root for srcLink
    yield* findRepoRoot.pipe(Effect.catchAll(() => Effect.succeed(process.cwd())));

    // Step 7: Build the config
    const examplesCompilerOptions: CompilerOptions = {
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      moduleResolution: "Bundler",
      module: "ES2022",
      target: "ES2022",
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      paths: F.pipe(R.keys(examplesPaths), A.length) > 0 ? examplesPaths : undefined,
    };

    const config: DocgenConfig = {
      $schema: "../../node_modules/@effect/docgen/schema.json",
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
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* error(`Failed to write config: ${e.reason}`);
          return yield* Effect.fail(ExitCode.ConfigurationError);
        })
      )
    );

    const outputPath = path.join(pkgInfo.relativePath, DOCGEN_CONFIG_FILENAME);
    yield* success(`Generated ${formatPath(outputPath)}`);
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

export const initCommand = CliCommand.make(
  "init",
  { package: packageOption, dryRun: dryRunOption, force: forceOption },
  (args) => handleInit(args)
).pipe(CliCommand.withDescription("Bootstrap docgen configuration for a package"));
