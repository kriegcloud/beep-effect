import {
  summarizeTurboDryRunOutput,
  summarizeTurboQueryAffectedOutput,
  writeJSDocDocumentationInventory,
  writeOrCheckRepoExportsCatalog,
} from "@beep/repo-cli/test/Quality";
import { provideScopedLayer } from "@beep/test-utils";
import { NodeChildProcessSpawner } from "@effect/platform-node";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as S from "effect/Schema";
import * as jsonc from "jsonc-parser";
import { describe, expect, it } from "vitest";

const FileSystemLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const PlatformLayer = Layer.mergeAll(
  FileSystemLayer,
  NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(FileSystemLayer))
);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const fixedGeneratedAt = "2026-01-01T00:00:00.000Z";

const tsdocPolicy = {
  tagDefinitions: [
    { tagName: "@effects", syntaxKind: "block" },
    { tagName: "@precondition", syntaxKind: "block" },
    { tagName: "@postcondition", syntaxKind: "block" },
    { tagName: "@invariant", syntaxKind: "block" },
  ],
  supportForTags: {
    "@effects": true,
    "@precondition": true,
    "@postcondition": true,
    "@invariant": true,
  },
};

const packageSource = `/**
 * Demo package documentation.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Demo value used by generator fixture tests.
 *
 * @example
 * \`\`\`ts
 * import { demoValue } from "@beep/demo"
 *
 * console.log(demoValue)
 * \`\`\`
 * @category constants
 * @since 0.0.0
 */
export const demoValue = "demo";
`;

const writeJsonFile = (filePath: string, value: unknown) =>
  FileSystem.FileSystem.pipe(Effect.flatMap((fs) => fs.writeFileString(filePath, `${encodeJson(value)}\n`)));

const parseJsoncText = (text: string): unknown => {
  const errors: Array<jsonc.ParseError> = [];
  const parsed = jsonc.parse(text, errors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  expect(errors).toEqual([]);
  return parsed;
};

const acquireFixtureRepo = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* fs.makeTempDirectory();
  const packageRoot = path.join(repoRoot, "packages", "demo");

  yield* fs.makeDirectory(path.join(packageRoot, "src"), { recursive: true });
  yield* writeJsonFile(path.join(repoRoot, "package.json"), {
    name: "fixture-root",
    scripts: {
      "topo-sort": "printf '@beep/demo\\n'",
    },
    workspaces: ["packages/*"],
  });
  yield* writeJsonFile(path.join(repoRoot, "tsdoc.json"), tsdocPolicy);
  yield* writeJsonFile(path.join(packageRoot, "package.json"), {
    name: "@beep/demo",
    exports: {
      ".": "./src/index.ts",
    },
  });
  yield* fs.writeFileString(path.join(packageRoot, "src", "index.ts"), packageSource);

  return repoRoot;
});

const withFixtureRepo = Effect.fnUntraced(function* <A, E, R>(use: (repoRoot: string) => Effect.Effect<A, E, R>) {
  return yield* Effect.acquireUseRelease(
    acquireFixtureRepo(),
    use,
    Effect.fnUntraced(function* (repoRoot) {
      const fs = yield* FileSystem.FileSystem;
      yield* fs.remove(repoRoot, { recursive: true });
    })
  ).pipe(provideScopedLayer(PlatformLayer));
});

