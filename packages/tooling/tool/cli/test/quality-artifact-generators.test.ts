import { writeJSDocDocumentationInventory, writeOrCheckRepoExportsCatalog } from "@beep/repo-cli/test/Quality";
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
});
