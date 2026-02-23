/**
 * Package creation command - scaffold new packages following Effect v4 conventions.
 *
 * Generates package files via reusable services:
 * - TemplateService for template rendering
 * - FileGenerationPlanService for deterministic plan/execute
 * - Config updater orchestration for root tsconfig updates
 *
 * @since 0.0.0
 * @module
 */

import { DomainError, encodePackageJsonPrettyEffect, findRepoRoot } from "@beep/repo-utils";
import { FileSystem, Path, type Schema } from "effect";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { Argument, Command, Flag } from "effect/unstable/cli";
import {
  type ConfigUpdateBatchResult,
  type ConfigUpdateTarget,
  checkConfigNeedsUpdateForTargets,
  updateRootConfigsForTargets,
} from "./config-updater.js";
import { createFileGenerationPlanService } from "./file-generation-plan-service.js";
import { createTemplateService, type TemplateSpec } from "./template-service.js";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Build ordered template directory candidates for create-package execution.
 *
 * @param baseDir - Directory of the currently executing command module.
 * @param path - Path service used to compose normalized candidate paths.
 * @returns Candidate directories in preferred lookup order.
 * @since 0.0.0
 * @category constructors
 */
const templateDirCandidates = (baseDir: string, path: Path.Path): ReadonlyArray<string> => [
  path.join(baseDir, "templates"),
  path.join(baseDir, "..", "..", "..", "src", "commands", "create-package", "templates"),
];

/**
 * Resolve create-package template directory for both src and dist runtimes.
 *
 * In source execution (`bun run src/bin.ts`), templates live beside this file.
 * In built execution (`dist/bin.js`), templates are copied under `dist/.../templates`.
 * A src fallback is retained for local development scenarios where dist assets
 * are stale but source templates are present.
 *
 * @param baseDir - Optional command module directory override (defaults to current module directory).
 * @returns Resolved template directory path.
 * @since 0.0.0
 * @category constructors
 */
export const resolveCreatePackageTemplateDir = Effect.fn(function* (baseDir: string = import.meta.dirname) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const candidates = templateDirCandidates(baseDir, path);

  for (const candidate of candidates) {
    const exists = yield* fs.exists(candidate).pipe(Effect.orElseSucceed(() => false));
    if (exists) {
      return candidate;
    }
  }

  return yield* new DomainError({
    message: `Unable to resolve create-package templates. Checked:\n${A.join(
      A.map(candidates, (candidate) => `  - ${candidate}`),
      "\n"
    )}`,
  });
});

/**
 * Valid package types.
 *
 * @since 0.0.0
 * @category constants
 */
const VALID_TYPES = ["library", "tool", "app"] as const;

const isValidPackageType: P.Predicate<string> = (value) => A.some(VALID_TYPES, (type) => type === value);

/**
 * Mapping from template source to output path.
 *
 * @since 0.0.0
 * @category constants
 */
const TEMPLATE_SPECS: ReadonlyArray<TemplateSpec> = [
  { templateName: "tsconfig.json.hbs", outputPath: "tsconfig.json" },
  { templateName: "src-index.ts.hbs", outputPath: "src/index.ts" },
  { templateName: "LICENSE.hbs", outputPath: "LICENSE" },
  { templateName: "README.md.hbs", outputPath: "README.md" },
  { templateName: "AGENTS.md.hbs", outputPath: "AGENTS.md" },
  { templateName: "ai-context.md.hbs", outputPath: "ai-context.md" },
  { templateName: "docgen.json.hbs", outputPath: "docgen.json" },
  { templateName: "vitest.config.ts.hbs", outputPath: "vitest.config.ts" },
  { templateName: "docs-index.md.hbs", outputPath: "docs/index.md" },
];

/**
 * Ordered list of all generated files for dry-run and summary output.
 *
 * @since 0.0.0
 * @category constants
 */
const ALL_FILES: ReadonlyArray<string> = [
  "package.json",
  "tsconfig.json",
  "src/index.ts",
  "test/.gitkeep",
  "dtslint/.gitkeep",
  "LICENSE",
  "README.md",
  "AGENTS.md",
  "ai-context.md",
  "CLAUDE.md -> AGENTS.md (symlink)",
  "docgen.json",
  "vitest.config.ts",
  "docs/index.md",
];

/**
 * Root-relative directories created for each package.
 *
 * @since 0.0.0
 * @category constants
 */
const PACKAGE_DIRECTORIES: ReadonlyArray<string> = ["src", "test", "dtslint", "docs"];

const templateService = createTemplateService();
const fileGenerationPlanService = createFileGenerationPlanService();

