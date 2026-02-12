import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MergeHistory/MergeHistory.errors");

export class MergeHistoryNotFoundError extends S.TaggedError<MergeHistoryNotFoundError>()(
  $I`MergeHistoryNotFoundError`,
  {
    id: KnowledgeEntityIds.MergeHistoryId,
  },
  $I.annotationsHttp("MergeHistoryNotFoundError", {
    status: 404,
    description: "Error when a merge history record with the specified ID cannot be found.",
  })
) {}

export class MergeHistoryPermissionDeniedError extends S.TaggedError<MergeHistoryPermissionDeniedError>()(
  $I`MergeHistoryPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.MergeHistoryId,
  },
  $I.annotationsHttp("MergeHistoryPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the merge history record.",
  })
) {}

export const Errors = S.Union(MergeHistoryNotFoundError, MergeHistoryPermissionDeniedError);
export type Errors = typeof Errors.Type;
