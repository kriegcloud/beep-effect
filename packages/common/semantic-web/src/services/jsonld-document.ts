/**
 * JSON-LD document service contract.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { Context, type Effect } from "effect";
import * as S from "effect/Schema";
import { AbsoluteIRI } from "../iri.ts";
import { JsonLdContext, JsonLdDocument, JsonLdFrame } from "../jsonld.ts";
import { Dataset } from "../rdf.ts";
import { makeSemanticSchemaMetadata } from "../semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("services/jsonld-document");

const serviceContractMetadata = (canonicalName: string, overview: string) =>
  makeSemanticSchemaMetadata({
    kind: "serviceContract",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "JSON-LD 1.1", section: "Algorithms", disposition: "normative" }],
    equivalenceBasis: "Request and result wrappers compare by exact payload equality.",
    representations: [{ kind: "JSON-LD" }, { kind: "RDF/JS" }],
    canonicalizationRequired: true,
  });

/**
 * JSON-LD document error reason.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsonLdDocumentErrorReason = LiteralKit([
  "invalidNodeReference",
  "unknownPredicate",
  "bridgingFailure",
  "framingFailure",
  "loaderPolicyViolation",
  "normalizationFailure",
] as const).annotate(
  $I.annote("JsonLdDocumentErrorReason", {
    description: "JSON-LD document error reason.",
  })
);

/**
 * Typed JSON-LD document service error.
 *
 * @since 0.0.0
 * @category Errors
 */
