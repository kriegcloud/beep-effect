/**
 * Human-first docgen command group.
 *
 * Restores the old subtree command surface in current repo style while
 * intentionally excluding AI or agent capabilities.
 *
 * @since 0.0.0
 * @module
 */

import { DomainError, findRepoRoot } from "@beep/repo-utils";
import { Console, Effect, FileSystem, Path } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";
import {
  aggregateGeneratedDocs,
  analyzePackageDocumentation,
  createDocgenConfigDocument,
  type DocgenAggregateResult,
  type DocgenGenerationResult,
  discoverDocgenWorkspacePackages,
  generateAnalysisJson,
  generateAnalysisReport,
  loadDocgenConfigDocument,
  normalizeDocsOutputPath,
  resolveDocgenWorkspacePackage,
  runDocgenForPackage,
} from "./internal/Operations.js";

const packageFlag = Flag.string("package").pipe(
  Flag.withAlias("p"),
  Flag.withDescription("Target a workspace package by name or repo-relative path"),
  Flag.optional
);
const requiredPackageFlag = Flag.string("package").pipe(
  Flag.withAlias("p"),
  Flag.withDescription("Target a workspace package by name or repo-relative path")
);
const outputFlag = Flag.string("output").pipe(
  Flag.withAlias("o"),
  Flag.withDescription("Write output to a specific file path"),
  Flag.optional
);
const jsonFlag = Flag.boolean("json").pipe(Flag.withDescription("Emit machine-readable JSON output"));
const verboseFlag = Flag.boolean("verbose").pipe(
  Flag.withAlias("v"),
  Flag.withDescription("Include extra package detail")
);
const cleanFlag = Flag.boolean("clean").pipe(Flag.withDescription("Remove the root docs directory before aggregating"));
const forceFlag = Flag.boolean("force").pipe(Flag.withDescription("Overwrite an existing docgen.json file"));
const dryRunFlag = Flag.boolean("dry-run").pipe(Flag.withDescription("Preview output without writing files"));
const fixModeFlag = Flag.boolean("fix-mode").pipe(
  Flag.withDescription("Render the markdown analysis as a checklist rather than a findings report")
);
const validateExamplesFlag = Flag.boolean("validate-examples").pipe(
  Flag.withDescription("Pass --validate-examples through to @effect/docgen")
);
const parallelFlag = Flag.integer("parallel").pipe(
  Flag.withAlias("j"),
  Flag.withDefault(4),
  Flag.withDescription("Maximum number of packages to process concurrently")
);

const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const renderJson = (value: unknown): string => `${encodeJson(value)}\n`;

const defaultAnalysisPath = (packagePath: string, json: boolean, path: Path.Path): string =>
  path.join(packagePath, json ? "JSDOC_ANALYSIS.json" : "JSDOC_ANALYSIS.md");

