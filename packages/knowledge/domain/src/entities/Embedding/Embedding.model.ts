/**
 * Embedding entity model for Knowledge slice
 *
 * This is a starter entity to demonstrate the pattern.
 * Rename or replace with your actual domain entities.
 *
 * @module knowledge-domain/entities/Embedding
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Embedding");

/**
 * Embedding model for the knowledge slice.
 *
 * Replace this with your actual domain entity model.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 *
 * const embedding = Entities.Embedding.Model.insert.make({
 *   id: KnowledgeEntityIds.EmbeddingId.make("knowledge_embedding__uuid"),
 *   model: ""nomic-embed-text-v1.5"",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`EmbeddingModel`)(
  makeFields(KnowledgeEntityIds.EmbeddingId, {
    model: BS.toOptionalWithDefault(S.String)("nomic-embed-text-v1.5"),
  }),
  $I.annotations("EmbeddingModel", {
    description: "Embedding model for the knowledge domain context.",
  })
) {
  static readonly utils = modelKit(Model);
}
