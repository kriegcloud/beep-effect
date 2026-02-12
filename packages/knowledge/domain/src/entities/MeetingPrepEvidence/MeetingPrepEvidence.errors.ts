import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepEvidence/MeetingPrepEvidence.errors");

export class MeetingPrepEvidenceNotFoundError extends S.TaggedError<MeetingPrepEvidenceNotFoundError>()(
  $I`MeetingPrepEvidenceNotFoundError`,
  {
    id: KnowledgeEntityIds.MeetingPrepEvidenceId,
  },
  $I.annotationsHttp("MeetingPrepEvidenceNotFoundError", {
    status: 404,
    description: "Error when a meeting prep evidence with the specified ID cannot be found.",
  })
) {}

export class MeetingPrepEvidencePermissionDeniedError extends S.TaggedError<MeetingPrepEvidencePermissionDeniedError>()(
  $I`MeetingPrepEvidencePermissionDeniedError`,
  {
    id: KnowledgeEntityIds.MeetingPrepEvidenceId,
  },
  $I.annotationsHttp("MeetingPrepEvidencePermissionDeniedError", {
    status: 403,
    description:
      "Thrown when the user lacks permission to perform the requested action on the meeting prep evidence.",
  })
) {}

export const Errors = S.Union(MeetingPrepEvidenceNotFoundError, MeetingPrepEvidencePermissionDeniedError);
export type Errors = typeof Errors.Type;
