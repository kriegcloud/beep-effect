/**
 * Resolves symbol relationships from indexed metadata and vector similarity.
 *
 * Supports:
 * - `imports`
 * - `imported-by`
 * - `same-module`
 * - `similar`
 * - `provides`
 * - `depends-on`
 *
 * @since 0.0.0
 * @module
 */
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as ServiceMap from "effect/ServiceMap";
import * as Str from "effect/String";
import { type EmbeddingModelError, IndexingError, SymbolNotFoundError } from "../errors.js";
import { EmbeddingService, LanceDbWriter, type StoredSymbolRecord } from "../indexer/index.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The kind of relationship to resolve between symbols.
 *
 * @since 0.0.0
 * @category types
 */
export type RelationType = "imports" | "imported-by" | "same-module" | "similar" | "provides" | "depends-on";

/**
 * A symbol found via relationship resolution, including metadata and
 * a human-readable description of how it relates to the source symbol.
 *
 * @since 0.0.0
 * @category types
 */
export interface RelatedSymbol {
  /** The unique symbol identifier. */
  readonly id: string;
  /** The symbol's simple name. */
  readonly name: string;
  /** The symbol kind (e.g. "schema", "service"). */
  readonly kind: string;
  /** The package name. */
  readonly package: string;
  /** The module name within the package. */
  readonly module: string;
  /** The file path where the symbol is defined. */
  readonly filePath: string;
  /** The 1-based start line number. */
  readonly startLine: number;
  /** A short description of the symbol. */
  readonly description: string;
  /** Human-readable detail about the relationship. */
  readonly relationDetail: string;
}

/**
 * Configuration for a relation resolution query.
 *
 * @since 0.0.0
 * @category types
 */
