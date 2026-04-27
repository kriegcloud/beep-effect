import { createPackageCommand } from "@beep/repo-cli/commands/CreatePackage";
import { FsUtilsLive, TSMorphServiceLive } from "@beep/repo-utils";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { Command } from "effect/unstable/cli";
import * as jsonc from "jsonc-parser";
import { describe, expect, it } from "vitest";

const CommandPlatformLayer = Layer.mergeAll(NodeServices.layer);
const CommandTestLayer = Layer.mergeAll(
  CommandPlatformLayer,
  FsUtilsLive.pipe(Layer.provideMerge(CommandPlatformLayer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(CommandPlatformLayer))
);
const runCreatePackageCommand = Command.runWith(createPackageCommand, { version: "0.0.0" });
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const decodeUnknownJson = S.decodeUnknownSync(S.fromJsonString(S.Unknown));
const CreatePackageTestTimeoutMs = 30_000;
const TestFileCwd = process.cwd();

const RootPackage = S.Struct({
  workspaces: S.Array(S.String),
});
const TsconfigReferences = S.Struct({
  references: S.Array(
    S.Struct({
      path: S.String,
    })
  ),
});
const TsconfigPaths = S.Struct({
  compilerOptions: S.Struct({
    paths: S.Record(S.String, S.Array(S.String)),
  }),
});
const TstycheConfig = S.Struct({
  testFileMatch: S.Array(S.String),
});
const PackageScripts = S.Struct({
  scripts: S.Record(S.String, S.String),
});

const decodeRootPackage = S.decodeUnknownSync(RootPackage);
const decodeTsconfigReferences = S.decodeUnknownSync(TsconfigReferences);
const decodeTsconfigPaths = S.decodeUnknownSync(TsconfigPaths);
const decodeTstycheConfig = S.decodeUnknownSync(TstycheConfig);
const decodePackageScripts = S.decodeUnknownSync(PackageScripts);
const ExpectedGeneratedQualityScripts = {
  audit: "bun run --if-present beep:audit",
  babel: "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
  "beep:audit": "bun run beep:build && bun run beep:check && bun run beep:test && bun run beep:lint",
  "beep:build": "tsc -b tsconfig.json && bun run babel",
  "beep:check": "tsgo -b tsconfig.json",
  "beep:lint": "biome check .",
  "beep:lint:fix": "biome check . --write",
  "beep:test": "bunx --bun vitest run --passWithNoTests",
  build: "bun run beep:build",
  check: "bun run beep:check",
  coverage: "bunx --bun vitest run --coverage --passWithNoTests",
  lint: "bun run beep:lint",
  "lint:fix": "bun run beep:lint:fix",
  test: "bun run beep:test",
} as const;

const withTempRepoCommand = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tmpDir = yield* fs.makeTempDirectory();

      process.chdir(tmpDir);
      yield* fs.makeDirectory(path.join(tmpDir, ".git"), { recursive: true });

      return { fs, tmpDir } as const;
    }),
    () => use,
    ({ fs, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(TestFileCwd);
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  ).pipe(Effect.provide(CommandTestLayer));

const writeTextFile = Effect.fn(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.dirname(filePath), { recursive: true });
  yield* fs.writeFileString(filePath, content);
});

const writeJsonFile = Effect.fn(function* (filePath: string, value: unknown) {
  yield* writeTextFile(filePath, `${encodeJson(value)}\n`);
});

const readJsonFile = Effect.fn(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return decodeUnknownJson(yield* fs.readFileString(filePath));
});

const readJsoncFile = Effect.fn(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return jsonc.parse(yield* fs.readFileString(filePath), undefined, {
    allowTrailingComma: true,
    disallowComments: false,
  });
});

const writeSyncpackConfig = (filePath: string, sources: ReadonlyArray<string>) =>
  writeTextFile(
    filePath,
    `import type { RcFile } from "syncpack";

const config = {
  source: [
${A.map(sources, (source) => `    "${source}",`).join("\n")}
  ],
  customTypes: {},
  versionGroups: [],
} satisfies RcFile;

export default config;
`
  );

