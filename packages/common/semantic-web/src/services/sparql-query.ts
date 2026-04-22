/**
 * Minimal engine-agnostic SPARQL query service contract.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { Context, Effect, Layer } from "effect";
import * as S from "effect/Schema";
import { Dataset, Term } from "../rdf.ts";
import { makeSemanticSchemaMetadata } from "../semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("services/sparql-query");

const serviceContractMetadata = (canonicalName: string, overview: string) =>
  makeSemanticSchemaMetadata({
    kind: "serviceContract",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "SPARQL 1.1", disposition: "informative" }],
    equivalenceBasis: "Exact query and result equality within a bounded execution envelope.",
    representations: [{ kind: "RDF/JS" }],
  });

/**
 * Minimal v1 SPARQL profile.
 *
 * @example
 * ```ts
 * import { SparqlQueryProfile } from "@beep/semantic-web/services/sparql-query"
 *
 * void SparqlQueryProfile
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const SparqlQueryProfile = LiteralKit(["select", "ask", "construct"] as const).annotate(
  $I.annote("SparqlQueryProfile", {
    description: "Minimal v1 SPARQL profile.",
  })
);

/**
 * SPARQL query request.
 *
 * @example
 * ```ts
 * import { SparqlQueryRequest } from "@beep/semantic-web/services/sparql-query"
 *
 * void SparqlQueryRequest
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class SparqlQueryRequest extends S.Class<SparqlQueryRequest>($I`SparqlQueryRequest`)(
  {
    query: S.NonEmptyString,
    profile: SparqlQueryProfile,
    dataset: Dataset,
    timeoutMs: S.OptionFromOptionalKey(NonNegativeInt),
  },
  $I.annote("SparqlQueryRequest", {
    description: "SPARQL query request.",
    semanticSchemaMetadata: serviceContractMetadata("SparqlQueryRequest", "SPARQL query request."),
  })
) {}

/**
 * SPARQL select result.
 *
 * @example
 * ```ts
 * import { SparqlSelectResult } from "@beep/semantic-web/services/sparql-query"
 *
 * void SparqlSelectResult
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class SparqlSelectResult extends S.Class<SparqlSelectResult>($I`SparqlSelectResult`)(
  {
    profile: S.Literal("select"),
    rows: S.Array(S.Record(S.String, Term)),
  },
  $I.annote("SparqlSelectResult", {
    description: "SPARQL select result.",
    semanticSchemaMetadata: serviceContractMetadata("SparqlSelectResult", "SPARQL select result."),
  })
) {}

/**
 * SPARQL ask result.
 *
 * @example
 * ```ts
 * import { SparqlAskResult } from "@beep/semantic-web/services/sparql-query"
 *
 * void SparqlAskResult
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class SparqlAskResult extends S.Class<SparqlAskResult>($I`SparqlAskResult`)(
  {
    profile: S.Literal("ask"),
    value: S.Boolean,
  },
  $I.annote("SparqlAskResult", {
    description: "SPARQL ask result.",
    semanticSchemaMetadata: serviceContractMetadata("SparqlAskResult", "SPARQL ask result."),
  })
) {}

/**
 * SPARQL construct result.
 *
 * @example
 * ```ts
 * import { SparqlConstructResult } from "@beep/semantic-web/services/sparql-query"
 *
 * void SparqlConstructResult
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class SparqlConstructResult extends S.Class<SparqlConstructResult>($I`SparqlConstructResult`)(
  {
    profile: S.Literal("construct"),
    dataset: Dataset,
  },
  $I.annote("SparqlConstructResult", {
    description: "SPARQL construct result.",
    semanticSchemaMetadata: serviceContractMetadata("SparqlConstructResult", "SPARQL construct result."),
  })
) {}

/**
 * SPARQL result union.
 *
 * @example
 * ```ts
 * import { SparqlQueryResult } from "@beep/semantic-web/services/sparql-query"
 *
 * void SparqlQueryResult
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const SparqlQueryResult = S.Union([SparqlSelectResult, SparqlAskResult, SparqlConstructResult]).annotate(
  $I.annote("SparqlQueryResult", {
    description: "SPARQL result union.",
  })
);

/**
 * Type for {@link SparqlQueryResult}.
 *
 * @example
 * ```ts
 * import type { SparqlQueryResult } from "@beep/semantic-web/services/sparql-query"
 *
 * const acceptSparqlQueryResult = (value: SparqlQueryResult) => value
 * void acceptSparqlQueryResult
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type SparqlQueryResult = typeof SparqlQueryResult.Type;

/**
 * Typed SPARQL query error.
 *
 * @example
 * ```ts
 * import { SparqlQueryError } from "@beep/semantic-web/services/sparql-query"
 *
 * void SparqlQueryError
 * ```
 *
 * @since 0.0.0
 * @category error handling
 */
export class SparqlQueryError extends TaggedErrorClass<SparqlQueryError>($I`SparqlQueryError`)(
  "SparqlQueryError",
  {
    reason: LiteralKit(["unsupportedProfile", "unimplemented"] as const),
    message: S.String,
  },
  $I.annote("SparqlQueryError", {
    description: "Typed SPARQL query error.",
    semanticSchemaMetadata: serviceContractMetadata("SparqlQueryError", "Typed SPARQL query error."),
  })
) {}

/**
 * SPARQL query service contract shape.
 *
 * @example
 * ```ts
 * import type { SparqlQueryServiceShape } from "@beep/semantic-web/services/sparql-query"
 *
 * const acceptSparqlQueryServiceShape = (value: SparqlQueryServiceShape) => value
 * void acceptSparqlQueryServiceShape
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface SparqlQueryServiceShape {
  readonly execute: (request: SparqlQueryRequest) => Effect.Effect<SparqlQueryResult, SparqlQueryError>;
}

/**
 * SPARQL query service tag.
 *
 * @example
 * ```ts
 * import { SparqlQueryService } from "@beep/semantic-web/services/sparql-query"
 *
 * void SparqlQueryService
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class SparqlQueryService extends Context.Service<SparqlQueryService, SparqlQueryServiceShape>()(
  $I`SparqlQueryService`
) {}

/**
 * Unsupported default live layer for the minimal v1 SPARQL contract.
 *
 * @example
 * ```ts
 * import { UnsupportedSparqlQueryServiceLive } from "@beep/semantic-web/services/sparql-query"
 *
 * void UnsupportedSparqlQueryServiceLive
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const UnsupportedSparqlQueryServiceLive = Layer.succeed(
  SparqlQueryService,
  SparqlQueryService.of({
    execute: Effect.fn("SparqlQueryService.execute")(() =>
      Effect.fail(
        new SparqlQueryError({
          reason: "unimplemented",
          message: "No SPARQL engine is wired into the v1 semantic-web package.",
        })
      )
    ),
  })
);
