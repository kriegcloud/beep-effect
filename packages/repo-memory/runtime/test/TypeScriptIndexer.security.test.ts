import { RepoId, RunId } from "@beep/repo-memory-model";
import { TypeScriptIndexRequest, TypeScriptIndexService } from "@beep/repo-memory-runtime";
import { RepoMemorySqlConfig, RepoMemorySqlLive } from "@beep/repo-memory-sqlite";
import { FilePath } from "@beep/schema";
import { makeSqlTestLayer, NodeSqliteTestDriver, TestDatabaseInfo } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as S from "effect/Schema";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeRunId = S.decodeUnknownSync(RunId);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const makeIndexerLayer = () => {
  const sqlLayer = makeSqlTestLayer({
    config: undefined,
    driver: NodeSqliteTestDriver,
  });
  const storeLayer = Layer.unwrap(
    Effect.gen(function* () {
      const info = yield* TestDatabaseInfo;
      const path = yield* Path.Path;

      return RepoMemorySqlLive(
        new RepoMemorySqlConfig({
          appDataDir: decodeFilePath(path.join(info.tempDir, "app-data")),
        })
      );
    })
  ).pipe(Layer.provide(sqlLayer));
  const indexLayer = TypeScriptIndexService.layer.pipe(Layer.provide([sqlLayer, storeLayer]));

  return Layer.mergeAll(sqlLayer, storeLayer, indexLayer);
};

const withIndexer = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provide(makeIndexerLayer(), { local: true }));

const makeIndexRequest = (repoPath: string, runLabel: string) =>
  new TypeScriptIndexRequest({
    repoId: decodeRepoId(`repo:indexer:${runLabel}`),
    repoPath: decodeFilePath(repoPath),
    runId: decodeRunId(`run:indexer:${runLabel}`),
  });

const indexRepo = (repoPath: string, runLabel: string) =>
  Effect.gen(function* () {
    const indexer = yield* TypeScriptIndexService;
    return yield* indexer.indexRepo(makeIndexRequest(repoPath, runLabel));
  });

describe("TypeScriptIndexer security", () => {
  it.effect("skips symlinked directories that loop back into the repository while discovering tsconfig scopes", () =>
    withIndexer(
      Effect.gen(function* () {
        const info = yield* TestDatabaseInfo;
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const repoPath = path.join(info.tempDir, "fixtures", "loop-repo");
        const sourceDir = path.join(repoPath, "src");

        yield* fs.makeDirectory(sourceDir, { recursive: true });
        yield* fs.writeFileString(path.join(sourceDir, "index.ts"), "export const answer = 42;\n");
        yield* fs.writeFileString(
          path.join(repoPath, "tsconfig.json"),
          encodeJson({
            compilerOptions: {
              module: "ESNext",
              target: "ES2022",
            },
            include: ["src/**/*.ts"],
          })
        );
        yield* fs.symlink(repoPath, path.join(repoPath, "loop"));

        const artifacts = yield* indexRepo(repoPath, "loop");

        expect(A.map(artifacts.files, (file) => file.filePath)).toEqual([path.join(repoPath, "src", "index.ts")]);
      })
    )
  );

  it.effect("rejects sibling source files outside the repo root even when tsconfig includes them", () =>
    withIndexer(
      Effect.gen(function* () {
        const info = yield* TestDatabaseInfo;
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const repoPath = path.join(info.tempDir, "fixtures", "escape-repo");
        const sourceDir = path.join(repoPath, "src");
        const externalDir = path.join(info.tempDir, "fixtures", "outside-src");

        yield* fs.makeDirectory(sourceDir, { recursive: true });
        yield* fs.makeDirectory(externalDir, { recursive: true });
        yield* fs.writeFileString(path.join(sourceDir, "index.ts"), "export const inside = true;\n");
        yield* fs.writeFileString(path.join(externalDir, "escape.ts"), "export const outside = true;\n");
        yield* fs.writeFileString(
          path.join(repoPath, "tsconfig.json"),
          encodeJson({
            compilerOptions: {
              module: "ESNext",
              target: "ES2022",
            },
            include: ["src/**/*.ts", "../outside-src/**/*.ts"],
          })
        );

        const artifacts = yield* indexRepo(repoPath, "escape");

        expect(A.map(artifacts.files, (file) => file.filePath)).toEqual([path.join(repoPath, "src", "index.ts")]);
        expect(
          pipe(
            artifacts.symbols,
            A.map((symbol) => symbol.filePath),
            A.every((filePath) => filePath === path.join(repoPath, "src", "index.ts"))
          )
        ).toBe(true);
      })
    )
  );
});
