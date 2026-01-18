/**
 * Knowledge entity IDs
 *
 * Defines branded entity identifiers for the knowledge slice.
 *
 * @module knowledge/entity-ids/ids
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";
const make = EntityId.builder("knowledge");
const $I = $SharedDomainId.create("entity-ids/knowledge/ids");

/**
 * Embedding entity ID.
 *
 * Identifier for embedding vectors supporting hybrid search.
 *
 * @since 0.1.0
 * @category ids
 */
export const EmbeddingId = make("embedding", {
  brand: "EmbeddingId",
}).annotations(
  $I.annotations("EmbeddingId", {
    description: "A unique identifier for a Embedding entity",
  })
);

export declare namespace EmbeddingId {
  export type Type = S.Schema.Type<typeof EmbeddingId>;
  export type Encoded = S.Schema.Encoded<typeof EmbeddingId>;
  
  export namespace RowId {
    export type Type = typeof EmbeddingId.privateSchema.Type;
    export type Encoded = typeof EmbeddingId.privateSchema.Encoded;
  }
}
