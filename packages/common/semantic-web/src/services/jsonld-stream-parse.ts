/**
 * JSON-LD streaming parse service contract.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { Context, type Effect } from "effect";
import * as S from "effect/Schema";
import { Dataset } from "../rdf.ts";
import { makeSemanticSchemaMetadata } from "../semantic-schema-metadata.ts";
import { JsonLdDocumentLoaderPolicy } from "./jsonld-document.ts";

const $I = $SemanticWebId.create("services/jsonld-stream-parse");

const serviceContractMetadata = (canonicalName: string, overview: string) =>
  makeSemanticSchemaMetadata({
    kind: "serviceContract",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "JSON-LD 1.1", section: "Streaming Parse", disposition: "informative" }],
    equivalenceBasis: "Request and result wrappers compare by exact payload equality.",
    representations: [{ kind: "JSON-LD" }, { kind: "RDF/JS" }],
    canonicalizationRequired: false,
    implementationNotes: [
      "The initial adapter may report buffered-fallback mode instead of true streaming.",
      "Remote context loading remains policy-controlled and may be rejected by bounded adapters.",
    ],
  });

/**
 * Streaming adapter mode.
 *
 * @example
 * ```ts
 * import { JsonLdStreamMode } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * void JsonLdStreamMode
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const JsonLdStreamMode = LiteralKit(["true-streaming", "buffered-fallback"] as const).annotate(
  $I.annote("JsonLdStreamMode", {
    description: "Streaming adapter mode.",
  })
);

/**
 * Type for {@link JsonLdStreamMode}.
 *
 * @example
 * ```ts
 * import type { JsonLdStreamMode } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * const acceptJsonLdStreamMode = (value: JsonLdStreamMode) => value
 * void acceptJsonLdStreamMode
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type JsonLdStreamMode = typeof JsonLdStreamMode.Type;

/**
 * JSON-LD UTF-8 text chunk stream.
 *
 * @example
 * ```ts
 * import { JsonLdTextChunkStream } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * void JsonLdTextChunkStream
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class JsonLdTextChunkStream extends S.Class<JsonLdTextChunkStream>($I`JsonLdTextChunkStream`)(
  {
    kind: S.Literal("text"),
    encoding: S.Literal("utf-8"),
    chunks: S.NonEmptyArray(S.String),
  },
  $I.annote("JsonLdTextChunkStream", {
    description: "JSON-LD UTF-8 text chunk stream.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdTextChunkStream",
      "Bounded UTF-8 text chunks used as a JSON-LD streaming parse input."
    ),
  })
) {}

/**
 * JSON-LD UTF-8 byte chunk stream.
 *
 * @example
 * ```ts
 * import { JsonLdByteChunkStream } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * void JsonLdByteChunkStream
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class JsonLdByteChunkStream extends S.Class<JsonLdByteChunkStream>($I`JsonLdByteChunkStream`)(
  {
    kind: S.Literal("bytes"),
    encoding: S.Literal("utf-8"),
    chunks: S.NonEmptyArray(S.Uint8Array),
  },
  $I.annote("JsonLdByteChunkStream", {
    description: "JSON-LD UTF-8 byte chunk stream.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdByteChunkStream",
      "Bounded UTF-8 byte chunks used as a JSON-LD streaming parse input."
    ),
  })
) {}

/**
 * Streaming parse input union.
 *
 * @example
 * ```ts
 * import { JsonLdStreamParseInput } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * void JsonLdStreamParseInput
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const JsonLdStreamParseInput = S.Union([JsonLdTextChunkStream, JsonLdByteChunkStream]).annotate(
  $I.annote("JsonLdStreamParseInput", {
    description: "Streaming parse input union.",
  })
);

/**
 * Type for {@link JsonLdStreamParseInput}.
 *
 * @example
 * ```ts
 * import type { JsonLdStreamParseInput } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * const acceptJsonLdStreamParseInput = (value: JsonLdStreamParseInput) => value
 * void acceptJsonLdStreamParseInput
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type JsonLdStreamParseInput = typeof JsonLdStreamParseInput.Type;

/**
 * Streaming parse request.
 *
 * @example
 * ```ts
 * import { JsonLdStreamParseRequest } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * void JsonLdStreamParseRequest
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class JsonLdStreamParseRequest extends S.Class<JsonLdStreamParseRequest>($I`JsonLdStreamParseRequest`)(
  {
    input: JsonLdStreamParseInput,
    loaderPolicy: S.OptionFromOptionalKey(JsonLdDocumentLoaderPolicy),
  },
  $I.annote("JsonLdStreamParseRequest", {
    description: "Streaming parse request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdStreamParseRequest",
      "Request to parse a bounded JSON-LD text or byte stream into RDF data."
    ),
  })
) {}

/**
 * Streaming parse result.
 *
 * @example
 * ```ts
 * import { JsonLdStreamParseResult } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * void JsonLdStreamParseResult
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class JsonLdStreamParseResult extends S.Class<JsonLdStreamParseResult>($I`JsonLdStreamParseResult`)(
  {
    dataset: Dataset,
    mode: JsonLdStreamMode,
    chunkCount: NonNegativeInt,
  },
  $I.annote("JsonLdStreamParseResult", {
    description: "Streaming parse result.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdStreamParseResult",
      "Bounded streaming parse result containing RDF data and adapter mode."
    ),
  })
) {}

/**
 * Streaming parse error reason.
 *
 * @example
 * ```ts
 * import { JsonLdStreamParseErrorReason } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * void JsonLdStreamParseErrorReason
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const JsonLdStreamParseErrorReason = LiteralKit([
  "parseFailure",
  "loaderPolicyViolation",
  "unsupportedEncoding",
] as const).annotate(
  $I.annote("JsonLdStreamParseErrorReason", {
    description: "Streaming parse error reason.",
  })
);

/**
 * Typed streaming parse error.
 *
 * @example
 * ```ts
 * import { JsonLdStreamParseError } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * void JsonLdStreamParseError
 * ```
 *
 * @since 0.0.0
 * @category error handling
 */
export class JsonLdStreamParseError extends TaggedErrorClass<JsonLdStreamParseError>($I`JsonLdStreamParseError`)(
  "JsonLdStreamParseError",
  {
    reason: JsonLdStreamParseErrorReason,
    message: S.String,
  },
  $I.annote("JsonLdStreamParseError", {
    description: "Typed streaming parse error.",
    semanticSchemaMetadata: serviceContractMetadata(
      "JsonLdStreamParseError",
      "Typed streaming parse error for bounded JSON-LD stream parsing."
    ),
  })
) {}

/**
 * JSON-LD streaming parse service contract shape.
 *
 * @example
 * ```ts
 * import type { JsonLdStreamParseServiceShape } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * const acceptJsonLdStreamParseServiceShape = (value: JsonLdStreamParseServiceShape) => value
 * void acceptJsonLdStreamParseServiceShape
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export interface JsonLdStreamParseServiceShape {
  readonly parse: (request: JsonLdStreamParseRequest) => Effect.Effect<JsonLdStreamParseResult, JsonLdStreamParseError>;
}

/**
 * JSON-LD streaming parse service tag.
 *
 * @example
 * ```ts
 * import { JsonLdStreamParseService } from "@beep/semantic-web/services/jsonld-stream-parse"
 *
 * void JsonLdStreamParseService
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class JsonLdStreamParseService extends Context.Service<
  JsonLdStreamParseService,
  JsonLdStreamParseServiceShape
>()($I`JsonLdStreamParseService`) {}
