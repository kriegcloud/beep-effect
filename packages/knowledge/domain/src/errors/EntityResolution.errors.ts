import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/entity-resolution");

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
