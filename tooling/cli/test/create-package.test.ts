import { FsUtilsLive, findRepoRoot } from "@beep/repo-utils";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { FileSystem, Path } from "effect";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { TestConsole } from "effect/testing";
import { Command } from "effect/unstable/cli";
import { ChildProcessSpawner } from "effect/unstable/process";
import { updateRootConfigs } from "../src/commands/create-package/config-updater.js";
import { createPackageCommand } from "../src/commands/create-package/index.js";

// ---------------------------------------------------------------------------
// Test layers
// ---------------------------------------------------------------------------

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({})
);

const TestLayers = FsUtilsLive.pipe(Layer.provideMerge(BaseLayers));

const run = Command.runWith(createPackageCommand, { version: "0.0.0" });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const withTempPackage = (
  name: string,
  args: ReadonlyArray<string>,
  assertions: (outputDir: string) => Effect.Effect<void, unknown, FileSystem.FileSystem | Path.Path>
) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const repoRoot = yield* findRepoRoot();
    const outputDir = path.join(repoRoot, "tooling", name);

    // Snapshot root configs before test
    const tsconfigPkgsPath = path.join(repoRoot, "tsconfig.packages.json");
    const tsconfigRootPath = path.join(repoRoot, "tsconfig.json");
    const tsconfigPkgsSnapshot = yield* fs.readFileString(tsconfigPkgsPath);
    const tsconfigRootSnapshot = yield* fs.readFileString(tsconfigRootPath);

    try {
      yield* run(args);
      yield* assertions(outputDir);
    } finally {
      // Restore configs + cleanup package dir
      yield* fs.writeFileString(tsconfigPkgsPath, tsconfigPkgsSnapshot).pipe(Effect.orElseSucceed(() => void 0));
      yield* fs.writeFileString(tsconfigRootPath, tsconfigRootSnapshot).pipe(Effect.orElseSucceed(() => void 0));
      yield* fs.remove(outputDir, { recursive: true }).pipe(Effect.orElseSucceed(() => void 0));
    }
  }).pipe(Effect.provide(TestLayers));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("create-package command", () => {
  // ── Dry-run tests ────────────────────────────────────────────────────────

  describe("dry-run", () => {
    it.effect("should list all 13 files for a library package", Effect.fn(function* () {
        yield* run(["test-lib", "--dry-run"]);

        const logs = yield* TestConsole.logLines;
        const output = logs.map(String);

        expect(output).toContain("[dry-run] Would create package @beep/test-lib (type: library)");
        expect(output.some((l) => l.includes("package.json"))).toBe(true);
        expect(output.some((l) => l.includes("tsconfig.json"))).toBe(true);
        expect(output.some((l) => l.includes("src/index.ts"))).toBe(true);
        expect(output.some((l) => l.includes("test/.gitkeep"))).toBe(true);
        expect(output.some((l) => l.includes("dtslint/.gitkeep"))).toBe(true);
        expect(output.some((l) => l.includes("LICENSE"))).toBe(true);
        expect(output.some((l) => l.includes("README.md"))).toBe(true);
        expect(output.some((l) => l.includes("AGENTS.md"))).toBe(true);
        expect(output.some((l) => l.includes("ai-context.md"))).toBe(true);
        expect(output.some((l) => l.includes("CLAUDE.md -> AGENTS.md (symlink)"))).toBe(true);
        expect(output.some((l) => l.includes("docgen.json"))).toBe(true);
        expect(output.some((l) => l.includes("vitest.config.ts"))).toBe(true);
        expect(output.some((l) => l.includes("docs/index.md"))).toBe(true);
      }).pipe(Effect.provide(TestLayers))
    );

    it.effect("should dry-run a tool package", Effect.fn(function* () {
        yield* run(["test-tool", "--type", "tool", "--dry-run"]);

        const logs = yield* TestConsole.logLines;
        const output = logs.map(String);

        expect(output).toContain("[dry-run] Would create package @beep/test-tool (type: tool)");
      }).pipe(Effect.provide(TestLayers))
    );

    it.effect("should dry-run an app package", Effect.fn(function* () {
        yield* run(["test-app", "--type", "app", "--dry-run"]);

        const logs = yield* TestConsole.logLines;
        const output = logs.map(String);

        expect(output).toContain("[dry-run] Would create package @beep/test-app (type: app)");
        expect(output.some((l) => l.includes("/apps/test-app"))).toBe(true);
      }).pipe(Effect.provide(TestLayers))
    );
  });

  // ── File generation tests ────────────────────────────────────────────────

  describe("file generation", () => {
    it.effect("should create all 13 files", () => {
      const pkgName = `_test-pkg-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const expectedFiles = [
            "package.json",
            "tsconfig.json",
            "src/index.ts",
            "test/.gitkeep",
            "dtslint/.gitkeep",
            "LICENSE",
            "README.md",
            "AGENTS.md",
            "ai-context.md",
            "CLAUDE.md",
            "docgen.json",
            "vitest.config.ts",
            "docs/index.md",
          ];

          for (const file of expectedFiles) {
            const exists = yield* fs.exists(path.join(outputDir, file));
            expect(exists, `${file} should exist`).toBe(true);
          }
        })
      );
    });

    it.effect("should generate valid package.json", () => {
      const pkgName = `_test-pkgjson-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "package.json"));
          const pkg = JSON.parse(content);

          expect(pkg.name).toBe(`@beep/${pkgName}`);
          expect(pkg.version).toBe("0.0.0");
          expect(pkg.type).toBe("module");
          expect(pkg.license).toBe("MIT");
          expect(pkg.dependencies.effect).toBe("catalog:");
          expect(pkg.devDependencies["@effect/vitest"]).toBe("catalog:");
        })
      );
    });

    it.effect("should add platform-node dep for tool type", () => {
      const pkgName = `_test-tool-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName, "--type", "tool"], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "package.json"));
          const pkg = JSON.parse(content);

          expect(pkg.dependencies["@effect/platform-node"]).toBe("catalog:");
        })
      );
    });

    it.effect("should generate tsconfig.json with correct content", () => {
      const pkgName = `_test-tsconfig-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "tsconfig.json"));
          const config = JSON.parse(content);

          expect(config.extends).toBe("../../tsconfig.base.json");
          expect(config.compilerOptions.outDir).toBe("dist");
          expect(config.compilerOptions.rootDir).toBe("src");
        })
      );
    });

    it.effect("should generate src/index.ts with VERSION export", () => {
      const pkgName = `_test-index-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "src/index.ts"));

          expect(content).toContain(`@beep/${pkgName}`);
          expect(content).toContain("@since 0.0.0");
          expect(content).toContain("VERSION");
        })
      );
    });

    it.effect("should generate LICENSE with MIT text and current year", () => {
      const pkgName = `_test-license-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "LICENSE"));

          expect(content).toContain("MIT License");
          expect(content).toContain(`Copyright (c) ${new Date().getFullYear()} beep-effect`);
          expect(content).toContain("Permission is hereby granted");
        })
      );
    });

    it.effect("should generate README.md with package name", () => {
      const pkgName = `_test-readme-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "README.md"));

          expect(content).toContain(`# @beep/${pkgName}`);
          expect(content).toContain(`bun add @beep/${pkgName}`);
          expect(content).toContain("## License");
        })
      );
    });

    it.effect("should generate AGENTS.md with canonical sections", () => {
      const pkgName = `_test-agents-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "AGENTS.md"));

          expect(content).toContain(`# @beep/${pkgName} Agent Guide`);
          expect(content).toContain("## Purpose & Fit");
          expect(content).toContain("## Surface Map");
          expect(content).toContain("## Authoring Guardrails");
          expect(content).toContain("## Contributor Checklist");
        })
      );
    });

    it.effect("should generate ai-context.md with YAML frontmatter", () => {
      const pkgName = `_test-aicontext-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "ai-context.md"));

          expect(content).toContain(`path: tooling/${pkgName}`);
          expect(content).toContain("tags: [effect]");
          expect(content).toContain(`# @beep/${pkgName}`);
          expect(content).toContain("## Dependencies");
        })
      );
    });

    it.effect("should create CLAUDE.md as symlink to AGENTS.md", () => {
      const pkgName = `_test-symlink-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const claudePath = path.join(outputDir, "CLAUDE.md");

          const exists = yield* fs.exists(claudePath);
          expect(exists).toBe(true);

          const target = yield* fs.readLink(claudePath);
          expect(target).toBe("AGENTS.md");

          const claudeContent = yield* fs.readFileString(claudePath);
          const agentsContent = yield* fs.readFileString(path.join(outputDir, "AGENTS.md"));
          expect(claudeContent).toBe(agentsContent);
        })
      );
    });

    it.effect("should generate docgen.json with correct paths", () => {
      const pkgName = `_test-docgen-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "docgen.json"));
          const config = JSON.parse(content);

          expect(config.srcLink).toContain(`tooling/${pkgName}/src/`);
          expect(config.examplesCompilerOptions.paths[`@beep/${pkgName}`]).toEqual([
            `../../tooling/${pkgName}/src/index.ts`,
          ]);
        })
      );
    });

    it.effect("should generate vitest.config.ts with shared config", () => {
      const pkgName = `_test-vitest-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "vitest.config.ts"));

          expect(content).toContain("vitest/config");
          expect(content).toContain("vitest.shared.ts");
          expect(content).toContain("mergeConfig");
        })
      );
    });

    it.effect("should generate docs/index.md with frontmatter", () => {
      const pkgName = `_test-docs-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "docs/index.md"));

          expect(content).toContain("title: API Reference");
          expect(content).toContain("nav_order: 1");
          expect(content).toContain("permalink: /docs");
        })
      );
    });
  });

  // ── Description flag tests ───────────────────────────────────────────────

  describe("--description flag", () => {
    it.effect("should populate description in generated files", () => {
      const pkgName = `_test-desc-${Date.now()}`;
      const desc = "A utility library for testing";
      return withTempPackage(pkgName, [pkgName, "--description", desc], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const pkgContent = yield* fs.readFileString(path.join(outputDir, "package.json"));
          const pkg = JSON.parse(pkgContent);
          expect(pkg.description).toBe(desc);

          const readme = yield* fs.readFileString(path.join(outputDir, "README.md"));
          expect(readme).toContain(desc);

          const agents = yield* fs.readFileString(path.join(outputDir, "AGENTS.md"));
          expect(agents).toContain(desc);

          const aiContext = yield* fs.readFileString(path.join(outputDir, "ai-context.md"));
          expect(aiContext).toContain(`summary: ${desc}`);
          expect(aiContext).toContain(desc);
        })
      );
    });

    it.effect("should default description to empty string", () => {
      const pkgName = `_test-nodesc-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const pkgContent = yield* fs.readFileString(path.join(outputDir, "package.json"));
          const pkg = JSON.parse(pkgContent);
          expect(pkg.description).toBe("");
        })
      );
    });
  });

  // ── Config update tests ──────────────────────────────────────────────────

  describe("config updates", () => {
    it.effect("should add reference to tsconfig.packages.json", () => {
      const pkgName = `_test-cfgref-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const repoRoot = yield* findRepoRoot();

          const content = yield* fs.readFileString(path.join(repoRoot, "tsconfig.packages.json"));
          expect(content).toContain(`"path": "tooling/${pkgName}"`);
        })
      );
    });

    it.effect("should add path aliases to tsconfig.json", () => {
      const pkgName = `_test-cfgpath-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const repoRoot = yield* findRepoRoot();

          const content = yield* fs.readFileString(path.join(repoRoot, "tsconfig.json"));
          expect(content).toContain(`"@beep/${pkgName}"`);
          expect(content).toContain(`"@beep/${pkgName}/*"`);
          expect(content).toContain(`./tooling/${pkgName}/src/index.ts`);
          expect(content).toContain(`./tooling/${pkgName}/src/*.ts`);
        })
      );
    });

    it.effect("should preserve comments in tsconfig.json", () => {
      const pkgName = `_test-cfgcmts-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const repoRoot = yield* findRepoRoot();

          const content = yield* fs.readFileString(path.join(repoRoot, "tsconfig.json"));
          // Verify comment lines are still present after config update
          expect(content).toContain("// All vitest config files across all packages");
          expect(content).toContain("// Path aliases allow loading internal modules");
        })
      );
    });

    it.effect("should be idempotent for config updates", () => {
      const pkgName = `_test-idempotent-${Date.now()}`;
      return withTempPackage(pkgName, [pkgName], Effect.fn(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const repoRoot = yield* findRepoRoot();

          // Config was already updated by create-package. Run updater again.
          const result = yield* updateRootConfigs(repoRoot, pkgName, `tooling/${pkgName}`);

          // Second run should report no changes
          expect(result.tsconfigPackages).toBe(false);
          expect(result.tsconfigPaths).toBe(false);

          // Verify no duplicate entries in tsconfig.packages.json
          const pkgsContent = yield* fs.readFileString(path.join(repoRoot, "tsconfig.packages.json"));
          const matches = pkgsContent.match(new RegExp(`tooling/${pkgName}`, "g"));
          expect(matches).not.toBeNull();
          expect(matches!.length).toBe(1);
        })
      );
    });
  });

  // ── Name validation tests ───────────────────────────────────────────────

  describe("name validation", () => {
    it.effect("should reject invalid package names", Effect.fn(function* () {
        // Starts with number
        const r1 = yield* Effect.exit(run(["123pkg", "--dry-run"]));
        expect(r1._tag).toBe("Failure");

        // Starts with uppercase
        const r2 = yield* Effect.exit(run(["Uppercase", "--dry-run"]));
        expect(r2._tag).toBe("Failure");

        // Contains spaces
        const r3 = yield* Effect.exit(run(["has spaces", "--dry-run"]));
        expect(r3._tag).toBe("Failure");
      }).pipe(Effect.provide(TestLayers))
    );
  });

  // ── Dry-run config preview tests ────────────────────────────────────────

  describe("dry-run config preview", () => {
    it.effect("should show config updates in dry-run output", Effect.fn(function* () {
        yield* run(["test-dryrun-cfg", "--dry-run"]);

        const logs = yield* TestConsole.logLines;
        const output = logs.map(String);

        expect(output.some((l) => l.includes("[dry-run] Root config updates:"))).toBe(true);
        expect(output.some((l) => l.includes("tsconfig.packages.json"))).toBe(true);
        expect(output.some((l) => l.includes("tsconfig.json"))).toBe(true);
        expect(output.some((l) => l.includes("Add reference"))).toBe(true);
        expect(output.some((l) => l.includes("Add path aliases"))).toBe(true);
      }).pipe(Effect.provide(TestLayers))
    );
  });

  // ── Error handling tests ─────────────────────────────────────────────────

  describe("error handling", () => {
    it.effect("should fail when directory already exists", Effect.fn(function* () {
        const result = yield* Effect.exit(run(["cli"]));
        expect(result._tag).toBe("Failure");
      }).pipe(Effect.provide(TestLayers))
    );
  });
});
