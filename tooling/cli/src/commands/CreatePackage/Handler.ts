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

import { fileURLToPath } from "node:url";
import { $RepoCliId } from "@beep/identity/packages";
import { DomainError, encodePackageJsonCanonicalPrettyEffect, findRepoRoot } from "@beep/repo-utils";
import { LiteralKit } from "@beep/schema";
import { Str as CommonStr, Text, thunkFalse } from "@beep/utils";
import { Console, DateTime, Effect, FileSystem, identity, Path, Struct } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { buildCanonicalAliasTargets } from "../Shared/TsconfigAliasTargets.js";
import {
  ConfigUpdateBatchResult,
  ConfigUpdateResult,
  ConfigUpdateTarget,
  ConfigUpdateTargetResult,
  checkConfigNeedsUpdateForTargets,
  updateRootConfigsForTargets,
} from "./ConfigUpdater.js";
import {
  createFileGenerationPlanService,
  FileGenerationPlanInput,
  PlannedFile,
  PlannedSymlink,
} from "./FileGenerationPlanService.js";
import { createTemplateService, TemplateRenderRequest, TemplateSpec } from "./TemplateService.js";

const $I = $RepoCliId.create("commands/CreatePackage/Handler");

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Build ordered template directory candidates for create-package execution.
 *
 * @param baseDir - Directory of the currently executing command module.
 * @param path - Path service used to compose normalized candidate paths.
 * @returns Candidate directories in preferred lookup order.
 * @since 0.0.0
 * @category DomainModel
 */

const templateDirCandidates = (baseDir: string, path: Path.Path): ReadonlyArray<string> => {
  const join = (...on: A.NonEmptyArray<string>) => path.join(baseDir, ...on);
  return A.make(join("templates"), join("..", "..", "..", "src", "commands", "CreatePackage", "templates"));
};

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
 * @category DomainModel
 */
export const resolveCreatePackageTemplateDir = Effect.fn(function* (
  baseDir: string = fileURLToPath(new URL(".", import.meta.url))
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const candidates = templateDirCandidates(baseDir, path);

  for (const candidate of candidates) {
    const exists = yield* fs.exists(candidate).pipe(Effect.orElseSucceed(thunkFalse));
    if (exists) {
      return candidate;
    }
  }

  return yield* new DomainError({
    message: `Unable to resolve create-package templates. Checked:\n${Text.joinLines(
      A.map(candidates, (candidate) => `  - ${candidate}`)
    )}`,
  });
});

/**
 * Valid package types.
 *
 * @since 0.0.0
 * @category Configuration
 */
const VALID_TYPES = ["library", "tool", "app"] as const;
const PACKAGE_NAME_PATTERN = /^[a-z_][a-z0-9._-]*$/;
const PARENT_DIR_PATTERN = /^(?!.*\/\/)(?!.*\/$)(?!.*(?:^|\/)\.{1,2}(?:\/|$))[a-z0-9][a-z0-9/_-]*$/;

const PackageType = LiteralKit(VALID_TYPES).annotate(
  $I.annote("PackageType", {
    description: "Supported package scaffold type.",
  })
);
type PackageType = typeof PackageType.Type;
const isPackageType = S.is(PackageType);
const decodePackageType = S.decodeUnknownSync(PackageType);
const packageTypeEquivalence = S.toEquivalence(PackageType);

const ParentDir = S.String.check(S.isPattern(PARENT_DIR_PATTERN)).pipe(
  S.brand("ParentDir"),
  S.annotate(
    $I.annote("ParentDir", {
      description: "Validated repo-relative parent directory for package scaffolding.",
    })
  )
);
const isParentDir = S.is(ParentDir);

const PackageName = S.String.check(S.isPattern(PACKAGE_NAME_PATTERN)).pipe(
  S.brand("PackageName"),
  S.annotate(
    $I.annote("PackageName", {
      description: "Package name segment used for @beep scoped package creation.",
    })
  )
);
const isPackageName = S.is(PackageName);

/**
 * Mapping from template source to output path.
 *
 * @since 0.0.0
 * @category Configuration
 */
const TEMPLATE_SPECS: ReadonlyArray<TemplateSpec> = [
  new TemplateSpec({ templateName: "tsconfig.json.hbs", outputPath: "tsconfig.json" }),
  new TemplateSpec({ templateName: "src-index.ts.hbs", outputPath: "src/index.ts" }),
  new TemplateSpec({ templateName: "LICENSE.hbs", outputPath: "LICENSE" }),
  new TemplateSpec({ templateName: "README.md.hbs", outputPath: "README.md" }),
  new TemplateSpec({ templateName: "AGENTS.md.hbs", outputPath: "AGENTS.md" }),
  new TemplateSpec({ templateName: "ai-context.md.hbs", outputPath: "ai-context.md" }),
  new TemplateSpec({ templateName: "docgen.json.hbs", outputPath: "docgen.json" }),
  new TemplateSpec({ templateName: "vitest.config.ts.hbs", outputPath: "vitest.config.ts" }),
  new TemplateSpec({ templateName: "docs-index.md.hbs", outputPath: "docs/index.md" }),
];