// ── Template context ──────────────────────────────────────────────────────────

/**
 * Variables passed into every template during package scaffolding.
 *
 * @since 0.0.0
 * @category types
 */
interface TemplateContext {
  readonly name: string;
  readonly scopedName: string;
  readonly type: string;
  readonly description: string;
  readonly year: string;
  readonly parentDir: string;
  readonly packagePath: string;
  readonly rootRelative: string;
  readonly isTool: boolean;
  readonly isApp: boolean;
  readonly isLibrary: boolean;
}

/**
 * Validate an optional parent directory override like `packages/common`.
 *
 * Must be repo-relative, normalized, and free of traversal segments.
 *
 * @param value Parent directory override to validate.
 * @returns True when the override is safe and repo-relative.
 */
const isValidParentDir = (value: string): boolean => {
  const hasBoundaryMarker: P.Predicate<string> = P.some(
    A.make(Str.startsWith("/"), Str.endsWith("/"), Str.includes("//"))
  );
  const isReservedSegment: P.Predicate<string> = P.some(
    A.make(
      (segment: string) => segment === ".",
      (segment: string) => segment === "..",
      Str.isEmpty
    )
  );
  const hasReservedSegment: P.Predicate<string> = (parentDir) => A.some(Str.split("/")(parentDir), isReservedSegment);

  if (!/^[a-z0-9][a-z0-9/_-]*$/.test(value)) return false;
  if (hasBoundaryMarker(value)) return false;
  return P.not(hasReservedSegment)(value);
};

/**
 * Compute the path from a package directory back to repo root.
 *
 * Examples:
 * - `tooling/cli` => `../../`
 * - `packages/common/types` => `../../../`
 *
 * @param packagePath Repo-relative package path.
 * @returns Relative path from the package directory to repo root.
 */
const toRootRelative = (packagePath: string): string =>
  A.join(
    A.makeBy(A.length(Str.split("/")(packagePath)), () => "../"),
    ""
  );

const singleTargetFallback = (
  target: ConfigUpdateTarget,
  result: { tsconfigPackages: boolean; tsconfigPaths: boolean; tstycheConfig: boolean }
) =>
  ({
    targets: [
      {
        target,
        result,
      },
    ],
    tsconfigPackages: result.tsconfigPackages,
    tsconfigPaths: result.tsconfigPaths,
    tstycheConfig: result.tstycheConfig,
  }) satisfies ConfigUpdateBatchResult;

// ── Command ───────────────────────────────────────────────────────────────────

/**
 * CLI command that scaffolds a new package with templates, a Schema-validated
 * `package.json`, and automatic root tsconfig updates (project references + path aliases).
 *
 * @since 0.0.0
 * @category commands
 */
