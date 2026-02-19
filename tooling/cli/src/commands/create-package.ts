/**
 * Package creation command - scaffold new packages following Effect v4 conventions.
 *
 * @since 0.0.0
 * @category commands
 */

import { findRepoRoot } from "@beep/repo-utils";
import { FileSystem, Path } from "effect";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { Argument, Command, Flag } from "effect/unstable/cli";

/**
 * Valid package types.
 *
 * @since 0.0.0
 * @category constants
 */
const VALID_TYPES = ["library", "tool", "app"] as const;

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
    dryRun: Flag.boolean("dry-run").pipe(Flag.withDescription("Preview changes without writing files")),
  },
  Effect.fn(function* (config) {
    const { name, type, dryRun } = config;

    // ── Validate type ──────────────────────────────────────────────────
    if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
      return yield* Effect.fail(
        new Error(`Invalid package type "${type}". Must be one of: ${VALID_TYPES.join(", ")}`)
      );
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
      return yield* Effect.fail(
        new Error(`Directory already exists: ${outputDir}\nRemove it first or choose a different package name.`)
      );
    }

    // ── Generate file contents ─────────────────────────────────────────
    const packageJson = generatePackageJson(name, type);
    const tsConfigJson = generateTsConfig();
    const indexTs = generateIndexTs(name);
    const gitkeep = "";

    const files: ReadonlyArray<readonly [relativePath: string, content: string]> = [
      ["package.json", packageJson],
      ["tsconfig.json", tsConfigJson],
      ["src/index.ts", indexTs],
      ["test/.gitkeep", gitkeep],
    ];

    // ── Dry-run: just print what would be created ──────────────────────
    if (dryRun) {
      yield* Console.log(`[dry-run] Would create package @beep/${name} (type: ${type})`);
      yield* Console.log(`[dry-run] Directory: ${outputDir}`);
      yield* Console.log(`[dry-run] Files:`);
      for (const [relativePath] of files) {
        yield* Console.log(`  - ${relativePath}`);
      }
      return;
    }

    // ── Create directories ─────────────────────────────────────────────
    yield* fs.makeDirectory(path.join(outputDir, "src"), { recursive: true });
    yield* fs.makeDirectory(path.join(outputDir, "test"), { recursive: true });

    // ── Write files ────────────────────────────────────────────────────
    for (const [relativePath, content] of files) {
      const filePath = path.join(outputDir, relativePath);
      yield* fs.writeFileString(filePath, content);
    }

    yield* Console.log(`Created package @beep/${name} at ${outputDir}`);
    yield* Console.log(`Files created:`);
    for (const [relativePath] of files) {
      yield* Console.log(`  - ${relativePath}`);
    }
    yield* Console.log(`\nNext steps:`);
    yield* Console.log(`  1. Run "bun install" to link the new package`);
    yield* Console.log(`  2. Add the package to tsconfig.packages.json`);
    yield* Console.log(`  3. Start building in src/index.ts`);
  })
).pipe(Command.withDescription("Create a new package following Effect v4 conventions"));

// ── Template generators ────────────────────────────────────────────────────

const generatePackageJson = (name: string, type: string): string => {
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
    description: "",
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

  return `${JSON.stringify(pkg, null, 2)}\n`;
};

const generateTsConfig = (): string => {
  const config = {
    $schema: "http://json.schemastore.org/tsconfig",
    extends: "../../tsconfig.base.json",
    include: ["src"],
    compilerOptions: {
      types: ["node"],
      outDir: "dist",
      rootDir: "src",
    },
  };

  return `${JSON.stringify(config, null, 2)}\n`;
};

const generateIndexTs = (name: string): string =>
  `/**
 * @beep/${name}
 *
 * @since 0.0.0
 */

/**
 * @since 0.0.0
 * @category constants
 */
export const VERSION = "0.0.0" as const
`;
