/**
 * Entity resolution errors for Knowledge slice
 *
 * Typed errors for entity resolution operations including canonical selection
 * and clustering.
 *
 * @module knowledge-domain/errors/entity-resolution
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/entity-resolution");

/**
 * Canonical entity selection error
 *
 * Thrown when canonical entity selection fails for a cluster.
 *
 * @since 0.1.0
 * @category errors
 */
export class CanonicalSelectionError extends S.TaggedError<CanonicalSelectionError>($I`CanonicalSelectionError`)(
  "CanonicalSelectionError",
  {
    message: S.String,
    reason: S.Literal("empty_cluster", "selection_failed"),
    clusterSize: S.optional(S.Number),
  },
  $I.annotations("CanonicalSelectionError", {
    description: "Failed to select canonical entity from cluster",
  })
) {}
