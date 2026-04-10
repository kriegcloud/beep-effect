/**
 * Minimal engine-agnostic SPARQL query service contract.
 *
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
 * @since 0.0.0
 * @category DomainModel
 */
export const SparqlQueryProfile = LiteralKit(["select", "ask", "construct"] as const).annotate(
  $I.annote("SparqlQueryProfile", {
    description: "Minimal v1 SPARQL profile.",
  })
);

/**
 * SPARQL query request.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
 */
export const SparqlQueryResult = S.Union([SparqlSelectResult, SparqlAskResult, SparqlConstructResult]).annotate(
  $I.annote("SparqlQueryResult", {
    description: "SPARQL result union.",
  })
);

/**
 * Type for {@link SparqlQueryResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SparqlQueryResult = typeof SparqlQueryResult.Type;

/**
 * Typed SPARQL query error.
 *
 * @since 0.0.0
 * @category Errors
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
 * @since 0.0.0
 * @category PortContract
 */
export interface SparqlQueryServiceShape {
  readonly execute: (request: SparqlQueryRequest) => Effect.Effect<SparqlQueryResult, SparqlQueryError>;
}

/**
 * SPARQL query service tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class SparqlQueryService extends Context.Service<SparqlQueryService, SparqlQueryServiceShape>()(
  $I`SparqlQueryService`
) {}

/**
 * Unsupported default live layer for the minimal v1 SPARQL contract.
 *
 * @since 0.0.0
 * @category Layers
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
