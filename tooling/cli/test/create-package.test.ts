import {
  checkConfigNeedsUpdateForTargets,
  updateRootConfigs,
  updateRootConfigsForTargets,
} from "@beep/repo-cli/commands/create-package/config-updater";
import { createPackageCommand } from "@beep/repo-cli/commands/create-package/index";
import { FsUtilsLive, findRepoRoot } from "@beep/repo-utils";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { FileSystem, Path } from "effect";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { TestConsole } from "effect/testing";
import { Command } from "effect/unstable/cli";
import { ChildProcessSpawner } from "effect/unstable/process";

// ---------------------------------------------------------------------------
// Test layers
// ---------------------------------------------------------------------------

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({
    streamString: () => Stream.empty,
    streamLines: () => Stream.empty,
  })
);

const TestLayers = FsUtilsLive.pipe(Layer.provideMerge(BaseLayers));
const withTestLayers =
  <A, E, R, Args extends ReadonlyArray<unknown>>(fn: (...args: Args) => Effect.Effect<A, E, R>) =>
  (...args: Args) =>
    fn(...args).pipe(Effect.provide(TestLayers));

const run = Command.runWith(createPackageCommand, { version: "0.0.0" });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const withTempPackageBase = Effect.fn(function* (
  name: string,
  args: ReadonlyArray<string>,
  assertions: (outputDir: string) => Effect.Effect<void, unknown, FileSystem.FileSystem | Path.Path>,
  outputParentDir = "tooling"
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot();
  const outputDir = path.join(repoRoot, outputParentDir, name);

  // Snapshot root configs before test
  const tsconfigPkgsPath = path.join(repoRoot, "tsconfig.packages.json");
  const tsconfigRootPath = path.join(repoRoot, "tsconfig.json");
  const tstycheConfigPath = path.join(repoRoot, "tstyche.config.json");
  const tsconfigPkgsSnapshot = yield* fs.readFileString(tsconfigPkgsPath);
  const tsconfigRootSnapshot = yield* fs.readFileString(tsconfigRootPath);
  const tstycheConfigSnapshot = yield* fs.readFileString(tstycheConfigPath);

  try {
    yield* run(args);
    yield* assertions(outputDir);
  } finally {
    // Restore configs + cleanup package dir
    yield* fs.writeFileString(tsconfigPkgsPath, tsconfigPkgsSnapshot).pipe(Effect.orElseSucceed(() => void 0));
    yield* fs.writeFileString(tsconfigRootPath, tsconfigRootSnapshot).pipe(Effect.orElseSucceed(() => void 0));
    yield* fs.writeFileString(tstycheConfigPath, tstycheConfigSnapshot).pipe(Effect.orElseSucceed(() => void 0));
    yield* fs.remove(outputDir, { recursive: true }).pipe(Effect.orElseSucceed(() => void 0));
  }
});

const withTempPackage = withTestLayers(withTempPackageBase);

const decodeJson = <A = unknown>(content: string): Effect.Effect<A, S.SchemaError> =>
  S.decodeUnknownEffect(S.UnknownFromJsonString)(content) as Effect.Effect<A, S.SchemaError>;

type GeneratedPackageJson = {
  readonly name: string;
  readonly version: string;
  readonly type: string;
  readonly license: string;
  readonly description: string;
  readonly homepage: string;
  readonly dependencies: Record<string, string>;
  readonly devDependencies: Record<string, string>;
  readonly repository: {
    readonly type: string;
    readonly url: string;
    readonly directory: string;
  };
};

type GeneratedTsconfigJson = {
  readonly extends: string;
  readonly compilerOptions: {
    readonly outDir: string;
    readonly rootDir: string;
  };
};

