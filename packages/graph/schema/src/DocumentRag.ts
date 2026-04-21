/**
 * Document RAG request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("DocumentRag");

/**
 * Request payload for document retrieval-augmented generation.
 *
 * @since 0.1.0
 * @category models
 */
export class DocumentRagRequest extends S.Class<DocumentRagRequest>($I`DocumentRagRequest`)({
  query: S.String.annotateKey({
    description: "Natural-language query to answer using retrieved document chunks.",
  }),
  collection: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional collection identifier used to scope retrieval.",
  }),
  streaming: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Whether the caller wants a streamed answer payload.",
  }),
}, $I.annote("DocumentRagRequest", {
  description: "Request payload for document retrieval-augmented generation.",
})) {}

/**
 * Response payload for document retrieval-augmented generation.
 *
 * @since 0.1.0
 * @category models
 */
export class DocumentRagResponse extends S.Class<DocumentRagResponse>($I`DocumentRagResponse`)({
  response: S.String.annotateKey({
    description: "Synthesized answer returned by the document RAG pipeline.",
  }),
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when generation fails.",
  }),
  endOfStream: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Streaming sentinel indicating the final response chunk.",
  }),
}, $I.annote("DocumentRagResponse", {
  description: "Response payload for document retrieval-augmented generation.",
})) {}
