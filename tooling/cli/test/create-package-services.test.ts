import {
  checkConfigNeedsUpdateForTargets,
  updateRootConfigsForTargets,
} from "@beep/repo-cli/commands/create-package/config-updater";
import { createFileGenerationPlanService } from "@beep/repo-cli/commands/create-package/file-generation-plan-service";
import { resolveCreatePackageTemplateDir } from "@beep/repo-cli/commands/create-package/handler";
import { createTemplateService } from "@beep/repo-cli/commands/create-package/template-service";
import { createTsMorphIntegrationService } from "@beep/repo-cli/commands/create-package/ts-morph-integration-service";
import { FsUtilsLive } from "@beep/repo-utils";
import { NodeFileSystem, NodePath, NodeTerminal } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { FileSystem, Path } from "effect";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { TestConsole } from "effect/testing";
import { ChildProcessSpawner } from "effect/unstable/process";

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

const uniqueSuffix = () => `${Date.now()}-${Str.slice(2)(Math.random().toString(36))}`;

interface ConfigFixture {
  readonly rootDir: string;
  readonly tsconfigPackagesPath: string;
  readonly tsconfigPath: string;
  readonly tstycheConfigPath: string;
}

const createConfigFixture = Effect.fn(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const rootDir = path.join(path.resolve("."), `_test-create-package-config-${uniqueSuffix()}`);
  const tsconfigPackagesPath = path.join(rootDir, "tsconfig.packages.json");
  const tsconfigPath = path.join(rootDir, "tsconfig.json");
  const tstycheConfigPath = path.join(rootDir, "tstyche.config.json");

  yield* fs.makeDirectory(rootDir, { recursive: true });
  yield* fs.writeFileString(
    tsconfigPackagesPath,
    `{
  "extends": "./tsconfig.base.json",
  "references": []
}\n`
  );

  yield* fs.writeFileString(
    tsconfigPath,
    `{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}\n`
  );

  yield* fs.writeFileString(
    tstycheConfigPath,
    `{
  "$schema": "https://tstyche.org/schemas/config.json",
  "testFileMatch": [
    "packages/*/dtslint/**/*.tst.*",
    "tooling/*/dtslint/**/*.tst.*",
    "apps/*/dtslint/**/*.tst.*"
  ],
  "tsconfig": "ignore"
}\n`
  );

  return {
    rootDir,
    tsconfigPackagesPath,
    tsconfigPath,
    tstycheConfigPath,
  } as const satisfies ConfigFixture;
});

const cleanupFixture = Effect.fn(function* (rootDir: string) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.remove(rootDir, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => void 0));
});

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
    "template directory resolution prefers dist templates and falls back to src templates",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const tmpDir = path.join(path.resolve("."), `_test-template-resolution-${uniqueSuffix()}`);
        const distCommandDir = path.join(tmpDir, "dist", "commands", "create-package");
        const distTemplatesDir = path.join(distCommandDir, "templates");
        const srcTemplatesDir = path.join(tmpDir, "src", "commands", "create-package", "templates");

        try {
          yield* fs.makeDirectory(distTemplatesDir, { recursive: true });
          yield* fs.makeDirectory(srcTemplatesDir, { recursive: true });

          yield* fs.writeFileString(path.join(distTemplatesDir, "README.md.hbs"), "# dist");
          yield* fs.writeFileString(path.join(srcTemplatesDir, "README.md.hbs"), "# src");

          const distResolved = yield* resolveCreatePackageTemplateDir(distCommandDir);
          expect(distResolved).toBe(distTemplatesDir);

          yield* fs.remove(distTemplatesDir, { recursive: true, force: true });

          const fallbackResolved = yield* resolveCreatePackageTemplateDir(distCommandDir);
          expect(fallbackResolved).toBe(srcTemplatesDir);
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

        expect(plan.actions.map((action) => `${action._tag}:${action.relativePath}`)).toEqual([
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
            importPath: O.none<string>(),
            statementText: O.none<string>(),
          },
          {
            kind: "wire-persistence" as const,
            filePath: "packages/persistence/src/index.ts",
            symbolName: "OrderRepository",
            importPath: O.some("@beep/order"),
            statementText: O.none<string>(),
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

  it.effect(
    "Config updater orchestration supports multi-target idempotent updates",
    withTestLayers(
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fixture = yield* createConfigFixture();

        try {
          const targets = [
            { packageName: "types", packagePath: "packages/common/types" },
            { packageName: "utils", packagePath: "packages/common/utils" },
          ] as const;

          const first = yield* updateRootConfigsForTargets(fixture.rootDir, targets);
          expect(first.tsconfigPackages).toBe(true);
          expect(first.tsconfigPaths).toBe(true);
          expect(first.tstycheConfig).toBe(true);

          const second = yield* updateRootConfigsForTargets(fixture.rootDir, [...targets].reverse());
          expect(second.tsconfigPackages).toBe(false);
          expect(second.tsconfigPaths).toBe(false);
          expect(second.tstycheConfig).toBe(false);

          const check = yield* checkConfigNeedsUpdateForTargets(fixture.rootDir, targets);
          expect(check.tsconfigPackages).toBe(false);
          expect(check.tsconfigPaths).toBe(false);
          expect(check.tstycheConfig).toBe(false);

          const tsconfigPackages = yield* fs.readFileString(fixture.tsconfigPackagesPath);
          expect(tsconfigPackages).toContain(`"path": "${targets[0].packagePath}"`);
          expect(tsconfigPackages).toContain(`"path": "${targets[1].packagePath}"`);

          const tstycheConfig = yield* fs.readFileString(fixture.tstycheConfigPath);
          expect(tstycheConfig).toContain(`packages/common/types/dtslint/**/*.tst.*`);
          expect(tstycheConfig).toContain(`packages/common/utils/dtslint/**/*.tst.*`);
        } finally {
          yield* cleanupFixture(fixture.rootDir);
        }
      })
    )
  );
});
