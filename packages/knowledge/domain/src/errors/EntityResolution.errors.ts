import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/entity-resolution");

export class CanonicalSelectionFailureReason extends BS.StringLiteralKit(
  "empty_cluster",
  "selection_failed"
).annotations(
  $I.annotations("CanonicalSelectionFailureReason", {
    description: "Reason for canonical selection failure during entity resolution.",
  })
) {}

export class CanonicalSelectionError extends S.TaggedError<CanonicalSelectionError>($I`CanonicalSelectionError`)(
  "CanonicalSelectionError",
  {
    message: S.String,
    reason: CanonicalSelectionFailureReason,
    clusterSize: S.optional(S.Number),
  },
  $I.annotations("CanonicalSelectionError", {
    description: "Failed to select canonical entity from cluster",
  })
) {}
