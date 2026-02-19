/**
 * LanceDB vector storage service for the codebase search indexer.
 * Wraps LanceDB operations for creating tables, upserting symbol vectors,
 * performing vector searches, and managing the "symbols" table.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, Layer, Order } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as ServiceMap from "effect/ServiceMap";
import * as Str from "effect/String";
import { IndexingError } from "../errors.js";
import type { IndexedSymbol } from "../IndexedSymbol.js";
import { buildKeywordText } from "../IndexedSymbol.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A symbol paired with its embedding vector for storage in LanceDB.
 * @since 0.0.0
 * @category types
 */
export interface SymbolWithVector {
  readonly symbol: IndexedSymbol;
  readonly vector: Float32Array;
}

/**
 * Options for controlling vector similarity search.
 * @since 0.0.0
 * @category types
 */
export interface VectorSearchOptions {
  readonly limit: number;
  readonly kind?: undefined | string;
  readonly package?: undefined | string;
}

/**
 * A single result from a vector similarity search.
 * @since 0.0.0
 * @category types
 */
export interface VectorSearchResult {
  readonly id: string;
  readonly score: number;
  readonly metadataJson: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Shape of the LanceDbWriter service interface.
 * @since 0.0.0
 * @category models
 */
export interface LanceDbWriterShape {
  /**
   * Create or overwrite the "symbols" table.
   * @since 0.0.0
   */
  readonly createTable: () => Effect.Effect<void, IndexingError>;
  /**
   * Delete rows for modified/deleted files, then insert new symbol rows.
   * @since 0.0.0
   */
  readonly upsert: (
    filesToDelete: ReadonlyArray<string>,
    symbols: ReadonlyArray<SymbolWithVector>
  ) => Effect.Effect<void, IndexingError>;
  /**
   * Delete all rows matching the given file paths.
   * @since 0.0.0
   */
  readonly deleteByFiles: (filePaths: ReadonlyArray<string>) => Effect.Effect<void, IndexingError>;
  /**
   * Perform a cosine-distance vector search.
   * @since 0.0.0
   */
  readonly vectorSearch: (
    queryVector: Float32Array,
    options: VectorSearchOptions
  ) => Effect.Effect<ReadonlyArray<VectorSearchResult>, IndexingError>;
  /**
   * Count total rows in the symbols table.
   * @since 0.0.0
   */
  readonly countRows: () => Effect.Effect<number, IndexingError>;
}

/**
 * Service tag for `LanceDbWriter`.
 *
 * Provides vector storage operations for the codebase search indexer using LanceDB.
 *
 * @since 0.0.0
 * @category services
 */
export class LanceDbWriter extends ServiceMap.Service<LanceDbWriter, LanceDbWriterShape>()(
  "@beep/codebase-search/indexer/LanceDbWriter"
) {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** @internal */
const TABLE_NAME = "symbols" as const;

/** @internal */
const symbolToRow = (swv: SymbolWithVector): Record<string, unknown> => {
  const s = swv.symbol;
  return {
    vector: swv.vector,
    id: s.id,
    name: s.name,
    qualified_name: s.qualifiedName,
    file_path: s.filePath,
    start_line: s.startLine,
    end_line: s.endLine,
    kind: s.kind,
    effect_pattern: s.effectPattern,
    package: s.package,
    module: s.module,
    category: s.category,
    domain: s.domain,
    description: s.description,
    title: s.title,
    signature: s.signature,
    since: s.since,
    deprecated: s.deprecated,
    keyword_text: buildKeywordText(s),
    content_hash: s.contentHash,
    indexed_at: s.indexedAt,
    metadata_json: JSON.stringify({
      schemaIdentifier: s.schemaIdentifier,
      schemaDescription: s.schemaDescription,
      remarks: s.remarks,
      moduleDescription: s.moduleDescription,
      examples: s.examples,
      params: s.params,
      returns: s.returns,
      errors: s.errors,
      fieldDescriptions: s.fieldDescriptions,
      seeRefs: s.seeRefs,
      provides: s.provides,
      dependsOn: s.dependsOn,
      imports: s.imports,
      exported: s.exported,
      embeddingText: s.embeddingText,
    }),
  };
};

/** @internal */
const DUMMY_ID = "__dummy__" as const;

/** @internal */
const makeDummyRow = (): Record<string, unknown> => ({
  vector: new Float32Array(768),
  id: DUMMY_ID,
  name: "",
  qualified_name: "",
  file_path: "",
  start_line: 0,
  end_line: 0,
  kind: "",
  effect_pattern: null,
  package: "",
  module: "",
  category: "",
  domain: null,
  description: "",
  title: null,
  signature: "",
  since: "",
  deprecated: false,
  keyword_text: "",
  content_hash: "",
  indexed_at: "",
  metadata_json: "{}",
});

/** @internal */
const buildFilePathPredicate = (filePaths: ReadonlyArray<string>): string => {
  const quoted = pipe(
    filePaths,
    A.map((fp) => `'${Str.replace(/'/g, "''")(fp)}'`)
  );
  return `file_path IN (${A.join(", ")(quoted)})`;
};

// ---------------------------------------------------------------------------
// Live Layer
// ---------------------------------------------------------------------------

/**
 * Live layer for `LanceDbWriter` that connects to a LanceDB database at the
 * specified `indexPath` directory. All operations are wrapped in `IndexingError`.
 *
 * @since 0.0.0
 * @category layers
 */
export const LanceDbWriterLive: (indexPath: string) => Layer.Layer<LanceDbWriter, IndexingError> = (
  indexPath: string
) =>
  Layer.effect(
    LanceDbWriter,
    Effect.gen(function* () {
      const lancedb = yield* Effect.tryPromise({
        try: () => import("@lancedb/lancedb"),
        catch: (error) =>
          new IndexingError({
            message: `Failed to import @lancedb/lancedb: ${String(error)}`,
            phase: "lancedb-init",
          }),
      });

      const connection = yield* Effect.tryPromise({
        try: () => lancedb.connect(indexPath),
        catch: (error) =>
          new IndexingError({
            message: `Failed to connect to LanceDB at ${indexPath}: ${String(error)}`,
            phase: "lancedb-init",
          }),
      });

      let table: Awaited<ReturnType<typeof connection.openTable>> | null = null;

      const getTable = Effect.gen(function* () {
        if (table !== null) return table;
        const opened = yield* Effect.tryPromise({
          try: () => connection.openTable(TABLE_NAME),
          catch: (error) =>
            new IndexingError({
              message: `Failed to open table "${TABLE_NAME}": ${String(error)}`,
              phase: "lancedb-write",
            }),
        });
        table = opened;
        return opened;
      });

      const createTable: LanceDbWriterShape["createTable"] = Effect.fn("LanceDbWriter.createTable")(function* () {
        const tbl = yield* Effect.tryPromise({
          try: () =>
            connection.createTable(TABLE_NAME, [makeDummyRow()], {
              mode: "overwrite",
              existOk: true,
            }),
          catch: (error) =>
            new IndexingError({
              message: `Failed to create table "${TABLE_NAME}": ${String(error)}`,
              phase: "lancedb-write",
            }),
        });
        yield* Effect.tryPromise({
          try: () => tbl.delete(`id = '${DUMMY_ID}'`),
          catch: (error) =>
            new IndexingError({
              message: `Failed to delete dummy row: ${String(error)}`,
              phase: "lancedb-write",
            }),
        });
        table = tbl;
      });

      const upsert: LanceDbWriterShape["upsert"] = Effect.fn("LanceDbWriter.upsert")(
        function* (filesToDelete, symbols) {
          const tbl = yield* getTable;

          // Delete rows for modified/deleted files
          if (A.isReadonlyArrayNonEmpty(filesToDelete)) {
            yield* Effect.tryPromise({
              try: () => tbl.delete(buildFilePathPredicate(filesToDelete)),
              catch: (error) =>
                new IndexingError({
                  message: `Failed to delete rows for files: ${String(error)}`,
                  phase: "lancedb-write",
                }),
            });
          }

          // Insert new rows
          if (A.isReadonlyArrayNonEmpty(symbols)) {
            const rows = A.map(symbols, symbolToRow);
            yield* Effect.tryPromise({
              try: () => tbl.add(rows),
              catch: (error) =>
                new IndexingError({
                  message: `Failed to insert rows: ${String(error)}`,
                  phase: "lancedb-write",
                }),
            });
          }
        }
      );

      const deleteByFiles: LanceDbWriterShape["deleteByFiles"] = Effect.fn("LanceDbWriter.deleteByFiles")(
        function* (filePaths) {
          if (A.isReadonlyArrayNonEmpty(filePaths)) {
            const tbl = yield* getTable;
            yield* Effect.tryPromise({
              try: () => tbl.delete(buildFilePathPredicate(filePaths)),
              catch: (error) =>
                new IndexingError({
                  message: `Failed to delete rows by files: ${String(error)}`,
                  phase: "lancedb-write",
                }),
            });
          }
        }
      );

      const vectorSearch: LanceDbWriterShape["vectorSearch"] = Effect.fn("LanceDbWriter.vectorSearch")(
        function* (queryVector, options) {
          const tbl = yield* getTable;
          const results = yield* Effect.tryPromise({
            try: () => {
              let q = tbl.query().nearestTo(queryVector).distanceType("cosine").limit(options.limit);

              // Build filter clauses
              const filters = A.empty<string>();
              if (options.kind !== undefined) {
                filters.push(`kind = '${options.kind}'`);
              }
              if (options.package !== undefined) {
                filters.push(`package = '${options.package}'`);
              }
              if (A.isArrayNonEmpty(filters)) {
                q = q.where(A.join(" AND ")(filters));
              }

              return q.select(["id", "_distance", "metadata_json"]).toArray();
            },
            catch: (error) =>
              new IndexingError({
                message: `Vector search failed: ${String(error)}`,
                phase: "lancedb-search",
              }),
          });

          return A.map(results as ReadonlyArray<Record<string, unknown>>, (row) => ({
            id: String(row.id),
            score: 1 - Number(row._distance),
            metadataJson: String(row.metadata_json),
          }));
        }
      );

      const countRows: LanceDbWriterShape["countRows"] = Effect.fn("LanceDbWriter.countRows")(function* () {
        const tbl = yield* getTable;
        return yield* Effect.tryPromise({
          try: () => tbl.countRows(),
          catch: (error) =>
            new IndexingError({
              message: `Failed to count rows: ${String(error)}`,
              phase: "lancedb-search",
            }),
        });
      });

      return LanceDbWriter.of({
        createTable,
        upsert,
        deleteByFiles,
        vectorSearch,
        countRows,
      });
    })
  );

// ---------------------------------------------------------------------------
// Mock Layer
// ---------------------------------------------------------------------------

/** @internal */
interface MockRow {
  readonly id: string;
  readonly filePath: string;
  readonly kind: string;
  readonly pkg: string;
  readonly vector: Float32Array;
  readonly metadataJson: string;
}

/** @internal Descending order on score for search results. */
const byScoreDescending: Order.Order<VectorSearchResult> = Order.mapInput(
  Order.flip(Order.Number),
  (r: VectorSearchResult) => r.score
);

/** @internal Compute cosine distance between two Float32Array vectors. */
const cosineDistance = (a: Float32Array, b: Float32Array): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dotProduct += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 1;
  return 1 - dotProduct / magnitude;
};

/**
 * Mock layer for `LanceDbWriter` that uses in-memory storage.
 * Suitable for unit tests without requiring a real LanceDB instance.
 *
 * @since 0.0.0
 * @category layers
 */
export const LanceDbWriterMock: Layer.Layer<LanceDbWriter> = Layer.succeed(
  LanceDbWriter,
  LanceDbWriter.of(
    (() => {
      let rows = A.empty<MockRow>();

      const createTable: LanceDbWriterShape["createTable"] = Effect.fn("LanceDbWriterMock.createTable")(function* () {
        return yield* Effect.sync(() => {
          rows = A.empty<MockRow>();
        });
      });

      const upsert: LanceDbWriterShape["upsert"] = (filesToDelete, symbols) =>
        Effect.sync(() => {
          // Delete by file paths
          if (A.isReadonlyArrayNonEmpty(filesToDelete)) {
            rows = A.filter(rows, (row) => !filesToDelete.includes(row.filePath));
          }
          // Insert new
          const newRows = A.map(
            symbols,
            (swv): MockRow => ({
              id: swv.symbol.id,
              filePath: swv.symbol.filePath,
              kind: swv.symbol.kind,
              pkg: swv.symbol.package,
              vector: swv.vector,
              metadataJson: JSON.stringify({
                schemaIdentifier: swv.symbol.schemaIdentifier,
                schemaDescription: swv.symbol.schemaDescription,
              }),
            })
          );
          rows = pipe(rows, A.appendAll(newRows));
        });

      const deleteByFiles: LanceDbWriterShape["deleteByFiles"] = (filePaths) =>
        Effect.sync(() => {
          if (A.isReadonlyArrayNonEmpty(filePaths)) {
            rows = A.filter(rows, (row) => !filePaths.includes(row.filePath));
          }
        });

      const vectorSearch: LanceDbWriterShape["vectorSearch"] = (queryVector, options) =>
        Effect.sync(() => {
          let filtered = rows as ReadonlyArray<MockRow>;
          if (options.kind !== undefined) {
            filtered = A.filter(filtered, (r) => r.kind === options.kind);
          }
          if (options.package !== undefined) {
            filtered = A.filter(filtered, (r) => r.pkg === options.package);
          }

          const scored = A.map(
            filtered,
            (row): VectorSearchResult => ({
              id: row.id,
              score: 1 - cosineDistance(queryVector, row.vector),
              metadataJson: row.metadataJson,
            })
          );

          const sorted = A.sort(scored, byScoreDescending);

          return A.take(sorted, options.limit);
        });

      const countRows: LanceDbWriterShape["countRows"] = () => Effect.sync(() => A.length(rows));

      return {
        createTable,
        upsert,
        deleteByFiles,
        vectorSearch,
        countRows,
      };
    })()
  )
);