export class JsonLdDocumentError extends TaggedErrorClass<JsonLdDocumentError>($I`JsonLdDocumentError`)(
  "JsonLdDocumentError",
  {
    reason: JsonLdDocumentErrorReason,
    message: S.String,
    subject: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("JsonLdDocumentError", {
    description: "Typed JSON-LD document service error.",
    semanticSchemaMetadata: serviceContractMetadata("JsonLdDocumentError", "Typed JSON-LD document service error."),
  })
) {}

/**
 * Compact JSON-LD document request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CompactJsonLdDocumentRequest extends S.Class<CompactJsonLdDocumentRequest>(
  $I`CompactJsonLdDocumentRequest`
)(
  {
    document: JsonLdDocument,
    context: JsonLdContext,
  },
  $I.annote("CompactJsonLdDocumentRequest", {
    description: "Compact JSON-LD document request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "CompactJsonLdDocumentRequest",
      "Request to compact a bounded JSON-LD document."
    ),
  })
) {}

/**
 * Flatten JSON-LD document request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FlattenJsonLdDocumentRequest extends S.Class<FlattenJsonLdDocumentRequest>(
  $I`FlattenJsonLdDocumentRequest`
)(
  {
    document: JsonLdDocument,
  },
  $I.annote("FlattenJsonLdDocumentRequest", {
    description: "Flatten JSON-LD document request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "FlattenJsonLdDocumentRequest",
      "Request to flatten a bounded JSON-LD document."
    ),
  })
) {}

/**
 * Frame JSON-LD document request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FrameJsonLdDocumentRequest extends S.Class<FrameJsonLdDocumentRequest>($I`FrameJsonLdDocumentRequest`)(
  {
    document: JsonLdDocument,
    frame: JsonLdFrame,
  },
  $I.annote("FrameJsonLdDocumentRequest", {
    description: "Frame JSON-LD document request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "FrameJsonLdDocumentRequest",
      "Request to frame a bounded JSON-LD document."
    ),
  })
) {}

/**
 * Bounded JSON-LD document loader policy.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdDocumentLoaderPolicy extends S.Class<JsonLdDocumentLoaderPolicy>($I`JsonLdDocumentLoaderPolicy`)(
  {
    allowRemoteDocuments: S.Boolean,
    maxRemoteDocuments: S.OptionFromOptionalKey(NonNegativeInt),
    baseIri: S.OptionFromOptionalKey(AbsoluteIRI),
  },
  $I.annote("JsonLdDocumentLoaderPolicy", {
    description: "Bounded JSON-LD document loader policy.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdDocumentLoaderPolicy",
      "Bounded loader policy for JSON-LD document workflows."
    ),
  })
) {}

/**
 * JSON-LD document normalization profile.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsonLdDocumentNormalizationProfile = LiteralKit(["bounded-v1", "expanded-v1"] as const).annotate(
  $I.annote("JsonLdDocumentNormalizationProfile", {
    description: "JSON-LD document normalization profile.",
  })
);

/**
 * Type for {@link JsonLdDocumentNormalizationProfile}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JsonLdDocumentNormalizationProfile = typeof JsonLdDocumentNormalizationProfile.Type;

/**
 * Expand JSON-LD document request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ExpandJsonLdDocumentRequest extends S.Class<ExpandJsonLdDocumentRequest>($I`ExpandJsonLdDocumentRequest`)(
  {
    document: JsonLdDocument,
    loaderPolicy: S.OptionFromOptionalKey(JsonLdDocumentLoaderPolicy),
  },
  $I.annote("ExpandJsonLdDocumentRequest", {
    description: "Expand JSON-LD document request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "ExpandJsonLdDocumentRequest",
      "Request to expand a bounded JSON-LD document with explicit loader policy."
    ),
  })
) {}

/**
 * Normalize JSON-LD document request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class NormalizeJsonLdDocumentRequest extends S.Class<NormalizeJsonLdDocumentRequest>(
  $I`NormalizeJsonLdDocumentRequest`
)(
  {
    document: JsonLdDocument,
    profile: JsonLdDocumentNormalizationProfile,
    loaderPolicy: S.OptionFromOptionalKey(JsonLdDocumentLoaderPolicy),
    safeMode: S.OptionFromOptionalKey(S.Boolean),
  },
  $I.annote("NormalizeJsonLdDocumentRequest", {
    description: "Normalize JSON-LD document request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "NormalizeJsonLdDocumentRequest",
      "Request to normalize a bounded JSON-LD document under an explicit output profile."
    ),
  })
) {}

/**
 * JSON-LD to RDF request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdToRdfRequest extends S.Class<JsonLdToRdfRequest>($I`JsonLdToRdfRequest`)(
  {
    document: JsonLdDocument,
  },
  $I.annote("JsonLdToRdfRequest", {
    description: "JSON-LD to RDF request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdToRdfRequest",
      "Request to bridge a bounded JSON-LD document to RDF."
    ),
  })
) {}

/**
 * RDF to JSON-LD request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdFromRdfRequest extends S.Class<JsonLdFromRdfRequest>($I`JsonLdFromRdfRequest`)(
  {
    dataset: Dataset,
    context: S.OptionFromOptionalKey(JsonLdContext),
  },
  $I.annote("JsonLdFromRdfRequest", {
    description: "RDF to JSON-LD request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdFromRdfRequest",
      "Request to bridge RDF quads into a bounded JSON-LD document."
    ),
  })
) {}

/**
 * JSON-LD document result wrapper.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdDocumentResult extends S.Class<JsonLdDocumentResult>($I`JsonLdDocumentResult`)(
  {
    document: JsonLdDocument,
  },
  $I.annote("JsonLdDocumentResult", {
    description: "JSON-LD document result wrapper.",
    semanticSchemaMetadata: serviceContractMetadata("JsonLdDocumentResult", "JSON-LD document result wrapper."),
  })
) {}

/**
 * JSON-LD to RDF result wrapper.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdToRdfResult extends S.Class<JsonLdToRdfResult>($I`JsonLdToRdfResult`)(
  {
    dataset: Dataset,
  },
  $I.annote("JsonLdToRdfResult", {
    description: "JSON-LD to RDF result wrapper.",
    semanticSchemaMetadata: serviceContractMetadata("JsonLdToRdfResult", "JSON-LD to RDF result wrapper."),
  })
) {}

/**
 * JSON-LD document service contract shape.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface JsonLdDocumentServiceShape {
  readonly compact: (request: CompactJsonLdDocumentRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly expand: (request: ExpandJsonLdDocumentRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly flatten: (request: FlattenJsonLdDocumentRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly frame: (request: FrameJsonLdDocumentRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly fromRdf: (request: JsonLdFromRdfRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly normalize: (
    request: NormalizeJsonLdDocumentRequest
  ) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly toRdf: (request: JsonLdToRdfRequest) => Effect.Effect<JsonLdToRdfResult, JsonLdDocumentError>;
}

/**
 * JSON-LD document service tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class JsonLdDocumentService extends Context.Service<JsonLdDocumentService, JsonLdDocumentServiceShape>()(
  $I`JsonLdDocumentService`
) {}