export const createPackageCommand = Command.make(
  "create-package",
  {
    name: Argument.string("name").pipe(Argument.withDescription("Package name (e.g. my-utils)")),
    type: Flag.string("type").pipe(
      Flag.withDescription("Package type: library, tool, or app"),
      Flag.withDefault("library")
    ),
    parentDir: Flag.string("parent-dir").pipe(
      Flag.withDescription("Optional output parent directory relative to repo root (e.g. packages/common)"),
      Flag.withDefault("")
    ),
    dirName: Flag.string("dir-name").pipe(
      Flag.withDescription(
        "Override folder name (defaults to package name). E.g. --dir-name domain for packages/shared/domain"
      ),
      Flag.withDefault("")
    ),
    description: Flag.string("description").pipe(Flag.withDescription("Package description"), Flag.withDefault("")),
    dryRun: Flag.boolean("dry-run").pipe(Flag.withDescription("Preview changes without writing files")),
  },
  Effect.fn(function* (config) {
    const { name, type, parentDir: parentDirOverride, dirName: dirNameOverride, description, dryRun } = config;

    // ── Validate type ──────────────────────────────────────────────────
    if (P.not(isValidPackageType)(type)) {
      return yield* new DomainError({
        message: `Invalid package type "${type}". Must be one of: ${A.join(VALID_TYPES, ", ")}`,
      });
    }

    // ── Validate package name ─────────────────────────────────────────
    const PackageNamePattern = /^[a-z_][a-z0-9._-]*$/;
    if (!PackageNamePattern.test(name)) {
      return yield* new DomainError({
        message: `Invalid package name "${name}". Must start with a lowercase letter or underscore, contain only [a-z0-9._-].`,
      });
    }

    // ── Resolve directory name ─────────────────────────────────────────
    const dirName = Str.isNonEmpty(dirNameOverride) ? dirNameOverride : name;
    if (Str.isNonEmpty(dirNameOverride) && !PackageNamePattern.test(dirName)) {
      return yield* new DomainError({
        message: `Invalid dir name "${dirName}". Must start with a lowercase letter or underscore, contain only [a-z0-9._-].`,
      });
    }

    // ── Resolve parent directory ───────────────────────────────────────
    const defaultParentDir = type === "app" ? "apps" : "tooling";
    const parentDir = Str.isNonEmpty(parentDirOverride) ? parentDirOverride : defaultParentDir;
    if (!isValidParentDir(parentDir)) {
      return yield* new DomainError({
        message: `Invalid parent dir "${parentDir}". Use a repo-relative path like "tooling", "apps", or "packages/common".`,
      });
    }
    const packagePath = `${parentDir}/${dirName}`;

    // ── Resolve services ───────────────────────────────────────────────
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // ── Discover repo root ─────────────────────────────────────────────
    const repoRoot = yield* findRepoRoot();

    // ── Determine output directory ─────────────────────────────────────
    const outputDir = path.join(repoRoot, packagePath);

    // ── Check if directory already exists (skip for dry-run) ───────────
    if (!dryRun) {
      const alreadyExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));
      if (alreadyExists) {
        return yield* new DomainError({
          message: `Directory already exists: ${outputDir}\nRemove it first or choose a different package name.`,
        });
      }
    }

    const configTarget: ConfigUpdateTarget = {
      packageName: name,
      packagePath,
    };

    // ── Dry-run: preview output and root config updates ────────────────
    if (dryRun) {
      yield* Console.log(`[dry-run] Would create package @beep/${name} (type: ${type})`);
      if (dirName !== name) {
        yield* Console.log(`[dry-run] Directory name: ${dirName} (overridden from package name "${name}")`);
      }
      yield* Console.log(`[dry-run] Directory: ${outputDir}`);
      yield* Console.log(`[dry-run] Files:`);
      for (const file of ALL_FILES) {
        yield* Console.log(`  - ${file}`);
      }

      const configNeedsBatch = yield* checkConfigNeedsUpdateForTargets(repoRoot, [configTarget]).pipe(
        Effect.orElseSucceed(() =>
          singleTargetFallback(configTarget, { tsconfigPackages: true, tsconfigPaths: true, tstycheConfig: true })
        )
      );
      const configNeeds = O.getOrElse(
        O.map(A.get(configNeedsBatch.targets, 0), (targetResult) => targetResult.result),
        () => ({ tsconfigPackages: true, tsconfigPaths: true, tstycheConfig: true })
      );

      yield* Console.log(`[dry-run] Root config updates:`);
      yield* Console.log(
        `  - tsconfig.packages.json: ${configNeeds.tsconfigPackages ? `Add reference { "path": "${packagePath}" }` : "SKIP (already exists)"}`
      );
      yield* Console.log(
        `  - tsconfig.json: ${configNeeds.tsconfigPaths ? `Add path aliases @beep/${name}, @beep/${name}/*` : "SKIP (already exists)"}`
      );
      yield* Console.log(
        `  - tstyche.config.json: ${configNeeds.tstycheConfig ? `Add test file match "${packagePath}/dtslint/**/*.tst.*"` : "SKIP (already covered)"}`
      );
      return;
    }

    // ── Build template context ─────────────────────────────────────────
    const currentYear = `${DateTime.getPartUtc(DateTime.nowUnsafe(), "year")}`;
    const ctx: TemplateContext = {
      name,
      scopedName: `@beep/${name}`,
      type,
      description,
      year: currentYear,
      parentDir,
      packagePath,
      rootRelative: toRootRelative(packagePath),
      isTool: type === "tool",
      isApp: type === "app",
      isLibrary: type === "library",
    };

    // ── Render templates and generate plan ─────────────────────────────
    const templateDir = yield* resolveCreatePackageTemplateDir();
    const templateFiles = yield* templateService.renderTemplates({
      templateDir,
      templates: TEMPLATE_SPECS,
      context: ctx,
    });

    const packageJson = yield* generatePackageJson(name, type, description, packagePath);

    const plan = fileGenerationPlanService.createPlan({
      outputDir,
      directories: PACKAGE_DIRECTORIES,
      files: A.flatMap(
        A.make(
          A.make({ relativePath: "package.json", content: packageJson }),
          A.map(templateFiles, (file) => ({ relativePath: file.outputPath, content: file.content })),
          A.make({ relativePath: "test/.gitkeep", content: "" }, { relativePath: "dtslint/.gitkeep", content: "" })
        ),
        (entries) => entries
      ),
      symlinks: [{ relativePath: "CLAUDE.md", target: "AGENTS.md" }],
    });

    // ── Execute plan and config updates ────────────────────────────────
    yield* fileGenerationPlanService.executePlan(plan);

    const configBatch = yield* updateRootConfigsForTargets(repoRoot, [configTarget]).pipe(
      Effect.orElseSucceed(() =>
        singleTargetFallback(configTarget, { tsconfigPackages: false, tsconfigPaths: false, tstycheConfig: false })
      )
    );
    const configResults = O.getOrElse(
      O.map(A.get(configBatch.targets, 0), (targetResult) => targetResult.result),
      () => ({ tsconfigPackages: false, tsconfigPaths: false, tstycheConfig: false })
    );

    // ── Print summary ──────────────────────────────────────────────────
    yield* Console.log(`Created package @beep/${name} at ${outputDir}`);
    yield* Console.log(`Files created:`);
    for (const file of ALL_FILES) {
      yield* Console.log(`  - ${file}`);
    }
    if (configResults.tsconfigPackages || configResults.tsconfigPaths || configResults.tstycheConfig) {
      yield* Console.log(`\nRoot configs updated:`);
      if (configResults.tsconfigPackages) {
        yield* Console.log(`  - tsconfig.packages.json: Added reference "${packagePath}"`);
      }
      if (configResults.tsconfigPaths) {
        yield* Console.log(`  - tsconfig.json: Added path aliases @beep/${name}`);
      }
      if (configResults.tstycheConfig) {
        yield* Console.log(`  - tstyche.config.json: Added test file match "${packagePath}/dtslint/**/*.tst.*"`);
      }
    }
    yield* Console.log(`\nNext steps:`);
    yield* Console.log(`  1. Run "bun install" to link the new package`);
    yield* Console.log(`  2. Start building in src/index.ts`);
  })
).pipe(Command.withDescription("Create a new package following Effect v4 conventions"));

