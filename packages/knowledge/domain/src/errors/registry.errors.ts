/**
 * Registry errors for Knowledge slice
 *
 * Typed errors for EntityRegistry operations.
 *
 * @module knowledge-domain/errors/registry
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/registry");

/**
 * RegistryError - EntityRegistry operation failed
 *
 * @since 0.1.0
 * @category errors
 */
export class RegistryError extends S.TaggedError<RegistryError>($I`RegistryError`)(
  "RegistryError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("RegistryError", {
    description: "EntityRegistry operation failed",
  })
) {}

/**
 * SimilarityError - Embedding similarity computation failed
 *
 * @since 0.1.0
 * @category errors
 */
export class SimilarityError extends S.TaggedError<SimilarityError>($I`SimilarityError`)(
  "SimilarityError",
  {
    message: S.String,
    mentionId: S.String,
    candidateCount: S.Number,
  },
  $I.annotations("SimilarityError", {
    description: "Embedding similarity computation failed",
  })
) {}
