/**
 * Embeddings request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Embeddings");

/**
 * Request payload for generic text embedding generation.
 *
 * @since 0.1.0
 * @category models
 */
export class EmbeddingsRequest extends S.Class<EmbeddingsRequest>($I`EmbeddingsRequest`)({
  text: S.Array(S.String).annotateKey({
    description: "Input text fragments to embed into vector space.",
  }),
  model: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional embedding model override.",
  }),
}, $I.annote("EmbeddingsRequest", {
  description: "Request payload for generic text embedding generation.",
})) {}

/**
 * Response payload for generic text embedding generation.
 *
 * @since 0.1.0
 * @category models
 */
export class EmbeddingsResponse extends S.Class<EmbeddingsResponse>($I`EmbeddingsResponse`)({
  vectors: S.Array(S.Array(S.Number)).annotateKey({
    description: "Embedding vectors returned for each input text fragment.",
  }),
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded error payload when embedding generation fails.",
  }),
}, $I.annote("EmbeddingsResponse", {
  description: "Response payload for generic text embedding generation.",
})) {}
