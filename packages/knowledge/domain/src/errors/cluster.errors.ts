import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/cluster");

export class ClusterError extends S.TaggedError<ClusterError>($I`ClusterError`)(
  "ClusterError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("ClusterError", {
    description: "Incremental clustering operation failed",
  })
) {}
