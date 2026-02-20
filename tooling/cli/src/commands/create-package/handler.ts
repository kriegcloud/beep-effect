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
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
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
 * Absolute path to the Handlebars template directory, resolved relative to the compiled module.
 *
 * @since 0.0.0
 * @category constants
 */
const TEMPLATE_DIR = `${import.meta.dirname}/templates`;

/**
 * Valid package types.
 *
 * @since 0.0.0
 * @category constants
 */
const VALID_TYPES = ["library", "tool", "app"] as const;

type PackageType = (typeof VALID_TYPES)[number];

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
 */
const isValidParentDir = (value: string): boolean => {
  if (!/^[a-z0-9][a-z0-9/_-]*$/.test(value)) return false;
  if (value.startsWith("/") || value.endsWith("/") || value.includes("//")) return false;
  return !value.split("/").some((segment) => segment === "." || segment === ".." || segment.length === 0);
};

/**
 * Compute the path from a package directory back to repo root.
 *
 * Examples:
 * - `tooling/cli` => `../../`
 * - `packages/common/types` => `../../../`
 */
const toRootRelative = (packagePath: string): string => "../".repeat(packagePath.split("/").length);

const singleTargetFallback = (
  target: ConfigUpdateTarget,
  result: { tsconfigPackages: boolean; tsconfigPaths: boolean }
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
    description: Flag.string("description").pipe(Flag.withDescription("Package description"), Flag.withDefault("")),
    dryRun: Flag.boolean("dry-run").pipe(Flag.withDescription("Preview changes without writing files")),
  },
  Effect.fn(function* (config) {
    const { name, type, parentDir: parentDirOverride, description, dryRun } = config;

    // ── Validate type ──────────────────────────────────────────────────
    if (!VALID_TYPES.includes(type as PackageType)) {
      return yield* new DomainError({
        message: `Invalid package type "${type}". Must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }

    // ── Validate package name ─────────────────────────────────────────
    const PackageNamePattern = /^[a-z_][a-z0-9._-]*$/;
    if (!PackageNamePattern.test(name)) {
      return yield* new DomainError({
        message: `Invalid package name "${name}". Must start with a lowercase letter or underscore, contain only [a-z0-9._-].`,
      });
    }

    // ── Resolve parent directory ───────────────────────────────────────
    const defaultParentDir = type === "app" ? "apps" : "tooling";
    const parentDir = parentDirOverride.length > 0 ? parentDirOverride : defaultParentDir;
    if (!isValidParentDir(parentDir)) {
      return yield* new DomainError({
        message: `Invalid parent dir "${parentDir}". Use a repo-relative path like "tooling", "apps", or "packages/common".`,
      });
    }
    const packagePath = `${parentDir}/${name}`;

    // ── Resolve services ───────────────────────────────────────────────
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // ── Discover repo root ─────────────────────────────────────────────
    const repoRoot = yield* findRepoRoot();

    // ── Determine output directory ─────────────────────────────────────
    const outputDir = path.join(repoRoot, packagePath);

    // ── Check if directory already exists ──────────────────────────────
    const alreadyExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));
    if (alreadyExists) {
      return yield* new DomainError({
        message: `Directory already exists: ${outputDir}\nRemove it first or choose a different package name.`,
      });
    }

    const configTarget: ConfigUpdateTarget = {
      packageName: name,
      packagePath,
    };

    // ── Dry-run: preview output and root config updates ────────────────
    if (dryRun) {
      yield* Console.log(`[dry-run] Would create package @beep/${name} (type: ${type})`);
      yield* Console.log(`[dry-run] Directory: ${outputDir}`);
      yield* Console.log(`[dry-run] Files:`);
      for (const file of ALL_FILES) {
        yield* Console.log(`  - ${file}`);
      }

      const configNeedsBatch = yield* checkConfigNeedsUpdateForTargets(repoRoot, [configTarget]).pipe(
        Effect.orElseSucceed(() => singleTargetFallback(configTarget, { tsconfigPackages: true, tsconfigPaths: true }))
      );
      const configNeeds = configNeedsBatch.targets[0]?.result ?? { tsconfigPackages: true, tsconfigPaths: true };

      yield* Console.log(`[dry-run] Root config updates:`);
      yield* Console.log(
        `  - tsconfig.packages.json: ${configNeeds.tsconfigPackages ? `Add reference { "path": "${packagePath}" }` : "SKIP (already exists)"}`
      );
      yield* Console.log(
        `  - tsconfig.json: ${configNeeds.tsconfigPaths ? `Add path aliases @beep/${name}, @beep/${name}/*` : "SKIP (already exists)"}`
      );
      return;
    }

    // ── Build template context ─────────────────────────────────────────
    const currentYear = String(DateTime.getPartUtc(yield* DateTime.now, "year"));
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
    const templateFiles = yield* templateService.renderTemplates({
      templateDir: TEMPLATE_DIR,
      templates: TEMPLATE_SPECS,
      context: ctx,
    });

    const packageJson = yield* generatePackageJson(name, type, description, packagePath);

    const plan = fileGenerationPlanService.createPlan({
      outputDir,
      directories: PACKAGE_DIRECTORIES,
      files: [
        { relativePath: "package.json", content: packageJson },
        ...templateFiles.map((file) => ({ relativePath: file.outputPath, content: file.content })),
        { relativePath: "test/.gitkeep", content: "" },
        { relativePath: "dtslint/.gitkeep", content: "" },
      ],
      symlinks: [{ relativePath: "CLAUDE.md", target: "AGENTS.md" }],
    });

    // ── Execute plan and config updates ────────────────────────────────
    yield* fileGenerationPlanService.executePlan(plan);

    const configBatch = yield* updateRootConfigsForTargets(repoRoot, [configTarget]).pipe(
      Effect.orElseSucceed(() => singleTargetFallback(configTarget, { tsconfigPackages: false, tsconfigPaths: false }))
    );
    const configResults = configBatch.targets[0]?.result ?? { tsconfigPackages: false, tsconfigPaths: false };

    // ── Print summary ──────────────────────────────────────────────────
    yield* Console.log(`Created package @beep/${name} at ${outputDir}`);
    yield* Console.log(`Files created:`);
    for (const file of ALL_FILES) {
      yield* Console.log(`  - ${file}`);
    }
    if (configResults.tsconfigPackages || configResults.tsconfigPaths) {
      yield* Console.log(`\nRoot configs updated:`);
      if (configResults.tsconfigPackages) {
        yield* Console.log(`  - tsconfig.packages.json: Added reference "${packagePath}"`);
      }
      if (configResults.tsconfigPaths) {
        yield* Console.log(`  - tsconfig.json: Added path aliases @beep/${name}`);
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
          ".": "./dist/index.js",
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
