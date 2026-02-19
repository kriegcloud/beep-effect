/**
 * Package creation command - scaffold new packages following Effect v4 conventions.
 *
 * Generates 13 files using Handlebars templates, TypeScript + Schema validation
 * for package.json, and static files for .gitkeep markers. CLAUDE.md is created
 * as a symbolic link to AGENTS.md.
 *
 * @since 0.0.0
 * @category commands
 */

import { DomainError, encodePackageJsonPrettyEffect, findRepoRoot } from "@beep/repo-utils";
import { FileSystem, Path, type Schema } from "effect";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { Argument, Command, Flag } from "effect/unstable/cli";
import Handlebars from "handlebars";
import { checkConfigNeedsUpdate, updateRootConfigs } from "./config-updater.js";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
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

/**
 * Mapping from HBS template file name to output relative path.
 *
 * @since 0.0.0
 * @category constants
 */
const TEMPLATE_MAP: ReadonlyArray<readonly [templateName: string, outputPath: string]> = [
  ["tsconfig.json.hbs", "tsconfig.json"],
  ["src-index.ts.hbs", "src/index.ts"],
  ["LICENSE.hbs", "LICENSE"],
  ["README.md.hbs", "README.md"],
  ["AGENTS.md.hbs", "AGENTS.md"],
  ["ai-context.md.hbs", "ai-context.md"],
  ["docgen.json.hbs", "docgen.json"],
  ["vitest.config.ts.hbs", "vitest.config.ts"],
  ["docs-index.md.hbs", "docs/index.md"],
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

// ── Template context ──────────────────────────────────────────────────────────

/**
 * @since 0.0.0
 * @category models
 */
interface TemplateContext {
  readonly name: string;
  readonly scopedName: string;
  readonly type: string;
  readonly description: string;
  readonly year: string;
  readonly parentDir: string;
  readonly isTool: boolean;
  readonly isApp: boolean;
  readonly isLibrary: boolean;
}

// ── Template loading ──────────────────────────────────────────────────────────

const loadTemplate: (
  templateName: string
) => Effect.Effect<Handlebars.TemplateDelegate, DomainError, FileSystem.FileSystem> = Effect.fn(
  function* (templateName) {
    const fs = yield* FileSystem.FileSystem;
    const raw = yield* fs
      .readFileString(`${TEMPLATE_DIR}/${templateName}`)
      .pipe(
        Effect.mapError((e) => new DomainError({ message: `Failed to read template ${templateName}: ${String(e)}` }))
      );
    return Handlebars.compile(raw, { noEscape: true });
  }
);

// ── Command ───────────────────────────────────────────────────────────────────

/**
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
    description: Flag.string("description").pipe(Flag.withDescription("Package description"), Flag.withDefault("")),
    dryRun: Flag.boolean("dry-run").pipe(Flag.withDescription("Preview changes without writing files")),
  },
  Effect.fn(function* (config) {
    const { name, type, description, dryRun } = config;

    // ── Validate type ──────────────────────────────────────────────────
    if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
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

    // ── Resolve services ───────────────────────────────────────────────
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // ── Discover repo root ─────────────────────────────────────────────
    const repoRoot = yield* findRepoRoot();

    // ── Determine output directory ─────────────────────────────────────
    const parentDir = type === "app" ? "apps" : "tooling";
    const outputDir = path.join(repoRoot, parentDir, name);

    // ── Check if directory already exists ──────────────────────────────
    const alreadyExists = yield* fs.exists(outputDir).pipe(Effect.orElseSucceed(() => false));
    if (alreadyExists) {
      return yield* new DomainError({
        message: `Directory already exists: ${outputDir}\nRemove it first or choose a different package name.`,
      });
    }

    // ── Dry-run: just print what would be created ──────────────────────
    if (dryRun) {
      yield* Console.log(`[dry-run] Would create package @beep/${name} (type: ${type})`);
      yield* Console.log(`[dry-run] Directory: ${outputDir}`);
      yield* Console.log(`[dry-run] Files:`);
      for (const file of ALL_FILES) {
        yield* Console.log(`  - ${file}`);
      }

      // ── Config update preview ────────────────────────────────────────
      const configNeeds = yield* checkConfigNeedsUpdate(repoRoot, name, `${parentDir}/${name}`).pipe(
        Effect.orElseSucceed(() => ({ tsconfigPackages: true, tsconfigPaths: true }))
      );
      yield* Console.log(`[dry-run] Root config updates:`);
      yield* Console.log(
        `  - tsconfig.packages.json: ${configNeeds.tsconfigPackages ? `Add reference { "path": "${parentDir}/${name}" }` : "SKIP (already exists)"}`
      );
      yield* Console.log(
        `  - tsconfig.json: ${configNeeds.tsconfigPaths ? `Add path aliases @beep/${name}, @beep/${name}/*` : "SKIP (already exists)"}`
      );
      return;
    }

    // ── Build template context ─────────────────────────────────────────
    const ctx: TemplateContext = {
      name,
      scopedName: `@beep/${name}`,
      type,
      description,
      year: String(new Date().getFullYear()),
      parentDir,
      isTool: type === "tool",
      isApp: type === "app",
      isLibrary: type === "library",
    };

    // ── Load and render templates ──────────────────────────────────────
    const templateFiles = yield* Effect.forEach(TEMPLATE_MAP, ([templateName, outputPath]) =>
      Effect.map(loadTemplate(templateName), (template) => [outputPath, template(ctx)] as const)
    );

    // ── Generate package.json via TypeScript + Schema ──────────────────
    const packageJson = yield* generatePackageJson(name, type, description);

    // ── Collect all files ──────────────────────────────────────────────
    const files: ReadonlyArray<readonly [relativePath: string, content: string]> = [
      ["package.json", packageJson],
      ...templateFiles,
      ["test/.gitkeep", ""],
      ["dtslint/.gitkeep", ""],
    ];

    // ── Create directories ─────────────────────────────────────────────
    yield* fs.makeDirectory(path.join(outputDir, "src"), { recursive: true });
    yield* fs.makeDirectory(path.join(outputDir, "test"), { recursive: true });
    yield* fs.makeDirectory(path.join(outputDir, "dtslint"), { recursive: true });
    yield* fs.makeDirectory(path.join(outputDir, "docs"), { recursive: true });

    // ── Write files ────────────────────────────────────────────────────
    for (const [relativePath, content] of files) {
      const filePath = path.join(outputDir, relativePath);
      yield* fs.writeFileString(filePath, content);
    }

    // ── Create CLAUDE.md symlink ───────────────────────────────────────
    yield* fs
      .symlink("AGENTS.md", path.join(outputDir, "CLAUDE.md"))
      .pipe(Effect.mapError((e) => new DomainError({ message: `Failed to create CLAUDE.md symlink: ${String(e)}` })));

    // ── Update root configs ────────────────────────────────────────────
    const configResults = yield* updateRootConfigs(repoRoot, name, `${parentDir}/${name}`).pipe(
      Effect.orElseSucceed(() => ({ tsconfigPackages: false, tsconfigPaths: false }))
    );

    // ── Print summary ──────────────────────────────────────────────────
    yield* Console.log(`Created package @beep/${name} at ${outputDir}`);
    yield* Console.log(`Files created:`);
    for (const file of ALL_FILES) {
      yield* Console.log(`  - ${file}`);
    }
    if (configResults.tsconfigPackages || configResults.tsconfigPaths) {
      yield* Console.log(`\nRoot configs updated:`);
      if (configResults.tsconfigPackages) {
        yield* Console.log(`  - tsconfig.packages.json: Added reference "${parentDir}/${name}"`);
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

const generatePackageJson: (
  name: string,
  type: string,
  description: string
) => Effect.Effect<string, DomainError | Schema.SchemaError> = Effect.fn(function* (name, type, description) {
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
});
