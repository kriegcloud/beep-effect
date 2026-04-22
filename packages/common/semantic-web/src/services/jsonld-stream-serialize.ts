/**
 * JSON-LD streaming serialize service contract.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { Context, type Effect } from "effect";
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
 * @example
 * ```ts
 * import { JsonLdStreamSerializeRequest } from "@beep/semantic-web/services/jsonld-stream-serialize"
 *
 * void JsonLdStreamSerializeRequest
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { JsonLdStreamSerializeResult } from "@beep/semantic-web/services/jsonld-stream-serialize"
 *
 * void JsonLdStreamSerializeResult
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { JsonLdStreamSerializeErrorReason } from "@beep/semantic-web/services/jsonld-stream-serialize"
 *
 * void JsonLdStreamSerializeErrorReason
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const JsonLdStreamSerializeErrorReason = LiteralKit(["serializeFailure", "invalidChunkSize"] as const).annotate(
  $I.annote("JsonLdStreamSerializeErrorReason", {
    description: "Streaming serialize error reason.",
  })
);

/**
 * Typed streaming serialize error.
 *
 * @example
 * ```ts
 * import { JsonLdStreamSerializeError } from "@beep/semantic-web/services/jsonld-stream-serialize"
 *
 * void JsonLdStreamSerializeError
 * ```
 *
 * @since 0.0.0
 * @category error handling
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
 * @example
 * ```ts
 * import type { JsonLdStreamSerializeServiceShape } from "@beep/semantic-web/services/jsonld-stream-serialize"
 *
 * const acceptJsonLdStreamSerializeServiceShape = (value: JsonLdStreamSerializeServiceShape) => value
 * void acceptJsonLdStreamSerializeServiceShape
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface JsonLdStreamSerializeServiceShape {
  readonly serialize: (
    request: JsonLdStreamSerializeRequest
  ) => Effect.Effect<JsonLdStreamSerializeResult, JsonLdStreamSerializeError>;
}

/**
 * JSON-LD streaming serialize service tag.
 *
 * @example
 * ```ts
 * import { JsonLdStreamSerializeService } from "@beep/semantic-web/services/jsonld-stream-serialize"
 *
 * void JsonLdStreamSerializeService
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class JsonLdStreamSerializeService extends Context.Service<
  JsonLdStreamSerializeService,
  JsonLdStreamSerializeServiceShape
>()($I`JsonLdStreamSerializeService`) {}