const logGenerationResults = Effect.fn(function* (results: ReadonlyArray<DocgenGenerationResult>) {
  const failures = results.filter((result) => !result.success);
  const successes = results.filter((result) => result.success);

  for (const result of successes) {
    const suffix = result.moduleCount === undefined ? "" : ` (${result.moduleCount} module file(s))`;
    yield* Console.log(`docgen: generated ${result.packagePath}${suffix}`);
  }

  for (const result of failures) {
    yield* Console.error(`docgen: failed ${result.packagePath}: ${result.error ?? "unknown error"}`);
    if (result.output !== undefined && Str.trim(result.output).length > 0) {
      yield* Console.error(result.output);
    }
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
});

const logAggregateResults = Effect.fn(function* (results: ReadonlyArray<DocgenAggregateResult>) {
  if (results.length === 0) {
    yield* Console.log("docgen: no generated package docs found to aggregate");
    return;
  }

  for (const result of results) {
    yield* Console.log(
      `docgen: aggregated ${result.packagePath} -> docs/${normalizeDocsOutputPath(result.packagePath)}`
    );
  }
});

const resolveGenerateTargets = (selector: O.Option<string>) =>
  Effect.gen(function* () {
    if (O.isSome(selector)) {
      const target = yield* resolveDocgenWorkspacePackage(selector.value);
      if (!target.hasDocgenConfig) {
        return yield* new DomainError({
          message: `${target.relativePath} is missing docgen.json. Run "bun run beep docgen init -p ${target.relativePath}" first.`,
        });
      }
      return [target] as const;
    }

    return yield* discoverDocgenWorkspacePackages().pipe(
      Effect.map((packages) => packages.filter((pkg) => pkg.hasDocgenConfig))
    );
  });

const resolveAnalyzeTargets = (selector: O.Option<string>) =>
  Effect.gen(function* () {
    if (O.isSome(selector)) {
      return [yield* resolveDocgenWorkspacePackage(selector.value)] as const;
    }

    return yield* discoverDocgenWorkspacePackages().pipe(
      Effect.map((packages) => packages.filter((pkg) => pkg.hasDocgenConfig))
    );
  });

const docgenInitCommand = Command.make(
  "init",
  {
    package: requiredPackageFlag,
    dryRun: dryRunFlag,
    force: forceFlag,
  },
  ({ package: selector, dryRun, force }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const repoRoot = yield* findRepoRoot();
      const target = yield* resolveDocgenWorkspacePackage(selector);
      const configPath = path.join(target.absolutePath, "docgen.json");

      if (target.hasDocgenConfig && !force) {
        process.exitCode = 1;
        yield* Console.error(
          `docgen: ${target.relativePath} already has docgen.json. Re-run with --force to overwrite.`
        );
        return;
      }

      const config = yield* createDocgenConfigDocument(target, repoRoot);
      const content = renderJson(config);

      if (dryRun) {
        yield* Console.log(`--- ${configPath} ---`);
        yield* Console.log(content);
        return;
      }

      yield* fs.writeFileString(configPath, content);
      yield* Console.log(`docgen: wrote ${configPath}`);
    }).pipe(
      Effect.catchTag(
        "DomainError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      ),
      Effect.catchTag(
        "NoSuchFileError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      )
    )
).pipe(Command.withDescription("Create or refresh docgen.json for a workspace package"));

const docgenStatusCommand = Command.make(
  "status",
  {
    verbose: verboseFlag,
    json: jsonFlag,
  },
  ({ verbose, json }) =>
    Effect.gen(function* () {
      const packages = yield* discoverDocgenWorkspacePackages();
      const configuredAndGenerated = packages.filter((pkg) => pkg.status === "configured-and-generated");
      const configuredNotGenerated = packages.filter((pkg) => pkg.status === "configured-not-generated");
      const notConfigured = packages.filter((pkg) => pkg.status === "not-configured");

      if (json) {
        yield* Console.log(
          renderJson({
            packages,
            summary: {
              total: packages.length,
              configuredAndGenerated: configuredAndGenerated.length,
              configuredNotGenerated: configuredNotGenerated.length,
              notConfigured: notConfigured.length,
            },
          })
        );
        return;
      }

      yield* Console.log("Docgen status:");
      yield* Console.log(`- configured and generated: ${configuredAndGenerated.length}`);
      yield* Console.log(`- configured, not generated: ${configuredNotGenerated.length}`);
      yield* Console.log(`- not configured: ${notConfigured.length}`);

      if (!verbose) {
        return;
      }

      for (const pkg of packages) {
        yield* Console.log(``);
        yield* Console.log(`${pkg.name}`);
        yield* Console.log(`  path: ${pkg.relativePath}`);
        yield* Console.log(`  status: ${pkg.status}`);
        yield* Console.log(`  docs: docs/${pkg.docsOutputPath}`);

        if (pkg.hasDocgenConfig) {
          const config = yield* loadDocgenConfigDocument(pkg.absolutePath).pipe(Effect.option);

          if (O.isSome(config)) {
            yield* Console.log(`  srcDir: ${config.value.srcDir ?? "src"}`);
            yield* Console.log(`  outDir: ${config.value.outDir ?? "docs"}`);
            yield* Console.log(`  exclude: ${(config.value.exclude ?? []).join(", ") || "none"}`);
          }
        }
      }
    }).pipe(
      Effect.catchTag(
        "DomainError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      ),
      Effect.catchTag(
        "NoSuchFileError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      )
    )
).pipe(Command.withDescription("Show docgen configuration and generation status across the workspace"));

const docgenGenerateCommand = Command.make(
  "generate",
  {
    package: packageFlag,
    validateExamples: validateExamplesFlag,
    parallel: parallelFlag,
    json: jsonFlag,
  },
  ({ package: selector, validateExamples, parallel, json }) =>
    Effect.gen(function* () {
      const targets = yield* resolveGenerateTargets(selector);

      if (targets.length === 0) {
        yield* Console.log("docgen: no configured packages found");
        return;
      }

      const results = yield* Effect.forEach(targets, (target) => runDocgenForPackage(target, validateExamples), {
        concurrency: Math.max(1, parallel),
      });

      if (json) {
        yield* Console.log(renderJson(results));
        if (results.some((result) => !result.success)) {
          process.exitCode = 1;
        }
        return;
      }

      yield* logGenerationResults(results);
    }).pipe(
      Effect.catchTag(
        "DomainError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      ),
      Effect.catchTag(
        "NoSuchFileError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      )
    )
).pipe(Command.withDescription("Run @effect/docgen for one package or every configured package"));

const docgenAggregateCommand = Command.make(
  "aggregate",
  {
    package: packageFlag,
    clean: cleanFlag,
  },
  ({ package: selector, clean }) =>
    Effect.gen(function* () {
      const results = yield* aggregateGeneratedDocs({
        clean,
        package: O.getOrUndefined(selector),
      });
      yield* logAggregateResults(results);
    }).pipe(
      Effect.catchTag(
        "DomainError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      ),
      Effect.catchTag(
        "NoSuchFileError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      )
    )
).pipe(Command.withDescription("Copy generated package docs into the current root docs layout"));

const docgenAnalyzeCommand = Command.make(
  "analyze",
  {
    package: packageFlag,
    output: outputFlag,
    json: jsonFlag,
    fixMode: fixModeFlag,
  },
  ({ package: selector, output, json, fixMode }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const targets = yield* resolveAnalyzeTargets(selector);

      if (targets.length === 0) {
        yield* Console.log("docgen: no packages selected for analysis");
        return;
      }

      if (O.isSome(output) && O.isNone(selector)) {
        process.exitCode = 1;
        yield* Console.error("docgen: --output requires --package so the destination is unambiguous.");
        return;
      }

      const analyses = yield* Effect.forEach(targets, analyzePackageDocumentation, {
        concurrency: "unbounded",
      });

      if (json) {
        if (O.isSome(output)) {
          const content = analyses.length === 1 ? generateAnalysisJson(analyses[0]!) : renderJson(analyses);
          yield* fs.writeFileString(output.value, content);
          yield* Console.log(`docgen: wrote ${output.value}`);
          return;
        }

        yield* Console.log(analyses.length === 1 ? generateAnalysisJson(analyses[0]!) : renderJson(analyses));
        return;
      }

      if (O.isSome(selector)) {
        const target = targets[0];
        const analysis = analyses[0];
        if (target === undefined || analysis === undefined) {
          return;
        }
        const report = generateAnalysisReport(analysis, fixMode);
        const destination = O.getOrElse(output, () => defaultAnalysisPath(target.absolutePath, false, path));
        yield* fs.writeFileString(destination, report);
        yield* Console.log(`docgen: wrote ${destination}`);
        return;
      }

      for (let index = 0; index < targets.length; index += 1) {
        const target = targets[index];
        const analysis = analyses[index];
        if (target === undefined || analysis === undefined) {
          continue;
        }

        const destination = defaultAnalysisPath(target.absolutePath, false, path);
        yield* fs.writeFileString(destination, generateAnalysisReport(analysis, fixMode));
        yield* Console.log(`docgen: wrote ${destination}`);
      }
    }).pipe(
      Effect.catchTag(
        "DomainError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      ),
      Effect.catchTag(
        "NoSuchFileError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`docgen: ${error.message}`);
        })
      )
    )
).pipe(Command.withDescription("Analyze JSDoc coverage and write a human-first report"));

const printDocgenIndex = Effect.fn(function* () {
  yield* Console.log("Docgen commands:");
  yield* Console.log("- bun run beep docgen status");
  yield* Console.log("- bun run beep docgen init -p packages/common/schema");
  yield* Console.log("- bun run beep docgen generate");
  yield* Console.log("- bun run beep docgen aggregate");
  yield* Console.log("- bun run beep docgen analyze -p packages/common/schema");
});

/**
 * Human-first docgen command suite.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const docgenCommand = Command.make("docgen", {}, printDocgenIndex).pipe(
  Command.withDescription("Documentation generation utilities without AI or agent workflows"),
  Command.withSubcommands([
    docgenStatusCommand,
    docgenInitCommand,
    docgenGenerateCommand,
    docgenAggregateCommand,
    docgenAnalyzeCommand,
  ])
);
