/**
 * BM25 keyword search service for the codebase search indexer.
 * Wraps wink-bm25-text-search for building, querying, and persisting
 * a keyword-based search index alongside the vector search index.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as ServiceMap from "effect/ServiceMap";
import * as Str from "effect/String";
import createBM25, { type BM25SearchResult as RawBM25Result } from "wink-bm25-text-search";
import { IndexingError } from "../errors.js";
import type { IndexedSymbol } from "../IndexedSymbol.js";
import { buildKeywordText } from "../IndexedSymbol.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single result from a BM25 keyword search.
 * @since 0.0.0
 * @category types
 */
export interface Bm25SearchResult {
  readonly symbolId: string;
  readonly score: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Shape of the Bm25Writer service interface.
 * @since 0.0.0
 * @category models
 */
export interface Bm25WriterShape {
  /**
   * Create a fresh BM25 index, resetting any existing state.
   * @since 0.0.0
   */
  readonly createIndex: () => Effect.Effect<void, IndexingError>;
  /**
   * Add indexed symbols to the BM25 index.
   * @since 0.0.0
   */
  readonly addDocuments: (symbols: ReadonlyArray<IndexedSymbol>) => Effect.Effect<void, IndexingError>;
  /**
   * Remove documents by their symbol IDs.
   * @since 0.0.0
   */
  readonly removeBySymbolIds: (ids: ReadonlyArray<string>) => Effect.Effect<void, IndexingError>;
  /**
   * Search the BM25 index for matching documents.
   * @since 0.0.0
   */
  readonly search: (query: string, limit: number) => Effect.Effect<ReadonlyArray<Bm25SearchResult>, IndexingError>;
  /**
   * Persist the BM25 index to disk.
   * @since 0.0.0
   */
  readonly save: () => Effect.Effect<void, IndexingError, FileSystem.FileSystem | Path.Path>;
  /**
   * Load the BM25 index from disk.
   * @since 0.0.0
   */
  readonly load: () => Effect.Effect<void, IndexingError, FileSystem.FileSystem | Path.Path>;
}

/**
 * Service tag for `Bm25Writer`.
 *
 * Provides BM25 keyword search operations for the codebase search indexer.
 *
 * @since 0.0.0
 * @category services
 */
export class Bm25Writer extends ServiceMap.Service<Bm25Writer, Bm25WriterShape>()(
  "@beep/codebase-search/indexer/Bm25Writer"
) {}

// ---------------------------------------------------------------------------
// BM25 Configuration
// ---------------------------------------------------------------------------

/** @internal */
const BM25_K1 = 1.2;

/** @internal */
const BM25_B = 0.75;

/** @internal */
const BM25_INDEX_FILE = "bm25-index.json" as const;

/**
 * Tokenizer for BM25 indexing. Splits camelCase, replaces non-alphanumeric
 * with space, lowercases, splits on whitespace, and filters tokens > 1 char.
 * @internal
 */
const tokenize = (text: string): ReadonlyArray<string> => {
  // Split camelCase: insert space before uppercase letters preceded by lowercase
  const camelSplit = Str.replace(/([a-z])([A-Z])/g, "$1 $2")(text);
  // Replace non-alphanumeric with space
  const cleaned = Str.replace(/[^a-zA-Z0-9]/g, " ")(camelSplit);
  // Lowercase and split on whitespace
  const tokens = pipe(cleaned, Str.toLowerCase, Str.split(/\s+/));
  // Filter tokens > 1 char
  return pipe(
    tokens,
    A.filter((t) => t.length > 1)
  );
};

// ---------------------------------------------------------------------------
// Persistence Schema
// ---------------------------------------------------------------------------

/** @internal */
const Bm25PersistenceRecord = S.Struct({
  exportedJSON: S.String,
  docMapping: S.Record(S.String, S.String),
}).annotate({
  identifier: "@beep/codebase-search/indexer/Bm25Writer/Bm25PersistenceRecord",
  title: "BM25 Persistence Record",
  description: "Serialized BM25 index state including the engine JSON and document-to-symbol mapping.",
});

/** @internal */
type Bm25PersistenceRecord = typeof Bm25PersistenceRecord.Type;

/** @internal Schema for JSON string <-> decoded persistence record */
const Bm25PersistenceFromJson = S.fromJsonString(Bm25PersistenceRecord);

// ---------------------------------------------------------------------------
// Internal State
// ---------------------------------------------------------------------------

/** @internal */
interface Bm25State {
  engine: ReturnType<typeof createBM25>;
  /** symbolId -> docId */
  symbolToDoc: MutableHashMap.MutableHashMap<string, number>;
  /** docId -> symbolId */
  docToSymbol: MutableHashMap.MutableHashMap<number, string>;
  nextDocId: number;
  consolidated: boolean;
}

/** @internal */
const initEngine = (): ReturnType<typeof createBM25> => {
  const engine = createBM25();
  engine.defineConfig({
    fldWeights: { body: 1 },
    bm25Params: { k1: BM25_K1, b: BM25_B },
  });
  engine.definePrepTasks([tokenize]);
  return engine;
};

/** @internal */
const createState = (): Bm25State => ({
  engine: initEngine(),
  symbolToDoc: MutableHashMap.empty<string, number>(),
  docToSymbol: MutableHashMap.empty<number, string>(),
  nextDocId: 0,
  consolidated: false,
});

/** @internal Convert raw BM25 search results to typed Bm25SearchResult array */
const convertSearchResults = (
  rawResults: ReadonlyArray<RawBM25Result>,
  docToSymbol: MutableHashMap.MutableHashMap<number, string>
): ReadonlyArray<Bm25SearchResult> =>
  pipe(
    rawResults,
    A.map((result): O.Option<Bm25SearchResult> => {
      const docId = Number(result[0]);
      const symbolIdOpt = MutableHashMap.get(docToSymbol, docId);
      return pipe(
        symbolIdOpt,
        O.map(
          (symbolId): Bm25SearchResult => ({
            symbolId,
            score: result[1],
          })
        )
      );
    }),
    A.getSomes
  );

// ---------------------------------------------------------------------------
// Live Layer
// ---------------------------------------------------------------------------

/**
 * Live layer for `Bm25Writer` that manages a BM25 keyword search index
 * at the specified `indexPath` directory.
 *
 * @since 0.0.0
 * @category layers
 */
export const Bm25WriterLive: (indexPath: string) => Layer.Layer<Bm25Writer, IndexingError> = (indexPath: string) =>
  Layer.effect(
    Bm25Writer,
    Effect.gen(function* () {
      let state = createState();

      const createIndex: Bm25WriterShape["createIndex"] = Effect.fn("Bm25Writer.createIndex")(function* () {
        return yield* Effect.sync(() => {
          state = createState();
        });
      });

      const addDocuments: Bm25WriterShape["addDocuments"] = Effect.fn("Bm25Writer.addDocuments")(function* (symbols) {
        return yield* Effect.try({
          try: () => {
            pipe(
              symbols,
              A.forEach((symbol) => {
                const docId = state.nextDocId;
                state.nextDocId = state.nextDocId + 1;
                MutableHashMap.set(state.symbolToDoc, symbol.id, docId);
                MutableHashMap.set(state.docToSymbol, docId, symbol.id);
                state.engine.addDoc({ body: buildKeywordText(symbol) }, docId);
              })
            );
            state.consolidated = false;
          },
          catch: (error) =>
            new IndexingError({
              message: `Failed to add documents to BM25 index: ${String(error)}`,
              phase: "bm25-index",
            }),
        });
      });

      const removeBySymbolIds: Bm25WriterShape["removeBySymbolIds"] = Effect.fn("Bm25Writer.removeBySymbolIds")(
        function* (ids) {
          return yield* Effect.sync(() => {
            // Only remove from the mapping; the engine data remains but removed
            // symbol IDs will be filtered out of search results via the mapping.
            pipe(
              ids,
              A.forEach((symbolId) => {
                const docIdOpt = MutableHashMap.get(state.symbolToDoc, symbolId);
                if (O.isSome(docIdOpt)) {
                  MutableHashMap.remove(state.docToSymbol, docIdOpt.value);
                  MutableHashMap.remove(state.symbolToDoc, symbolId);
                }
              })
            );
          });
        }
      );

      const search: Bm25WriterShape["search"] = Effect.fn("Bm25Writer.search")(function* (query, limit) {
        return yield* Effect.try({
          try: () => {
            if (!state.consolidated) {
              state.engine.consolidate();
              state.consolidated = true;
            }
            const rawResults = state.engine.search(query, limit);
            return convertSearchResults(rawResults, state.docToSymbol);
          },
          catch: (error) =>
            new IndexingError({
              message: `BM25 search failed: ${String(error)}`,
              phase: "bm25-search",
            }),
        });
      });

      const save: Bm25WriterShape["save"] = Effect.fn("Bm25Writer.save")(function* () {
        if (!state.consolidated) {
          state.engine.consolidate();
          state.consolidated = true;
        }

        // Build docMapping from MutableHashMap
        const docMapping = R.empty<string, string>();
        for (const [docId, symbolId] of state.docToSymbol) {
          docMapping[String(docId)] = symbolId;
        }

        const record: Bm25PersistenceRecord = {
          exportedJSON: state.engine.exportJSON(),
          docMapping,
        };

        const json = yield* pipe(
          S.encodeUnknownEffect(Bm25PersistenceFromJson)(record),
          Effect.mapError(
            (error) =>
              new IndexingError({
                message: `Failed to encode BM25 persistence record: ${String(error)}`,
                phase: "bm25-persist",
              })
          )
        );

        const fs = yield* FileSystem.FileSystem;
        const pathSvc = yield* Path.Path;
        const filePath = pathSvc.join(indexPath, BM25_INDEX_FILE);

        yield* pipe(
          fs.writeFileString(filePath, json),
          Effect.mapError(
            (error) =>
              new IndexingError({
                message: `Failed to write BM25 index file: ${String(error)}`,
                phase: "bm25-persist",
              })
          )
        );
      });

      const load: Bm25WriterShape["load"] = Effect.fn("Bm25Writer.load")(function* () {
        const fs = yield* FileSystem.FileSystem;
        const pathSvc = yield* Path.Path;
        const filePath = pathSvc.join(indexPath, BM25_INDEX_FILE);

        const json = yield* pipe(
          fs.readFileString(filePath),
          Effect.mapError(
            (error) =>
              new IndexingError({
                message: `Failed to read BM25 index file: ${String(error)}`,
                phase: "bm25-persist",
              })
          )
        );

        const record = yield* pipe(
          S.decodeUnknownEffect(Bm25PersistenceFromJson)(json),
          Effect.mapError(
            (error) =>
              new IndexingError({
                message: `Failed to decode BM25 persistence record: ${String(error)}`,
                phase: "bm25-persist",
              })
          )
        );

        // Restore engine
        const engine = initEngine();
        engine.importJSON(record.exportedJSON);

        // Restore mappings
        const symbolToDoc = MutableHashMap.empty<string, number>();
        const docToSymbol = MutableHashMap.empty<number, string>();
        let maxDocId = 0;

        const entries = Object.entries(record.docMapping);
        pipe(
          entries,
          A.forEach(([docIdStr, symbolId]) => {
            const docId = Number(docIdStr);
            MutableHashMap.set(symbolToDoc, symbolId, docId);
            MutableHashMap.set(docToSymbol, docId, symbolId);
            if (docId >= maxDocId) {
              maxDocId = docId + 1;
            }
          })
        );

        state = {
          engine,
          symbolToDoc,
          docToSymbol,
          nextDocId: maxDocId,
          consolidated: true,
        };
      });

      return Bm25Writer.of({
        createIndex,
        addDocuments,
        removeBySymbolIds,
        search,
        save,
        load,
      });
    })
  );

// ---------------------------------------------------------------------------
// Mock Layer
// ---------------------------------------------------------------------------

/**
 * Mock layer for `Bm25Writer` that uses an actual wink-bm25 engine in memory
 * without persistence. Suitable for unit tests.
 *
 * @since 0.0.0
 * @category layers
 */
export const Bm25WriterMock: Layer.Layer<Bm25Writer> = Layer.succeed(
  Bm25Writer,
  Bm25Writer.of(
    (() => {
      let state = createState();

      const createIndex: Bm25WriterShape["createIndex"] = () =>
        Effect.sync(() => {
          state = createState();
        });

      const addDocuments: Bm25WriterShape["addDocuments"] = (symbols) =>
        Effect.try({
          try: () => {
            pipe(
              symbols,
              A.forEach((symbol) => {
                const docId = state.nextDocId;
                state.nextDocId = state.nextDocId + 1;
                MutableHashMap.set(state.symbolToDoc, symbol.id, docId);
                MutableHashMap.set(state.docToSymbol, docId, symbol.id);
                state.engine.addDoc({ body: buildKeywordText(symbol) }, docId);
              })
            );
            state.consolidated = false;
          },
          catch: (error) =>
            new IndexingError({
              message: `Mock BM25 addDocuments failed: ${String(error)}`,
              phase: "bm25-index",
            }),
        });

      const removeBySymbolIds: Bm25WriterShape["removeBySymbolIds"] = (ids) =>
        Effect.sync(() => {
          // Only remove from the mapping; the engine data remains but removed
          // symbol IDs will be filtered out of search results via the mapping.
          pipe(
            ids,
            A.forEach((symbolId) => {
              const docIdOpt = MutableHashMap.get(state.symbolToDoc, symbolId);
              if (O.isSome(docIdOpt)) {
                MutableHashMap.remove(state.docToSymbol, docIdOpt.value);
                MutableHashMap.remove(state.symbolToDoc, symbolId);
              }
            })
          );
        });

      const search: Bm25WriterShape["search"] = (query, limit) =>
        Effect.try({
          try: () => {
            if (!state.consolidated) {
              state.engine.consolidate();
              state.consolidated = true;
            }
            const rawResults = state.engine.search(query, limit);
            return convertSearchResults(rawResults, state.docToSymbol);
          },
          catch: (error) =>
            new IndexingError({
              message: `Mock BM25 search failed: ${String(error)}`,
              phase: "bm25-search",
            }),
        });

      const save: Bm25WriterShape["save"] = () => Effect.void;

      const load: Bm25WriterShape["load"] = () => Effect.void;

      return {
        createIndex,
        addDocuments,
        removeBySymbolIds,
        search,
        save,
        load,
      };
    })()
  )
);
