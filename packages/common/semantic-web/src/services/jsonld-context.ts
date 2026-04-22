/**
 * JSON-LD context service contract.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { Context, type Effect } from "effect";
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
 * @example
 * ```ts
 * import { JsonLdContextErrorReason } from "@beep/semantic-web/services/jsonld-context"
 *
 * void JsonLdContextErrorReason
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { JsonLdContextError } from "@beep/semantic-web/services/jsonld-context"
 *
 * void JsonLdContextError
 * ```
 *
 * @since 0.0.0
 * @category error handling
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
 * @example
 * ```ts
 * import { NormalizeJsonLdContextRequest } from "@beep/semantic-web/services/jsonld-context"
 *
 * void NormalizeJsonLdContextRequest
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { ExpandJsonLdTermRequest } from "@beep/semantic-web/services/jsonld-context"
 *
 * void ExpandJsonLdTermRequest
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { ExpandJsonLdTermResult } from "@beep/semantic-web/services/jsonld-context"
 *
 * void ExpandJsonLdTermResult
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { CompactJsonLdIriRequest } from "@beep/semantic-web/services/jsonld-context"
 *
 * void CompactJsonLdIriRequest
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { CompactJsonLdIriResult } from "@beep/semantic-web/services/jsonld-context"
 *
 * void CompactJsonLdIriResult
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { MergeJsonLdContextsRequest } from "@beep/semantic-web/services/jsonld-context"
 *
 * void MergeJsonLdContextsRequest
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import type { JsonLdContextServiceShape } from "@beep/semantic-web/services/jsonld-context"
 *
 * const acceptJsonLdContextServiceShape = (value: JsonLdContextServiceShape) => value
 * void acceptJsonLdContextServiceShape
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { JsonLdContextService } from "@beep/semantic-web/services/jsonld-context"
 *
 * void JsonLdContextService
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class JsonLdContextService extends Context.Service<JsonLdContextService, JsonLdContextServiceShape>()(
  $I`JsonLdContextService`
) {}