type GeneratedDocgenJson = {
  readonly $schema: string;
  readonly srcLink: string;
  readonly examplesCompilerOptions: {
    readonly paths: Record<string, ReadonlyArray<string>>;
  };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("create-package command", () => {
  // ── Dry-run tests ────────────────────────────────────────────────────────

  describe("dry-run", () => {
    it.effect(
      "should list all 13 files for a library package",
      withTestLayers(
        Effect.fn(function* () {
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
        })
      )
    );

    it.effect(
      "should dry-run a tool package",
      withTestLayers(
        Effect.fn(function* () {
          yield* run(["test-tool", "--type", "tool", "--dry-run"]);

          const logs = yield* TestConsole.logLines;
          const output = logs.map(String);

          expect(output).toContain("[dry-run] Would create package @beep/test-tool (type: tool)");
        })
      )
    );

    it.effect(
      "should dry-run an app package",
      withTestLayers(
        Effect.fn(function* () {
          yield* run(["test-app", "--type", "app", "--dry-run"]);

          const logs = yield* TestConsole.logLines;
          const output = logs.map(String);

          expect(output).toContain("[dry-run] Would create package @beep/test-app (type: app)");
          expect(output.some((l) => l.includes("/apps/test-app"))).toBe(true);
        })
      )
    );

    it.effect(
      "should dry-run package creation with custom parent dir",
      withTestLayers(
        Effect.fn(function* () {
          yield* run(["test-common", "--parent-dir", "packages/common", "--dry-run"]);

          const logs = yield* TestConsole.logLines;
          const output = logs.map(String);

          expect(output).toContain("[dry-run] Would create package @beep/test-common (type: library)");
          expect(output.some((l) => l.includes("/packages/common/test-common"))).toBe(true);
          expect(output.some((l) => l.includes('"path": "packages/common/test-common"'))).toBe(true);
        })
      )
    );

    it.effect(
      "should dry-run with --dir-name override",
      withTestLayers(
        Effect.fn(function* () {
          yield* run(["my-custom-svc", "--parent-dir", "packages/shared", "--dir-name", "custom-svc", "--dry-run"]);

          const logs = yield* TestConsole.logLines;
          const output = logs.map(String);

          expect(output).toContain("[dry-run] Would create package @beep/my-custom-svc (type: library)");
          expect(output.some((l) => l.includes('overridden from package name "my-custom-svc"'))).toBe(true);
          expect(output.some((l) => l.includes("/packages/shared/custom-svc"))).toBe(true);
          expect(output.some((l) => l.includes('"path": "packages/shared/custom-svc"'))).toBe(true);
          expect(output.some((l) => l.includes("@beep/my-custom-svc"))).toBe(true);
        })
      )
    );
  });

  // ── File generation tests ────────────────────────────────────────────────

  describe("file generation", () => {
    it.effect("should create all 13 files", () => {
      const pkgName = `_test-pkg-${Date.now()}`;
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "package.json"));
          const pkg = yield* decodeJson<GeneratedPackageJson>(content);

          expect(pkg.name).toBe(`@beep/${pkgName}`);
          expect(pkg.version).toBe("0.0.0");
          expect(pkg.type).toBe("module");
          expect(pkg.license).toBe("MIT");
          expect(pkg.dependencies.effect).toBe("catalog:");
          expect(pkg.devDependencies["@effect/vitest"]).toBe("catalog:");
          expect(pkg.homepage).toBe(`https://github.com/kriegcloud/beep-effect/tree/main/tooling/${pkgName}`);
          expect(pkg.repository.type).toBe("git");
          expect(pkg.repository.url).toBe("git@github.com:kriegcloud/beep-effect.git");
          expect(pkg.repository.directory).toBe(`tooling/${pkgName}`);
        })
      );
    });

    it.effect("should add platform-node dep for tool type", () => {
      const pkgName = `_test-tool-${Date.now()}`;
      return withTempPackage(
        pkgName,
        [pkgName, "--type", "tool"],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "package.json"));
          const pkg = yield* decodeJson<GeneratedPackageJson>(content);

          expect(pkg.dependencies["@effect/platform-node"]).toBe("catalog:");
        })
      );
    });

    it.effect("should generate tsconfig.json with correct content", () => {
      const pkgName = `_test-tsconfig-${Date.now()}`;
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "tsconfig.json"));
          const config = yield* decodeJson<GeneratedTsconfigJson>(content);

          expect(config.extends).toBe("../../tsconfig.base.json");
          expect(config.compilerOptions.outDir).toBe("dist");
          expect(config.compilerOptions.rootDir).toBe("src");
        })
      );
    });

    it.effect("should generate src/index.ts with VERSION export", () => {
      const pkgName = `_test-index-${Date.now()}`;
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "AGENTS.md"));

          expect(content).toContain(`# @beep/${pkgName} Agent Guide`);
          expect(content).toContain("## Purpose & Fit");
          expect(content).toContain("## Surface Map");
          expect(content).toContain("## Laws");
          expect(content).toContain("## Contributor Checklist");
        })
      );
    });

    it.effect("should generate ai-context.md with YAML frontmatter", () => {
      const pkgName = `_test-aicontext-${Date.now()}`;
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "docgen.json"));
          const config = yield* decodeJson<GeneratedDocgenJson>(content);

          expect(config.srcLink).toContain(`tooling/${pkgName}/src/`);
          expect(config.examplesCompilerOptions.paths[`@beep/${pkgName}`]).toEqual([
            `../../tooling/${pkgName}/src/index.ts`,
          ]);
        })
      );
    });

    it.effect("should generate vitest.config.ts with shared config", () => {
      const pkgName = `_test-vitest-${Date.now()}`;
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const content = yield* fs.readFileString(path.join(outputDir, "docs/index.md"));

          expect(content).toContain("title: API Reference");
          expect(content).toContain("nav_order: 1");
          expect(content).toContain("permalink: /docs");
        })
      );
    });

    it.effect("should create package with --dir-name override", () => {
      const pkgName = `_test-dirname-${Date.now()}`;
      const dirName = `_test-dir-${Date.now()}`;
      return withTempPackage(
        dirName,
        [pkgName, "--parent-dir", "packages/common", "--dir-name", dirName],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const repoRoot = yield* findRepoRoot();

          // Package name should be the npm name, not the dir name
          const pkgContent = yield* fs.readFileString(path.join(outputDir, "package.json"));
          const pkg = yield* decodeJson<GeneratedPackageJson>(pkgContent);
          expect(pkg.name).toBe(`@beep/${pkgName}`);
          expect(pkg.repository.directory).toBe(`packages/common/${dirName}`);
          expect(pkg.homepage).toContain(`packages/common/${dirName}`);

          // Root configs should use the npm package name for aliases
          const tsconfigRoot = yield* fs.readFileString(path.join(repoRoot, "tsconfig.json"));
          expect(tsconfigRoot).toContain(`"@beep/${pkgName}"`);
          expect(tsconfigRoot).toContain(`./packages/common/${dirName}/src/index.ts`);

          // tsconfig.packages.json should reference the directory path
          const tsconfigPkgs = yield* fs.readFileString(path.join(repoRoot, "tsconfig.packages.json"));
          expect(tsconfigPkgs).toContain(`packages/common/${dirName}`);
        }),
        "packages/common"
      );
    });

    it.effect("should generate depth-aware templates under nested parent dir", () => {
      const pkgName = `_test-common-${Date.now()}`;
      return withTempPackage(
        pkgName,
        [pkgName, "--parent-dir", "packages/common"],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const repoRoot = yield* findRepoRoot();

          const tsconfigRaw = yield* fs.readFileString(path.join(outputDir, "tsconfig.json"));
          const tsconfig = yield* decodeJson<GeneratedTsconfigJson>(tsconfigRaw);
          expect(tsconfig.extends).toBe("../../../tsconfig.base.json");

          const vitestConfig = yield* fs.readFileString(path.join(outputDir, "vitest.config.ts"));
          expect(vitestConfig).toContain('import shared from "../../../vitest.shared.ts";');

          const aiContext = yield* fs.readFileString(path.join(outputDir, "ai-context.md"));
          expect(aiContext).toContain(`path: packages/common/${pkgName}`);

          const docgenRaw = yield* fs.readFileString(path.join(outputDir, "docgen.json"));
          const docgen = yield* decodeJson<GeneratedDocgenJson>(docgenRaw);
          expect(docgen.$schema).toBe("../../../node_modules/@effect/docgen/schema.json");
          expect(docgen.examplesCompilerOptions.paths.effect).toEqual(["../../../packages/effect/src/index.ts"]);
          expect(docgen.examplesCompilerOptions.paths[`@beep/${pkgName}`]).toEqual([
            `../../../packages/common/${pkgName}/src/index.ts`,
          ]);

          const tsconfigPackages = yield* fs.readFileString(path.join(repoRoot, "tsconfig.packages.json"));
          expect(tsconfigPackages).toContain(`"path": "packages/common/${pkgName}"`);

          const tsconfigRoot = yield* fs.readFileString(path.join(repoRoot, "tsconfig.json"));
          expect(tsconfigRoot).toContain(`"./packages/common/${pkgName}/src/index.ts"`);
          expect(tsconfigRoot).toContain(`"./packages/common/${pkgName}/src/*.ts"`);

          const tstycheConfig = yield* fs.readFileString(path.join(repoRoot, "tstyche.config.json"));
          expect(tstycheConfig).toContain(`packages/common/${pkgName}/dtslint/**/*.tst.*`);
        }),
        "packages/common"
      );
    });

    it.effect(
      "should support zero-manual dual package generation under packages/common",
      withTestLayers(
        Effect.fn(function* () {
          const typesName = `_test-types-${Date.now()}`;
          const utilsName = `_test-utils-${Date.now()}`;

          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const repoRoot = yield* findRepoRoot();
          const typesDir = path.join(repoRoot, "packages/common", typesName);
          const utilsDir = path.join(repoRoot, "packages/common", utilsName);

          const tsconfigPkgsPath = path.join(repoRoot, "tsconfig.packages.json");
          const tsconfigRootPath = path.join(repoRoot, "tsconfig.json");
          const tstycheConfigPath = path.join(repoRoot, "tstyche.config.json");
          const tsconfigPkgsSnapshot = yield* fs.readFileString(tsconfigPkgsPath);
          const tsconfigRootSnapshot = yield* fs.readFileString(tsconfigRootPath);
          const tstycheConfigSnapshot = yield* fs.readFileString(tstycheConfigPath);

          try {
            yield* run([
              typesName,
              "--parent-dir",
              "packages/common",
              "--description",
              "Shared type utilities for beep",
            ]);
            yield* run([
              utilsName,
              "--parent-dir",
              "packages/common",
              "--description",
              "Shared runtime utilities for beep",
            ]);

            const typesTsconfigRaw = yield* fs.readFileString(path.join(typesDir, "tsconfig.json"));
            const utilsTsconfigRaw = yield* fs.readFileString(path.join(utilsDir, "tsconfig.json"));
            const typesTsconfig = yield* decodeJson<GeneratedTsconfigJson>(typesTsconfigRaw);
            const utilsTsconfig = yield* decodeJson<GeneratedTsconfigJson>(utilsTsconfigRaw);
            expect(typesTsconfig.extends).toBe("../../../tsconfig.base.json");
            expect(utilsTsconfig.extends).toBe("../../../tsconfig.base.json");

            const check = yield* checkConfigNeedsUpdateForTargets(repoRoot, [
              { packageName: typesName, packagePath: `packages/common/${typesName}` },
              { packageName: utilsName, packagePath: `packages/common/${utilsName}` },
            ]);
            expect(check.tsconfigPackages).toBe(false);
            expect(check.tsconfigPaths).toBe(false);
            expect(check.tstycheConfig).toBe(false);
            expect(
              check.targets.every(
                (entry) => !entry.result.tsconfigPackages && !entry.result.tsconfigPaths && !entry.result.tstycheConfig
              )
            ).toBe(true);

            const rerun = yield* updateRootConfigsForTargets(repoRoot, [
              { packageName: typesName, packagePath: `packages/common/${typesName}` },
              { packageName: utilsName, packagePath: `packages/common/${utilsName}` },
            ]);
            expect(rerun.tsconfigPackages).toBe(false);
            expect(rerun.tsconfigPaths).toBe(false);
            expect(rerun.tstycheConfig).toBe(false);
          } finally {
            yield* fs.writeFileString(tsconfigPkgsPath, tsconfigPkgsSnapshot).pipe(Effect.orElseSucceed(() => void 0));
            yield* fs.writeFileString(tsconfigRootPath, tsconfigRootSnapshot).pipe(Effect.orElseSucceed(() => void 0));
            yield* fs
              .writeFileString(tstycheConfigPath, tstycheConfigSnapshot)
              .pipe(Effect.orElseSucceed(() => void 0));
            yield* fs.remove(typesDir, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => void 0));
            yield* fs.remove(utilsDir, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => void 0));
          }
        })
      )
    );
  });

  // ── Description flag tests ───────────────────────────────────────────────

  describe("--description flag", () => {
    it.effect("should populate description in generated files", () => {
      const pkgName = `_test-desc-${Date.now()}`;
      const desc = "A utility library for testing";
      return withTempPackage(
        pkgName,
        [pkgName, "--description", desc],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const pkgContent = yield* fs.readFileString(path.join(outputDir, "package.json"));
          const pkg = yield* decodeJson<GeneratedPackageJson>(pkgContent);
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* (outputDir) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;

          const pkgContent = yield* fs.readFileString(path.join(outputDir, "package.json"));
          const pkg = yield* decodeJson<GeneratedPackageJson>(pkgContent);
          expect(pkg.description).toBe("");
        })
      );
    });
  });

  // ── Config update tests ──────────────────────────────────────────────────

  describe("config updates", () => {
    it.effect("should add reference to tsconfig.packages.json", () => {
      const pkgName = `_test-cfgref-${Date.now()}`;
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* () {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* () {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* () {
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
      return withTempPackage(
        pkgName,
        [pkgName],
        Effect.fn(function* () {
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
          const matches = O.getOrNull(O.fromNullishOr(Str.match(new RegExp(`tooling/${pkgName}`, "g"))(pkgsContent)));
          expect(matches).not.toBeNull();
          expect(matches!.length).toBe(1);
        })
      );
    });
  });

  // ── Name validation tests ───────────────────────────────────────────────

  describe("name validation", () => {
    it.effect(
      "should reject invalid package names",
      withTestLayers(
        Effect.fn(function* () {
          // Starts with number
          const r1 = yield* Effect.exit(run(["123pkg", "--dry-run"]));
          expect(r1._tag).toBe("Failure");

          // Starts with uppercase
          const r2 = yield* Effect.exit(run(["Uppercase", "--dry-run"]));
          expect(r2._tag).toBe("Failure");

          // Contains spaces
          const r3 = yield* Effect.exit(run(["has spaces", "--dry-run"]));
          expect(r3._tag).toBe("Failure");
        })
      )
    );

    it.effect(
      "should reject invalid --dir-name values",
      withTestLayers(
        Effect.fn(function* () {
          const r1 = yield* Effect.exit(run(["goodname", "--dir-name", "Bad-Name", "--dry-run"]));
          expect(r1._tag).toBe("Failure");

          const r2 = yield* Effect.exit(run(["goodname", "--dir-name", "123start", "--dry-run"]));
          expect(r2._tag).toBe("Failure");
        })
      )
    );

    it.effect(
      "should reject invalid parent dir overrides",
      withTestLayers(
        Effect.fn(function* () {
          const r1 = yield* Effect.exit(run(["goodname", "--parent-dir", "../escape", "--dry-run"]));
          expect(r1._tag).toBe("Failure");

          const r2 = yield* Effect.exit(run(["goodname", "--parent-dir", "/absolute/path", "--dry-run"]));
          expect(r2._tag).toBe("Failure");
        })
      )
    );
  });

  // ── Dry-run config preview tests ────────────────────────────────────────

  describe("dry-run config preview", () => {
    it.effect(
      "should show config updates in dry-run output",
      withTestLayers(
        Effect.fn(function* () {
          yield* run(["test-dryrun-cfg", "--dry-run"]);

          const logs = yield* TestConsole.logLines;
          const output = logs.map(String);

          expect(output.some((l) => l.includes("[dry-run] Root config updates:"))).toBe(true);
          expect(output.some((l) => l.includes("tsconfig.packages.json"))).toBe(true);
          expect(output.some((l) => l.includes("tsconfig.json"))).toBe(true);
          expect(output.some((l) => l.includes("tstyche.config.json"))).toBe(true);
          expect(output.some((l) => l.includes("Add reference"))).toBe(true);
          expect(output.some((l) => l.includes("Add path aliases"))).toBe(true);
        })
      )
    );
  });

  // ── Error handling tests ─────────────────────────────────────────────────

  describe("error handling", () => {
    it.effect(
      "should fail when directory already exists",
      withTestLayers(
        Effect.fn(function* () {
          const result = yield* Effect.exit(run(["cli"]));
          expect(result._tag).toBe("Failure");
        })
      )
    );
  });
});
