/**
 * Schema-first models for the DuckDB driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { make } from "@beep/identity";
import * as S from "effect/Schema";

const { $DuckdbId } = make("duckdb");
const $I = $DuckdbId.create("DuckDb.models");

/**
 * Connection options for a DuckDB database.
 *
 * @example
 * ```ts
 * import { DuckDbConnectionOptions } from "@beep/duckdb"
 *
 * const options = new DuckDbConnectionOptions({
 *   databasePath: "metrics.duckdb"
 * })
 *
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DuckDbConnectionOptions extends S.Class<DuckDbConnectionOptions>($I`DuckDbConnectionOptions`)(
  {
    databaseOptions: S.optionalKey(S.Record(S.String, S.String)),
    databasePath: S.String,
  },
  $I.annote("DuckDbConnectionOptions", {
    description: "Connection options for a DuckDB database.",
  })
) {}

/**
 * Parquet export request for a DuckDB table.
 *
 * @example
 * ```ts
 * import { DuckDbParquetExport } from "@beep/duckdb"
 *
 * const request = new DuckDbParquetExport({
 *   filePath: "exports/table.parquet",
 *   tableName: "ai_metrics_ingest_runs"
 * })
 *
 * void request
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DuckDbParquetExport extends S.Class<DuckDbParquetExport>($I`DuckDbParquetExport`)(
  {
    filePath: S.String,
    tableName: S.String,
  },
  $I.annote("DuckDbParquetExport", {
    description: "Parquet export request for a DuckDB table.",
  })
) {}

/**
 * JSON-compatible row returned from DuckDB queries.
 *
 * @example
 * ```ts
 * import { DuckDbRow } from "@beep/duckdb"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   return yield* S.decodeUnknownEffect(DuckDbRow)({ count: 1 })
 * })
 *
 * void program
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const DuckDbRow = S.Record(S.String, S.Unknown).pipe(
  $I.annoteSchema("DuckDbRow", {
    description: "JSON-compatible row returned from DuckDB queries.",
  })
);

/**
 * Type for {@link DuckDbRow}.
 *
 * @example
 * ```ts
 * import type { DuckDbRow } from "@beep/duckdb"
 *
 * const row: DuckDbRow = { count: 1 }
 * void row
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DuckDbRow = typeof DuckDbRow.Type;

/**
 * JSON-compatible rows returned from DuckDB queries.
 *
 * @example
 * ```ts
 * import { DuckDbRows } from "@beep/duckdb"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   return yield* S.decodeUnknownEffect(DuckDbRows)([])
 * })
 *
 * void program
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const DuckDbRows = S.Array(DuckDbRow).pipe(
  $I.annoteSchema("DuckDbRows", {
    description: "JSON-compatible rows returned from DuckDB queries.",
  })
);

/**
 * Type for {@link DuckDbRows}.
 *
 * @example
 * ```ts
 * import type { DuckDbRows } from "@beep/duckdb"
 *
 * const rows: DuckDbRows = []
 * void rows
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DuckDbRows = typeof DuckDbRows.Type;