/**
 * Ordered list of all generated files for dry-run and summary output.
 *
 * @since 0.0.0
 * @category Configuration
 */
const ALL_FILES = [
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
] as const;

/**
 * Root-relative directories created for each package.
 *
 * @since 0.0.0
 * @category Configuration
 */
const PACKAGE_DIRECTORIES = ["src", "test", "dtslint", "docs"] as const;

const templateService = createTemplateService();
const fileGenerationPlanService = createFileGenerationPlanService();

// ── Template context ──────────────────────────────────────────────────────────

/**
 * Variables passed into every template during package scaffolding.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TemplateContext extends S.Class<TemplateContext>($I`TemplateContext`)(
  {
    name: S.String,
    scopedName: S.String,
    type: PackageType,
    description: S.String,
    year: S.String,
    parentDir: ParentDir,
    packagePath: S.String,
    rootRelative: S.String,
    isTool: S.Boolean,
    isApp: S.Boolean,
    isLibrary: S.Boolean,
  },
  $I.annote("TemplateContext", {
    description: "Variables passed into every template during package scaffolding.",
  })
) {}

/**
 * Validate an optional parent directory override like `packages/common`.
 *
 * Must be repo-relative, normalized, and free of traversal segments.
 *
 * @param value Parent directory override to validate.
 * @returns True when the override is safe and repo-relative.
 */
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
const toRootRelative = (packagePath: string): string => CommonStr.repeat("../", A.length(Str.split(packagePath, "/")));

const singleTargetFallback = (target: ConfigUpdateTarget, result: ConfigUpdateResult) =>
  new ConfigUpdateBatchResult({
    targets: [new ConfigUpdateTargetResult({ target, result })],
    tsconfigPackages: result.tsconfigPackages,
    tsconfigPaths: result.tsconfigPaths,
    tstycheConfig: result.tstycheConfig,
  });

// ── Command ───────────────────────────────────────────────────────────────────

