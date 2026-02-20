import { FsUtilsLive, findRepoRoot } from "@beep/repo-utils";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { FileSystem, Path } from "effect";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { TestConsole } from "effect/testing";
import { Command } from "effect/unstable/cli";
import { ChildProcessSpawner } from "effect/unstable/process";
import {
  checkConfigNeedsUpdateForTargets,
  updateRootConfigsForTargets,
} from "../src/commands/create-package/config-updater.js";
import { createFileGenerationPlanService } from "../src/commands/create-package/file-generation-plan-service.js";
import { createPackageCommand } from "../src/commands/create-package/index.js";
import { createTemplateService } from "../src/commands/create-package/template-service.js";
import { createTsMorphIntegrationService } from "../src/commands/create-package/ts-morph-integration-service.js";

const BaseLayers = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  NodeTerminal.layer,
  TestConsole.layer,
  Layer.mock(ChildProcessSpawner.ChildProcessSpawner)({})
);

const TestLayers = FsUtilsLive.pipe(Layer.provideMerge(BaseLayers));
const withTestLayers =
  <A, E, R, Args extends ReadonlyArray<unknown>>(fn: (...args: Args) => Effect.Effect<A, E, R>) =>
  (...args: Args) =>
    fn(...args).pipe(Effect.provide(TestLayers));

const run = Command.runWith(createPackageCommand, { version: "0.0.0" });

const uniqueSuffix = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const withRootConfigSnapshotBase = Effect.fn(function* (
  assertions: (repoRoot: string) => Effect.Effect<void, unknown, FileSystem.FileSystem | Path.Path>
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot();

  const tsconfigPkgsPath = path.join(repoRoot, "tsconfig.packages.json");
  const tsconfigRootPath = path.join(repoRoot, "tsconfig.json");
  const tsconfigPkgsSnapshot = yield* fs.readFileString(tsconfigPkgsPath);
  const tsconfigRootSnapshot = yield* fs.readFileString(tsconfigRootPath);

  try {
    yield* assertions(repoRoot);
  } finally {
    yield* fs.writeFileString(tsconfigPkgsPath, tsconfigPkgsSnapshot).pipe(Effect.orElseSucceed(() => void 0));
    yield* fs.writeFileString(tsconfigRootPath, tsconfigRootSnapshot).pipe(Effect.orElseSucceed(() => void 0));
  }
});

const withRootConfigSnapshot = withTestLayers(withRootConfigSnapshotBase);