const bootstrapIdentityWorkspace = Effect.fn(function* (rootDir: string) {
  const path = yield* Path.Path;
  const identityDir = path.join(rootDir, "packages", "common", "identity");

  yield* writeJsonFile(path.join(identityDir, "package.json"), {
    name: "@beep/identity",
    version: "0.0.0",
    exports: {
      ".": "./src/index.ts",
      "./*": "./src/*.ts",
    },
  });
  yield* writeJsonFile(path.join(identityDir, "tsconfig.json"), {
    compilerOptions: {
      outDir: "dist",
      rootDir: "src",
    },
    include: ["src/**/*.ts"],
  });
  yield* writeTextFile(path.join(identityDir, "src", "index.ts"), `export * from "./packages.ts";\n`);
  yield* writeTextFile(path.join(identityDir, "src", "Id.ts"), `export type IdentityComposer<T extends string> = T;\n`);
  yield* writeTextFile(
    path.join(identityDir, "src", "packages.ts"),
    `import * as Identity from "./Id.ts";

export const $I = {
  compose: (..._segments: ReadonlyArray<string>) => ({
    $IdentityId: "@beep/identity" as Identity.IdentityComposer<"@beep/identity">,
  }),
};

const composers = $I.compose(
  "identity",
);

export const $IdentityId: Identity.IdentityComposer<"@beep/identity"> = composers.$IdentityId;
`
  );
});

const bootstrapRootConfig = Effect.fn(function* (
  rootDir: string,
  options: {
    readonly workspaces: ReadonlyArray<string>;
    readonly references: ReadonlyArray<string>;
    readonly paths: Record<string, ReadonlyArray<string>>;
    readonly testFileMatch: ReadonlyArray<string>;
    readonly syncpackSources: ReadonlyArray<string>;
  }
) {
  const path = yield* Path.Path;

  yield* writeJsonFile(path.join(rootDir, "package.json"), {
    name: "@beep/test-root",
    private: true,
    workspaces: options.workspaces,
  });
  yield* writeJsonFile(path.join(rootDir, "tsconfig.json"), {
    compilerOptions: {
      paths: options.paths,
    },
  });
  yield* writeJsonFile(path.join(rootDir, "tsconfig.packages.json"), {
    references: A.map(options.references, (referencePath) => ({ path: referencePath })),
  });
  yield* writeJsonFile(path.join(rootDir, "tsconfig.quality.packages.json"), {
    references: A.map(options.references, (referencePath) => ({ path: referencePath })),
  });
  yield* writeJsonFile(path.join(rootDir, "tstyche.json"), {
    testFileMatch: options.testFileMatch,
    tsconfig: "findup",
  });
  yield* writeSyncpackConfig(path.join(rootDir, "syncpack.config.ts"), options.syncpackSources);
});

