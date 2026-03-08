/**
 * JSON-LD streaming serialize service contract.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { type Effect, ServiceMap } from "effect";
import * as S from "effect/Schema";
import { JsonLdContext } from "../jsonld.ts";
import { Dataset } from "../rdf.ts";
import { makeSemanticSchemaMetadata } from "../semantic-schema-metadata.ts";
import { JsonLdStreamMode } from "./jsonld-stream-parse.ts";

const $I = $SemanticWebId.create("services/jsonld-stream-serialize");

const serviceContractMetadata = (canonicalName: string, overview: string) =>
  makeSemanticSchemaMetadata({
    kind: "serviceContract",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "JSON-LD 1.1", section: "Streaming Serialize", disposition: "informative" }],
    equivalenceBasis: "Request and result wrappers compare by exact payload equality.",
    representations: [{ kind: "RDF/JS" }, { kind: "JSON-LD" }],
    canonicalizationRequired: false,
    implementationNotes: [
      "The initial adapter may report buffered-fallback mode instead of true streaming.",
      "Whole-document behaviors such as RDF list recovery or global deduplication remain out of scope for this seam.",
    ],
  });

/**
 * Streaming serialize request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdStreamSerializeRequest extends S.Class<JsonLdStreamSerializeRequest>(
  $I`JsonLdStreamSerializeRequest`
)(
  {
    dataset: Dataset,
    context: S.OptionFromOptionalKey(JsonLdContext),
    maxChunkCharacters: S.OptionFromOptionalKey(NonNegativeInt),
  },
  $I.annote("JsonLdStreamSerializeRequest", {
    description: "Streaming serialize request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdStreamSerializeRequest",
      "Request to serialize a bounded RDF dataset into JSON-LD text chunks."
    ),
  })
) {}

/**
 * Streaming serialize result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdStreamSerializeResult extends S.Class<JsonLdStreamSerializeResult>($I`JsonLdStreamSerializeResult`)(
  {
    chunks: S.NonEmptyArray(S.String),
    mode: JsonLdStreamMode,
    chunkCount: NonNegativeInt,
  },
  $I.annote("JsonLdStreamSerializeResult", {
    description: "Streaming serialize result.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdStreamSerializeResult",
      "Bounded streaming serialize result containing JSON-LD text chunks and adapter mode."
    ),
  })
) {}

/**
 * Streaming serialize error reason.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsonLdStreamSerializeErrorReason = LiteralKit(["serializeFailure", "invalidChunkSize"] as const).annotate(
  $I.annote("JsonLdStreamSerializeErrorReason", {
    description: "Streaming serialize error reason.",
  })
);

/**
 * Typed streaming serialize error.
 *
 * @since 0.0.0
 * @category Errors
 */
export class JsonLdStreamSerializeError extends TaggedErrorClass<JsonLdStreamSerializeError>(
  $I`JsonLdStreamSerializeError`
)(
  "JsonLdStreamSerializeError",
  {
    reason: JsonLdStreamSerializeErrorReason,
    message: S.String,
  },
  $I.annote("JsonLdStreamSerializeError", {
    description: "Typed streaming serialize error.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdStreamSerializeError",
      "Typed streaming serialize error for bounded JSON-LD stream serialization."
    ),
  })
) {}

/**
 * JSON-LD streaming serialize service contract shape.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface JsonLdStreamSerializeServiceShape {
  readonly serialize: (
    request: JsonLdStreamSerializeRequest
  ) => Effect.Effect<JsonLdStreamSerializeResult, JsonLdStreamSerializeError>;
}

/**
 * JSON-LD streaming serialize service tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class JsonLdStreamSerializeService extends ServiceMap.Service<
  JsonLdStreamSerializeService,
  JsonLdStreamSerializeServiceShape
>()($I`JsonLdStreamSerializeService`) {}
