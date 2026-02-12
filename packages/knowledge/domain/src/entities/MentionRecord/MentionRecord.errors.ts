import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MentionRecord/MentionRecord.errors");

export class MentionRecordNotFoundError extends S.TaggedError<MentionRecordNotFoundError>()(
  $I`MentionRecordNotFoundError`,
  {
    id: KnowledgeEntityIds.MentionRecordId,
  },
  $I.annotationsHttp("MentionRecordNotFoundError", {
    status: 404,
    description: "Error when a mention record with the specified ID cannot be found.",
  })
) {}

export class MentionRecordPermissionDeniedError extends S.TaggedError<MentionRecordPermissionDeniedError>()(
  $I`MentionRecordPermissionDeniedError`,
  {
    id: KnowledgeEntityIds.MentionRecordId,
  },
  $I.annotationsHttp("MentionRecordPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the mention record.",
  })
) {}

export const Errors = S.Union(MentionRecordNotFoundError, MentionRecordPermissionDeniedError);
export type Errors = typeof Errors.Type;
