/**
 * Resolves symbol relationships by querying LanceDB metadata and
 * performing similarity searches. Supports relation types including
 * `similar`, `same-module`, `imports`, `imported-by`, `provides`,
 * and `depends-on`.
 *
 * Currently, only the `similar` relation is fully implemented using
 * vector similarity search. Other relation types require extended
 * LanceDB query capabilities and are stubbed for future implementation.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as ServiceMap from "effect/ServiceMap";
import * as Str from "effect/String";
import { IndexingError, type SymbolNotFoundError } from "../errors.js";
import { EmbeddingService } from "../indexer/EmbeddingService.js";
import { LanceDbWriter } from "../indexer/LanceDbWriter.js";

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
// Live Layer
// ---------------------------------------------------------------------------

/**
 * Live layer for `RelationResolver` that uses `LanceDbWriter` for vector
 * searches and `EmbeddingService` for generating query vectors.
 *
 * Currently supports:
 * - `similar`: finds semantically similar symbols via vector search
 *
 * Stubbed (returns empty arrays):
 * - `same-module`: requires LanceDB module field filtering (not yet available)
 * - `imports`: requires metadataJson imports field parsing
 * - `imported-by`: requires reverse import lookup
 * - `provides`: requires metadataJson provides field parsing
 * - `depends-on`: requires metadataJson dependsOn field parsing
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

      const resolveSimilar = Effect.fn(function* (config: RelationResolverConfig) {
        // Embed the symbol ID as a proxy for its content vector
        const queryVector = yield* pipe(
          embeddingSvc.embed(config.symbolId),
          Effect.mapError(
            (e) =>
              new IndexingError({
                message: `Relation resolver embedding failed: ${e.message}`,
                phase: "relation-resolve",
              })
          )
        );

        // Fetch one extra to account for the source symbol being in results
        const results = yield* lanceSvc.vectorSearch(queryVector, {
          limit: config.limit + 1,
        });

        // Filter out the source symbol and map to RelatedSymbol
        const filtered = A.filter(results, (r) => r.id !== config.symbolId);
        const limited = A.take(filtered, config.limit);

        return A.map(
          limited,
          (r): RelatedSymbol => ({
            id: r.id,
            name: extractNameFromId(r.id),
            kind: "unknown",
            package: extractPackageFromId(r.id),
            module: extractModuleFromId(r.id),
            filePath: "",
            startLine: 0,
            description: "",
            relationDetail: `Similar symbol (vector similarity score: ${String(r.score.toFixed(3))})`,
          })
        );
      });

      const resolve: RelationResolverShape["resolve"] = Effect.fn("RelationResolver.resolve")(function* (config) {
        switch (config.relation) {
          case "similar":
            return yield* resolveSimilar(config);

          // TODO: Implement same-module once LanceDB supports filtering by
          // the `module` column directly. Currently the vectorSearch API only
          // supports `kind` and `package` filters.
          case "same-module":
            return A.empty<RelatedSymbol>();

          // TODO: Implement imports once LanceDB query interface supports
          // filtering by JSON fields within metadataJson.
          case "imports":
            return A.empty<RelatedSymbol>();

          // TODO: Implement imported-by once reverse import lookup is available.
          case "imported-by":
            return A.empty<RelatedSymbol>();

          // TODO: Implement provides once metadataJson field queries are supported.
          case "provides":
            return A.empty<RelatedSymbol>();

          // TODO: Implement depends-on once metadataJson field queries are supported.
          case "depends-on":
            return A.empty<RelatedSymbol>();
        }
      });

      return RelationResolver.of({ resolve });
    })
  );

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extract the simple name from a symbol ID of the form `{pkg}/{module}/{name}`.
 * @internal
 */
const extractNameFromId = (id: string): string => {
  const parts = id.split("/");
  return parts.length > 0 ? (parts[parts.length - 1] ?? id) : id;
};

/**
 * Extract the package from a symbol ID of the form `@scope/pkg/module/name`.
 * @internal
 */
const extractPackageFromId = (id: string): string => {
  const parts = id.split("/");
  if (parts.length >= 2 && (parts[0] ?? "").startsWith("@")) {
    return `${parts[0]}/${parts[1]}`;
  }
  return parts.length > 0 ? (parts[0] ?? id) : id;
};

/**
 * Extract the module from a symbol ID of the form `@scope/pkg/module/name`.
 * @internal
 */
const extractModuleFromId = (id: string): string => {
  const parts = Str.split("/")(id);
  if (parts.length >= 3 && Str.startsWith("@")(parts[0] ?? "")) {
    return parts[2] ?? "";
  }
  if (parts.length >= 2) {
    return parts[1] ?? "";
  }
  return "";
};
