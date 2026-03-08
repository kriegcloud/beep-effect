/**
 * JSON-LD context service contract.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { type Effect, ServiceMap } from "effect";
import * as S from "effect/Schema";
import { IRIReference } from "../iri.ts";
import { JsonLdContext } from "../jsonld.ts";
import { makeSemanticSchemaMetadata } from "../semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("services/jsonld-context");

const serviceContractMetadata = (canonicalName: string, overview: string) =>
  makeSemanticSchemaMetadata({
    kind: "serviceContract",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "JSON-LD 1.1", section: "Context Processing", disposition: "normative" }],
    equivalenceBasis: "Request and result wrappers compare by exact payload equality.",
    representations: [{ kind: "JSON-LD" }],
  });

/**
 * JSON-LD context error reason.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsonLdContextErrorReason = LiteralKit([
  "unknownTerm",
  "policyViolation",
  "compactionFailure",
] as const).annotate(
  $I.annote("JsonLdContextErrorReason", {
    description: "JSON-LD context error reason.",
  })
);

/**
 * Typed JSON-LD context service error.
 *
 * @since 0.0.0
 * @category Errors
 */
export class JsonLdContextError extends TaggedErrorClass<JsonLdContextError>($I`JsonLdContextError`)(
  "JsonLdContextError",
  {
    reason: JsonLdContextErrorReason,
    subject: S.OptionFromOptionalKey(S.String),
    message: S.String,
  },
  $I.annote("JsonLdContextError", {
    description: "Typed JSON-LD context service error.",
    semanticSchemaMetadata: serviceContractMetadata("JsonLdContextError", "Typed JSON-LD context service error."),
  })
) {}

/**
 * Normalize JSON-LD context request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class NormalizeJsonLdContextRequest extends S.Class<NormalizeJsonLdContextRequest>(
  $I`NormalizeJsonLdContextRequest`
)(
  {
    context: JsonLdContext,
  },
  $I.annote("NormalizeJsonLdContextRequest", {
    description: "Normalize JSON-LD context request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "NormalizeJsonLdContextRequest",
      "Request to normalize a bounded JSON-LD context."
    ),
  })
) {}

/**
 * Expand JSON-LD term request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ExpandJsonLdTermRequest extends S.Class<ExpandJsonLdTermRequest>($I`ExpandJsonLdTermRequest`)(
  {
    context: JsonLdContext,
    term: S.NonEmptyString,
  },
  $I.annote("ExpandJsonLdTermRequest", {
    description: "Expand JSON-LD term request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "ExpandJsonLdTermRequest",
      "Request to expand a bounded JSON-LD term."
    ),
  })
) {}

/**
 * Expand JSON-LD term result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ExpandJsonLdTermResult extends S.Class<ExpandJsonLdTermResult>($I`ExpandJsonLdTermResult`)(
  {
    term: S.NonEmptyString,
    iri: IRIReference,
  },
  $I.annote("ExpandJsonLdTermResult", {
    description: "Expand JSON-LD term result.",
    semanticSchemaMetadata: serviceContractMetadata("ExpandJsonLdTermResult", "Expanded bounded JSON-LD term result."),
  })
) {}

/**
 * Compact JSON-LD IRI request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CompactJsonLdIriRequest extends S.Class<CompactJsonLdIriRequest>($I`CompactJsonLdIriRequest`)(
  {
    context: JsonLdContext,
    iri: IRIReference,
  },
  $I.annote("CompactJsonLdIriRequest", {
    description: "Compact JSON-LD IRI request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "CompactJsonLdIriRequest",
      "Request to compact a bounded JSON-LD IRI."
    ),
  })
) {}

/**
 * Compact JSON-LD IRI result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CompactJsonLdIriResult extends S.Class<CompactJsonLdIriResult>($I`CompactJsonLdIriResult`)(
  {
    iri: IRIReference,
    term: S.NonEmptyString,
  },
  $I.annote("CompactJsonLdIriResult", {
    description: "Compact JSON-LD IRI result.",
    semanticSchemaMetadata: serviceContractMetadata("CompactJsonLdIriResult", "Compacted bounded JSON-LD IRI result."),
  })
) {}

/**
 * Merge JSON-LD contexts request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class MergeJsonLdContextsRequest extends S.Class<MergeJsonLdContextsRequest>($I`MergeJsonLdContextsRequest`)(
  {
    left: JsonLdContext,
    right: JsonLdContext,
  },
  $I.annote("MergeJsonLdContextsRequest", {
    description: "Merge JSON-LD contexts request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "MergeJsonLdContextsRequest",
      "Request to merge bounded JSON-LD contexts."
    ),
  })
) {}

/**
 * JSON-LD context service contract shape.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface JsonLdContextServiceShape {
  readonly compactIri: (request: CompactJsonLdIriRequest) => Effect.Effect<CompactJsonLdIriResult, JsonLdContextError>;
  readonly expandTerm: (request: ExpandJsonLdTermRequest) => Effect.Effect<ExpandJsonLdTermResult, JsonLdContextError>;
  readonly merge: (request: MergeJsonLdContextsRequest) => Effect.Effect<JsonLdContext, JsonLdContextError>;
  readonly normalize: (request: NormalizeJsonLdContextRequest) => Effect.Effect<JsonLdContext, JsonLdContextError>;
}

/**
 * JSON-LD context service tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class JsonLdContextService extends ServiceMap.Service<JsonLdContextService, JsonLdContextServiceShape>()(
  $I`JsonLdContextService`
) {}