// ── Template generators ────────────────────────────────────────────────────

/**
 * Build a pretty-printed `package.json` string for a new package.
 *
 * Constructs the package manifest object with standard scripts, exports map,
 * and publish configuration, then encodes it through the repo-utils Schema
 * encoder to guarantee structural validity.
 *
 * @param name - The unscoped package name (e.g. `"my-utils"`). Will be prefixed with `@beep/`.
 * @param type - One of `"library"`, `"tool"`, or `"app"`. Tools receive an extra `@effect/platform-node` dependency.
 * @param description - Human-readable package description for the `"description"` field.
 * @param packagePath - Package path relative to repo root (e.g. `"tooling/my-utils"`).
 * @returns A JSON string (with trailing newline) ready to be written to disk.
 * @since 0.0.0
 * @category functions
 */
const generatePackageJson: (
  name: string,
  type: string,
  description: string,
  packagePath: string
) => Effect.Effect<string, DomainError | Schema.SchemaError> = Effect.fn(
  function* (name, type, description, packagePath) {
    const dependencies: Record<string, string> = {
      effect: "catalog:",
    };

    if (type === "tool") {
      dependencies["@effect/platform-node"] = "catalog:";
    }

    const pkg = {
      name: `@beep/${name}`,
      version: "0.0.0",
      type: "module",
      private: true,
      license: "MIT",
      description,
      homepage: `https://github.com/kriegcloud/beep-effect/tree/main/${packagePath}`,
      repository: {
        type: "git",
        url: "git@github.com:kriegcloud/beep-effect.git",
        directory: packagePath,
      },
      sideEffects: [],
      exports: {
        "./package.json": "./package.json",
        ".": "./src/index.ts",
        "./*": "./src/*.ts",
        "./internal/*": null,
      },
      files: ["src/**/*.ts", "dist/**/*.js", "dist/**/*.js.map", "dist/**/*.d.ts", "dist/**/*.d.ts.map"],
      publishConfig: {
        access: "public",
        provenance: true,
        exports: {
          "./package.json": "./package.json",
          ".": "./dist/index.ts",
          "./*": "./dist/*.js",
          "./internal/*": null,
        },
      },
      scripts: {
        codegen: "echo 'no codegen needed'",
        build: "tsc -b tsconfig.json && bun run babel",
        "build:tsgo": "tsgo -b tsconfig.json && bun run babel",
        babel: "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
        check: "tsc -b tsconfig.json",
        test: "vitest",
        coverage: "vitest --coverage",
        docgen: "bunx @effect/docgen",
      },
      dependencies,
      devDependencies: {
        "@types/node": "catalog:",
        "@effect/vitest": "catalog:",
      },
    };

    const json = yield* encodePackageJsonPrettyEffect(pkg);
    return `${json}\n`;
  }
);
