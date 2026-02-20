/**
 * SessionStart hook for Claude Code integration. Reads the codebase search
 * index metadata and produces a compact project overview written to stdout.
 * Designed to complete within 5000ms and never throw.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { Effect, FileSystem, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

import type { IndexMeta as ImportedIndexMeta } from "../IndexedSymbol.js";
import { IndexMeta as IndexMetaSchema } from "../IndexedSymbol.js";

/**
 * Re-exported index metadata schema-derived type.
 *
 * @since 0.0.0
 * @category types
 */
export type IndexMeta = ImportedIndexMeta;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Staleness threshold in milliseconds (1 hour).
 * If the index is older than this, a warning is appended to the overview.
 *
 * @since 0.0.0
 * @category constants
 */
export const STALENESS_THRESHOLD_MS = 3_600_000;

/**
 * Default directory name where the code index is stored.
 *
 * @since 0.0.0
 * @category constants
 */
export const INDEX_DIR = ".code-index" as const;

/**
 * File name for the index metadata JSON file.
 *
 * @since 0.0.0
 * @category constants
 */
export const INDEX_META_FILE = "index-meta.json" as const;

// ---------------------------------------------------------------------------
// SessionStartInput Schema
// ---------------------------------------------------------------------------

/**
 * Input received from Claude Code on session start via stdin.
 *
 * @since 0.0.0
 * @category schemas
 */
export const SessionStartInput = S.Struct({
  cwd: S.String,
  sessionId: S.String,
}).annotate({
  identifier: "@beep/codebase-search/hooks/SessionStart/SessionStartInput",
  title: "Session Start Input",
  description: "Input received from Claude Code on session start via stdin.",
});

/**
 * TypeScript type derived from the SessionStartInput schema.
 *
 * @since 0.0.0
 * @category types
 */
export type SessionStartInput = typeof SessionStartInput.Type;

// ---------------------------------------------------------------------------
// PackageStat
// ---------------------------------------------------------------------------

/**
 * Summary statistics for a single package in the index.
 *
 * @since 0.0.0
 * @category types
 */
export interface PackageStat {
  readonly name: string;
  readonly symbolCount: number;
  readonly kindSummary: string;
}

// ---------------------------------------------------------------------------
// IndexMeta JSON parsing
// ---------------------------------------------------------------------------

/** @internal JSON string <-> IndexMeta schema */
const IndexMetaFromJson = S.fromJsonString(IndexMetaSchema);

// ---------------------------------------------------------------------------
// generateSessionOverview
// ---------------------------------------------------------------------------

/**
 * Pure function that generates the overview text from metadata.
 * Returns a compact markdown string suitable for Claude Code session start output.
 *
 * When no index metadata is provided (null), returns a message suggesting
 * the user run the reindex tool. When metadata is present, formats a summary
 * of indexed symbols, files, and available MCP tools. If the index is stale,
 * appends a staleness warning.
 *
 * @param indexMeta indexMeta parameter value.
 * @param _packageStats _packageStats parameter value.
 * @param isStale isStale parameter value.
 * @since 0.0.0
 * @category builders
 * @returns Returns the computed value.
 */
export const generateSessionOverview = (
  indexMeta: IndexMeta | null,
  _packageStats: ReadonlyArray<PackageStat>,
  isStale: boolean
): string => {
  if (indexMeta === null) {
    return pipe(
      A.make(
        "## Codebase Search Available",
        "",
        "No index found. Run `reindex` MCP tool with mode='full' to build the initial index.",
        "After indexing, use `search_codebase` to find existing patterns before writing new code."
      ),
      A.join("\n")
    );
  }

  const parts = A.make(
    "## Codebase Index Overview",
    "",
    `**${String(indexMeta.totalSymbols)} symbols** indexed across **${String(indexMeta.totalFiles)} files** (model: ${indexMeta.embeddingModel})`,
    "",
    `Last indexed: ${indexMeta.lastIncrementalIndex}`,
    "",
    "**Available MCP tools:**",
    "- `search_codebase` \u2014 Semantic search for existing code patterns",
    "- `find_related` \u2014 Navigate symbol relationships",
    "- `browse_symbols` \u2014 Explore package/module structure",
    "- `reindex` \u2014 Refresh the search index",
    "",
    "Always search for existing patterns before creating new schemas, services, or utilities."
  );

  if (isStale) {
    return pipe(
      A.append(parts, ""),
      A.append("\nIndex is over 1 hour old. Consider running `reindex` for fresh results."),
      A.join("\n")
    );
  }

  return A.join("\n")(parts);
};

// ---------------------------------------------------------------------------
// sessionStartHook
// ---------------------------------------------------------------------------

/**
 * The main hook Effect that reads index metadata and produces a formatted
 * overview string. Never fails — all errors are caught and result in either
 * a "no index" message or an empty string.
 *
 * @since 0.0.0
 * @category hooks
 */
export const sessionStartHook: (
  cwd: string,
  indexPath?: string | undefined
) => Effect.Effect<string, never, FileSystem.FileSystem | Path.Path> = Effect.fn(function* (
  cwd: string,
  indexPath?: string | undefined
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const indexDir =
    indexPath === undefined
      ? path.join(cwd, INDEX_DIR)
      : path.isAbsolute(indexPath)
        ? indexPath
        : path.join(cwd, indexPath);
  const metaPath = path.join(indexDir, INDEX_META_FILE);

  // Check if file exists
  const exists = yield* fs.exists(metaPath).pipe(Effect.orElseSucceed(() => false));

  if (!exists) {
    return generateSessionOverview(null, A.empty<PackageStat>(), false);
  }

  // Read and decode the metadata file
  const contentResult = yield* fs.readFileString(metaPath).pipe(
    Effect.map(O.some),
    Effect.orElseSucceed(() => O.none<string>())
  );

  if (O.isNone(contentResult)) {
    return "";
  }

  const content = contentResult.value;
  if (Str.isEmpty(content)) {
    return "";
  }

  const metaResult = yield* pipe(
    S.decodeUnknownEffect(IndexMetaFromJson)(content),
    Effect.map(O.some),
    Effect.orElseSucceed(() => O.none<IndexMeta>())
  );

  if (O.isNone(metaResult)) {
    return "";
  }

  const meta = metaResult.value;

  // Determine staleness
  const lastIndexedMs = Date.parse(meta.lastIncrementalIndex);
  const isStale = Number.isNaN(lastIndexedMs) ? false : Date.now() - lastIndexedMs > STALENESS_THRESHOLD_MS;

  // For now, no per-package stats (will be added when T12 Pipeline is complete)
  return generateSessionOverview(meta, A.empty<PackageStat>(), isStale);
});