describe.sequential("create-package", () => {
  it(
    "adds top-level package workspaces, identity exports, and shared config sync outputs",
    async () => {
      await Effect.runPromise(
        withTempRepoCommand(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const rootDir = process.cwd();

            yield* bootstrapRootConfig(rootDir, {
              workspaces: ["packages/common/*"],
              references: ["packages/common/identity"],
              paths: {
                "@beep/identity": ["./packages/common/identity/src/index.ts"],
                "@beep/identity/*": ["./packages/common/identity/src/*"],
              },
              testFileMatch: ["packages/*/dtslint/**/*.tst.*", "packages/common/identity/dtslint/**/*.tst.*"],
              syncpackSources: ["package.json", "packages/common/*/package.json"],
            });
            yield* bootstrapIdentityWorkspace(rootDir);

            yield* runCreatePackageCommand([
              "example-domain",
              "--parent-dir",
              "packages",
              "--description",
              "An editor package",
            ]);

            const rootPackage = decodeRootPackage(yield* readJsonFile(path.join(rootDir, "package.json")));
            expect(rootPackage.workspaces).toEqual(["packages/common/*", "packages/example-domain"]);

            const generatedPackage = decodePackageScripts(
              yield* readJsonFile(path.join(rootDir, "packages", "example-domain", "package.json"))
            );
            expect(generatedPackage.scripts).toMatchObject(ExpectedGeneratedQualityScripts);
            expect(generatedPackage.scripts.docgen).toBe("bun run ../../tooling/docgen/src/bin.ts");
            expect(generatedPackage.scripts.codegen).toBeUndefined();
            expect(yield* fs.exists(path.join(rootDir, "packages", "example-domain", "ai-context.md"))).toBe(false);

            const rootTsconfig = decodeTsconfigPaths(yield* readJsoncFile(path.join(rootDir, "tsconfig.json")));
            expect(rootTsconfig.compilerOptions.paths).toMatchObject({
              "@beep/identity": ["./packages/common/identity/src/index.ts"],
              "@beep/identity/*": ["./packages/common/identity/src/*"],
              "@beep/example-domain": ["./packages/example-domain/src/index.ts"],
              "@beep/example-domain/*": ["./packages/example-domain/src/*"],
            });

            const packageRefs = decodeTsconfigReferences(
              yield* readJsoncFile(path.join(rootDir, "tsconfig.packages.json"))
            );
            expect(A.map(packageRefs.references, (entry) => entry.path)).toEqual([
              "packages/common/identity",
              "packages/example-domain",
            ]);

            const qualityRefs = decodeTsconfigReferences(
              yield* readJsoncFile(path.join(rootDir, "tsconfig.quality.packages.json"))
            );
            expect(A.map(qualityRefs.references, (entry) => entry.path)).toEqual([
              "packages/common/identity",
              "packages/example-domain",
            ]);

            const tstycheConfig = decodeTstycheConfig(yield* readJsonFile(path.join(rootDir, "tstyche.json")));
            expect(tstycheConfig.testFileMatch).toEqual([
              "packages/*/dtslint/**/*.tst.*",
              "packages/common/identity/dtslint/**/*.tst.*",
            ]);
            expect(tstycheConfig.testFileMatch).not.toContain("packages/example-domain/dtslint/**/*.tst.*");

            const syncpackConfig = yield* fs.readFileString(path.join(rootDir, "syncpack.config.ts"));
            expect(syncpackConfig).toContain(`"packages/example-domain/package.json"`);

            const identityPackages = yield* fs.readFileString(
              path.join(rootDir, "packages", "common", "identity", "src", "packages.ts")
            );
            expect(identityPackages).toContain(`"example-domain"`);
            expect(identityPackages).toContain(`export const $ExampleDomainId`);
          })
        )
      );
    },
    CreatePackageTestTimeoutMs
  );

  it(
    "keeps covered parent workspaces untouched while still syncing nested package registration",
    async () => {
      await Effect.runPromise(
        withTempRepoCommand(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const rootDir = process.cwd();

            yield* bootstrapRootConfig(rootDir, {
              workspaces: ["packages/common/*"],
              references: ["packages/common/identity"],
              paths: {
                "@beep/identity": ["./packages/common/identity/src/index.ts"],
                "@beep/identity/*": ["./packages/common/identity/src/*"],
              },
              testFileMatch: ["packages/*/dtslint/**/*.tst.*", "packages/common/identity/dtslint/**/*.tst.*"],
              syncpackSources: ["package.json", "packages/common/*/package.json"],
            });
            yield* bootstrapIdentityWorkspace(rootDir);

            yield* runCreatePackageCommand([
              "telemetry",
              "--parent-dir",
              "packages/common",
              "--description",
              "A telemetry package",
            ]);

            const rootPackage = decodeRootPackage(yield* readJsonFile(path.join(rootDir, "package.json")));
            expect(rootPackage.workspaces).toEqual(["packages/common/*"]);

            const packageRefs = decodeTsconfigReferences(
              yield* readJsoncFile(path.join(rootDir, "tsconfig.packages.json"))
            );
            expect(A.map(packageRefs.references, (entry) => entry.path)).toEqual([
              "packages/common/identity",
              "packages/common/telemetry",
            ]);

            const tstycheConfig = decodeTstycheConfig(yield* readJsonFile(path.join(rootDir, "tstyche.json")));
            expect(tstycheConfig.testFileMatch).toContain("packages/common/telemetry/dtslint/**/*.tst.*");

            const syncpackConfig = yield* fs.readFileString(path.join(rootDir, "syncpack.config.ts"));
            expect(syncpackConfig).not.toContain(`"packages/common/telemetry/package.json"`);

            const identityPackages = yield* fs.readFileString(
              path.join(rootDir, "packages", "common", "identity", "src", "packages.ts")
            );
            expect(identityPackages).toContain(`"telemetry"`);
            expect(identityPackages).toContain(`export const $TelemetryId`);
          })
        )
      );
    },
    CreatePackageTestTimeoutMs
  );

  it(
    "registers top-level tooling packages explicitly instead of widening workspace globs",
    async () => {
      await Effect.runPromise(
        withTempRepoCommand(
          Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            const rootDir = process.cwd();

            yield* bootstrapRootConfig(rootDir, {
              workspaces: ["packages/common/*", "tooling/cli"],
              references: ["packages/common/identity", "tooling/cli"],
              paths: {
                "@beep/identity": ["./packages/common/identity/src/index.ts"],
                "@beep/identity/*": ["./packages/common/identity/src/*"],
                "@beep/repo-cli": ["./tooling/cli/src/index.ts"],
                "@beep/repo-cli/*": ["./tooling/cli/src/*"],
              },
              testFileMatch: [
                "packages/*/dtslint/**/*.tst.*",
                "packages/common/identity/dtslint/**/*.tst.*",
                "tooling/cli/dtslint/**/*.tst.*",
              ],
              syncpackSources: ["package.json", "packages/common/*/package.json", "tooling/cli/package.json"],
            });
            yield* bootstrapIdentityWorkspace(rootDir);
            yield* writeJsonFile(path.join(rootDir, "tooling", "cli", "package.json"), {
              name: "@beep/repo-cli",
              version: "0.0.0",
              exports: {
                ".": "./src/index.ts",
                "./*": "./src/*.ts",
              },
            });
            yield* writeJsonFile(path.join(rootDir, "tooling", "cli", "tsconfig.json"), {
              compilerOptions: {
                outDir: "dist",
                rootDir: "src",
              },
              include: ["src/**/*.ts"],
            });
            yield* writeTextFile(path.join(rootDir, "tooling", "cli", "src", "index.ts"), "export {};\n");

            yield* runCreatePackageCommand(["repo-utils", "--type", "tool", "--description", "Repo helpers"]);

            const rootPackage = decodeRootPackage(yield* readJsonFile(path.join(rootDir, "package.json")));
            expect(rootPackage.workspaces).toEqual(["packages/common/*", "tooling/cli", "tooling/repo-utils"]);
            expect(rootPackage.workspaces).not.toContain("tooling/*");

            const packageRefs = decodeTsconfigReferences(
              yield* readJsoncFile(path.join(rootDir, "tsconfig.packages.json"))
            );
            expect(A.map(packageRefs.references, (entry) => entry.path)).toEqual([
              "packages/common/identity",
              "tooling/cli",
              "tooling/repo-utils",
            ]);

            const syncpackConfig = yield* fs.readFileString(path.join(rootDir, "syncpack.config.ts"));
            expect(syncpackConfig).toContain(`"tooling/repo-utils/package.json"`);
            expect(syncpackConfig).not.toContain(`"tooling/*/package.json"`);
          })
        )
      );
    },
    CreatePackageTestTimeoutMs
  );
});