/**
 * CLI command that scaffolds a new package with templates, a Schema-validated
 * `package.json`, and automatic root tsconfig updates (project references + path aliases).
 *
 * @since 0.0.0
 * @category UseCase
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
    if (P.not(isPackageType)(type)) {
      return yield* new DomainError({
        message: `Invalid package type "${type}". Must be one of: ${A.join(VALID_TYPES, ", ")}`,
      });
    }
    const packageType = decodePackageType(type);

    // ── Validate package name ─────────────────────────────────────────
    if (!isPackageName(name)) {
      return yield* new DomainError({
        message: `Invalid package name "${name}". Must start with a lowercase letter or underscore, contain only [a-z0-9._-].`,
      });
    }

    // ── Resolve directory name ─────────────────────────────────────────
    const dirName = Str.isNonEmpty(dirNameOverride) ? dirNameOverride : name;
    if (Str.isNonEmpty(dirNameOverride) && !isPackageName(dirName)) {
      return yield* new DomainError({
        message: `Invalid dir name "${dirName}". Must start with a lowercase letter or underscore, contain only [a-z0-9._-].`,
      });
    }

    // ── Resolve parent directory ───────────────────────────────────────
    const defaultParentDir = packageTypeEquivalence(packageType, "app") ? "apps" : "tooling";
    const parentDir = Str.isNonEmpty(parentDirOverride) ? parentDirOverride : defaultParentDir;
    if (!isParentDir(parentDir)) {
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
      const alreadyExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(thunkFalse));
      if (alreadyExists) {
        return yield* new DomainError({
          message: `Directory already exists: ${outputDir}\nRemove it first or choose a different package name.`,
        });
      }
    }

    const configTarget = new ConfigUpdateTarget({
      packageName: name,
      packagePath,
      ...buildCanonicalAliasTargets(packagePath, "./src/index.ts"),
    });

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
          singleTargetFallback(
            configTarget,
            new ConfigUpdateResult({ tsconfigPackages: true, tsconfigPaths: true, tstycheConfig: true })
          )
        )
      );
      const configNeeds = O.getOrElse(
        O.map(A.get(configNeedsBatch.targets, 0), Struct.get("result")),
        () => new ConfigUpdateResult({ tsconfigPackages: true, tsconfigPaths: true, tstycheConfig: true })
      );

      yield* Console.log(`[dry-run] Root config updates:`);
      yield* Console.log(
        `  - tsconfig.packages.json: ${configNeeds.tsconfigPackages ? `Add reference { "path": "${packagePath}" }` : "SKIP (already exists)"}`
      );
      yield* Console.log(
        `  - tsconfig.json: ${configNeeds.tsconfigPaths ? `Add path aliases @beep/${name} -> ${configTarget.rootAliasTarget}, @beep/${name}/* -> ${configTarget.wildcardAliasTarget}` : "SKIP (already exists)"}`
      );
      yield* Console.log(
        `  - tstyche.config.json: ${configNeeds.tstycheConfig ? `Add test file match "${packagePath}/dtslint/**/*.tst.*"` : "SKIP (already covered)"}`
      );
      return;
    }

    // ── Build template context ─────────────────────────────────────────
    const currentYear = `${DateTime.getPartUtc(DateTime.nowUnsafe(), "year")}`;
    const ctx = new TemplateContext({
      name,
      scopedName: `@beep/${name}`,
      type: packageType,
      description,
      year: currentYear,
      parentDir,
      packagePath,
      rootRelative: toRootRelative(packagePath),
      isTool: packageTypeEquivalence(packageType, "tool"),
      isApp: packageTypeEquivalence(packageType, "app"),
      isLibrary: packageTypeEquivalence(packageType, "library"),
    });

    // ── Render templates and generate plan ─────────────────────────────
    const templateDir = yield* resolveCreatePackageTemplateDir();
    const templateFiles = yield* templateService.renderTemplates(
      new TemplateRenderRequest({
        templateDir,
        templates: TEMPLATE_SPECS,
        context: { ...ctx },
      })
    );

    const packageJson = yield* generatePackageJson(name, packageType, description, packagePath);

    const plan = fileGenerationPlanService.createPlan(
      new FileGenerationPlanInput({
        outputDir,
        directories: PACKAGE_DIRECTORIES,
        files: A.flatMap(
          A.make(
            A.make(new PlannedFile({ relativePath: "package.json", content: packageJson })),
            A.map(templateFiles, (file) => new PlannedFile({ relativePath: file.outputPath, content: file.content })),
            A.make(
              new PlannedFile({ relativePath: "test/.gitkeep", content: "" }),
              new PlannedFile({ relativePath: "dtslint/.gitkeep", content: "" })
            )
          ),
          identity
        ),
        symlinks: A.of(new PlannedSymlink({ relativePath: "CLAUDE.md", target: "AGENTS.md" })),
      })
    );

    // ── Execute plan and config updates ────────────────────────────────
    yield* fileGenerationPlanService.executePlan(plan);

    const configBatch = yield* updateRootConfigsForTargets(repoRoot, [configTarget]).pipe(
      Effect.orElseSucceed(() => singleTargetFallback(configTarget, new ConfigUpdateResult({})))
    );
    const configResults = O.getOrElse(
      O.map(A.get(configBatch.targets, 0), (targetResult) => targetResult.result),
      () => new ConfigUpdateResult({})
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
        yield* Console.log(
          `  - tsconfig.json: Added path aliases @beep/${name} -> ${configTarget.rootAliasTarget}, @beep/${name}/* -> ${configTarget.wildcardAliasTarget}`
        );
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
 * and publish configuration, then encodes it through the repo-utils canonical
 * package.json encoder to guarantee structural validity and stable formatting.
 *
 * @param name - The unscoped package name (e.g. `"my-utils"`). Will be prefixed with `@beep/`.
 * @param type - One of `"library"`, `"tool"`, or `"app"`. Tools receive an extra `@effect/platform-node` dependency.
 * @param description - Human-readable package description for the `"description"` field.
 * @param packagePath - Package path relative to repo root (e.g. `"tooling/my-utils"`).
 * @returns A JSON string (with trailing newline) ready to be written to disk.
 * @since 0.0.0
 * @category Utility
 */
const generatePackageJson: (
  name: string,
  type: PackageType,
  description: string,
  packagePath: string
) => Effect.Effect<string, DomainError | S.SchemaError> = Effect.fn(function* (name, type, description, packagePath) {
  const dependencies: Record<string, string> = {
    effect: "catalog:",
  };

  if (packageTypeEquivalence(type, "tool")) {
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
      babel: "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
      check: "tsc -b tsconfig.json",
      lint: "biome check .",
      "lint:fix": "biome check . --write",
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

  const json = yield* encodePackageJsonCanonicalPrettyEffect(pkg);
  return `${json}\n`;
});
