import { handleReindex, IndexingError, IndexNotFoundError, PipelineMock } from "@beep/codebase-search";
import { NodeFileSystem, NodePath } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";

const TestLayer = Layer.mergeAll(PipelineMock, NodeFileSystem.layer, NodePath.layer);

layer(TestLayer)("ReindexTool", (it) => {
  it.effect(
    "returns completed stats in full mode",
    Effect.fn(function* () {
      const result = yield* handleReindex({
        rootDir: "/root",
        indexPath: "/root/.code-index",
        mode: "full",
      });
      expect(result.status).toBe("completed");
      expect(result.mode).toBe("full");
      expect(result.stats.filesScanned).toBe(0);
    })
  );

  it.effect(
    "fails with IndexNotFoundError in incremental mode when index is absent",
    Effect.fn(function* () {
      const error = yield* handleReindex({
        rootDir: "/root",
        indexPath: "/root/.code-index",
        mode: "incremental",
      }).pipe(Effect.flip);
      expect(error).toBeInstanceOf(IndexNotFoundError);
    })
  );

  it.effect(
    "fails with IndexingError for full mode when package filter is provided",
    Effect.fn(function* () {
      const error = yield* handleReindex({
        rootDir: "/root",
        indexPath: "/root/.code-index",
        mode: "full",
        package: "@beep/cli",
      }).pipe(Effect.flip);
      expect(error).toBeInstanceOf(IndexingError);
      if (error instanceof IndexingError) {
        expect(error.phase).toBe("reindex-validate");
      }
    })
  );
});