describe("quality artifact generators", () => {
  it("writes the JSDoc inventory to explicit artifact paths", () =>
    Effect.runPromise(
      withFixtureRepo(
        Effect.fnUntraced(function* (repoRoot) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const outputJsonPath = path.join(repoRoot, "out", "jsdoc.inventory.jsonc");
          const outputMarkdownPath = path.join(repoRoot, "out", "jsdoc.inventory.md");

          const result = yield* writeJSDocDocumentationInventory({
            rootDir: repoRoot,
            outputJsonPath,
            outputMarkdownPath,
            generatedAt: fixedGeneratedAt,
          });
          const inventory = parseJsoncText(yield* fs.readFileString(outputJsonPath)) as {
            readonly generatedAt: string;
            readonly packages: ReadonlyArray<{ readonly packageName: string }>;
          };
          const markdown = yield* fs.readFileString(outputMarkdownPath);

          expect(result.outputJsonPath).toBe(outputJsonPath);
          expect(result.outputMarkdownPath).toBe(outputMarkdownPath);
          expect(inventory.generatedAt).toBe(fixedGeneratedAt);
          expect(inventory.packages.map((pkg) => pkg.packageName)).toEqual(["@beep/demo"]);
          expect(markdown).toContain("# JSDoc Documentation Compliance Inventory");
        })
      )
    ));

  it("checks the repo export catalog through explicit artifact paths", () =>
    Effect.runPromise(
      withFixtureRepo(
        Effect.fnUntraced(function* (repoRoot) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const outputJsonPath = path.join(repoRoot, "out", "repo-exports.catalog.jsonc");
          const outputMarkdownPath = path.join(repoRoot, "out", "repo-exports.catalog.md");

          const writeResult = yield* writeOrCheckRepoExportsCatalog({
            rootDir: repoRoot,
            outputJsonPath,
            outputMarkdownPath,
          });
          const checkResult = yield* writeOrCheckRepoExportsCatalog({
            rootDir: repoRoot,
            outputJsonPath,
            outputMarkdownPath,
            check: true,
          });

          yield* fs.writeFileString(outputMarkdownPath, "stale\n");
          const staleResult = yield* writeOrCheckRepoExportsCatalog({
            rootDir: repoRoot,
            outputJsonPath,
            outputMarkdownPath,
            check: true,
          });

          expect(writeResult.written).toBe(true);
          expect(checkResult.findings).toEqual([]);
          expect(staleResult.findings).toEqual(["out/repo-exports.catalog.md is stale"]);
        })
      )
    ));

  it("aggregates the repo export catalog from package-local shards", () =>
    Effect.runPromise(
      withFixtureRepo(
        Effect.fnUntraced(function* (repoRoot) {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const fullJsonPath = path.join(repoRoot, "out", "repo-exports.full.jsonc");
          const fullMarkdownPath = path.join(repoRoot, "out", "repo-exports.full.md");
          const shardJsonPath = path.join(repoRoot, "out", "repo-exports.from-shards.jsonc");
          const shardMarkdownPath = path.join(repoRoot, "out", "repo-exports.from-shards.md");
          const expectedShardPath = path.join(
            repoRoot,
            "packages",
            "demo",
            ".beep",
            "repo-exports",
            "catalog.shard.jsonc"
          );

          yield* writeOrCheckRepoExportsCatalog({
            rootDir: repoRoot,
            outputJsonPath: fullJsonPath,
            outputMarkdownPath: fullMarkdownPath,
          });
          const shardResult = yield* writeOrCheckRepoExportsCatalog({
            rootDir: repoRoot,
            packageShard: true,
            packageName: "@beep/demo",
          });
          const aggregateResult = yield* writeOrCheckRepoExportsCatalog({
            rootDir: repoRoot,
            outputJsonPath: shardJsonPath,
            outputMarkdownPath: shardMarkdownPath,
            fromShards: true,
          });

          const fullCatalog = parseJsoncText(yield* fs.readFileString(fullJsonPath)) as {
            readonly packages: ReadonlyArray<unknown>;
            readonly totals: unknown;
          };
          const shardCatalog = parseJsoncText(yield* fs.readFileString(shardJsonPath)) as {
            readonly packages: ReadonlyArray<unknown>;
            readonly totals: unknown;
          };
          const shard = parseJsoncText(yield* fs.readFileString(expectedShardPath)) as {
            readonly fingerprint: { readonly digest: string; readonly inputs: ReadonlyArray<unknown> };
            readonly package: { readonly packageName: string };
          };

          expect(shardResult.outputShardPath).toBe(expectedShardPath);
          expect(aggregateResult.written).toBe(true);
          expect(shard.fingerprint.digest).toMatch(/^[0-9a-f]{64}$/);
          expect(shard.fingerprint.inputs.length).toBeGreaterThan(0);
          expect(shard.package.packageName).toBe("@beep/demo");
          expect(shardCatalog.totals).toEqual(fullCatalog.totals);
          expect(shardCatalog.packages).toEqual(fullCatalog.packages);
        })
      )
    ));

  it("summarizes Turbo affected query output with banner text", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const summary = yield* summarizeTurboQueryAffectedOutput(`• turbo 2.9.16
{
  "data": {
    "affectedTasks": {
      "items": [
        {
          "name": "lint",
          "package": { "name": "@beep/demo" },
          "reason": { "__typename": "TaskFileChanged" }
        },
        {
          "name": "check",
          "package": { "name": "@beep/demo" },
          "reason": { "__typename": "TaskGlobalDepsChanged" }
        },
        {
          "name": "lint",
          "package": { "name": "@beep/other" },
          "reason": { "__typename": "TaskFileChanged" }
        }
      ]
    }
  }
}
`);

        expect(summary.total).toBe(3);
        expect(summary.byTask).toEqual({ check: 1, lint: 2 });
        expect(summary.byReason).toEqual({ TaskFileChanged: 2, TaskGlobalDepsChanged: 1 });
      })
    ));

  it("summarizes Turbo dry-run output by task and cache status", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const summary = yield* summarizeTurboDryRunOutput(`• turbo 2.9.16
{
  "packages": ["@beep/demo", "@beep/other"],
  "tasks": [
    {
      "task": "lint",
      "package": "@beep/demo",
      "cache": { "status": "HIT" }
    },
    {
      "task": "lint",
      "package": "@beep/other",
      "cache": { "status": "MISS" }
    },
    {
      "taskId": "@beep/demo#check",
      "package": "@beep/demo",
      "cacheStatus": "MISS"
    }
  ]
}
`);

        expect(summary.total).toBe(3);
        expect(summary.packages).toBe(2);
        expect(summary.byTask).toEqual({ check: 1, lint: 2 });
        expect(summary.byStatus).toEqual({ HIT: 1, MISS: 2 });
      })
    ));
});
