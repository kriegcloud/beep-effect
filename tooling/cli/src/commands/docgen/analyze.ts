/**
 * @file Docgen Analyze Command
 *
 * Analyzes JSDoc coverage in a package and generates an agent-friendly report.
 * Uses ts-morph for lightweight pre-check of exports and their JSDoc tags.
 *
 * Behavior:
 * 1. Parse TypeScript source files using ts-morph
 * 2. Extract all exported symbols and their JSDoc blocks
 * 3. Check for required tags: @category, @example, @since
 * 4. Generate source-mapped results with exact file:line references
 * 5. Output agent-friendly markdown document (JSDOC_ANALYSIS.md)
 *
 * Options:
 * - --package, -p <path>: Target specific package (default: all configured)
 * - --output, -o <path>: Custom output path (default: <package>/JSDOC_ANALYSIS.md)
 * - --json: Also output JSON results
 * - --fix-mode: Generate agent-actionable checklist format
 *
 * Exit Codes:
 * - 0: Success
 * - 1: Invalid input (package not found)
 * - 2: Configuration error (no docgen.json)
 * - 3: Execution error (ts-morph parsing failed)
 *
 * @module docgen/analyze
 * @see DOCGEN_CLI_IMPLEMENTATION.md#2-beep-docgen-analyze
 */

import type { FsUtils } from "@beep/tooling-utils";
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { analyzePackage } from "./shared/ast.js";
import { loadDocgenConfig } from "./shared/config.js";
import { discoverConfiguredPackages, resolvePackagePath } from "./shared/discovery.js";
import { generateAnalysisJson, generateAnalysisReport } from "./shared/markdown.js";
import { blank, error, formatPath, header, info, success, warning } from "./shared/output.js";
import type { ExportAnalysis, PackageAnalysis, PackageAnalysisSummary } from "./types.js";
import { ExitCode } from "./types.js";

// Options
const packageOption = CliOptions.optional(CliOptions.text("package")).pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Target package path (defaults to all configured packages)")
);

const outputOption = CliOptions.optional(CliOptions.text("output")).pipe(
  CliOptions.withAlias("o"),
  CliOptions.withDescription("Custom output path for the report")
);

const jsonOption = CliOptions.boolean("json").pipe(
  CliOptions.withDefault(false),
  CliOptions.withDescription("Also output JSON results")
);

const fixModeOption = CliOptions.boolean("fix-mode").pipe(
  CliOptions.withDefault(false),
  CliOptions.withDescription("Generate agent-actionable checklist format")
);

/**
 * Check if export has a specific missing tag.
 */
const hasMissingTag = (exp: ExportAnalysis, tag: string): boolean =>
  F.pipe([...exp.missingTags], A.some(Eq.equals(tag)));

/**
 * Check if export has any missing tags.
 */
const hasMissingTags = (exp: ExportAnalysis): boolean => A.length(exp.missingTags) > 0;

/**
 * Compute summary statistics from export analysis.
 */
const computeSummary = (exports: ReadonlyArray<ExportAnalysis>): PackageAnalysisSummary => ({
  totalExports: A.length(exports),
  fullyDocumented: F.pipe(
    exports,
    A.filter((e) => !hasMissingTags(e)),
    A.length
  ),
  missingDocumentation: F.pipe(exports, A.filter(hasMissingTags), A.length),
  missingCategory: F.pipe(
    exports,
    A.filter((e) => hasMissingTag(e, "@category")),
    A.length
  ),
  missingExample: F.pipe(
    exports,
    A.filter((e) => hasMissingTag(e, "@example")),
    A.length
  ),
  missingSince: F.pipe(
    exports,
    A.filter((e) => hasMissingTag(e, "@since")),
    A.length
  ),
});

/**
 * Analyze a single package and generate report.
 */
