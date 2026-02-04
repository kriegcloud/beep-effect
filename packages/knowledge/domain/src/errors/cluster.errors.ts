/**
 * Cluster errors for Knowledge slice
 *
 * Typed errors for incremental clustering operations.
 *
 * @module knowledge-domain/errors/cluster
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/cluster");

/**
 * ClusterError - Incremental clustering operation failed
 *
 * @since 0.1.0
 * @category errors
 */
export class ClusterError extends S.TaggedError<ClusterError>($I`ClusterError`)(
  "ClusterError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("ClusterError", {
    description: "Incremental clustering operation failed",
  })
) {}
