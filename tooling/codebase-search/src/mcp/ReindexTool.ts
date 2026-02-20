/**
 * MCP tool definition and handler for `reindex`.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem, Path } from "effect";
import { pipe } from "effect/Function";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { type IndexingError, IndexNotFoundError } from "../errors.js";
import { Pipeline, type PipelineConfig } from "../indexer/Pipeline.js";
import { McpErrorResponseSchema } from "./contracts.js";
import { type FormattedReindexResult, formatReindexResult } from "./formatters.js";

/**
 * Reindex run statistics.
 *
 * @since 0.0.0
 * @category types
 */
export interface ReindexStats {
  readonly filesScanned: number;
  readonly filesChanged: number;
  readonly symbolsIndexed: number;
  readonly symbolsRemoved: number;
  readonly durationMs: number;
}

/**
 * Successful `reindex` response payload.
 *
 * @since 0.0.0
 * @category types
 */
export interface ReindexSuccess {
  readonly status: "completed";
  readonly mode: "full" | "incremental";
  readonly stats: ReindexStats;
}

/**
 * Schema for reindex stats.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ReindexStatsSchema = S.Struct({
  filesScanned: S.Number,
  filesChanged: S.Number,
  symbolsIndexed: S.Number,
  symbolsRemoved: S.Number,
  durationMs: S.Number,
});

/**
 * Schema for successful reindex response.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ReindexSuccessSchema = S.Struct({
  status: S.Literal("completed"),
  mode: S.Literals(["full", "incremental"]),
  stats: ReindexStatsSchema,
});

/**
 * Handle `reindex` invocation.
 *
 * @since 0.0.0
 * @category handlers
 */
export const handleReindex: (params: {
  readonly rootDir: string;
  readonly indexPath: string;
  readonly mode?: string | undefined;
  readonly package?: string | undefined;
}) => Effect.Effect<ReindexSuccess, IndexingError | IndexNotFoundError, Pipeline | FileSystem.FileSystem | Path.Path> =
  Effect.fn(function* (params: {
    readonly rootDir: string;
    readonly indexPath: string;
    readonly mode?: string | undefined;
    readonly package?: string | undefined;
  }) {
    const pipeline = yield* Pipeline;
    const fs = yield* FileSystem.FileSystem;
    const pathSvc = yield* Path.Path;

    const mode: "full" | "incremental" = params.mode === "full" ? "full" : "incremental";

    if (mode === "incremental") {
      const indexMetaPath = pathSvc.join(params.indexPath, "index-meta.json");
      const exists = yield* pipe(
        fs.exists(indexMetaPath),
        Effect.orElseSucceed(() => false)
      );
      if (!exists) {
        return yield* Effect.fail(
          new IndexNotFoundError({
            message: `No index found at ${indexMetaPath}.`,
            indexPath: params.indexPath,
          })
        );
      }
    }

    const config: PipelineConfig = {
      rootDir: params.rootDir,
      indexPath: params.indexPath,
      mode,
      packageFilter: params.package,
    };

    const stats = yield* pipeline.run(config);

    return yield* pipe(
      S.decodeUnknownEffect(ReindexSuccessSchema)(formatReindexResult(mode, stats) satisfies FormattedReindexResult),
      Effect.mapError(
        (error) =>
          new IndexNotFoundError({
            message: `Invalid reindex response payload: ${String(error)}`,
            indexPath: params.indexPath,
          })
      )
    );
  });

/**
 * MCP tool: run full or incremental indexing.
 *
 * @since 0.0.0
 * @category tools
 */
export const ReindexTool = Tool.make("reindex", {
  description: "Rebuild the semantic search index in full or incremental mode.",
  parameters: S.Struct({
    mode: S.optionalKey(
      S.Literals(["incremental", "full"]).annotate({
        description: "Index rebuild mode (default: incremental).",
      })
    ),
    package: S.optionalKey(
      S.String.annotate({
        description: "Optional package filter to reindex one package only.",
      })
    ),
  }),
  success: S.Unknown,
  failure: McpErrorResponseSchema,
  dependencies: [Pipeline, FileSystem.FileSystem, Path.Path],
});