const analyzePackageAndReport = (
  pkgPath: string,
  pkgName: string,
  relativePath: string,
  customOutput: string | undefined,
  outputJson: boolean
): Effect.Effect<void, never, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // Load docgen config to get srcDir and exclude patterns
    const config = yield* loadDocgenConfig(pkgPath).pipe(
      Effect.catchAll((_e) =>
        Effect.gen(function* () {
          yield* warning(`No docgen.json in ${relativePath}, using defaults`);
          return { srcDir: "src", exclude: A.empty() as readonly string[] };
        })
      )
    );

    const srcDir = config.srcDir ?? "src";
    const exclude = [...(config.exclude ?? A.empty())];

    // Analyze the package
    yield* info(`Analyzing ${pkgName}...`);

    const exports = yield* analyzePackage(pkgPath, srcDir, exclude).pipe(
      Effect.catchAll((e) =>
        Effect.gen(function* () {
          yield* error(`Failed to analyze ${pkgName}: ${String(e.cause)}`);
          return A.empty() as ReadonlyArray<ExportAnalysis>;
        })
      )
    );

    if (F.pipe(exports, A.length, Eq.equals(0))) {
      yield* warning(`No exports found in ${pkgName}`);
      return;
    }

    // Compute summary
    const summary = computeSummary(exports);

    const timestamp = yield* DateTime.now.pipe(
      Effect.map(DateTime.toDateUtc),
      Effect.map((d) => d.toISOString())
    );
    // Build analysis result
    const analysis: PackageAnalysis = {
      packageName: pkgName,
      packagePath: relativePath,
      timestamp,
      exports: [...exports],
      summary,
    };

    // Generate and write markdown report
    const outputPath = customOutput ?? path.join(pkgPath, "JSDOC_ANALYSIS.md");
    const report = generateAnalysisReport(analysis);
    yield* fs.writeFileString(outputPath, report).pipe(
      Effect.catchAll((_e) =>
        Effect.gen(function* () {
          yield* error(`Failed to write report to ${outputPath}`);
        })
      )
    );

    // Optionally write JSON
    if (outputJson) {
      const jsonPath = F.pipe(outputPath, (p) =>
        F.pipe(p, (s) => {
          const idx = s.lastIndexOf(".md");
          return idx >= 0 ? `${Str.slice(0, idx)(s)}.json` : `${s}.json`;
        })
      );
      yield* fs.writeFileString(jsonPath, generateAnalysisJson(analysis)).pipe(
        Effect.catchAll((_e) =>
          Effect.gen(function* () {
            yield* error(`Failed to write JSON to ${jsonPath}`);
          })
        )
      );
    }

    // Print summary
    yield* blank();
    yield* header(`Analysis: ${pkgName}`);
    yield* Console.log(`  Total exports: ${summary.totalExports}`);
    yield* Console.log(`  Fully documented: ${summary.fullyDocumented}`);
    yield* Console.log(`  Missing documentation: ${summary.missingDocumentation}`);
    yield* blank();
    yield* success(`Report written to ${formatPath(outputPath)}`);
  });

/**
 * Handle the analyze command.
 */
const handleAnalyze = (args: {
  readonly package: string | undefined;
  readonly output: string | undefined;
  readonly json: boolean;
  readonly fixMode: boolean;
}): Effect.Effect<void, never, FileSystem.FileSystem | Path.Path | FsUtils.FsUtils> =>
  Effect.gen(function* () {
    // Resolve target packages
    if (args.package !== undefined) {
      // Single package mode
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

      yield* analyzePackageAndReport(pkgInfo.absolutePath, pkgInfo.name, pkgInfo.relativePath, args.output, args.json);
    } else {
      // All configured packages mode
      const packages = yield* discoverConfiguredPackages;

      if (F.pipe(packages, A.length, Eq.equals(0))) {
        yield* warning("No packages with docgen.json found");
        return;
      }

      yield* info(`Found ${A.length(packages)} configured packages`);
      yield* blank();

      // Analyze each package
      yield* Effect.forEach(
        [...packages],
        (pkg) =>
          analyzePackageAndReport(
            pkg.absolutePath,
            pkg.name,
            pkg.relativePath,
            undefined, // Use default output path per package
            args.json
          ),
        { discard: true }
      );

      yield* blank();
      yield* success(`Analyzed ${A.length(packages)} packages`);
    }
  }).pipe(
    Effect.catchAll((exitCode) =>
      Effect.gen(function* () {
        if (Num.isNumber(exitCode)) {
          yield* Effect.sync(() => {
            process.exitCode = exitCode;
          });
        }
      })
    )
  );

export const analyzeCommand = CliCommand.make(
  "analyze",
  {
    package: packageOption,
    output: outputOption,
    json: jsonOption,
    fixMode: fixModeOption,
  },
  (args) =>
    handleAnalyze({
      package: O.getOrUndefined(args.package),
      output: O.getOrUndefined(args.output),
      json: args.json,
      fixMode: args.fixMode,
    })
).pipe(CliCommand.withDescription("Analyze JSDoc coverage and generate agent-friendly report"));
