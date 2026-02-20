/**
 * MCP tool definition and handler for `reindex`.
 *
 * @since 0.0.0
 * @module
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { Effect, FileSystem, Path } from "effect";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { IndexingError, IndexNotFoundError } from "../errors.js";
import { Pipeline, type PipelineConfig } from "../indexer/Pipeline.js";
import { McpErrorResponseSchema } from "./contracts.js";
import { formatReindexResult } from "./formatters.js";

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
}) => Effect.Effect<
  S.Schema.Type<typeof ReindexSuccessSchema>,
  IndexingError | IndexNotFoundError,
  Pipeline | FileSystem.FileSystem | Path.Path
> = Effect.fn(function* (params: {
  readonly rootDir: string;
  readonly indexPath: string;
  readonly mode?: string | undefined;
  readonly package?: string | undefined;
}) {
  const pipeline = yield* Pipeline;

  const mode: "full" | "incremental" = params.mode === "full" ? "full" : "incremental";

  if (mode === "full" && params.package !== undefined) {
    return yield* Effect.fail(
      new IndexingError({
        message:
          "Full reindex with package filter is not supported. Use mode='incremental' with package filter, or omit package for a full rebuild.",
        phase: "reindex-validate",
      })
    );
  }

  if (mode === "incremental") {
    const indexMetaPath = join(params.indexPath, "index-meta.json");
    const exists = yield* Effect.sync(() => existsSync(indexMetaPath)).pipe(Effect.orElseSucceed(() => false));
    if (!exists) {
      return yield* new IndexNotFoundError({
        message: `No index found at ${indexMetaPath}.`,
        indexPath: params.indexPath,
      });
    }
  }

  const config: PipelineConfig = {
    rootDir: params.rootDir,
    indexPath: params.indexPath,
    mode,
    packageFilter: params.package,
  };

  const stats = yield* pipeline.run(config);

  return yield* S.decodeUnknownEffect(ReindexSuccessSchema)(formatReindexResult(mode, stats)).pipe(
    Effect.mapError(
      (error) =>
        new IndexingError({
          message: `Invalid reindex response payload: ${String(error)}`,
          phase: "response-encoding",
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