describe("create-package service contracts", () => {
  it.effect(
    "TemplateService renders templates and default casing helpers",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = path.join(path.resolve("."), `_test-template-service-${uniqueSuffix()}`);

        try {
          yield* fs.makeDirectory(tmpDir, { recursive: true });
          yield* fs.writeFileString(path.join(tmpDir, "README.md.hbs"), "# {{pascalCase name}}\n{{camelCase name}}");
          yield* fs.writeFileString(
            path.join(tmpDir, "meta.hbs"),
            "{{kebabCase name}}|{{snakeCase name}}|{{scopedName}}"
          );

          const service = createTemplateService();
          const rendered = yield* service.renderTemplates({
            templateDir: tmpDir,
            templates: [
              { templateName: "README.md.hbs", outputPath: "README.md" },
              { templateName: "meta.hbs", outputPath: "meta.txt" },
            ],
            context: {
              name: "beep Type Utils",
              scopedName: "@beep/type-utils",
            },
          });

          expect(rendered).toEqual([
            {
              outputPath: "README.md",
              content: "# BeepTypeUtils\nbeepTypeUtils",
            },
            {
              outputPath: "meta.txt",
              content: "beep-type-utils|beep_type_utils|@beep/type-utils",
            },
          ]);
        } finally {
          yield* fs.remove(tmpDir, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => void 0));
        }
      })
    )
  );

  it.effect(
    "FileGenerationPlanService provides deterministic plan/preview and idempotent execution",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = path.join(path.resolve("."), `_test-plan-service-${uniqueSuffix()}`);
        const service = createFileGenerationPlanService();

        const plan = service.createPlan({
          outputDir: tmpDir,
          directories: ["docs", "src"],
          files: [
            { relativePath: "src/index.ts", content: "export const value = 1\n" },
            { relativePath: "README.md", content: "# Test\n" },
          ],
          symlinks: [{ relativePath: "CLAUDE.md", target: "README.md" }],
        });

        expect(plan.actions.map((action) => `${action.kind}:${action.relativePath}`)).toEqual([
          "mkdir:docs",
          "mkdir:src",
          "write-file:README.md",
          "write-file:src/index.ts",
          "symlink:CLAUDE.md",
        ]);

        const preview = service.previewPlan(plan);
        expect(preview).toEqual([
          "mkdir docs",
          "mkdir src",
          "write README.md",
          "write src/index.ts",
          "symlink CLAUDE.md -> README.md",
        ]);

        try {
          const firstRun = yield* service.executePlan(plan);
          expect(firstRun.writtenFiles).toBe(2);
          expect(firstRun.createdSymlinks).toBe(1);

          const secondRun = yield* service.executePlan(plan);
          expect(secondRun.writtenFiles).toBe(0);
          expect(secondRun.skippedFileWrites).toBe(2);
          expect(secondRun.createdSymlinks).toBe(0);
          expect(secondRun.skippedSymlinks).toBe(1);

          const linkTarget = yield* fs.readLink(path.join(tmpDir, "CLAUDE.md"));
          expect(linkTarget).toBe("README.md");
        } finally {
          yield* fs.remove(tmpDir, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => void 0));
        }
      })
    )
  );

  it.effect(
    "TsMorphIntegrationService contract previews mutations and returns scaffolded outcomes",
    withTestLayers(
      Effect.fn(function* () {
        const service = createTsMorphIntegrationService();
        const mutations = [
          {
            kind: "add-entity-id-export" as const,
            filePath: "packages/domain/src/entity-id.ts",
            symbolName: "OrderId",
          },
          {
            kind: "wire-persistence" as const,
            filePath: "packages/persistence/src/index.ts",
            symbolName: "OrderRepository",
            importPath: "@beep/order",
          },
        ];

        expect(service.previewMutations(mutations)).toEqual([
          "add-entity-id-export OrderId in packages/domain/src/entity-id.ts",
          "wire-persistence OrderRepository in packages/persistence/src/index.ts",
        ]);

        const result = yield* service.applyMutations(mutations);
        expect(result.outcomes.length).toBe(2);
        expect(result.outcomes.every((outcome) => outcome.status === "skipped")).toBe(true);
      })
    )
  );

  it.effect("Config updater orchestration supports multi-target idempotent updates", () => {
    const pkgA = `_test-batch-a-${uniqueSuffix()}`;
    const pkgB = `_test-batch-b-${uniqueSuffix()}`;

    return withRootConfigSnapshot(
      Effect.fn(function* (repoRoot) {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const targets = [
          { packageName: pkgA, packagePath: `packages/common/${pkgA}` },
          { packageName: pkgB, packagePath: `packages/common/${pkgB}` },
        ] as const;

        const first = yield* updateRootConfigsForTargets(repoRoot, targets);
        expect(first.tsconfigPackages).toBe(true);
        expect(first.tsconfigPaths).toBe(true);

        const second = yield* updateRootConfigsForTargets(repoRoot, [...targets].reverse());
        expect(second.tsconfigPackages).toBe(false);
        expect(second.tsconfigPaths).toBe(false);

        const check = yield* checkConfigNeedsUpdateForTargets(repoRoot, targets);
        expect(check.tsconfigPackages).toBe(false);
        expect(check.tsconfigPaths).toBe(false);

        const pkgsContent = yield* fs.readFileString(path.join(repoRoot, "tsconfig.packages.json"));
        for (const target of targets) {
          const matches = pkgsContent.match(new RegExp(target.packagePath, "g"));
          expect(matches).not.toBeNull();
          expect(matches!.length).toBe(1);
        }
      })
    );
  });

  it.effect("packages/common dual-generation flow is zero-manual after scaffolding", () => {
    const typesName = `_test-types-${uniqueSuffix()}`;
    const utilsName = `_test-utils-${uniqueSuffix()}`;

    return withRootConfigSnapshot(
      Effect.fn(function* (repoRoot) {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const typesDir = path.join(repoRoot, "packages/common", typesName);
        const utilsDir = path.join(repoRoot, "packages/common", utilsName);

        try {
          yield* run([typesName, "--parent-dir", "packages/common", "--description", "Shared type utilities for beep"]);
          yield* run([
            utilsName,
            "--parent-dir",
            "packages/common",
            "--description",
            "Shared runtime utilities for beep",
          ]);

          const typesTsconfigRaw = yield* fs.readFileString(path.join(typesDir, "tsconfig.json"));
          const utilsTsconfigRaw = yield* fs.readFileString(path.join(utilsDir, "tsconfig.json"));
          expect(JSON.parse(typesTsconfigRaw).extends).toBe("../../../tsconfig.base.json");
          expect(JSON.parse(utilsTsconfigRaw).extends).toBe("../../../tsconfig.base.json");

          const typesDocgenRaw = yield* fs.readFileString(path.join(typesDir, "docgen.json"));
          const utilsDocgenRaw = yield* fs.readFileString(path.join(utilsDir, "docgen.json"));
          expect(JSON.parse(typesDocgenRaw).$schema).toBe("../../../node_modules/@effect/docgen/schema.json");
          expect(JSON.parse(utilsDocgenRaw).$schema).toBe("../../../node_modules/@effect/docgen/schema.json");

          const check = yield* checkConfigNeedsUpdateForTargets(repoRoot, [
            { packageName: typesName, packagePath: `packages/common/${typesName}` },
            { packageName: utilsName, packagePath: `packages/common/${utilsName}` },
          ]);

          expect(check.tsconfigPackages).toBe(false);
          expect(check.tsconfigPaths).toBe(false);
          expect(check.targets.every((entry) => !entry.result.tsconfigPackages && !entry.result.tsconfigPaths)).toBe(
            true
          );
        } finally {
          yield* fs.remove(typesDir, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => void 0));
          yield* fs.remove(utilsDir, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => void 0));
        }
      })
    );
  });
});