export interface RelationResolverConfig {
  /** The source symbol's unique identifier. */
  readonly symbolId: string;
  /** The type of relationship to resolve. */
  readonly relation: RelationType;
  /** Maximum number of related symbols to return. */
  readonly limit: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Shape of the RelationResolver service interface.
 *
 * @since 0.0.0
 * @category models
 */
export interface RelationResolverShape {
  /**
   * Resolve related symbols for a given source symbol and relation type.
   *
   * @since 0.0.0
   */
  readonly resolve: (
    config: RelationResolverConfig
  ) => Effect.Effect<ReadonlyArray<RelatedSymbol>, IndexingError | SymbolNotFoundError>;
}

/**
 * Service tag for `RelationResolver`.
 *
 * Resolves symbol relationships by querying the search index.
 *
 * @since 0.0.0
 * @category services
 */
export class RelationResolver extends ServiceMap.Service<RelationResolver, RelationResolverShape>()(
  "@beep/codebase-search/search/RelationResolver"
) {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * @param row row parameter value.
 * @param relationDetail relationDetail parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const toRelated = (row: StoredSymbolRecord, relationDetail: string): RelatedSymbol => ({
  id: row.id,
  name: row.name,
  kind: row.kind,
  package: row.package,
  module: row.module,
  filePath: row.filePath,
  startLine: row.startLine,
  description: row.description,
  relationDetail,
});

/**
 * @param symbols symbols parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const dedupeRelated = (symbols: ReadonlyArray<RelatedSymbol>): ReadonlyArray<RelatedSymbol> => {
  const seen = new Set<string>();
  const results = A.empty<RelatedSymbol>();
  for (const symbol of symbols) {
    if (seen.has(symbol.id)) {
      continue;
    }
    seen.add(symbol.id);
    results.push(symbol);
  }
  return results;
};

/**
 * @param value value parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const lastSegment = (value: string): string => {
  const idx = value.lastIndexOf("/");
  return idx >= 0 ? Str.slice(idx + 1)(value) : value;
};

/**
 * @param rows rows parameter value.
 * @internal
 * @returns Returns the computed value.
 */
const buildRowMaps = (
  rows: ReadonlyArray<StoredSymbolRecord>
): {
  readonly byId: MutableHashMap.MutableHashMap<string, StoredSymbolRecord>;
  readonly byName: MutableHashMap.MutableHashMap<string, Array<StoredSymbolRecord>>;
} => {
  const byId = MutableHashMap.empty<string, StoredSymbolRecord>();
  const byName = MutableHashMap.empty<string, Array<StoredSymbolRecord>>();

  for (const row of rows) {
    MutableHashMap.set(byId, row.id, row);
    const existing = MutableHashMap.get(byName, row.name);
    if (O.isSome(existing)) {
      existing.value.push(row);
    } else {
      MutableHashMap.set(byName, row.name, [row]);
    }
  }

  return { byId, byName };
};

/**
 * @param references references parameter value.
 * @param relationLabel relationLabel parameter value.
 * @param maps maps parameter value.
 * @param maps.byId byId field value.
 * @param maps.byName byName field value.
 * @internal
 * @returns Returns the computed value.
 */
const resolveReferenceRows = (
  references: ReadonlyArray<string>,
  relationLabel: string,
  maps: {
    readonly byId: MutableHashMap.MutableHashMap<string, StoredSymbolRecord>;
    readonly byName: MutableHashMap.MutableHashMap<string, Array<StoredSymbolRecord>>;
  }
): ReadonlyArray<RelatedSymbol> => {
  const matches = A.empty<RelatedSymbol>();

  for (const reference of references) {
    const byId = MutableHashMap.get(maps.byId, reference);
    if (O.isSome(byId)) {
      matches.push(toRelated(byId.value, `${relationLabel}: resolved symbol ID '${reference}'.`));
      continue;
    }

    const byExactName = MutableHashMap.get(maps.byName, reference);
    if (O.isSome(byExactName) && A.isReadonlyArrayNonEmpty(byExactName.value)) {
      for (const row of byExactName.value) {
        matches.push(toRelated(row, `${relationLabel}: matched '${reference}' by symbol name.`));
      }
      continue;
    }

    const fallbackName = lastSegment(reference);
    const byFallbackName = MutableHashMap.get(maps.byName, fallbackName);
    if (O.isSome(byFallbackName) && A.isReadonlyArrayNonEmpty(byFallbackName.value)) {
      for (const row of byFallbackName.value) {
        matches.push(
          toRelated(row, `${relationLabel}: matched reference '${reference}' by fallback name '${fallbackName}'.`)
        );
      }
    }
  }

  return dedupeRelated(matches);
};

// ---------------------------------------------------------------------------
// Live Layer
// ---------------------------------------------------------------------------

/**
 * Live layer for `RelationResolver` that uses `LanceDbWriter` for graph data
 * and vector search, plus `EmbeddingService` for `similar` relation queries.
 *
 * @since 0.0.0
 * @category layers
 */
export const RelationResolverLive: Layer.Layer<RelationResolver, never, LanceDbWriter | EmbeddingService> =
  Layer.effect(
    RelationResolver,
    Effect.gen(function* () {
      const embeddingSvc = yield* EmbeddingService;
      const lanceSvc = yield* LanceDbWriter;

      const resolve: RelationResolverShape["resolve"] = Effect.fn("RelationResolver.resolve")(function* (config) {
        const sourceRow = yield* pipe(
          lanceSvc.getById(config.symbolId),
          Effect.flatMap((rowOpt) =>
            pipe(
              rowOpt,
              O.match({
                onNone: () =>
                  Effect.fail(
                    new SymbolNotFoundError({
                      message: `Symbol not found: ${config.symbolId}`,
                      symbolId: config.symbolId,
                    })
                  ),
                onSome: (row) => Effect.succeed(row),
              })
            )
          )
        );

        const allRows = yield* lanceSvc.list();
        const maps = buildRowMaps(allRows);

        const relationEffect = Match.value(config.relation).pipe(
          Match.when("imports", () =>
            Effect.succeed(A.take(resolveReferenceRows(sourceRow.metadata.imports, "imports", maps), config.limit))
          ),
          Match.when("imported-by", () =>
            Effect.succeed(
              pipe(
                allRows,
                A.filter((row) => row.id !== sourceRow.id),
                A.filter(
                  (row) =>
                    row.metadata.imports.includes(sourceRow.id) ||
                    row.metadata.imports.includes(sourceRow.name) ||
                    row.metadata.imports.includes(lastSegment(sourceRow.id))
                ),
                A.map((row) => toRelated(row, `imported-by: '${row.id}' imports '${sourceRow.id}'.`)),
                dedupeRelated,
                (related) => A.take(related, config.limit)
              )
            )
          ),
          Match.when("same-module", () =>
            Effect.succeed(
              pipe(
                allRows,
                A.filter((row) => row.id !== sourceRow.id),
                A.filter((row) => row.package === sourceRow.package && row.module === sourceRow.module),
                A.map((row) => toRelated(row, `same-module: '${row.module}'.`)),
                (related) => A.take(related, config.limit)
              )
            )
          ),
          Match.when("provides", () =>
            Effect.succeed(A.take(resolveReferenceRows(sourceRow.metadata.provides, "@provides", maps), config.limit))
          ),
          Match.when("depends-on", () =>
            Effect.succeed(A.take(resolveReferenceRows(sourceRow.metadata.dependsOn, "@depends", maps), config.limit))
          ),
          Match.when("similar", () =>
            Effect.gen(function* () {
              const queryText =
                sourceRow.description.length > 0
                  ? `${sourceRow.name} ${sourceRow.description}`
                  : `${sourceRow.id} ${sourceRow.signature}`;

              const queryVector = yield* pipe(
                embeddingSvc.embed(queryText),
                Effect.mapError(
                  (error: EmbeddingModelError) =>
                    new IndexingError({
                      message: `Relation resolver embedding failed: ${error.message}`,
                      phase: "relation-resolve",
                    })
                )
              );

              const vectorResults = yield* lanceSvc.vectorSearch(queryVector, {
                limit: config.limit + 1,
              });

              const related = pipe(
                vectorResults,
                A.filter((result) => result.id !== sourceRow.id),
                A.map((result) =>
                  pipe(
                    MutableHashMap.get(maps.byId, result.id),
                    O.map((row) =>
                      toRelated(
                        row,
                        `similar: vector similarity score ${String(Math.round(result.score * 1000) / 1000)}.`
                      )
                    )
                  )
                ),
                A.getSomes
              );

              return A.take(dedupeRelated(related), config.limit);
            })
          ),
          Match.exhaustive
        );

        return yield* relationEffect;
      });

      return RelationResolver.of({ resolve });
    })
  );
