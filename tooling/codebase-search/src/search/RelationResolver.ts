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
import * as O from "effect/Option";
import * as ServiceMap from "effect/ServiceMap";
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

/** @internal */
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

/** @internal */
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

/** @internal */
const lastSegment = (value: string): string => {
  const idx = value.lastIndexOf("/");
  return idx >= 0 ? value.slice(idx + 1) : value;
};

/** @internal */
const buildRowMaps = (
  rows: ReadonlyArray<StoredSymbolRecord>
): {
  readonly byId: Map<string, StoredSymbolRecord>;
  readonly byName: Map<string, ReadonlyArray<StoredSymbolRecord>>;
} => {
  const byId = new Map<string, StoredSymbolRecord>();
  const byNameMutable = new Map<string, Array<StoredSymbolRecord>>();

  for (const row of rows) {
    byId.set(row.id, row);
    const existing = byNameMutable.get(row.name);
    if (existing !== undefined) {
      existing.push(row);
    } else {
      byNameMutable.set(row.name, [row]);
    }
  }

  const byName = new Map<string, ReadonlyArray<StoredSymbolRecord>>();
  for (const [name, symbolRows] of byNameMutable) {
    byName.set(name, symbolRows);
  }

  return { byId, byName };
};

/** @internal */
const resolveReferenceRows = (
  references: ReadonlyArray<string>,
  relationLabel: string,
  maps: {
    readonly byId: Map<string, StoredSymbolRecord>;
    readonly byName: Map<string, ReadonlyArray<StoredSymbolRecord>>;
  }
): ReadonlyArray<RelatedSymbol> => {
  const matches = A.empty<RelatedSymbol>();

  for (const reference of references) {
    const byId = maps.byId.get(reference);
    if (byId !== undefined) {
      matches.push(toRelated(byId, `${relationLabel}: resolved symbol ID '${reference}'.`));
      continue;
    }

    const byExactName = maps.byName.get(reference);
    if (byExactName !== undefined && A.isReadonlyArrayNonEmpty(byExactName)) {
      for (const row of byExactName) {
        matches.push(toRelated(row, `${relationLabel}: matched '${reference}' by symbol name.`));
      }
      continue;
    }

    const fallbackName = lastSegment(reference);
    const byFallbackName = maps.byName.get(fallbackName);
    if (byFallbackName !== undefined && A.isReadonlyArrayNonEmpty(byFallbackName)) {
      for (const row of byFallbackName) {
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

        switch (config.relation) {
          case "imports": {
            const related = resolveReferenceRows(sourceRow.metadata.imports, "imports", maps);
            return A.take(related, config.limit);
          }

          case "imported-by": {
            const related = pipe(
              allRows,
              A.filter((row) => row.id !== sourceRow.id),
              A.filter(
                (row) =>
                  row.metadata.imports.includes(sourceRow.id) ||
                  row.metadata.imports.includes(sourceRow.name) ||
                  row.metadata.imports.includes(lastSegment(sourceRow.id))
              ),
              A.map((row) => toRelated(row, `imported-by: '${row.id}' imports '${sourceRow.id}'.`))
            );
            return A.take(dedupeRelated(related), config.limit);
          }

          case "same-module": {
            const related = pipe(
              allRows,
              A.filter((row) => row.id !== sourceRow.id),
              A.filter((row) => row.package === sourceRow.package && row.module === sourceRow.module),
              A.map((row) => toRelated(row, `same-module: '${row.module}'.`))
            );
            return A.take(related, config.limit);
          }

          case "provides": {
            const related = resolveReferenceRows(sourceRow.metadata.provides, "@provides", maps);
            return A.take(related, config.limit);
          }

          case "depends-on": {
            const related = resolveReferenceRows(sourceRow.metadata.dependsOn, "@depends", maps);
            return A.take(related, config.limit);
          }

          case "similar": {
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
                  O.fromNullishOr(maps.byId.get(result.id)),
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
          }
        }
      });

      return RelationResolver.of({ resolve });
    })
  );
