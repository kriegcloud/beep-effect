/**
 * EntityCandidate value object for Knowledge slice
 *
 * Represents an entity candidate with similarity score for resolution.
 *
 * @module knowledge-domain/value-objects/entity-candidate
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Model as Entity } from "../entities/entity/entity.model";

const $I = $KnowledgeDomainId.create("value-objects/EntityCandidate");

/**
 * EntityCandidate - Entity with similarity score for resolution
 *
 * Used during entity resolution to rank potential matches
 * for incoming MentionRecords.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class EntityCandidate extends S.Class<EntityCandidate>($I`EntityCandidate`)(
  {
    entity: Entity,
    similarityScore: S.Number.pipe(S.between(0, 1)).annotations({
      description: "Similarity score between mention and entity (0-1)",
    }),
  },
  $I.annotations("EntityCandidate", {
    description: "Entity candidate with similarity score for resolution",
  })
) {}
